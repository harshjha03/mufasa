import { useState } from 'react'
import { useStore } from '../store/useStore'
import { TIMELINE } from '../lib/data'
import { WeightTrendChart } from '../components/WeightTrendChart'
import Carousel3D from '../components/Carousel3D'
import type { PersonalRecord } from '../types'

// Inline SVG vectors for exercise cards — no external images needed
const _vec = (body: string) =>
  'data:image/svg+xml,' + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 260">' +
    '<defs><radialGradient id="bg" cx="50%" cy="30%" r="80%">' +
    '<stop offset="0%" stop-color="#261208"/><stop offset="100%" stop-color="#0D0704"/>' +
    '</radialGradient></defs>' +
    '<rect width="200" height="260" fill="url(#bg)"/>' +
    '<g stroke="#D4A84B" stroke-linecap="round" stroke-linejoin="round" fill="none">' +
    body + '</g></svg>'
  )

const _bar = (y: number, x1 = 45, x2 = 155) =>
  `<line x1="${x1}" y1="${y}" x2="${x2}" y2="${y}" stroke-width="6"/>` +
  `<rect x="${x1 - 7}" y="${y - 8}" width="8" height="16" rx="2" fill="#D4A84B"/>` +
  `<rect x="${x2 - 1}" y="${y - 8}" width="8" height="16" rx="2" fill="#D4A84B"/>`

// Head + vertical spine + shoulder line + hips + legs (standing)
const _stand = (headY = 52, torsoBot = 155) =>
  `<circle cx="100" cy="${headY}" r="13" stroke-width="3"/>` +
  `<line x1="100" y1="${headY + 13}" x2="100" y2="${torsoBot}" stroke-width="3"/>` +
  `<line x1="72" y1="${headY + 26}" x2="128" y2="${headY + 26}" stroke-width="3"/>` +
  `<line x1="80" y1="${torsoBot}" x2="120" y2="${torsoBot}" stroke-width="3"/>` +
  `<line x1="80" y1="${torsoBot}" x2="75" y2="215" stroke-width="3"/>` +
  `<line x1="120" y1="${torsoBot}" x2="125" y2="215" stroke-width="3"/>` +
  `<line x1="62" y1="215" x2="88" y2="215" stroke-width="3"/>` +
  `<line x1="112" y1="215" x2="138" y2="215" stroke-width="3"/>`

const SQUAT_VEC = _vec(
  _bar(90) +
  '<circle cx="100" cy="52" r="13" stroke-width="3"/>' +
  '<line x1="100" y1="65" x2="100" y2="78" stroke-width="3"/>' +
  '<line x1="85" y1="82" x2="68" y2="90" stroke-width="3"/>' +
  '<line x1="115" y1="82" x2="132" y2="90" stroke-width="3"/>' +
  '<line x1="100" y1="78" x2="97" y2="138" stroke-width="3"/>' +
  '<line x1="97" y1="138" x2="58" y2="158" stroke-width="3"/>' +
  '<line x1="58" y1="158" x2="46" y2="210" stroke-width="3"/>' +
  '<line x1="36" y1="210" x2="60" y2="210" stroke-width="3"/>' +
  '<line x1="97" y1="138" x2="136" y2="158" stroke-width="3"/>' +
  '<line x1="136" y1="158" x2="154" y2="210" stroke-width="3"/>' +
  '<line x1="144" y1="210" x2="168" y2="210" stroke-width="3"/>'
)

const BENCH_VEC = _vec(
  _bar(105) +
  '<line x1="78" y1="150" x2="80" y2="105" stroke-width="3"/>' +
  '<line x1="122" y1="150" x2="120" y2="105" stroke-width="3"/>' +
  '<circle cx="172" cy="152" r="13" stroke-width="3"/>' +
  '<line x1="159" y1="152" x2="50" y2="152" stroke-width="3"/>' +
  '<line x1="50" y1="152" x2="35" y2="172" stroke-width="3"/>' +
  '<line x1="35" y1="172" x2="32" y2="205" stroke-width="3"/>' +
  '<line x1="35" y1="162" x2="170" y2="162" stroke-width="4"/>' +
  '<line x1="55" y1="162" x2="55" y2="192" stroke-width="3"/>' +
  '<line x1="165" y1="162" x2="165" y2="192" stroke-width="3"/>'
)

