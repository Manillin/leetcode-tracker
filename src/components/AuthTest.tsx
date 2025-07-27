'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useState } from 'react'

export default function AuthTest() {
    const { user, profile, loading, signIn, signUp, signOut } = useAuth()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [name, setName] = useState('')
    const [isLogin, setIsLogin] = useState(true)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (isLogin) {
            const { error } = await signIn(email, password)
            if (error) {
                alert('Errore login: ' + error.message)
            }
        } else {
            const { error } = await signUp(name, email, password)
            if (error) {
                alert('Errore registrazione: ' + error.message)
            } else {
                alert('Registrazione completata! Controlla la tua email per confermare.')
            }
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    if (user) {
        return (
            <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
                <h2 className="text-2xl font-bold mb-4 text-green-600">✅ Autenticato!</h2>
                <div className="space-y-2 mb-4">
                    <p><strong>Email:</strong> {user.email}</p>
                    <p><strong>ID:</strong> {user.id}</p>
                    {profile && (
                        <>
                            <p><strong>Nome:</strong> {profile.name}</p>
                            <p><strong>Streak:</strong> {profile.streak_count || 0}</p>
                        </>
                    )}
                </div>
                <button
                    onClick={signOut}
                    className="w-full bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 transition-colors"
                >
                    Logout
                </button>
            </div>
        )
    }

    return (
        <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4">
                {isLogin ? '🔐 Login' : '📝 Registrazione'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
                {!isLogin && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Nome</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            required
                        />
                    </div>
                )}

                <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        required
                    />
                </div>

                <button
                    type="submit"
                    className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors"
                >
                    {isLogin ? 'Accedi' : 'Registrati'}
                </button>
            </form>

            <div className="mt-4 text-center">
                <button
                    onClick={() => setIsLogin(!isLogin)}
                    className="text-blue-500 hover:text-blue-600 underline"
                >
                    {isLogin
                        ? 'Non hai un account? Registrati'
                        : 'Hai già un account? Accedi'
                    }
                </button>
            </div>
        </div>
    )
} 