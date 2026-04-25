import type { Profile, AIPlan, Meal, Exercise, WorkoutDay, SportProtocol } from '../types'

const GEMINI_KEY = 'AIzaSyB_DNvosZuGCYPfXVOOw2S1r5l0faYvJic'
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`

// Mifflin-St Jeor — always calculated locally, not left to AI
export function calcMacros(profile: Profile) {
  const w = Number(profile.weight), h = Number(profile.height), a = Number(profile.age)
  const bmr = profile.gender === 'female'
    ? 10 * w + 6.25 * h - 5 * a - 161
    : 10 * w + 6.25 * h - 5 * a + 5
  const multipliers = { sedentary: 1.2, light: 1.375, moderate: 1.55, very: 1.725 }
  const tdee = Math.round(bmr * multipliers[profile.activity_level])
  const goalAdj = { lose: -350, recomp: 0, gain: 350 }
  const calories = tdee + goalAdj[profile.goal]
  const protein = Math.round(w * 2)
  const fat = Math.round((calories * 0.25) / 9)
  const carbs = Math.round((calories - protein * 4 - fat * 9) / 4)
  const bmiNum = w / ((h / 100) ** 2)
  const bmi = bmiNum.toFixed(1)
  const bmiCat = bmiNum < 18.5 ? 'Underweight' : bmiNum < 25 ? 'Normal' : bmiNum < 30 ? 'Overweight' : 'Obese'
  const workoutLevel = profile.activity_level === 'very' ? 'advanced' : profile.activity_level === 'moderate' ? 'intermediate' : 'beginner'
  const weightTarget = profile.goal === 'lose' ? '−0.5 to −1 kg/month' : profile.goal === 'gain' ? '+0.5 to +1 kg/month' : '±0 kg (recomp)'
  return { bmr: Math.round(bmr), tdee, calories, protein, fat, carbs, bmi, bmiCat, workoutLevel, weightTarget }
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

INSTRUCTIONS:
1. Generate a meal plan with 6 meals timed around their wake/sleep schedule
2. Generate a workout split appropriate for their level and goal (${macros.workoutLevel})
3. If they play a sport, include sport-specific warmup, recovery protocol
4. All food should be practical Indian food available in India
5. Workout exercises must use one of these animation types: press, pull, squat, curl, raise, hinge, rotate, run, plank, row
6. Keep exercises realistic for their gym access level

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

// Rule-based fallback if AI fails
function fallbackPlan(profile: Profile, macros: ReturnType<typeof calcMacros>): AIPlan {
  const { calories, protein, carbs, fat } = macros
  const dist = [0.10, 0.20, 0.30, 0.10, 0.20, 0.10]
  const mealTemplates = [
    { time: '6:30 AM', name: 'Pre-Workout', food: '1 banana + 1 scoop whey in water', swaps: [{ name: 'Oats + whey', macros: 'Higher carbs', badge: 'Option' }] },
    { time: '8:15 AM', name: 'Post-Gym', food: '4 boiled eggs + 1 glass milk', swaps: [{ name: '3 eggs + 100g paneer', macros: 'Higher protein', badge: 'Option' }] },
    { time: '1:00 PM', name: 'Lunch', food: 'Dal + rice + sabzi + curd', swaps: [{ name: 'Rajma + 2 roti + curd', macros: 'Higher protein', badge: 'Option' }] },
    { time: '4:30 PM', name: 'Snack', food: 'Roasted chana 50g', swaps: [{ name: 'Makhana 40g', macros: 'Lighter', badge: 'Option' }] },
    { time: '9:00 PM', name: 'Dinner', food: '2 roti + dal + sabzi + curd', swaps: [{ name: 'Khichdi + curd', macros: 'Easy digestion', badge: 'Option' }] },
    { time: 'Before Bed', name: 'Night', food: '1 glass milk', swaps: [] },
  ]

  const meals: Meal[] = mealTemplates.map((t, i) => ({
    time: t.time, name: t.name, food: t.food,
    cal: Math.round(calories * dist[i]),
    p: Math.round(protein * dist[i]),
    c: Math.round(carbs * dist[i]),
    f: Math.round(fat * dist[i]),
    swaps: t.swaps
  }))

  const defaultWorkout: Record<number, WorkoutDay | null> = {
    0: null,
    1: { name: 'Push Day', exercises: [{ name: 'Bench Press', sets: '4x10', muscle: 'Chest', anim: 'press' }, { name: 'Overhead Press', sets: '3x10', muscle: 'Shoulders', anim: 'press' }, { name: 'Lateral Raises', sets: '3x15', muscle: 'Side Delts', anim: 'raise' }, { name: 'Tricep Pushdown', sets: '3x12', muscle: 'Triceps', anim: 'pull' }] },
    2: { name: 'Pull Day', exercises: [{ name: 'Pull-ups', sets: '4x8', muscle: 'Lats', anim: 'pull' }, { name: 'Cable Row', sets: '3x10', muscle: 'Back', anim: 'row' }, { name: 'Barbell Curl', sets: '3x10', muscle: 'Biceps', anim: 'curl' }, { name: 'Face Pulls', sets: '3x15', muscle: 'Rear Delt', anim: 'pull' }] },
    3: { name: 'Legs + Core', exercises: [{ name: 'Squat', sets: '4x10', muscle: 'Quads', anim: 'squat' }, { name: 'Romanian Deadlift', sets: '4x12', muscle: 'Hamstrings', anim: 'hinge' }, { name: 'Calf Raises', sets: '4x20', muscle: 'Calves', anim: 'squat' }, { name: 'Plank', sets: '3x45s', muscle: 'Core', anim: 'plank' }] },
    4: null,
    5: { name: 'Push + Conditioning', exercises: [{ name: 'Bench Press', sets: '4x10', muscle: 'Chest', anim: 'press' }, { name: 'Overhead Press', sets: '3x10', muscle: 'Shoulders', anim: 'press' }, { name: 'Sprint Intervals', sets: '8 rounds', muscle: 'Cardio', anim: 'run' }] },
    6: { name: 'Pull Day', exercises: [{ name: 'Pull-ups', sets: '4x8', muscle: 'Lats', anim: 'pull' }, { name: 'Cable Row', sets: '3x10', muscle: 'Back', anim: 'row' }, { name: 'Hammer Curl', sets: '3x12', muscle: 'Biceps', anim: 'curl' }] },
  }

  return {
    ...macros,
    meals,
    workout: defaultWorkout,
    warmup: [
      { name: 'Cat-Cow', sets: '10 reps', muscle: 'Spine', anim: 'hinge' },
      { name: "Child's Pose", sets: '45 sec', muscle: 'Back', anim: 'squat' },
      { name: 'Hip Flexor Stretch', sets: '30 sec each', muscle: 'Hip Flexors', anim: 'squat' },
      { name: 'Hamstring Stretch', sets: '45 sec each', muscle: 'Hamstrings', anim: 'hinge' },
      { name: 'Thoracic Rotation', sets: '10 each side', muscle: 'Thoracic Spine', anim: 'rotate' },
    ],
    tips: [
      'Sleep 8 hours — growth happens at night, not the gym.',
      'Progressive overload every week — one more rep or slightly more weight.',
      'Protein in every meal without exception.',
    ],
    generatedAt: new Date().toISOString(),
  } as AIPlan
}
