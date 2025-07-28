'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { createSupabaseClient } from '@/lib/supabase/client'

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
        date_completed: new Date().toISOString().split('T')[0] // Data di oggi
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const supabase = createSupabaseClient()

    // Funzione per aggiornare la streak dell'utente (GIORNI consecutivi, non esercizi)
    const updateUserStreak = async (completedDate: string) => {
        if (!user) return

        try {
            // 1. Controlla se in questa data è già stato risolto un esercizio
            const { data: existingExercises, error: checkError } = await supabase
                .from('solved_exercises')
                .select('date_completed')
                .eq('user_id', user.id)
                .eq('date_completed', completedDate)

            if (checkError) {
                console.error('Errore controllo esercizi esistenti:', checkError)
                return
            }

            // Se ci sono già esercizi per oggi, NON aggiornare la streak
            if (existingExercises && existingExercises.length > 0) {
                console.log('🎯 Esercizio aggiunto nello stesso giorno - streak non cambia')
                return
            }

            // 2. Ottieni il profilo attuale
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single()

            if (profileError && profileError.code !== 'PGRST116') {
                console.error('Errore nel caricamento profilo per streak:', profileError)
                return
            }

            // 3. Calcola la nuova streak basata sui GIORNI
            let newStreak = 1
            const completedDateObj = new Date(completedDate + 'T00:00:00') // Forza mezzanotte

            if (profile?.last_completed_date) {
                const lastDateObj = new Date(profile.last_completed_date + 'T00:00:00')
                const diffTime = completedDateObj.getTime() - lastDateObj.getTime()
                const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24))

                console.log('📅 Streak calculation:', {
                    lastDate: profile.last_completed_date,
                    newDate: completedDate,
                    diffDays,
                    currentStreak: profile.streak_count
                })

                if (diffDays === 1) {
                    // Giorno consecutivo - incrementa
                    newStreak = (profile.streak_count || 0) + 1
                    console.log('✅ Giorno consecutivo! Streak:', profile.streak_count, '->', newStreak)
                } else if (diffDays === 0) {
                    // Stesso giorno (non dovrebbe succedere con il check sopra)
                    console.log('⚠️ Stesso giorno - streak rimane:', profile.streak_count)
                    return
                } else {
                    // Gap di giorni - reset a 1
                    newStreak = 1
                    console.log('💔 Gap di', diffDays, 'giorni - streak reset a 1')
                }
            } else {
                console.log('🎯 Prima volta - streak inizia a 1')
            }

            // 4. Aggiorna il profilo
            const { error: updateError } = await updateProfile({
                streak_count: newStreak,
                last_completed_date: completedDate
            })

            if (updateError) {
                console.error('Errore nell\'aggiornamento della streak:', updateError)
            } else {
                console.log('🔥 Streak aggiornata:', newStreak, 'giorni consecutivi')
            }
        } catch (error) {
            console.error('Errore nel calcolo della streak:', error)
        }
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
                date_completed: new Date().toISOString().split('T')[0]
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
            date_completed: new Date().toISOString().split('T')[0]
        })
        setError('')
        onClose()
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">
                        Aggiungi Esercizio Risolto
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
                            {loading ? 'Salvataggio...' : 'Salva Esercizio'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
} 