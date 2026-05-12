import { useStore } from '../store/useStore'
import ExerciseFigure from '../components/ExerciseFigure'

// ── Design tokens — immersiveBronze spec ─────────────────
const TEXT    = '#FBF6EE'
const MUTED   = 'rgba(251,246,238,0.5)'
const FAINT   = 'rgba(251,246,238,0.22)'
const DIVIDER = 'rgba(255,255,255,0.09)'
const GOLD    = '#E4B26A'   // immersiveBronze accent
const PROTEIN = '#7DD9C5'   // macroProtein
const CARBS   = '#92C2F2'   // macroCarbs
const FAT     = '#E4B26A'   // macroFat (same as accent)
const DARK_CARD = 'rgba(0,0,0,0.28)'

// ── Immersive macro ring — 58×58 per design spec ─────────
function MacroRing({ pct, label, value, color }: {
  pct: number; label: string; value: string; color: string
}) {
  const r    = 24
  const circ = 2 * Math.PI * r
  const off  = circ * (1 - Math.min(1, pct / 100))
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
      <div style={{ position: 'relative', width: 58, height: 58 }}>
        <svg width="58" height="58" viewBox="0 0 58 58">
          <circle cx="29" cy="29" r={r} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="5" />
          <circle cx="29" cy="29" r={r} fill="none" stroke={color} strokeWidth="5"
            strokeLinecap="round" strokeDasharray={circ}
            strokeDashoffset={off} transform="rotate(-90 29 29)"
            style={{ transition: 'stroke-dashoffset 0.7s ease' }} />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: TEXT, letterSpacing: -0.3 }}>
            {Math.round(pct)}%
          </span>
        </div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: 10, fontWeight: 600, color: MUTED, letterSpacing: 1, textTransform: 'uppercase', opacity: 0.7 }}>{label}</p>
        <p style={{ fontSize: 10, color: TEXT, opacity: 0.55, marginTop: 1 }}>{value}</p>
      </div>
    </div>
  )
}

