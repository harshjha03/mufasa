import type { Profile, AIPlan, Meal, Exercise, WorkoutDay, SportProtocol } from '../types'
import { calcMacros } from './gemini'

const GROQ_KEY = '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'
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions'
const MODEL = 'meta-llama/llama-4-scout-17b-16e-instruct'

async function callGroq(prompt: string, maxTokens = 4096): Promise<string> {
  const res = await fetch(GROQ_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${GROQ_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: maxTokens,
      temperature: 0.7,
    })
  })

  if (!res.ok) {
    const err = await res.json()
    throw new Error(`Groq error ${res.status}: ${err.error?.message ?? res.statusText}`)
  }

  const data = await res.json()
  return data.choices?.[0]?.message?.content ?? ''
}

function buildPlanPrompt(profile: Profile, macros: ReturnType<typeof calcMacros>): string {
  return `You are a certified fitness coach and nutritionist. Generate a fully personalised fitness plan.

PROFILE:
- Name: ${profile.name}, Age: ${profile.age}, Gender: ${profile.gender}
- Weight: ${profile.weight}kg, Height: ${profile.height}cm, BMI: ${macros.bmi} (${macros.bmiCat})
- Activity: ${profile.activity_level}, Goal: ${profile.goal}
- Diet: ${profile.diet_type || 'non_vegetarian'}
- Wake: ${profile.wake_time || '06:00'}, Sleep: ${profile.sleep_time || '22:30'}

CALCULATED TARGETS (use exactly):
- Calories: ${macros.calories} kcal, Protein: ${macros.protein}g, Carbs: ${macros.carbs}g, Fat: ${macros.fat}g

STRICT RULES:
- diet vegetarian: NO meat, NO eggs. Use dal, paneer, milk, curd
- diet eggetarian: NO meat. Eggs ok
- diet vegan: NO animal products
- diet non_vegetarian: all foods ok
- All food must be Indian food available in India
- Workout: full gym exercises (barbells, cables, machines)
- Meal times must fit wake/sleep schedule

Respond ONLY with valid JSON, no markdown, no explanation:

{
  "meals": [
    {
      "time": "6:30 AM",
      "name": "Pre-Workout",
      "food": "specific Indian food description",
      "cal": 220, "p": 25, "c": 28, "f": 3,
      "swaps": [{"name": "alternative", "macros": "P:20g C:25g F:3g", "badge": "Lighter"}]
    }
  ],
  "workout": {
    "0": null,
    "1": {"name": "Push Day", "exercises": [{"name": "Bench Press", "sets": "4x10", "muscle": "Chest", "anim": "press"}]},
    "2": {"name": "Pull Day", "exercises": [{"name": "Pull-ups", "sets": "4x8", "muscle": "Lats", "anim": "pull"}]},
    "3": {"name": "Legs", "exercises": [{"name": "Squat", "sets": "4x10", "muscle": "Quads", "anim": "squat"}]},
    "4": null,
    "5": {"name": "Push Day", "exercises": [{"name": "Overhead Press", "sets": "3x10", "muscle": "Shoulders", "anim": "press"}]},
    "6": {"name": "Pull Day", "exercises": [{"name": "Cable Row", "sets": "3x10", "muscle": "Back", "anim": "row"}]}
  },
  "warmup": [
    {"name": "Cat-Cow", "sets": "10 reps", "muscle": "Spine", "anim": "hinge"}
  ],
  "tips": [
    "Personalised tip 1",
    "Tip 2",
    "Tip 3"
  ]
}`
}

function validateAnim(anim: string): string {
  const valid = ['press', 'pull', 'squat', 'curl', 'raise', 'hinge', 'rotate', 'run', 'plank', 'row']
  return valid.includes(anim) ? anim : 'squat'
}