const DEADLIFT_VEC = _vec(
  _bar(212, 42, 158) +
  '<rect x="35" y="197" width="8" height="30" rx="3" fill="#D4A84B"/>' +
  '<rect x="157" y="197" width="8" height="30" rx="3" fill="#D4A84B"/>' +
  '<circle cx="100" cy="58" r="13" stroke-width="3"/>' +
  '<line x1="100" y1="71" x2="100" y2="82" stroke-width="3"/>' +
  '<line x1="72" y1="82" x2="128" y2="82" stroke-width="3"/>' +
  '<line x1="72" y1="82" x2="72" y2="212" stroke-width="3"/>' +
  '<line x1="128" y1="82" x2="128" y2="212" stroke-width="3"/>' +
  '<line x1="100" y1="82" x2="100" y2="150" stroke-width="3"/>' +
  '<line x1="80" y1="150" x2="120" y2="150" stroke-width="3"/>' +
  '<line x1="80" y1="150" x2="75" y2="212" stroke-width="3"/>' +
  '<line x1="120" y1="150" x2="125" y2="212" stroke-width="3"/>'
)

const PULLUP_VEC = _vec(
  '<line x1="68" y1="28" x2="132" y2="28" stroke-width="3"/>' +
  '<line x1="68" y1="28" x2="68" y2="50" stroke-width="2"/>' +
  '<line x1="132" y1="28" x2="132" y2="50" stroke-width="2"/>' +
  '<line x1="58" y1="50" x2="142" y2="50" stroke-width="6"/>' +
  '<circle cx="100" cy="68" r="13" stroke-width="3"/>' +
  '<line x1="78" y1="50" x2="86" y2="80" stroke-width="3"/>' +
  '<line x1="122" y1="50" x2="114" y2="80" stroke-width="3"/>' +
  '<line x1="82" y1="80" x2="118" y2="80" stroke-width="3"/>' +
  '<line x1="100" y1="80" x2="100" y2="152" stroke-width="3"/>' +
  '<line x1="82" y1="152" x2="118" y2="152" stroke-width="3"/>' +
  '<line x1="82" y1="152" x2="75" y2="208" stroke-width="3"/>' +
  '<line x1="118" y1="152" x2="125" y2="208" stroke-width="3"/>' +
  '<line x1="63" y1="208" x2="87" y2="208" stroke-width="3"/>' +
  '<line x1="113" y1="208" x2="137" y2="208" stroke-width="3"/>'
)

const PRESS_VEC = _vec(
  _bar(52) +
  '<circle cx="100" cy="80" r="13" stroke-width="3"/>' +
  '<line x1="100" y1="93" x2="100" y2="158" stroke-width="3"/>' +
  '<line x1="74" y1="100" x2="126" y2="100" stroke-width="3"/>' +
  '<line x1="74" y1="100" x2="64" y2="52" stroke-width="3"/>' +
  '<line x1="126" y1="100" x2="136" y2="52" stroke-width="3"/>' +
  '<line x1="80" y1="158" x2="120" y2="158" stroke-width="3"/>' +
  '<line x1="80" y1="158" x2="75" y2="215" stroke-width="3"/>' +
  '<line x1="120" y1="158" x2="125" y2="215" stroke-width="3"/>' +
  '<line x1="62" y1="215" x2="88" y2="215" stroke-width="3"/>' +
  '<line x1="112" y1="215" x2="138" y2="215" stroke-width="3"/>'
)

const ROW_VEC = _vec(
  _bar(152, 42, 148) +
  '<circle cx="55" cy="92" r="13" stroke-width="3"/>' +
  '<line x1="65" y1="103" x2="118" y2="158" stroke-width="3"/>' +
  '<line x1="88" y1="125" x2="72" y2="152" stroke-width="3"/>' +
  '<line x1="72" y1="152" x2="55" y2="152" stroke-width="3"/>' +
  '<line x1="88" y1="125" x2="105" y2="145" stroke-width="3"/>' +
  '<line x1="118" y1="158" x2="98" y2="215" stroke-width="3"/>' +
  '<line x1="118" y1="158" x2="140" y2="215" stroke-width="3"/>' +
  '<line x1="86" y1="215" x2="110" y2="215" stroke-width="3"/>' +
  '<line x1="128" y1="215" x2="153" y2="215" stroke-width="3"/>'
)

const RUN_VEC = _vec(
  '<circle cx="112" cy="50" r="13" stroke-width="3"/>' +
  '<line x1="108" y1="63" x2="100" y2="132" stroke-width="3"/>' +
  '<line x1="96" y1="84" x2="72" y2="100" stroke-width="3"/>' +
  '<line x1="72" y1="100" x2="65" y2="78" stroke-width="3"/>' +
  '<line x1="114" y1="82" x2="138" y2="100" stroke-width="3"/>' +
  '<line x1="138" y1="100" x2="148" y2="122" stroke-width="3"/>' +
  '<line x1="95" y1="132" x2="78" y2="168" stroke-width="3"/>' +
  '<line x1="78" y1="168" x2="72" y2="210" stroke-width="3"/>' +
  '<line x1="60" y1="210" x2="84" y2="210" stroke-width="3"/>' +
  '<line x1="105" y1="135" x2="128" y2="178" stroke-width="3"/>' +
  '<line x1="128" y1="178" x2="148" y2="208" stroke-width="3"/>'
)

