import Link from 'next/link'

export default function EmailVerifiedPage() {
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

                    {/* Title */}
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">
                        Email Verificata!
                    </h1>

                    {/* Description */}
                    <p className="text-gray-600 mb-8">
                        Il tuo account è stato confermato con successo. Ora puoi accedere a tutte le funzionalità del LeetCode Tracker.
                    </p>

                    {/* Action Buttons */}
                    <div className="space-y-3">
                        <Link
                            href="/login"
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 block"
                        >
                            Accedi al Tuo Account
                        </Link>

                        <Link
                            href="/"
                            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-6 rounded-lg transition-colors duration-200 block"
                        >
                            Torna alla Home
                        </Link>
                    </div>

                    {/* Footer Note */}
                    <p className="text-sm text-gray-500 mt-6">
                        Benvenuto nel LeetCode Tracker! 🚀
                    </p>
                </div>
            </div>
        </div>
    )
} 