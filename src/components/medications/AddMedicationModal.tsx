'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { createSupabaseClient } from '@/lib/supabase/client'

interface AddMedicationModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
}

export default function AddMedicationModal({ isOpen, onClose, onSuccess }: AddMedicationModalProps) {
    const { user } = useAuth()
    const supabase = createSupabaseClient()

    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    if (!isOpen) return null

    const handleClose = () => {
        setName('')
        setDescription('')
        setError('')
        onClose()
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!user) return
        if (!name.trim()) {
            setError('Il nome del farmaco è obbligatorio')
            return
        }

        setLoading(true)
        setError('')

        try {
            const { error: insertError } = await supabase
                .from('medications')
                .insert([
                    {
                        user_id: user.id,
                        name: name.trim(),
                        description: description.trim() || null,
                    },
                ])

            if (insertError) {
                setError('Errore durante il salvataggio: ' + insertError.message)
                return
            }

            setName('')
            setDescription('')
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
            <div className="bg-white rounded-xl w-full max-w-lg overflow-hidden shadow-2xl">
                <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                    <h3 className="text-xl font-bold text-gray-900">Aggiungi farmaco</h3>
                    <button
                        onClick={handleClose}
                        className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
                        <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            placeholder="es. Paracetamolo"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Descrizione (opzionale)</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            rows={4}
                            placeholder="Note, indicazioni, dosaggi..."
                        />
                    </div>

                    <div className="flex justify-end space-x-3 pt-6 border-t border-gray-100 mt-6">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="px-6 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                        >
                            Annulla
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-3 bg-blue-600 border border-transparent rounded-lg text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {loading ? 'Salvataggio...' : 'Aggiungi'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
} 