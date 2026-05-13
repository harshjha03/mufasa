import { useState } from 'react'
import { useStore } from '../store/useStore'
import { DAYS, DAY_SHORT } from '../lib/data'
import ExerciseFigure from '../components/ExerciseFigure'

// ── Exercise instructions lookup ─────────────────────────
type Instructions = { steps: string[]; cue: string }

const INSTRUCTIONS: Record<string, Instructions> = {
  // ── Press ──────────────────────────────────────────────
  'bench press': {
    steps: ['Lie flat on bench, grip bar slightly wider than shoulder-width', 'Unrack bar, lower it to mid-chest with elbows at ~45°', 'Touch chest lightly — do not bounce', 'Drive bar back up explosively to lockout'],
    cue: 'Keep shoulder blades pinched and feet flat on the floor',
  },
  'overhead press': {
    steps: ['Stand with bar at collar-bone level, grip just outside shoulders', 'Brace core and glutes — no lower back arch', 'Press bar straight overhead until arms lock out', 'Lower under control back to collar-bone'],
    cue: 'Think "push your head through" at the top — not bar forward',
  },
  'dumbbell bench press': {
    steps: ['Sit on bench with dumbbells on thighs, kick up and lie back', 'Hold DBs at chest level, elbows ~45° from torso', 'Press up until arms are extended, DBs nearly touching', 'Lower slowly over 2–3 seconds back to chest'],
    cue: 'Neutral wrist — never let wrists bend backward',
  },
  'dumbbell shoulder press': {
    steps: ['Sit upright, DBs at shoulder height, palms facing forward', 'Press up and slightly inward until arms are straight', 'Pause briefly at top, then lower with control', 'Stop when elbows are at 90° — do not drop further'],
    cue: 'Keep lower back against the pad — no arching',
  },
  'push-ups': {
    steps: ['Hands slightly wider than shoulders, body in straight line', 'Lower chest to 2 cm off floor — elbows track back, not flared', 'Pause at the bottom for a beat', 'Push the floor away explosively to full arm extension'],
    cue: 'Squeeze glutes the entire time — it locks your spine rigid',
  },
  'wide push-ups': {
    steps: ['Place hands 1.5× shoulder width apart', 'Body rigid from head to heels', 'Lower until chest nearly touches floor, elbows ~70° out', 'Press back up to lockout'],
    cue: 'Wide grip shifts load to chest — feel the stretch at the bottom',
  },
  'pike push-ups': {
    steps: ['Start in downward dog — hips high, body in inverted V', 'Bend elbows and lower crown of head toward the floor', 'Elbows point outward like an overhead press', 'Push through palms back to starting position'],
    cue: 'The steeper the pike angle, the more it targets shoulders over chest',
  },
  'tricep dips (chair)': {
    steps: ['Hands on chair edge, fingers forward, legs extended in front', 'Lower body by bending elbows straight back (not flared)', 'Dip until upper arms are parallel to floor', 'Drive through palms and straighten arms to return'],
    cue: 'Keep hips close to the chair — drifting forward turns it into a shoulder exercise',
  },
  'tricep pushdown': {
    steps: ['Stand at cable with bar at chest height, elbows pinned to sides', 'Push bar down until arms are fully extended', 'Squeeze triceps hard at the bottom for a second', 'Let bar rise back slowly — elbows stay locked to body'],
    cue: 'Elbows are the pivot point — they should not move at all',
  },
  'tricep overhead extension': {
    steps: ['Hold one dumbbell with both hands overhead, arms extended', 'Lower dumbbell behind head by bending elbows', 'Keep upper arms vertical and close to ears', 'Extend arms back to overhead position'],
    cue: 'Feel the long head stretch — this is where most tricep growth happens',
  },

  // ── Pull ───────────────────────────────────────────────
  'pull-ups': {
    steps: ['Hang from bar, hands slightly wider than shoulders, palms away', 'Initiate by pulling shoulder blades down and together', 'Drive elbows toward your hips to pull chin over bar', 'Lower fully — dead hang — between every rep'],
    cue: 'Think "elbows to back pockets" not "pull with hands"',
  },
  'chin-ups': {
    steps: ['Hang from bar, palms facing you, shoulder-width grip', 'Squeeze biceps and pull until chin clears bar', 'Pause and squeeze at the top', 'Lower slowly over 3 seconds to full hang'],
    cue: 'Supinated grip means biceps do more work — great for arm size',
  },
  'lat pulldown': {
    steps: ['Grip bar wider than shoulder-width, sit with thighs under pad', 'Lean back slightly and pull bar to upper chest', 'Drive elbows down and back — squeeze lats at bottom', 'Let bar rise slowly to full arm extension between reps'],
    cue: 'Imagine you\'re bending the bar — it cues lat engagement automatically',
  },
  'cable row': {
    steps: ['Sit at cable row, back upright, slight lean forward at hips', 'Pull handle to lower abdomen, drive elbows past your sides', 'Squeeze shoulder blades together hard at finish', 'Let arms extend fully and feel the stretch before next rep'],
    cue: 'Row to your belly button, not your chest — keeps lats engaged',
  },
  'dumbbell row': {
    steps: ['Place one hand and knee on bench for support', 'Hold dumbbell with opposite hand, back flat and parallel to floor', 'Row DB up, driving elbow toward ceiling', 'Lower fully — full stretch at the bottom matters'],
    cue: 'Keep your lower back still — only the arm moves',
  },
  'barbell curl': {
    steps: ['Stand with barbell, shoulder-width underhand grip', 'Pin elbows to sides — they should not move', 'Curl bar up to shoulder level squeezing biceps', 'Lower over 3 slow seconds back to straight arms'],
    cue: 'The negative (lowering) builds more muscle than the lift — go slow down',
  },
  'dumbbell curl': {
    steps: ['Stand with DBs at sides, palms facing forward', 'Curl one or both up, rotating wrist outward at top', 'Squeeze hard at the top for a 1-second pause', 'Lower with control to full extension'],
    cue: 'Supinate (twist palm up) at the top for peak bicep contraction',
  },
  'hammer curl': {
    steps: ['Stand holding DBs at sides, palms facing each other', 'Curl both up with palms staying neutral throughout', 'No wrist rotation — keep the hammer grip', 'Lower slowly back to sides'],
    cue: 'Neutral grip targets brachialis — builds arm thickness not just peak',
  },
  'face pulls': {
    steps: ['Set cable at face height with rope attachment', 'Stand back, grip rope with thumbs up', 'Pull rope to face, separating hands at the end', 'Hold 1 second — elbows should be above shoulder height'],
    cue: 'Pull the rope apart at the end — that external rotation is the whole point',
  },
  'inverted rows (table)': {
    steps: ['Lie under a sturdy table, grip edge shoulder-width', 'Body rigid like a plank — heels on floor', 'Pull chest up to the table edge', 'Lower until arms are fully extended'],
    cue: 'Harder = feet elevated on a chair. Easier = bend knees',
  },

  // ── Squat ──────────────────────────────────────────────
  'barbell squat': {
    steps: ['Bar on upper traps, feet shoulder-width, toes out ~30°', 'Take a big breath, brace hard, then initiate with hips back and down', 'Break parallel — hip crease below top of knee', 'Drive through mid-foot and push floor away to stand'],
    cue: 'Knees track over pinky toe — never cave inward',
  },
  'dumbbell squat': {
    steps: ['Hold DBs at sides, feet shoulder-width', 'Sit hips back and down keeping chest tall', 'Lower until thighs are parallel to floor or below', 'Drive through heels to stand, squeeze glutes at top'],
    cue: 'Keep torso upright — if chest falls forward, elevate heels slightly',
  },
  'bodyweight squat': {
    steps: ['Feet shoulder-width, toes slightly out, arms forward for balance', 'Push hips back and down — keep chest up', 'Hit parallel or below, knees tracking over toes', 'Drive up through full foot to standing'],
    cue: 'Slow it down — 3 seconds down, pause at bottom, 1 second up',
  },
  'bulgarian split squat': {
    steps: ['Rear foot on bench, front foot 2–3 feet forward', 'Lower straight down until rear knee nearly touches floor', 'Front shin stays vertical — front knee does not pass toes excessively', 'Drive through front heel to return to start'],
    cue: 'Most of your weight should be on the front leg — the rear is for balance',
  },
  'leg press': {
    steps: ['Sit in machine, feet shoulder-width on platform', 'Lower platform until knees reach 90°', 'Do not let lower back peel off the pad', 'Press through full foot back to start — do not lock knees'],
    cue: 'High foot placement = more glutes and hamstrings. Low = more quads',
  },
  'dumbbell lunges': {
    steps: ['Stand tall with DBs at sides', 'Step one foot forward 2–3 feet', 'Lower rear knee toward floor, front shin stays vertical', 'Drive through front heel to return, then alternate legs'],
    cue: 'Keep torso perfectly upright — leaning forward shifts load off quads',
  },
  'calf raises': {
    steps: ['Stand on edge of step or flat floor, balls of feet', 'Lower heels as far as possible to stretch calf', 'Drive up onto toes as high as possible', 'Hold peak contraction 1 second, then lower slowly'],
    cue: 'Full range — the stretch at the bottom is where calves actually grow',
  },

  // ── Hinge ─────────────────────────────────────────────
  'romanian deadlift': {
    steps: ['Stand with bar/DBs at hips, soft knee bend throughout', 'Hinge at hips — push them back as you lower the weight', 'Bar stays close to legs, lower back stays flat', 'When you feel full hamstring stretch, drive hips forward to stand'],
    cue: 'Think "push the wall behind you with your hips" not "bend over"',
  },
  'romanian deadlift (dbs)': {
    steps: ['Hold DBs in front of thighs, stand tall', 'Hinge at hips, DBs slide down legs close to shins', 'Lower until you feel a deep hamstring pull — back flat throughout', 'Drive hips forward to return to standing'],
    cue: 'Feel the hamstring stretch, not lower back tension',
  },
  'glute bridge': {
    steps: ['Lie on back, knees bent, feet flat, arms at sides', 'Drive hips up by squeezing glutes — not pushing with lower back', 'Hold top position 2 seconds, glutes fully contracted', 'Lower under control and repeat'],
    cue: 'Tuck pelvis at the top — that final pelvic tilt maxes out glute squeeze',
  },
  'superman hold': {
    steps: ['Lie face down, arms extended overhead', 'Simultaneously lift arms, chest, and legs off the floor', 'Hold for the prescribed time — focus on squeezing back muscles', 'Lower slowly and repeat'],
    cue: 'Think about reaching your hands and feet away from each other to maximize extension',
  },

  // ── Raise ─────────────────────────────────────────────
  'lateral raises': {
    steps: ['Stand with DBs at sides, slight forward lean at hips', 'Raise arms out to sides to shoulder height — lead with elbows', 'Pause at top, then lower over 3 seconds', 'Stop just before DBs touch your body'],
    cue: 'Tilt the front of the DB slightly down (like pouring water) — maxes side delt activation',
  },
  'dumbbell lateral raises': {
    steps: ['Stand with slight knee bend, DBs at sides', 'Keep elbows slightly bent throughout', 'Raise to shoulder height, leading with your elbows not hands', 'Lower slowly — 3 seconds down is more effective than 1'],
    cue: 'Less weight with full range and slow negatives beats heavy swinging every time',
  },

  // ── Plank ─────────────────────────────────────────────
  'plank': {
    steps: ['Forearms on floor, elbows under shoulders', 'Body in straight line from head to heels', 'Squeeze abs like you\'re about to take a punch', 'Hold position — breathe in through nose, out through mouth'],
    cue: 'If your hips sag or pike, drop to knees — form beats duration',
  },
  'mountain climbers': {
    steps: ['High plank position, hands under shoulders', 'Drive one knee toward chest explosively', 'Return to start and immediately drive the other knee', 'Keep hips level — no bouncing up and down'],
    cue: 'The faster you go, the more cardio. Slower = more core work',
  },
  'cable crunches': {
    steps: ['Kneel at cable, rope behind head at high pulley', 'Hinge at hips, bring elbows toward thighs', 'Crunch the abs — round upper back, not just hip flexion', 'Hold contraction, then slowly unwind to start'],
    cue: 'The movement starts at your abs, not your arms pulling the rope',
  },

  // ── Run / Cardio ────────────────────────────────────────
  'sprint intervals': {
    steps: ['Warm up at easy pace for 2 minutes', 'Sprint at 85–95% max effort for the prescribed time', 'Walk or slow jog to recover between rounds', 'Last sprint should feel as hard as the first'],
    cue: 'True sprinting means you cannot hold a conversation — push to that level',
  },
  'treadmill (incline walk)': {
    steps: ['Set incline to 8–12%, speed to 5–6 km/h', 'Walk without holding the handles — let arms swing', 'Maintain upright posture, do not lean on machine', 'Keep steady pace for full duration'],
    cue: 'Holding the handles defeats the purpose — let go and feel the burn',
  },
  'burpees': {
    steps: ['Stand, then place hands on floor and jump feet back to plank', 'Perform one push-up', 'Jump feet back toward hands', 'Explosively jump up, arms overhead — that\'s one rep'],
    cue: 'Move fast but hit every position — a sloppy burpee is just wasted energy',
  },
  'jump squats': {
    steps: ['Feet shoulder-width, squat to parallel', 'Explode upward as hard as possible', 'Land softly on balls of feet, immediately absorb into next squat', 'No pause between reps — continuous rhythm'],
    cue: 'Land quiet — if you sound heavy, you\'re not absorbing the impact properly',
  },
  'high knees': {
    steps: ['Run in place, driving knees up to hip height', 'Arms pump in opposition — opposite arm to opposite knee', 'Stay on balls of feet, never flat-footed', 'Maintain fast rhythm for full interval'],
    cue: 'Drive the knee UP rather than cycling back — that\'s what builds the cardio intensity',
  },
}

