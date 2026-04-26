import { useEffect } from 'react'
import { sb } from '../lib/supabase'
import { useStore } from '../store/useStore'

export function useAuth() {
  const { setUser, loadUserData, setLoading } = useStore()

  useEffect(() => {
    console.log('[Mufasa] useAuth init')

    const { data: { subscription } } = sb.auth.onAuthStateChange((event, session) => {
      console.log('[Mufasa] auth event:', event, session?.user?.email ?? 'no user')

      if (session?.user) {
        setUser(session.user)
        // Use setTimeout to run outside the lock context
        setTimeout(() => loadUserData(session.user!.id), 0)
      } else {
        setUser(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])
}
