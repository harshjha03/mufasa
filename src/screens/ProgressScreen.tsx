import { useEffect, useRef, useState } from 'react'
import { useStore } from '../store/useStore'
import { TIMELINE } from '../lib/data'

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

export default function ProgressScreen() {
  const { weightLog, logWeight, startDate, plan, prs } = useStore()
  const [weightInput, setWeightInput] = useState('')
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const weekNum = startDate
    ? Math.max(1, Math.ceil((Date.now() - new Date(startDate).getTime()) / (7 * 86400000)))
    : 1
  const currentSection =
    weekNum >= 12 ? 4 : weekNum >= 8 ? 3 : weekNum >= 5 ? 2 : weekNum >= 3 ? 1 : 0

  const handleLog = async () => {
    const val = parseFloat(weightInput)
    if (isNaN(val) || val < 40 || val > 200) return
    await logWeight(val)
    setWeightInput('')
  }

  useEffect(() => { drawChart() }, [weightLog])

  const drawChart = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const dpr = window.devicePixelRatio || 1
    const W   = (canvas.parentElement?.offsetWidth ?? 340) - 40
    const H   = 180
    canvas.style.width  = W + 'px'
    canvas.style.height = H + 'px'
    canvas.width  = W * dpr
    canvas.height = H * dpr
    const ctx = canvas.getContext('2d')!
    ctx.scale(dpr, dpr)
    ctx.clearRect(0, 0, W, H)

    const data = weightLog
    if (data.length < 2) {
      ctx.fillStyle = 'rgba(240,228,200,0.3)'
      ctx.font      = `12px -apple-system, BlinkMacSystemFont, system-ui`
      ctx.textAlign = 'center'
      ctx.fillText('Log 2+ entries to see your trend', W / 2, H / 2)
      return
    }

    const weights = data.map(d => d.weight)
    const startW  = weights[0]
    const minW    = Math.min(...weights) - 2
    const maxW    = Math.max(...weights) + 2
    const pad     = { l: 44, r: 16, t: 16, b: 32 }
    const cw      = W - pad.l - pad.r
    const ch      = H - pad.t - pad.b
    const toX     = (i: number) => pad.l + (i / (data.length - 1)) * cw
    const toY     = (w: number) => pad.t + (1 - (w - minW) / (maxW - minW)) * ch

    // Grid lines
    ctx.strokeStyle = 'rgba(255,255,255,0.06)'
    ctx.lineWidth   = 1
    ;[minW + 1, (minW + maxW) / 2, maxW - 1].forEach(w => {
      ctx.beginPath(); ctx.moveTo(pad.l, toY(w)); ctx.lineTo(W - pad.r, toY(w)); ctx.stroke()
      ctx.fillStyle   = 'rgba(240,228,200,0.3)'
      ctx.font        = `9px -apple-system, sans-serif`
      ctx.textAlign   = 'right'
      ctx.fillText(w.toFixed(1), pad.l - 4, toY(w) + 3)
    })

    // Target pace line (dashed azure)
    ctx.setLineDash([4, 5])
    ctx.strokeStyle = 'rgba(91,143,168,0.4)'
    ctx.lineWidth   = 1.5
    ctx.beginPath()
    data.forEach((d, i) => {
      const weeks  = (new Date(d.date).getTime() - new Date(data[0].date).getTime()) / (7 * 86400000)
      const target = startW - (weeks / 4.33) * 0.75
      i === 0 ? ctx.moveTo(toX(i), toY(target)) : ctx.lineTo(toX(i), toY(target))
    })
    ctx.stroke()
    ctx.setLineDash([])

    // Fill under actual line
    const grad = ctx.createLinearGradient(0, pad.t, 0, H - pad.b)
    grad.addColorStop(0, 'rgba(212,168,75,0.12)')
    grad.addColorStop(1, 'rgba(212,168,75,0)')
    ctx.beginPath()
    data.forEach((d, i) => i === 0 ? ctx.moveTo(toX(i), toY(d.weight)) : ctx.lineTo(toX(i), toY(d.weight)))
    ctx.lineTo(toX(data.length - 1), H - pad.b)
    ctx.lineTo(toX(0), H - pad.b)
    ctx.closePath()
    ctx.fillStyle = grad
    ctx.fill()

    // Actual weight line
    ctx.strokeStyle = GOLD
    ctx.lineWidth   = 2.5
    ctx.lineJoin    = 'round'
    ctx.beginPath()
    data.forEach((d, i) => i === 0 ? ctx.moveTo(toX(i), toY(d.weight)) : ctx.lineTo(toX(i), toY(d.weight)))
    ctx.stroke()

    // Dots
    data.forEach((d, i) => {
      ctx.beginPath()
      ctx.arc(toX(i), toY(d.weight), 4, 0, Math.PI * 2)
      ctx.fillStyle   = BG
      ctx.fill()
      ctx.strokeStyle = GOLD
      ctx.lineWidth   = 2.5
      ctx.stroke()
    })

    // X-axis labels
    ctx.fillStyle = 'rgba(240,228,200,0.3)'
    ctx.font      = `9px -apple-system, sans-serif`
    ctx.textAlign = 'center'
    const step    = Math.max(1, Math.floor(data.length / 4))
    data.forEach((d, i) => {
      if (i === 0 || i === data.length - 1 || i % step === 0)
        ctx.fillText(d.date.slice(5), toX(i), H - 6)
    })
  }

  const first       = weightLog[0]?.weight
  const last        = weightLog[weightLog.length - 1]?.weight
  const totalChange = first !== undefined && last !== undefined && weightLog.length > 1
    ? (last - first).toFixed(1) : null
  const weeks   = weightLog.length > 1
    ? Math.max(1, Math.ceil((new Date(weightLog[weightLog.length - 1].date).getTime() - new Date(weightLog[0].date).getTime()) / (7 * 86400000)))
    : 1
  const monthly = totalChange ? ((last! - first!) / Math.max(weeks / 4.33, 1)).toFixed(1) : null
  const onTrack = monthly ? parseFloat(monthly) >= -1 && parseFloat(monthly) <= -0.3 : false

  return (
    <div style={{ background: 'linear-gradient(180deg, #2A1608 0%, #180B04 25%, #120D08 55%, #0E0A06 100%)', minHeight: '100vh', paddingBottom: 96 }}>

      {/* ── Header ──────────────────────────────────────── */}
      <div style={{ padding: 'max(env(safe-area-inset-top, 0px), 24px) 20px 20px' }}>
        <h1 style={{
          fontSize: 40, fontWeight: 800, color: TEXT,
          letterSpacing: '-1.5px', lineHeight: 1,
          fontFamily: '-apple-system, BlinkMacSystemFont, system-ui',
          marginBottom: 4,
        }}>
          Progress.
        </h1>
        <p style={{ fontSize: 13, color: MUTED }}>Weight · milestones · timeline</p>
      </div>

      {/* ── Stat cards ──────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, padding: '0 16px 14px' }}>
        {[
          {
            val:   last !== undefined ? `${last}` : '—',
            unit:  last !== undefined ? 'kg' : '',
            label: 'Current',
            color: TEXT,
          },
          {
            val:   totalChange ? `${parseFloat(totalChange) > 0 ? '+' : ''}${totalChange}` : '—',
            unit:  totalChange ? 'kg' : '',
            label: 'Total change',
            color: totalChange && parseFloat(totalChange) <= 0 ? GOLD : '#E05252',
          },
          {
            val:   monthly ? `${parseFloat(monthly) > 0 ? '+' : ''}${monthly}` : '—',
            unit:  monthly ? 'kg' : '',
            label: 'Per month',
            color: onTrack ? GOLD : MUTED,
          },
        ].map(({ val, unit, label, color }) => (
          <div key={label} style={{ background: CARD, borderRadius: 18, padding: '16px 14px', textAlign: 'center', border: `1px solid ${BORDER}` }}>
            <p style={{ fontSize: 22, fontWeight: 800, color, lineHeight: 1, letterSpacing: '-0.5px' }}>
              {val}<span style={{ fontSize: 12, fontWeight: 600, marginLeft: 2 }}>{unit}</span>
            </p>
            <p style={{ fontSize: 10, fontWeight: 700, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 6 }}>{label}</p>
          </div>
        ))}
      </div>

      {/* ── Log weight ──────────────────────────────────── */}
      <div style={{ margin: '0 16px 14px', background: CARD, borderRadius: 20, padding: 20, border: `1px solid ${BORDER}` }}>
        <p style={{ fontSize: 10, fontWeight: 700, color: MUTED, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>
          Log Weight
        </p>
        <p style={{ fontSize: 12, color: MUTED, marginBottom: 14 }}>Every Monday — post-toilet, pre-food</p>
        <div style={{ display: 'flex', gap: 10 }}>
          <input
            style={{
              flex: 1, minWidth: 0, background: ELEV, border: `1px solid ${BORDER}`,
              borderRadius: 14, padding: '13px 16px', fontSize: 20, fontWeight: 800, color: TEXT,
              outline: 'none', fontFamily: '-apple-system, BlinkMacSystemFont, system-ui',
            }}
            type="number" inputMode="decimal" placeholder="81.0" step="0.1"
            value={weightInput}
            onChange={e => setWeightInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLog()}
          />
          <button onClick={handleLog} style={{
            flexShrink: 0, background: GOLD, color: '#120D08', fontWeight: 800,
            padding: '0 22px', borderRadius: 14, fontSize: 20, cursor: 'pointer',
          }}>
            <span className="ms ms-sm" style={{ fontSize: 20 }}>add</span>
          </button>
        </div>
        <p style={{ fontSize: 11, color: MUTED, marginTop: 10 }}>Target: {plan?.weightTarget ?? '−0.5 to −1 kg/month'}</p>
      </div>

      {/* ── Weight chart ────────────────────────────────── */}
      <div style={{ margin: '0 16px 14px', background: CARD, borderRadius: 20, padding: 20, border: `1px solid ${BORDER}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
          <div>
            <p style={{ fontSize: 14, fontWeight: 700, color: TEXT }}>Weight Trend</p>
            <p style={{ fontSize: 11, color: MUTED, marginTop: 3 }}>Actual vs target pace (−0.75 kg/month)</p>
          </div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginTop: 2 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{ width: 16, height: 2.5, background: GOLD, borderRadius: 2 }} />
              <span style={{ fontSize: 9, color: MUTED }}>Actual</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{ width: 16, height: 2, borderTop: `2px dashed rgba(91,143,168,0.5)` }} />
              <span style={{ fontSize: 9, color: MUTED }}>Target</span>
            </div>
          </div>
        </div>
        <canvas ref={canvasRef} />
      </div>

      {/* ── Weight log history ──────────────────────────── */}
      <div style={{ margin: '0 16px 14px', background: CARD, borderRadius: 20, padding: 20, border: `1px solid ${BORDER}` }}>
        <p style={{ fontSize: 10, fontWeight: 700, color: MUTED, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 14 }}>
          Log History
        </p>
        {weightLog.length === 0 ? (
          <p style={{ fontSize: 13, color: MUTED, textAlign: 'center', padding: '12px 0' }}>No entries yet.</p>
        ) : (
          <div>
            {[...weightLog].reverse().slice(0, 8).map((e, idx, arr) => {
              const prev = arr[idx + 1]
              const diff = prev ? (e.weight - prev.weight).toFixed(1) : null
              return (
                <div key={e.date} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  paddingTop: 10, paddingBottom: 10,
                  borderBottom: idx < arr.slice(0, 8).length - 1 ? `1px solid ${BORDER}` : 'none',
                }}>
                  <span style={{ fontSize: 12, color: MUTED }}>{e.date}</span>
                  <span style={{ fontSize: 16, fontWeight: 800, color: TEXT }}>{e.weight} kg</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: diff ? (parseFloat(diff) < 0 ? GOLD : '#E05252') : MUTED, minWidth: 40, textAlign: 'right' }}>
                    {diff ? `${parseFloat(diff) > 0 ? '+' : ''}${diff}` : '—'}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ── Personal Records — visual bar chart ─────────── */}
      {(() => {
        const allPRs = Object.values(prs)
        if (allPRs.length === 0) return null

        const weighted = allPRs.filter(p => p.weight > 0).sort((a, b) => b.weight - a.weight)
        const bodyweight = allPRs.filter(p => p.weight === 0).sort((a, b) => b.reps - a.reps)
        const maxWeight = weighted.length ? Math.max(...weighted.map(p => p.weight)) : 1
        const maxReps   = bodyweight.length ? Math.max(...bodyweight.map(p => p.reps)) : 1

        const BarRow = ({ label, value, max, unit, date, color }: { label: string; value: number; max: number; unit: string; date: string; color: string }) => {
          const pct = Math.max(8, Math.round((value / max) * 100))
          return (
            <div style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 5 }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: TEXT }}>{label}</p>
                <p style={{ fontSize: 14, fontWeight: 800, color, letterSpacing: '-0.3px' }}>{value}{unit}</p>
              </div>
              <div style={{ height: 8, borderRadius: 8, background: 'rgba(255,255,255,0.07)', overflow: 'hidden', position: 'relative' }}>
                <div style={{ height: '100%', width: `${pct}%`, borderRadius: 8, background: `linear-gradient(90deg, ${color}, ${color}99)`, transition: 'width 0.6s ease' }} />
              </div>
              <p style={{ fontSize: 10, color: MUTED, marginTop: 4 }}>{date}</p>
            </div>
          )
        }

        return (
          <div style={{ margin: '0 16px 14px', background: CARD, borderRadius: 20, padding: 20, border: `1px solid ${BORDER}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <p style={{ fontSize: 10, fontWeight: 700, color: MUTED, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Personal Records</p>
                <p style={{ fontSize: 11, color: MUTED, marginTop: 3 }}>{allPRs.length} exercise{allPRs.length !== 1 ? 's' : ''} tracked</p>
              </div>
              <span style={{ fontSize: 24 }}>🏆</span>
            </div>

            {weighted.length > 0 && (
              <>
                <p style={{ fontSize: 9, fontWeight: 700, color: GOLD, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>Weighted lifts</p>
                {weighted.map(pr => (
                  <BarRow key={pr.exercise_name} label={pr.exercise_name} value={pr.weight} max={maxWeight} unit="kg" date={`${pr.reps} reps · ${pr.date}`} color={GOLD} />
                ))}
              </>
            )}

            {bodyweight.length > 0 && (
              <>
                {weighted.length > 0 && <div style={{ height: 1, background: BORDER, margin: '8px 0 16px' }} />}
                <p style={{ fontSize: 9, fontWeight: 700, color: AZURE, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>Bodyweight</p>
                {bodyweight.map(pr => (
                  <BarRow key={pr.exercise_name} label={pr.exercise_name} value={pr.reps} max={maxReps} unit=" reps" date={pr.date} color={AZURE} />
                ))}
              </>
            )}
          </div>
        )
      })()}

      {/* ── 12-Week Timeline ────────────────────────────── */}
      <div style={{ margin: '0 16px 14px', background: CARD, borderRadius: 20, padding: 20, border: `1px solid ${BORDER}` }}>
        <p style={{ fontSize: 10, fontWeight: 700, color: MUTED, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 20 }}>
          12-Week Timeline
        </p>

        {TIMELINE.map((item: any, i: number) => {
          const isPast    = i < currentSection
          const isCurrent = i === currentSection
          return (
            <div key={i} style={{ display: 'flex', gap: 16, paddingBottom: i < TIMELINE.length - 1 ? 20 : 0 }}>
              {/* Node + connector */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 800,
                  background: isCurrent ? 'rgba(212,168,75,0.12)' : isPast ? ELEV : 'transparent',
                  border: `2px solid ${isCurrent ? GOLD : isPast ? 'rgba(255,255,255,0.15)' : BORDER}`,
                  color: isCurrent ? GOLD : isPast ? MUTED : MUTED,
                  boxShadow: isCurrent ? '0 0 0 4px rgba(212,168,75,0.12)' : 'none',
                  transition: 'all 0.3s',
                }}>
                  {isPast ? '✓' : item.wk}
                </div>
                {i < TIMELINE.length - 1 && (
                  <div style={{ flex: 1, width: 1.5, background: isPast ? 'rgba(212,168,75,0.2)' : BORDER, marginTop: 4, minHeight: 20 }} />
                )}
              </div>

              {/* Content */}
              <div style={{ flex: 1, paddingTop: 6, paddingBottom: 4 }}>
                <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: isCurrent ? GOLD : MUTED, marginBottom: 3 }}>
                  Week {item.wk}
                </p>
                <p style={{ fontSize: 14, fontWeight: 700, color: isCurrent ? TEXT : (isPast ? MUTED : MUTED) }}>{item.label}</p>

                {isCurrent && (
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 8,
                    background: 'rgba(212,168,75,0.1)', border: '1px solid rgba(212,168,75,0.25)',
                    color: GOLD, fontSize: 10, fontWeight: 700, padding: '4px 10px', borderRadius: 20,
                  }}>
                    <span className="ms ms-sm" style={{ fontSize: 12 }}>location_on</span>
                    You are here — Week {weekNum}
                  </span>
                )}

                <p style={{ fontSize: 11, color: MUTED, marginTop: 8, lineHeight: 1.6 }}>🫀 {item.inside}</p>
                <p style={{ fontSize: 11, color: MUTED, marginTop: 3, lineHeight: 1.6, opacity: 0.8 }}>👁 {item.outside}</p>
              </div>
            </div>
          )
        })}
      </div>

    </div>
  )
}
