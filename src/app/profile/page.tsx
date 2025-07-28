'use client'

import { useAuth, withAuth } from '@/contexts/AuthContext'
import { useEffect, useState, useCallback, useMemo } from 'react'
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

    // Memoizza il client Supabase
    const supabase = useMemo(() => createSupabaseClient(), [])
    const ITEMS_PER_PAGE = 10

    // Carica il conteggio totale (ottimizzato contro re-rendering)
    const loadTotalCount = useCallback(async () => {
        if (!user?.id) return

        const countStart = performance.now()
        console.log('📊 Caricamento conteggio totale... START at', countStart.toFixed(2), 'ms for user:', user.id)

        try {
            const { count, error } = await supabase
                .from('solved_exercises')
                .select('*', { count: 'estimated', head: true })
                .eq('user_id', user.id)

            const countEnd = performance.now()
            const countDuration = countEnd - countStart
            console.log('⚡ Count query in', countDuration.toFixed(2), 'ms')

            if (error) {
                console.error('❌ Errore conteggio dopo', countDuration.toFixed(2), 'ms:', error)
                return
            }

            setTotalCount(count || 0)
            console.log('✅ Conteggio completato in', countDuration.toFixed(2), 'ms - Count:', count)
        } catch (error) {
            const countError = performance.now()
            console.error('❌ Errore conteggio dopo', (countError - countStart).toFixed(2), 'ms:', error)
        }
    }, [user?.id, supabase])

    // Carica gli esercizi con paginazione (ottimizzato contro re-rendering)
    const loadExercises = useCallback(async (page: number = 1) => {
        if (!user?.id) return

        const exerciseStart = performance.now()
        console.log('📚 Caricamento esercizi pagina:', page, 'START at', exerciseStart.toFixed(2), 'ms for user:', user.id)

        setLoading(true)
        try {
            const from = (page - 1) * ITEMS_PER_PAGE
            const to = from + ITEMS_PER_PAGE - 1

            // Query esercizi
            const query1Start = performance.now()
            const { data: exerciseData, error: exerciseError } = await supabase
                .from('solved_exercises')
                .select('id, user_id, problem_id, notes, date_completed')
                .eq('user_id', user.id)
                .order('date_completed', { ascending: false })
                .range(from, to)

            const query1End = performance.now()
            console.log('⚡ Exercises query in', (query1End - query1Start).toFixed(2), 'ms')

            if (exerciseError) {
                console.error('❌ Errore esercizi dopo', (query1End - query1Start).toFixed(2), 'ms:', exerciseError)
                return
            }

            if (!exerciseData || exerciseData.length === 0) {
                setExercises([])
                const totalTime = performance.now() - exerciseStart
                console.log('✅ Nessun esercizio - TEMPO TOTALE:', totalTime.toFixed(2), 'ms')
                return
            }

            // Estrai gli ID dei problemi
            const mapStart = performance.now()
            const problemIds = Array.from(new Set(exerciseData.map(ex => ex.problem_id)))
            const mapEnd = performance.now()
            console.log('⚡ Problem IDs mapping in', (mapEnd - mapStart).toFixed(2), 'ms')

            // Query problemi
            const query2Start = performance.now()
            const { data: problemData, error: problemError } = await supabase
                .from('problems')
                .select('id, leetcode_number, title, link')
                .in('id', problemIds)

            const query2End = performance.now()
            console.log('⚡ Problems query in', (query2End - query2Start).toFixed(2), 'ms')

            if (problemError) {
                console.error('❌ Errore problemi dopo', (query2End - query2Start).toFixed(2), 'ms:', problemError)
                return
            }

            // Combinazione dati
            const combineStart = performance.now()
            const problemMap = new Map(
                problemData?.map(problem => [problem.id, problem]) || []
            )

            const transformedData: ExerciseWithProblem[] = exerciseData.map(exercise => {
                const problem = problemMap.get(exercise.problem_id)
                return {
                    ...exercise,
                    leetcode_number: problem?.leetcode_number || 0,
                    title: problem?.title || 'N/A',
                    link: problem?.link || '#',
                }
            })
            const combineEnd = performance.now()
            console.log('⚡ Data combination in', (combineEnd - combineStart).toFixed(2), 'ms')

            setExercises(transformedData)
            const totalTime = performance.now() - exerciseStart
            console.log('✅ Esercizi caricati - TEMPO TOTALE:', totalTime.toFixed(2), 'ms - Count:', transformedData.length)
        } catch (error) {
            const errorTime = performance.now()
            console.error('❌ Errore esercizi dopo', (errorTime - exerciseStart).toFixed(2), 'ms:', error)
        } finally {
            setLoading(false)
        }
    }, [user?.id, supabase, ITEMS_PER_PAGE])

    // STRATEGIA NON-BLOCCANTE: Query multiple parallele + fallback intelligente
    const loadDataNonBlocking = useCallback(() => {
        if (!user?.id) return

        console.log('🚀 Starting NON-BLOCKING data load strategy for user:', user.id)

        // Set loading immediatamente per show spinner
        setLoading(true)

        // Strategia multi-query parallela
        const loadCount = async () => {
            try {
                console.log('📊 Count query START')
                const { count, error } = await supabase
                    .from('solved_exercises')
                    .select('*', { count: 'estimated', head: true })
                    .eq('user_id', user.id)

                if (!error) {
                    setTotalCount(count || 0)
                    console.log('✅ Count loaded:', count)
                } else {
                    console.log('⚠️ Count query failed, setting 0')
                    setTotalCount(0)
                }
            } catch {
                console.log('⚠️ Count error, setting 0')
                setTotalCount(0)
            }
        }

        const loadExercises = async () => {
            try {
                const from = (currentPage - 1) * ITEMS_PER_PAGE
                const to = from + ITEMS_PER_PAGE - 1

                console.log('📚 Exercises query START')

                // Prima query: esercizi (più probabile che funzioni)
                const { data: exerciseData, error: exerciseError } = await supabase
                    .from('solved_exercises')
                    .select('id, user_id, problem_id, notes, date_completed')
                    .eq('user_id', user.id)
                    .order('date_completed', { ascending: false })
                    .range(from, to)

                if (exerciseError) {
                    throw new Error('Exercise query failed: ' + exerciseError.message)
                }

                if (!exerciseData || exerciseData.length === 0) {
                    setExercises([])
                    console.log('✅ No exercises found')
                    return
                }

                console.log('✅ Exercises loaded, loading problems...')

                // Seconda query: problemi (in parallelo, non-bloccante)
                const problemIds = Array.from(new Set(exerciseData.map(ex => ex.problem_id)))

                const { data: problemData } = await supabase
                    .from('problems')
                    .select('id, leetcode_number, title, link')
                    .in('id', problemIds)

                // Anche se problemi falliscono, mostriamo gli esercizi
                const problemMap = new Map(
                    problemData?.map(problem => [problem.id, problem]) || []
                )

                const transformedData: ExerciseWithProblem[] = exerciseData.map(exercise => {
                    const problem = problemMap.get(exercise.problem_id)
                    return {
                        ...exercise,
                        leetcode_number: problem?.leetcode_number || 0,
                        title: problem?.title || `Problem ${exercise.problem_id}`,
                        link: problem?.link || '#',
                    }
                })

                setExercises(transformedData)
                console.log('✅ Complete exercises with problems loaded:', transformedData.length)

            } catch {
                console.log('⚠️ Exercise loading failed, showing empty state')
                setExercises([])
            }
        }

        // Esegui tutto in parallelo, NON sequenziale
        Promise.allSettled([loadCount(), loadExercises()])
            .then(() => {
                console.log('🎯 All data loading completed (success or failure)')
                setLoading(false)
            })
            .catch(() => {
                console.log('🎯 Data loading finished with errors')
                setLoading(false)
            })

    }, [user?.id, supabase, currentPage, ITEMS_PER_PAGE])

    // Carica TUTTI i dati quando user cambia o pagina cambia
    useEffect(() => {
        if (user?.id) {
            console.log('🎯 User/Page changed, loading all data non-blocking')
            loadDataNonBlocking()
        }
    }, [user?.id, currentPage, loadDataNonBlocking])

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
        // Ricarica sia gli esercizi che il conteggio
        loadExercises(currentPage)
        loadTotalCount()
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