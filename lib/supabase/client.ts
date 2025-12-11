import type { Database } from '@/lib/database.types'
import { createBrowserClient } from '@supabase/ssr'

// Custom storage adapter that respects "Remember Me" preference
const createStorageAdapter = () => {
  return {
    getItem: (key: string) => {
      // Check if user wants session-only storage
      const sessionOnly = sessionStorage.getItem('sessionOnly') === 'true'
      if (sessionOnly) {
        return sessionStorage.getItem(key)
      }
      return localStorage.getItem(key)
    },
    setItem: (key: string, value: string) => {
      const sessionOnly = sessionStorage.getItem('sessionOnly') === 'true'
      if (sessionOnly) {
        sessionStorage.setItem(key, value)
      } else {
        localStorage.setItem(key, value)
      }
    },
    removeItem: (key: string) => {
      localStorage.removeItem(key)
      sessionStorage.removeItem(key)
    },
  }
}

export function createClient() {
  return createBrowserClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    auth: {
      storage: createStorageAdapter(),
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: 'pkce', // More secure and works better with Safari
    },
  })
}

// Singleton instance for client-side usage
export const supabase = createClient()

// Helper to get current user
export const getCurrentUser = async () => {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error) throw error
  return user
}

// Helper to check if user is authenticated
export const isAuthenticated = async () => {
  const {
    data: { session },
  } = await supabase.auth.getSession()
  return !!session
}
