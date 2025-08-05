'use client'

import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'

export default function Home() {
  const { user, loading, signOut } = useAuth()

  const handleLogout = async () => {
    await signOut()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="flex items-center space-x-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="text-gray-600 font-medium">Caricamento...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navbar */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-white/20 sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                LeetCode <span className="text-blue-600">Tracker</span>
              </h2>
            </div>

            {/* Navigation */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              {user ? (
                // User is logged in
                <>
                  <span className="hidden sm:block text-sm text-gray-600">
                    Ciao, <strong>{user.email?.split('@')[0]}</strong>
                  </span>
                  <Link
                    href="/profile"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
                  >
                    Profilo
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="text-gray-600 hover:text-gray-800 px-2 sm:px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
                  >
                    Logout
                  </button>
                </>
              ) : (
                // User is not logged in
                <>
                  <Link
                    href="/login"
                    className="text-gray-600 hover:text-gray-800 px-2 sm:px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
                  >
                    Accedi
                  </Link>
                  <Link
                    href="/register"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
                  >
                    Registrati
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            Traccia i Tuoi Progressi
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Monitora i tuoi progressi su LeetCode, mantieni la motivazione con le streak
            e raggiungi i tuoi obiettivi di programmazione
          </p>
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-6 sm:gap-8 mb-12">
          <div className="bg-white rounded-xl p-8 shadow-lg">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Traccia Progressi</h3>
            <p className="text-gray-600">
              Registra tutti i problemi risolti con note, categorie e data di completamento
            </p>
          </div>

          <div className="bg-white rounded-xl p-8 shadow-lg">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Mantieni le Streak</h3>
            <p className="text-gray-600">
              Sistema di streak giornaliere per mantenere alta la motivazione
            </p>
          </div>

          <div className="bg-white rounded-xl p-8 shadow-lg">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Organizza Categorie</h3>
            <p className="text-gray-600">
              Classifica i problemi per categorie e tag per un apprendimento strutturato
            </p>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          {user ? (
            // User is logged in - Show welcome message
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 shadow-lg max-w-lg mx-auto">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Bentornato!
              </h3>
              <p className="text-gray-600">
                Pronto per risolvere nuovi esercizi?
              </p>
            </div>
          ) : (
            // User is not logged in - Show benefits
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 shadow-lg max-w-lg mx-auto">
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                Inizia il Tuo Percorso
              </h3>
              <p className="text-gray-600 mb-6">
                Unisciti a migliaia di sviluppatori che stanno migliorando le loro competenze ogni giorno (lo giuro)
              </p>
              <div className="flex items-center justify-center space-x-8 text-sm text-gray-500">
                <div className="text-center">
                  <div className="font-bold text-lg text-gray-900">100%</div>
                  <div>Gratuito</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-lg text-gray-900">∞</div>
                  <div>Esercizi</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-lg text-gray-900">📈</div>
                  <div>Progressi</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-gray-500 text-sm">
          <p>© 2024 LeetCode Tracker. In realtà non esiste nessun tipo di trademark lol.</p>
        </div>
      </div>
    </div>
  )
}
