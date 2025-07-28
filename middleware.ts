import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import type { Database } from '@/types/database'

export async function middleware(request: NextRequest) {
  // Ottimizzazione: salta il middleware per asset statici e API
  const { pathname } = request.nextUrl

  // Skip middleware per asset statici, immagini, font, etc.
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/_static') ||
    pathname.startsWith('/_vercel') ||
    pathname.includes('.') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next()
  }

  console.log('🔄 Middleware executing for:', pathname)

  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Ottimizzazione: chiama getUser() solo per pagine protette
  const protectedPaths = ['/profile']
  const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path))

  if (isProtectedPath) {
    console.log('🔐 Verificando auth per pagina protetta:', pathname)

    try {
      // Refresh session if expired - required for Server Components
      await supabase.auth.getUser()
      console.log('✅ Auth check completato')
    } catch (error) {
      console.error('❌ Errore auth check:', error)
    }
  } else {
    console.log('🚀 Pagina pubblica, skip auth check:', pathname)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all paths except for:
     * 1. /api (API routes)
     * 2. /_next (Next.js internals)
     * 3. /_static (inside /public)
     * 4. all root files inside /public (e.g. /favicon.ico)
     */
    '/((?!api/|_next/|_static/|_vercel|[\\w-]+\\.\\w+).*)',
  ],
}
