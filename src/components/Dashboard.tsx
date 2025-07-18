import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { BookOpen, TrendingUp, Clock, User } from 'lucide-react'

interface UserProfile {
  id: string
  email: string
  full_name: string
  created_at: string
}

interface RecommendationWithCourse {
  id: string
  score: number
  created_at: string
  preferences: any
  course: {
    id: string
    title: string
    description: string
    platform: string
    duration: string
    skill_level: string
    type: string
    category: string
    url: string
  }
}

export const Dashboard: React.FC = () => {
  const { user } = useAuth()
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [recommendations, setRecommendations] = useState<RecommendationWithCourse[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchUserProfile()
      fetchRecommendations()
    }
  }, [user])

  const fetchUserProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user?.id)
        .single()

      if (error) throw error
      setUserProfile(data)
    } catch (error) {
      console.error('Error fetching user profile:', error)
    }
  }

  const fetchRecommendations = async () => {
    try {
      const { data, error } = await supabase
        .from('recommendations')
        .select(`
          *,
          course:courses(*)
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(10)

      if (error) throw error
      setRecommendations(data || [])
    } catch (error) {
      console.error('Error fetching recommendations:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleGetRecommendations = () => {
    window.location.href = '/recommendations'
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">
          Welcome back, {userProfile?.full_name || 'User'}!
        </h1>
        <p className="mt-2 text-slate-600">
          Discover new courses tailored to your learning goals
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-lg p-6 border border-slate-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <BookOpen className="h-8 w-8 text-sky-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-500">Total Recommendations</p>
              <p className="text-2xl font-bold text-slate-900">{recommendations.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 border border-slate-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TrendingUp className="h-8 w-8 text-amber-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-500">Categories Explored</p>
              <p className="text-2xl font-bold text-slate-900">
                {new Set(recommendations.map(r => r.course.category)).size}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 border border-slate-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Clock className="h-8 w-8 text-slate-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-500">Member Since</p>
              <p className="text-2xl font-bold text-slate-900">
                {userProfile?.created_at 
                  ? new Date(userProfile.created_at).toLocaleDateString('en-US', { 
                      month: 'short', 
                      year: 'numeric' 
                    })
                  : 'N/A'
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6 border border-slate-200 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-slate-900">Get New Recommendations</h2>
          <User className="h-6 w-6 text-slate-400" />
        </div>
        <p className="text-slate-600 mb-4">
          Tell us about your learning preferences and get personalized course recommendations
          powered by machine learning algorithms.
        </p>
        <button
          onClick={handleGetRecommendations}
          className="bg-slate-900 text-white px-6 py-2 rounded-lg hover:bg-slate-800 transition-colors font-medium"
        >
          Get Recommendations
        </button>
      </div>

      {recommendations.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-6 border border-slate-200">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Your Recent Recommendations</h2>
          <div className="space-y-4">
            {recommendations.slice(0, 5).map((recommendation) => (
              <div key={recommendation.id} className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900">{recommendation.course.title}</h3>
                    <p className="text-sm text-slate-600 mt-1">{recommendation.course.platform}</p>
                    <div className="flex items-center space-x-4 mt-2">
                      <span className="text-xs bg-sky-100 text-sky-800 px-2 py-1 rounded">
                        {recommendation.course.skill_level}
                      </span>
                      <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded">
                        {recommendation.course.type}
                      </span>
                      <span className="text-xs text-slate-500">{recommendation.course.duration}</span>
                    </div>
                  </div>
                  <div className="ml-4 text-right">
                    <div className="text-sm font-medium text-slate-900">
                      {Math.round(recommendation.score * 100)}% match
                    </div>
                    <div className="text-xs text-slate-500">
                      {new Date(recommendation.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}