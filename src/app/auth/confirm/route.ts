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
            const forwardedHost = request.headers.get('x-forwarded-host')
            const isLocalEnv = process.env.NODE_ENV === 'development'

            if (isLocalEnv) {
                return NextResponse.redirect(`${origin}${next}`)
            } else if (forwardedHost) {
                return NextResponse.redirect(`https://${forwardedHost}${next}`)
            } else {
                return NextResponse.redirect(`${origin}${next}`)
            }
        } else {
            console.error('Email verification error:', error)
            return NextResponse.redirect(`${origin}/auth/auth-code-error?error=verification_failed`)
        }
    }

    // Token mancante o non valido
    return NextResponse.redirect(`${origin}/auth/auth-code-error?error=invalid_token`)
} 