'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { createSupabaseClient } from '@/lib/supabase/client'

interface ExerciseWithProblem {
    id: number
    user_id: string
    problem_id: number
    notes: string | null
    date_completed: string
    created_at: string
    updated_at: string
    leetcode_number: number
    title: string
    link: string
}

interface EditExerciseModalProps {
    isOpen: boolean
    exercise: ExerciseWithProblem | null
    onClose: () => void
    onSuccess: () => void
}

export default function EditExerciseModal({ isOpen, exercise, onClose, onSuccess }: EditExerciseModalProps) {
    const { user } = useAuth()
    const [formData, setFormData] = useState({
        leetcode_number: '',
        title: '',
        link: '',
        notes: '',
        date_completed: ''
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const supabase = createSupabaseClient()

    // Popola il form quando l'esercizio cambia
    useEffect(() => {
        if (exercise) {
            setFormData({
                leetcode_number: exercise.leetcode_number.toString(),
                title: exercise.title,
                link: exercise.link,
                notes: exercise.notes || '',
                date_completed: exercise.date_completed
            })
        }
    }, [exercise])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!user || !exercise) return

        setLoading(true)
        setError('')

        try {
            // Aggiorna i dati del problema nella tabella problems
            const { error: problemUpdateError } = await supabase
                .from('problems')
                .update({
                    leetcode_number: parseInt(formData.leetcode_number),
                    title: formData.title,
                    link: formData.link,
                })
                .eq('id', exercise.problem_id)

            if (problemUpdateError) {
                setError('Errore nell\'aggiornamento del problema: ' + problemUpdateError.message)
                return
            }

            // Aggiorna l'esercizio risolto
            const { error: exerciseUpdateError } = await supabase
                .from('solved_exercises')
                .update({
                    notes: formData.notes || null,
                    date_completed: formData.date_completed,
                })
                .eq('id', exercise.id)

            if (exerciseUpdateError) {
                setError('Errore nell\'aggiornamento dell\'esercizio: ' + exerciseUpdateError.message)
                return
            }

            onSuccess()
            onClose()
        } catch (error) {
            setError('Errore imprevisto: ' + (error as Error).message)
        } finally {
            setLoading(false)
        }
    }

    const handleClose = () => {
        setError('')
        onClose()
    }

    if (!isOpen || !exercise) return null

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">
                        Modifica Esercizio
                    </h3>
                    <button
                        onClick={handleClose}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Numero LeetCode *
                        </label>
                        <input
                            type="number"
                            required
                            min="1"
                            value={formData.leetcode_number}
                            onChange={(e) => setFormData({ ...formData, leetcode_number: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            placeholder="es. 1"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Titolo *
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            placeholder="es. Two Sum"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Link LeetCode *
                        </label>
                        <input
                            type="url"
                            required
                            value={formData.link}
                            onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            placeholder="https://leetcode.com/problems/two-sum/"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Data Completamento *
                        </label>
                        <input
                            type="date"
                            required
                            value={formData.date_completed}
                            onChange={(e) => setFormData({ ...formData, date_completed: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Note (opzionale)
                        </label>
                        <textarea
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Note personali sulla soluzione..."
                        />
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            Annulla
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Salvataggio...' : 'Salva Modifiche'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
} 