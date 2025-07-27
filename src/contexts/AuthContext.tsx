'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
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

    let supabase
    try {
        supabase = createSupabaseClient()
    } catch (error) {
        console.error('Errore nella creazione del client Supabase:', error)
        setLoading(false)
        throw error
    }

    // Carica il profilo utente (memoizzata)
    const loadProfile = useCallback(async (userId: string) => {
        try {
            // Timeout di 5 secondi per evitare blocchi infiniti  
            const queryPromise = supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single()

            const timeoutPromise = new Promise<never>((_, reject) =>
                setTimeout(() => reject(new Error('Query timeout')), 5000)
            )

            const result = await Promise.race([queryPromise, timeoutPromise])
            const { data, error } = result

            if (error && error.code !== 'PGRST116') {
                console.error('Errore nel caricamento del profilo:', error)
                // Continua comunque invece di bloccarsi
                setProfile(null)
                return
            }

            setProfile(data || null)
        } catch (error) {
            console.error('Errore nel caricamento del profilo:', error)
            // Imposta profilo a null invece di bloccarsi
            setProfile(null)
        }
    }, [supabase])

    // Inizializzazione e gestione dello stato auth
    useEffect(() => {
        // Ottieni la sessione iniziale
        const getInitialSession = async () => {
            try {
                const { data: { session }, error } = await supabase.auth.getSession()

                if (error) {
                    console.error('Errore nel recupero della sessione:', error)
                }

                setSession(session)
                setUser(session?.user ?? null)

                if (session?.user) {
                    await loadProfile(session.user.id)
                }

                setLoading(false)
            } catch (error) {
                console.error('Errore nell\'inizializzazione della sessione:', error)
                setLoading(false)
            }
        }

        getInitialSession()

        // Ascolta i cambiamenti di auth
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                setSession(session)
                setUser(session?.user ?? null)

                if (session?.user) {
                    await loadProfile(session.user.id)
                } else {
                    setProfile(null)
                }

                setLoading(false)
            }
        )

        return () => {
            subscription.unsubscribe()
        }
    }, [supabase.auth, loadProfile])

    // Funzione di login
    const signIn = async (email: string, password: string) => {
        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            })

            return { error }
        } catch (error) {
            return { error: error as AppError }
        }
    }

    // Funzione di registrazione
    const signUp = async (name: string, email: string, password: string) => {
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
    }

    // Funzione di logout
    const signOut = async () => {
        const { error } = await supabase.auth.signOut()
        if (error) {
            console.error('Errore logout:', error)
        }
    }

    // Funzione per aggiornare il profilo
    const updateProfile = async (updates: Partial<Profile>) => {
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
    }

    const value = {
        user,
        profile,
        session,
        loading,
        signIn,
        signUp,
        signOut,
        updateProfile,
    }

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