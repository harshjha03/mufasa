import type { Profile, AIPlan, WeightEntry, PersonalRecord, Expense } from '../types'

export const DEMO_PROFILE: Profile = {
  name: 'Rohan Sharma',
  age: 25,
  gender: 'male',
  weight: 78,
  height: 175,
  activity_level: 'moderate',
  goal: 'lose',
  gym_access: 'full_gym',
  diet_type: 'non_vegetarian',
  wake_time: '06:00',
  sleep_time: '22:30',
  sport: 'none',
  injuries: 'none',
  body_type: 'mesomorph',
}

export const DEMO_PLAN: AIPlan = {
  bmr: 1820,
  tdee: 2460,
  calories: 1950,
  protein: 155,
  carbs: 185,
  fat: 55,
  bmi: '25.5',
  bmiCat: 'Overweight',
  weightTarget: '−0.5 to −1 kg/month',
  workoutLevel: 'intermediate',
  generatedAt: '2026-04-27T06:00:00.000Z',
  tips: [
    'Hit 155g protein daily — batch-cook chicken and boil eggs on Sunday.',
    'Sleep is your biggest fat-loss lever. In bed by 10:30 PM, lights out.',
    'Week 8–10 is where most people quit. Keep showing up.',
  ],
  warmup: [
    { name: 'Jump Rope', sets: '3 min', muscle: 'cardio', anim: 'run' },
    { name: 'Hip Circles', sets: '2 × 10 each', muscle: 'hips', anim: 'rotate' },
    { name: 'Band Pull-Apart', sets: '2 × 15', muscle: 'shoulders', anim: 'pull' },
  ],
  meals: [
    {
      time: '6:30 AM', name: 'Pre-workout', food: 'Banana + 1 tbsp peanut butter',
      cal: 200, p: 5, c: 35, f: 6,
      swaps: [{ name: 'Dates + almonds', macros: '190 kcal · 4p · 32c · 7f', badge: 'Vegan' }],
    },
    {
      time: '8:00 AM', name: 'Breakfast', food: '4 whole eggs + 2 slices brown bread',
      cal: 480, p: 32, c: 38, f: 18,
      swaps: [{ name: 'Paneer bhurji + roti', macros: '460 kcal · 28p · 40c · 16f', badge: 'Veg' }],
    },
    {
      time: '1:00 PM', name: 'Lunch', food: 'Dal tadka + brown rice + cucumber salad',
      cal: 520, p: 18, c: 78, f: 8,
      swaps: [{ name: 'Rajma chawal', macros: '540 kcal · 20p · 82c · 7f', badge: 'Veg' }],
    },
    {
      time: '4:00 PM', name: 'Snack', food: 'Whey protein shake + 1 apple',
      cal: 200, p: 30, c: 20, f: 2,
      swaps: [{ name: 'Chana chaat', macros: '240 kcal · 12p · 38c · 4f', badge: 'Veg' }],
    },
    {
      time: '8:00 PM', name: 'Dinner', food: 'Grilled chicken breast + 2 chapati + palak sabzi',
      cal: 550, p: 70, c: 14, f: 21,
      swaps: [{ name: 'Tofu stir-fry + quinoa', macros: '510 kcal · 32p · 50c · 15f', badge: 'Vegan' }],
    },
  ],
  workout: {
    0: null, // Sun — rest
    1: {
      name: 'Push Day',
      exercises: [
        { name: 'Barbell Bench Press', sets: '4 × 8-10', muscle: 'chest', anim: 'press' },
        { name: 'Incline Dumbbell Press', sets: '3 × 10-12', muscle: 'chest', anim: 'press' },
        { name: 'Cable Flyes', sets: '3 × 12-15', muscle: 'chest', anim: 'raise' },
        { name: 'Tricep Pushdowns', sets: '3 × 12-15', muscle: 'triceps', anim: 'press' },
        { name: 'Overhead Tricep Extension', sets: '3 × 10-12', muscle: 'triceps', anim: 'curl' },
      ],
    },
    2: {
      name: 'Pull Day',
      exercises: [
        { name: 'Pull-ups', sets: '4 × 6-8', muscle: 'back', anim: 'pull' },
        { name: 'Barbell Row', sets: '4 × 8-10', muscle: 'back', anim: 'row' },
        { name: 'Lat Pulldown', sets: '3 × 10-12', muscle: 'back', anim: 'pull' },
        { name: 'Dumbbell Curl', sets: '3 × 12-15', muscle: 'biceps', anim: 'curl' },
        { name: 'Hammer Curl', sets: '3 × 12-15', muscle: 'biceps', anim: 'curl' },
      ],
    },
    3: null, // Wed — rest
    4: {
      name: 'Leg Day',
      exercises: [
        { name: 'Barbell Squat', sets: '4 × 8-10', muscle: 'quads', anim: 'squat' },
        { name: 'Romanian Deadlift', sets: '4 × 10-12', muscle: 'hamstrings', anim: 'hinge' },
        { name: 'Leg Press', sets: '3 × 12-15', muscle: 'quads', anim: 'squat' },
        { name: 'Walking Lunges', sets: '3 × 12 each', muscle: 'quads', anim: 'squat' },
        { name: 'Standing Calf Raises', sets: '4 × 15-20', muscle: 'calves', anim: 'raise' },
      ],
    },
    5: {
      name: 'Shoulders & Arms',
      exercises: [
        { name: 'Overhead Press', sets: '4 × 8-10', muscle: 'shoulders', anim: 'press' },
        { name: 'Lateral Raises', sets: '4 × 12-15', muscle: 'shoulders', anim: 'raise' },
        { name: 'Front Raises', sets: '3 × 12-15', muscle: 'shoulders', anim: 'raise' },
        { name: 'EZ Bar Curl', sets: '3 × 10-12', muscle: 'biceps', anim: 'curl' },
        { name: 'Skull Crushers', sets: '3 × 10-12', muscle: 'triceps', anim: 'press' },
      ],
    },
    6: null, // Sat — rest
  },
}

