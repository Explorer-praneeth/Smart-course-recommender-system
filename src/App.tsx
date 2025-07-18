import React, { useState } from 'react'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { Layout } from './components/Layout'
import { SignIn } from './components/Auth/SignIn'
import { SignUp } from './components/Auth/SignUp'
import { Dashboard } from './components/Dashboard'
import { RecommendationForm } from './components/RecommendationForm'
import { RecommendationResults } from './components/RecommendationResults'

const AppContent: React.FC = () => {
  const { user, loading } = useAuth()
  const [isSignUp, setIsSignUp] = useState(false)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-sky-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
      </div>
    )
  }

  if (!user) {
    return isSignUp ? (
      <SignUp onToggle={() => setIsSignUp(false)} />
    ) : (
      <SignIn onToggle={() => setIsSignUp(true)} />
    )
  }

  const currentPath = window.location.pathname

  return (
    <Layout>
      {currentPath === '/recommendations' && <RecommendationForm />}
      {currentPath === '/results' && <RecommendationResults />}
      {currentPath === '/dashboard' || currentPath === '/' ? <Dashboard /> : null}
    </Layout>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App