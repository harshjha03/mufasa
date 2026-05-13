import type { Profile, AIPlan, Meal, Exercise, WorkoutDay, SportProtocol } from '../types'

const GEMINI_KEY = import.meta.env.VITE_GEMINI_KEY
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`

// ── BODY TYPE DETECTION ──
export function detectBodyType(
  weight: number, height: number,
  activityLevel: string
): 'ectomorph' | 'mesomorph' | 'endomorph' {
  const bmi = weight / ((height / 100) ** 2)
  if (bmi < 18.5) return 'ectomorph'
  if (bmi >= 25) return 'endomorph'
  // Normal BMI — refine by activity
  if (activityLevel === 'moderate' || activityLevel === 'very') return 'mesomorph'
  if (activityLevel === 'sedentary') return 'endomorph'
  return 'mesomorph'
}

// ── MACRO CALCULATION — activity + goal + body type aware ──
export function calcMacros(profile: Profile) {
  const w = Number(profile.weight)
  const h = Number(profile.height)
  const a = Number(profile.age)

  // Step 1 — BMR (Mifflin-St Jeor)
  const bmr = profile.gender === 'female'
    ? 10 * w + 6.25 * h - 5 * a - 161
    : 10 * w + 6.25 * h - 5 * a + 5

  // Step 2 — TDEE
  const activityMultipliers = { sedentary: 1.2, light: 1.375, moderate: 1.55, very: 1.725 }
  const tdee = Math.round(bmr * activityMultipliers[profile.activity_level as keyof typeof activityMultipliers])

  // Step 3 — Body type (use profile override if set, else calculate)
  const bodyType = profile.body_type ?? detectBodyType(w, h, profile.activity_level)

  // Step 4 — Calorie target by goal + body type
  const calorieAdjustments: Record<string, Record<string, number>> = {
    lose:   { ectomorph: -200, mesomorph: -350, endomorph: -500 },
    recomp: { ectomorph: 0,    mesomorph: 0,    endomorph: 0    },
    gain:   { ectomorph: 500,  mesomorph: 300,  endomorph: 150  },
  }
  const calories = Math.max(1200, tdee + (calorieAdjustments[profile.goal]?.[bodyType] ?? 0))

  // Step 5 — Protein by activity + goal + body type
  const proteinBase: Record<string, number> = { sedentary: 0.8, light: 1.2, moderate: 1.5, very: 1.8 }
  const proteinGoalAdj: Record<string, number> = { lose: 0.2, recomp: 0.2, gain: 0.3 }
  const proteinBodyAdj: Record<string, number> = { ectomorph: -0.1, mesomorph: 0, endomorph: 0.1 }
  const proteinMultiplier =
    (proteinBase[profile.activity_level] ?? 1.2) +
    (proteinGoalAdj[profile.goal] ?? 0) +
    (proteinBodyAdj[bodyType] ?? 0)
  const protein = Math.round(w * proteinMultiplier)

  // Step 6 — Fat & carbs by body type macro ratios
  const macroRatios: Record<string, { fatPct: number }> = {
    ectomorph:  { fatPct: 0.20 }, // high carb
    mesomorph:  { fatPct: 0.25 }, // balanced
    endomorph:  { fatPct: 0.30 }, // low carb
  }
  const fat = Math.round((calories * (macroRatios[bodyType]?.fatPct ?? 0.25)) / 9)
  const carbs = Math.round((calories - protein * 4 - fat * 9) / 4)

  // Meta
  const bmiNum = w / ((h / 100) ** 2)
  const bmi = bmiNum.toFixed(1)
  const bmiCat = bmiNum < 18.5 ? 'Underweight' : bmiNum < 25 ? 'Normal' : bmiNum < 30 ? 'Overweight' : 'Obese'
  const workoutLevel = profile.activity_level === 'very' ? 'advanced' : profile.activity_level === 'moderate' ? 'intermediate' : 'beginner'
  const weightTarget = profile.goal === 'lose' ? '−0.5 to −1 kg/month' : profile.goal === 'gain' ? '+0.5 to +1 kg/month' : '±0 kg (recomp)'

  return { bmr: Math.round(bmr), tdee, calories, protein, fat, carbs, bmi, bmiCat, workoutLevel, weightTarget, bodyType }
}

function buildPrompt(profile: Profile, macros: ReturnType<typeof calcMacros>): string {
  return `You are a certified fitness coach and nutritionist. Generate a fully personalised fitness plan for this person.

