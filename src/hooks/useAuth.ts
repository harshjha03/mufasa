import { useEffect } from 'react'
import { sb } from '../lib/supabase'
import { useStore } from '../store/useStore'

export function useAuth() {
  const { setUser, loadUserData, setLoading } = useStore()

  useEffect(() => {
    console.log('[Mufasa] useAuth init')

    // Single source of truth — onAuthStateChange handles everything
    // including initial load, reload, OAuth redirect, and sign out
    const { data: { subscription } } = sb.auth.onAuthStateChange(async (event, session) => {
      console.log('[Mufasa] auth event:', event, session?.user?.email ?? 'no user')

      if (session?.user) {
        setUser(session.user)
        // Set session explicitly so RLS works
        await sb.auth.setSession({
          access_token: session.access_token,
          refresh_token: session.refresh_token
        })
        await loadUserData(session.user.id)
      } else {
        setUser(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])
}
