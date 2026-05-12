const BORDER = 'rgba(255,255,255,0.07)'
const TEXT   = '#F0E4C8'
const MUTED  = 'rgba(240,228,200,0.38)'
const GOLD   = '#D4A84B'

interface Props {
  active: string
  onChange: (screen: string) => void
}

const NAV_ITEMS = [
  { id: 'today',     icon: 'home',                 label: 'Today'     },
  { id: 'workout',   icon: 'fitness_center',        label: 'Workout'   },
  { id: 'nutrition', icon: 'restaurant',            label: 'Nutrition' },
  { id: 'progress',  icon: 'trending_up',           label: 'Progress'  },
  { id: 'expenses',  icon: 'account_balance_wallet', label: 'Expenses'  },
]

export default function BottomNav({ active, onChange }: Props) {
  return (
    <nav style={{
      position: 'fixed',
      bottom: 0,
      left: '50%',
      transform: 'translateX(-50%)',
      width: 'calc(100% - 16px)',
      maxWidth: 480,
      margin: '0 8px',
      marginBottom: 'max(env(safe-area-inset-bottom, 6px), 6px)',
      height: 62,
      background: 'rgba(24,17,9,0.92)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderRadius: 18,
      border: `1px solid ${BORDER}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-around',
      padding: '0 4px',
      zIndex: 50,
      boxShadow: '0 8px 40px rgba(0,0,0,0.6), 0 0 0 0.5px rgba(255,255,255,0.04)',
    }}>
      {NAV_ITEMS.map(({ id, icon, label }) => {
        const isActive = active === id
        return (
          <button
            key={id}
            onClick={() => onChange(id)}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
              padding: '8px 6px', borderRadius: 14, flex: 1,
              cursor: 'pointer', position: 'relative',
              transition: 'all 0.2s',
              background: isActive ? 'rgba(212,168,75,0.1)' : 'transparent',
            }}
          >
            {/* Active dot indicator */}
            {isActive && (
              <div style={{
                position: 'absolute',
                top: 6,
                left: '50%',
                transform: 'translateX(-50%)',
                width: 32,
                height: 32,
                borderRadius: 10,
                background: 'rgba(212,168,75,0.1)',
              }} />
            )}

            <span
              className={`ms ms-sm ${isActive ? 'ms-fill' : ''}`}
              style={{
                fontSize: isActive ? 22 : 20,
                color: isActive ? GOLD : MUTED,
                position: 'relative', zIndex: 1,
                transition: 'all 0.2s',
              }}
            >
              {icon}
            </span>

            <span style={{
              fontSize: 9, fontWeight: 700, letterSpacing: '0.03em',
              color: isActive ? GOLD : MUTED,
              position: 'relative', zIndex: 1,
              transition: 'all 0.2s',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              maxWidth: '100%',
              fontFamily: '-apple-system, BlinkMacSystemFont, system-ui',
            }}>
              {label}
            </span>
          </button>
        )
      })}
    </nav>
  )
}
