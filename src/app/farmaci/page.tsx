'use client'

import { withAuth, useAuth } from '@/contexts/AuthContext'
import { useEffect, useMemo, useState, useCallback } from 'react'
import { createSupabaseClient } from '@/lib/supabase/client'
import MedicationsTable from '@/components/medications/MedicationsTable'
import AddMedicationModal from '@/components/medications/AddMedicationModal'
import RandomPickModal from '@/components/medications/RandomPickModal'
import MedicationDetailModal from '@/components/medications/MedicationDetailModal'
import Link from 'next/link'

interface MedicationRow {
    id: number
    user_id: string
    name: string
    description: string | null
    created_at: string
}

function MedicationsPage() {
    const { user, profile } = useAuth()
    const supabase = useMemo(() => createSupabaseClient(), [])

    const [medications, setMedications] = useState<MedicationRow[]>([])
    const [loading, setLoading] = useState(true)
    const [currentPage, setCurrentPage] = useState(1)
    const [totalCount, setTotalCount] = useState(0)

    const [showAddModal, setShowAddModal] = useState(false)
    const [showRandomModal, setShowRandomModal] = useState(false)
    const [pickedMedication, setPickedMedication] = useState<MedicationRow | null>(null)
    const [showDetailModal, setShowDetailModal] = useState(false)
    const [selectedMedication, setSelectedMedication] = useState<MedicationRow | null>(null)

    const ITEMS_PER_PAGE = 20

    const loadTotalCount = useCallback(async () => {
        if (!user?.id) return
        try {
            const { count, error } = await supabase
                .from('medications')
                .select('*', { count: 'estimated', head: true })
                .eq('user_id', user.id)

            if (!error) setTotalCount(count || 0)
        } catch { }
    }, [supabase, user?.id])

    const loadMedications = useCallback(async (page: number = 1) => {
        if (!user?.id) return
        setLoading(true)
        try {
            const from = (page - 1) * ITEMS_PER_PAGE
            const to = from + ITEMS_PER_PAGE - 1

            const { data, error } = await supabase
                .from('medications')
                .select('id, user_id, name, description, created_at')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .range(from, to)

            if (!error) setMedications(data || [])
        } finally {
            setLoading(false)
        }
    }, [supabase, user?.id])

    useEffect(() => {
        if (!user?.id) return
        loadTotalCount()
        loadMedications(currentPage)
    }, [user?.id, currentPage, loadTotalCount, loadMedications])

    const totalPages = Math.max(1, Math.ceil(totalCount / ITEMS_PER_PAGE))

    const fetchRandomMedication = useCallback(async (): Promise<MedicationRow | null> => {
        if (!user?.id || totalCount === 0) return null
        const index = Math.floor(Math.random() * totalCount)
        const { data, error } = await supabase
            .from('medications')
            .select('id, user_id, name, description, created_at')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .range(index, index)

        if (error || !data || data.length === 0) return null
        return data[0]
    }, [supabase, user?.id, totalCount])

    const handlePickRandom = async () => {
        const med = await fetchRandomMedication()
        if (med) {
            setPickedMedication(med)
            setShowRandomModal(true)
        }
    }

    const handlePickAnother = async () => {
        const med = await fetchRandomMedication()
        if (med) setPickedMedication(med)
    }

    const handleViewMedication = (med: MedicationRow) => {
        setSelectedMedication(med)
        setShowDetailModal(true)
    }

    const handleOperationComplete = () => {
        loadTotalCount()
        loadMedications(currentPage)
        setShowDetailModal(false)
        setSelectedMedication(null)
    }

    const todayLabel = new Date().toLocaleDateString('it-IT')

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto px-4 py-8">
                {/* Header con saluto */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <Link href="/" className="inline-flex items-center text-gray-600 hover:text-gray-800 transition-colors">
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            Torna alla Home
                        </Link>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Ciao, {profile?.name || user?.email}!</h1>
                    <p className="text-gray-600">Ecco i tuoi farmaci per lo studio e il ripasso.</p>
                </div>

                {/* Card blu: Farmaci studiati + Card gialla: Messaggio del giorno */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-blue-100 text-sm font-medium">Farmaci studiati</p>
                                <p className="text-3xl font-bold mt-1">{totalCount}</p>
                            </div>
                            <div className="bg-blue-400 bg-opacity-30 p-3 rounded-lg">
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                        <div className="mt-4">
                            <div className="flex items-center text-blue-100 text-sm">
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                </svg>
                                Continua così!
                            </div>
                        </div>
                    </div>

                    {/* Nuova card gialla */}
                    <div className="bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-xl p-6 text-white shadow-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-yellow-100 text-sm font-medium">Messaggio da chris</p>
                                <p className="text-2xl font-bold mt-1">Hola amorcito te hecho de menos</p>
                            </div>
                            <div className="bg-yellow-300 bg-opacity-30 p-3 rounded-lg">
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                            </div>
                        </div>
                        <div className="mt-4">
                            <div className="flex items-center text-yellow-100 text-sm">
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3M5 21h14a2 2 0 002-2V7H3v12a2 2 0 002 2z" />
                                </svg>
                                {todayLabel}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabella + Azioni */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-xl font-semibold text-gray-900">I tuoi farmaci</h2>
                    </div>

                    <MedicationsTable
                        medications={medications}
                        loading={loading}
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                        onView={handleViewMedication}
                    />

                    {/* Pulsanti centrati */}
                    <div className="px-6 py-6 border-t border-gray-200 flex justify-center gap-3">
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Aggiungi farmaco
                        </button>
                        <button
                            onClick={handlePickRandom}
                            disabled={totalCount === 0}
                            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Pesca farmaco
                        </button>
                    </div>
                </div>

                {/* Modali */}
                <AddMedicationModal
                    isOpen={showAddModal}
                    onClose={() => setShowAddModal(false)}
                    onSuccess={handleOperationComplete}
                />

                <MedicationDetailModal
                    isOpen={showDetailModal}
                    medication={selectedMedication}
                    onClose={() => setShowDetailModal(false)}
                    onSuccess={handleOperationComplete}
                />

                <RandomPickModal
                    isOpen={showRandomModal}
                    medication={pickedMedication ? { id: pickedMedication.id, name: pickedMedication.name, description: pickedMedication.description } : null}
                    onClose={() => setShowRandomModal(false)}
                    onPickAnother={handlePickAnother}
                />
            </div>
        </div>
    )
}

export default withAuth(MedicationsPage) 