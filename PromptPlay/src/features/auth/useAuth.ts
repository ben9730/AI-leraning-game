import { useState, useEffect } from 'react'
import { Session } from '@supabase/supabase-js'
import { supabase } from '@/src/lib/supabase'
import { syncProgressToCloud, restoreProgressFromCloud } from './syncProgress'

interface UseAuthReturn {
  session: Session | null
  loading: boolean
  error: string | null
  signUp: (email: string, password: string) => Promise<{ error: string | null }>
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
}

export function useAuth(): UseAuthReturn {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Check for existing session on mount
    supabase.auth.getSession().then(({ data: { session: existingSession } }) => {
      setSession(existingSession)
      setLoading(false)
    })

    // Subscribe to auth state changes (token refresh, sign-out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
      setLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const signUp = async (email: string, password: string): Promise<{ error: string | null }> => {
    setLoading(true)
    setError(null)
    const { data, error: authError } = await supabase.auth.signUp({ email, password })
    setLoading(false)
    if (authError) {
      setError(authError.message)
      return { error: authError.message }
    }
    if (data.session) {
      // Push local progress to cloud after sign-up
      await syncProgressToCloud(data.session.user.id)
    }
    return { error: null }
  }

  const signIn = async (email: string, password: string): Promise<{ error: string | null }> => {
    setLoading(true)
    setError(null)
    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (authError) {
      setError(authError.message)
      return { error: authError.message }
    }
    if (data.session) {
      // Restore cloud progress (only on fresh install), then push local state
      await restoreProgressFromCloud(data.session.user.id)
      await syncProgressToCloud(data.session.user.id)
    }
    return { error: null }
  }

  const signOut = async (): Promise<void> => {
    setError(null)
    await supabase.auth.signOut()
    // Local progress intentionally kept (local-first principle)
  }

  return { session, loading, error, signUp, signIn, signOut }
}