export async function generateAIPlan(profile: Profile): Promise<AIPlan> {
  const macros = calcMacros(profile)

  try {
    const raw = await callGroq(buildPlanPrompt(profile, macros))
    const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const start = cleaned.indexOf('{')
    const end = cleaned.lastIndexOf('}')
    const aiData = JSON.parse(cleaned.slice(start, end + 1))

    const workout: Record<number, WorkoutDay | null> = {}
    for (let d = 0; d <= 6; d++) {
      const day = aiData.workout?.[String(d)] ?? aiData.workout?.[d]
      workout[d] = day ? {
        name: day.name || `Day ${d}`,
        exercises: (day.exercises || []).map((ex: any): Exercise => ({
          name: ex.name || 'Exercise',
          sets: ex.sets || '3x10',
          muscle: ex.muscle || 'Full Body',
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
      name: ex.name, sets: ex.sets, muscle: ex.muscle, anim: validateAnim(ex.anim)
    }))

    return {
      ...macros,
      meals,
      workout,
      warmup,
      tips: aiData.tips || [],
      generatedAt: new Date().toISOString(),
    } as AIPlan

  } catch (err) {
    console.error('Groq plan generation failed:', err)
    return fallbackPlan(profile, macros)
  }
}

function fallbackPlan(profile: Profile, macros: ReturnType<typeof calcMacros>): AIPlan {
  const { calories, protein, carbs, fat } = macros
  const dist = [0.10, 0.20, 0.30, 0.10, 0.20, 0.10]
  const mealTemplates = [
    { time: '6:30 AM', name: 'Pre-Workout', food: '1 banana + 1 scoop whey in water', swaps: [] },
    { time: '8:15 AM', name: 'Post-Gym', food: '4 boiled eggs + 1 glass milk', swaps: [] },
    { time: '1:00 PM', name: 'Lunch', food: 'Dal + rice + sabzi + curd', swaps: [] },
    { time: '4:30 PM', name: 'Snack', food: 'Roasted chana 50g', swaps: [] },
    { time: '9:00 PM', name: 'Dinner', food: '2 roti + dal + sabzi + curd', swaps: [] },
    { time: 'Before Bed', name: 'Night', food: '1 glass milk', swaps: [] },
  ]
  const meals: Meal[] = mealTemplates.map((t, i) => ({
    ...t, cal: Math.round(calories * dist[i]),
    p: Math.round(protein * dist[i]), c: Math.round(carbs * dist[i]), f: Math.round(fat * dist[i])
  }))
  return {
    ...macros,
    meals,
    workout: {
      0: null,
      1: { name: 'Push Day', exercises: [{ name: 'Bench Press', sets: '4x10', muscle: 'Chest', anim: 'press' }, { name: 'Overhead Press', sets: '3x10', muscle: 'Shoulders', anim: 'press' }, { name: 'Lateral Raises', sets: '3x15', muscle: 'Side Delts', anim: 'raise' }, { name: 'Tricep Pushdown', sets: '3x12', muscle: 'Triceps', anim: 'pull' }] },
      2: { name: 'Pull Day', exercises: [{ name: 'Pull-ups', sets: '4x8', muscle: 'Lats', anim: 'pull' }, { name: 'Cable Row', sets: '3x10', muscle: 'Back', anim: 'row' }, { name: 'Barbell Curl', sets: '3x10', muscle: 'Biceps', anim: 'curl' }] },
      3: { name: 'Legs', exercises: [{ name: 'Squat', sets: '4x10', muscle: 'Quads', anim: 'squat' }, { name: 'Romanian Deadlift', sets: '4x12', muscle: 'Hamstrings', anim: 'hinge' }, { name: 'Plank', sets: '3x45s', muscle: 'Core', anim: 'plank' }] },
      4: null,
      5: { name: 'Push + Conditioning', exercises: [{ name: 'Bench Press', sets: '4x10', muscle: 'Chest', anim: 'press' }, { name: 'Sprint Intervals', sets: '8 rounds', muscle: 'Cardio', anim: 'run' }] },
      6: { name: 'Pull Day', exercises: [{ name: 'Pull-ups', sets: '4x8', muscle: 'Lats', anim: 'pull' }, { name: 'Cable Row', sets: '3x10', muscle: 'Back', anim: 'row' }] },
    },
    warmup: [
      { name: 'Cat-Cow', sets: '10 reps', muscle: 'Spine', anim: 'hinge' },
      { name: "Child's Pose", sets: '45 sec', muscle: 'Back', anim: 'squat' },
      { name: 'Hip Flexor Stretch', sets: '30 sec each', muscle: 'Hip Flexors', anim: 'squat' },
      { name: 'Thoracic Rotation', sets: '10 each side', muscle: 'Thoracic Spine', anim: 'rotate' },
    ],
    tips: ['Sleep 8 hours — growth happens at night.', 'Progressive overload every week.', 'Protein in every meal.'],
    generatedAt: new Date().toISOString(),
  } as AIPlan
}
