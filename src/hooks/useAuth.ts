import { useEffect } from 'react'
import { sb } from '../lib/supabase'
import { useStore } from '../store/useStore'

export function useAuth() {
  const { setUser, loadUserData, setLoading, loadAnonData } = useStore()

  useEffect(() => {

    const { data: { subscription } } = sb.auth.onAuthStateChange((event, session) => {

      if (session?.user) {
        setUser(session.user)
        setTimeout(() => loadUserData(session.user!.id), 0)
      } else {
        loadAnonData()
        setUser(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])
}
