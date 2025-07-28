// Costanti per categorie e tag
export const PRIMARY_CATEGORIES = [
  'Array & Hashing',
  'Two Pointers',
  'Sliding Window',
  'Stack',
  'Binary Search',
  'Linked Lists',
  'Trees',
  'Tries',
  'Heap / Priority Queue',
  'Backtracking',
  'Graphs',
  'Advanced Graphs',
  'Dynamic Programming',
  'Greedy',
  'Intervals',
  'Math & Geometry',
  'Bit Manipulation'
] as const

export const ADDITIONAL_TAGS = [
  'Recursion',
  'DFS',
  'BFS',
  'Memoization',
  'Binary Tree',
  'Binary Search Tree',
  'Sorting',
  'String Manipulation',
  'Matrix',
  'Hash Map',
  'Queue',
  'Deque',
  'Union Find',
  'Divide & Conquer',
  'Prefix Sum',
  'Monotonic Stack',
  'Trie',
  'Segment Tree',
  'Fenwick Tree'
] as const

export type PrimaryCategory = typeof PRIMARY_CATEGORIES[number]
export type AdditionalTag = typeof ADDITIONAL_TAGS[number]

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
          primary_category: string
          additional_tags: string[] | null
        }
        Insert: {
          id?: number
          user_id: string
          problem_id: number
          notes?: string | null
          date_completed: string
          primary_category: string
          additional_tags?: string[] | null
        }
        Update: {
          id?: number
          user_id?: string
          problem_id?: number
          notes?: string | null
          date_completed?: string
          primary_category?: string
          additional_tags?: string[] | null
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
