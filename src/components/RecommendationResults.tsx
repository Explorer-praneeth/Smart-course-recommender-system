import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { ThumbsUp, ThumbsDown, ExternalLink, Star, Clock, DollarSign } from 'lucide-react'

interface Course {
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

interface Recommendation {
  course: Course
  score: number
}

export const RecommendationResults: React.FC = () => {
  const { user } = useAuth()
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [preferences, setPreferences] = useState<any>({})
  const [feedback, setFeedback] = useState<{ [key: string]: number }>({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const recommendationsData = params.get('recommendations')
    const preferencesData = params.get('preferences')

    if (recommendationsData) {
      setRecommendations(JSON.parse(recommendationsData))
    }
    if (preferencesData) {
      setPreferences(JSON.parse(preferencesData))
    }
  }, [])

  const handleFeedback = async (courseId: string, rating: number) => {
    if (!user) return

    setLoading(true)
    try {
      const { error } = await supabase
        .from('feedback')
        .upsert({
          user_id: user.id,
          course_id: courseId,
          rating: rating
        }, {
          onConflict: 'user_id,course_id'
        })

      if (error) throw error

      setFeedback(prev => ({ ...prev, [courseId]: rating }))
    } catch (error) {
      console.error('Error submitting feedback:', error)
    } finally {
      setLoading(false)
    }
  }

  const getTypeColor = (type: string) => {
    return type === 'Free' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
  }

  const getSkillColor = (skill: string) => {
    switch (skill) {
      case 'Beginner': return 'bg-yellow-100 text-yellow-800'
      case 'Intermediate': return 'bg-orange-100 text-orange-800'
      case 'Advanced': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (recommendations.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-lg p-6 border border-slate-200 text-center">
          <p className="text-slate-600">No recommendations found. Please try again.</p>
          <a
            href="/recommendations"
            className="mt-4 inline-block bg-slate-900 text-white px-4 py-2 rounded-md hover:bg-slate-800 transition-colors"
          >
            Get New Recommendations
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-4">
          Your Course Recommendations
        </h1>
        <div className="bg-sky-50 border border-sky-200 rounded-lg p-4">
          <p className="text-sky-800 font-medium">Based on your preferences:</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <span className="bg-sky-100 text-sky-800 px-2 py-1 rounded text-sm">
              {preferences.category}
            </span>
            <span className="bg-sky-100 text-sky-800 px-2 py-1 rounded text-sm">
              {preferences.skill_level}
            </span>
            <span className="bg-sky-100 text-sky-800 px-2 py-1 rounded text-sm">
              {preferences.time_availability}
            </span>
            <span className="bg-sky-100 text-sky-800 px-2 py-1 rounded text-sm">
              {preferences.course_type}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {recommendations.map((rec, index) => (
          <div key={rec.course.id} className="bg-white rounded-lg shadow-lg border border-slate-200 p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="flex items-center">
                    <Star className="h-5 w-5 text-amber-500 fill-current" />
                    <span className="ml-1 text-sm font-medium text-slate-700">
                      {Math.round(rec.score * 100)}% match
                    </span>
                  </div>
                  <span className="text-slate-300">•</span>
                  <span className="text-sm text-slate-500">Rank #{index + 1}</span>
                </div>
                <h2 className="text-xl font-bold text-slate-900 mb-2">
                  {rec.course.title}
                </h2>
                <p className="text-slate-600 mb-4">{rec.course.description}</p>
                
                <div className="flex items-center space-x-4 mb-4">
                  <div className="flex items-center text-slate-600">
                    <ExternalLink className="h-4 w-4 mr-1" />
                    <span className="font-medium">{rec.course.platform}</span>
                  </div>
                  <div className="flex items-center text-slate-600">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>{rec.course.duration}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 mb-4">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getSkillColor(rec.course.skill_level)}`}>
                    {rec.course.skill_level}
                  </span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getTypeColor(rec.course.type)}`}>
                    <DollarSign className="h-3 w-3 inline mr-1" />
                    {rec.course.type}
                  </span>
                  <span className="bg-slate-100 text-slate-800 px-2 py-1 rounded text-xs font-medium">
                    {rec.course.category}
                  </span>
                </div>

                <div className="flex items-center space-x-4">
                  <a
                    href={rec.course.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-slate-900 text-white px-4 py-2 rounded-md hover:bg-slate-800 transition-colors text-sm font-medium"
                  >
                    View Course
                  </a>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleFeedback(rec.course.id, 1)}
                      disabled={loading}
                      className={`p-2 rounded-full transition-colors ${
                        feedback[rec.course.id] === 1
                          ? 'bg-sky-100 text-sky-600'
                          : 'bg-slate-100 text-slate-600 hover:bg-sky-100 hover:text-sky-600'
                      }`}
                    >
                      <ThumbsUp className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleFeedback(rec.course.id, -1)}
                      disabled={loading}
                      className={`p-2 rounded-full transition-colors ${
                        feedback[rec.course.id] === -1
                          ? 'bg-amber-100 text-amber-600'
                          : 'bg-slate-100 text-slate-600 hover:bg-amber-100 hover:text-amber-600'
                      }`}
                    >
                      <ThumbsDown className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 text-center">
        <a
          href="/recommendations"
          className="bg-slate-900 text-white px-6 py-3 rounded-md hover:bg-slate-800 transition-colors font-medium"
        >
          Get New Recommendations
        </a>
      </div>
    </div>
  )
}