import { useState, useRef, useEffect } from 'react'
import { useStore } from './store/useStore'
import { useAuth } from './hooks/useAuth'
import AuthScreen from './screens/AuthScreen'
import OnboardingScreen from './screens/OnboardingScreen'
import TodayScreen from './screens/TodayScreen'
import WorkoutScreen from './screens/WorkoutScreen'
import NutritionScreen from './screens/NutritionScreen'
import ProgressScreen from './screens/ProgressScreen'
import ExpensesScreen from './screens/ExpensesScreen'
import ProfileScreen from './screens/ProfileScreen'
import BottomNav from './components/BottomNav'
import InstallBanner from './components/InstallBanner'
import DeactivatedScreen from './screens/DeactivatedScreen'
import LandingScreen from './screens/LandingScreen'

function LoadingScreen() {
  const [showRetry, setShowRetry] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setShowRetry(true), 8000)
    return () => clearTimeout(t)
  }, [])
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center px-6" style={{background: 'linear-gradient(160deg, #2A1F14 0%, #6B4F28 100%)'}}>
      <img src="/icon-512.png" alt="Mufasa" className="w-32 h-32 rounded-3xl mb-6 shadow-xl" />
      <div className="font-serif text-4xl text-white mb-1">Mufasa</div>
      <p className="text-xs text-white/40 mb-8">Your AI Fitness Coach</p>
      <div className="flex gap-1.5">
        {[0,1,2].map(i => (
          <div key={i} className="w-2 h-2 rounded-full bg-teal animate-bounce" style={{animationDelay: `${i*0.15}s`}} />
        ))}
      </div>
      {showRetry && (
        <div className="text-center mt-8">
          <p className="text-xs text-white/30 mb-3">Taking longer than usual...</p>
          <button onClick={() => window.location.reload()} className="bg-white text-ink font-bold text-sm px-6 py-2.5 rounded-xl">Retry</button>
        </div>
      )}
    </div>
  )
}

export default function App() {
  useAuth()
  const { profile, plan, loading, generatingPlan, showAuthModal, setShowAuthModal, showProfileUpgradePrompt, setShowProfileUpgradePrompt, isDemo, exitDemo } = useStore()
  const [screen, setScreen] = useState('today')
  const [showLanding, setShowLanding] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  const navigate = (s: string) => {
    setScreen(s)
    setTimeout(() => scrollRef.current?.scrollTo({ top: 0, behavior: 'instant' }), 0)
  }

  if (loading) return <LoadingScreen />

  // No profile yet — wrapped in the same mobile container
  if (!profile) return (
    <div className="max-w-[480px] mx-auto bg-cream relative" style={{ height: '100dvh', overflow: 'hidden' }}>
      {showLanding
        ? <LandingScreen onGetStarted={() => setShowLanding(false)} />
        : <OnboardingScreen />}
    </div>
  )

  if ((profile as any).deactivated) return <DeactivatedScreen />

  if (generatingPlan) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center px-8 text-center" style={{background: 'linear-gradient(160deg, #2A1F14 0%, #6B4F28 100%)'}}>
        <img src="/icon-512.png" alt="Mufasa" className="w-24 h-24 rounded-2xl mb-6 shadow-xl animate-pulse" />
        <h2 className="text-xl font-extrabold text-white mb-2">Building your plan</h2>
        <p className="text-sm text-white/50 leading-relaxed mb-6">
          AI is creating a fully personalised workout and meal plan just for you.
        </p>
        <div className="flex gap-1.5">
          {[0, 1, 2].map(i => (
            <div key={i} className="w-2 h-2 rounded-full bg-teal animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
          ))}
        </div>
        <p className="text-xs text-white/20 mt-6">This usually takes 5–10 seconds</p>
      </div>
    )
  }

  if (!plan) return (
    <div className="fixed inset-0 bg-cream flex items-center justify-center">
      <div className="w-8 h-8 border-[3px] border-cream-3 border-t-teal rounded-full animate-spin" />
    </div>
  )

  const renderScreen = () => {
    switch(screen) {
      case 'today': return <TodayScreen onNavigate={navigate} />
      case 'workout': return <WorkoutScreen />
      case 'nutrition': return <NutritionScreen />
      case 'progress': return <ProgressScreen />
      case 'expenses': return <ExpensesScreen />
      case 'profile': return <ProfileScreen onEditStart={() => setIsEditing(true)} onEditEnd={() => setIsEditing(false)} />
      default: return <TodayScreen onNavigate={navigate} />
    }
  }

  return (
    <div className="max-w-[480px] mx-auto bg-cream relative" style={{ height: '100dvh', overflow: 'hidden' }}>

      {/* Demo banner */}
      {isDemo && (
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 80, background: 'rgba(212,168,75,0.95)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 14px', gap: 8 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#120D08' }}>DEMO — sample data only</span>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button onClick={() => setShowAuthModal(true)} style={{ fontSize: 11, fontWeight: 800, color: '#120D08', background: 'rgba(0,0,0,0.15)', border: 'none', borderRadius: 8, padding: '4px 10px', cursor: 'pointer' }}>Sign in</button>
            <button onClick={exitDemo} style={{ fontSize: 11, fontWeight: 700, color: 'rgba(18,13,8,0.6)', background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
          </div>
        </div>
      )}

      <div ref={scrollRef} className="overflow-y-auto overflow-x-hidden" style={{ height: isEditing ? (isDemo ? 'calc(100dvh - 30px)' : '100dvh') : `calc(100dvh - ${isDemo ? 94 : 64}px)`, marginTop: isDemo ? 30 : 0 }}>
        {renderScreen()}
      </div>
      {!isEditing && <BottomNav active={screen} onChange={navigate} />}
      <InstallBanner />

      {/* Auth modal — shown when anonymous user tries a logged-in-only feature */}
      {showAuthModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100 }}>
          <AuthScreen onCancel={() => setShowAuthModal(false)} />
        </div>
      )}

      {/* Profile upgrade prompt — shown once after first login to collect missing measurements/goals */}
      {showProfileUpgradePrompt && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 90 }}>
          <OnboardingScreen
            initialStep={2}
            onDone={() => setShowProfileUpgradePrompt(false)}
            onSkip={() => setShowProfileUpgradePrompt(false)}
          />
        </div>
      )}
    </div>
  )
}
