import { useState, useRef } from 'react'
import { useStore } from '../store/useStore'
import type { Profile } from '../types'

const TOTAL_STEPS = 6
interface ObData {
  name: string; age: string; gender: string; weight: string; height: string
  activity: string; goal: string; sport: string; sport_frequency: string
  injuries: string; wake_time: string; sleep_time: string
  gym_access: string; diet_type: string; monthly_budget: string; body_type: string
}
interface Props { onDone?: () => void }

// Input component defined OUTSIDE parent — never recreated on re-render
function StableInput({ label, value, onChange, type = 'text', placeholder, inputMode }: {
  label: string; value: string; onChange: (v: string) => void
  type?: string; placeholder: string; inputMode?: string
}) {
  return (
    <div>
      <label className="text-xs font-bold tracking-widest text-ink/40 uppercase">{label}</label>
      <input
        className="w-full bg-cream border-2 border-cream-3 focus:border-gold text-ink text-base px-4 py-3 rounded-xl outline-none mt-1.5 transition-colors"
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        inputMode={inputMode as any}
        autoComplete="off"
      />
    </div>
  )
}

// Option button defined OUTSIDE parent
function OptionBtn({ selected, onClick, icon, label, sub }: {
  selected: boolean; onClick: () => void; icon: string; label: string; sub?: string
}) {
  return (
    <button onClick={onClick}
      className={`w-full flex items-center gap-3 p-3.5 rounded-xl border-2 text-left transition-all ${selected ? 'border-gold bg-gold-pale' : 'border-cream-3 text-ink/70'}`}>
      <span className={`ms ms-sm ${selected ? 'text-gold-dark' : 'text-ink/50'}`}>{icon}</span>
      <div className="flex-1">
        <div className={`font-semibold text-sm ${selected ? 'text-gold-dark' : 'text-ink'}`}>{label}</div>
        {sub && <div className={`text-xs mt-0.5 ${selected ? 'text-gold-dark/70' : 'text-ink/30'}`}>{sub}</div>}
      </div>
      {selected && <span className="text-gold-dark text-sm font-bold">✓</span>}
    </button>
  )
}

