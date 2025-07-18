import React, { useState } from 'react'
import { BookOpen, Search, Star, ExternalLink, Clock, DollarSign, BarChart } from 'lucide-react'

interface Course {
  title: string
  description: string
  platform: string
  duration: string
  level: string
  type: string
  link: string
  score: number
}

interface FormData {
  interest: string
  skill: string
  duration: string
  course_type: string
}

function App() {
  const [formData, setFormData] = useState<FormData>({
    interest: '',
    skill: '',
    duration: '',
    course_type: ''
  })
  const [recommendations, setRecommendations] = useState<Course[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setRecommendations([])

    try {
      console.log('Sending request to backend:', formData)
      
      const response = await fetch('http://localhost:8000/recommend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })

      console.log('Response status:', response.status)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log('Received data:', data)
      
      setRecommendations(data.recommendations || [])
    } catch (err: any) {
      console.error('Error fetching recommendations:', err)
      setError(err.message || 'Failed to get recommendations. Make sure the backend is running on port 8000.')
    } finally {
      setLoading(false)
    }
  }

  const getTypeColor = (type: string) => {
    return type.toLowerCase() === 'free' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
  }

  const getSkillColor = (skill: string) => {
    switch (skill.toLowerCase()) {
      case 'beginner': return 'bg-yellow-100 text-yellow-800'
      case 'intermediate': return 'bg-orange-100 text-orange-800'
      case 'advanced': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-sky-50">
      {/* Header */}
      <nav className="bg-slate-900 shadow-lg border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-sky-400" />
              <span className="ml-2 text-xl font-bold text-white">
                Smart Course Recommender
              </span>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Form Section */}
        <div className="bg-white rounded-lg shadow-lg p-6 border border-slate-200 mb-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-slate-900 flex items-center">
              <Search className="h-6 w-6 mr-2 text-sky-500" />
              Get Course Recommendations
            </h1>
            <p className="mt-2 text-slate-600">
              Tell us about your learning preferences and we'll recommend the best courses for you
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="interest" className="block text-sm font-medium text-slate-700 mb-2">
                  <BookOpen className="h-4 w-4 inline mr-1" />
                  Area of Interest
                </label>
                <input
                  type="text"
                  id="interest"
                  name="interest"
                  required
                  value={formData.interest}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                  placeholder="e.g., Machine Learning, Web Development, Data Science"
                />
              </div>

              <div>
                <label htmlFor="skill" className="block text-sm font-medium text-slate-700 mb-2">
                  <BarChart className="h-4 w-4 inline mr-1" />
                  Skill Level
                </label>
                <select
                  id="skill"
                  name="skill"
                  required
                  value={formData.skill}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                >
                  <option value="">Select skill level</option>
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>

              <div>
                <label htmlFor="duration" className="block text-sm font-medium text-slate-700 mb-2">
                  <Clock className="h-4 w-4 inline mr-1" />
                  Time Availability
                </label>
                <select
                  id="duration"
                  name="duration"
                  required
                  value={formData.duration}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                >
                  <option value="">Select time availability</option>
                  <option value="Short Term">Short Term (1-6 weeks)</option>
                  <option value="Long Term">Long Term (6+ weeks)</option>
                </select>
              </div>

              <div>
                <label htmlFor="course_type" className="block text-sm font-medium text-slate-700 mb-2">
                  <DollarSign className="h-4 w-4 inline mr-1" />
                  Course Type
                </label>
                <select
                  id="course_type"
                  name="course_type"
                  required
                  value={formData.course_type}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                >
                  <option value="">Select course type</option>
                  <option value="Free">Free</option>
                  <option value="Paid">Paid</option>
                  <option value="Both">Both</option>
                </select>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 text-white py-3 px-4 rounded-md hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Getting Recommendations...
                </div>
              ) : (
                'Get Recommendations'
              )}
            </button>
          </form>
        </div>

        {/* Results Section */}
        {recommendations.length > 0 && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-lg p-6 border border-slate-200">
              <h2 className="text-xl font-bold text-slate-900 mb-4">
                Recommended Courses for You
              </h2>
              <div className="bg-sky-50 border border-sky-200 rounded-lg p-4 mb-6">
                <p className="text-sky-800 font-medium">Based on your preferences:</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <span className="bg-sky-100 text-sky-800 px-2 py-1 rounded text-sm">
                    {formData.interest}
                  </span>
                  <span className="bg-sky-100 text-sky-800 px-2 py-1 rounded text-sm">
                    {formData.skill}
                  </span>
                  <span className="bg-sky-100 text-sky-800 px-2 py-1 rounded text-sm">
                    {formData.duration}
                  </span>
                  <span className="bg-sky-100 text-sky-800 px-2 py-1 rounded text-sm">
                    {formData.course_type}
                  </span>
                </div>
              </div>
            </div>

            {recommendations.map((course, index) => (
              <div key={index} className="bg-white rounded-lg shadow-lg border border-slate-200 p-6 hover:shadow-xl transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="flex items-center">
                        <Star className="h-5 w-5 text-amber-500 fill-current" />
                        <span className="ml-1 text-sm font-medium text-slate-700">
                          {Math.round(course.score * 100)}% match
                        </span>
                      </div>
                      <span className="text-slate-300">•</span>
                      <span className="text-sm text-slate-500">Rank #{index + 1}</span>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">
                      {course.title}
                    </h3>
                    <p className="text-slate-600 mb-4">{course.description}</p>
                    
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="flex items-center text-slate-600">
                        <ExternalLink className="h-4 w-4 mr-1" />
                        <span className="font-medium">{course.platform}</span>
                      </div>
                      <div className="flex items-center text-slate-600">
                        <Clock className="h-4 w-4 mr-1" />
                        <span>{course.duration}</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 mb-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getSkillColor(course.level)}`}>
                        {course.level}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getTypeColor(course.type)}`}>
                        <DollarSign className="h-3 w-3 inline mr-1" />
                        {course.type}
                      </span>
                    </div>

                    <a
                      href={course.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center bg-slate-900 text-white px-4 py-2 rounded-md hover:bg-slate-800 transition-colors text-sm font-medium"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View Course
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default App