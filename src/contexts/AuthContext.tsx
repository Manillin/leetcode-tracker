'use client'

import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react'
import { createSupabaseClient } from '@/lib/supabase/client'
import type { User, Session, AuthError } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

// Tipi per il profilo utente
type Profile = Database['public']['Tables']['profiles']['Row']

// Tipo unificato per gli errori
type AppError = AuthError | Error | null

interface AuthContextType {
    user: User | null
    profile: Profile | null
    session: Session | null
    loading: boolean
    signIn: (email: string, password: string) => Promise<{ error: AppError }>
    signUp: (name: string, email: string, password: string) => Promise<{ error: AppError }>
    signOut: () => Promise<void>
    updateProfile: (updates: Partial<Profile>) => Promise<{ error: AppError }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [profile, setProfile] = useState<Profile | null>(null)
    const [session, setSession] = useState<Session | null>(null)
    const [loading, setLoading] = useState(true)

    // Memoizza il client Supabase per evitare ricreazioni
    const supabase = useMemo(() => {
        try {
            return createSupabaseClient()
        } catch (error) {
            console.error('Errore nella creazione del client Supabase:', error)
            throw error
        }
    }, [])

    // Cache warming: riscalda le tabelle principali
    const warmupSupabaseCache = useCallback(async () => {
        const warmupStart = performance.now()
        console.log('🔥 Starting Supabase cache warmup...')

        try {
            // Warmup con query piccolissime e veloci
            const warmupPromises = [
                // Riscalda tabella solved_exercises
                supabase.from('solved_exercises').select('id').limit(1).single(),
                // Riscalda tabella problems  
                supabase.from('problems').select('id').limit(1).single(),
                // Riscalda tabella profiles
                supabase.from('profiles').select('id').limit(1).single()
            ]

            await Promise.allSettled(warmupPromises)

            const warmupEnd = performance.now()
            console.log('🔥 Cache warmup completed in', (warmupEnd - warmupStart).toFixed(2), 'ms')
        } catch {
            console.log('🔥 Cache warmup completed (with errors, but thats ok)')
        }
    }, [supabase])

    // Carica profilo con timeout (problema di rete Supabase confermato)
    const loadProfile = useCallback(async (userId: string) => {
        const startTime = performance.now()
        console.log('👤 loadProfile START - userId:', userId)

        try {
            // Le query Supabase si bloccano - problema di rete geografica
            // Timeout necessario per evitare freeze dell'app
            const queryPromise = supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single()

            const timeoutPromise = new Promise<never>((_, reject) =>
                setTimeout(() => {
                    console.log('⏰ Profile query timeout (likely network/region issue)')
                    reject(new Error('Profile query timeout'))
                }, 500) // Ridotto a 0.5s per essere più rapido
            )

            const result = await Promise.race([queryPromise, timeoutPromise])
            const { data, error } = result

            const endTime = performance.now()
            console.log('✅ Profile loaded in', (endTime - startTime).toFixed(2), 'ms')

            if (error && error.code !== 'PGRST116') {
                console.error('❌ Profile error:', error.message)
                setProfile(null)
                return
            }

            setProfile(data || null)
        } catch {
            const errorTime = performance.now()
            console.log('⏰ Profile timeout after', (errorTime - startTime).toFixed(2), 'ms - app continues working')
            // Non è un errore fatale - l'app continua a funzionare
            setProfile(null)
        }
    }, [supabase])

