export const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
export const DAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export interface Exercise {
  n: string
  s: string
  m: string
  anim: string
}

export interface WorkoutDay {
  name: string
  color: string
  exercises: Exercise[]
}

export const WORKOUTS: Record<number, WorkoutDay | null> = {
  1: {
    name: 'Push + Bowling Shoulder', color: '#0A9396', exercises: [
      { n: 'Bench Press', s: '4×10', m: 'Chest', anim: 'press' },
      { n: 'Incline Dumbbell Press', s: '3×10', m: 'Upper Chest', anim: 'press' },
      { n: 'Overhead Dumbbell Press', s: '3×10', m: 'Shoulders', anim: 'press' },
      { n: 'Lateral Raises', s: '3×15', m: 'Side Delts', anim: 'raise' },
      { n: 'Tricep Pushdown', s: '3×12', m: 'Triceps', anim: 'pull' },
      { n: 'Overhead Tricep Extension', s: '3×12', m: 'Triceps', anim: 'press' },
      { n: 'External Rotation (band)', s: '3×15 each', m: 'Rotator Cuff', anim: 'rotate' },
      { n: 'Internal Rotation (band)', s: '3×15 each', m: 'Rotator Cuff', anim: 'rotate' },
      { n: 'YTW Raises', s: '2×12 each', m: 'Rear Delt', anim: 'raise' },
    ]
  },
  2: {
    name: 'Pull + Conditioning', color: '#005F73', exercises: [
      { n: 'Pull-ups / Lat Pulldown', s: '4×8–10', m: 'Lats', anim: 'pull' },
      { n: 'Seated Cable Row', s: '3×10', m: 'Mid Back', anim: 'row' },
      { n: 'Dumbbell Row', s: '3×10 each', m: 'Back', anim: 'row' },
      { n: 'Face Pulls', s: '3×15', m: 'Rear Delt', anim: 'pull' },
      { n: 'Rear Delt Fly', s: '3×15', m: 'Rear Delt', anim: 'raise' },
      { n: 'Barbell Curl', s: '3×10', m: 'Biceps', anim: 'curl' },
      { n: 'Hammer Curl', s: '3×12', m: 'Biceps', anim: 'curl' },
      { n: 'Conditioning: 20s sprint / 40s walk × 8', s: 'After gym', m: 'Cardio', anim: 'run' },
    ]
  },
  3: {
    name: 'Legs + Core + Back Rehab', color: '#52796F', exercises: [
      { n: 'Squat', s: '4×10', m: 'Quads/Glutes', anim: 'squat' },
      { n: 'Dumbbell Romanian Deadlift', s: '4×12', m: 'Hamstrings', anim: 'hinge' },
      { n: 'Single Leg Dumbbell RDL', s: '3×10 each', m: 'Hamstrings', anim: 'hinge' },
      { n: 'Leg Press', s: '3×12', m: 'Quads', anim: 'squat' },
      { n: 'Spanish Squat (wall)', s: '3×30 sec hold', m: 'Knees/Quads', anim: 'squat' },
      { n: 'Step-ups (single leg)', s: '3×12 each', m: 'Glutes', anim: 'squat' },
      { n: 'Terminal Knee Extension (band)', s: '3×15 each', m: 'Knee Rehab', anim: 'squat' },
      { n: 'Calf Raises', s: '4×20', m: 'Calves', anim: 'squat' },
      { n: 'Plank', s: '3×45 sec', m: 'Core', anim: 'plank' },
      { n: 'Hanging Leg Raises', s: '3×12', m: 'Core', anim: 'pull' },
      { n: 'Dead Bug', s: '3×10 each', m: 'Core', anim: 'plank' },
      { n: 'Bird Dog', s: '3×10 each', m: 'Core/Back', anim: 'plank' },
      { n: 'Cable Woodchop', s: '3×12 each', m: 'Obliques', anim: 'rotate' },
      { n: 'Glute Bridge', s: '3×15', m: 'Glutes', anim: 'hinge' },
    ]
  },
  4: null,
  5: {
    name: 'Push + Bowling Shoulder + Conditioning', color: '#0A9396', exercises: [
      { n: 'Bench Press', s: '4×10', m: 'Chest', anim: 'press' },
      { n: 'Incline Dumbbell Press', s: '3×10', m: 'Upper Chest', anim: 'press' },
      { n: 'Overhead Dumbbell Press', s: '3×10', m: 'Shoulders', anim: 'press' },
      { n: 'Lateral Raises', s: '3×15', m: 'Side Delts', anim: 'raise' },
      { n: 'Tricep Pushdown', s: '3×12', m: 'Triceps', anim: 'pull' },
      { n: 'Overhead Tricep Extension', s: '3×12', m: 'Triceps', anim: 'press' },
      { n: 'External Rotation (band)', s: '3×15 each', m: 'Rotator Cuff', anim: 'rotate' },
      { n: 'Internal Rotation (band)', s: '3×15 each', m: 'Rotator Cuff', anim: 'rotate' },
      { n: 'YTW Raises', s: '2×12 each', m: 'Rear Delt', anim: 'raise' },
      { n: 'Conditioning: 25s sprint / 35s walk × 10', s: 'After gym', m: 'Cardio', anim: 'run' },
    ]
  },
  6: {
    name: 'Pull Day', color: '#005F73', exercises: [
      { n: 'Pull-ups / Lat Pulldown', s: '4×8–10', m: 'Lats', anim: 'pull' },
      { n: 'Seated Cable Row', s: '3×10', m: 'Mid Back', anim: 'row' },
      { n: 'Dumbbell Row', s: '3×10 each', m: 'Back', anim: 'row' },
      { n: 'Face Pulls', s: '3×15', m: 'Rear Delt', anim: 'pull' },
      { n: 'Rear Delt Fly', s: '3×15', m: 'Rear Delt', anim: 'raise' },
      { n: 'Barbell Curl', s: '3×10', m: 'Biceps', anim: 'curl' },
      { n: 'Hammer Curl', s: '3×12', m: 'Biceps', anim: 'curl' },
    ]
  },
  0: {
    name: 'Cricket Day 🏏', color: '#CA9849', exercises: [
      { n: '5 min jog (pre-bowling)', s: 'Before bowling', m: 'Warmup', anim: 'run' },
      { n: 'Hip circles + leg swings', s: '10 each side', m: 'Warmup', anim: 'rotate' },
      { n: 'Cat-Cow', s: 'Pre-bowl', m: 'Spine', anim: 'hinge' },
      { n: 'Walk 5 mins after spell', s: 'After spell', m: 'Recovery', anim: 'run' },
      { n: "Child's Pose", s: '60 sec post-match', m: 'Recovery', anim: 'squat' },
      { n: 'Hip Flexor Stretch', s: '45 sec each side', m: 'Recovery', anim: 'squat' },
      { n: 'Whey scoop within 45 mins', s: 'Post-match nutrition', m: 'Nutrition', anim: 'plank' },
      { n: 'Cold water on knees & lower back', s: 'Recovery', m: 'Recovery', anim: 'plank' },
    ]
  },
}