function getInstructions(name: string, anim: string): Instructions {
  const key = name.toLowerCase().trim()
  if (INSTRUCTIONS[key]) return INSTRUCTIONS[key]

  // Fallback by anim type
  const fallbacks: Record<string, Instructions> = {
    press:  { steps: ['Set up with proper grip width for the movement', 'Lower the weight under control to full range of motion', 'Press explosively back to the start position', 'Reset and repeat without rushing'], cue: 'Control the weight — if you can\'t, reduce it' },
    pull:   { steps: ['Start from a full hang or extended position', 'Initiate by engaging your lats before pulling', 'Pull until the target position is reached', 'Lower fully for maximum range of motion'], cue: 'Full extension at the bottom builds more muscle than partial reps' },
    squat:  { steps: ['Set feet shoulder-width, brace core tightly', 'Sit hips back and down keeping chest up', 'Hit or break parallel for full quad engagement', 'Drive through full foot back to standing'], cue: 'Knees track over toes throughout the movement' },
    hinge:  { steps: ['Stand tall, soft knee bend, neutral spine', 'Push hips back — lower torso approaches parallel', 'Feel the hamstring stretch at the bottom', 'Drive hips forward to return, squeeze glutes at top'], cue: 'Hinge AT the hips — do not round the lower back' },
    curl:   { steps: ['Start with arms fully extended', 'Curl up while keeping elbows pinned to sides', 'Squeeze the target muscle at peak contraction', 'Lower slowly — 3 seconds down'], cue: 'The negative portion builds as much muscle as the lift — go slow' },
    raise:  { steps: ['Start with arms at sides or neutral position', 'Raise to shoulder height — lead with elbows', 'Brief pause at the top', 'Lower over 3 slow seconds'], cue: 'Slow and controlled beats heavy and swinging' },
    row:    { steps: ['Set up with flat back, hinge at hips', 'Pull toward your torso, driving elbows back', 'Squeeze shoulder blades together at the finish', 'Extend arms fully between each rep'], cue: 'Row to your waist, not your chest — keeps back muscles primary' },
    plank:  { steps: ['Brace abs, glutes, and quads simultaneously', 'Body forms a rigid straight line', 'Breathe steadily — do not hold your breath', 'Hold position for the prescribed duration'], cue: 'Quality over duration — a 30s perfect plank beats a 90s saggy one' },
    run:    { steps: ['Warm up for 2 minutes at easy pace', 'Build to the target intensity', 'Maintain form — upright torso, arms driving', 'Finish the full interval before resting'], cue: 'Breathe rhythmically — inhale 2 steps, exhale 2 steps' },
    rotate: { steps: ['Start in a stable position, core braced', 'Rotate through the thoracic spine, not just arms', 'Pause at end range', 'Return with control, then rotate the other way'], cue: 'The rotation comes from your mid-back, not your lower back' },
  }
  return fallbacks[anim] || fallbacks.press
}

