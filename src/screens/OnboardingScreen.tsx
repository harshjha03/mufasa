import { useState } from 'react'
import { useStore } from '../store/useStore'
import type { Profile } from '../types'

const TOTAL_STEPS = 8
interface ObData {
  name: string; age: string; gender: string; weight: string; height: string
  activity: string; goal: string; sport: string; sport_frequency: string
  injuries: string; wake_time: string; sleep_time: string
  gym_access: string; diet_type: string; monthly_budget: string
}
interface Props { onDone?: () => void }

export default function OnboardingScreen({ onDone }: Props) {
  const { saveProfile, user, profile } = useStore()

  const initial: ObData = profile ? {
    name: profile.name, age: String(profile.age), gender: profile.gender,
    weight: String(profile.weight), height: String(profile.height),
    activity: profile.activity_level, goal: profile.goal,
    sport: profile.sport || 'none', sport_frequency: profile.sport_frequency || '',
    injuries: profile.injuries || 'none', wake_time: profile.wake_time || '6:00 AM',
    sleep_time: profile.sleep_time || '10:30 PM', gym_access: profile.gym_access || 'full_gym',
    diet_type: profile.diet_type || 'non_vegetarian',
    monthly_budget: String(profile.monthly_budget || 5000),
  } : {
    name: '', age: '', gender: '', weight: '', height: '',
    activity: '', goal: '', sport: '', sport_frequency: '',
    injuries: '', wake_time: '6:00 AM', sleep_time: '10:30 PM',
    gym_access: '', diet_type: '', monthly_budget: '5000',
  }

  const [step, setStep] = useState(0)
  const [data, setData] = useState<ObData>(initial)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const bmi = data.weight && data.height ? (parseFloat(data.weight) / ((parseFloat(data.height) / 100) ** 2)).toFixed(1) : null
  const bmiCat = bmi ? (parseFloat(bmi) < 18.5 ? 'Underweight' : parseFloat(bmi) < 25 ? 'Normal weight' : parseFloat(bmi) < 30 ? 'Overweight' : 'Obese') : ''

  const validate = () => {
    if (step === 0 && !data.name.trim()) return 'Please enter your name.'
    if (step === 0 && (!data.age || +data.age < 13 || +data.age > 80)) return 'Enter a valid age.'
    if (step === 1 && !data.gender) return 'Please select a gender.'
    if (step === 2 && (!data.weight || +data.weight < 30)) return 'Enter a valid weight.'
    if (step === 2 && (!data.height || +data.height < 100)) return 'Enter a valid height.'
    if (step === 3 && !data.activity) return 'Please select your activity level.'
    if (step === 4 && !data.goal) return 'Please select your goal.'
    if (step === 5 && !data.sport) return 'Please select an option.'
    if (step === 6 && !data.gym_access) return 'Please select gym access.'
    if (step === 6 && !data.diet_type) return 'Please select diet type.'
    if (step === 7 && (!data.monthly_budget || +data.monthly_budget < 500)) return 'Enter a valid monthly budget (min ₹500).'
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
    }
    await saveProfile(p)
    setSaving(false)
    onDone?.()
  }

  const Opt = ({ field, value, icon, label, sub }: { field: keyof ObData; value: string; icon: string; label: string; sub?: string }) => (
    <button onClick={() => setData(d => ({ ...d, [field]: value }))}
      className={`w-full flex items-center gap-3 p-3.5 rounded-xl border-2 text-left transition-all ${data[field] === value ? 'border-teal bg-teal-pale' : 'border-cream-3 text-ink/70'}`}>
      <span className="text-xl">{icon}</span>
      <div className="flex-1">
        <div className={`font-semibold text-sm ${data[field] === value ? 'text-teal' : 'text-ink'}`}>{label}</div>
        {sub && <div className={`text-xs mt-0.5 ${data[field] === value ? 'text-teal/70' : 'text-ink/30'}`}>{sub}</div>}
      </div>
      {data[field] === value && <span className="text-teal text-sm font-bold">✓</span>}
    </button>
  )

  const Inp = ({ field, label, type = 'text', placeholder }: { field: keyof ObData; label: string; type?: string; placeholder: string }) => (
    <div>
      <label className="text-xs font-bold tracking-widest text-ink/40 uppercase">{label}</label>
      <input className="w-full bg-cream border-2 border-cream-3 focus:border-teal text-ink text-base px-4 py-3 rounded-xl outline-none mt-1.5 transition-colors"
        type={type} placeholder={placeholder} value={data[field]}
        onChange={e => setData(d => ({ ...d, [field]: e.target.value }))} />
    </div>
  )

  const stepTitles = [
    'Basic info', 'Gender', 'Measurements', 'Activity level',
    'Your goal', 'Sport & lifestyle', 'Preferences', 'Budget'
  ]

  const steps = [
    // Step 0 — Name + Age
    <div key={0} className="flex flex-col gap-3">
      <div><h2 className="text-xl font-extrabold text-ink mb-1">Hey, what's your name?</h2><p className="text-xs text-ink/40">We'll personalise your plan with AI</p></div>
      <Inp field="name" label="Full Name" placeholder="e.g. Rohan Sharma" />
      <Inp field="age" label="Age" type="number" placeholder="e.g. 25" />
    </div>,

    // Step 1 — Gender
    <div key={1}>
      <h2 className="text-xl font-extrabold text-ink mb-1">What's your gender?</h2>
      <p className="text-xs text-ink/40 mb-4">Affects metabolic rate calculation</p>
      <div className="flex flex-col gap-2">
        <Opt field="gender" value="male" icon="♂" label="Male" />
        <Opt field="gender" value="female" icon="♀" label="Female" />
        <Opt field="gender" value="other" icon="⚧" label="Other / Prefer not to say" />
      </div>
    </div>,

    // Step 2 — Weight + Height
    <div key={2}>
      <h2 className="text-xl font-extrabold text-ink mb-1">Your measurements</h2>
      <p className="text-xs text-ink/40 mb-4">Used to calculate BMI and calorie targets</p>
      <div className="grid grid-cols-2 gap-3 mb-3">
        <Inp field="weight" label="Weight (kg)" type="number" placeholder="e.g. 75" />
        <Inp field="height" label="Height (cm)" type="number" placeholder="e.g. 175" />
      </div>
      {bmi && (
        <div className="bg-teal-pale rounded-xl px-4 py-3 flex justify-between items-center">
          <div><span className="text-2xl font-extrabold text-teal">{bmi}</span><span className="text-xs text-teal font-bold ml-1">BMI</span></div>
          <span className="text-xs text-teal/70 font-semibold">{bmiCat}</span>
        </div>
      )}
    </div>,

    // Step 3 — Activity
    <div key={3}>
      <h2 className="text-xl font-extrabold text-ink mb-1">How active are you?</h2>
      <p className="text-xs text-ink/40 mb-4">On a typical non-gym day</p>
      <div className="flex flex-col gap-2">
        <Opt field="activity" value="sedentary" icon="🪑" label="Sedentary" sub="Desk job, little movement" />
        <Opt field="activity" value="light" icon="🚶" label="Lightly Active" sub="Some walking, light activity" />
        <Opt field="activity" value="moderate" icon="🏃" label="Moderately Active" sub="Regular movement, active job" />
        <Opt field="activity" value="very" icon="⚡" label="Very Active" sub="Heavy manual work or athlete" />
      </div>
    </div>,

    // Step 4 — Goal
    <div key={4}>
      <h2 className="text-xl font-extrabold text-ink mb-1">What's your main goal?</h2>
      <p className="text-xs text-ink/40 mb-4">Your AI plan will be built around this</p>
      <div className="flex flex-col gap-2">
        <Opt field="goal" value="lose" icon="🔥" label="Lose Fat" sub="Calorie deficit · preserve muscle" />
        <Opt field="goal" value="recomp" icon="⚖️" label="Recomposition" sub="Lose fat and build muscle simultaneously" />
        <Opt field="goal" value="gain" icon="💪" label="Build Muscle" sub="Calorie surplus · maximise gains" />
      </div>
    </div>,

    // Step 5 — Sport + Lifestyle
    <div key={5}>
      <h2 className="text-xl font-extrabold text-ink mb-1">Sport & lifestyle</h2>
      <p className="text-xs text-ink/40 mb-4">AI will create sport-specific protocols for you</p>
      <div className="flex flex-col gap-2 mb-4">
        <Opt field="sport" value="none" icon="🚫" label="No sport" sub="Just gym training" />
        <Opt field="sport" value="cricket" icon="🏏" label="Cricket" sub="Bowling, batting, fielding" />
        <Opt field="sport" value="football" icon="⚽" label="Football / Soccer" />
        <Opt field="sport" value="basketball" icon="🏀" label="Basketball" />
        <Opt field="sport" value="badminton" icon="🏸" label="Badminton" />
        <Opt field="sport" value="running" icon="🏃" label="Running / Jogging" />
        <Opt field="sport" value="other" icon="🎯" label="Other sport" />
      </div>
      {data.sport && data.sport !== 'none' && (
        <div>
          <label className="text-xs font-bold tracking-widest text-ink/40 uppercase">How often?</label>
          <div className="flex flex-col gap-2 mt-2">
            {['Once a week', 'Twice a week', '3x a week', 'Every day'].map(f => (
              <button key={f} onClick={() => setData(d => ({ ...d, sport_frequency: f }))}
                className={`p-3 rounded-xl border-2 text-sm font-medium text-left transition-all ${data.sport_frequency === f ? 'border-teal bg-teal-pale text-teal' : 'border-cream-3 text-ink/60'}`}>
                {f}
              </button>
            ))}
          </div>
        </div>
      )}
      <div className="mt-4">
        <label className="text-xs font-bold tracking-widest text-ink/40 uppercase">Any injuries or limitations?</label>
        <input className="w-full bg-cream border-2 border-cream-3 focus:border-teal text-ink text-sm px-4 py-3 rounded-xl outline-none mt-1.5 transition-colors"
          placeholder="e.g. lower back pain, bad knees (or leave blank)"
          value={data.injuries === 'none' ? '' : data.injuries}
          onChange={e => setData(d => ({ ...d, injuries: e.target.value || 'none' }))} />
      </div>
    </div>,

    // Step 6 — Schedule + Preferences
    <div key={6}>
      <h2 className="text-xl font-extrabold text-ink mb-1">Schedule & preferences</h2>
      <p className="text-xs text-ink/40 mb-4">Meal times will be built around your day</p>
      <div className="grid grid-cols-2 gap-3 mb-4">
        <Inp field="wake_time" label="Wake up time" placeholder="6:00 AM" />
        <Inp field="sleep_time" label="Sleep time" placeholder="10:30 PM" />
      </div>
      <div className="mb-4">
        <label className="text-xs font-bold tracking-widest text-ink/40 uppercase mb-2 block">Gym access</label>
        <div className="flex flex-col gap-2">
          <Opt field="gym_access" value="full_gym" icon="🏋️" label="Full gym" sub="Barbells, cables, machines" />
          <Opt field="gym_access" value="home" icon="🏠" label="Home workout" sub="Dumbbells, resistance bands" />
          <Opt field="gym_access" value="none" icon="🚫" label="No equipment" sub="Bodyweight only" />
        </div>
      </div>
      <div>
        <label className="text-xs font-bold tracking-widest text-ink/40 uppercase mb-2 block">Diet preference</label>
        <div className="flex flex-col gap-2">
          <Opt field="diet_type" value="non_vegetarian" icon="🍗" label="Non-vegetarian" sub="Includes chicken, eggs, fish" />
          <Opt field="diet_type" value="vegetarian" icon="🥗" label="Vegetarian" sub="No meat, eggs ok" />
          <Opt field="diet_type" value="vegan" icon="🌱" label="Vegan" sub="No animal products" />
        </div>
      </div>
    </div>,
  
    // Step 7 — Budget
    <div key={7}>
      <h2 className="text-xl font-extrabold text-ink mb-1">Monthly fitness budget</h2>
      <p className="text-xs text-ink/40 mb-4">AI will estimate costs for gym, supplements & food</p>
      <div className="flex flex-col gap-2 mb-4">
        {[2000, 3000, 5000, 7000, 10000].map(amt => (
          <button key={amt} onClick={() => setData(d => ({ ...d, monthly_budget: String(amt) }))}
            className={`flex justify-between items-center p-3.5 rounded-xl border-2 transition-all ${data.monthly_budget === String(amt) ? 'border-teal bg-teal-pale' : 'border-cream-3'}`}>
            <span className={`font-bold text-sm ${data.monthly_budget === String(amt) ? 'text-teal' : 'text-ink'}`}>₹{amt.toLocaleString('en-IN')}/month</span>
            <span className="text-xs text-ink/40">{amt < 3000 ? 'Tight but doable' : amt < 5000 ? 'Comfortable' : amt < 8000 ? 'Well funded' : 'Premium setup'}</span>
          </button>
        ))}
      </div>
      <div>
        <label className="text-xs font-bold tracking-widest text-ink/40 uppercase">Or enter custom amount</label>
        <div className="flex items-center mt-1.5 bg-cream border-2 border-cream-3 focus-within:border-teal rounded-xl overflow-hidden transition-colors">
          <span className="pl-4 text-ink/40 font-bold">₹</span>
          <input className="flex-1 bg-transparent text-ink text-base px-2 py-3 outline-none font-bold"
            type="number" placeholder="e.g. 6000" value={data.monthly_budget}
            onChange={e => setData(d => ({ ...d, monthly_budget: e.target.value }))} />
          <span className="pr-4 text-xs text-ink/30">/month</span>
        </div>
      </div>
      <div className="bg-cream-2 rounded-xl p-3 mt-3">
        <p className="text-xs text-ink/50 leading-relaxed">🤖 AI will break this into gym + supplements + food allocation with estimated Indian market prices</p>
      </div>
    </div>,
  ]

  return (
    <div className="fixed inset-0 bg-cream flex flex-col items-center justify-center px-6 py-8 overflow-y-auto z-50">
      <div className="font-serif text-3xl text-ink mb-1">Mu<span className="text-teal">fasa</span></div>
      <p className="text-xs text-ink/40 mb-6">{onDone ? 'Update your profile' : 'AI-powered personalised plan'}</p>

      <div className="bg-white rounded-card shadow-lg p-6 w-full max-w-sm">
        {/* Step dots */}
        <div className="flex gap-1.5 justify-center mb-2">
          {Array.from({ length: TOTAL_STEPS }, (_, i) => (
            <div key={i} className={`h-1.5 rounded-full transition-all ${i === step ? 'bg-teal w-6' : i < step ? 'bg-teal-light w-1.5' : 'bg-cream-3 w-1.5'}`} />
          ))}
        </div>
        <p className="text-center text-xs text-ink/30 mb-5 font-semibold uppercase tracking-widest">{step + 1} of {TOTAL_STEPS} — {stepTitles[step]}</p>

        {steps[step]}

        {error && <p className="text-danger text-xs mt-3">{error}</p>}

        <div className="flex gap-2.5 mt-6">
          {(step > 0 || onDone) && (
            <button onClick={() => step > 0 ? (setStep(s => s - 1), setError('')) : onDone?.()}
              className="bg-cream-2 text-ink/60 font-bold text-sm py-3 px-5 rounded-xl active:opacity-70">
              {step === 0 ? 'Cancel' : 'Back'}
            </button>
          )}
          <button onClick={next} disabled={saving}
            className="flex-1 bg-teal text-white font-bold text-sm py-3 rounded-xl disabled:opacity-50 active:opacity-80 transition-all">
            {saving ? '🤖 Generating your plan...' : step === TOTAL_STEPS - 1 ? (onDone ? 'Save & Regenerate 🤖' : 'Generate My Plan 🤖') : 'Continue →'}
          </button>
        </div>
      </div>
    </div>
  )
}
