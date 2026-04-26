import { useEffect } from 'react'
import { sb } from '../lib/supabase'
import { useStore } from '../store/useStore'

export function useAuth() {
  const { setUser, loadUserData, setLoading } = useStore()

  useEffect(() => {
    let booted = false

    console.log('[Mufasa] useAuth init')

    // First — immediately check session directly, don't wait for event
    sb.auth.getSession().then(async ({ data: { session }, error }) => {
      console.log('[Mufasa] getSession result:', session?.user?.email ?? 'no session', error?.message ?? 'no error')
      if (booted) return
      booted = true
      if (session?.user) {
        setUser(session.user)
        await loadUserData(session.user.id)
      } else {
        setLoading(false)
      }
    }).catch(err => {
      console.log('[Mufasa] getSession error:', err)
      if (!booted) { booted = true; setLoading(false) }
    })

    // Also listen for changes (handles OAuth redirect, sign in, sign out)
    const { data: { subscription } } = sb.auth.onAuthStateChange(async (event, session) => {
      console.log('[Mufasa] auth event:', event, session?.user?.email ?? 'no user')
      if (event === 'SIGNED_OUT') {
        booted = true
        setUser(null)
        setLoading(false)
        return
      }
      if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session?.user && !booted) {
        booted = true
        setUser(session.user)
        await loadUserData(session.user.id)
      }
    })

    // Safety net — 10 seconds max
    const safety = setTimeout(() => {
      if (!booted) {
        console.log('[Mufasa] safety net triggered')
        booted = true
        setLoading(false)
      }
    }, 10000)

    return () => {
      subscription.unsubscribe()
      clearTimeout(safety)
    }
  }, [])
}