export const WARMUP: Exercise[] = [
  { n: 'Cat-Cow', s: '10 slow reps', m: 'Spine', anim: 'hinge' },
  { n: "Child's Pose", s: '45 sec hold', m: 'Back', anim: 'squat' },
  { n: 'Hip Flexor Lunge Stretch', s: '30 sec each side', m: 'Hip Flexors', anim: 'squat' },
  { n: 'Hamstring Stretch', s: '45 sec each side', m: 'Hamstrings', anim: 'hinge' },
  { n: 'Thoracic Rotation', s: '10 reps each side', m: 'Thoracic Spine', anim: 'rotate' },
]

export const TIMELINE = [
  { wk: '1–2', label: 'Adjustment Phase', inside: 'DOMS sets in. CNS adapts to load. Metabolism shifts. Muscle protein synthesis elevated.', outside: 'Scale fluctuates ±1kg (water/glycogen). Soreness. Energy dips. Completely normal.' },
  { wk: '3–4', label: 'Strength Surge', inside: 'Neural efficiency spikes — you lift more before muscle grows. Back pain drops. Core activating properly.', outside: 'Lifts go up noticeably. Posture better. Weight steady or −0.5kg. You feel it before anyone sees it.' },
  { wk: '5–6', label: 'Visible Change Begins', inside: 'Actual hypertrophy starts. Rotator cuff strengthening. Aerobic base improving.', outside: 'Clothes fit differently. Waist looser, shoulders broader. −1 to −1.5kg from start.' },
  { wk: '8–10', label: 'Athletic Transformation', inside: 'Significant muscle mass added. VO2 improving. Sleep quality better. Testosterone elevated.', outside: 'Clear muscle definition. Others notice. −2 to −2.5kg. Bowling stamina noticeably up.' },
  { wk: '12', label: 'New Baseline', inside: 'New metabolic set point. Habit fully formed. Joints stronger, injury risk down.', outside: 'Athletic, leaner, stronger. −3 to −4kg. You look like someone who trains.' },
]

export const BUDGET_CATS = {
  supplement: { label: 'Supplements', min: 1800, max: 2000, color: '#0A9396' },
  food: { label: 'Extra Food', min: 1750, max: 2050, color: '#52796F' },
  gym: { label: 'Gym', min: 1500, max: 2500, color: '#005F73' },
  other: { label: 'Other', min: 0, max: 500, color: '#CA9849' },
}
