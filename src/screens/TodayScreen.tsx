import { useStore } from '../store/useStore'
import ExerciseFigure from '../components/ExerciseFigure'

// ── Design tokens ────────────────────────────────────────
const TEXT   = '#F0E4C8'
const MUTED  = 'rgba(240,228,200,0.45)'
const FAINT  = 'rgba(240,228,200,0.18)'
const DIVIDER = 'rgba(255,255,255,0.08)'
const GOLD   = '#D4A84B'
const COPPER = '#D4905A'
const AZURE  = '#5B8FA8'
const SAGE   = '#7BAE8A'
const DARK_CARD = 'rgba(0,0,0,0.25)'

// ── Immersive macro ring ─────────────────────────────────
function MacroRing({ pct, label, value, color }: {
  pct: number; label: string; value: string; color: string
}) {
  const r    = 38
  const circ = 2 * Math.PI * r
  const off  = circ * (1 - Math.min(1, pct / 100))
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <div style={{ position: 'relative', width: 96, height: 96 }}>
        <svg width="96" height="96" viewBox="0 0 96 96" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx="48" cy="48" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6" />
          <circle cx="48" cy="48" r={r} fill="none" stroke={color} strokeWidth="6"
            strokeDasharray={circ} strokeDashoffset={off} strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.7s ease' }} />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: 18, fontWeight: 800, color: TEXT, lineHeight: 1, letterSpacing: '-0.5px' }}>
            {Math.round(pct)}%
          </span>
        </div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: 9, fontWeight: 800, color: MUTED, letterSpacing: '0.12em', textTransform: 'uppercase' }}>{label}</p>
        <p style={{ fontSize: 12, fontWeight: 700, color: TEXT, marginTop: 2 }}>{value}</p>
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
      // Immersive warm amber gradient — the key visual signature
      background: 'linear-gradient(180deg, #3B1D09 0%, #1E0D05 32%, #120D08 60%, #0E0A06 100%)',
    }}>

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
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(212,168,75,0.12)', border: '1px solid rgba(212,168,75,0.22)', borderRadius: 20, padding: '4px 10px' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: GOLD, flexShrink: 0 }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: GOLD }}>Wk {weekNum}</span>
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
        <p style={{ fontSize: 11, fontWeight: 700, color: FAINT, letterSpacing: '0.14em', marginBottom: 10 }}>
          TODAY · {dateStr}
        </p>
        <h1 style={{
          fontSize: wo ? 58 : 46, fontWeight: 800, color: TEXT,
          letterSpacing: '-2px', lineHeight: 0.95,
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
          <p style={{ fontSize: 11, fontWeight: 700, color: FAINT, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
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
            pct={pPct || 0} label="Protein" color={COPPER}
            value={proteinLogged > 0 ? `${proteinLogged}g` : `${targetProtein}g`}
          />
          <MacroRing
            pct={cPct || 0} label="Carbs" color={AZURE}
            value={carbsLogged > 0 ? `${carbsLogged}g` : `${targetCarbs}g`}
          />
          <MacroRing
            pct={fPct || 0} label="Fat" color={GOLD}
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
          <p style={{ fontSize: 11, fontWeight: 700, color: FAINT, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
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
          <p style={{ fontSize: 11, fontWeight: 700, color: FAINT, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
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
                  background: 'rgba(0,0,0,0.35)', color: TEXT,
                  fontSize: 10, fontWeight: 700, padding: '5px 10px',
                  borderRadius: 20, letterSpacing: '0.03em',
                  border: '1px solid rgba(255,255,255,0.08)',
                  marginTop: 1,
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
        <p style={{ fontSize: 11, fontWeight: 700, color: FAINT, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 20 }}>
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
