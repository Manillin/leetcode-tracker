'use client'

import { useEffect, useState } from 'react'

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
    const [revealed, setRevealed] = useState(false)

    useEffect(() => {
        // Reset reveal state each time a new medication is shown or the modal is reopened
        setRevealed(false)
    }, [medication?.id, isOpen])

    if (!isOpen || !medication) return null

    const hasDescription = Boolean(medication.description && medication.description.trim().length > 0)

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl w-full max-w-lg overflow-hidden shadow-2xl">
                <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50">
                    <h3 className="text-xl font-bold text-gray-900">Farmaco pescato 🎉</h3>
                </div>

                <div className="p-6 space-y-4">
                    <div>
                        <h4 className="text-lg font-semibold text-gray-900">{medication.name}</h4>
                        <div className="mt-3">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Descrizione</label>
                            {hasDescription ? (
                                <div className="relative">
                                    <p
                                        className={`text-gray-700 whitespace-pre-wrap transition filter ${revealed ? 'blur-0' : 'blur-sm select-none'}`}
                                        aria-live="polite"
                                    >
                                        {medication.description}
                                    </p>
                                    {!revealed && (
                                        <button
                                            type="button"
                                            onClick={() => setRevealed(true)}
                                            className="mt-3 inline-flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                        >
                                            Mostra descrizione
                                        </button>
                                    )}
                                    {revealed && (
                                        <button
                                            type="button"
                                            onClick={() => setRevealed(false)}
                                            className="mt-3 inline-flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300"
                                        >
                                            Nascondi descrizione
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <p className="text-gray-500">Nessuna descrizione</p>
                            )}
                        </div>
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