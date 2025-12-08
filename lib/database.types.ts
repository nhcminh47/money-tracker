export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      accounts: {
        Row: {
          id: string
          user_id: string
          name: string
          type: string
          currency: string
          icon: string
          created_at: string
          updated_at: string
          deleted: boolean
          device_id: string | null
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          type: string
          currency: string
          icon: string
          created_at?: string
          updated_at?: string
          deleted?: boolean
          device_id?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          type?: string
          currency?: string
          icon?: string
          created_at?: string
          updated_at?: string
          deleted?: boolean
          device_id?: string | null
        }
      }
      transactions: {
        Row: {
          id: string
          user_id: string
          account_id: string
          category_id: string | null
          type: string
          amount: string
          currency: string
          notes: string
          date: string
          recurring: boolean
          to_account_id: string | null
          cleared: boolean
          deleted: boolean
          created_at: string
          updated_at: string
          device_id: string | null
        }
        Insert: {
          id?: string
          user_id: string
          account_id: string
          category_id?: string | null
          type: string
          amount: string | number
          currency: string
          notes?: string
          date: string
          recurring?: boolean
          to_account_id?: string | null
          cleared?: boolean
          deleted?: boolean
          created_at?: string
          updated_at?: string
          device_id?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          account_id?: string
          category_id?: string | null
          type?: string
          amount?: string | number
          currency?: string
          notes?: string
          date?: string
          recurring?: boolean
          to_account_id?: string | null
          cleared?: boolean
          deleted?: boolean
          created_at?: string
          updated_at?: string
          device_id?: string | null
        }
      }
      categories: {
        Row: {
          id: string
          user_id: string
          name: string
          type: string
          color: string
          icon: string
          parent_id: string | null
          deleted: boolean
          created_at: string
          updated_at: string
          device_id: string | null
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          type: string
          color: string
          icon: string
          parent_id?: string | null
          deleted?: boolean
          created_at?: string
          updated_at?: string
          device_id?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          type?: string
          color?: string
          icon?: string
          parent_id?: string | null
          deleted?: boolean
          created_at?: string
          updated_at?: string
          device_id?: string | null
        }
      }
      budgets: {
        Row: {
          id: string
          user_id: string
          category_id: string
          amount: string
          period: string
          deleted: boolean
          created_at: string
          updated_at: string
          device_id: string | null
        }
        Insert: {
          id?: string
          user_id: string
          category_id: string
          amount: string | number
          period: string
          deleted?: boolean
          created_at?: string
          updated_at?: string
          device_id?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          category_id?: string
          amount?: string | number
          period?: string
          deleted?: boolean
          created_at?: string
          updated_at?: string
          device_id?: string | null
        }
      }
      settings: {
        Row: {
          id: string
          user_id: string
          currency: string
          date_format: string
          theme: string
          language: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          currency?: string
          date_format?: string
          theme?: string
          language?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          currency?: string
          date_format?: string
          theme?: string
          language?: string
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
