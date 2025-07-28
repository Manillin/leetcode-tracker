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

interface ExerciseDetailModalProps {
    isOpen: boolean
    exercise: ExerciseWithProblem | null
    onClose: () => void
    onSuccess: () => void
}

export default function ExerciseDetailModal({ isOpen, exercise, onClose, onSuccess }: ExerciseDetailModalProps) {
    const { user } = useAuth()
    const [formData, setFormData] = useState({
        notes: '',
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
                notes: exercise.notes || '',
                primary_category: exercise.primary_category,
                additional_tags: exercise.additional_tags || []
            })
        }
    }, [exercise])

    const handleSave = async () => {
        if (!exercise || !user) return

        setLoading(true)
        setError('')

        try {
            // Aggiorna solo note, categoria e tag
            const { error: updateError } = await supabase
                .from('solved_exercises')
                .update({
                    notes: formData.notes || null,
                    primary_category: formData.primary_category,
                    additional_tags: formData.additional_tags.length > 0 ? formData.additional_tags : null,
                })
                .eq('id', exercise.id)

            if (updateError) {
                setError('Errore nell\'aggiornamento: ' + updateError.message)
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
            <div className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                    <div className="flex items-center space-x-4">
                        <span className="inline-flex items-center justify-center w-12 h-12 rounded-full text-lg font-bold bg-blue-100 text-blue-800">
                            {exercise.leetcode_number}
                        </span>
                        <div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-1">
                                <a
                                    href={exercise.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-800 hover:underline"
                                >
                                    {exercise.title}
                                </a>
                            </h3>
                            <p className="text-sm text-gray-600">
                                Completato il {new Date(exercise.date_completed).toLocaleDateString('it-IT')}
                            </p>
                        </div>
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

                <div className="overflow-y-auto max-h-[calc(90vh-200px)]">
                    {/* Categoria e Tag - Layout compatto in alto */}
                    <div className="p-6 bg-gray-50 border-b border-gray-100">
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
                    </div>

                    {/* Note - Area principale con massima visibilità */}
                    <div className="p-6">
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                                {error}
                            </div>
                        )}

                        <div className="mb-4">
                            <label className="block text-lg font-semibold text-gray-900 mb-3">
                                Note e Soluzione
                            </label>
                            <MarkdownEditor
                                value={formData.notes}
                                onChange={(value) => setFormData({ ...formData, notes: value })}
                                placeholder="Aggiungi le tue note, algoritmo usato, complessità, insights..."
                                disabled={loading}
                                className="min-h-[400px]"
                                defaultMode="preview"
                            />
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex justify-between items-center p-6 border-t border-gray-200 bg-gray-50">
                    <div className="text-sm text-gray-500">
                        Esercizio #{exercise.leetcode_number} • {exercise.primary_category}
                        {exercise.additional_tags && exercise.additional_tags.length > 0 && (
                            <span> • +{exercise.additional_tags.length} tag</span>
                        )}
                    </div>
                    <div className="flex space-x-3">
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
            </div>
        </div>
    )
} 