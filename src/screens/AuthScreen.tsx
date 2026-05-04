import { sb } from '../lib/supabase'

export default function AuthScreen() {
  const handleGoogle = async () => {
    await sb.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin }
    })
  }

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center px-6"
      style={{background: 'linear-gradient(160deg, #2A1F14 0%, #6B4F28 100%)'}}>

      {/* Logo */}
      <img src="/icon-512.png" alt="Mufasa" className="w-28 h-28 rounded-3xl mb-6 shadow-2xl" />
      <h1 className="font-serif text-5xl text-white font-bold mb-2">Mufasa</h1>
      <p className="text-sm text-white/50 mb-12 text-center leading-relaxed">
        Your AI-powered personal fitness coach
      </p>

      {/* Google Sign In */}
      <button onClick={handleGoogle}
        className="w-full max-w-xs flex items-center justify-center gap-3 bg-white text-ink font-bold text-base py-4 rounded-2xl shadow-lg active:opacity-80 transition-opacity mb-4">
        <svg width="20" height="20" viewBox="0 0 48 48">
          <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
          <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
          <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
          <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          <path fill="none" d="M0 0h48v48H0z"/>
        </svg>
        Continue with Google
      </button>

      <p className="text-xs text-white/20 text-center max-w-xs leading-relaxed">
        By continuing you agree to our terms of service and privacy policy
      </p>
    </div>
  )
}