PROFILE:
- Name: ${profile.name}
- Age: ${profile.age}, Gender: ${profile.gender}
- Weight: ${profile.weight}kg, Height: ${profile.height}cm, BMI: ${macros.bmi} (${macros.bmiCat})
- Activity level: ${profile.activity_level}
- Goal: ${profile.goal === 'lose' ? 'Lose fat' : profile.goal === 'gain' ? 'Build muscle' : 'Body recomposition'}
- Sport: ${profile.sport || 'none'} ${profile.sport_frequency ? `(${profile.sport_frequency})` : ''}
- Injuries/limitations: ${profile.injuries || 'none'}
- Wake time: ${profile.wake_time || '6:00 AM'}, Sleep time: ${profile.sleep_time || '10:30 PM'}
- Gym access: ${profile.gym_access || 'full_gym'}
- Diet: ${profile.diet_type || 'non_vegetarian'}

CALCULATED NUTRITION TARGETS (use these exact numbers):
- Daily calories: ${macros.calories} kcal
- Protein: ${macros.protein}g, Carbs: ${macros.carbs}g, Fat: ${macros.fat}g
- TDEE: ${macros.tdee} kcal

STRICT RULES — FOLLOW EXACTLY:

WORKOUT RULES:
- gym_access = 'full_gym': Use barbell, cable, machine exercises (Bench Press, Lat Pulldown, Leg Press etc.)
- gym_access = 'home': Use ONLY dumbbell and bodyweight exercises. NO barbells, NO cables, NO machines. Examples: Dumbbell Press, Dumbbell Row, Push-ups, Pull-ups
- gym_access = 'none': Use ONLY bodyweight exercises. NO equipment whatsoever. Examples: Push-ups, Pull-ups, Squats, Lunges, Plank
- VIOLATION: Recommending gym exercises when gym_access is 'home' or 'none' is a critical error

NUTRITION RULES:
- diet_type = 'vegetarian': NO meat, NO eggs. Use dal, paneer, milk, curd, legumes
- diet_type = 'eggetarian': NO meat. Eggs are ok. Use eggs, dal, paneer, milk
- diet_type = 'vegan': NO animal products at all. Use dal, tofu, plant milk, legumes
- diet_type = 'non_vegetarian': All foods ok including chicken, eggs, fish

BUDGET RULES:
- monthly_budget < 3000: NO supplements (no whey, no creatine). Use whole food protein only
- gym_access != 'full_gym': NO gym membership in budget

GENERAL:
- Generate a meal plan with 6 meals timed around their wake/sleep schedule
- All food must be practical Indian food available in India
- Workout exercises must use animation type from: press, pull, squat, curl, raise, hinge, rotate, run, plank, row

Respond ONLY with a valid JSON object. No markdown, no backticks, no explanation. Just the JSON.

