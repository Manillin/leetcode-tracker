'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { createSupabaseClient } from '@/lib/supabase/client'
import DeleteMedicationConfirmModal from './DeleteMedicationConfirmModal'

interface MedicationRow {
    id: number
    user_id: string
    name: string
    description: string | null
    created_at: string
}

interface MedicationDetailModalProps {
    isOpen: boolean
    medication: MedicationRow | null
    onClose: () => void
    onSuccess: () => void
}

export default function MedicationDetailModal({ isOpen, medication, onClose, onSuccess }: MedicationDetailModalProps) {
    const { user } = useAuth()
    const supabase = createSupabaseClient()

    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [showDeleteModal, setShowDeleteModal] = useState(false)

    useEffect(() => {
        if (medication) {
            setName(medication.name)
            setDescription(medication.description || '')
            setError('')
        }
    }, [medication])

    if (!isOpen || !medication) return null

    const handleClose = () => {
        setError('')
        onClose()
    }

    const handleSave = async () => {
        if (!user) return
        if (!name.trim()) {
            setError('Il nome del farmaco è obbligatorio')
            return
        }

        setLoading(true)
        setError('')

        try {
            const { error: updateError } = await supabase
                .from('medications')
                .update({
                    name: name.trim(),
                    description: description.trim() || null,
                })
                .eq('id', medication.id)

            if (updateError) {
                setError('Errore nell\'aggiornamento: ' + updateError.message)
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

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
                <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                    <div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-1">{medication.name}</h3>
                        <p className="text-sm text-gray-600">Aggiunto il {new Date(medication.created_at).toLocaleDateString('it-IT')}</p>
                    </div>
                    <button
                        onClick={handleClose}
                        className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="overflow-y-auto max-h-[calc(90vh-200px)] p-6">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">{error}</div>
                    )}

                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
                            <input
                                type="text"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Descrizione</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={6}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                placeholder="Note, indicazioni, dosaggi..."
                            />
                        </div>
                    </div>
                </div>

                <div className="flex justify-between items-center p-6 border-t border-gray-200 bg-gray-50">
                    <button
                        type="button"
                        onClick={() => setShowDeleteModal(true)}
                        className="px-6 py-2 bg-red-600 border border-transparent rounded-lg text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                        Elimina
                    </button>
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="px-6 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                        >
                            Chiudi
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={loading}
                            className="px-6 py-2 bg-blue-600 border border-transparent rounded-lg text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {loading ? 'Salvataggio...' : 'Salva Modifiche'}
                        </button>
                    </div>
                </div>

                <DeleteMedicationConfirmModal
                    isOpen={showDeleteModal}
                    medication={medication}
                    onClose={() => setShowDeleteModal(false)}
                    onSuccess={onSuccess}
                />
            </div>
        </div>
    )
} 