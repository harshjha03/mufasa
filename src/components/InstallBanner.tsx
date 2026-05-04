import { useState, useEffect } from 'react'

export default function InstallBanner() {
  const [androidPrompt, setAndroidPrompt] = useState<any>(null)
  const [show, setShow] = useState(false)
  const [isIos, setIsIos] = useState(false)

  useEffect(() => {
    // Already installed — never show
    if (window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true) return

    // Check if dismissed within last 24 hours
    const dismissedAt = localStorage.getItem('pwa-dismissed-at')
    const recentlyDismissed = dismissedAt && Date.now() - parseInt(dismissedAt) < 24 * 60 * 60 * 1000

    if (recentlyDismissed) return

    // iOS Safari
    const ua = window.navigator.userAgent
    const iosDevice = /iphone|ipad|ipod/i.test(ua)
    const safari = /safari/i.test(ua) && !/crios|fxios|edgios|chrome/i.test(ua)
    const hasStandalone = typeof (window.navigator as any).standalone !== 'undefined'

    if (iosDevice && safari && hasStandalone) {
      setIsIos(true)
      setTimeout(() => setShow(true), 2000)
      return
    }

    // Android / Desktop Chrome — wait for beforeinstallprompt
    const handler = (e: Event) => {
      e.preventDefault()
      setAndroidPrompt(e)
      setTimeout(() => setShow(true), 2000)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const install = async () => {
    if (!androidPrompt) return
    androidPrompt.prompt()
    const result = await androidPrompt.userChoice
    if (result.outcome === 'accepted') localStorage.setItem('pwa-installed', '1')
    setShow(false)
  }

  const dismiss = () => {
    setShow(false)
    // Remember dismissal for 24 hours only
    localStorage.setItem('pwa-dismissed-at', Date.now().toString())
  }

  if (!show) return null

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center px-6"
      style={{ background: 'rgba(26,26,46,0.6)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
      onClick={e => { if (e.target === e.currentTarget) dismiss() }}
    >
      <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-xl">
        <div className="h-1.5 w-full" style={{ background: 'linear-gradient(90deg, #0A9396, #005F73)' }} />
        <div className="p-6 text-center">
          <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #C9A96E, #A07840)' }}>
            <span className="text-3xl"><span className="ms ms-sm">fitness_center</span></span>
          </div>
          <h2 className="text-xl font-extrabold text-ink mb-2">Add Mufasa to Home Screen</h2>
          {isIos ? (
            <p className="text-sm text-ink/50 leading-relaxed mb-6">
              Tap <span className="inline-flex items-center gap-1 bg-cream-2 px-2 py-0.5 rounded-lg text-xs font-bold text-ink">⎙ Share</span> then <strong className="text-ink">"Add to Home Screen"</strong>
            </p>
          ) : (
            <p className="text-sm text-ink/50 leading-relaxed mb-6">
              Install Mufasa for instant access — works offline, no browser bar, feels like a native app
            </p>
          )}
          <div className="flex flex-col gap-2">
            {!isIos && (
              <button onClick={install}
                className="w-full py-3.5 rounded-xl font-bold text-sm text-white active:opacity-80"
                style={{ background: 'linear-gradient(135deg, #C9A96E, #A07840)' }}>
                Install App
              </button>
            )}
            <button onClick={dismiss}
              className="w-full py-3 rounded-xl font-semibold text-sm text-ink/40 bg-cream">
              {isIos ? 'Got it' : 'Not now'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
