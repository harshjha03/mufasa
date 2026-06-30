import { useState } from 'react'
import { useStore } from '../store/useStore'
import type { Profile } from '../types'

// ── Design tokens ─────────────────────────────────────────
const TEXT    = '#FBF6EE'
const MUTED   = 'rgba(251,246,238,0.5)'
const FAINT   = 'rgba(251,246,238,0.22)'
const DIVIDER = 'rgba(255,255,255,0.09)'
const GOLD    = '#E4B26A'
const DANGER  = '#E05252'
const INPUT_BG     = 'rgba(255,255,255,0.07)'
const INPUT_BORDER = 'rgba(255,255,255,0.12)'
const INPUT_FOCUS  = 'rgba(228,178,106,0.5)'

interface ObData {
  name: string; age: string; gender: string; weight: string; height: string
  activity: string; goal: string; sport: string; sport_frequency: string
  injuries: string; wake_time: string; sleep_time: string
  gym_access: string; diet_type: string; body_type: string
}
interface Props { onDone?: () => void; onSkip?: () => void; initialStep?: number }

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: MUTED, display: 'block', marginBottom: 8 }}>
        {label}
      </label>
      {children}
    </div>
  )
}

function StableInput({ label, value, onChange, type = 'text', placeholder, inputMode }: {
  label: string; value: string; onChange: (v: string) => void
  type?: string; placeholder: string; inputMode?: string
}) {
  return (
    <Field label={label}>
      <input
        style={{
          width: '100%', background: INPUT_BG, border: `1.5px solid ${INPUT_BORDER}`,
          borderRadius: 14, padding: '13px 16px', fontSize: 15, color: TEXT,
          outline: 'none', boxSizing: 'border-box',
          fontFamily: '-apple-system, BlinkMacSystemFont, system-ui',
        }}
        onFocus={e => (e.target.style.borderColor = INPUT_FOCUS)}
        onBlur={e  => (e.target.style.borderColor = INPUT_BORDER)}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        inputMode={inputMode as any}
        autoComplete="off"
      />
    </Field>
  )
}

function OptionBtn({ selected, onClick, icon, label, sub }: {
  selected: boolean; onClick: () => void; icon: string; label: string; sub?: string
}) {
  return (
    <button onClick={onClick} style={{
      width: '100%', display: 'flex', alignItems: 'center', gap: 12,
      padding: '13px 14px', borderRadius: 14, textAlign: 'left', cursor: 'pointer',
      background: selected ? 'rgba(228,178,106,0.12)' : INPUT_BG,
      border: `1.5px solid ${selected ? 'rgba(228,178,106,0.45)' : INPUT_BORDER}`,
      transition: 'all 0.15s',
      boxSizing: 'border-box',
    }}>
      <span className="ms ms-sm" style={{ fontSize: 18, color: selected ? GOLD : MUTED, flexShrink: 0 }}>{icon}</span>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: selected ? TEXT : MUTED }}>{label}</div>
        {sub && <div style={{ fontSize: 11, color: selected ? MUTED : FAINT, marginTop: 2 }}>{sub}</div>}
      </div>
      {selected && <span style={{ color: GOLD, fontSize: 14, fontWeight: 800 }}>✓</span>}
    </button>
  )
}

