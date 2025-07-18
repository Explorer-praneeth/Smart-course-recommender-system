import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      courses: {
        Row: {
          id: string
          title: string
          description: string
          platform: string
          duration: string
          skill_level: string
          type: string
          category: string
          url: string
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          platform: string
          duration: string
          skill_level: string
          type: string
          category: string
          url: string
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          platform?: string
          duration?: string
          skill_level?: string
          type?: string
          category?: string
          url?: string
          created_at?: string
        }
      }
      user_profiles: {
        Row: {
          id: string
          email: string
          full_name: string
          created_at: string
        }
        Insert: {
          id: string
          email: string
          full_name: string
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          created_at?: string
        }
      }
      recommendations: {
        Row: {
          id: string
          user_id: string
          course_id: string
          preferences: any
          score: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          course_id: string
          preferences: any
          score: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          course_id?: string
          preferences?: any
          score?: number
          created_at?: string
        }
      }
      feedback: {
        Row: {
          id: string
          user_id: string
          course_id: string
          rating: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          course_id: string
          rating: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          course_id?: string
          rating?: number
          created_at?: string
        }
      }
    }
  }
}