export const DEMO_WEIGHT_LOG: WeightEntry[] = [
  { date: '2026-04-27', weight: 79.5 },
  { date: '2026-05-04', weight: 79.1 },
  { date: '2026-05-11', weight: 78.7 },
  { date: '2026-05-18', weight: 78.2 },
  { date: '2026-05-25', weight: 77.9 },
  { date: '2026-06-01', weight: 77.5 },
  { date: '2026-06-08', weight: 77.1 },
  { date: '2026-06-15', weight: 76.8 },
  { date: '2026-06-22', weight: 76.4 },
  { date: '2026-06-30', weight: 76.0 },
]

export const DEMO_EXPENSES: Expense[] = [
  { id: 'de1', name: 'Gym membership',   amount: 1500, cat: 'gym',        month: '2026-06', date: '2026-06-01' },
  { id: 'de2', name: 'Whey protein 1kg', amount: 2800, cat: 'supplement', month: '2026-06', date: '2026-06-03' },
  { id: 'de3', name: 'Creatine 300g',    amount: 600,  cat: 'supplement', month: '2026-06', date: '2026-06-03' },
  { id: 'de4', name: 'Chicken breast 2kg',amount: 480, cat: 'food',       month: '2026-06', date: '2026-06-10' },
  { id: 'de5', name: 'Brown bread + eggs',amount: 320, cat: 'food',       month: '2026-06', date: '2026-06-10' },
  { id: 'de6', name: 'Gym gloves',       amount: 450,  cat: 'gym',        month: '2026-06', date: '2026-06-15' },
  { id: 'de7', name: 'Gym membership',   amount: 1500, cat: 'gym',        month: '2026-05', date: '2026-05-01' },
  { id: 'de8', name: 'Whey protein 1kg', amount: 2800, cat: 'supplement', month: '2026-05', date: '2026-05-05' },
  { id: 'de9', name: 'Chicken breast 2kg',amount: 480, cat: 'food',       month: '2026-05', date: '2026-05-12' },
]

export const DEMO_PRS: Record<string, PersonalRecord> = {
  'barbell bench press': { exercise_name: 'Barbell Bench Press', weight: 80, reps: 6,  date: '2026-06-20' },
  'pull-ups':            { exercise_name: 'Pull-ups',            weight: 0,  reps: 12, date: '2026-06-18' },
  'barbell squat':       { exercise_name: 'Barbell Squat',       weight: 100, reps: 5, date: '2026-06-25' },
  'overhead press':      { exercise_name: 'Overhead Press',      weight: 55,  reps: 8, date: '2026-06-15' },
  'romanian deadlift':   { exercise_name: 'Romanian Deadlift',   weight: 90,  reps: 8, date: '2026-06-22' },
}