{
  "meals": [
    {
      "time": "6:30 AM",
      "name": "Pre-Workout",
      "food": "specific food description",
      "cal": 220,
      "p": 25,
      "c": 28,
      "f": 3,
      "swaps": [
        { "name": "alternative food", "macros": "P:20g C:25g F:3g", "badge": "Lighter option" },
        { "name": "another alternative", "macros": "P:22g C:30g F:4g", "badge": "Higher carbs" }
      ]
    }
  ],
  "workout": {
    "0": ${profile.sport ? `{ "name": "${profile.sport} Day", "exercises": [{ "name": "exercise name", "sets": "3x10", "muscle": "Chest", "anim": "press" }] }` : 'null'},
    "1": { "name": "Day name e.g. Push Day", "exercises": [{ "name": "Bench Press", "sets": "4x10", "muscle": "Chest", "anim": "press" }] },
    "2": { "name": "Day name", "exercises": [] },
    "3": { "name": "Day name", "exercises": [] },
    "4": null,
    "5": { "name": "Day name", "exercises": [] },
    "6": { "name": "Day name", "exercises": [] }
  },
  "warmup": [
    { "name": "Cat-Cow", "sets": "10 reps", "muscle": "Spine", "anim": "hinge" }
  ],
  ${profile.sport && profile.sport !== 'none' ? `"sportProtocol": {
    "pre": ["warmup step 1", "warmup step 2"],
    "post": ["recovery step 1", "recovery step 2"],
    "nutrition": "what to eat/drink around sport",
    "recovery": "recovery advice"
  },` : ''}
  "tips": [
    "Personalised tip 1 based on their specific situation",
    "Tip 2",
    "Tip 3"
  ]
}`
}

export async function generateAIPlan(profile: Profile): Promise<AIPlan> {
  const macros = calcMacros(profile)

  try {
    const response = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: buildPrompt(profile, macros) }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 4096,
        }
      })
    })

    if (!response.ok) throw new Error(`Gemini API error: ${response.status}`)

    const data = await response.json()
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text ?? ''

    // Clean up response — remove any markdown fences if present
    const cleaned = rawText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const aiData = JSON.parse(cleaned)

    // Validate and normalise workout — ensure all 7 days exist
    const workout: Record<number, WorkoutDay | null> = {}
    for (let d = 0; d <= 6; d++) {
      const day = aiData.workout?.[String(d)] ?? aiData.workout?.[d]
      workout[d] = day ? {
        name: day.name || `Day ${d}`,
        exercises: (day.exercises || []).map((ex: any): Exercise => ({
          name: ex.name || ex.n || 'Exercise',
          sets: ex.sets || ex.s || '3x10',
          muscle: ex.muscle || ex.m || 'Full Body',
          anim: validateAnim(ex.anim),
        }))
      } : null
    }

    const meals: Meal[] = (aiData.meals || []).map((m: any): Meal => ({
      time: m.time, name: m.name, food: m.food,
      cal: Number(m.cal) || 0, p: Number(m.p) || 0, c: Number(m.c) || 0, f: Number(m.f) || 0,
      swaps: (m.swaps || []).map((s: any) => ({ name: s.name, macros: s.macros, badge: s.badge || 'Option' }))
    }))

    const warmup: Exercise[] = (aiData.warmup || []).map((ex: any): Exercise => ({
      name: ex.name || ex.n, sets: ex.sets || ex.s, muscle: ex.muscle || ex.m, anim: validateAnim(ex.anim)
    }))

    const sportProtocol: SportProtocol | undefined = aiData.sportProtocol ?? undefined

    return {
      ...macros,
      meals,
      workout,
      warmup,
      sportProtocol,
      tips: (aiData.tips || []) as string[],
      generatedAt: new Date().toISOString(),
    } as AIPlan

  } catch (err) {
    console.error('Gemini plan generation failed:', err)
    // Fallback to rule-based plan
    return fallbackPlan(profile, macros)
  }
}

function validateAnim(anim: string): string {
  const valid = ['press', 'pull', 'squat', 'curl', 'raise', 'hinge', 'rotate', 'run', 'plank', 'row']
  return valid.includes(anim) ? anim : 'squat'
}

// Rule-based fallback if AI fails — fully personalised by profile
function fallbackPlan(profile: Profile, macros: ReturnType<typeof calcMacros>): AIPlan {
  const { calories, protein, carbs, fat } = macros
  const dist = [0.10, 0.20, 0.30, 0.10, 0.20, 0.10]

  // ── Wake / sleep times ─────────────────────────────────────
  const wake  = profile.wake_time  || '06:00'
  const sleep = profile.sleep_time || '22:30'
  const wakeH = parseInt(wake.split(':')[0])
  const fmt   = (h: number, m = 0) => {
    const hr = ((h % 24) + 24) % 24
    return `${hr % 12 === 0 ? 12 : hr % 12}:${String(m).padStart(2, '0')} ${hr < 12 ? 'AM' : 'PM'}`
  }

  // ── Meal templates by diet type ────────────────────────────
  const isVeg   = profile.diet_type === 'vegetarian'
  const isVegan = profile.diet_type === 'vegan'
  const hasEgg  = !isVeg && !isVegan  // non_veg or eggetarian

  const proteinFood = isVegan
    ? { main: 'Tofu scramble 150g + 1 glass soy milk', swap: 'Moong dal chilla 2 pcs + peanut butter 1 tbsp' }
    : isVeg
    ? { main: '100g paneer bhurji + 1 glass milk', swap: '2 moong dal chilla + curd 100g' }
    : hasEgg
    ? { main: '4 boiled eggs + 1 glass milk', swap: '3 eggs omelette + 100g paneer' }
    : { main: '150g grilled chicken + 1 glass milk', swap: '4 boiled eggs + 100g paneer' }

  const lunchFood = isVegan
    ? { main: '150g rajma/chhole + 1 cup brown rice + sabzi', swap: '2 whole wheat roti + tofu sabzi + dal' }
    : isVeg
    ? { main: '150g dal + 1 cup rice + sabzi + curd 100g', swap: 'Rajma + 2 roti + curd' }
    : { main: '150g chicken/fish + 1 cup rice + dal + sabzi', swap: '4 eggs bhurji + 2 roti + dal' }

  const dinnerFood = isVegan
    ? { main: '2 whole wheat roti + moong dal + mixed sabzi', swap: 'Khichdi (rice + moong) + pickle' }
    : isVeg
    ? { main: '2 roti + dal + sabzi + curd', swap: 'Paneer sabzi + 1 roti + dal soup' }
    : { main: '150g chicken/fish + 2 roti + sabzi', swap: '3 eggs + 2 roti + dal' }

  const nightFood = isVegan
    ? { main: '1 glass soy/almond milk + handful almonds', swap: 'Banana + peanut butter 1 tbsp' }
    : isVeg
    ? { main: '1 glass warm milk + 5 soaked almonds', swap: '100g curd + 1 tsp honey' }
    : { main: '1 glass milk + 5 almonds', swap: '100g curd + banana' }

  const mealTemplates = [
    {
      time: fmt(wakeH + 1), name: 'Morning',
      food: isVegan ? 'Banana + overnight oats in almond milk' : 'Banana + oats 50g + 1 tsp peanut butter',
      swaps: [{ name: 'Poha + 1 glass milk', macros: 'Lighter start', badge: 'Option' }]
    },
    {
      time: fmt(wakeH + 2, 30), name: 'Post-Workout',
      food: proteinFood.main,
      swaps: [{ name: proteinFood.swap, macros: 'Higher protein', badge: 'Option' }]
    },
    {
      time: '1:00 PM', name: 'Lunch',
      food: lunchFood.main,
      swaps: [{ name: lunchFood.swap, macros: 'Higher protein', badge: 'Option' }]
    },
    {
      time: '5:00 PM', name: 'Snack',
      food: isVegan ? 'Roasted chana 40g + 1 fruit' : 'Roasted chana 40g + curd 100g',
      swaps: [{ name: 'Makhana 30g + green tea', macros: 'Lighter', badge: 'Lighter' }]
    },
    {
      time: fmt(parseInt(sleep.split(':')[0]) - 2), name: 'Dinner',
      food: dinnerFood.main,
      swaps: [{ name: dinnerFood.swap, macros: 'Easy digestion', badge: 'Option' }]
    },
    {
      time: fmt(parseInt(sleep.split(':')[0]) - 1), name: 'Before Bed',
      food: nightFood.main,
      swaps: [{ name: nightFood.swap, macros: 'Alternative', badge: 'Option' }]
    },
  ]

  const meals: Meal[] = mealTemplates.map((t, i) => ({
    time: t.time, name: t.name, food: t.food,
    cal: Math.round(calories * dist[i]),
    p: Math.round(protein * dist[i]),
    c: Math.round(carbs * dist[i]),
    f: Math.round(fat * dist[i]),
    swaps: t.swaps,
  }))

  // ── Workout templates by gym access + goal ─────────────────
  const isHome = profile.gym_access === 'home'
  const isNone = profile.gym_access === 'none'
  const isLose = profile.goal === 'lose'
  const isGain = profile.goal === 'gain'
  const isBeginner = profile.activity_level === 'sedentary' || profile.activity_level === 'light'
  const sets = isBeginner ? '3x10' : '4x10'
  const heavySets = isBeginner ? '3x8' : '4x8'

  // Push exercises
  const pushEx: Exercise[] = isNone
    ? [
        { name: 'Push-ups', sets, muscle: 'Chest', anim: 'press' },
        { name: 'Wide Push-ups', sets: '3x12', muscle: 'Chest', anim: 'press' },
        { name: 'Pike Push-ups', sets: '3x10', muscle: 'Shoulders', anim: 'press' },
        { name: 'Tricep Dips (chair)', sets: '3x12', muscle: 'Triceps', anim: 'pull' },
      ]
    : isHome
    ? [
        { name: 'Dumbbell Bench Press', sets, muscle: 'Chest', anim: 'press' },
        { name: 'Dumbbell Shoulder Press', sets, muscle: 'Shoulders', anim: 'press' },
        { name: 'Dumbbell Lateral Raises', sets: '3x15', muscle: 'Side Delts', anim: 'raise' },
        { name: 'Tricep Overhead Extension', sets: '3x12', muscle: 'Triceps', anim: 'press' },
      ]
    : [
        { name: 'Bench Press', sets, muscle: 'Chest', anim: 'press' },
        { name: 'Overhead Press', sets, muscle: 'Shoulders', anim: 'press' },
        { name: 'Lateral Raises', sets: '3x15', muscle: 'Side Delts', anim: 'raise' },
        { name: 'Tricep Pushdown', sets: '3x12', muscle: 'Triceps', anim: 'pull' },
      ]

  // Pull exercises
  const pullEx: Exercise[] = isNone
    ? [
        { name: 'Pull-ups', sets: heavySets, muscle: 'Lats', anim: 'pull' },
        { name: 'Inverted Rows (table)', sets: '3x10', muscle: 'Back', anim: 'row' },
        { name: 'Chin-ups', sets: '3x8', muscle: 'Biceps', anim: 'pull' },
        { name: 'Superman Hold', sets: '3x30s', muscle: 'Lower Back', anim: 'hinge' },
      ]
    : isHome
    ? [
        { name: 'Pull-ups', sets: heavySets, muscle: 'Lats', anim: 'pull' },
        { name: 'Dumbbell Row', sets, muscle: 'Back', anim: 'row' },
        { name: 'Dumbbell Curl', sets: '3x12', muscle: 'Biceps', anim: 'curl' },
        { name: 'Dumbbell Reverse Fly', sets: '3x15', muscle: 'Rear Delt', anim: 'raise' },
      ]
    : [
        { name: 'Lat Pulldown', sets, muscle: 'Lats', anim: 'pull' },
        { name: 'Cable Row', sets, muscle: 'Back', anim: 'row' },
        { name: 'Barbell Curl', sets: '3x10', muscle: 'Biceps', anim: 'curl' },
        { name: 'Face Pulls', sets: '3x15', muscle: 'Rear Delt', anim: 'pull' },
      ]

  // Leg exercises
  const legEx: Exercise[] = isNone
    ? [
        { name: 'Bodyweight Squat', sets: '4x15', muscle: 'Quads', anim: 'squat' },
        { name: 'Bulgarian Split Squat', sets: '3x10', muscle: 'Quads', anim: 'squat' },
        { name: 'Glute Bridge', sets: '3x20', muscle: 'Glutes', anim: 'hinge' },
        { name: 'Plank', sets: '3x45s', muscle: 'Core', anim: 'plank' },
      ]
    : isHome
    ? [
        { name: 'Dumbbell Squat', sets, muscle: 'Quads', anim: 'squat' },
        { name: 'Romanian Deadlift (DBs)', sets: '3x12', muscle: 'Hamstrings', anim: 'hinge' },
        { name: 'Dumbbell Lunges', sets: '3x12', muscle: 'Glutes', anim: 'squat' },
        { name: 'Plank', sets: '3x45s', muscle: 'Core', anim: 'plank' },
      ]
    : [
        { name: 'Barbell Squat', sets, muscle: 'Quads', anim: 'squat' },
        { name: 'Romanian Deadlift', sets: '4x12', muscle: 'Hamstrings', anim: 'hinge' },
        { name: 'Leg Press', sets: '3x12', muscle: 'Quads', anim: 'squat' },
        { name: 'Plank', sets: '3x45s', muscle: 'Core', anim: 'plank' },
      ]

  // Cardio / conditioning day (for fat loss)
  const cardioEx: Exercise[] = isNone || isHome
    ? [
        { name: 'Jump Squats', sets: '4x15', muscle: 'Quads', anim: 'squat' },
        { name: 'Burpees', sets: '4x10', muscle: 'Full Body', anim: 'squat' },
        { name: 'Mountain Climbers', sets: '3x30s', muscle: 'Core', anim: 'plank' },
        { name: 'High Knees', sets: '4x30s', muscle: 'Cardio', anim: 'run' },
      ]
    : [
        { name: 'Treadmill (incline walk)', sets: '20 min', muscle: 'Cardio', anim: 'run' },
        { name: 'Leg Press', sets: '3x15', muscle: 'Quads', anim: 'squat' },
        { name: 'Cable Crunches', sets: '3x15', muscle: 'Core', anim: 'plank' },
        { name: 'Sprint Intervals', sets: '8x30s', muscle: 'Cardio', anim: 'run' },
      ]

  // Build workout schedule based on frequency preference
  const trainingDays = isBeginner ? 3 : profile.activity_level === 'moderate' ? 4 : 5
  const restDay = null

  let workout: Record<number, WorkoutDay | null>
  if (isLose) {
    // Fat loss: more frequency, add cardio day
    workout = {
      0: restDay,
      1: { name: 'Full Body A', exercises: [...pushEx.slice(0, 2), ...pullEx.slice(0, 2), ...legEx.slice(0, 2)] },
      2: { name: 'Cardio + Core', exercises: cardioEx },
      3: { name: 'Full Body B', exercises: [...pushEx.slice(2), ...pullEx.slice(2), ...legEx.slice(2)] },
      4: trainingDays >= 4 ? { name: 'Cardio + Core', exercises: cardioEx } : restDay,
      5: trainingDays >= 5 ? { name: 'Full Body A', exercises: [...pushEx.slice(0, 2), ...pullEx.slice(0, 2), ...legEx.slice(0, 2)] } : restDay,
      6: restDay,
    }
  } else if (isGain) {
    // Muscle gain: PPL split with heavier focus
    workout = {
      0: restDay,
      1: { name: 'Push Day', exercises: pushEx },
      2: { name: 'Pull Day', exercises: pullEx },
      3: { name: 'Legs + Core', exercises: legEx },
      4: trainingDays <= 3 ? restDay : { name: 'Push Day (Heavy)', exercises: pushEx.map(e => ({ ...e, sets: isBeginner ? '3x8' : '5x5' })) },
      5: trainingDays <= 4 ? restDay : { name: 'Pull Day (Heavy)', exercises: pullEx.map(e => ({ ...e, sets: isBeginner ? '3x8' : '5x5' })) },
      6: restDay,
    }
  } else {
    // Recomp: balanced PPL
    workout = {
      0: restDay,
      1: { name: 'Push Day', exercises: pushEx },
      2: { name: 'Pull Day', exercises: pullEx },
      3: { name: 'Legs + Core', exercises: legEx },
      4: trainingDays >= 4 ? { name: 'Cardio + Core', exercises: cardioEx } : restDay,
      5: trainingDays >= 5 ? { name: 'Push + Pull', exercises: [...pushEx.slice(0, 2), ...pullEx.slice(0, 2)] } : restDay,
      6: restDay,
    }
  }

  // ── Personalised tips ──────────────────────────────────────
  const goalTip = isLose
    ? `You're in a ~${macros.tdee - macros.calories} kcal deficit. Weigh yourself weekly at the same time — expect −0.5 to −1 kg/month.`
    : isGain
    ? `You're in a ~${macros.calories - macros.tdee} kcal surplus. Track lifts weekly — if you're not adding reps/weight, eat more.`
    : 'Recomp is slow — trust the process. Body fat drops and muscle builds simultaneously over 3–6 months.'

  const gymTip = isNone
    ? 'No equipment needed — bodyweight done right beats a bad gym session. Focus on tempo: 3 sec down, 1 sec up.'
    : isHome
    ? 'Home training works. Invest in adjustable dumbbells and a pull-up bar — that unlocks 90% of all exercises.'
    : 'Log every lift. Progressive overload (one more rep or 2.5kg more per week) is the only real driver of growth.'

  const dietTip = isVegan
    ? 'Combine rice + dal in every meal — together they form a complete amino acid profile. Add flaxseeds for omega-3.'
    : isVeg
    ? 'Paneer + milk + curd across meals gets you to your protein target. Don\'t skip curd — it aids digestion and recovery.'
    : `Aim for ${Math.round(macros.protein / 6)}g protein per meal across 6 meals to hit your ${macros.protein}g daily target.`

  return {
    ...macros,
    meals,
    workout,
    warmup: [
      { name: 'Cat-Cow', sets: '10 reps', muscle: 'Spine', anim: 'hinge' },
      { name: "Child's Pose", sets: '45 sec', muscle: 'Back', anim: 'squat' },
      { name: 'Hip Flexor Stretch', sets: '30 sec each', muscle: 'Hip Flexors', anim: 'squat' },
      { name: 'Hamstring Stretch', sets: '45 sec each', muscle: 'Hamstrings', anim: 'hinge' },
      { name: 'Thoracic Rotation', sets: '10 each side', muscle: 'Thoracic Spine', anim: 'rotate' },
    ],
    tips: [goalTip, gymTip, dietTip],
    generatedAt: new Date().toISOString(),
  } as AIPlan
}