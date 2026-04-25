import { useState } from 'react'
import { sb } from '../lib/supabase'

export default function AuthScreen() {
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const handleAuth = async () => {
    setError(''); setSuccess('')
    if (!email || !password) { setError('Enter email and password.'); return }
    setLoading(true)
    try {
      if (mode === 'login') {
        const { error } = await sb.auth.signInWithPassword({ email, password })
        if (error) throw error
      } else {
        const { error } = await sb.auth.signUp({ email, password })
        if (error) throw error
        setSuccess('Account created! Signing you in...')
      }
    } catch (e: any) {
      setError(e.message || 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogle = async () => {
    setError('')
    const { error } = await sb.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin + window.location.pathname }
    })
    if (error) setError(error.message)
  }

  return (
    <div className="fixed inset-0 bg-cream flex flex-col items-center justify-center px-6 py-8 overflow-y-auto">
      <div className="font-serif text-4xl text-ink mb-1">
        Mu<span className="text-teal">fasa</span>
      </div>
      <p className="text-sm text-ink/40 mb-10">Your personal fitness & nutrition tracker</p>

      <div className="bg-white rounded-card shadow-lg p-7 w-full max-w-sm">
        {/* Tabs */}
        <div className="flex gap-1 bg-cream p-1 rounded-xl mb-6">
          {(['login', 'signup'] as const).map(m => (
            <button
              key={m}
              onClick={() => { setMode(m); setError(''); setSuccess('') }}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${mode === m ? 'bg-white text-ink shadow-sm' : 'text-ink/40'}`}
            >
              {m === 'login' ? 'Sign In' : 'Sign Up'}
            </button>
          ))}
        </div>

        <input
          className="w-full bg-cream border-2 border-cream-3 text-ink font-sans text-base px-4 py-3 rounded-xl outline-none mb-3 focus:border-teal transition-colors"
          type="email" placeholder="Email address" value={email}
          onChange={e => setEmail(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && document.getElementById('pw-input')?.focus()}
        />
        <input
          id="pw-input"
          className="w-full bg-cream border-2 border-cream-3 text-ink font-sans text-base px-4 py-3 rounded-xl outline-none mb-1 focus:border-teal transition-colors"
          type="password" placeholder="Password" value={password}
          onChange={e => setPassword(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAuth()}
        />

        <button
          onClick={handleAuth}
          disabled={loading}
          className="w-full bg-teal text-white font-bold text-base py-3.5 rounded-xl mt-3 disabled:opacity-50 transition-opacity active:opacity-80"
        >
          {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
        </button>

        {error && <p className="text-danger text-xs text-center mt-3">{error}</p>}
        {success && <p className="text-teal text-xs text-center mt-3">{success}</p>}

        <div className="flex items-center gap-3 my-4">
          <div className="flex-1 h-px bg-cream-3" />
          <span className="text-xs text-ink/30 font-semibold">OR</span>
          <div className="flex-1 h-px bg-cream-3" />
        </div>

        <button
          onClick={handleGoogle}
          className="w-full bg-white border-2 border-cream-3 text-ink font-semibold text-sm py-3 rounded-xl flex items-center justify-center gap-2.5 hover:border-teal transition-colors active:opacity-80"
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>
      </div>
    </div>
  )
}
