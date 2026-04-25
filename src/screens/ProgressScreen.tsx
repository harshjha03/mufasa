import { useEffect, useRef, useState } from 'react'
import { useStore } from '../store/useStore'
import { TIMELINE } from '../lib/data'

export default function ProgressScreen() {
  const { weightLog, logWeight, startDate, plan } = useStore()
  const [weightInput, setWeightInput] = useState('')
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const weekNum = startDate ? Math.max(1, Math.ceil((Date.now() - new Date(startDate).getTime()) / (7 * 86400000))) : 1
  const currentSection = weekNum >= 12 ? 4 : weekNum >= 8 ? 3 : weekNum >= 5 ? 2 : weekNum >= 3 ? 1 : 0

  const handleLog = async () => {
    const val = parseFloat(weightInput)
    if (isNaN(val) || val < 40 || val > 200) return
    await logWeight(val)
    setWeightInput('')
  }

  useEffect(() => {
    drawChart()
  }, [weightLog])

  const drawChart = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const dpr = window.devicePixelRatio || 1
    const W = canvas.parentElement!.offsetWidth - 40
    const H = 180
    canvas.style.width = W + 'px'
    canvas.style.height = H + 'px'
    canvas.width = W * dpr
    canvas.height = H * dpr
    const ctx = canvas.getContext('2d')!
    ctx.scale(dpr, dpr)
    ctx.clearRect(0, 0, W, H)

    const data = weightLog
    if (data.length < 2) {
      ctx.fillStyle = '#94A3B8'
      ctx.font = '12px Outfit'
      ctx.textAlign = 'center'
      ctx.fillText('Log 2+ entries to see your trend', W / 2, H / 2)
      return
    }

    const weights = data.map(d => d.weight)
    const startW = weights[0]
    const minW = Math.min(...weights) - 2
    const maxW = Math.max(...weights) + 2
    const pad = { l: 44, r: 16, t: 16, b: 32 }
    const cw = W - pad.l - pad.r
    const ch = H - pad.t - pad.b
    const toX = (i: number) => pad.l + (i / (data.length - 1)) * cw
    const toY = (w: number) => pad.t + (1 - (w - minW) / (maxW - minW)) * ch

    // Grid
    ctx.strokeStyle = '#EDE9E1'; ctx.lineWidth = 1
    ;[minW + 1, (minW + maxW) / 2, maxW - 1].forEach(w => {
      ctx.beginPath(); ctx.moveTo(pad.l, toY(w)); ctx.lineTo(W - pad.r, toY(w)); ctx.stroke()
      ctx.fillStyle = '#94A3B8'; ctx.font = '9px Outfit'; ctx.textAlign = 'right'
      ctx.fillText(w.toFixed(1), pad.l - 4, toY(w) + 3)
    })

    // Target line
    ctx.setLineDash([4, 4]); ctx.strokeStyle = '#94D2BD'; ctx.lineWidth = 1.5
    ctx.beginPath()
    data.forEach((d, i) => {
      const weeks = (new Date(d.date).getTime() - new Date(data[0].date).getTime()) / (7 * 86400000)
      const target = startW - (weeks / 4.33) * 0.75
      i === 0 ? ctx.moveTo(toX(i), toY(target)) : ctx.lineTo(toX(i), toY(target))
    })
    ctx.stroke(); ctx.setLineDash([])

    // Fill
    const grad = ctx.createLinearGradient(0, pad.t, 0, H - pad.b)
    grad.addColorStop(0, 'rgba(10,147,150,.15)'); grad.addColorStop(1, 'rgba(10,147,150,0)')
    ctx.beginPath()
    data.forEach((d, i) => i === 0 ? ctx.moveTo(toX(i), toY(d.weight)) : ctx.lineTo(toX(i), toY(d.weight)))
    ctx.lineTo(toX(data.length - 1), H - pad.b); ctx.lineTo(toX(0), H - pad.b)
    ctx.closePath(); ctx.fillStyle = grad; ctx.fill()

    // Line
    ctx.strokeStyle = '#0A9396'; ctx.lineWidth = 2.5
    ctx.beginPath()
    data.forEach((d, i) => i === 0 ? ctx.moveTo(toX(i), toY(d.weight)) : ctx.lineTo(toX(i), toY(d.weight)))
    ctx.stroke()

    // Dots
    data.forEach((d, i) => {
      ctx.beginPath(); ctx.arc(toX(i), toY(d.weight), 4, 0, Math.PI * 2)
      ctx.fillStyle = '#fff'; ctx.fill()
      ctx.strokeStyle = '#0A9396'; ctx.lineWidth = 2.5; ctx.stroke()
    })

    // X labels
    ctx.fillStyle = '#94A3B8'; ctx.font = '9px Outfit'; ctx.textAlign = 'center'
    const step = Math.max(1, Math.floor(data.length / 4))
    data.forEach((d, i) => {
      if (i === 0 || i === data.length - 1 || i % step === 0)
        ctx.fillText(d.date.slice(5), toX(i), H - 6)
    })
  }

  const first = weightLog[0]?.weight
  const last = weightLog[weightLog.length - 1]?.weight
  const totalChange = first && last ? (last - first).toFixed(1) : null
  const weeks = weightLog.length > 1
    ? Math.ceil((new Date(weightLog[weightLog.length - 1].date).getTime() - new Date(weightLog[0].date).getTime()) / (7 * 86400000))
    : 1
  const monthly = totalChange ? ((last! - first!) / Math.max(weeks / 4.33, 1)).toFixed(1) : null
  const onTrack = monthly ? parseFloat(monthly) >= -1 && parseFloat(monthly) <= -0.3 : false

  return (
    <div className="pb-24">
      <div className="px-4 pt-12 pb-4">
        <h1 className="font-serif text-3xl font-bold text-ink">Progress</h1>
        <p className="text-xs text-ink/40 mt-1">Weight · milestones · timeline</p>
      </div>

      {/* Log weight */}
      <div className="bg-white rounded-card shadow-card mx-4 mb-3 p-5">
        <p className="text-xs font-bold tracking-widest text-ink/30 uppercase mb-1">Log Weight</p>
        <p className="text-xs text-ink/40 mb-3">Every Monday — post-toilet, pre-food</p>
        <div className="flex gap-2">
          <input
            className="flex-1 bg-cream border-2 border-cream-3 focus:border-teal text-ink font-bold text-lg px-4 py-3 rounded-xl outline-none transition-colors"
            type="number" placeholder="81.0" step="0.1" value={weightInput}
            onChange={e => setWeightInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLog()}
          />
          <button onClick={handleLog} className="bg-teal text-white font-bold text-sm px-5 rounded-xl active:opacity-80">LOG IT</button>
        </div>
        <p className="text-xs text-ink/30 mt-2">Target: {plan?.weightTarget ?? '−0.5 to −1 kg/month'}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2.5 mx-4 mb-3">
        {[
          { val: last ? `${last}kg` : '—', label: 'Current', color: '' },
          { val: totalChange ? `${parseFloat(totalChange) > 0 ? '+' : ''}${totalChange}kg` : '—', label: 'Total', color: totalChange && parseFloat(totalChange) <= 0 ? 'text-teal' : 'text-danger' },
          { val: monthly ? `${parseFloat(monthly) > 0 ? '+' : ''}${monthly}` : '—', label: '/Month', color: onTrack ? 'text-teal' : 'text-gold' },
        ].map(({ val, label, color }) => (
          <div key={label} className="bg-white rounded-xl shadow-card p-3.5 text-center">
            <p className={`text-xl font-extrabold leading-none ${color || 'text-ink'}`}>{val}</p>
            <p className="text-xs font-bold tracking-wide text-ink/30 uppercase mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="bg-white rounded-card shadow-card mx-4 mb-3 p-5">
        <p className="text-sm font-bold text-ink">Weight Trend</p>
        <p className="text-xs text-ink/40 mb-4">Actual vs target (−0.75 kg/month)</p>
        <canvas ref={canvasRef} />
      </div>

      {/* Log history */}
      <div className="bg-white rounded-card shadow-card mx-4 mb-3 p-5">
        <p className="text-xs font-bold tracking-widest text-ink/30 uppercase mb-3">Log History</p>
        {weightLog.length === 0 ? (
          <p className="text-sm text-ink/30 text-center py-4">No entries yet.</p>
        ) : (
          <div>
            {[...weightLog].reverse().slice(0, 8).map((e, idx, arr) => {
              const prev = arr[idx + 1]
              const diff = prev ? (e.weight - prev.weight).toFixed(1) : null
              return (
                <div key={e.date} className="flex justify-between items-center py-2.5 border-b border-cream-2 last:border-0">
                  <span className="text-sm text-ink/60 font-medium">{e.date}</span>
                  <span className="text-base font-extrabold text-ink">{e.weight} kg</span>
                  <span className={`text-xs font-bold ${diff ? (parseFloat(diff) < 0 ? 'text-teal' : 'text-danger') : 'text-ink/30'}`}>
                    {diff ? `${parseFloat(diff) > 0 ? '+' : ''}${diff}` : '—'}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Timeline */}
      <div className="bg-white rounded-card shadow-card mx-4 mb-3 p-5">
        <p className="text-xs font-bold tracking-widest text-ink/30 uppercase mb-4">12-Week Timeline</p>
        {TIMELINE.map((item, i) => (
          <div key={i} className="flex gap-4 pb-4 last:pb-0">
            <div className="flex flex-col items-center">
              <div className={`w-9 h-9 rounded-full border-3 flex items-center justify-center text-xs font-extrabold flex-shrink-0 transition-all ${i === currentSection ? 'bg-teal border-teal text-white shadow-[0_0_0_4px_rgba(10,147,150,0.2)]' : i < currentSection ? 'bg-ink-2 border-ink-2 text-white' : 'bg-cream-2 border-cream-3 text-ink/30'}`}
                style={{ borderWidth: 3 }}>
                {i < currentSection ? '✓' : item.wk}
              </div>
              {i < TIMELINE.length - 1 && <div className="flex-1 w-0.5 bg-cream-3 mt-1 min-h-[20px]" />}
            </div>
            <div className="flex-1 pt-1.5 pb-2">
              <p className={`text-xs font-bold tracking-widest uppercase ${i === currentSection ? 'text-teal' : 'text-ink/30'}`}>Week {item.wk}</p>
              <p className="text-sm font-bold text-ink mt-0.5">{item.label}</p>
              {i === currentSection && (
                <span className="inline-block bg-teal-pale border border-teal-light text-teal text-xs font-bold px-2.5 py-1 rounded-lg mt-1.5">📍 You are here — Week {weekNum}</span>
              )}
              <p className="text-xs text-ink/40 mt-2 leading-relaxed">🫀 {item.inside}</p>
              <p className="text-xs text-ink/60 mt-1 leading-relaxed">👁 {item.outside}</p>
            </div>
          </div>
        ))}
      </div>

      {/* 5 Rules */}
      <div className="bg-ink-2 rounded-card mx-4 mb-3 p-5">
        <p className="text-xs font-bold tracking-widest text-white/40 uppercase mb-4">5 Rules That Override Everything</p>
        {[
          { n: '1', title: 'Sleep 8 hrs', sub: 'In bed by 10:30 PM. Growth happens at night, not the gym.' },
          { n: '2', title: 'Progressive overload every week', sub: 'One more rep or more weight. No progression = no change.' },
          { n: '3', title: 'Never skip legs', sub: 'Your back, knees, bowling pace — all depend on it.' },
          { n: '4', title: 'Protein in every meal', sub: 'If a meal has no protein source, fix it.' },
          { n: '5', title: '12 weeks minimum', sub: 'Most people quit at week 3. Don\'t be that guy.' },
        ].map(({ n, title, sub }) => (
          <div key={n} className="flex gap-3 mb-4 last:mb-0">
            <span className="font-serif text-xl text-teal-light min-w-[20px]">{n}</span>
            <div>
              <p className="text-sm font-bold text-white">{title}</p>
              <p className="text-xs text-white/40 mt-1">{sub}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