const CURL_VEC = _vec(
  _stand() +
  '<line x1="72" y1="78" x2="72" y2="145" stroke-width="3"/>' +
  '<line x1="128" y1="78" x2="128" y2="118" stroke-width="3"/>' +
  '<line x1="128" y1="118" x2="100" y2="118" stroke-width="3"/>' +
  '<line x1="90" y1="113" x2="90" y2="123" stroke-width="3"/>' +
  '<line x1="90" y1="118" x2="105" y2="118" stroke-width="5"/>' +
  '<line x1="105" y1="113" x2="105" y2="123" stroke-width="3"/>' +
  '<line x1="62" y1="140" x2="82" y2="140" stroke-width="5"/>' +
  '<line x1="62" y1="135" x2="62" y2="145" stroke-width="3"/>' +
  '<line x1="82" y1="135" x2="82" y2="145" stroke-width="3"/>'
)

const DEFAULT_VEC = _vec(
  _stand() +
  '<line x1="72" y1="78" x2="72" y2="145" stroke-width="3"/>' +
  '<line x1="128" y1="78" x2="128" y2="145" stroke-width="3"/>' +
  '<line x1="60" y1="140" x2="84" y2="140" stroke-width="5"/>' +
  '<line x1="60" y1="134" x2="60" y2="146" stroke-width="3"/>' +
  '<line x1="84" y1="134" x2="84" y2="146" stroke-width="3"/>' +
  '<line x1="116" y1="140" x2="140" y2="140" stroke-width="5"/>' +
  '<line x1="116" y1="134" x2="116" y2="146" stroke-width="3"/>' +
  '<line x1="140" y1="134" x2="140" y2="146" stroke-width="3"/>'
)

const exerciseVector = (name: string): { url: string; text: string; by: string } => {
  const n = name.toLowerCase()
  if (n.includes('squat'))                           return { url: SQUAT_VEC,   text: 'squat',           by: '' }
  if (n.includes('bench'))                           return { url: BENCH_VEC,   text: 'bench press',     by: '' }
  if (n.includes('deadlift'))                        return { url: DEADLIFT_VEC,text: 'deadlift',        by: '' }
  if (n.includes('pull') || n.includes('chin'))      return { url: PULLUP_VEC,  text: 'pull-up',         by: '' }
  if (n.includes('press') || n.includes('shoulder')) return { url: PRESS_VEC,   text: 'shoulder press',  by: '' }
  if (n.includes('row'))                             return { url: ROW_VEC,     text: 'bent-over row',   by: '' }
  if (n.includes('run') || n.includes('sprint'))     return { url: RUN_VEC,     text: 'run',             by: '' }
  if (n.includes('curl'))                            return { url: CURL_VEC,    text: 'bicep curl',      by: '' }
  return { url: DEFAULT_VEC,                                                    text: 'strength',        by: '' }
}

// ── Design tokens ────────────────────────────────────────
const CARD   = '#1C1410'
const ELEV   = '#221A12'
const BORDER = 'rgba(255,255,255,0.07)'
const TEXT   = '#F0E4C8'
const MUTED  = 'rgba(240,228,200,0.45)'
const GOLD   = '#D4A84B'
const AZURE  = '#5B8FA8'
const SAGE   = '#7BAE8A'

const PROGRESS_BG = 'radial-gradient(130% 100% at 100% 0%, #6B4423 0%, #2E1B0E 75%)'

function PRCard({ pr }: { pr: PersonalRecord }) {
  const img = exerciseVector(pr.exercise_name)
  const isWeighted = pr.weight > 0
  return (
    <div style={{
      width: '100%', height: '100%', borderRadius: 20, overflow: 'hidden', position: 'relative',
      background: CARD, border: `1px solid ${BORDER}`, boxShadow: '0 12px 32px rgba(0,0,0,0.4)',
    }}>
      <img src={img.url} alt={img.text} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.85) 100%)' }} />
      <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', padding: '10px 16px 14px' }}>
        <p style={{ fontSize: 15, fontWeight: 800, color: TEXT, textTransform: 'capitalize' }}>{pr.exercise_name}</p>
        <p style={{ fontSize: 12, fontWeight: 700, color: GOLD, marginTop: 2 }}>
          {isWeighted ? `${pr.weight} kg × ${pr.reps} reps` : `${pr.reps} reps · bodyweight`}
        </p>
        <p style={{ fontSize: 11, color: MUTED, marginTop: 2 }}>
          {new Date(pr.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
        </p>
      </div>
    </div>
  )
}

