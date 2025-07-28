'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { createSupabaseClient } from '@/lib/supabase/client'
import { PRIMARY_CATEGORIES } from '@/types/database'
import CategorySelectorCompact from './CategorySelectorCompact'
import MarkdownEditor from './MarkdownEditor'

interface ExerciseWithProblem {
    id: number
    user_id: string
    problem_id: number
    notes: string | null
    date_completed: string
    primary_category: string
    additional_tags: string[] | null
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
        date_completed: '',
        primary_category: PRIMARY_CATEGORIES[0] as string,
        additional_tags: [] as string[]
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
                date_completed: exercise.date_completed,
                primary_category: exercise.primary_category,
                additional_tags: exercise.additional_tags || []
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
                    primary_category: formData.primary_category,
                    additional_tags: formData.additional_tags.length > 0 ? formData.additional_tags : null,
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
            <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
                <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-purple-50">
                    <h3 className="text-xl font-bold text-gray-900">
                        Modifica Esercizio
                    </h3>
                    <button
                        onClick={handleClose}
                        className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="overflow-y-auto max-h-[calc(90vh-160px)]">

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
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
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
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
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
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
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
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            />
                        </div>

                        <CategorySelectorCompact
                            primaryCategory={formData.primary_category}
                            additionalTags={formData.additional_tags}
                            onPrimaryCategoryChange={(category: string) =>
                                setFormData({ ...formData, primary_category: category })
                            }
                            onAdditionalTagsChange={(tags: string[]) =>
                                setFormData({ ...formData, additional_tags: tags })
                            }
                            disabled={loading}
                        />

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Note (opzionale)
                            </label>
                            <MarkdownEditor
                                value={formData.notes}
                                onChange={(value) => setFormData({ ...formData, notes: value })}
                                placeholder="Modifica le tue note in markdown..."
                                disabled={loading}
                                className="mt-1"
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
                                {loading ? 'Salvataggio...' : 'Salva Modifiche'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
} 