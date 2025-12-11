'use client'

import { db } from '@/lib/db'
import { sync } from '@/lib/services/sync'
import { supabase } from '@/lib/supabase/client'
import { AuthError, Session, User } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import React, { createContext, useContext, useEffect, useState } from 'react'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signUp: (email: string, password: string) => Promise<{ error: AuthError | null }>
  signIn: (email: string, password: string, rememberMe?: boolean) => Promise<{ error: AuthError | null }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)

      // Handle auth events
      if (event === 'SIGNED_IN' && session?.user) {
        // Sync data with server on sign in (pull remote data)
        console.log('User signed in, syncing data from server...')
        try {
          await sync()
        } catch (error) {
          console.error('Failed to sync on sign in:', error)
        }
      } else if (event === 'SIGNED_OUT') {
        // Clear local database on sign out
        console.log('User signed out, clearing local data...')
        try {
          await db.accounts.clear()
          await db.transactions.clear()
          await db.categories.clear()
          await db.budgets.clear()
          await db.changelog.clear()
        } catch (error) {
          console.error('Failed to clear local data:', error)
        }
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    return { error }
  }

  const signIn = async (email: string, password: string, rememberMe: boolean = false) => {
    // Set session storage preference before signing in
    if (rememberMe) {
      // Use localStorage for persistent sessions
      sessionStorage.removeItem('sessionOnly')
      localStorage.setItem('rememberMe', 'true')
    } else {
      // Use sessionStorage for session-only (clears on browser close)
      sessionStorage.setItem('sessionOnly', 'true')
      localStorage.removeItem('rememberMe')
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (!error) {
      router.push('/')
    }
    return { error }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
