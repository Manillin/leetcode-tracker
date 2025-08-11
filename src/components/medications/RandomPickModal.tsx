'use client'

interface Medication {
    id: number
    name: string
    description: string | null
}

interface RandomPickModalProps {
    isOpen: boolean
    medication: Medication | null
    onClose: () => void
    onPickAnother: () => void
}

export default function RandomPickModal({ isOpen, medication, onClose, onPickAnother }: RandomPickModalProps) {
    if (!isOpen || !medication) return null

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl w-full max-w-lg overflow-hidden shadow-2xl">
                <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50">
                    <h3 className="text-xl font-bold text-gray-900">Farmaco pescato 🎉</h3>
                </div>

                <div className="p-6 space-y-4">
                    <div>
                        <h4 className="text-lg font-semibold text-gray-900">{medication.name}</h4>
                        <p className="mt-2 text-gray-700 whitespace-pre-wrap">{medication.description || 'Nessuna descrizione'}</p>
                    </div>
                </div>

                <div className="flex justify-end gap-3 p-6 border-t border-gray-100">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                    >
                        Chiudi
                    </button>
                    <button
                        type="button"
                        onClick={onPickAnother}
                        className="px-6 py-3 bg-green-600 border border-transparent rounded-lg text-sm font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                    >
                        Pesca un altro
                    </button>
                </div>
            </div>
        </div>
    )
} 