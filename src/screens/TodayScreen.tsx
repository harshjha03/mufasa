import { useStore } from '../store/useStore'
import { DAYS } from '../lib/data'
import ExerciseFigure from '../components/ExerciseFigure'

export default function TodayScreen({ onNavigate }: { onNavigate?: (s: string) => void }) {
  const { profile, plan, workoutDone, toggleExercise, startDate, foodLogs } = useStore()
  const now = new Date()
  const dow = now.getDay()
  const hour = now.getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const firstName = profile?.name?.split(' ')[0] || ''
  const weekNum = startDate ? Math.max(1, Math.ceil((now.getTime() - new Date(startDate).getTime()) / (7 * 86400000))) : 1
  const todayKey = 'wd_' + now.toISOString().split('T')[0]
  const today = now.toISOString().split('T')[0]
  const done = workoutDone[todayKey] || {}

  const wo = plan?.workout?.[dow]
  const total = wo?.exercises?.length ?? 0
  const doneCount = Object.values(done).filter(Boolean).length

  const todayLogs = foodLogs.filter(f => f.date === today)
  const caloriesLogged = Math.round(todayLogs.reduce((s, f) => s + f.calories * (f.quantity || 1), 0))
  const proteinLogged = Math.round(todayLogs.reduce((s, f) => s + f.protein * (f.quantity || 1), 0))
  const targetCal = plan?.calories ?? 0
  const targetProtein = plan?.protein ?? 0
  const calPct = targetCal ? Math.min(100, Math.round(caloriesLogged / targetCal * 100)) : 0

  const heroTitle = wo ? wo.name : 'Rest Day'
  const heroSub = wo ? `${total} exercises · ${doneCount}/${total} done` : 'Light walk only — muscles repair today'
  const mode = plan ? (plan.calories < (plan.tdee - 100) ? 'Cut' : plan.calories > (plan.tdee + 100) ? 'Bulk' : 'Recomp') : ''

  return (
    <div className="pb-20">
      {/* Hero */}
      <div className="relative overflow-hidden mb-4 text-white" style={{
        background: 'linear-gradient(145deg, #2A1F14 0%, #4A3520 35%, #7A5C2E 70%, #C9A96E 100%)',
        paddingTop: 'env(safe-area-inset-top, 48px)', minHeight: 220
      }}>
        <div className="absolute" style={{ top: -60, right: -60, width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(201,169,110,0.2), transparent 70%)' }} />
        <div className="absolute" style={{ bottom: -40, left: -40, width: 160, height: 160, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.05), transparent 70%)' }} />

        <div className="relative px-5 pb-6 pt-2">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold tracking-wide" style={{ color: 'rgba(255,255,255,0.5)' }}>
              {greeting}{firstName ? `, ${firstName}` : ''}
            </p>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5" style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 20, padding: '4px 12px' }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#C9A96E', display: 'inline-block' }} />
                <span className="text-xs font-bold" style={{ color: 'rgba(255,255,255,0.7)' }}>Wk {weekNum}</span>
              </div>
              <button onClick={() => onNavigate?.('profile')}
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)' }}>
                <span className="ms ms-sm">person</span>
              </button>
            </div>
          </div>

          <h1 className="font-extrabold leading-none mb-1" style={{ fontSize: 36, letterSpacing: -0.5 }}>{heroTitle}</h1>
          <p className="font-semibold mb-1" style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)' }}>{heroSub}</p>
          <p className="text-xs mb-4" style={{ color: 'rgba(255,255,255,0.35)' }}>
            {now.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>

          <div className="flex gap-2 flex-wrap">
            <span className="text-xs font-semibold px-3 py-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.15)' }}>
              <span className="ms ms-sm" style={{fontSize:13, verticalAlign:'middle'}}>fitness_center</span>
              {' '}{wo ? wo.name : 'Rest Day'}
            </span>
            <span className="text-xs font-semibold px-3 py-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.15)' }}>
              <span className="ms ms-sm" style={{fontSize:13, verticalAlign:'middle'}}>bedtime</span>
              {' '}Bed by {profile?.sleep_time || '10:30 PM'}
            </span>
            <span className="text-xs font-semibold px-3 py-1.5 rounded-full" style={{
              background: calPct >= 90 ? 'rgba(201,169,110,0.3)' : 'rgba(255,255,255,0.12)',
              backdropFilter: 'blur(8px)',
              border: `1px solid ${calPct >= 90 ? 'rgba(201,169,110,0.5)' : 'rgba(255,255,255,0.15)'}`
            }}>
              <span className="ms ms-sm" style={{fontSize:13, verticalAlign:'middle'}}>restaurant</span>
              {' '}{caloriesLogged > 0 ? `${caloriesLogged} / ${targetCal} kcal` : `${targetCal} kcal target`}
            </span>
          </div>
        </div>
      </div>

      {/* Unified macro card */}
      <div className="mx-4 mb-3 bg-white rounded-xl shadow-card p-4">
        <div className="flex justify-end mb-3">
          {mode && <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-gold-pale text-gold-dark">{mode} Mode</span>}
        </div>
        <div className="grid grid-cols-4 gap-2">
          {[
            { val: caloriesLogged > 0 ? caloriesLogged.toLocaleString('en-IN') : (plan?.calories.toLocaleString('en-IN') ?? '—'), label: 'kcal', color: 'text-ink', sub: caloriesLogged > 0 ? `/${plan?.calories}` : 'target' },
            { val: caloriesLogged > 0 ? `${proteinLogged}g` : `${plan?.protein ?? '—'}g`, label: 'Protein', color: 'text-teal-dark', sub: caloriesLogged > 0 ? `/${plan?.protein}g` : 'target' },
            { val: `${plan?.carbs ?? '—'}g`, label: 'Carbs', color: 'text-blue', sub: 'target' },
            { val: `${plan?.fat ?? '—'}g`, label: 'Fat', color: 'text-gold-dark', sub: 'target' },
          ].map(({ val, label, color, sub }) => (
            <div key={label} className="text-center">
              <p className={`text-base font-extrabold ${color}`}>{val}</p>
              <p className="text-xs text-ink/30 mt-0.5">{label}</p>
              {caloriesLogged > 0 && <p className="text-xs text-ink/20">{sub}</p>}
            </div>
          ))}
        </div>
        {caloriesLogged > 0 && (
          <div className="mt-3">
            <div className="bg-cream-2 rounded-full h-1.5 overflow-hidden">
              <div className="h-full rounded-full transition-all" style={{ width: `${calPct}%`, background: 'linear-gradient(90deg, #C9A96E, #A07840)' }} />
            </div>
            <p className="text-xs text-ink/30 mt-1">{calPct}% of daily target</p>
          </div>
        )}
      </div>

      {/* Today workout — tappable → workout tab */}
      <button className="bg-white rounded-card shadow-card mx-4 mb-3 p-5 text-left w-[calc(100%-32px)] active:opacity-80"
        onClick={() => onNavigate?.('workout')}>
        <div className="flex justify-between items-center mb-3">
          <p className="text-xs font-bold tracking-widest text-ink/30 uppercase">Today's Workout</p>
          <span className="ms ms-sm text-ink/20" style={{fontSize:16}}>chevron_right</span>
        </div>
        {!wo ? (
          <div className="text-center py-6">
            <span className="ms ms-xl text-gold/30 block mb-3">self_improvement</span>
            <p className="text-sm text-ink/50">Rest day — Recover Strong</p>
            <p className="text-xs text-ink/30 mt-1">Muscles grow during rest, not during training.</p>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-ink/40">{doneCount}/{total} done today</span>
              <span className="text-xs font-bold text-gold-dark">{Math.round(total ? doneCount / total * 100 : 0)}%</span>
            </div>
            <div className="bg-cream-2 rounded-full h-1.5 overflow-hidden mb-4">
              <div className="h-full rounded-full transition-all duration-500" style={{ width: `${total ? doneCount / total * 100 : 0}%`, background: 'linear-gradient(90deg, #C9A96E, #A07840)' }} />
            </div>
            <div className="flex flex-col gap-2">
              {wo.exercises.slice(0, 4).map((ex, i) => (
                <div key={i} onClick={e => { e.stopPropagation(); toggleExercise(today, i) }}
                  className={`flex items-center gap-3 p-3 rounded-xl transition-all text-left cursor-pointer ${done[i] ? 'bg-gold-pale' : 'bg-cream'}`}>
                  <div className="w-11 h-11 flex items-center justify-center flex-shrink-0">
                    <ExerciseFigure anim={ex.anim} color={done[i] ? '#C9A96E' : '#2A1F14'} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-ink">{ex.name}</p>
                    <p className="text-xs text-ink/40 mt-0.5">{ex.sets}</p>
                  </div>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs transition-all ${done[i] ? 'border-gold bg-gold text-white' : 'border-cream-3'}`}>
                    {done[i] && '✓'}
                  </div>
                </div>
              ))}
              {total > 4 && <p className="text-center text-xs text-ink/30 py-2">+{total - 4} more exercises</p>}
            </div>
            <div className="mt-3 pt-3 border-t border-cream-2 flex items-center justify-between">
              <span className="text-xs font-bold text-gold-dark">View full workout</span>
              <span className="ms ms-sm text-gold-dark" style={{fontSize:16}}>arrow_forward</span>
            </div>
          </>
        )}
      </button>

      {/* Today meals — tappable → nutrition tab */}
      <button className="bg-white rounded-card shadow-card mx-4 mb-3 p-5 text-left w-[calc(100%-32px)] active:opacity-80"
        onClick={() => onNavigate?.('nutrition')}>
        <div className="flex justify-between items-center mb-3">
          <p className="text-xs font-bold tracking-widest text-ink/30 uppercase">Today's Meals</p>
          <span className="ms ms-sm text-ink/20" style={{fontSize:16}}>chevron_right</span>
        </div>
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
        <div className="mt-3 pt-3 border-t border-cream-2 flex items-center justify-between">
          <span className="text-xs font-bold text-gold-dark">Log today's food</span>
          <span className="ms ms-sm text-gold-dark" style={{fontSize:16}}>arrow_forward</span>
        </div>
      </button>

      {/* 5 Rules — moved from WorkoutScreen */}
      <div className="bg-ink-2 rounded-card mx-4 mb-3 p-5">
        <p className="text-xs font-bold tracking-widest text-white/40 uppercase mb-4">5 Rules That Override Everything</p>
        {[
          { n: 1, title: 'Sleep 8 hrs', desc: 'In bed by 10:30 PM. Growth happens at night, not the gym.' },
          { n: 2, title: 'Progressive overload every week', desc: 'One more rep or more weight. No progression = no change.' },
          { n: 3, title: 'Never skip legs', desc: 'Your back, knees, bowling pace — all depend on it.' },
          { n: 4, title: 'Protein in every meal', desc: 'If a meal has no protein source, fix it.' },
          { n: 5, title: '12 weeks minimum', desc: "Most people quit at week 3. Don't be that guy." },
        ].map(({ n, title, desc }) => (
          <div key={n} className="flex gap-4 py-3 border-b border-white/10 last:border-0">
            <span className="text-gold-dark font-extrabold text-sm w-4 flex-shrink-0 mt-0.5">{n}</span>
            <div>
              <p className="text-sm font-bold text-white">{title}</p>
              <p className="text-xs text-white/40 mt-0.5 leading-relaxed">{desc}</p>
            </div>
          </div>
        ))}
      </div>


    </div>
  )
}
