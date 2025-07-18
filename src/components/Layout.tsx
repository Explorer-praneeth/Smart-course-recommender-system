import React from 'react'
import { useAuth } from '../contexts/AuthContext'
import { LogOut, BookOpen } from 'lucide-react'

interface LayoutProps {
  children: React.ReactNode
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, signOut } = useAuth()

  const handleSignOut = async () => {
    try {
      await signOut()
      window.location.href = '/'
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-sky-50">
      {user && (
        <nav className="bg-slate-900 shadow-lg border-b border-slate-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <BookOpen className="h-8 w-8 text-sky-400" />
                <span className="ml-2 text-xl font-bold text-white">
                  Smart Course Recommender
                </span>
              </div>
              <div className="flex items-center space-x-4">
                <a
                  href="/dashboard"
                  className="text-slate-300 hover:text-sky-400 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Dashboard
                </a>
                <a
                  href="/recommendations"
                  className="text-slate-300 hover:text-sky-400 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Get Recommendations
                </a>
                <button
                  onClick={handleSignOut}
                  className="flex items-center text-slate-300 hover:text-amber-400 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  <LogOut className="h-4 w-4 mr-1" />
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </nav>
      )}
      <main className="flex-1">
        {children}
      </main>
    </div>
  )
}