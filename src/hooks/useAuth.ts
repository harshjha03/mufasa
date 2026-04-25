import { useEffect } from 'react'
import { sb } from '../lib/supabase'
import { useStore } from '../store/useStore'

export function useAuth() {
  const { setUser, loadUserData, setLoading } = useStore()

  useEffect(() => {
    let booted = false

    const { data: { subscription } } = sb.auth.onAuthStateChange(async (event, session) => {
      if (
        (event === 'SIGNED_IN' || event === 'INITIAL_SESSION' || event === 'TOKEN_REFRESHED')
        && session?.user && !booted
      ) {
        booted = true
        setUser(session.user)
        // Check if account is deactivated before loading
        const { data: profileCheck } = await sb
          .from('profiles')
          .select('deactivated, deactivated_at')
          .eq('user_id', session.user.id)
          .single()
        if (profileCheck?.deactivated) {
          // Account deactivated — set user but mark as deactivated
          setLoading(false)
          // Store will handle showing recovery screen via profile.deactivated
        }
        await loadUserData(session.user.id)
      } else if (event === 'SIGNED_OUT') {
        booted = false
        setUser(null)
        setLoading(false)
      }
    })

    // Fallback
    const timer = setTimeout(async () => {
      if (!booted) {
        const { data: { session } } = await sb.auth.getSession()
        if (session?.user) {
          booted = true
          setUser(session.user)
          await loadUserData(session.user.id)
        } else {
          setLoading(false)
        }
      }
    }, 1500)

    return () => {
      subscription.unsubscribe()
      clearTimeout(timer)
    }
  }, [])
}
