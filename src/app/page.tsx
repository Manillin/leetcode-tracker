'use client'

import { useAuth } from '@/contexts/AuthContext'
import AuthTest from '@/components/AuthTest'

export default function Home() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="ml-4 text-gray-600">Caricamento...</p>
      </div>
    )
  }

  // Mostra sempre la pagina di login/registrazione per ora
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
          LeetCode Tracker
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Traccia i tuoi progressi e mantieni la motivazione!
        </p>

        {user && (
          <div className="text-center mb-4">
            <p className="text-green-600 font-medium">Utente autenticato: {user.email}</p>
            <a href="/profile" className="text-blue-600 hover:underline">
              Vai al Profilo →
            </a>
          </div>
        )}

        <AuthTest />
      </div>
    </div>
  )
}
