export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          name: string | null
          streak_count: number | null
          last_completed_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          name?: string | null
          streak_count?: number | null
          last_completed_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string | null
          streak_count?: number | null
          last_completed_date?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      problems: {
        Row: {
          id: number
          leetcode_number: number
          title: string
          link: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          leetcode_number: number
          title: string
          link: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          leetcode_number?: number
          title?: string
          link?: string
          created_at?: string
          updated_at?: string
        }
      }
      solved_exercises: {
        Row: {
          id: number
          user_id: string
          problem_id: number
          notes: string | null
          date_completed: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          user_id: string
          problem_id: number
          notes?: string | null
          date_completed: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          user_id?: string
          problem_id?: number
          notes?: string | null
          date_completed?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