    // Inizializzazione auth ottimizzata (con loading intelligente)
    useEffect(() => {
        let mounted = true
        let hasInitialized = false
        const effectStart = performance.now()
        console.log('🚀 useEffect STARTED at', effectStart.toFixed(2), 'ms')

        console.log('⚡ Using auth state listener for faster initialization')

        // Avvia cache warmup immediatamente (non bloccante)
        warmupSupabaseCache()

        // Ascolta i cambiamenti di auth (più veloce di getSession)
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                const changeStart = performance.now()
                console.log('🔄 Auth state change:', event, 'at', changeStart.toFixed(2), 'ms')

                if (!mounted) return

                setSession(session)
                setUser(session?.user ?? null)

                // Imposta loading false solo DOPO aver ricevuto il primo auth state
                if (!hasInitialized) {
                    console.log('🎯 First auth state received, setting loading = false')
                    setLoading(false)
                    hasInitialized = true
                }

                if (session?.user && event !== 'TOKEN_REFRESHED') {
                    // Carica profilo solo per eventi significativi, non per refresh token
                    const profileStart = performance.now()
                    await loadProfile(session.user.id)
                    const profileEnd = performance.now()
                    console.log('⚡ Profile loaded in', (profileEnd - profileStart).toFixed(2), 'ms')
                } else if (!session?.user) {
                    setProfile(null)
                }

                const changeEnd = performance.now()
                const totalTime = changeEnd - effectStart
                console.log('✅ Auth initialization completed in', totalTime.toFixed(2), 'ms')
            }
        )

        // Fallback: se dopo 1 secondo non arriva nessun auth state, imposta loading = false
        const fallbackTimer = setTimeout(() => {
            if (!hasInitialized && mounted) {
                console.log('⏰ Auth state timeout, setting loading = false anyway')
                setLoading(false)
                hasInitialized = true
            }
        }, 1000)

        return () => {
            mounted = false
            clearTimeout(fallbackTimer)
            subscription.unsubscribe()
        }
    }, [supabase, loadProfile, warmupSupabaseCache])

    // Funzione di login
    const signIn = useCallback(async (email: string, password: string) => {
        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            })

            return { error }
        } catch (error) {
            return { error: error as AppError }
        }
    }, [supabase])

    // Funzione di registrazione
    const signUp = useCallback(async (name: string, email: string, password: string) => {
        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        name,
                    },
                },
            })

            // Se la registrazione è riuscita, crea il profilo
            if (data.user && !error) {
                const { error: profileError } = await supabase
                    .from('profiles')
                    .insert([
                        {
                            id: data.user.id,
                            name,
                            streak_count: 0,
                            last_completed_date: null,
                        },
                    ])

                if (profileError) {
                    console.error('Errore creazione profilo:', profileError)
                }
            }

            return { error }
        } catch (error) {
            return { error: error as AppError }
        }
    }, [supabase])

    // Funzione di logout
    const signOut = useCallback(async () => {
        const { error } = await supabase.auth.signOut()
        if (error) {
            console.error('Errore logout:', error)
        }
    }, [supabase])

    // Funzione per aggiornare il profilo
    const updateProfile = useCallback(async (updates: Partial<Profile>) => {
        if (!user) return { error: new Error('User not authenticated') }

        try {
            const { data, error } = await supabase
                .from('profiles')
                .update(updates)
                .eq('id', user.id)
                .select()
                .single()

            if (!error && data) {
                setProfile(data)
            }

            return { error }
        } catch (error) {
            return { error: error as AppError }
        }
    }, [supabase, user])

    const value = useMemo(() => ({
        user,
        profile,
        session,
        loading,
        signIn,
        signUp,
        signOut,
        updateProfile,
    }), [user, profile, session, loading, signIn, signUp, signOut, updateProfile])

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}

// Hook personalizzato per utilizzare l'AuthContext
export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth deve essere utilizzato all\'interno di un AuthProvider')
    }
    return context
}

// HOC per proteggere le route
export function withAuth<P extends object>(
    Component: React.ComponentType<P>
) {
    return function AuthenticatedComponent(props: P) {
        const { user, loading } = useAuth()

        if (loading) {
            return (
                <div className="min-h-screen flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
            )
        }

        if (!user) {
            // Redirect to login page
            window.location.href = '/login'
            return null
        }

        return <Component {...props} />
    }
} 