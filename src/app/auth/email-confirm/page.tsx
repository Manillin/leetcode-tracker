'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { createSupabaseClient } from '@/lib/supabase/client'
import Link from 'next/link'

function ConfirmPageContent() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
    const [error, setError] = useState<string>('')

    useEffect(() => {
        const confirmEmail = async () => {
            const token_hash = searchParams.get('token_hash')
            const type = searchParams.get('type')
            const errorParam = searchParams.get('error')

            console.log('🔍 Frontend confirm - Params:', { token_hash: !!token_hash, type, error: errorParam })

            // Se c'è un errore dalla route server, mostralo
            if (errorParam) {
                switch (errorParam) {
                    case 'invalid_token':
                        setError('Token di conferma mancante o non valido')
                        break
                    case 'server_error':
                        setError('Errore del server durante la verifica. Riproviamo dal frontend...')
                        // Non fare return, prova a verificare comunque
                        break
                    default:
                        setError('Errore sconosciuto durante la verifica')
                        setStatus('error')
                        return
                }

                if (errorParam !== 'server_error') {
                    setStatus('error')
                    return
                }
            }

            if (!token_hash || !type) {
                setError('Token di conferma mancante o non valido')
                setStatus('error')
                return
            }

            try {
                const supabase = createSupabaseClient()

                console.log('🔐 Verifying email token...')
                const { error: verifyError } = await supabase.auth.verifyOtp({
                    token_hash,
                    type: 'email',
                })

                if (verifyError) {
                    console.error('❌ Frontend verification error:', verifyError)
                    setError(verifyError.message || 'Errore durante la verifica')
                    setStatus('error')
                } else {
                    console.log('✅ Frontend verification successful!')
                    setStatus('success')

                    // Aspetta un momento e poi redirige alla pagina dedicata
                    setTimeout(() => {
                        router.push('/auth/email-verified')
                    }, 2000)
                }
            } catch (err) {
                console.error('💥 Frontend confirmation error:', err)
                setError('Errore imprevisto durante la conferma')
                setStatus('error')
            }
        }

        confirmEmail()
    }, [searchParams, router])

    if (status === 'loading') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
                <div className="max-w-md w-full">
                    <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
                        {/* Loading Spinner */}
                        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 mb-6">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>

                        <h1 className="text-2xl font-bold text-gray-900 mb-4">
                            Conferma in corso...
                        </h1>

                        <p className="text-gray-600">
                            Stiamo verificando il tuo account. Attendere prego...
                        </p>
                    </div>
                </div>
            </div>
        )
    }

    if (status === 'success') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
                <div className="max-w-md w-full">
                    <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
                        {/* Success Icon */}
                        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
                            <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>

                        <h1 className="text-2xl font-bold text-gray-900 mb-4">
                            Email Verificata!
                        </h1>

                        <p className="text-gray-600 mb-8">
                            Il tuo account è stato confermato con successo. Verrai reindirizzato tra pochi istanti...
                        </p>

                        <div className="space-y-3">
                            <Link
                                href="/auth/email-verified"
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 block"
                            >
                                Continua
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    // Error state
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
            <div className="max-w-md w-full">
                <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
                    {/* Error Icon */}
                    <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
                        <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </div>

                    <h1 className="text-2xl font-bold text-gray-900 mb-4">
                        Errore di Verifica
                    </h1>

                    <p className="text-gray-600 mb-4">
                        Si è verificato un problema durante la conferma del tuo account:
                    </p>

                    <p className="text-red-600 text-sm mb-8 bg-red-50 p-3 rounded-lg">
                        {error}
                    </p>

                    <div className="space-y-3">
                        <Link
                            href="/register"
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 block"
                        >
                            Registrati Nuovamente
                        </Link>

                        <Link
                            href="/"
                            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-6 rounded-lg transition-colors duration-200 block"
                        >
                            Torna alla Home
                        </Link>
                    </div>

                    <p className="text-sm text-gray-500 mt-6">
                        Se il problema persiste, contatta il supporto.
                    </p>
                </div>
            </div>
        </div>
    )
}

// Loading fallback per Suspense
function LoadingFallback() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
            <div className="max-w-md w-full">
                <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
                    <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 mb-6">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">
                        Caricamento...
                    </h1>
                    <p className="text-gray-600">
                        Preparazione della pagina di conferma...
                    </p>
                </div>
            </div>
        </div>
    )
}

// Componente principale con Suspense
export default function ConfirmPage() {
    return (
        <Suspense fallback={<LoadingFallback />}>
            <ConfirmPageContent />
        </Suspense>
    )
} 