export default function OnboardingScreen({ onDone }: Props) {
  const { saveProfile, user, profile } = useStore()

  const [step, setStep] = useState(0)
  const [data, setData] = useState<ObData>(() => profile ? {
    name: profile.name, age: String(profile.age), gender: profile.gender,
    weight: String(profile.weight), height: String(profile.height),
    activity: profile.activity_level, goal: profile.goal,
    sport: profile.sport || 'none', sport_frequency: profile.sport_frequency || '',
    injuries: profile.injuries || 'none', wake_time: profile.wake_time || '6:00 AM',
    sleep_time: profile.sleep_time || '10:30 PM', gym_access: profile.gym_access || 'full_gym',
    diet_type: profile.diet_type || 'non_vegetarian',
    monthly_budget: String(profile.monthly_budget || 5000),
    body_type: profile.body_type || 'mesomorph',
  } : {
    name: '', age: '', gender: '', weight: '', height: '',
    activity: '', goal: '', sport: '', sport_frequency: '',
    injuries: '', wake_time: '6:00 AM', sleep_time: '10:30 PM',
    gym_access: '', diet_type: '', monthly_budget: '5000', body_type: '',
  })
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const set = (field: keyof ObData) => (v: string) => setData(d => ({ ...d, [field]: v }))
  const opt = (field: keyof ObData, value: string) => () => setData(d => ({ ...d, [field]: value }))

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
    if (step === 2 && (!data.weight || +data.weight < 30)) return 'Enter a valid weight.'
    if (step === 2 && (!data.height || +data.height < 100)) return 'Enter a valid height.'
    if (step === 4 && !data.activity) return 'Please select your activity level.'
    if (step === 5 && !data.goal) return 'Please select your goal.'
    if (step === 6 && !data.gym_access) return 'Please select gym access.'
    if (step === 6 && !data.diet_type) return 'Please select diet type.'
    if (step === 7 && (!data.monthly_budget || +data.monthly_budget < 500)) return 'Enter a valid budget (min ₹500).'
    return ''
  }

  const next = async () => {
    const err = validate()
    if (err) { setError(err); return }
    setError('')
    if (step < TOTAL_STEPS - 1) { setStep(s => s + 1); return }
    setSaving(true)
    const p: Profile = {
      name: data.name, age: +data.age, gender: data.gender as Profile['gender'],
      weight: +data.weight, height: +data.height,
      activity_level: data.activity as Profile['activity_level'],
      goal: data.goal as Profile['goal'],
      sport: data.sport, sport_frequency: data.sport_frequency || undefined,
      injuries: data.injuries || 'none',
      wake_time: data.wake_time, sleep_time: data.sleep_time,
      gym_access: data.gym_access as Profile['gym_access'],
      diet_type: data.diet_type as Profile['diet_type'],
      monthly_budget: +data.monthly_budget || 5000,
      body_type: data.body_type as Profile['body_type'] || 'mesomorph',
    }
    try {
      await saveProfile(p)
      setSaving(false)
      onDone?.()
    } catch(e: any) {
      setSaving(false)
      setError('Failed to save profile: ' + (e.message || 'Please try again'))
    }
  }

  const stepTitles = ['Basic info', 'Gender', 'Measurements', 'Activity level', 'Your goal', 'Preferences & Budget']

  const renderStep = () => {
    switch (step) {
      case 0: return (
        <div className="flex flex-col gap-3">
          <div><h2 className="text-xl font-extrabold text-ink mb-1">Hey, what's your name?</h2>
            <p className="text-xs text-ink/40 mb-2">We'll personalise everything for you</p></div>
          <StableInput label="Full Name" value={data.name} onChange={set('name')} placeholder="e.g. Rohan Sharma" />
          <StableInput label="Age" value={data.age} onChange={set('age')} type="number" placeholder="e.g. 25" inputMode="numeric" />
        </div>
      )
      case 1: return (
        <div>
          <h2 className="text-xl font-extrabold text-ink mb-1">What's your gender?</h2>
          <p className="text-xs text-ink/40 mb-4">Affects metabolic rate calculation</p>
          <div className="flex flex-col gap-2">
            <OptionBtn selected={data.gender === 'male'} onClick={opt('gender', 'male')} icon="male" label="Male" />
            <OptionBtn selected={data.gender === 'female'} onClick={opt('gender', 'female')} icon="female" label="Female" />
            <OptionBtn selected={data.gender === 'other'} onClick={opt('gender', 'other')} icon="transgender" label="Other / Prefer not to say" />
          </div>
        </div>
      )
      case 2: return (
        <div>
          <h2 className="text-xl font-extrabold text-ink mb-1">Your measurements</h2>
          <p className="text-xs text-ink/40 mb-4">Used to calculate BMI and calorie targets</p>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <StableInput label="Weight (kg)" value={data.weight} onChange={set('weight')} type="number" placeholder="e.g. 75" inputMode="decimal" />
            <StableInput label="Height (cm)" value={data.height} onChange={set('height')} type="number" placeholder="e.g. 175" inputMode="decimal" />
          </div>
          {bmi && (
            <div className="bg-gold-pale rounded-xl px-4 py-3 flex justify-between items-center">
              <div><span className="text-2xl font-extrabold text-gold-dark">{bmi}</span><span className="text-xs text-gold-dark font-bold ml-1">BMI</span></div>
              <span className="text-xs text-gold-dark/70 font-semibold">{bmiCat}</span>
            </div>
          )}
        </div>
      )
      case 3: return (
        <div>
          <h2 className="text-xl font-extrabold text-ink mb-1">How active are you?</h2>
          <p className="text-xs text-ink/40 mb-4">On a typical non-gym day</p>
          <div className="flex flex-col gap-2">
            <OptionBtn selected={data.activity === 'sedentary'} onClick={opt('activity', 'sedentary')} icon="chair" label="Sedentary" sub="Desk job, little movement" />
            <OptionBtn selected={data.activity === 'light'} onClick={opt('activity', 'light')} icon="directions_walk" label="Lightly Active" sub="Some walking, light activity" />
            <OptionBtn selected={data.activity === 'moderate'} onClick={opt('activity', 'moderate')} icon="directions_run" label="Moderately Active" sub="Regular movement, active job" />
            <OptionBtn selected={data.activity === 'very'} onClick={opt('activity', 'very')} icon="bolt" label="Very Active" sub="Heavy manual work or athlete" />
          </div>
        </div>
      )
      case 4: return (
        <div>
          <h2 className="text-xl font-extrabold text-ink mb-1">What's your main goal?</h2>
          <p className="text-xs text-ink/40 mb-4">Your AI plan will be built around this</p>
          <div className="flex flex-col gap-2">
            <OptionBtn selected={data.goal === 'lose'} onClick={opt('goal', 'lose')} icon="local_fire_department" label="Lose Fat" sub="Calorie deficit · preserve muscle" />
            <OptionBtn selected={data.goal === 'recomp'} onClick={opt('goal', 'recomp')} icon="balance" label="Recomposition" sub="Lose fat and build muscle simultaneously" />
            <OptionBtn selected={data.goal === 'gain'} onClick={opt('goal', 'gain')} icon="fitness_center" label="Build Muscle" sub="Calorie surplus · maximise gains" />
          </div>
        </div>
      )
      case 5: return (
        <div>
          <h2 className="text-xl font-extrabold text-ink mb-1">Final details</h2>
          <p className="text-xs text-ink/40 mb-4">Almost done — just a few more things</p>

          {/* Wake/Sleep */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <label className="text-xs font-bold tracking-widest text-ink/40 uppercase">Wake up</label>
              <input type="time" className="w-full bg-cream border-2 border-cream-3 focus:border-gold text-ink text-base px-4 py-3 rounded-xl outline-none mt-1.5 transition-colors"
                value={data.wake_time.includes(':') && !data.wake_time.includes('AM') && !data.wake_time.includes('PM') ? data.wake_time : '06:00'}
                onChange={e => setData(d => ({ ...d, wake_time: e.target.value }))} />
            </div>
            <div>
              <label className="text-xs font-bold tracking-widest text-ink/40 uppercase">Sleep</label>
              <input type="time" className="w-full bg-cream border-2 border-cream-3 focus:border-gold text-ink text-base px-4 py-3 rounded-xl outline-none mt-1.5 transition-colors"
                value={data.sleep_time.includes(':') && !data.sleep_time.includes('AM') && !data.sleep_time.includes('PM') ? data.sleep_time : '22:30'}
                onChange={e => setData(d => ({ ...d, sleep_time: e.target.value }))} />
            </div>
          </div>

          {/* Diet */}
          <div className="mb-4">
            <label className="text-xs font-bold tracking-widest text-ink/40 uppercase mb-2 block">Diet preference</label>
            <div className="flex flex-col gap-2">
              <OptionBtn selected={data.diet_type === 'vegetarian'} onClick={opt('diet_type', 'vegetarian')} icon="restaurant" label="Vegetarian" sub="No meat, no eggs" />
              <OptionBtn selected={data.diet_type === 'eggetarian'} onClick={opt('diet_type', 'eggetarian')} icon="egg" label="Eggetarian" sub="Vegetarian + eggs" />
              <OptionBtn selected={data.diet_type === 'non_vegetarian'} onClick={opt('diet_type', 'non_vegetarian')} icon="set_meal" label="Non-vegetarian" sub="Includes chicken, eggs, fish" />
              <OptionBtn selected={data.diet_type === 'vegan'} onClick={opt('diet_type', 'vegan')} icon="eco" label="Vegan" sub="No animal products" />
            </div>
          </div>

          {/* Budget */}
          <div>
            <label className="text-xs font-bold tracking-widest text-ink/40 uppercase mb-2 block">Monthly fitness budget</label>
            <div className="flex gap-2 flex-wrap mb-2">
              {[2000, 3000, 5000, 7000, 10000].map(amt => (
                <button key={amt} onClick={() => setData(d => ({ ...d, monthly_budget: String(amt) }))}
                  className={`flex-1 min-w-[80px] text-center py-2.5 rounded-xl border-2 transition-all ${data.monthly_budget === String(amt) ? 'border-gold bg-gold-pale text-gold-dark' : 'border-cream-3 text-ink/60'}`}>
                  <p className="font-bold text-xs">₹{(amt/1000).toFixed(0)}k</p>
                </button>
              ))}
            </div>
            <div className="flex items-center bg-cream border-2 border-cream-3 focus-within:border-gold rounded-xl overflow-hidden transition-colors">
              <span className="pl-4 text-ink/40 font-bold text-base">₹</span>
              <input className="flex-1 bg-transparent text-ink text-base px-2 py-3 outline-none"
                type="number" placeholder="custom amount" inputMode="numeric"
                value={data.monthly_budget}
                onChange={e => setData(d => ({ ...d, monthly_budget: e.target.value }))} />
              <span className="pr-4 text-xs text-ink/30">/month</span>
            </div>
          </div>
        </div>
      )
      default: return null
    }
  }


  return (
    <div className="fixed inset-0 bg-cream flex flex-col items-center px-6 py-8 overflow-y-auto z-50 pt-10">
      {!onDone && (
        <div className="text-center mb-6">
          <div className="font-serif text-3xl text-ink mb-1">Mu<span className="text-gold-dark">fasa</span></div>
          <p className="text-xs text-ink/40">AI-powered personalised plan</p>
        </div>
      )}
      <div className="bg-white rounded-card shadow-lg p-6 w-full max-w-sm">
        <div className="flex gap-1.5 justify-center mb-2">
          {Array.from({ length: TOTAL_STEPS }, (_, i) => (
            <div key={i} className={`h-1.5 rounded-full transition-all ${i === step ? 'bg-teal w-6' : i < step ? 'bg-teal-light w-1.5' : 'bg-cream-3 w-1.5'}`} />
          ))}
        </div>
        <p className="text-center text-xs text-ink/30 mb-5 font-semibold uppercase tracking-widest">{step + 1} of {TOTAL_STEPS} — {stepTitles[step]}</p>
        {renderStep()}
        {error && <p className="text-danger text-xs mt-3">{error}</p>}
        <div className="flex gap-2.5 mt-6">
          {(step > 0 || onDone) && (
            <button onClick={() => step > 0 ? (setStep(s => s - 1), setError('')) : onDone?.()}
              className="bg-cream-2 text-ink/60 font-bold text-sm py-3 px-5 rounded-xl active:opacity-70">
              {step === 0 ? 'Cancel' : 'Back'}
            </button>
          )}
          <button onClick={next} disabled={saving}
            className="flex-1 bg-gold text-ink font-bold text-sm py-3 rounded-xl disabled:opacity-50 active:opacity-80">
            {saving ? <><span className="ms ms-sm" style={{fontSize:16}}>smart_toy</span> Generating...</> : step === TOTAL_STEPS - 1 ? (onDone ? <>Save &amp; Regenerate <span className="ms ms-sm" style={{fontSize:16}}>smart_toy</span></> : <>Generate My Plan <span className="ms ms-sm" style={{fontSize:16}}>smart_toy</span></>) : 'Continue →'}
          </button>
        </div>
      </div>
    </div>
  )
}
