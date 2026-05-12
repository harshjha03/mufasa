import { useState } from 'react'
import { useStore } from '../store/useStore'
import { DAYS, DAY_SHORT } from '../lib/data'
import ExerciseFigure from '../components/ExerciseFigure'

// ── Design tokens ────────────────────────────────────────
const BG     = '#120D08'
const CARD   = '#1C1410'
const ELEV   = '#221A12'
const BORDER = 'rgba(255,255,255,0.07)'
const TEXT   = '#F0E4C8'
const MUTED  = 'rgba(240,228,200,0.45)'
const GOLD   = '#D4A84B'
const COPPER = '#D4905A'
const AZURE  = '#5B8FA8'
const SAGE   = '#7BAE8A'

export default function WorkoutScreen() {
  const { plan, workoutDone, toggleExercise, selectedDay, setSelectedDay } = useStore()
  const [view, setView] = useState<'week' | 'day'>('day')

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
  const total     = wo?.exercises.length ?? 0
  const doneCount = Object.values(done).filter(Boolean).length

  // Muscle group tag colours
  const muscleColor = (muscle: string) => {
    const m = (muscle || '').toLowerCase()
    if (m.includes('chest') || m.includes('push')) return { bg: 'rgba(212,168,75,0.12)', text: GOLD }
    if (m.includes('back')  || m.includes('pull')) return { bg: 'rgba(91,143,168,0.12)', text: AZURE }
    if (m.includes('leg')   || m.includes('quad') || m.includes('glute')) return { bg: 'rgba(212,144,90,0.12)', text: COPPER }
    if (m.includes('shoulder') || m.includes('delt')) return { bg: 'rgba(123,174,138,0.12)', text: SAGE }
    return { bg: 'rgba(255,255,255,0.07)', text: MUTED }
  }

  return (
    <div style={{ background: 'linear-gradient(180deg, #2A1608 0%, #180B04 25%, #120D08 55%, #0E0A06 100%)', minHeight: '100vh', paddingBottom: 96 }}>

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
                <button key={d} onClick={() => setSelectedDay(d)} style={{
                  flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center',
                  padding: '10px 14px', borderRadius: 16, minWidth: 52, cursor: 'pointer',
                  background: isActive ? ELEV : CARD,
                  border: `1px solid ${isActive ? 'rgba(212,168,75,0.35)' : BORDER}`,
                  transition: 'all 0.2s',
                }}>
                  <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: isActive ? GOLD : MUTED }}>
                    {DAY_SHORT[d]}
                  </span>
                  <span style={{ fontSize: 20, fontWeight: 800, marginTop: 2, color: isActive ? TEXT : MUTED }}>
                    {num}
                  </span>
                  <div style={{
                    width: 5, height: 5, borderRadius: '50%', marginTop: 4,
                    background: hasWo ? (isActive ? GOLD : 'rgba(212,168,75,0.4)') : 'transparent',
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
              {wo && (
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: 22, fontWeight: 800, color: GOLD, letterSpacing: '-0.5px' }}>
                    {Math.round(total ? doneCount / total * 100 : 0)}%
                  </p>
                  <p style={{ fontSize: 10, color: MUTED }}>{doneCount}/{total} done</p>
                </div>
              )}
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
          ) : (
            <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {wo.exercises.map((ex: any, i: number) => {
                const isDone = done[i]
                const mc     = muscleColor(ex.muscle)
                return (
                  <button key={i} onClick={() => toggleExercise(selectedKey, i)} style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    padding: '14px 14px', borderRadius: 18, textAlign: 'left', cursor: 'pointer',
                    background: isDone ? 'rgba(212,168,75,0.08)' : CARD,
                    border: `1px solid ${isDone ? 'rgba(212,168,75,0.25)' : BORDER}`,
                    transition: 'all 0.2s',
                  }}>
                    <div style={{
                      width: 52, height: 52, flexShrink: 0, borderRadius: 14,
                      background: isDone ? 'rgba(212,168,75,0.1)' : ELEV,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      border: `1px solid ${isDone ? 'rgba(212,168,75,0.2)' : BORDER}`,
                    }}>
                      <ExerciseFigure anim={ex.anim} color={isDone ? GOLD : TEXT} size={34} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 14, fontWeight: 700, color: TEXT }}>{ex.name}</p>
                      <p style={{ fontSize: 12, color: MUTED, marginTop: 3 }}>{ex.sets}</p>
                      {ex.muscle && (
                        <span style={{
                          display: 'inline-block', marginTop: 6,
                          fontSize: 9, fontWeight: 700, padding: '2px 8px', borderRadius: 20,
                          letterSpacing: '0.05em', textTransform: 'uppercase',
                          background: mc.bg, color: mc.text,
                        }}>
                          {ex.muscle}
                        </span>
                      )}
                    </div>
                    <div style={{
                      width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                      border: `2px solid ${isDone ? GOLD : BORDER}`,
                      background: isDone ? GOLD : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 12, color: '#120D08', fontWeight: 900,
                      transition: 'all 0.2s',
                    }}>
                      {isDone ? '✓' : ''}
                    </div>
                  </button>
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
                      <span style={{ color: AZURE, fontWeight: 800 }}>→</span><span>{s}</span>
                    </div>
                  ))}
                </div>
              )}
              <p style={{ fontSize: 12, color: MUTED, lineHeight: 1.6 }}>{plan.sportProtocol.nutrition}</p>
            </div>
          )}

          {/* Warmup */}
          {(plan?.warmup?.length ?? 0) > 0 && (
            <div style={{ padding: '0 16px 16px' }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: MUTED, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12, marginTop: 14 }}>
                Morning Warmup
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {(plan?.warmup ?? []).map((ex: any, i: number) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    padding: '12px 14px', borderRadius: 16, background: CARD, border: `1px solid ${BORDER}`,
                  }}>
                    <div style={{ width: 50, height: 50, flexShrink: 0, borderRadius: 14, background: ELEV, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${BORDER}` }}>
                      <ExerciseFigure anim={ex.anim} color={SAGE} size={32} />
                    </div>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 700, color: TEXT }}>{ex.name}</p>
                      <p style={{ fontSize: 11, color: MUTED, marginTop: 3 }}>{ex.sets}</p>
                      {ex.muscle && (
                        <span style={{ display: 'inline-block', marginTop: 5, fontSize: 9, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: 'rgba(123,174,138,0.12)', color: SAGE, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                          {ex.muscle}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
