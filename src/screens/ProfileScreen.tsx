import { useState } from 'react'
import { useStore } from '../store/useStore'
import OnboardingScreen from './OnboardingScreen'

// ── Design tokens — immersiveBronze ──────────────────────
const TEXT    = '#FBF6EE'
const MUTED   = 'rgba(251,246,238,0.5)'
const FAINT   = 'rgba(251,246,238,0.22)'
const DIVIDER = 'rgba(255,255,255,0.09)'
const GOLD    = '#E4B26A'
const CARD    = 'rgba(255,255,255,0.05)'
const DANGER  = '#E05252'

export default function ProfileScreen({ onEditStart, onEditEnd }: { onEditStart?: () => void; onEditEnd?: () => void }) {
  const { user, profile, plan, signOut, deactivateAccount, setShowAuthModal } = useStore()
  const [editing, setEditing]             = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)

  if (editing) return <OnboardingScreen onDone={() => { setEditing(false); onEditEnd?.() }} />

  if (!profile || !plan) return (
    <div style={{ padding: '60px 20px', color: MUTED, fontSize: 14 }}>No profile found.</div>
  )

  // Anonymous user view
  if (!user) {
    return (
      <div style={{
        minHeight: '100vh', paddingBottom: 100,
        background: 'radial-gradient(130% 100% at 100% 0%, #6B4423 0%, #2E1B0E 75%)',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(70% 50% at 90% 0%, rgba(255,200,140,0.18), transparent 60%)', pointerEvents: 'none' }} />
        <div style={{ padding: 'max(env(safe-area-inset-top, 0px), 28px) 20px 28px', position: 'relative' }}>
          <h1 style={{ fontSize: 30, fontWeight: 800, color: TEXT, letterSpacing: '-1px', lineHeight: 1, marginBottom: 6 }}>
            {profile.name || 'Athlete'}
          </h1>
          <p style={{ fontSize: 13, color: MUTED }}>
            {profile.age} yrs · {profile.gender}
          </p>
          <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
            {[
              { val: `${plan.calories.toLocaleString('en-IN')} kcal`, label: 'Daily Target' },
              { val: `${plan.protein}g`, label: 'Protein' },
              { val: String(plan.bmi), label: 'BMI' },
            ].map(({ val, label }) => (
              <div key={label} style={{ flex: 1, background: 'rgba(255,255,255,0.1)', borderRadius: 14, padding: '10px 0', textAlign: 'center', border: '1px solid rgba(255,255,255,0.08)' }}>
                <p style={{ fontSize: 14, fontWeight: 800, color: TEXT, lineHeight: 1 }}>{val}</p>
                <p style={{ fontSize: 9, fontWeight: 700, color: MUTED, letterSpacing: 2, textTransform: 'uppercase', marginTop: 4 }}>{label}</p>
              </div>
            ))}
          </div>
        </div>

        <div style={{ height: 1, background: DIVIDER, margin: '0 20px' }} />

        {/* Sign-in CTA */}
        <div style={{ padding: '24px 20px' }}>
          <div style={{ background: 'rgba(228,178,106,0.08)', border: '1px solid rgba(228,178,106,0.2)', borderRadius: 20, padding: '20px', marginBottom: 16 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: GOLD, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 10 }}>Unlock Full Mufasa</p>
            {[
              'Log workouts & track sets',
              'Log meals & calories',
              'Track weight & build records',
              'Add your goals & lifestyle for a more personalised plan',
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, paddingTop: 8, paddingBottom: 8, fontSize: 13, color: MUTED, borderTop: i > 0 ? `1px solid ${DIVIDER}` : 'none' }}>
                <span style={{ color: GOLD, fontWeight: 800 }}>→</span><span>{item}</span>
              </div>
            ))}
          </div>
          <button
            onClick={() => setShowAuthModal(true)}
            style={{ width: '100%', padding: '17px 0', borderRadius: 18, background: GOLD, color: '#1B1714', fontSize: 15, fontWeight: 800, cursor: 'pointer', border: 'none', marginBottom: 10, boxShadow: '0 4px 20px rgba(228,178,106,0.3)' }}>
            Sign In with Google
          </button>
          <button
            onClick={() => { setEditing(true); onEditStart?.() }}
            style={{ width: '100%', padding: '15px 0', borderRadius: 16, background: CARD, color: MUTED, fontSize: 14, fontWeight: 700, cursor: 'pointer', border: `1px solid ${DIVIDER}` }}>
            <span className="ms ms-sm" style={{ fontSize: 15, verticalAlign: 'middle', marginRight: 6 }}>edit</span>
            Edit Basic Profile
          </button>
        </div>
      </div>
    )
  }

  const genderIcon = profile.gender === 'female' ? 'female' : profile.gender === 'male' ? 'male' : 'transgender'
  const goalLabels: Record<string, string> = { lose: 'Lose Fat', recomp: 'Recomposition', gain: 'Build Muscle' }
  const actLabels: Record<string, string>  = { sedentary: 'Sedentary', light: 'Lightly Active', moderate: 'Moderately Active', very: 'Very Active' }

  const planRows = [
    { icon: 'flag',                  label: 'Goal',           val: goalLabels[profile.goal] },
    { icon: 'local_fire_department', label: 'Daily Calories', val: `${plan.calories.toLocaleString('en-IN')} kcal` },
    { icon: 'egg_alt',               label: 'Protein',        val: `${plan.protein}g/day` },
    { icon: 'grain',                 label: 'Carbs',          val: `${plan.carbs}g/day` },
    { icon: 'water_drop',            label: 'Fat',            val: `${plan.fat}g/day` },
    { icon: 'bar_chart',             label: 'TDEE',           val: `${plan.tdee} kcal` },
    { icon: 'balance',               label: 'Monthly Target', val: plan.weightTarget },
    { icon: 'fitness_center',        label: 'Level',          val: plan.workoutLevel.charAt(0).toUpperCase() + plan.workoutLevel.slice(1) },
    { icon: 'straighten',            label: 'BMI',            val: `${plan.bmi} — ${plan.bmiCat}` },
  ]

  const profileRows = [
    { icon: 'emoji_events',  label: 'Sport',     val: profile.sport && profile.sport !== 'none' ? `${profile.sport}${profile.sport_frequency ? ` · ${profile.sport_frequency}` : ''}` : 'None' },
    { icon: 'healing',       label: 'Injuries',  val: profile.injuries && profile.injuries !== 'none' ? profile.injuries : 'None' },
    { icon: 'person',        label: 'Body Type', val: profile.body_type ? profile.body_type.charAt(0).toUpperCase() + profile.body_type.slice(1) : 'Not set' },
    { icon: 'schedule',      label: 'Schedule',  val: `${profile.wake_time || '6:00 AM'} – ${profile.sleep_time || '10:30 PM'}` },
    { icon: 'fitness_center',label: 'Gym',       val: profile.gym_access === 'full_gym' ? 'Full gym' : profile.gym_access === 'home' ? 'Home workout' : 'No equipment' },
    { icon: 'restaurant',    label: 'Diet',      val: profile.diet_type === 'vegetarian' ? 'Vegetarian' : profile.diet_type === 'vegan' ? 'Vegan' : 'Non-vegetarian' },
  ]

  const SectionLabel = ({ children }: { children: string }) => (
    <p style={{ fontSize: 11, fontWeight: 600, color: TEXT, letterSpacing: 2, textTransform: 'uppercase', opacity: 0.55, marginBottom: 16 }}>
      {children}
    </p>
  )

  const Row = ({ icon, label, val, last = false }: { icon: string; label: string; val: string; last?: boolean }) => (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      paddingTop: 13, paddingBottom: 13,
      borderBottom: last ? 'none' : `1px solid ${DIVIDER}`,
    }}>
      <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: MUTED }}>
        <span className="ms ms-sm" style={{ fontSize: 15, color: MUTED }}>{icon}</span>
        {label}
      </span>
      <span style={{ fontSize: 13, fontWeight: 700, color: TEXT, maxWidth: '55%', textAlign: 'right' }}>{val}</span>
    </div>
  )

  return (
    <div style={{
      minHeight: '100vh',
      paddingBottom: 100,
      background: 'radial-gradient(130% 100% at 100% 0%, #6B4423 0%, #2E1B0E 75%)',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Ambient glow */}
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(70% 50% at 90% 0%, rgba(255,200,140,0.18), transparent 60%)', pointerEvents: 'none' }} />

      {/* ── Hero ─────────────────────────────────────────── */}
      <div style={{ padding: 'max(env(safe-area-inset-top, 0px), 28px) 20px 28px', position: 'relative' }}>
        <h1 style={{ fontSize: 30, fontWeight: 800, color: TEXT, letterSpacing: '-1px', lineHeight: 1, marginBottom: 6 }}>
          {profile.name || 'Athlete'}
        </h1>
        <p style={{ fontSize: 13, color: MUTED }}>
          {profile.age} yrs · {profile.gender} · {actLabels[profile.activity_level]}
        </p>

        {/* Stat chips */}
        <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
          {[
            { val: `${profile.weight}kg`, label: 'Weight' },
            { val: `${profile.height}cm`, label: 'Height' },
            { val: String(plan.bmi),      label: 'BMI'    },
          ].map(({ val, label }) => (
            <div key={label} style={{
              flex: 1, background: 'rgba(255,255,255,0.1)', borderRadius: 14,
              padding: '10px 0', textAlign: 'center',
              border: '1px solid rgba(255,255,255,0.08)',
            }}>
              <p style={{ fontSize: 18, fontWeight: 800, color: TEXT, lineHeight: 1 }}>{val}</p>
              <p style={{ fontSize: 9, fontWeight: 700, color: MUTED, letterSpacing: 2, textTransform: 'uppercase', marginTop: 4 }}>{label}</p>
            </div>
          ))}
        </div>
      </div>

      <div style={{ height: 1, background: DIVIDER, margin: '0 20px' }} />

      {/* ── AI Tips ──────────────────────────────────────── */}
      {plan.tips && plan.tips.length > 0 && (
        <>
          <div style={{ padding: '20px 20px 24px' }}>
            <SectionLabel>AI Tips For You</SectionLabel>
            {plan.tips.map((tip: string, i: number) => (
              <div key={i} style={{
                display: 'flex', gap: 14,
                paddingTop: 13, paddingBottom: 13,
                borderBottom: i < plan.tips.length - 1 ? `1px solid ${DIVIDER}` : 'none',
              }}>
                <span style={{ color: GOLD, fontWeight: 800, fontSize: 14, flexShrink: 0, marginTop: 1 }}>→</span>
                <p style={{ fontSize: 13, color: MUTED, lineHeight: 1.6 }}>{tip}</p>
              </div>
            ))}
            {plan.generatedAt && (
              <p style={{ fontSize: 11, color: FAINT, marginTop: 12 }}>
                Generated {new Date(plan.generatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
            )}
          </div>
          <div style={{ height: 1, background: DIVIDER, margin: '0 20px' }} />
        </>
      )}

      {/* ── Plan Summary ─────────────────────────────────── */}
      <div style={{ padding: '20px 20px 24px' }}>
        <SectionLabel>Your Plan</SectionLabel>
        {planRows.map(({ icon, label, val }, i) => (
          <Row key={label} icon={icon} label={label} val={val} last={i === planRows.length - 1} />
        ))}
      </div>

      <div style={{ height: 1, background: DIVIDER, margin: '0 20px' }} />

      {/* ── Lifestyle ────────────────────────────────────── */}
      <div style={{ padding: '20px 20px 24px' }}>
        <SectionLabel>Lifestyle</SectionLabel>
        {profileRows.map(({ icon, label, val }, i) => (
          <Row key={label} icon={icon} label={label} val={val} last={i === profileRows.length - 1} />
        ))}
      </div>

      <div style={{ height: 1, background: DIVIDER, margin: '0 20px' }} />

      {/* ── Actions ──────────────────────────────────────── */}
      <div style={{ padding: '20px 20px 8px' }}>
        <button
          onClick={() => { setEditing(true); onEditStart?.() }}
          style={{
            width: '100%', padding: '17px 0', borderRadius: 18,
            background: GOLD, color: '#1B1714',
            fontSize: 15, fontWeight: 800, letterSpacing: '-0.3px',
            cursor: 'pointer', border: 'none', marginBottom: 10,
            boxShadow: '0 4px 20px rgba(228,178,106,0.3)',
          }}>
          <span className="ms ms-sm" style={{ fontSize: 15, verticalAlign: 'middle', marginRight: 6 }}>edit</span>
          Edit Profile & Regenerate Plan
        </button>
      </div>

      {/* ── Account ──────────────────────────────────────── */}
      <div style={{ padding: '0 20px 8px' }}>
        <SectionLabel>Account</SectionLabel>
        <p style={{ fontSize: 13, color: FAINT, marginBottom: 14 }}>{user?.email}</p>
        <button
          onClick={signOut}
          style={{
            width: '100%', padding: '15px 0', borderRadius: 16,
            background: CARD, color: MUTED,
            fontSize: 14, fontWeight: 700, cursor: 'pointer',
            border: `1px solid ${DIVIDER}`, marginBottom: 10,
          }}>
          Sign Out
        </button>
        <button
          onClick={() => setShowDeleteModal(true)}
          style={{
            width: '100%', padding: '15px 0', borderRadius: 16,
            background: 'rgba(224,82,82,0.08)', color: DANGER,
            fontSize: 14, fontWeight: 700, cursor: 'pointer',
            border: `1px solid rgba(224,82,82,0.2)`,
          }}>
          <span className="ms ms-sm" style={{ fontSize: 15, verticalAlign: 'middle', marginRight: 6 }}>delete</span>
          Delete Account
        </button>
      </div>

      {/* ── Delete modal ─────────────────────────────────── */}
      {showDeleteModal && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'flex-end', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
          onClick={e => { if (e.target === e.currentTarget) setShowDeleteModal(false) }}
        >
          <div style={{
            width: '100%', maxWidth: 480, margin: '0 auto',
            background: '#1C1410', borderRadius: '24px 24px 0 0',
            padding: '28px 24px 40px',
            border: '1px solid rgba(255,255,255,0.08)',
          }}>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <span className="ms" style={{ fontSize: 36, color: DANGER, display: 'block', marginBottom: 10 }}>warning</span>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: TEXT, marginBottom: 8 }}>Delete Account?</h2>
              <p style={{ fontSize: 13, color: MUTED, lineHeight: 1.6 }}>
                Your account will be deactivated for <strong style={{ color: TEXT }}>3 days</strong>. Sign back in to restore everything. After 3 days, all data is permanently deleted.
              </p>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 14, padding: '14px 16px', marginBottom: 20, border: `1px solid ${DIVIDER}` }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: MUTED, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 10 }}>Deleted after 3 days</p>
              {['Profile & health metrics', 'Workout history & progress', 'Weight log & charts', 'Food logs & calorie history', 'All expenses tracked', 'Your AI-generated plan'].map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, paddingTop: 6, paddingBottom: 6, fontSize: 12, color: MUTED }}>
                  <span style={{ color: DANGER, fontWeight: 900 }}>×</span><span>{item}</span>
                </div>
              ))}
            </div>

            <button
              onClick={async () => { setDeleteLoading(true); await deactivateAccount(); setDeleteLoading(false); setShowDeleteModal(false) }}
              disabled={deleteLoading}
              style={{
                width: '100%', padding: '16px 0', borderRadius: 16, marginBottom: 10,
                background: DANGER, color: '#fff', fontSize: 14, fontWeight: 800,
                cursor: 'pointer', border: 'none', opacity: deleteLoading ? 0.5 : 1,
              }}>
              {deleteLoading ? 'Deactivating...' : 'Deactivate My Account'}
            </button>
            <button
              onClick={() => setShowDeleteModal(false)}
              style={{
                width: '100%', padding: '15px 0', borderRadius: 16,
                background: CARD, color: MUTED, fontSize: 14, fontWeight: 700,
                cursor: 'pointer', border: `1px solid ${DIVIDER}`,
              }}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
