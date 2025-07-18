import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Search, BookOpen, Clock, DollarSign, BarChart } from 'lucide-react'

export const RecommendationForm: React.FC = () => {
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    category: '',
    skill_level: '',
    time_availability: '',
    course_type: '',
    description: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('http://localhost:8000/api/recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user?.id,
          preferences: formData
        })
      })

      if (!response.ok) {
        throw new Error('Failed to get recommendations')
      }

      const data = await response.json()
      
      // Redirect to results page with recommendations
      const params = new URLSearchParams({
        recommendations: JSON.stringify(data.recommendations),
        preferences: JSON.stringify(formData)
      })
      window.location.href = `/results?${params.toString()}`
    } catch (err: any) {
      setError(err.message || 'An error occurred while getting recommendations')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow-lg p-6 border border-slate-200">
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
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-slate-700 mb-2">
              <BookOpen className="h-4 w-4 inline mr-1" />
              Area of Interest
            </label>
            <select
              id="category"
              name="category"
              required
              value={formData.category}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            >
              <option value="">Select an area</option>
              <option value="AI">Artificial Intelligence</option>
              <option value="Web Dev">Web Development</option>
              <option value="Data Science">Data Science</option>
              <option value="Mobile Dev">Mobile Development</option>
              <option value="Cloud">Cloud Computing</option>
              <option value="Security">Cybersecurity</option>
              <option value="Design">UI/UX Design</option>
              <option value="DevOps">DevOps</option>
              <option value="Database">Database</option>
              <option value="Blockchain">Blockchain</option>
            </select>
          </div>

          <div>
            <label htmlFor="skill_level" className="block text-sm font-medium text-slate-700 mb-2">
              <BarChart className="h-4 w-4 inline mr-1" />
              Skill Level
            </label>
            <select
              id="skill_level"
              name="skill_level"
              required
              value={formData.skill_level}
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
            <label htmlFor="time_availability" className="block text-sm font-medium text-slate-700 mb-2">
              <Clock className="h-4 w-4 inline mr-1" />
              Time Availability
            </label>
            <select
              id="time_availability"
              name="time_availability"
              required
              value={formData.time_availability}
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

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-2">
              Additional Details (Optional)
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              value={formData.description}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              placeholder="Tell us more about what you'd like to learn..."
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 text-white py-2 px-4 rounded-md hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Getting Recommendations...
              </div>
            ) : (
              'Get Recommendations'
            )}
          </button>
        </form>
      </div>
    </div>
  )
}