// ────────────────────────────────────────────────────────
export default function TodayScreen({ onNavigate }: { onNavigate?: (s: string) => void }) {
  const { profile, plan, workoutDone, toggleExercise, startDate, foodLogs } = useStore()

  const now       = new Date()
  const dow       = now.getDay()
  const hour      = now.getHours()
  const greeting  = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const firstName = profile?.name?.split(' ')[0] || ''

  const weekNum = startDate
    ? Math.max(1, Math.ceil((now.getTime() - new Date(startDate).getTime()) / (7 * 86400000)))
    : 1
  const dayNum = startDate
    ? Math.max(1, Math.ceil((now.getTime() - new Date(startDate).getTime()) / 86400000))
    : 1

  const todayKey = 'wd_' + now.toISOString().split('T')[0]
  const today    = now.toISOString().split('T')[0]
  const done     = workoutDone[todayKey] || {}

  const wo        = plan?.workout?.[dow]
  const total     = wo?.exercises?.length ?? 0
  const doneCount = Object.values(done).filter(Boolean).length

  // Estimated session time (sets × ~2.5 min per set)
  const estMin = wo
    ? Math.round(wo.exercises.reduce((s: number, ex: any) => {
        const sets = parseInt((ex.sets ?? '3').match(/^\d+/)?.[0] ?? '3')
        return s + sets * 2.5
      }, 0))
    : 0

  const todayLogs      = foodLogs.filter(f => f.date === today)
  const caloriesLogged = Math.round(todayLogs.reduce((s, f) => s + f.calories * (f.quantity || 1), 0))
  const proteinLogged  = Math.round(todayLogs.reduce((s, f) => s + f.protein  * (f.quantity || 1), 0))
  const carbsLogged    = Math.round(todayLogs.reduce((s, f) => s + f.carbs    * (f.quantity || 1), 0))
  const fatLogged      = Math.round(todayLogs.reduce((s, f) => s + f.fat      * (f.quantity || 1), 0))

  const targetCal     = plan?.calories  ?? 2000
  const targetProtein = plan?.protein   ?? 150
  const targetCarbs   = plan?.carbs     ?? 200
  const targetFat     = plan?.fat       ?? 60

  const calPct  = targetCal     > 0 ? caloriesLogged / targetCal     * 100 : 0
  const pPct    = targetProtein > 0 ? proteinLogged  / targetProtein * 100 : 0
  const cPct    = targetCarbs   > 0 ? carbsLogged    / targetCarbs   * 100 : 0
  const fPct    = targetFat     > 0 ? fatLogged      / targetFat     * 100 : 0

  const mode = plan
    ? plan.calories < (plan.tdee - 100) ? 'Cut'
    : plan.calories > (plan.tdee + 100) ? 'Bulk'
    : 'Recomp'
    : ''

  const dateStr = now.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })
    .toUpperCase()

  const loggedMeals = todayLogs.length

  return (
    <div style={{
      minHeight: '100vh',
      paddingBottom: 100,
      // Immersive radial gradient — spec: radial-gradient(130% 100% at 100% 0%, #6B4423 0%, #2E1B0E 75%)
      background: 'radial-gradient(130% 100% at 100% 0%, #6B4423 0%, #2E1B0E 75%)',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Ambient glow 1 — warm top-right */}
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(70% 50% at 90% 0%, rgba(255,200,140,0.22), transparent 60%)', pointerEvents: 'none' }} />
      {/* Ambient glow 2 — circle */}
      <div style={{ position: 'absolute', top: -80, right: -80, width: 280, height: 280, borderRadius: '50%', background: 'radial-gradient(circle, rgba(228,178,106,0.18) 0%, transparent 65%)', pointerEvents: 'none' }} />

      {/* ── Top bar: greeting + chips ───────────────────── */}
      <div style={{
        paddingTop: 'max(env(safe-area-inset-top, 0px), 20px)',
        padding: 'max(env(safe-area-inset-top, 0px), 20px) 20px 0',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <p style={{ fontSize: 14, fontWeight: 500, color: MUTED }}>
          {greeting}{firstName ? `, ${firstName}` : ''}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(228,178,106,0.14)', borderRadius: 20, padding: '5px 10px' }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: GOLD, flexShrink: 0 }} />
            <span style={{ fontSize: 11, fontWeight: 600, color: TEXT }}>Wk {weekNum}</span>
          </div>
          <button
            onClick={() => onNavigate?.('profile')}
            style={{
              width: 32, height: 32, borderRadius: '50%', cursor: 'pointer',
              background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.12)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 13, fontWeight: 800, color: TEXT,
            }}>
            {firstName ? firstName[0].toUpperCase() : <span className="ms" style={{ fontSize: 14 }}>person</span>}
          </button>
        </div>
      </div>

      {/* ── Hero: date + big workout name ───────────────── */}
      <div style={{ padding: '16px 20px 24px' }}>
        <p style={{ fontSize: 11, fontWeight: 600, color: TEXT, letterSpacing: 2, opacity: 0.55, textTransform: 'uppercase', marginBottom: 10 }}>
          Today · {dateStr}
        </p>
        <h1 style={{
          fontSize: wo ? 52 : 44, fontWeight: 800, color: TEXT,
          letterSpacing: '-1.8px', lineHeight: 0.95,
          fontFamily: '-apple-system, BlinkMacSystemFont, system-ui',
          marginBottom: 14,
        }}>
          {wo ? wo.name + '.' : 'Rest Day.'}
        </h1>
        {wo ? (
          <p style={{ fontSize: 14, color: MUTED }}>
            {total} exercises&nbsp;&nbsp;·&nbsp;&nbsp;est. {estMin} min&nbsp;&nbsp;·&nbsp;&nbsp;
            <span style={{ color: doneCount > 0 ? GOLD : MUTED, fontWeight: doneCount > 0 ? 700 : 400 }}>
              {doneCount}/{total} done
            </span>
          </p>
        ) : (
          <p style={{ fontSize: 14, color: MUTED }}>Light walk only — muscles repair today</p>
        )}
      </div>

      {/* ── Divider ─────────────────────────────────────── */}
      <div style={{ height: 1, background: DIVIDER, margin: '0 20px' }} />

      {/* ── Macros Today ────────────────────────────────── */}
      <div style={{ padding: '20px 20px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: TEXT, letterSpacing: 2, textTransform: 'uppercase', opacity: 0.55 }}>
            {mode ? `${mode.toUpperCase()} · DAY ${dayNum}` : 'Macros Today'}
          </p>
          {calPct > 0 && (
            <p style={{ fontSize: 11, color: MUTED }}>
              {Math.min(100, Math.round(calPct))}% to goal
            </p>
          )}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0 }}>
          <MacroRing
            pct={calPct || 0} label="Kcal" color={TEXT}
            value={caloriesLogged > 0 ? caloriesLogged.toLocaleString('en-IN') : targetCal.toLocaleString('en-IN')}
          />
          <MacroRing
            pct={pPct || 0} label="Protein" color={PROTEIN}
            value={proteinLogged > 0 ? `${proteinLogged}g` : `${targetProtein}g`}
          />
          <MacroRing
            pct={cPct || 0} label="Carbs" color={CARBS}
            value={carbsLogged > 0 ? `${carbsLogged}g` : `${targetCarbs}g`}
          />
          <MacroRing
            pct={fPct || 0} label="Fat" color={FAT}
            value={fatLogged > 0 ? `${fatLogged}g` : `${targetFat}g`}
          />
        </div>
      </div>

      {/* ── Divider ─────────────────────────────────────── */}
      <div style={{ height: 1, background: DIVIDER, margin: '0 20px' }} />

      {/* ── Today's Workout ─────────────────────────────── */}
      <div style={{ padding: '20px 20px 24px' }}>
        {/* Section header */}
        <button
          onClick={() => onNavigate?.('workout')}
          style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: total > 0 ? 14 : 0, cursor: 'pointer' }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: TEXT, letterSpacing: 2, textTransform: 'uppercase', opacity: 0.55 }}>
            Today's Workout
          </p>
          {wo && (
            <p style={{ fontSize: 11, color: MUTED, display: 'flex', alignItems: 'center', gap: 4 }}>
              {doneCount} / {total} · {Math.round(total ? doneCount / total * 100 : 0)}%
              <span className="ms" style={{ fontSize: 14, color: FAINT }}>chevron_right</span>
            </p>
          )}
        </button>

        {wo && total > 0 && (
          <>
            {/* Thin per-exercise progress bars */}
            <div style={{ display: 'flex', gap: 4, marginBottom: 20 }}>
              {wo.exercises.map((_: any, i: number) => (
                <div key={i} style={{ flex: 1, height: 3, borderRadius: 3, background: done[i] ? GOLD : 'rgba(255,255,255,0.1)' }} />
              ))}
            </div>

            {/* Exercise rows — flat, immersive */}
            <div>
              {wo.exercises.map((ex: any, i: number) => {
                const isDone = done[i]
                return (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    paddingTop: i > 0 ? 16 : 0, paddingBottom: 16,
                    borderBottom: i < wo.exercises.length - 1 ? `1px solid ${DIVIDER}` : 'none',
                  }}>
                    {/* Figure icon */}
                    <div style={{
                      width: 48, height: 48, flexShrink: 0, borderRadius: 14,
                      background: isDone ? 'rgba(212,168,75,0.12)' : DARK_CARD,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <ExerciseFigure anim={ex.anim} color={isDone ? GOLD : TEXT} size={30} />
                    </div>

                    {/* Name + sets */}
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 16, fontWeight: 700, color: isDone ? MUTED : TEXT, textDecoration: isDone ? 'line-through' : 'none' }}>
                        {ex.name}
                      </p>
                      <p style={{ fontSize: 12, color: MUTED, marginTop: 3 }}>{ex.sets}</p>
                    </div>

                    {/* Start / Done pill */}
                    <button
                      onClick={() => toggleExercise(today, i)}
                      style={{
                        flexShrink: 0,
                        padding: '8px 18px', borderRadius: 20, cursor: 'pointer',
                        fontSize: 13, fontWeight: 700,
                        background: isDone ? 'rgba(255,255,255,0.07)' : GOLD,
                        color: isDone ? MUTED : '#120D08',
                        border: isDone ? `1px solid rgba(255,255,255,0.1)` : 'none',
                        transition: 'all 0.2s',
                      }}>
                      {isDone ? 'Done ✓' : 'Start'}
                    </button>
                  </div>
                )
              })}
            </div>
          </>
        )}

        {!wo && (
          <div style={{ paddingTop: 12, textAlign: 'center' }}>
            <span className="ms" style={{ color: 'rgba(212,168,75,0.2)', fontSize: 36, display: 'block', marginBottom: 10 }}>self_improvement</span>
            <p style={{ fontSize: 13, color: MUTED }}>Muscles repair on rest days. Light walk only.</p>
          </div>
        )}
      </div>

      {/* ── Divider ─────────────────────────────────────── */}
      <div style={{ height: 1, background: DIVIDER, margin: '0 20px' }} />

      {/* ── Today's Meals ───────────────────────────────── */}
      <div style={{ padding: '20px 20px 24px' }}>
        {/* Section header */}
        <button
          onClick={() => onNavigate?.('nutrition')}
          style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, cursor: 'pointer' }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: TEXT, letterSpacing: 2, textTransform: 'uppercase', opacity: 0.55 }}>
            Today's Meals
          </p>
          <p style={{ fontSize: 11, color: MUTED, display: 'flex', alignItems: 'center', gap: 4 }}>
            {loggedMeals > 0 ? `${loggedMeals} / ${plan?.meals?.length ?? 0} logged` : `${plan?.meals?.length ?? 0} planned`}
            <span className="ms" style={{ fontSize: 14, color: FAINT }}>chevron_right</span>
          </p>
        </button>

        {/* Meal rows */}
        {(plan?.meals ?? []).length === 0 ? (
          <p style={{ fontSize: 13, color: MUTED, textAlign: 'center', padding: '12px 0' }}>No meal plan yet</p>
        ) : (
          <div>
            {(plan!.meals).slice(0, 4).map((m: any, i: number, arr: any[]) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'flex-start', gap: 12,
                paddingTop: i > 0 ? 14 : 0, paddingBottom: 14,
                borderBottom: i < arr.length - 1 ? `1px solid ${DIVIDER}` : 'none',
              }}>
                <span style={{
                  flexShrink: 0,
                  background: '#1B1714', color: TEXT,
                  fontSize: 10, fontWeight: 700, padding: '5px 10px',
                  borderRadius: 999, letterSpacing: '0.03em',
                  marginTop: 1, whiteSpace: 'nowrap',
                }}>
                  {m.time}
                </span>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 14, fontWeight: 600, color: TEXT, lineHeight: 1.3 }}>{m.food}</p>
                  <p style={{ fontSize: 11, color: MUTED, marginTop: 3 }}>{m.p}g protein · {m.cal} kcal</p>
                </div>
              </div>
            ))}
            {plan!.meals.length > 4 && (
              <button onClick={() => onNavigate?.('nutrition')} style={{ width: '100%', paddingTop: 12, fontSize: 12, fontWeight: 700, color: GOLD, textAlign: 'center', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                +{plan!.meals.length - 4} more meals
                <span className="ms" style={{ fontSize: 14 }}>arrow_forward</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── Divider ─────────────────────────────────────── */}
      <div style={{ height: 1, background: DIVIDER, margin: '0 20px' }} />

      {/* ── 5 Rules ──────────────────────────────────────── */}
      <div style={{ padding: '20px 20px 8px' }}>
        <p style={{ fontSize: 11, fontWeight: 600, color: TEXT, letterSpacing: 2, textTransform: 'uppercase', opacity: 0.55, marginBottom: 20 }}>
          5 Rules That Override Everything
        </p>
        {[
          { n: 1, title: 'Sleep 8 hrs',                    desc: 'In bed by 10:30 PM. Growth happens at night, not the gym.' },
          { n: 2, title: 'Progressive overload every week', desc: 'One more rep or more weight. No progression = no change.' },
          { n: 3, title: 'Never skip legs',                 desc: 'Your back, knees, bowling pace — all depend on it.' },
          { n: 4, title: 'Protein in every meal',           desc: 'If a meal has no protein source, fix it.' },
          { n: 5, title: '12 weeks minimum',                desc: "Most people quit at week 3. Don't be that guy." },
        ].map(({ n, title, desc }) => (
          <div key={n} style={{
            display: 'flex', gap: 18,
            paddingTop: 14, paddingBottom: 14,
            borderBottom: n < 5 ? `1px solid ${DIVIDER}` : 'none',
          }}>
            <span style={{ fontSize: 14, fontWeight: 800, color: GOLD, minWidth: 16, marginTop: 1 }}>{n}</span>
            <div>
              <p style={{ fontSize: 14, fontWeight: 700, color: TEXT }}>{title}</p>
              <p style={{ fontSize: 12, color: MUTED, marginTop: 4, lineHeight: 1.6 }}>{desc}</p>
            </div>
          </div>
        ))}
      </div>

    </div>
  )
}
