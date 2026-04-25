import { useState, useEffect } from 'react'

export default function InstallBanner() {
  const [androidPrompt, setAndroidPrompt] = useState<any>(null)
  const [showAndroid, setShowAndroid] = useState(false)
  const [showIos, setShowIos] = useState(false)

  useEffect(() => {
    // Already installed as PWA — never show
    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true) return

    // Android install prompt
    const handler = (e: Event) => {
      e.preventDefault()
      setAndroidPrompt(e)
      if (!localStorage.getItem('pwa-dismissed')) {
        setTimeout(() => setShowAndroid(true), 2500)
      }
    }
    window.addEventListener('beforeinstallprompt', handler)

    // iOS Safari detection
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

  const dismissAndroid = () => {
    setShowAndroid(false)
    localStorage.setItem('pwa-dismissed', '1')
  }

  const dismissIos = () => {
    setShowIos(false)
    localStorage.setItem('ios-banner-dismissed', '1')
  }

  if (!showAndroid && !showIos) return null

  return (
    <div className="fixed left-1/2 -translate-x-1/2 w-[calc(100%-32px)] max-w-[448px] z-[200]"
      style={{ bottom: 'calc(64px + 12px)', transition: 'transform 0.4s cubic-bezier(0.34,1.56,0.64,1)' }}>
      <div className="rounded-2xl p-3.5 flex items-center gap-3 shadow-lg" style={{ background: '#2D3561' }}>
        <span className="text-2xl flex-shrink-0">💪</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-white">Add Mufasa to Home Screen</p>
          {showIos ? (
            <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.5)' }}>
              Tap <span className="bg-white/20 px-1.5 py-0.5 rounded text-xs">⎙ Share</span> then "Add to Home Screen"
            </p>
          ) : (
            <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.5)' }}>Opens instantly · works offline</p>
          )}
        </div>
        {showAndroid && (
          <button onClick={installAndroid} className="bg-teal text-white font-bold text-xs px-4 py-2 rounded-xl flex-shrink-0 active:opacity-80">Install</button>
        )}
        <button onClick={showAndroid ? dismissAndroid : dismissIos} className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold" style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)' }}>✕</button>
      </div>
    </div>
  )
}