function ProgressAuthGate({ onSignIn }: { onSignIn: () => void }) {
  return (
    <div style={{ minHeight: '100%', background: PROGRESS_BG, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', textAlign: 'center' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(70% 50% at 90% 0%, rgba(255,200,140,0.18), transparent 60%)', pointerEvents: 'none' }} />
      <span className="ms" style={{ fontSize: 52, color: 'rgba(212,168,75,0.3)', display: 'block', marginBottom: 20 }}>trending_up</span>
      <h2 style={{ fontSize: 24, fontWeight: 800, color: '#F0E4C8', letterSpacing: '-0.5px', marginBottom: 10 }}>Your Records</h2>
      <p style={{ fontSize: 14, color: 'rgba(240,228,200,0.5)', lineHeight: 1.7, marginBottom: 32, maxWidth: 280 }}>
        Sign in to track your weight, view progress charts, and build your personal records.
      </p>
      <button onClick={onSignIn} style={{ padding: '16px 40px', borderRadius: 18, background: '#D4A84B', color: '#120D08', fontSize: 15, fontWeight: 800, cursor: 'pointer', border: 'none', boxShadow: '0 4px 20px rgba(212,168,75,0.3)' }}>
        Sign In to Track Progress
      </button>
    </div>
  )
}

export default function ProgressScreen() {
  const { weightLog, logWeight, startDate, plan, prs, user, setShowAuthModal, isDemo } = useStore()
  const [weightInput, setWeightInput] = useState('')
  const [showLogModal, setShowLogModal] = useState(false)

  const weekNum = startDate
    ? Math.max(1, Math.ceil((Date.now() - new Date(startDate).getTime()) / (7 * 86400000)))
    : 1
  const currentSection =
    weekNum >= 12 ? 4 : weekNum >= 8 ? 3 : weekNum >= 5 ? 2 : weekNum >= 3 ? 1 : 0

  const [openSection, setOpenSection] = useState(currentSection)

  const handleLog = async () => {
    const val = parseFloat(weightInput)
    if (isNaN(val) || val < 40 || val > 200) return
    await logWeight(val)
    setWeightInput('')
    setShowLogModal(false)
  }


  // Auth gate — must come after all hooks
  if (!user && !isDemo) return <ProgressAuthGate onSignIn={() => setShowAuthModal(true)} />

  const last = weightLog[weightLog.length - 1]?.weight

  return (
    <div style={{ background: 'linear-gradient(180deg, #2A1608 0%, #180B04 25%, #120D08 55%, #0E0A06 100%)', minHeight: '100%', paddingBottom: 96 }}>

      {/* ── Header ──────────────────────────────────────── */}
      <div style={{ padding: 'max(env(safe-area-inset-top, 0px), 24px) 20px 20px' }}>
        <h1 style={{ fontSize: 40, fontWeight: 800, color: TEXT, letterSpacing: '-1.5px', lineHeight: 1, fontFamily: '-apple-system, BlinkMacSystemFont, system-ui', marginBottom: 4 }}>
          Progress.
        </h1>
        <p style={{ fontSize: 13, color: MUTED }}>Records · weight · milestones</p>
      </div>

      {/* ── Personal Records — 3D drag carousel ─────────── */}
      {(() => {
        const allPRs = Object.values(prs)
        if (allPRs.length === 0) return null
        const sorted = [...allPRs].sort((a, b) => b.date.localeCompare(a.date))
        return (
          <div style={{ margin: '0 0 14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 16px', marginBottom: 8 }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: MUTED, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Personal Records</p>
              <span style={{ fontSize: 11, color: MUTED }}>{allPRs.length} tracked · drag to explore</span>
            </div>
            <Carousel3D slides={sorted.map(pr => <PRCard key={pr.exercise_name} pr={pr} />)} />
          </div>
        )
      })()}

      {/* ── Weight chart ────────────────────────────────── */}
      <WeightTrendChart
        weightLog={weightLog}
        targetLabel={plan?.weightTarget}
        onLogClick={() => setShowLogModal(true)}
      />

      {/* ── 12-Week Timeline — accordion ─────────────────── */}
      <div style={{ margin: '0 16px 14px', background: CARD, borderRadius: 20, border: `1px solid ${BORDER}`, overflow: 'hidden' }}>
        <p style={{ fontSize: 10, fontWeight: 700, color: MUTED, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '16px 18px 12px' }}>
          12-Week Timeline
        </p>

        {TIMELINE.map((item: any, i: number) => {
          const isPast    = i < currentSection
          const isCurrent = i === currentSection
          const isOpen    = openSection === i
          return (
            <div key={i} style={{ borderTop: `1px solid ${BORDER}` }}>
              <button
                onClick={() => setOpenSection(isOpen ? -1 : i)}
                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 14, padding: '13px 18px', cursor: 'pointer', background: 'none', border: 'none', textAlign: 'left' }}
              >
                <div style={{
                  width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 10, fontWeight: 800,
                  background: isCurrent ? 'rgba(212,168,75,0.12)' : isPast ? ELEV : 'transparent',
                  border: `2px solid ${isCurrent ? GOLD : isPast ? 'rgba(255,255,255,0.15)' : BORDER}`,
                  color: isCurrent ? GOLD : MUTED,
                }}>
                  {isPast ? '✓' : item.wk}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: isCurrent ? GOLD : MUTED }}>Week {item.wk}</p>
                  <p style={{ fontSize: 13, fontWeight: 700, color: isCurrent ? TEXT : isPast ? MUTED : 'rgba(240,228,200,0.35)', marginTop: 1 }}>{item.label}</p>
                </div>
                {isCurrent && <span style={{ fontSize: 9, fontWeight: 700, color: GOLD, background: 'rgba(212,168,75,0.1)', border: '1px solid rgba(212,168,75,0.25)', padding: '3px 8px', borderRadius: 20, flexShrink: 0 }}>Now</span>}
                <span className="ms ms-sm" style={{ fontSize: 16, color: MUTED, transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>expand_more</span>
              </button>

              {isOpen && (
                <div style={{ padding: '0 18px 16px 60px' }}>
                  {isCurrent && (
                    <p style={{ fontSize: 11, fontWeight: 700, color: GOLD, marginBottom: 10 }}>You are here — Week {weekNum}</p>
                  )}
                  <p style={{ fontSize: 12, color: MUTED, lineHeight: 1.6, marginBottom: 6 }}>🫀 {item.inside}</p>
                  <p style={{ fontSize: 12, color: MUTED, lineHeight: 1.6, opacity: 0.75 }}>👁 {item.outside}</p>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* ── Log weight modal ─────────────────────────────── */}
      {showLogModal && (
        <div
          onClick={e => { if (e.target === e.currentTarget) setShowLogModal(false) }}
          style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)', padding: '0 24px' }}
        >
          <div style={{ width: '100%', maxWidth: 320, background: CARD, borderRadius: 24, padding: '28px 24px', border: `1px solid ${BORDER}`, boxShadow: '0 24px 64px rgba(0,0,0,0.6)' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div>
                <p style={{ fontSize: 17, fontWeight: 800, color: TEXT }}>Log Weight</p>
                {last !== undefined && (
                  <p style={{ fontSize: 12, color: MUTED, marginTop: 3 }}>Last: {last} kg</p>
                )}
              </div>
              <button onClick={() => setShowLogModal(false)} style={{ width: 32, height: 32, borderRadius: 10, background: ELEV, border: `1px solid ${BORDER}`, color: MUTED, fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
            </div>

            {/* Input */}
            <div style={{ position: 'relative', marginBottom: 16 }}>
              <input
                autoFocus
                type="number"
                inputMode="decimal"
                placeholder={last ? `${last}` : '78.5'}
                step="0.1"
                value={weightInput}
                onChange={e => setWeightInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLog()}
                style={{ width: '100%', background: ELEV, border: `1px solid ${BORDER}`, borderRadius: 16, padding: '16px 52px 16px 18px', fontSize: 28, fontWeight: 800, color: TEXT, outline: 'none', letterSpacing: '-0.5px' }}
              />
              <span style={{ position: 'absolute', right: 18, top: '50%', transform: 'translateY(-50%)', fontSize: 14, fontWeight: 700, color: MUTED }}>kg</span>
            </div>

            {plan?.weightTarget && (
              <p style={{ fontSize: 11, color: MUTED, textAlign: 'center', marginBottom: 16 }}>Target: {plan.weightTarget}</p>
            )}

            <button
              onClick={handleLog}
              style={{ width: '100%', background: GOLD, color: '#120D08', fontWeight: 800, fontSize: 15, padding: '16px 0', borderRadius: 16, border: 'none', cursor: 'pointer', boxShadow: '0 4px 16px rgba(212,168,75,0.3)' }}
            >
              Save
            </button>
          </div>
        </div>
      )}

    </div>
  )
}
