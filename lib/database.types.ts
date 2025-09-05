export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    tables: {
      // Add your tables here
      profiles: {
        Row: {
          id: string
          updated_at?: string
          username?: string
          full_name?: string
          avatar_url?: string
          email?: string
        }
        Insert: {
          id: string
          updated_at?: string
          username?: string
          full_name?: string
          avatar_url?: string
          email?: string
        }
        Update: {
          id?: string
          updated_at?: string
          username?: string
          full_name?: string
          avatar_url?: string
          email?: string
        }
      }
      // Add more tables as needed
    }
    views: {
      [_ in never]: never
    }
    functions: {
      [_ in never]: never
    }
    enums: {
      [_ in never]: never
    }
  }
}