// ── PR Log Modal ─────────────────────────────────────────
const BORDER_PR = 'rgba(255,255,255,0.07)'
const ELEV_PR   = '#221A12'
const CARD_PR   = '#1C1410'
const TEXT_PR   = '#FBF6EE'
const MUTED_PR  = 'rgba(251,246,238,0.5)'
const GOLD_PR   = '#E4B26A'

function PRModal({ exercise, currentPR, onClose, onLog }: {
  exercise: { name: string; muscle: string; anim: string }
  currentPR: { weight: number; reps: number; date: string } | null
  onClose: () => void
  onLog: (weight: number, reps: number) => boolean
}) {
  const [weight, setWeight] = useState(currentPR?.weight ?? 0)
  const [reps, setReps]     = useState(currentPR?.reps   ?? 10)
  const [celebrated, setCelebrated] = useState(false)

  const REP_OPTIONS = [1, 2, 3, 4, 5, 6, 8, 10, 12, 15, 20, 25]

  const handleLog = () => {
    const isNew = onLog(weight, reps)
    if (isNew) { setCelebrated(true); setTimeout(onClose, 1600) }
    else onClose()
  }

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
      style={{ position: 'fixed', inset: 0, zIndex: 300, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}>
      <div style={{ width: '100%', maxWidth: 480, background: '#1A1208', borderRadius: '28px 28px 0 0', border: `1px solid ${BORDER_PR}`, borderBottom: 'none', overflow: 'hidden' }}>
        {celebrated ? (
          <div style={{ padding: '52px 24px', textAlign: 'center' }}>
            <div style={{ fontSize: 52, marginBottom: 12 }}>🏆</div>
            <p style={{ fontSize: 22, fontWeight: 800, color: GOLD_PR, letterSpacing: '-0.5px' }}>NEW PR!</p>
            <p style={{ fontSize: 14, color: MUTED_PR, marginTop: 6 }}>{weight}kg × {reps} reps on {exercise.name}</p>
          </div>
        ) : (
          <div style={{ padding: '24px 20px 40px' }}>
            {/* Handle */}
            <div style={{ width: 36, height: 4, background: 'rgba(255,255,255,0.12)', borderRadius: 4, margin: '0 auto 20px' }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <h3 style={{ fontSize: 17, fontWeight: 800, color: TEXT_PR }}>{exercise.name}</h3>
                <p style={{ fontSize: 11, color: MUTED_PR, marginTop: 2 }}>{exercise.muscle}</p>
              </div>
              <button onClick={onClose} style={{ fontSize: 22, color: MUTED_PR, cursor: 'pointer', lineHeight: 1, background: 'none', border: 'none' }}>×</button>
            </div>

            {/* Current PR banner */}
            {currentPR && (
              <div style={{ background: 'rgba(228,178,106,0.07)', border: '1px solid rgba(228,178,106,0.2)', borderRadius: 14, padding: '12px 16px', marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ fontSize: 10, fontWeight: 700, color: GOLD_PR, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 2 }}>Current PR</p>
                  <p style={{ fontSize: 16, fontWeight: 800, color: TEXT_PR }}>{currentPR.weight}kg × {currentPR.reps} reps</p>
                </div>
                <p style={{ fontSize: 11, color: MUTED_PR }}>{currentPR.date}</p>
              </div>
            )}

            {/* Weight input */}
            <p style={{ fontSize: 10, fontWeight: 700, color: MUTED_PR, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 10 }}>Weight (kg)</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <button onClick={() => setWeight(w => Math.max(0, parseFloat((w - 2.5).toFixed(1))))}
                style={{ width: 44, height: 44, borderRadius: 12, background: ELEV_PR, color: TEXT_PR, fontSize: 22, fontWeight: 700, cursor: 'pointer', border: `1px solid ${BORDER_PR}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                −
              </button>
              <div style={{ flex: 1, background: ELEV_PR, borderRadius: 14, padding: '10px 16px', border: `1px solid ${BORDER_PR}`, textAlign: 'center' }}>
                <span style={{ fontSize: 28, fontWeight: 800, color: TEXT_PR }}>{weight}</span>
                <span style={{ fontSize: 13, color: MUTED_PR, marginLeft: 4 }}>kg</span>
              </div>
              <button onClick={() => setWeight(w => parseFloat((w + 2.5).toFixed(1)))}
                style={{ width: 44, height: 44, borderRadius: 12, background: ELEV_PR, color: GOLD_PR, fontSize: 22, fontWeight: 700, cursor: 'pointer', border: `1px solid rgba(228,178,106,0.2)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                +
              </button>
            </div>
            <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
              {[0, 20, 40, 60, 80, 100, 120].map(w => (
                <button key={w} onClick={() => setWeight(w)} style={{
                  padding: '6px 12px', borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: 'pointer',
                  background: weight === w ? 'rgba(228,178,106,0.12)' : ELEV_PR,
                  color: weight === w ? GOLD_PR : MUTED_PR,
                  border: `1px solid ${weight === w ? 'rgba(228,178,106,0.3)' : BORDER_PR}`,
                }}>
                  {w === 0 ? 'BW' : `${w}`}
                </button>
              ))}
            </div>

            {/* Reps */}
            <p style={{ fontSize: 10, fontWeight: 700, color: MUTED_PR, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 10 }}>Reps</p>
            <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
              {REP_OPTIONS.map(r => (
                <button key={r} onClick={() => setReps(r)} style={{
                  padding: '10px 14px', borderRadius: 12, fontSize: 13, fontWeight: 700, cursor: 'pointer',
                  background: reps === r ? 'rgba(228,178,106,0.12)' : ELEV_PR,
                  color: reps === r ? GOLD_PR : MUTED_PR,
                  border: `1px solid ${reps === r ? 'rgba(228,178,106,0.3)' : BORDER_PR}`,
                }}>
                  {r}
                </button>
              ))}
            </div>

            {/* Preview */}
            <div style={{ background: 'rgba(228,178,106,0.06)', borderRadius: 14, padding: '12px 16px', marginBottom: 20, border: '1px solid rgba(228,178,106,0.15)', textAlign: 'center' }}>
              <p style={{ fontSize: 20, fontWeight: 800, color: TEXT_PR }}>
                {weight === 0 ? 'Bodyweight' : `${weight}kg`} × {reps} reps
              </p>
              {currentPR && (weight > currentPR.weight || (weight === currentPR.weight && reps > currentPR.reps)) && (
                <p style={{ fontSize: 12, color: GOLD_PR, marginTop: 4, fontWeight: 700 }}>↑ Beats your current PR!</p>
              )}
            </div>

            <button onClick={handleLog} style={{
              width: '100%', padding: '16px 0', borderRadius: 16,
              background: GOLD_PR, color: '#120D08', fontSize: 15, fontWeight: 800,
              cursor: 'pointer', border: 'none',
              boxShadow: '0 4px 16px rgba(228,178,106,0.3)',
            }}>
              Log Set →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Design tokens — immersiveBronze spec ─────────────────
const BG      = '#120D08'
const CARD    = '#1C1410'
const ELEV    = '#221A12'
const BORDER  = 'rgba(255,255,255,0.07)'
const TEXT    = '#FBF6EE'
const MUTED   = 'rgba(251,246,238,0.5)'
const GOLD    = '#E4B26A'   // accent
const PROTEIN = '#7DD9C5'
const CARBS   = '#92C2F2'
const COPPER  = '#D4905A'
const SAGE    = '#7BAE8A'

export default function WorkoutScreen() {
  const { plan, workoutDone, toggleExercise, selectedDay, setSelectedDay, prs, logPR } = useStore()
  const [view, setView]           = useState<'week' | 'day'>('day')
  const [openEx, setOpenEx]       = useState<number | null>(null)
  const [prModal, setPrModal]     = useState<{ name: string; muscle: string; anim: string } | null>(null)
  const [editingWarmup, setEditingWarmup]   = useState(false)
  const [customWarmup, setCustomWarmup]     = useState<{ name: string; sets: string; muscle: string }[] | null>(() => {
    try { return JSON.parse(localStorage.getItem('mufasa_warmup') || 'null') } catch { return null }
  })
  const [warmupDraft, setWarmupDraft]       = useState<{ name: string; sets: string; muscle: string }[]>([])
  const [editingWorkout, setEditingWorkout] = useState(false)
  const [customWorkouts, setCustomWorkouts] = useState<Record<number, { name: string; sets: string; muscle: string }[]>>(() => {
    try { return JSON.parse(localStorage.getItem('mufasa_workouts') || '{}') } catch { return {} }
  })
  const [workoutDraft, setWorkoutDraft]     = useState<{ name: string; sets: string; muscle: string }[]>([])

  const now      = new Date()
  const todayDow = now.getDay()
  const workout  = plan?.workout ?? {}
  const wo       = workout[selectedDay]
  const ordered  = [1, 2, 3, 4, 5, 6, 0]

  const getDayDate = (d: number) => {
    const diff = (d - todayDow + 7) % 7
    const date = new Date(now)
    date.setDate(now.getDate() + diff)
    return { num: date.getDate(), key: date.toISOString().split('T')[0] }
  }

  const { key: selectedKey } = getDayDate(selectedDay)
  const done      = workoutDone['wd_' + selectedKey] || {}

  // Custom exercises override AI plan per-day
  const effectiveExercises: { name: string; sets: string; muscle: string; anim?: string }[] =
    customWorkouts[selectedDay] ?? wo?.exercises ?? []
  const total     = effectiveExercises.length
  const doneCount = Object.values(done).filter(Boolean).length

  const saveWorkout = (day: number, list: typeof workoutDraft) => {
    const filtered = list.filter(e => e.name.trim())
    const updated  = { ...customWorkouts, [day]: filtered }
    setCustomWorkouts(updated)
    localStorage.setItem('mufasa_workouts', JSON.stringify(updated))
    setEditingWorkout(false)
  }

  // Muscle group tag colours
  const muscleColor = (muscle: string) => {
    const m = (muscle || '').toLowerCase()
    if (m.includes('chest') || m.includes('push')) return { bg: 'rgba(212,168,75,0.12)', text: GOLD }
    if (m.includes('back')  || m.includes('pull')) return { bg: 'rgba(146,194,242,0.12)', text: CARBS }
    if (m.includes('leg')   || m.includes('quad') || m.includes('glute')) return { bg: 'rgba(212,144,90,0.12)', text: COPPER }
    if (m.includes('shoulder') || m.includes('delt')) return { bg: 'rgba(123,174,138,0.12)', text: SAGE }
    return { bg: 'rgba(255,255,255,0.07)', text: MUTED }
  }

  return (
    <div style={{ background: 'radial-gradient(130% 100% at 100% 0%, #6B4423 0%, #2E1B0E 75%)', minHeight: '100vh', paddingBottom: 96, position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(70% 50% at 90% 0%, rgba(255,200,140,0.18), transparent 60%)', pointerEvents: 'none' }} />

      {/* ── Header ──────────────────────────────────────── */}
      <div style={{ padding: 'max(env(safe-area-inset-top, 0px), 24px) 20px 16px' }}>
        <h1 style={{
          fontSize: 40, fontWeight: 800, color: TEXT,
          letterSpacing: '-1.5px', lineHeight: 1,
          fontFamily: '-apple-system, BlinkMacSystemFont, system-ui',
          marginBottom: 16,
        }}>
          Workout.
        </h1>

        {/* View toggle */}
        <div style={{ display: 'flex', gap: 6, background: ELEV, padding: 4, borderRadius: 14, width: 'fit-content', border: `1px solid ${BORDER}` }}>
          {([['day', 'Day View', 'calendar_today'], ['week', 'Full Week', 'calendar_month']] as const).map(([id, label, icon]) => (
            <button key={id} onClick={() => setView(id)} style={{
              padding: '8px 16px', borderRadius: 10, fontSize: 12, fontWeight: 700,
              display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer',
              background: view === id ? CARD : 'transparent',
              color: view === id ? TEXT : MUTED,
              border: view === id ? `1px solid ${BORDER}` : '1px solid transparent',
              transition: 'all 0.2s',
            }}>
              <span className="ms ms-sm" style={{ fontSize: 13 }}>{icon}</span>{label}
            </button>
          ))}
        </div>
      </div>

      {/* ── WEEK VIEW ──────────────────────────────────── */}
      {view === 'week' && (
        <div style={{ padding: '0 16px' }}>
          <p style={{ fontSize: 11, color: MUTED, marginBottom: 12 }}>Tap a day to jump to it</p>
          {ordered.map(d => {
            const { key } = getDayDate(d)
            const dayWo        = workout[d]
            const dayDone      = workoutDone['wd_' + key] || {}
            const dayTotal     = dayWo?.exercises.length ?? 0
            const dayDoneCount = Object.values(dayDone).filter(Boolean).length
            const pct          = dayTotal ? Math.round(dayDoneCount / dayTotal * 100) : 0
            const isToday      = d === todayDow
            const isSelected   = selectedDay === d

            return (
              <button key={d} onClick={() => { setSelectedDay(d); setView('day') }} style={{
                width: '100%', marginBottom: 10,
                background: isSelected ? 'rgba(212,168,75,0.07)' : CARD,
                borderRadius: 18, padding: 16, textAlign: 'left', cursor: 'pointer',
                border: `1px solid ${isSelected ? 'rgba(212,168,75,0.3)' : BORDER}`,
                transition: 'all 0.2s',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                      <span style={{ fontSize: 14, fontWeight: 800, color: TEXT }}>{DAYS[d]}</span>
                      {isToday && (
                        <span style={{ background: GOLD, color: '#120D08', fontSize: 9, fontWeight: 800, padding: '2px 8px', borderRadius: 20, letterSpacing: '0.04em' }}>
                          TODAY
                        </span>
                      )}
                    </div>
                    <p style={{ fontSize: 12, color: MUTED }}>{dayWo ? dayWo.name : 'Rest Day'}</p>
                  </div>
                  {dayWo && (
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: 18, fontWeight: 800, color: pct === 100 ? GOLD : TEXT }}>{pct}%</p>
                      <p style={{ fontSize: 10, color: MUTED }}>{dayDoneCount}/{dayTotal}</p>
                    </div>
                  )}
                </div>

                {dayWo ? (
                  <>
                    <div style={{ height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden', marginBottom: 10 }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: `linear-gradient(90deg, ${GOLD}, ${COPPER})`, borderRadius: 2 }} />
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {dayWo.exercises.slice(0, 4).map((ex: any, i: number) => {
                        const mc = muscleColor(ex.muscle)
                        return (
                          <span key={i} style={{
                            fontSize: 10, fontWeight: 600, padding: '3px 8px', borderRadius: 20,
                            background: dayDone[i] ? 'rgba(212,168,75,0.15)' : ELEV,
                            color: dayDone[i] ? GOLD : MUTED,
                            border: `1px solid ${dayDone[i] ? 'rgba(212,168,75,0.25)' : BORDER}`,
                          }}>
                            {ex.name.split(' ').slice(0, 2).join(' ')}
                          </span>
                        )
                      })}
                      {dayWo.exercises.length > 4 && (
                        <span style={{ fontSize: 10, padding: '3px 8px', borderRadius: 20, background: ELEV, color: MUTED, border: `1px solid ${BORDER}` }}>
                          +{dayWo.exercises.length - 4} more
                        </span>
                      )}
                    </div>
                  </>
                ) : (
                  <p style={{ fontSize: 11, color: MUTED }}>Light walk only · full recovery</p>
                )}
              </button>
            )
          })}
        </div>
      )}

      {/* ── DAY VIEW ───────────────────────────────────── */}
      {view === 'day' && (
        <>
          {/* Day picker pills */}
          <div className="scrollbar-none" style={{ display: 'flex', gap: 8, padding: '0 16px 16px', overflowX: 'auto' }}>
            {ordered.map(d => {
              const { num }  = getDayDate(d)
              const hasWo    = workout[d] != null
              const isActive = selectedDay === d
              const isToday  = d === todayDow

              return (
                <button key={d} onClick={() => { setSelectedDay(d); setOpenEx(null); setEditingWorkout(false) }} style={{
                  flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center',
                  padding: '10px 14px', borderRadius: 16, minWidth: 52, cursor: 'pointer',
                  background: isActive ? GOLD : 'rgba(255,255,255,0.07)',
                  border: isActive ? 'none' : '1px solid rgba(255,255,255,0.08)',
                  transition: 'all 0.2s',
                }}>
                  <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: isActive ? '#1B1714' : MUTED, opacity: isActive ? 0.85 : 1 }}>
                    {DAY_SHORT[d]}
                  </span>
                  <span style={{ fontSize: 20, fontWeight: 800, marginTop: 2, color: isActive ? '#1B1714' : TEXT }}>
                    {num}
                  </span>
                  <div style={{
                    width: 4, height: 4, borderRadius: '50%', marginTop: 4,
                    background: hasWo ? (isActive ? '#1B1714' : PROTEIN) : 'transparent',
                    opacity: isActive ? 0.5 : 1,
                  }} />
                </button>
              )
            })}
          </div>

          {/* Day header */}
          <div style={{ padding: '0 20px 14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <div>
                <h2 style={{ fontSize: 22, fontWeight: 800, color: TEXT, letterSpacing: '-0.5px' }}>{DAYS[selectedDay]}</h2>
                <p style={{ fontSize: 13, color: MUTED, marginTop: 2 }}>{wo?.name ?? 'Rest day'}</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {(wo || customWorkouts[selectedDay]) && (
                  <button
                    onClick={() => {
                      if (!editingWorkout) setWorkoutDraft(effectiveExercises.map(e => ({ name: e.name, sets: e.sets, muscle: e.muscle || '' })))
                      setEditingWorkout(e => !e)
                      setOpenEx(null)
                    }}
                    style={{ fontSize: 11, fontWeight: 700, color: editingWorkout ? GOLD : MUTED, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span className="ms ms-sm" style={{ fontSize: 14 }}>{editingWorkout ? 'close' : 'edit'}</span>
                    {editingWorkout ? 'Cancel' : 'Edit'}
                  </button>
                )}
                {wo && !editingWorkout && (
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: 22, fontWeight: 800, color: GOLD, letterSpacing: '-0.5px' }}>
                      {Math.round(total ? doneCount / total * 100 : 0)}%
                    </p>
                    <p style={{ fontSize: 10, color: MUTED }}>{doneCount}/{total} done</p>
                  </div>
                )}
              </div>
            </div>
            {wo && (
              <div style={{ height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden', marginTop: 10 }}>
                <div style={{
                  height: '100%', width: `${total ? doneCount / total * 100 : 0}%`,
                  background: `linear-gradient(90deg, ${GOLD}, ${COPPER})`,
                  borderRadius: 2, transition: 'width 0.5s ease',
                }} />
              </div>
            )}
          </div>

          {/* Rest day */}
          {!wo ? (
            <div style={{ margin: '0 16px', background: CARD, borderRadius: 20, padding: 40, textAlign: 'center', border: `1px solid ${BORDER}` }}>
              <span className="ms" style={{ color: 'rgba(212,168,75,0.25)', fontSize: 40, display: 'block', marginBottom: 12 }}>spa</span>
              <p style={{ fontSize: 18, fontWeight: 800, color: TEXT }}>Rest Day</p>
              <p style={{ fontSize: 13, color: MUTED, marginTop: 6 }}>Light walk only. Muscles repair today.</p>
            </div>
          ) : editingWorkout ? (
            /* ── Edit mode ── */
            <div style={{ padding: '0 16px' }}>
              {workoutDraft.map((ex, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: ELEV, border: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: MUTED, flexShrink: 0 }}>{i + 1}</div>
                  <input
                    value={ex.name}
                    onChange={e => setWorkoutDraft(d => d.map((x, j) => j === i ? { ...x, name: e.target.value } : x))}
                    placeholder="Exercise name"
                    style={{ flex: 1, background: ELEV, border: `1px solid ${BORDER}`, borderRadius: 10, padding: '10px 12px', fontSize: 13, color: TEXT, outline: 'none', fontFamily: 'inherit' }}
                  />
                  <input
                    value={ex.sets}
                    onChange={e => setWorkoutDraft(d => d.map((x, j) => j === i ? { ...x, sets: e.target.value } : x))}
                    placeholder="4×10"
                    style={{ width: 68, background: ELEV, border: `1px solid ${BORDER}`, borderRadius: 10, padding: '10px 10px', fontSize: 13, color: TEXT, outline: 'none', fontFamily: 'inherit' }}
                  />
                  <button onClick={() => setWorkoutDraft(d => d.filter((_, j) => j !== i))} style={{ color: '#E05252', background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', lineHeight: 1, padding: '0 2px', flexShrink: 0 }}>×</button>
                </div>
              ))}
              <button
                onClick={() => setWorkoutDraft(d => [...d, { name: '', sets: '', muscle: '' }])}
                style={{ width: '100%', padding: '10px 0', borderRadius: 12, background: 'rgba(255,255,255,0.04)', border: `1px dashed ${BORDER}`, color: MUTED, fontSize: 13, fontWeight: 700, cursor: 'pointer', marginBottom: 10, marginTop: 4 }}>
                + Add exercise
              </button>
              <button
                onClick={() => saveWorkout(selectedDay, workoutDraft)}
                style={{ width: '100%', padding: '14px 0', borderRadius: 14, background: GOLD, color: '#120D08', fontSize: 14, fontWeight: 800, cursor: 'pointer', border: 'none' }}>
                Save workout
              </button>
            </div>
          ) : (
            <div style={{ padding: '0 16px' }}>
              {effectiveExercises.map((ex: any, i: number) => {
                const isDone    = done[i]
                const mc        = muscleColor(ex.muscle)
                const prKey     = ex.name.toLowerCase().trim()
                const pr        = prs[prKey]
                const isOpen    = openEx === i
                const info      = getInstructions(ex.name, ex.anim || 'squat')
                const isLast    = i === effectiveExercises.length - 1
                return (
                  <div key={i} style={{ overflow: 'hidden' }}>

                    {/* ── Header row ── */}
                    <button
                      onClick={() => setOpenEx(isOpen ? null : i)}
                      style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '14px 0', textAlign: 'left', cursor: 'pointer', background: 'none', border: 'none', borderBottom: !isOpen && !isLast ? `1px solid ${BORDER}` : 'none' }}>

                      {/* Index number — tap to toggle done */}
                      <button
                        onClick={e => { e.stopPropagation(); toggleExercise(selectedKey, i) }}
                        style={{
                          width: 32, height: 32, borderRadius: 10, flexShrink: 0,
                          background: isDone ? 'rgba(212,168,75,0.15)' : ELEV,
                          border: `1px solid ${isDone ? 'rgba(212,168,75,0.25)' : BORDER}`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 12, fontWeight: 800, color: isDone ? GOLD : MUTED,
                          cursor: 'pointer', transition: 'all 0.2s',
                        }}>
                        {isDone ? '✓' : i + 1}
                      </button>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 14, fontWeight: 700, color: TEXT }}>{ex.name}</p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4, flexWrap: 'wrap' }}>
                          <span style={{ fontSize: 12, color: MUTED }}>{ex.sets}</span>
                          {ex.muscle && (
                            <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 20, textTransform: 'uppercase', letterSpacing: '0.05em', background: mc.bg, color: mc.text }}>
                              {ex.muscle}
                            </span>
                          )}
                          {pr && (
                            <span style={{ fontSize: 9, fontWeight: 800, padding: '2px 7px', borderRadius: 20, background: 'rgba(228,178,106,0.1)', color: GOLD, border: '1px solid rgba(228,178,106,0.18)' }}>
                              🏆 {pr.weight > 0 ? `${pr.weight}kg × ` : 'BW × '}{pr.reps}
                            </span>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={e => { e.stopPropagation(); setPrModal({ name: ex.name, muscle: ex.muscle, anim: ex.anim }) }}
                        style={{ flexShrink: 0, padding: '7px 14px', borderRadius: 20, fontSize: 12, fontWeight: 700, cursor: 'pointer', background: 'rgba(228,178,106,0.1)', color: GOLD, border: '1px solid rgba(228,178,106,0.2)' }}>
                        Log set
                      </button>

                      <span className="ms ms-sm" style={{ fontSize: 18, color: MUTED, flexShrink: 0, transition: 'transform 0.25s', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                        expand_more
                      </span>
                    </button>

                    {/* ── Accordion body ── */}
                    {isOpen && (
                      <div style={{ borderTop: `1px solid ${BORDER}`, borderBottom: !isLast ? `1px solid ${BORDER}` : 'none' }}>
                        {/* How to perform */}
                        <div style={{ padding: '16px 16px 12px' }}>
                          <p style={{ fontSize: 9, fontWeight: 700, color: GOLD, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>
                            How to perform
                          </p>
                          {info.steps.map((step, si) => (
                            <div key={si} style={{ display: 'flex', gap: 10, marginBottom: si < info.steps.length - 1 ? 10 : 0 }}>
                              <span style={{ fontSize: 10, fontWeight: 800, color: GOLD, opacity: 0.6, width: 16, flexShrink: 0, marginTop: 1 }}>{si + 1}.</span>
                              <p style={{ fontSize: 13, color: TEXT, lineHeight: 1.55 }}>{step}</p>
                            </div>
                          ))}
                        </div>

                        {/* Coaching cue */}
                        <div style={{ margin: '0 16px 14px', background: 'rgba(228,178,106,0.06)', border: '1px solid rgba(228,178,106,0.15)', borderRadius: 12, padding: '10px 14px', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                          <span className="ms ms-sm" style={{ fontSize: 15, color: GOLD, flexShrink: 0, marginTop: 1 }}>lightbulb</span>
                          <p style={{ fontSize: 12, color: MUTED, lineHeight: 1.55, fontStyle: 'italic' }}>{info.cue}</p>
                        </div>

                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {/* Sport Protocol */}
          {plan?.sportProtocol && (
            <div style={{ margin: '14px 16px', background: CARD, borderRadius: 20, padding: 20, border: `1px solid ${BORDER}` }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: GOLD, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                <span className="ms ms-sm" style={{ fontSize: 14 }}>emoji_events</span> Sport Protocol
              </p>
              {plan.sportProtocol.pre.length > 0 && (
                <div style={{ marginBottom: 12 }}>
                  <p style={{ fontSize: 10, fontWeight: 700, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Before</p>
                  {plan.sportProtocol.pre.map((s: string, i: number) => (
                    <div key={i} style={{ display: 'flex', gap: 10, fontSize: 13, color: TEXT, marginBottom: 6, lineHeight: 1.4 }}>
                      <span style={{ color: GOLD, fontWeight: 800 }}>→</span><span>{s}</span>
                    </div>
                  ))}
                </div>
              )}
              {plan.sportProtocol.post.length > 0 && (
                <div style={{ marginBottom: 12 }}>
                  <p style={{ fontSize: 10, fontWeight: 700, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>After</p>
                  {plan.sportProtocol.post.map((s: string, i: number) => (
                    <div key={i} style={{ display: 'flex', gap: 10, fontSize: 13, color: TEXT, marginBottom: 6, lineHeight: 1.4 }}>
                      <span style={{ color: CARBS, fontWeight: 800 }}>→</span><span>{s}</span>
                    </div>
                  ))}
                </div>
              )}
              <p style={{ fontSize: 12, color: MUTED, lineHeight: 1.6 }}>{plan.sportProtocol.nutrition}</p>
            </div>
          )}

          {/* Start Workout CTA
          {wo && (
            <div style={{ padding: '20px 16px 8px' }}>
              <button style={{
                width: '100%', padding: '18px 0', borderRadius: 18,
                background: GOLD, color: '#1B1714',
                fontSize: 16, fontWeight: 800, letterSpacing: '-0.3px',
                cursor: 'pointer', border: 'none',
                boxShadow: '0 4px 20px rgba(228,178,106,0.35)',
              }}>
                Start Workout
              </button>
            </div>
          )} */}

          {/* PR Modal */}
          {prModal && (
            <PRModal
              exercise={prModal}
              currentPR={prs[prModal.name.toLowerCase().trim()] ?? null}
              onClose={() => setPrModal(null)}
              onLog={(weight, reps) => {
                const isNew = logPR(prModal.name, weight, reps)
                return isNew
              }}
            />
          )}

          {/* ── Morning Warmup ─────────────────────────── */}
          {(plan?.warmup?.length ?? 0) > 0 && (() => {
            const warmupList = customWarmup ?? (plan?.warmup ?? []).map((e: any) => ({ name: e.name, sets: e.sets, muscle: e.muscle }))

            const saveWarmup = (list: typeof warmupList) => {
              setCustomWarmup(list)
              localStorage.setItem('mufasa_warmup', JSON.stringify(list))
              setEditingWarmup(false)
            }

            return (
              <div style={{ padding: '0 16px 24px', marginTop: 6 }}>
                {/* Section header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <p style={{ fontSize: 10, fontWeight: 700, color: MUTED, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                    Morning Warmup
                  </p>
                  <button
                    onClick={() => {
                      if (!editingWarmup) setWarmupDraft([...warmupList])
                      setEditingWarmup(e => !e)
                    }}
                    style={{ fontSize: 11, fontWeight: 700, color: editingWarmup ? GOLD : MUTED, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span className="ms ms-sm" style={{ fontSize: 13 }}>{editingWarmup ? 'close' : 'edit'}</span>
                    {editingWarmup ? 'Cancel' : 'Edit'}
                  </button>
                </div>

                {!editingWarmup ? (
                  /* ── View mode — immersive rows ── */
                  <div>
                    {warmupList.map((ex: any, i: number) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, paddingTop: 13, paddingBottom: 13, borderBottom: i < warmupList.length - 1 ? `1px solid ${BORDER}` : 'none' }}>
                        <div style={{ width: 32, height: 32, borderRadius: 10, flexShrink: 0, background: 'rgba(123,174,138,0.1)', border: `1px solid rgba(123,174,138,0.2)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: SAGE }}>
                          {i + 1}
                        </div>
                        <div style={{ flex: 1 }}>
                          <p style={{ fontSize: 14, fontWeight: 700, color: TEXT }}>{ex.name}</p>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                            <span style={{ fontSize: 12, color: MUTED }}>{ex.sets}</span>
                            {ex.muscle && (
                              <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 20, background: 'rgba(123,174,138,0.12)', color: SAGE, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                {ex.muscle}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  /* ── Edit mode ── */
                  <div>
                    {warmupDraft.map((ex, i) => (
                      <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
                        <input
                          value={ex.name}
                          onChange={e => setWarmupDraft(d => d.map((x, j) => j === i ? { ...x, name: e.target.value } : x))}
                          placeholder="Exercise name"
                          style={{ flex: 1, background: ELEV, border: `1px solid ${BORDER}`, borderRadius: 10, padding: '10px 12px', fontSize: 13, color: TEXT, outline: 'none', fontFamily: 'inherit' }}
                        />
                        <input
                          value={ex.sets}
                          onChange={e => setWarmupDraft(d => d.map((x, j) => j === i ? { ...x, sets: e.target.value } : x))}
                          placeholder="Sets"
                          style={{ width: 80, background: ELEV, border: `1px solid ${BORDER}`, borderRadius: 10, padding: '10px 12px', fontSize: 13, color: TEXT, outline: 'none', fontFamily: 'inherit' }}
                        />
                        <button onClick={() => setWarmupDraft(d => d.filter((_, j) => j !== i))} style={{ color: '#E05252', background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', lineHeight: 1, padding: '0 4px' }}>×</button>
                      </div>
                    ))}
                    <button
                      onClick={() => setWarmupDraft(d => [...d, { name: '', sets: '', muscle: '' }])}
                      style={{ width: '100%', padding: '10px 0', borderRadius: 12, background: 'rgba(255,255,255,0.04)', border: `1px dashed ${BORDER}`, color: MUTED, fontSize: 13, fontWeight: 700, cursor: 'pointer', marginBottom: 10 }}>
                      + Add exercise
                    </button>
                    <button
                      onClick={() => saveWarmup(warmupDraft.filter(e => e.name.trim()))}
                      style={{ width: '100%', padding: '12px 0', borderRadius: 12, background: GOLD, color: '#120D08', fontSize: 14, fontWeight: 800, cursor: 'pointer', border: 'none' }}>
                      Save warmup
                    </button>
                  </div>
                )}
              </div>
            )
          })()}
        </>
      )}
    </div>
  )
}
