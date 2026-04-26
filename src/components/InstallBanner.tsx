import { useState, useEffect } from 'react'

export default function InstallBanner() {
  const [androidPrompt, setAndroidPrompt] = useState<any>(null)
  const [showAndroid, setShowAndroid] = useState(false)
  const [showIos, setShowIos] = useState(false)

  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true) return

    const handler = (e: Event) => {
      e.preventDefault()
      setAndroidPrompt(e)
      if (!localStorage.getItem('pwa-dismissed')) {
        setTimeout(() => setShowAndroid(true), 2500)
      }
    }
    window.addEventListener('beforeinstallprompt', handler)

    const ua = window.navigator.userAgent
    const isIos = /iphone|ipad|ipod/i.test(ua)
    const isSafari = /safari/i.test(ua) && !/crios|fxios|edgios|chrome/i.test(ua)
    const hasStandalone = typeof (window.navigator as any).standalone !== 'undefined'
    if (isIos && isSafari && hasStandalone && !localStorage.getItem('ios-banner-dismissed')) {
      setTimeout(() => setShowIos(true), 3000)
    }

    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const installAndroid = async () => {
    if (!androidPrompt) return
    androidPrompt.prompt()
    const result = await androidPrompt.userChoice
    if (result.outcome === 'accepted') localStorage.setItem('pwa-installed', '1')
    setShowAndroid(false)
  }

  const dismiss = () => {
    setShowAndroid(false)
    setShowIos(false)
    localStorage.setItem(showAndroid ? 'pwa-dismissed' : 'ios-banner-dismissed', '1')
  }

  if (!showAndroid && !showIos) return null

  return (
    /* Full screen backdrop with blur */
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center px-6"
      style={{ background: 'rgba(26,26,46,0.6)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
      onClick={e => { if (e.target === e.currentTarget) dismiss() }}
    >
      <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-xl">
        {/* Top accent */}
        <div className="h-1.5 w-full" style={{ background: 'linear-gradient(90deg, #0A9396, #005F73)' }} />

        <div className="p-6 text-center">
          <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #0A9396, #005F73)' }}>
            <span className="text-3xl">💪</span>
          </div>

          <h2 className="text-xl font-extrabold text-ink mb-2">Add Mufasa to Home Screen</h2>

          {showIos ? (
            <p className="text-sm text-ink/50 leading-relaxed mb-6">
              Tap <span className="inline-flex items-center gap-1 bg-cream-2 px-2 py-0.5 rounded-lg text-xs font-bold text-ink">⎙ Share</span> then tap <strong className="text-ink">"Add to Home Screen"</strong> to install
            </p>
          ) : (
            <p className="text-sm text-ink/50 leading-relaxed mb-6">
              Install Mufasa for instant access — works offline, no browser bar, feels like a native app
            </p>
          )}

          <div className="flex flex-col gap-2">
            {showAndroid && (
              <button onClick={installAndroid}
                className="w-full py-3.5 rounded-xl font-bold text-sm text-white transition-opacity active:opacity-80"
                style={{ background: 'linear-gradient(135deg, #0A9396, #005F73)' }}>
                Install App
              </button>
            )}
            <button onClick={dismiss}
              className="w-full py-3 rounded-xl font-semibold text-sm text-ink/40 bg-cream hover:bg-cream-2 transition-colors">
              {showIos ? 'Got it' : 'Not now'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
