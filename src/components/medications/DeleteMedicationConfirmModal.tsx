'use client'

import { useState } from 'react'
import { createSupabaseClient } from '@/lib/supabase/client'

interface MedicationRow {
    id: number
    user_id: string
    name: string
    description: string | null
    created_at: string
}

interface DeleteMedicationConfirmModalProps {
    isOpen: boolean
    medication: MedicationRow | null
    onClose: () => void
    onSuccess: () => void
}

export default function DeleteMedicationConfirmModal({ isOpen, medication, onClose, onSuccess }: DeleteMedicationConfirmModalProps) {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const supabase = createSupabaseClient()

    const handleDelete = async () => {
        if (!medication) return

        setLoading(true)
        setError('')

        try {
            const { error: deleteError } = await supabase
                .from('medications')
                .delete()
                .eq('id', medication.id)

            if (deleteError) {
                setError('Errore nell\'eliminazione del farmaco: ' + deleteError.message)
                return
            }

            onSuccess()
            onClose()
        } catch (err) {
            setError('Errore imprevisto: ' + (err as Error).message)
        } finally {
            setLoading(false)
        }
    }

    const handleClose = () => {
        setError('')
        onClose()
    }

    if (!isOpen || !medication) return null

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full">
                <div className="p-6">
                    <div className="flex items-center mb-4">
                        <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                            <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                        </div>
                    </div>

                    <div className="text-center">
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Conferma Eliminazione</h3>
                        <p className="text-sm text-gray-500 mb-4">
                            Sei sicuro di voler eliminare il farmaco{' '}
                            <span className="font-medium text-gray-900">{medication.name}</span>?
                        </p>
                        <p className="text-sm text-gray-400 mb-6">Questa azione non può essere annullata.</p>

                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">{error}</div>
                        )}

                        <div className="flex justify-center space-x-3">
                            <button
                                type="button"
                                onClick={handleClose}
                                disabled={loading}
                                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Annulla
                            </button>
                            <button
                                type="button"
                                onClick={handleDelete}
                                disabled={loading}
                                className="px-4 py-2 bg-red-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Eliminazione...' : 'Elimina Farmaco'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
} 