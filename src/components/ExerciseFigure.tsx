interface Props {
  anim: string
  color?: string
  size?: number
}

const ANIMS: Record<string, string> = {
  press:  'pressUp 1.6s ease-in-out infinite',
  pull:   'pullDown 1.6s ease-in-out infinite',
  squat:  'squatAnim 2s ease-in-out infinite',
  curl:   'curlAnim 1.5s ease-in-out infinite',
  raise:  'lateralRaise 1.8s ease-in-out infinite',
  hinge:  'hingeAnim 2s ease-in-out infinite',
  rotate: 'rotateAnim 3s linear infinite',
  run:    'runAnim .6s ease-in-out infinite',
  plank:  'plankBreath 2.5s ease-in-out infinite',
  row:    'rowPull 1.5s ease-in-out infinite',
}

const ORIGINS: Record<string, string> = {
  press: '50% 60%', pull: '50% 10%', squat: '50% 60%',
  curl: '70% 55%', raise: '50% 45%', hinge: '50% 45%',
  rotate: '50% 45%', run: '50% 50%', plank: '50% 50%', row: '50% 45%',
}

export default function ExerciseFigure({ anim, color = '#0A9396', size = 44 }: Props) {
  const c = color
  const a = ANIMS[anim] || ANIMS.squat
  const o = ORIGINS[anim] || '50% 50%'
  const gStyle = { animation: a, transformOrigin: o, transformBox: 'fill-box' as const }

  const shapes: Record<string, JSX.Element> = {
    press: (
      <g style={gStyle}>
        <circle cx="22" cy="10" r="4" fill={c} />
        <line x1="22" y1="14" x2="22" y2="26" stroke={c} strokeWidth="2.5" strokeLinecap="round" />
        <line x1="9" y1="20" x2="35" y2="20" stroke={c} strokeWidth="3" strokeLinecap="round" />
        <circle cx="8" cy="20" r="3" fill="#CBD5E0" />
        <circle cx="36" cy="20" r="3" fill="#CBD5E0" />
        <line x1="22" y1="26" x2="14" y2="38" stroke={c} strokeWidth="2.5" strokeLinecap="round" />
        <line x1="22" y1="26" x2="30" y2="38" stroke={c} strokeWidth="2.5" strokeLinecap="round" />
      </g>
    ),
    pull: (
      <>
        <rect x="10" y="3" width="24" height="4" rx="2" fill="#CBD5E0" />
        <g style={gStyle}>
          <circle cx="22" cy="16" r="4" fill={c} />
          <line x1="22" y1="5" x2="22" y2="20" stroke={c} strokeWidth="2.5" strokeLinecap="round" />
          <line x1="22" y1="20" x2="22" y2="30" stroke={c} strokeWidth="2.5" strokeLinecap="round" />
          <line x1="13" y1="22" x2="22" y2="20" stroke={c} strokeWidth="2.5" strokeLinecap="round" />
          <line x1="31" y1="22" x2="22" y2="20" stroke={c} strokeWidth="2.5" strokeLinecap="round" />
          <line x1="22" y1="30" x2="15" y2="42" stroke={c} strokeWidth="2.5" strokeLinecap="round" />
          <line x1="22" y1="30" x2="29" y2="42" stroke={c} strokeWidth="2.5" strokeLinecap="round" />
        </g>
      </>
    ),
    squat: (
      <g style={gStyle}>
        <circle cx="22" cy="8" r="4" fill={c} />
        <line x1="22" y1="12" x2="22" y2="24" stroke={c} strokeWidth="2.5" strokeLinecap="round" />
        <line x1="13" y1="18" x2="31" y2="18" stroke={c} strokeWidth="2.5" strokeLinecap="round" />
        <line x1="22" y1="24" x2="12" y2="36" stroke={c} strokeWidth="2.5" strokeLinecap="round" />
        <line x1="22" y1="24" x2="32" y2="36" stroke={c} strokeWidth="2.5" strokeLinecap="round" />
        <line x1="12" y1="36" x2="8" y2="43" stroke={c} strokeWidth="2.5" strokeLinecap="round" />
        <line x1="32" y1="36" x2="36" y2="43" stroke={c} strokeWidth="2.5" strokeLinecap="round" />
      </g>
    ),
    curl: (
      <>
        <circle cx="22" cy="8" r="4" fill={c} />
        <line x1="22" y1="12" x2="22" y2="26" stroke={c} strokeWidth="2.5" strokeLinecap="round" />
        <line x1="22" y1="26" x2="30" y2="38" stroke={c} strokeWidth="2.5" strokeLinecap="round" />
        <g style={gStyle}>
          <line x1="22" y1="26" x2="13" y2="26" stroke={c} strokeWidth="2.5" strokeLinecap="round" />
          <line x1="13" y1="26" x2="6" y2="18" stroke={c} strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="5" cy="17" r="3" fill="#CBD5E0" />
        </g>
      </>
    ),
    raise: (
      <>
        <circle cx="22" cy="8" r="4" fill={c} />
        <line x1="22" y1="12" x2="22" y2="26" stroke={c} strokeWidth="2.5" strokeLinecap="round" />
        <line x1="22" y1="26" x2="15" y2="40" stroke={c} strokeWidth="2.5" strokeLinecap="round" />
        <line x1="22" y1="26" x2="29" y2="40" stroke={c} strokeWidth="2.5" strokeLinecap="round" />
        <g style={gStyle}>
          <line x1="8" y1="20" x2="36" y2="20" stroke={c} strokeWidth="3" strokeLinecap="round" />
          <circle cx="7" cy="20" r="3" fill="#CBD5E0" />
          <circle cx="37" cy="20" r="3" fill="#CBD5E0" />
        </g>
      </>
    ),
    hinge: (
      <g style={gStyle}>
        <circle cx="22" cy="8" r="4" fill={c} />
        <line x1="22" y1="12" x2="22" y2="26" stroke={c} strokeWidth="2.5" strokeLinecap="round" />
        <line x1="12" y1="18" x2="32" y2="18" stroke={c} strokeWidth="2.5" strokeLinecap="round" />
        <line x1="22" y1="26" x2="16" y2="40" stroke={c} strokeWidth="2.5" strokeLinecap="round" />
        <line x1="22" y1="26" x2="28" y2="40" stroke={c} strokeWidth="2.5" strokeLinecap="round" />
        <line x1="6" y1="30" x2="38" y2="30" stroke="#CBD5E0" strokeWidth="2" strokeLinecap="round" />
      </g>
    ),
    rotate: (
      <>
        <circle cx="22" cy="8" r="4" fill={c} />
        <line x1="22" y1="12" x2="22" y2="26" stroke={c} strokeWidth="2.5" strokeLinecap="round" />
        <line x1="22" y1="26" x2="15" y2="40" stroke={c} strokeWidth="2.5" strokeLinecap="round" />
        <line x1="22" y1="26" x2="29" y2="40" stroke={c} strokeWidth="2.5" strokeLinecap="round" />
        <g style={gStyle}>
          <line x1="8" y1="20" x2="36" y2="20" stroke={c} strokeWidth="2.5" strokeLinecap="round" />
        </g>
      </>
    ),
    run: (
      <g style={gStyle}>
        <circle cx="24" cy="7" r="4" fill={c} />
        <line x1="24" y1="11" x2="20" y2="22" stroke={c} strokeWidth="2.5" strokeLinecap="round" />
        <line x1="20" y1="22" x2="10" y2="30" stroke={c} strokeWidth="2.5" strokeLinecap="round" />
        <line x1="20" y1="22" x2="30" y2="34" stroke={c} strokeWidth="2.5" strokeLinecap="round" />
        <line x1="17" y1="15" x2="8" y2="24" stroke={c} strokeWidth="2.5" strokeLinecap="round" />
        <line x1="23" y1="14" x2="34" y2="20" stroke={c} strokeWidth="2.5" strokeLinecap="round" />
      </g>
    ),
    plank: (
      <g style={gStyle}>
        <circle cx="36" cy="16" r="4" fill={c} />
        <line x1="36" y1="20" x2="8" y2="24" stroke={c} strokeWidth="2.5" strokeLinecap="round" />
        <line x1="8" y1="24" x2="4" y2="32" stroke={c} strokeWidth="2.5" strokeLinecap="round" />
        <line x1="8" y1="24" x2="6" y2="30" stroke={c} strokeWidth="2.5" strokeLinecap="round" />
        <line x1="28" y1="28" x2="24" y2="36" stroke={c} strokeWidth="2.5" strokeLinecap="round" />
        <line x1="32" y1="27" x2="30" y2="35" stroke={c} strokeWidth="2.5" strokeLinecap="round" />
      </g>
    ),
    row: (
      <g style={gStyle}>
        <circle cx="28" cy="8" r="4" fill={c} />
        <line x1="28" y1="12" x2="26" y2="24" stroke={c} strokeWidth="2.5" strokeLinecap="round" />
        <line x1="26" y1="24" x2="16" y2="34" stroke={c} strokeWidth="2.5" strokeLinecap="round" />
        <line x1="26" y1="24" x2="34" y2="36" stroke={c} strokeWidth="2.5" strokeLinecap="round" />
        <line x1="22" y1="18" x2="26" y2="24" stroke={c} strokeWidth="2.5" strokeLinecap="round" />
        <line x1="8" y1="18" x2="22" y2="18" stroke={c} strokeWidth="3" strokeLinecap="round" />
        <circle cx="6" cy="18" r="3" fill="#CBD5E0" />
      </g>
    ),
  }

  return (
    <svg width={size} height={size} viewBox="0 0 44 44" style={{ display: 'block' }}>
      <style>{`
        @keyframes pressUp { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        @keyframes pullDown { 0%,100%{transform:translateY(0)} 50%{transform:translateY(8px)} }
        @keyframes squatAnim { 0%,100%{transform:scaleY(1)} 50%{transform:scaleY(.78)} }
        @keyframes curlAnim { 0%,100%{transform:rotate(0deg)} 50%{transform:rotate(-45deg)} }
        @keyframes lateralRaise { 0%,100%{transform:rotate(0deg)} 50%{transform:rotate(-40deg)} }
        @keyframes hingeAnim { 0%,100%{transform:rotate(0deg)} 50%{transform:rotate(35deg)} }
        @keyframes rotateAnim { 0%{transform:rotate(0deg)} 100%{transform:rotate(360deg)} }
        @keyframes runAnim { 0%,100%{transform:translateX(0)} 50%{transform:translateX(5px)} }
        @keyframes plankBreath { 0%,100%{opacity:1} 50%{opacity:.55} }
        @keyframes rowPull { 0%,100%{transform:translateX(0)} 50%{transform:translateX(-10px)} }
      `}</style>
      {shapes[anim] || shapes.squat}
    </svg>
  )
}
