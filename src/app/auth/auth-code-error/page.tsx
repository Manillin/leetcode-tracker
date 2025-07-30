export default function AuthCodeError() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md w-full space-y-8">
                <div className="text-center">
                    <h2 className="mt-6 text-3xl font-bold text-gray-900">
                        Errore di Verifica
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Si è verificato un problema durante la conferma del tuo account.
                    </p>
                    <div className="mt-6">
                        <a
                            href="/"
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            Torna alla Home
                        </a>
                    </div>
                    <p className="mt-4 text-xs text-gray-500">
                        Se il problema persiste, contatta il supporto.
                    </p>
                </div>
            </div>
        </div>
    )
} 