export default function OnboardingScreen({ onDone, onSkip, initialStep = 0 }: Props) {
  const { saveProfile, profile, user } = useStore()
  const isLoggedIn = !!user

  // Anonymous: 2 steps (name+age, gender)
  // Logged-in: 6 steps (name+age, gender, measurements, activity, goal, preferences+lifestyle)
  const TOTAL_STEPS = isLoggedIn ? 6 : 3

  const [step, setStep] = useState(initialStep)
  const [data, setData] = useState<ObData>(() => profile ? {
    name: profile.name, age: String(profile.age), gender: profile.gender,
    weight: String(profile.weight || ''), height: String(profile.height || ''),
    activity: profile.activity_level || '', goal: profile.goal || '',
    sport: profile.sport || 'none', sport_frequency: profile.sport_frequency || '',
    injuries: profile.injuries || 'none', wake_time: profile.wake_time || '6:00 AM',
    sleep_time: profile.sleep_time || '10:30 PM', gym_access: profile.gym_access || 'full_gym',
    diet_type: profile.diet_type || 'non_vegetarian',
    body_type: profile.body_type || 'mesomorph',
  } : {
    name: '', age: '', gender: '', weight: '', height: '',
    activity: '', goal: '', sport: '', sport_frequency: '',
    injuries: '', wake_time: '6:00 AM', sleep_time: '10:30 PM',
    gym_access: '', diet_type: '', body_type: '',
  })
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const set_ = (field: keyof ObData) => (v: string) => setData(d => ({ ...d, [field]: v }))
  const opt  = (field: keyof ObData, value: string) => () => setData(d => ({ ...d, [field]: value }))

  const bmi = data.weight && data.height
    ? (parseFloat(data.weight) / ((parseFloat(data.height) / 100) ** 2)).toFixed(1)
    : null
  const bmiCat = bmi
    ? parseFloat(bmi) < 18.5 ? 'Underweight' : parseFloat(bmi) < 25 ? 'Normal weight'
    : parseFloat(bmi) < 30 ? 'Overweight' : 'Obese'
    : ''

  const validate = () => {
    if (step === 0 && !data.name.trim()) return 'Please enter your name.'
    if (step === 0 && (!data.age || +data.age < 13 || +data.age > 80)) return 'Enter a valid age (13–80).'
    if (step === 1 && !data.gender) return 'Please select a gender.'
    // Logged-in only steps
    if (step === 2 && (!data.weight || +data.weight < 30)) return 'Enter a valid weight.'
    if (step === 2 && (!data.height || +data.height < 100)) return 'Enter a valid height.'
    if (isLoggedIn) {
      if (step === 3 && !data.activity) return 'Please select your activity level.'
      if (step === 4 && !data.goal) return 'Please select your goal.'
      if (step === 5 && !data.diet_type) return 'Please select diet type.'
    }
    return ''
  }

  const next = async () => {
    const err = validate()
    if (err) { setError(err); return }
    setError('')
    if (step < TOTAL_STEPS - 1) { setStep(s => s + 1); return }

    // Final step — save profile
    setSaving(true)
    let p: Profile

    if (!isLoggedIn) {
      // Anonymous: only name, age, gender — store fills defaults
      p = {
        name: data.name,
        age: +data.age,
        gender: data.gender as Profile['gender'],
        weight: +data.weight,
        height: +data.height,
        activity_level: 'moderate',
        goal: 'recomp',
      } as Profile
    } else {
      // Logged-in: full profile
      p = {
        name: data.name, age: +data.age, gender: data.gender as Profile['gender'],
        weight: +data.weight, height: +data.height,
        activity_level: data.activity as Profile['activity_level'],
        goal: data.goal as Profile['goal'],
        sport: data.sport || 'none', sport_frequency: data.sport_frequency || undefined,
        injuries: data.injuries || 'none',
        wake_time: data.wake_time, sleep_time: data.sleep_time,
        gym_access: data.gym_access as Profile['gym_access'],
        diet_type: data.diet_type as Profile['diet_type'],
        body_type: data.body_type as Profile['body_type'] || 'mesomorph',
      }
    }

    try {
      await saveProfile(p)
      setSaving(false)
      onDone?.()
    } catch (e: any) {
      setSaving(false)
      setError('Failed to save: ' + (e.message || 'Please try again'))
    }
  }

  const anonStepTitles    = ['Your name', 'Your gender', 'Measurements']
  const loggedInStepTitles = ['Basic info', 'Gender', 'Measurements', 'Activity level', 'Your goal', 'Preferences']
  const stepTitles = isLoggedIn ? loggedInStepTitles : anonStepTitles

  const renderStep = () => {
    switch (step) {
      case 0: return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: TEXT, letterSpacing: '-0.5px', marginBottom: 4 }}>Hey, what's your name?</h2>
            <p style={{ fontSize: 13, color: MUTED }}>
              {isLoggedIn ? "We'll personalise everything for you" : "We'll build a free personalised plan for you"}
            </p>
          </div>
          <StableInput label="Full Name" value={data.name} onChange={set_('name')} placeholder="e.g. Rohan Sharma" />
          <StableInput label="Age" value={data.age} onChange={set_('age')} type="number" placeholder="e.g. 25" inputMode="numeric" />
        </div>
      )

      case 1: return (
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: TEXT, letterSpacing: '-0.5px', marginBottom: 4 }}>What's your gender?</h2>
          <p style={{ fontSize: 13, color: MUTED, marginBottom: 20 }}>
            {isLoggedIn ? 'Affects metabolic rate calculation' : 'Helps us estimate calorie targets'}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <OptionBtn selected={data.gender === 'male'}   onClick={opt('gender', 'male')}   icon="male"        label="Male" />
            <OptionBtn selected={data.gender === 'female'} onClick={opt('gender', 'female')} icon="female"      label="Female" />
            <OptionBtn selected={data.gender === 'other'}  onClick={opt('gender', 'other')}  icon="transgender" label="Other / Prefer not to say" />
          </div>
          {!isLoggedIn && (
            <div style={{ marginTop: 20, background: 'rgba(228,178,106,0.08)', borderRadius: 14, padding: '12px 16px', border: '1px solid rgba(228,178,106,0.2)' }}>
              <p style={{ fontSize: 12, color: MUTED, lineHeight: 1.6 }}>
                <span style={{ color: GOLD, fontWeight: 700 }}>Sign in</span> after to add your measurements, goals, and lifestyle for a more personalised plan.
              </p>
            </div>
          )}
        </div>
      )

      // Steps 2–5 are only reached when logged in
      case 2: return (
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: TEXT, letterSpacing: '-0.5px', marginBottom: 4 }}>Your measurements</h2>
          <p style={{ fontSize: 13, color: MUTED, marginBottom: 20 }}>Used to calculate BMI and calorie targets</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
            <StableInput label="Weight (kg)" value={data.weight} onChange={set_('weight')} type="number" placeholder="e.g. 75" inputMode="decimal" />
            <StableInput label="Height (cm)" value={data.height} onChange={set_('height')} type="number" placeholder="e.g. 175" inputMode="decimal" />
          </div>
          {bmi && (
            <div style={{ background: 'rgba(228,178,106,0.1)', border: `1.5px solid rgba(228,178,106,0.3)`, borderRadius: 14, padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: 26, fontWeight: 800, color: GOLD }}>{bmi}</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: GOLD, marginLeft: 6 }}>BMI</span>
              </div>
              <span style={{ fontSize: 12, fontWeight: 600, color: MUTED }}>{bmiCat}</span>
            </div>
          )}
        </div>
      )

      case 3: return (
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: TEXT, letterSpacing: '-0.5px', marginBottom: 4 }}>How active are you?</h2>
          <p style={{ fontSize: 13, color: MUTED, marginBottom: 20 }}>On a typical non-gym day</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <OptionBtn selected={data.activity === 'sedentary'} onClick={opt('activity', 'sedentary')} icon="chair"           label="Sedentary"         sub="Desk job, little movement" />
            <OptionBtn selected={data.activity === 'light'}     onClick={opt('activity', 'light')}     icon="directions_walk"  label="Lightly Active"    sub="Some walking, light activity" />
            <OptionBtn selected={data.activity === 'moderate'}  onClick={opt('activity', 'moderate')}  icon="directions_run"   label="Moderately Active" sub="Regular movement, active job" />
            <OptionBtn selected={data.activity === 'very'}      onClick={opt('activity', 'very')}      icon="bolt"             label="Very Active"       sub="Heavy manual work or athlete" />
          </div>
        </div>
      )

      case 4: return (
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: TEXT, letterSpacing: '-0.5px', marginBottom: 4 }}>What's your main goal?</h2>
          <p style={{ fontSize: 13, color: MUTED, marginBottom: 20 }}>Your AI plan will be built around this</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <OptionBtn selected={data.goal === 'lose'}   onClick={opt('goal', 'lose')}   icon="local_fire_department" label="Lose Fat"       sub="Calorie deficit · preserve muscle" />
            <OptionBtn selected={data.goal === 'recomp'} onClick={opt('goal', 'recomp')} icon="balance"               label="Recomposition" sub="Lose fat and build muscle simultaneously" />
            <OptionBtn selected={data.goal === 'gain'}   onClick={opt('goal', 'gain')}   icon="fitness_center"        label="Build Muscle"  sub="Calorie surplus · maximise gains" />
          </div>
        </div>
      )

      case 5: return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: TEXT, letterSpacing: '-0.5px', marginBottom: 4 }}>Lifestyle details</h2>
            <p style={{ fontSize: 13, color: MUTED }}>Helps fine-tune your plan further</p>
          </div>

          {/* Wake / Sleep */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="Wake up">
              <input type="time" style={{ width: '100%', background: INPUT_BG, border: `1.5px solid ${INPUT_BORDER}`, borderRadius: 14, padding: '13px 14px', fontSize: 14, color: TEXT, outline: 'none', boxSizing: 'border-box' }}
                value={data.wake_time.includes(':') && !data.wake_time.includes('AM') && !data.wake_time.includes('PM') ? data.wake_time : '06:00'}
                onChange={e => setData(d => ({ ...d, wake_time: e.target.value }))} />
            </Field>
            <Field label="Sleep">
              <input type="time" style={{ width: '100%', background: INPUT_BG, border: `1.5px solid ${INPUT_BORDER}`, borderRadius: 14, padding: '13px 14px', fontSize: 14, color: TEXT, outline: 'none', boxSizing: 'border-box' }}
                value={data.sleep_time.includes(':') && !data.sleep_time.includes('AM') && !data.sleep_time.includes('PM') ? data.sleep_time : '22:30'}
                onChange={e => setData(d => ({ ...d, sleep_time: e.target.value }))} />
            </Field>
          </div>

          {/* Diet */}
          <div>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: MUTED, marginBottom: 10 }}>Diet preference</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <OptionBtn selected={data.diet_type === 'vegetarian'}     onClick={opt('diet_type', 'vegetarian')}     icon="restaurant" label="Vegetarian"     sub="No meat, no eggs" />
              <OptionBtn selected={data.diet_type === 'eggetarian'}     onClick={opt('diet_type', 'eggetarian')}     icon="egg"        label="Eggetarian"     sub="Vegetarian + eggs" />
              <OptionBtn selected={data.diet_type === 'non_vegetarian'} onClick={opt('diet_type', 'non_vegetarian')} icon="set_meal"   label="Non-vegetarian" sub="Includes chicken, eggs, fish" />
              <OptionBtn selected={data.diet_type === 'vegan'}          onClick={opt('diet_type', 'vegan')}          icon="eco"        label="Vegan"          sub="No animal products" />
            </div>
          </div>

          {/* Gym access */}
          <div>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: MUTED, marginBottom: 10 }}>Gym access</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <OptionBtn selected={data.gym_access === 'full_gym'} onClick={opt('gym_access', 'full_gym')} icon="fitness_center"   label="Full gym"        sub="Barbells, machines, cables" />
              <OptionBtn selected={data.gym_access === 'home'}     onClick={opt('gym_access', 'home')}     icon="home"             label="Home workout"    sub="Dumbbells or bodyweight" />
              <OptionBtn selected={data.gym_access === 'none'}     onClick={opt('gym_access', 'none')}     icon="directions_walk"  label="No equipment"    sub="Bodyweight only" />
            </div>
          </div>

          {/* Sport (optional) */}
          <div>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: MUTED, marginBottom: 10 }}>Sport / activity (optional)</p>
            <input
              style={{ width: '100%', background: INPUT_BG, border: `1.5px solid ${INPUT_BORDER}`, borderRadius: 14, padding: '13px 16px', fontSize: 15, color: TEXT, outline: 'none', boxSizing: 'border-box' }}
              placeholder="e.g. Cricket, Football, Swimming..."
              value={data.sport === 'none' ? '' : data.sport}
              onChange={e => setData(d => ({ ...d, sport: e.target.value || 'none' }))}
              autoComplete="off"
            />
          </div>
        </div>
      )

      default: return null
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 50,
      background: 'radial-gradient(130% 100% at 100% 0%, #6B4423 0%, #2E1B0E 75%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: 'max(env(safe-area-inset-top, 0px) + 16px, 32px) 20px 40px',
      overflowY: 'auto',
    }}>
      {/* Ambient glow */}
      <div style={{ position: 'fixed', inset: 0, background: 'radial-gradient(70% 50% at 90% 0%, rgba(255,200,140,0.18), transparent 60%)', pointerEvents: 'none' }} />

      {/* Header — logo on first entry, upgrade context when syncing anon data, nothing on edit */}
      {!onDone && (
        <div style={{ textAlign: 'center', marginBottom: 28, position: 'relative' }}>
          <div style={{ fontSize: 28, fontWeight: 800, color: TEXT, letterSpacing: '-1px' }}>
            Mu<span style={{ color: GOLD }}>fasa</span>
          </div>
          <p style={{ fontSize: 12, color: MUTED, marginTop: 4 }}>AI-powered personalised plan</p>
        </div>
      )}
      {onSkip && (
        <div style={{ textAlign: 'center', marginBottom: 20, position: 'relative' }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: GOLD }}>Upgrade your plan</p>
          <p style={{ fontSize: 12, color: MUTED, marginTop: 4 }}>A few more details → more personalised results</p>
        </div>
      )}

      {/* Card */}
      <div style={{
        width: '100%', maxWidth: 420, position: 'relative',
        background: 'rgba(255,255,255,0.04)',
        border: `1px solid rgba(255,255,255,0.1)`,
        borderRadius: 24, padding: '24px 20px',
        backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
      }}>
        {/* Step dots */}
        <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 8 }}>
          {Array.from({ length: TOTAL_STEPS }, (_, i) => (
            <div key={i} style={{
              height: 4, borderRadius: 4,
              width: i === step ? 24 : 6,
              background: i === step ? GOLD : i < step ? 'rgba(228,178,106,0.4)' : 'rgba(255,255,255,0.15)',
              transition: 'all 0.2s',
            }} />
          ))}
        </div>
        <p style={{ textAlign: 'center', fontSize: 10, fontWeight: 700, color: MUTED, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 24 }}>
          {step + 1} of {TOTAL_STEPS} — {stepTitles[step]}
        </p>

        {renderStep()}

        {error && <p style={{ color: DANGER, fontSize: 12, marginTop: 12 }}>{error}</p>}

        {/* Buttons */}
        <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
          {(step > 0 || onDone) && (
            <button
              onClick={() => step > 0 ? (setStep(s => s - 1), setError('')) : onDone?.()}
              style={{
                padding: '14px 20px', borderRadius: 14, cursor: 'pointer',
                background: 'rgba(255,255,255,0.07)', color: MUTED,
                fontSize: 14, fontWeight: 700,
                border: `1px solid ${DIVIDER}`,
              }}>
              {step === 0 ? 'Cancel' : 'Back'}
            </button>
          )}
          <button
            onClick={next}
            disabled={saving}
            style={{
              flex: 1, padding: '14px 0', borderRadius: 14, cursor: 'pointer',
              background: GOLD, color: '#1B1714',
              fontSize: 14, fontWeight: 800,
              border: 'none', opacity: saving ? 0.6 : 1,
              boxShadow: '0 4px 20px rgba(228,178,106,0.3)',
            }}>
            {saving
              ? 'Generating...'
              : step === TOTAL_STEPS - 1
                ? (onDone ? 'Save & Regenerate' : 'Generate My Plan')
                : 'Continue →'}
          </button>
        </div>
      </div>

      {onSkip && (
        <button onClick={onSkip} style={{
          marginTop: 16, background: 'none', border: 'none', cursor: 'pointer',
          fontSize: 13, color: MUTED, textDecoration: 'underline',
        }}>
          Skip for now
        </button>
      )}
    </div>
  )
}
