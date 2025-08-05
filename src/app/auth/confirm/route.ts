import { createSupabaseClient } from '@/lib/supabase/client'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
    const { searchParams, origin } = new URL(request.url)
    const token_hash = searchParams.get('token_hash')
    const type = searchParams.get('type')
    const next = searchParams.get('next') ?? '/auth/email-verified'

    if (token_hash && type) {
        const supabase = createSupabaseClient()

        // Verifica il token email
        const { error } = await supabase.auth.verifyOtp({
            token_hash,
            type: 'email',
        })

        if (!error) {
            console.log('✅ Email verification successful')

            const forwardedHost = request.headers.get('x-forwarded-host')
            const isLocalEnv = process.env.NODE_ENV === 'development'
            const forceDomain = process.env.NEXT_PUBLIC_FORCE_DOMAIN // es: dozydev.com

            // 🎯 FORZATURA DOMINIO per test anche in localhost
            if (forceDomain) {
                console.log('🚀 Using forced domain:', forceDomain)
                return NextResponse.redirect(`https://${forceDomain}${next}`)
            }
            // Priorità al forwardedHost (dominio reale) se esiste
            else if (forwardedHost) {
                console.log('🌐 Using forwarded host:', forwardedHost)
                return NextResponse.redirect(`https://${forwardedHost}${next}`)
            } else if (isLocalEnv) {
                console.log('🏠 Using local origin:', origin)
                return NextResponse.redirect(`${origin}${next}`)
            } else {
                console.log('🔄 Using fallback origin:', origin)
                return NextResponse.redirect(`${origin}${next}`)
            }
        } else {
            console.error('❌ Email verification error:', error)
            // Fallback: usa la pagina frontend se il redirect fallisce
            return NextResponse.redirect(`${origin}/auth/email-confirm?token_hash=${token_hash}&type=${type}&error=server_error`)
        }
    }

    // Token mancante o non valido - usa la pagina frontend
    console.log('⚠️ Invalid or missing token, redirecting to frontend page')
    return NextResponse.redirect(`${origin}/auth/email-confirm?error=invalid_token`)
} 