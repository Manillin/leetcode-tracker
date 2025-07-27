'use client'

import { useAuth, withAuth } from '@/contexts/AuthContext'
import { useEffect, useState, useCallback } from 'react'
import { createSupabaseClient } from '@/lib/supabase/client'
import StatsCards from '@/components/profile/StatsCards'
import ExerciseTable from '@/components/profile/ExerciseTable'
import AddExerciseModal from '@/components/profile/AddExerciseModal'
import EditExerciseModal from '@/components/profile/EditExerciseModal'
import DeleteConfirmModal from '@/components/profile/DeleteConfirmModal'

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

function ProfilePage() {
    const { user, profile } = useAuth()
    const [exercises, setExercises] = useState<ExerciseWithProblem[]>([])
    const [loading, setLoading] = useState(true)
    const [currentPage, setCurrentPage] = useState(1)
    const [totalCount, setTotalCount] = useState(0)
    const [showAddModal, setShowAddModal] = useState(false)
    const [showEditModal, setShowEditModal] = useState(false)
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [selectedExercise, setSelectedExercise] = useState<ExerciseWithProblem | null>(null)

    const supabase = createSupabaseClient()
    const ITEMS_PER_PAGE = 10

    // Carica gli esercizi con paginazione (memoizzata)
    const loadExercises = useCallback(async (page: number = 1) => {
        if (!user) return

        setLoading(true)
        try {
            const from = (page - 1) * ITEMS_PER_PAGE
            const to = from + ITEMS_PER_PAGE - 1

            const { data, error, count } = await supabase
                .from('solved_exercises')
                .select(`
          *,
          problems!inner(*)
        `, { count: 'exact' })
                .eq('user_id', user.id)
                .order('date_completed', { ascending: false })
                .range(from, to)

            if (error) {
                console.error('Errore caricamento esercizi:', error)
                return
            }

            // Trasforma i dati per avere una struttura piatta
            const transformedData: ExerciseWithProblem[] = data?.map(exercise => ({
                id: exercise.id,
                user_id: exercise.user_id,
                problem_id: exercise.problem_id,
                notes: exercise.notes,
                date_completed: exercise.date_completed,
                created_at: exercise.created_at,
                updated_at: exercise.updated_at,
                leetcode_number: exercise.problems.leetcode_number,
                title: exercise.problems.title,
                link: exercise.problems.link,
            })) || []

            setExercises(transformedData)
            setTotalCount(count || 0)
        } catch (error) {
            console.error('Errore caricamento esercizi:', error)
        } finally {
            setLoading(false)
        }
    }, [user, supabase, ITEMS_PER_PAGE])

    useEffect(() => {
        loadExercises(currentPage)
    }, [currentPage, loadExercises])

    // Gestione aggiunta esercizio
    const handleAddExercise = () => {
        setShowAddModal(true)
    }

    // Gestione modifica esercizio
    const handleEditExercise = (exercise: ExerciseWithProblem) => {
        setSelectedExercise(exercise)
        setShowEditModal(true)
    }

    // Gestione eliminazione esercizio
    const handleDeleteExercise = (exercise: ExerciseWithProblem) => {
        setSelectedExercise(exercise)
        setShowDeleteModal(true)
    }

    // Callback per refresh dopo operazioni CRUD
    const handleOperationComplete = () => {
        loadExercises(currentPage)
        setShowAddModal(false)
        setShowEditModal(false)
        setShowDeleteModal(false)
        setSelectedExercise(null)
    }

    const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE)

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-800 mb-4">Accesso richiesto</h1>
                    <p className="text-gray-600">Devi effettuare il login per accedere al profilo.</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        👋 Ciao, {profile?.name || user.email}!
                    </h1>
                    <p className="text-gray-600">
                        Ecco il tuo progresso su LeetCode
                    </p>
                </div>

                {/* Statistiche */}
                <StatsCards
                    totalExercises={totalCount}
                    currentStreak={profile?.streak_count || 0}
                />

                {/* Tabella Esercizi */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                        <h2 className="text-xl font-semibold text-gray-900">
                            I tuoi esercizi risolti
                        </h2>
                        <button
                            onClick={handleAddExercise}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Aggiungi esercizio risolto
                        </button>
                    </div>

                    <ExerciseTable
                        exercises={exercises}
                        loading={loading}
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                        onEdit={handleEditExercise}
                        onDelete={handleDeleteExercise}
                    />
                </div>

                {/* Modali */}
                <AddExerciseModal
                    isOpen={showAddModal}
                    onClose={() => setShowAddModal(false)}
                    onSuccess={handleOperationComplete}
                />

                <EditExerciseModal
                    isOpen={showEditModal}
                    exercise={selectedExercise}
                    onClose={() => setShowEditModal(false)}
                    onSuccess={handleOperationComplete}
                />

                <DeleteConfirmModal
                    isOpen={showDeleteModal}
                    exercise={selectedExercise}
                    onClose={() => setShowDeleteModal(false)}
                    onSuccess={handleOperationComplete}
                />
            </div>
        </div>
    )
}

export default withAuth(ProfilePage) 