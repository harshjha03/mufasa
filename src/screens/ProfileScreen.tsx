import { useState } from 'react'
import { useStore } from '../store/useStore'
import OnboardingScreen from './OnboardingScreen'

export default function ProfileScreen() {
  const { user, profile, plan, signOut, regeneratePlan, generatingPlan, deactivateAccount } = useStore()
  const [editing, setEditing] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)

  if (editing) return <OnboardingScreen onDone={() => setEditing(false)} />

  if (!profile || !plan) return (
    <div className="pb-24 px-4 pt-12"><p className="text-ink/40 text-sm">No profile found.</p></div>
  )

  const genderIcon = profile.gender === 'female' ? '♀️' : profile.gender === 'male' ? '♂️' : '⚧️'
  const goalLabels = { lose: 'Lose Fat 🔥', recomp: 'Recomposition ⚖️', gain: 'Build Muscle 💪' }
  const actLabels = { sedentary: 'Sedentary 🪑', light: 'Lightly Active 🚶', moderate: 'Moderately Active 🏃', very: 'Very Active ⚡' }

  const planRows = [
    { icon: '🎯', label: 'Goal', val: goalLabels[profile.goal] },
    { icon: '🔥', label: 'Daily Calories', val: `${plan.calories.toLocaleString('en-IN')} kcal` },
    { icon: '🥩', label: 'Protein', val: `${plan.protein}g/day` },
    { icon: '🍚', label: 'Carbs', val: `${plan.carbs}g/day` },
    { icon: '🫒', label: 'Fat', val: `${plan.fat}g/day` },
    { icon: '📊', label: 'TDEE', val: `${plan.tdee} kcal` },
    { icon: '⚖️', label: 'Monthly Target', val: plan.weightTarget },
    { icon: '🏋️', label: 'Level', val: plan.workoutLevel.charAt(0).toUpperCase() + plan.workoutLevel.slice(1) },
    { icon: '📏', label: 'BMI', val: `${plan.bmi} — ${plan.bmiCat}` },
  ]

  const profileRows = [
    { icon: '🏅', label: 'Sport', val: profile.sport && profile.sport !== 'none' ? `${profile.sport}${profile.sport_frequency ? ` · ${profile.sport_frequency}` : ''}` : 'None' },
    { icon: '🤕', label: 'Injuries', val: profile.injuries && profile.injuries !== 'none' ? profile.injuries : 'None' },
    { icon: '🌅', label: 'Schedule', val: `${profile.wake_time || '6:00 AM'} – ${profile.sleep_time || '10:30 PM'}` },
    { icon: '🏋️', label: 'Gym access', val: profile.gym_access === 'full_gym' ? 'Full gym' : profile.gym_access === 'home' ? 'Home workout' : 'No equipment' },
    { icon: '🥗', label: 'Diet', val: profile.diet_type === 'vegetarian' ? 'Vegetarian' : profile.diet_type === 'vegan' ? 'Vegan' : 'Non-vegetarian' },
  ]

  return (
    <div className="pb-24">
      {/* Hero */}
      <div className="mx-4 mt-12 mb-3 rounded-card p-6 text-white" style={{ background: 'linear-gradient(135deg, #2D3561, #005F73)' }}>
        <div className="w-14 h-14 rounded-full bg-white/15 flex items-center justify-center text-2xl mb-3">{genderIcon}</div>
        <h1 className="font-serif text-2xl font-bold">{profile.name || 'Athlete'}</h1>
        <p className="text-xs opacity-60 mt-1">{profile.age} yrs · {profile.gender} · {actLabels[profile.activity_level]}</p>
        <div className="grid grid-cols-3 gap-2 mt-4">
          {[{ val: `${profile.weight}kg`, label: 'Weight' }, { val: `${profile.height}cm`, label: 'Height' }, { val: plan.bmi, label: 'BMI' }].map(({ val, label }) => (
            <div key={label} className="bg-white/10 rounded-xl p-2.5 text-center">
              <p className="text-lg font-extrabold leading-none">{val}</p>
              <p className="text-xs opacity-50 mt-1 uppercase tracking-wide">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* AI Tips */}
      {plan.tips && plan.tips.length > 0 && (
        <div className="bg-white rounded-card shadow-card mx-4 mb-3 p-5">
          <p className="text-xs font-bold tracking-widest text-ink/30 uppercase mb-3">🤖 AI Tips For You</p>
          {plan.tips.map((tip, i) => (
            <div key={i} className="flex gap-2.5 py-2.5 border-b border-cream-2 last:border-0">
              <span className="text-teal font-bold text-sm mt-0.5">→</span>
              <p className="text-sm text-ink/70 leading-relaxed">{tip}</p>
            </div>
          ))}
          {plan.generatedAt && (
            <p className="text-xs text-ink/20 mt-3">Generated {new Date(plan.generatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
          )}
        </div>
      )}

      {/* Plan Summary */}
      <div className="bg-white rounded-card shadow-card mx-4 mb-3 p-5">
        <p className="text-xs font-bold tracking-widest text-ink/30 uppercase mb-3">Your Plan</p>
        {planRows.map(({ icon, label, val }) => (
          <div key={label} className="flex justify-between items-center py-2.5 border-b border-cream-2 last:border-0">
            <span className="flex items-center gap-2 text-sm text-ink/60">{icon} {label}</span>
            <span className="text-sm font-bold text-ink">{val}</span>
          </div>
        ))}
      </div>

      {/* Profile Info */}
      <div className="bg-white rounded-card shadow-card mx-4 mb-3 p-5">
        <p className="text-xs font-bold tracking-widest text-ink/30 uppercase mb-3">Lifestyle</p>
        {profileRows.map(({ icon, label, val }) => (
          <div key={label} className="flex justify-between items-center py-2.5 border-b border-cream-2 last:border-0">
            <span className="flex items-center gap-2 text-sm text-ink/60">{icon} {label}</span>
            <span className="text-sm font-bold text-ink capitalize">{val}</span>
          </div>
        ))}
      </div>

      {/* Actions */}
      <button onClick={() => setEditing(true)} className="block w-[calc(100%-32px)] mx-4 mb-3 bg-cream-2 text-ink font-bold text-sm py-3.5 rounded-xl text-center active:opacity-70">
        ✏️ Edit Profile & Regenerate Plan
      </button>
      <button onClick={regeneratePlan} disabled={generatingPlan} className="block w-[calc(100%-32px)] mx-4 mb-3 bg-teal-pale text-teal font-bold text-sm py-3.5 rounded-xl text-center active:opacity-70 disabled:opacity-50">
        🤖 Regenerate Plan
      </button>

      {/* Account */}
      <div className="bg-white rounded-card shadow-card mx-4 mb-3 p-5">
        <p className="text-xs font-bold tracking-widest text-ink/30 uppercase mb-2">Account</p>
        <p className="text-sm text-ink/40 mb-4">{user?.email}</p>
        <button onClick={signOut} className="w-full bg-cream-2 text-ink/60 font-bold text-sm py-3 rounded-xl mb-2 active:opacity-70">Sign Out</button>
        <button onClick={() => setShowDeleteModal(true)} className="w-full bg-cream-2 text-danger font-bold text-sm py-3 rounded-xl active:opacity-70">🗑️ Delete Account</button>
      </div>

      {/* Delete modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-end" style={{ background: 'rgba(0,0,0,0.5)' }}
          onClick={e => { if (e.target === e.currentTarget) setShowDeleteModal(false) }}>
          <div className="bg-white rounded-t-3xl w-full max-w-[480px] mx-auto p-6 pb-10">
            <div className="text-center mb-5">
              <div className="text-4xl mb-3">⚠️</div>
              <h2 className="text-xl font-extrabold text-ink">Delete Account?</h2>
              <p className="text-sm text-ink/50 mt-2 leading-relaxed">
                Your account will be deactivated for <strong>3 days</strong>. Sign back in to restore everything. After 3 days, all data is permanently deleted.
              </p>
            </div>
            <div className="bg-cream-2 rounded-xl p-4 mb-5">
              <p className="text-xs font-bold text-ink/40 uppercase tracking-wide mb-2">What gets deleted after 3 days</p>
              {['Profile & health metrics', 'Workout history & progress', 'Weight log & charts', 'Food logs & calorie history', 'All expenses tracked', 'Your AI-generated plan'].map((item, i) => (
                <div key={i} className="flex gap-2 py-1 text-xs text-ink/50">
                  <span className="text-danger font-bold">x</span><span>{item}</span>
                </div>
              ))}
            </div>
            <button
              onClick={async () => { setDeleteLoading(true); await deactivateAccount(); setDeleteLoading(false); setShowDeleteModal(false) }}
              disabled={deleteLoading}
              className="w-full bg-danger text-white font-extrabold text-sm py-3.5 rounded-xl mb-3 active:opacity-80 disabled:opacity-50"
            >
              {deleteLoading ? 'Deactivating...' : 'Deactivate My Account'}
            </button>
            <button onClick={() => setShowDeleteModal(false)} className="w-full bg-cream-2 text-ink/60 font-bold text-sm py-3 rounded-xl">
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
