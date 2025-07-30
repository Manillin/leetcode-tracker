'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { createSupabaseClient } from '@/lib/supabase/client'
import { PRIMARY_CATEGORIES } from '@/types/database'
import CategorySelectorCompact from './CategorySelectorCompact'
import MarkdownEditor from './MarkdownEditor'

interface AddExerciseModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
}

export default function AddExerciseModal({ isOpen, onClose, onSuccess }: AddExerciseModalProps) {
    const { user, updateProfile } = useAuth()
    const [formData, setFormData] = useState({
        leetcode_number: '',
        title: '',
        link: '',
        notes: '',
        date_completed: new Date().toISOString().split('T')[0], // Data di oggi
        primary_category: PRIMARY_CATEGORIES[0] as string, // Default alla prima categoria
        additional_tags: [] as string[]
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    // 🧪 Modalità test per la streak
    const [testMode, setTestMode] = useState(false)

    const supabase = createSupabaseClient()

    // Funzione per aggiornare la streak dell'utente (GIORNI consecutivi, non esercizi)
    const updateUserStreak = async (completedDate: string) => {
        if (!user) return

        try {
            console.log('🔥 === STREAK UPDATE START ===')
            console.log('🔥 User ID:', user.id)
            console.log('🔥 Completed Date:', completedDate)

            // 1. Ottieni il profilo attuale PRIMA di tutto
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single()

            if (profileError && profileError.code !== 'PGRST116') {
                console.error('❌ Errore nel caricamento profilo per streak:', profileError)
                return
            }

            console.log('📊 Current Profile:', {
                streak_count: profile?.streak_count || 0,
                last_completed_date: profile?.last_completed_date || 'none'
            })

            // 2. Controlla se in questa data è già stato risolto un esercizio
            // ESCLUDI l'esercizio corrente che potrebbe essere appena stato inserito
            const { data: existingExercises, error: checkError } = await supabase
                .from('solved_exercises')
                .select('date_completed')
                .eq('user_id', user.id)
                .eq('date_completed', completedDate)

            if (checkError) {
                console.error('❌ Errore controllo esercizi esistenti:', checkError)
                return
            }

            console.log('📋 Existing exercises for date:', existingExercises?.length || 0)

            // Se ci sono già più di 1 esercizio per oggi, NON aggiornare la streak
            // (Il primo esercizio del giorno deve aggiornare la streak)
            if (existingExercises && existingExercises.length > 1) {
                console.log('🎯 Esercizio aggiunto nello stesso giorno - streak non cambia')
                return
            }

            // 3. Calcola la nuova streak basata sui GIORNI
            let newStreak = 1
            const completedDateObj = new Date(completedDate + 'T00:00:00') // Forza mezzanotte

            console.log('📅 Date comparison:')
            console.log('📅 Completed Date Obj:', completedDateObj)

            if (profile?.last_completed_date) {
                const lastDateObj = new Date(profile.last_completed_date + 'T00:00:00')
                console.log('📅 Last Date Obj:', lastDateObj)

                const diffTime = completedDateObj.getTime() - lastDateObj.getTime()
                const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24))

                console.log('📅 Streak calculation:', {
                    lastDate: profile.last_completed_date,
                    newDate: completedDate,
                    diffTime,
                    diffDays,
                    currentStreak: profile.streak_count || 0
                })

                if (diffDays === 1) {
                    // Giorno consecutivo - incrementa
                    newStreak = (profile.streak_count || 0) + 1
                    console.log('✅ Giorno consecutivo! Streak:', profile.streak_count || 0, '->', newStreak)
                } else if (diffDays === 0) {
                    // Stesso giorno - mantieni streak attuale
                    newStreak = profile.streak_count || 1
                    console.log('⚠️ Stesso giorno - streak rimane:', newStreak)
                } else if (diffDays > 1) {
                    // Gap di giorni - reset a 1
                    newStreak = 1
                    console.log('💔 Gap di', diffDays, 'giorni - streak reset a 1')
                } else {
                    // Data passata (diffDays < 0) - mantieni streak attuale se è una data passata recente
                    if (diffDays >= -1) {
                        // Tolleranza di 1 giorno per date passate (edge case)
                        newStreak = (profile.streak_count || 0) + 1
                        console.log('⏰ Data passata recente - incrementa streak:', newStreak)
                    } else {
                        newStreak = 1
                        console.log('💔 Data molto passata - reset streak a 1')
                    }
                }
            } else {
                console.log('🎯 Prima volta - streak inizia a 1')
                newStreak = 1
            }

            console.log('🎯 New streak to set:', newStreak)

            // 4. Aggiorna il profilo
            const { error: updateError } = await updateProfile({
                streak_count: newStreak,
                last_completed_date: completedDate
            })

            if (updateError) {
                console.error('❌ Errore nell\'aggiornamento della streak:', updateError)
            } else {
                console.log('🔥 Streak aggiornata con successo:', newStreak, 'giorni consecutivi')
            }

            console.log('🔥 === STREAK UPDATE END ===')
        } catch (error) {
            console.error('❌ Errore generale nel calcolo della streak:', error)
        }
    }

    // 🧪 Test Streak con Date Simulate
    const testStreakWithDates = async () => {
        if (!user) return

        console.log('🧪 === STREAK TEST MODE START ===')

        // Reset streak prima del test
        await updateProfile({
            streak_count: 0,
            last_completed_date: null
        })
        console.log('🧪 Reset streak to 0')

        // Test scenario: 3 giorni consecutivi
        const testDates = [
            '2024-07-26', // Giorno 1
            '2024-07-27', // Giorno 2 
            '2024-07-28', // Giorno 3 (oggi)
        ]

        for (let i = 0; i < testDates.length; i++) {
            console.log(`🧪 Testing date ${i + 1}: ${testDates[i]}`)

            // Simula inserimento esercizio con data specifica
            await updateUserStreak(testDates[i])

            // Aspetta un po' per vedere i risultati
            await new Promise(resolve => setTimeout(resolve, 500))
        }

        console.log('🧪 === STREAK TEST MODE END ===')
        console.log('🧪 Check your profile - streak should be 3!')
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!user) return

        setLoading(true)
        setError('')

        try {
            // Prima verifica se il problema esiste già nella tabella problems
            const { data: existingProblem, error: searchError } = await supabase
                .from('problems')
                .select('*')
                .eq('leetcode_number', parseInt(formData.leetcode_number))
                .single()

            let problemId: number

            if (searchError && searchError.code === 'PGRST116') {
                // Il problema non esiste, lo creiamo
                const { data: newProblem, error: createError } = await supabase
                    .from('problems')
                    .insert([{
                        leetcode_number: parseInt(formData.leetcode_number),
                        title: formData.title,
                        link: formData.link,
                    }])
                    .select()
                    .single()

                if (createError) {
                    setError('Errore nella creazione del problema: ' + createError.message)
                    return
                }

                problemId = newProblem.id
            } else if (searchError) {
                setError('Errore nella ricerca del problema: ' + searchError.message)
                return
            } else {
                problemId = existingProblem.id
            }

            // Verifica se l'utente ha già risolto questo esercizio
            const { data: existingExercise, error: duplicateError } = await supabase
                .from('solved_exercises')
                .select('*')
                .eq('user_id', user.id)
                .eq('problem_id', problemId)
                .maybeSingle()

            if (duplicateError) {
                setError('Errore nella verifica duplicati: ' + duplicateError.message)
                return
            }

            if (existingExercise) {
                setError('Hai già aggiunto questo esercizio!')
                return
            }

            // Crea l'esercizio risolto
            const { error: insertError } = await supabase
                .from('solved_exercises')
                .insert([{
                    user_id: user.id,
                    problem_id: problemId,
                    notes: formData.notes || null,
                    date_completed: formData.date_completed,
                    primary_category: formData.primary_category,
                    additional_tags: formData.additional_tags.length > 0 ? formData.additional_tags : null,
                }])

            if (insertError) {
                setError('Errore nell\'aggiunta dell\'esercizio: ' + insertError.message)
                return
            }

            // Aggiorna la streak nel profilo
            await updateUserStreak(formData.date_completed)

            // Reset form e chiudi modale
            setFormData({
                leetcode_number: '',
                title: '',
                link: '',
                notes: '',
                date_completed: new Date().toISOString().split('T')[0],
                primary_category: PRIMARY_CATEGORIES[0],
                additional_tags: []
            })
            onSuccess()
            onClose()
        } catch (error) {
            setError('Errore imprevisto: ' + (error as Error).message)
        } finally {
            setLoading(false)
        }
    }

    const handleClose = () => {
        setFormData({
            leetcode_number: '',
            title: '',
            link: '',
            notes: '',
            date_completed: new Date().toISOString().split('T')[0],
            primary_category: PRIMARY_CATEGORIES[0],
            additional_tags: []
        })
        setError('')
        onClose()
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
                <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-blue-50">
                    <h3 className="text-xl font-bold text-gray-900">
                        Aggiungi Esercizio Risolto
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
                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
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
                                placeholder="Scrivi le tue note in markdown (algoritmo usato, complessità, insights...)"
                                disabled={loading}
                                className="mt-1"
                            />
                        </div>

                        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-100 mt-6">
                            {/* 🧪 Test Button - Solo in development */}
                            {process.env.NODE_ENV === 'development' && (
                                <button
                                    type="button"
                                    onClick={testStreakWithDates}
                                    className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white text-sm font-medium rounded-lg transition-colors"
                                >
                                    🧪 Test Streak
                                </button>
                            )}

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
                                {loading ? 'Salvataggio...' : 'Salva Esercizio'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
} 