import { useState } from 'react'
import { useStore } from '../store/useStore'
import { DAYS, DAY_SHORT } from '../lib/data'
import ExerciseFigure from '../components/ExerciseFigure'

export default function WorkoutScreen() {
  const { plan, workoutDone, toggleExercise, selectedDay, setSelectedDay } = useStore()
  const [view, setView] = useState<'week' | 'day'>('day')
  const now = new Date()
  const todayDow = now.getDay()
  const workout = plan?.workout ?? {}
  const wo = workout[selectedDay]
  const ordered = [1, 2, 3, 4, 5, 6, 0]

  const getDayDate = (d: number) => {
    const diff = (d - todayDow + 7) % 7
    const date = new Date(now); date.setDate(now.getDate() + diff)
    return { num: date.getDate(), key: date.toISOString().split('T')[0] }
  }

  const { key: selectedKey } = getDayDate(selectedDay)
  const done = workoutDone['wd_' + selectedKey] || {}
  const total = wo?.exercises.length ?? 0
  const doneCount = Object.values(done).filter(Boolean).length

  return (
    <div className="pb-24">
      <div className="px-4 pt-12 pb-3">
        <h1 className="font-serif text-3xl font-bold text-ink">Workout</h1>
        {/* View toggle */}
        <div className="flex gap-1 bg-cream-2 p-1 rounded-xl mt-3 w-fit">
          {([['day', '📅 Day'], ['week', '📆 Full Week']] as const).map(([id, label]) => (
            <button key={id} onClick={() => setView(id)}
              className={`py-2 px-4 text-xs font-bold rounded-lg transition-all ${view === id ? 'bg-white text-ink shadow-sm' : 'text-ink/40'}`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── WEEK VIEW ── */}
      {view === 'week' && (
        <div className="px-4">
          <p className="text-xs text-ink/40 mb-3">Tap any day to switch to it</p>
          {ordered.map(d => {
            const { key } = getDayDate(d)
            const dayWo = workout[d]
            const dayDone = workoutDone['wd_' + key] || {}
            const dayTotal = dayWo?.exercises.length ?? 0
            const dayDoneCount = Object.values(dayDone).filter(Boolean).length
            const pct = dayTotal ? Math.round(dayDoneCount / dayTotal * 100) : 0
            const isToday = d === todayDow
            return (
              <button key={d} onClick={() => { setSelectedDay(d); setView('day') }}
                className={`w-full mb-3 bg-white rounded-card shadow-card p-4 text-left transition-all border-2 ${selectedDay === d ? 'border-teal' : 'border-transparent'} ${isToday ? 'ring-2 ring-teal/20' : ''}`}>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-extrabold text-ink">{DAYS[d]}</span>
                      {isToday && <span className="bg-teal text-white text-xs font-bold px-2 py-0.5 rounded-full">Today</span>}
                    </div>
                    <p className="text-xs text-ink/40 mt-0.5">{dayWo ? dayWo.name : 'Rest Day 🌿'}</p>
                  </div>
                  {dayWo && (
                    <div className="text-right">
                      <p className="text-lg font-extrabold text-ink">{pct}%</p>
                      <p className="text-xs text-ink/30">{dayDoneCount}/{dayTotal}</p>
                    </div>
                  )}
                </div>
                {dayWo ? (
                  <>
                    <div className="bg-cream-2 rounded-full h-1.5 overflow-hidden mb-2">
                      <div className="bg-gradient-to-r from-teal to-blue-light h-full rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {dayWo.exercises.slice(0, 4).map((ex, i) => (
                        <span key={i} className={`text-xs px-2 py-0.5 rounded-full font-medium ${dayDone[i] ? 'bg-teal-pale text-teal' : 'bg-cream-2 text-ink/40'}`}>
                          {ex.name.split(' ').slice(0, 2).join(' ')}
                        </span>
                      ))}
                      {dayWo.exercises.length > 4 && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-cream-2 text-ink/30">+{dayWo.exercises.length - 4} more</span>
                      )}
                    </div>
                  </>
                ) : (
                  <p className="text-xs text-ink/30">Light walk only · full recovery</p>
                )}
              </button>
            )
          })}
        </div>
      )}

      {/* ── DAY VIEW ── */}
      {view === 'day' && (
        <>
          {/* Day pills */}
          <div className="flex gap-2 px-4 pb-4 overflow-x-auto scrollbar-none">
            {ordered.map(d => {
              const { num } = getDayDate(d)
              const hasWo = workout[d] !== null && workout[d] !== undefined
              return (
                <button key={d} onClick={() => setSelectedDay(d)}
                  className={`flex-shrink-0 flex flex-col items-center px-3.5 py-2.5 rounded-xl border-2 transition-all min-w-[52px] ${selectedDay === d ? 'bg-ink-2 border-ink-2' : 'bg-white border-cream-3 shadow-card'}`}>
                  <span className={`text-xs font-bold uppercase tracking-wide ${selectedDay === d ? 'text-white/60' : 'text-ink/30'}`}>{DAY_SHORT[d]}</span>
                  <span className={`text-xl font-extrabold mt-0.5 ${selectedDay === d ? 'text-white' : 'text-ink'}`}>{num}</span>
                  <div className={`w-1.5 h-1.5 rounded-full mt-1 ${hasWo ? (selectedDay === d ? 'bg-teal-light' : 'bg-teal') : 'opacity-0'}`} />
                </button>
              )
            })}
          </div>

          <div className="px-4 mb-3">
            <h2 className="text-xl font-extrabold text-ink">{DAYS[selectedDay]}</h2>
            <p className="text-xs text-ink/40 mt-0.5">{wo?.name ?? 'Rest day'}</p>
          </div>

          {wo && (
            <div className="mx-4 mb-4">
              <div className="bg-cream-2 rounded-full h-1 overflow-hidden">
                <div className="bg-gradient-to-r from-teal to-blue-light h-full rounded-full transition-all duration-500" style={{ width: `${total ? doneCount / total * 100 : 0}%` }} />
              </div>
              <p className="text-xs text-ink/30 mt-1.5">{doneCount}/{total} done</p>
            </div>
          )}

          {!wo ? (
            <div className="bg-white rounded-card shadow-card mx-4 p-10 text-center">
              <div className="text-5xl mb-3">🌿</div>
              <p className="text-xl font-extrabold text-ink">Rest Day</p>
              <p className="text-sm text-ink/40 mt-2">Light walk only. Muscles repair today.</p>
            </div>
          ) : (
            <div className="px-4 flex flex-col gap-2.5 mb-6">
              {wo.exercises.map((ex, i) => (
                <button key={i} onClick={() => toggleExercise(selectedKey, i)}
                  className={`flex items-center gap-3 p-3.5 rounded-xl border-2 text-left transition-all ${done[i] ? 'border-teal-pale bg-teal-pale' : 'bg-white border-cream-3 shadow-card'}`}>
                  <div className="w-14 h-14 flex-shrink-0 bg-cream rounded-xl flex items-center justify-center">
                    <ExerciseFigure anim={ex.anim} color={done[i] ? '#0A9396' : '#1A1A2E'} size={40} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-ink">{ex.name}</p>
                    <p className="text-xs text-ink/40 mt-0.5">{ex.sets}</p>
                    <span className="inline-block text-xs font-bold uppercase tracking-wide bg-cream-2 text-ink/30 px-2 py-0.5 rounded-full mt-1.5">{ex.muscle}</span>
                  </div>
                  <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-sm flex-shrink-0 transition-all ${done[i] ? 'bg-teal border-teal text-white' : 'border-cream-3'}`}>
                    {done[i] && '✓'}
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Sport Protocol */}
          {plan?.sportProtocol && (
            <div className="mx-4 mb-4 bg-white rounded-card shadow-card p-5">
              <p className="text-xs font-bold tracking-widest text-gold uppercase mb-3">🏅 Sport Protocol</p>
              {plan.sportProtocol.pre.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs font-bold text-ink/40 uppercase tracking-wide mb-1.5">Before</p>
                  {plan.sportProtocol.pre.map((s, i) => <div key={i} className="flex gap-2 text-sm text-ink/70 mb-1"><span className="text-teal font-bold">→</span><span>{s}</span></div>)}
                </div>
              )}
              {plan.sportProtocol.post.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs font-bold text-ink/40 uppercase tracking-wide mb-1.5">After</p>
                  {plan.sportProtocol.post.map((s, i) => <div key={i} className="flex gap-2 text-sm text-ink/70 mb-1"><span className="text-teal font-bold">→</span><span>{s}</span></div>)}
                </div>
              )}
              <p className="text-xs text-ink/50 mt-2 leading-relaxed">{plan.sportProtocol.nutrition}</p>
            </div>
          )}

          {/* Warmup */}
          <div className="px-4 mb-2">
            <p className="text-xs font-bold tracking-widest text-ink/30 uppercase mb-3">Morning Warmup</p>
            <div className="flex flex-col gap-2.5">
              {(plan?.warmup ?? []).map((ex, i) => (
                <div key={i} className="flex items-center gap-3 p-3.5 bg-white rounded-xl shadow-card border border-cream-3">
                  <div className="w-14 h-14 flex-shrink-0 bg-cream rounded-xl flex items-center justify-center">
                    <ExerciseFigure anim={ex.anim} color="#52796F" size={40} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-ink">{ex.name}</p>
                    <p className="text-xs text-ink/40 mt-0.5">{ex.sets}</p>
                    <span className="inline-block text-xs font-bold uppercase tracking-wide bg-sage-pale text-sage px-2 py-0.5 rounded-full mt-1.5">{ex.muscle}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
