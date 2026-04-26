import { useEffect } from 'react'
import { sb } from '../lib/supabase'
import { useStore } from '../store/useStore'

export function useAuth() {
  const { setUser, loadUserData, setLoading } = useStore()

  useEffect(() => {
    let booted = false

    console.log('[Mufasa] useAuth init')

    const boot = async (userId: string, accessToken: string, refreshToken: string) => {
      if (booted) return
      booted = true
      await sb.auth.setSession({ access_token: accessToken, refresh_token: refreshToken })
      await loadUserData(userId)
    }

    // Always check session directly on mount — handles reload case
    sb.auth.getSession().then(async ({ data: { session } }) => {
      console.log('[Mufasa] getSession:', session?.user?.email ?? 'no session')
      if (session?.user) {
        setUser(session.user)
        await boot(session.user.id, session.access_token, session.refresh_token)
      } else {
        if (!booted) { booted = true; setLoading(false) }
      }
    }).catch(() => {
      if (!booted) { booted = true; setLoading(false) }
    })

    // Listen for auth changes — handles sign in, sign out, token refresh
    const { data: { subscription } } = sb.auth.onAuthStateChange(async (event, session) => {
      console.log('[Mufasa] auth event:', event, session?.user?.email ?? 'no user')
      if (event === 'SIGNED_OUT') {
        booted = false
        setUser(null)
        setLoading(false)
        return
      }
      // Only boot from here if getSession didn't already boot
      if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session?.user && !booted) {
        setUser(session.user)
        await boot(session.user.id, session.access_token, session.refresh_token)
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
