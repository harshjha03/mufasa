import { useStore } from '../store/useStore'
import { WORKOUTS, DAYS } from '../lib/data'
import ExerciseFigure from '../components/ExerciseFigure'

export default function TodayScreen() {
  const { profile, plan, workoutDone, toggleExercise, startDate } = useStore()
  const now = new Date()
  const dow = now.getDay()
  const wo = WORKOUTS[dow]
  const hour = now.getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const firstName = profile?.name?.split(' ')[0] || ''
  const weekNum = startDate ? Math.max(1, Math.ceil((now.getTime() - new Date(startDate).getTime()) / (7 * 86400000))) : 1
  const todayKey = 'wd_' + now.toISOString().split('T')[0]
  const done = workoutDone[todayKey] || {}
  const total = wo?.exercises.length ?? 0
  const doneCount = Object.values(done).filter(Boolean).length
  const todayDate = now.toISOString().split('T')[0]

  return (
    <div className="pb-24">
      {/* Hero — full bleed, edge to edge, no margins */}
      <div className="relative overflow-hidden mb-4 text-white" style={{ background: 'linear-gradient(145deg, #1A1A2E 0%, #2D3561 35%, #005F73 70%, #0A9396 100%)', paddingTop: 'env(safe-area-inset-top, 48px)', minHeight: 220 }}>
        {/* Decorative circles */}
        <div className="absolute" style={{ top: -60, right: -60, width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(148,210,189,0.15), transparent 70%)' }} />
        <div className="absolute" style={{ bottom: -40, left: -40, width: 160, height: 160, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.05), transparent 70%)' }} />
        <div className="absolute" style={{ top: '30%', right: '15%', width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />

        <div className="relative px-5 pb-6 pt-2">
          {/* Greeting row */}
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold tracking-wide" style={{ color: 'rgba(255,255,255,0.5)' }}>
              {greeting}{firstName ? `, ${firstName}` : ''}
            </p>
            <div className="flex items-center gap-1.5" style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 20, padding: '4px 12px' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#94D2BD', display: 'inline-block' }} />
              <span className="text-xs font-bold" style={{ color: 'rgba(255,255,255,0.7)' }}>Wk {weekNum}</span>
            </div>
          </div>

          {/* Day + focus */}
          <h1 className="font-serif font-bold leading-none mb-1" style={{ fontSize: 52, letterSpacing: -1 }}>{DAYS[dow]}</h1>
          <p className="font-semibold mb-1" style={{ fontSize: 15, color: 'rgba(255,255,255,0.8)' }}>
            {wo ? wo.name : 'Rest Day — Full Recovery'}
          </p>

          {/* Date */}
          <p className="text-xs mb-5" style={{ color: 'rgba(255,255,255,0.35)' }}>
            {now.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>

          {/* Badges */}
          <div className="flex gap-2 flex-wrap">
            {dow !== 4 && (
              <span className="text-xs font-semibold px-3 py-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.1)' }}>
                {dow === 0 ? '🏏 Cricket' : '🏋️ Gym Day'}
              </span>
            )}
            <span className="text-xs font-semibold px-3 py-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.1)' }}>
              😴 Bed by 10:30 PM
            </span>
            {dow >= 1 && dow <= 5 && (
              <span className="text-xs font-semibold px-3 py-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.1)' }}>
                🥛 2 glasses milk
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Macro targets */}
      <div className="flex gap-3 mx-4 mb-3">
        <div className="flex-1 bg-white rounded-xl shadow-card p-4">
          <p className="text-xs font-bold tracking-widest text-ink/30 uppercase mb-2">Protein Target</p>
          <p className="text-2xl font-extrabold text-ink">{plan?.protein ?? '—'}g</p>
          <p className="text-xs text-ink/40 mt-0.5">Daily target</p>
          <div className="flex gap-2 mt-2">
            <span className="w-2 h-2 rounded-full bg-sage inline-block" />
            <span className="text-xs text-ink/30">P</span>
            <span className="w-2 h-2 rounded-full bg-blue-light inline-block" />
            <span className="text-xs text-ink/30">C</span>
            <span className="w-2 h-2 rounded-full bg-gold inline-block" />
            <span className="text-xs text-ink/30">F</span>
          </div>
        </div>
        <div className="flex-[0.8] bg-white rounded-xl shadow-card p-4">
          <p className="text-xs font-bold tracking-widest text-ink/30 uppercase mb-2">Calories</p>
          <p className="text-2xl font-extrabold text-ink">{plan?.calories.toLocaleString('en-IN') ?? '—'}</p>
          <p className="text-xs text-ink/40 mt-0.5">kcal target</p>
          <p className="text-xs text-teal font-bold mt-2 uppercase tracking-wide">
            {plan ? (plan.calories < (plan.tdee - 100) ? 'Cut Mode' : plan.calories > (plan.tdee + 100) ? 'Bulk Mode' : 'Recomp Mode') : ''}
          </p>
        </div>
      </div>

      {/* Today workout */}
      <div className="bg-white rounded-card shadow-card mx-4 mb-3 p-5">
        <p className="text-xs font-bold tracking-widest text-ink/30 uppercase mb-3">Today's Workout</p>
        {!wo || dow === 4 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-3">🌿</div>
            <p className="text-sm text-ink/50">Rest day. Light walk only.</p>
            <p className="text-xs text-ink/30 mt-1">This is when muscles repair.</p>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-ink/40">{doneCount}/{total} done today</span>
              <span className="text-xs font-bold text-teal">{Math.round(total ? doneCount / total * 100 : 0)}%</span>
            </div>
            <div className="bg-cream-2 rounded-full h-1.5 overflow-hidden mb-4">
              <div className="bg-gradient-to-r from-teal to-blue-light h-full rounded-full transition-all duration-500" style={{ width: `${total ? doneCount / total * 100 : 0}%` }} />
            </div>
            <div className="flex flex-col gap-2">
              {wo.exercises.slice(0, 4).map((ex, i) => (
                <button
                  key={i}
                  onClick={() => toggleExercise(todayDate, i)}
                  className={`flex items-center gap-3 p-3 rounded-xl transition-all text-left ${done[i] ? 'bg-teal-pale' : 'bg-cream'}`}
                >
                  <div className="w-11 h-11 flex items-center justify-center flex-shrink-0">
                    <ExerciseFigure anim={ex.anim} color={done[i] ? '#0A9396' : '#1A1A2E'} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-ink">{ex.n}</p>
                    <p className="text-xs text-ink/40 mt-0.5">{ex.s}</p>
                  </div>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs transition-all ${done[i] ? 'bg-teal border-teal text-white' : 'border-cream-3'}`}>
                    {done[i] && '✓'}
                  </div>
                </button>
              ))}
              {total > 4 && <p className="text-center text-xs text-ink/30 py-2">+{total - 4} more — see Workout tab</p>}
            </div>
          </>
        )}
      </div>

      {/* Today meals */}
      <div className="bg-white rounded-card shadow-card mx-4 mb-3 p-5">
        <p className="text-xs font-bold tracking-widest text-ink/30 uppercase mb-3">Today's Meals</p>
        {dow === 0 || dow === 6 ? (
          <div className="text-center py-6">
            <p className="text-sm text-ink/50">🎉 Weekend — eat normally.</p>
            {dow === 0 && <p className="text-xs text-ink/30 mt-1">Post-cricket: 1 whey scoop within 45 mins.</p>}
          </div>
        ) : (
          <div className="divide-y divide-cream-2">
            {(plan?.meals ?? []).map((m, i) => (
              <div key={i} className="flex gap-3 py-2.5">
                <span className="bg-ink-2 text-white text-xs font-bold px-2.5 py-1 rounded-full h-fit mt-0.5 whitespace-nowrap">{m.time}</span>
                <div>
                  <p className="text-sm font-semibold text-ink">{m.food}</p>
                  <p className="text-xs text-ink/40 mt-0.5">{m.p}g protein · {m.cal} kcal</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Avoid */}
      <div className="bg-white rounded-card shadow-card mx-4 mb-3 p-5">
        <p className="text-xs font-bold tracking-widest text-ink/30 uppercase mb-3">Avoid Today</p>
        {['Sugary drinks — Coke, Pepsi, packaged juice', 'Office biscuits & namkeen at desk', 'Maida — samosa, pav, kachori', 'Heavy meals after 10 PM', 'Alcohol'].map((item, i) => (
          <div key={i} className="flex gap-3 py-2 border-b border-cream-2 last:border-0 items-center">
            <span className="text-danger font-black text-lg leading-none">×</span>
            <span className="text-sm text-ink/70">{item}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
