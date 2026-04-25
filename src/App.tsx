import { useState } from 'react'
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

export default function App() {
  useAuth()
  const { user, profile, plan, loading, generatingPlan } = useStore()
  const [screen, setScreen] = useState('today')

  // Initial loading
  if (loading) {
    return (
      <div className="fixed inset-0 bg-cream flex flex-col items-center justify-center">
        <div className="font-serif text-4xl text-ink mb-6">Mu<span className="text-teal">fasa</span></div>
        <div className="w-8 h-8 border-[3px] border-cream-3 border-t-teal rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) return <AuthScreen />
  if (!profile) return <OnboardingScreen />
  if ((profile as any).deactivated) return <DeactivatedScreen />

  // AI generating plan
  if (generatingPlan) {
    return (
      <div className="fixed inset-0 bg-cream flex flex-col items-center justify-center px-8 text-center">
        <div className="font-serif text-4xl text-ink mb-3">Mu<span className="text-teal">fasa</span></div>
        <div className="w-16 h-16 rounded-2xl bg-teal-pale flex items-center justify-center mb-6 animate-pulse">
          <span className="text-3xl">🤖</span>
        </div>
        <h2 className="text-xl font-extrabold text-ink mb-2">Building your plan</h2>
        <p className="text-sm text-ink/40 leading-relaxed mb-6">
          AI is analysing your profile and creating a fully personalised workout, meal plan
          {profile.sport && profile.sport !== 'none' ? `, and ${profile.sport} protocol` : ''} just for you.
        </p>
        <div className="flex gap-1.5">
          {[0, 1, 2].map(i => (
            <div key={i} className="w-2 h-2 rounded-full bg-teal animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
          ))}
        </div>
        <p className="text-xs text-ink/20 mt-6">This usually takes 5–10 seconds</p>
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
    today: <TodayScreen />,
    workout: <WorkoutScreen />,
    nutrition: <NutritionScreen />,
    progress: <ProgressScreen />,
    expenses: <ExpensesScreen />,
    profile: <ProfileScreen />,
  }

  return (
    <div className="max-w-[480px] mx-auto bg-cream relative" style={{ height: '100dvh', overflow: 'hidden' }}>
      <div className="overflow-y-auto overflow-x-hidden" style={{ height: 'calc(100dvh - 64px)' }}>
        {screens[screen] ?? <TodayScreen />}
      </div>
      <BottomNav active={screen} onChange={setScreen} />
      <InstallBanner />
    </div>
  )
}
