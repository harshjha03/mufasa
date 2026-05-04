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
  const { user, profile, plan, loading, generatingPlan } = useStore()
  const [screen, setScreen] = useState('today')
  const [showLanding, setShowLanding] = useState(true)
  const scrollRef = useRef<HTMLDivElement>(null)

  const navigate = (s: string) => {
    setScreen(s)
    // Scroll to top when switching screens
    setTimeout(() => scrollRef.current?.scrollTo({ top: 0, behavior: 'instant' }), 0)
  }

  // Initial loading
  if (loading) return <LoadingScreen />

  if (!user) return showLanding ? <LandingScreen onGetStarted={() => setShowLanding(false)} /> : <AuthScreen />
  if (!profile) return <OnboardingScreen />
  if ((profile as any).deactivated) return <DeactivatedScreen />

  // AI generating plan
  if (generatingPlan) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center px-8 text-center" style={{background: 'linear-gradient(160deg, #2A1F14 0%, #6B4F28 100%)'}}>
        <img src="/icon-512.png" alt="Mufasa" className="w-24 h-24 rounded-2xl mb-6 shadow-xl animate-pulse" />
        <h2 className="text-xl font-extrabold text-white mb-2">Building your plan</h2>
        <p className="text-sm text-white/50 leading-relaxed mb-6">
          AI is creating a fully personalised workout, meal plan
          {profile?.sport && profile.sport !== 'none' ? `, and ${profile.sport} protocol` : ''} just for you.
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

  // Plan must exist before showing app
  if (!plan) return (
    <div className="fixed inset-0 bg-cream flex items-center justify-center">
      <div className="w-8 h-8 border-[3px] border-cream-3 border-t-teal rounded-full animate-spin" />
    </div>
  )

  const screens: Record<string, JSX.Element> = {
    today: <TodayScreen onNavigate={navigate} />,
    workout: <WorkoutScreen />,
    nutrition: <NutritionScreen />,
    progress: <ProgressScreen />,
    expenses: <ExpensesScreen />,
    profile: <ProfileScreen />,
  }

  return (
    <div className="max-w-[480px] mx-auto bg-cream relative" style={{ height: '100dvh', overflow: 'hidden' }}>
      <div ref={scrollRef} className="overflow-y-auto overflow-x-hidden" style={{ height: 'calc(100dvh - 64px)' }}>
        {screens[screen] ?? <TodayScreen />}
      </div>
      <BottomNav active={screen} onChange={navigate} />
      <InstallBanner />
    </div>
  )
}
