// Design tokens
const ACCENT = '#E4B26A'   // immersiveBronze accent
const IDLE   = 'rgba(255,255,255,0.5)'

interface Props {
  active: string
  onChange: (screen: string) => void
}

// Phosphor-style SVG icons — exactly matching ImmersiveHome.jsx design file
const NavIcon = ({ name, active }: { name: string; active: boolean }) => {
  const color  = active ? '#1B1714' : IDLE
  const filled = active
  const stroke = {
    width: 24, height: 24, viewBox: '0 0 256 256' as const,
    fill: filled ? color : 'none', stroke: color,
    strokeWidth: 16, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const,
  }

  if (name === 'today') return (
    <svg {...stroke}>
      <path d="M40 216V120l88-72 88 72v96a8 8 0 0 1-8 8h-48v-64h-64v64H48a8 8 0 0 1-8-8Z"/>
    </svg>
  )

  if (name === 'workout') return (
    <svg width="24" height="24" viewBox="0 0 256 256" fill={color}>
      <path d="M248 116h-12V92a12 12 0 0 0-12-12h-16a12 12 0 0 0-12 12v24h-12V92a12 12 0 0 0-12-12h-16a12 12 0 0 0-12 12v36H72V92a12 12 0 0 0-12-12H44a12 12 0 0 0-12 12v24H20a8 8 0 0 0 0 16h12v24a12 12 0 0 0 12 12h16a12 12 0 0 0 12-12v-24h72v36a12 12 0 0 0 12 12h16a12 12 0 0 0 12-12v-24h12v24a12 12 0 0 0 12 12h16a12 12 0 0 0 12-12v-36h12a8 8 0 0 0 0-16Z"/>
    </svg>
  )

  if (name === 'nutrition') return (
    <svg width="24" height="24" viewBox="0 0 256 256" fill={color}>
      <path d="M180 24a36 36 0 0 0-36 36v52a36 36 0 0 0 28 35.13V224a8 8 0 0 0 16 0v-76.87A36 36 0 0 0 216 112V60a36 36 0 0 0-36-36Zm20 88a20 20 0 0 1-12 18.33V64a8 8 0 0 0-16 0v66.33A20 20 0 0 1 160 112V60a20 20 0 0 1 40 0Z"/>
      <path d="M88 24a8 8 0 0 0-8 8v40a16 16 0 0 1-32 0V32a8 8 0 0 0-16 0v40a32 32 0 0 0 24 30.92V224a8 8 0 0 0 16 0V102.92A32 32 0 0 0 96 72V32a8 8 0 0 0-8-8Z"/>
    </svg>
  )

  if (name === 'progress') return (
    <svg {...stroke}>
      <polyline points="224 208 32 208 32 48"/>
      <polyline points="208 80 144 144 112 112 48 176"/>
    </svg>
  )

  if (name === 'expenses') return (
    <svg {...stroke}>
      <path d="M40 64h176a8 8 0 0 1 8 8v40H40Z"/>
      <path d="M40 64v128a8 8 0 0 0 8 8h168a8 8 0 0 0 8-8v-80H40"/>
      <circle cx="180" cy="156" r="12" fill={color} stroke="none"/>
    </svg>
  )

  return null
}

const NAV_ITEMS = ['today', 'workout', 'nutrition', 'progress', 'expenses']

export default function BottomNav({ active, onChange }: Props) {
  return (
    <nav style={{
      position: 'fixed',
      bottom: 0,
      left: '50%',
      transform: 'translateX(-50%)',
      width: 'calc(100% - 32px)',
      maxWidth: 448,
      marginBottom: 'max(env(safe-area-inset-bottom, 10px), 10px)',
      height: 64,
      background: 'rgba(20, 14, 8, 0.78)',
      backdropFilter: 'blur(24px)',
      WebkitBackdropFilter: 'blur(24px)',
      borderRadius: 22,
      border: '1px solid rgba(255,255,255,0.08)',
      display: 'grid',
      gridTemplateColumns: 'repeat(5, 1fr)',
      alignItems: 'center',
      padding: '0 6px',
      zIndex: 50,
      boxShadow: '0 10px 40px rgba(0,0,0,0.55), 0 0 0 0.5px rgba(255,255,255,0.04)',
    }}>
      {NAV_ITEMS.map(id => {
        const isActive = active === id
        return (
          <button
            key={id}
            onClick={() => onChange(id)}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              height: 48, margin: '0 3px', borderRadius: 14,
              background: isActive ? ACCENT : 'transparent',
              cursor: 'pointer',
              transition: 'background 0.2s',
              border: 'none',
              outline: 'none',
            }}
          >
            <NavIcon name={id} active={isActive} />
          </button>
        )
      })}
    </nav>
  )
}
