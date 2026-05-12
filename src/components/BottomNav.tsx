const ACCENT = '#E4B26A'
const IDLE   = 'rgba(255,255,255,0.5)'

interface Props {
  active: string
  onChange: (screen: string) => void
}

const NAV_ITEMS = [
  { id: 'today',     icon: 'home'                  },
  { id: 'workout',   icon: 'fitness_center'         },
  { id: 'nutrition', icon: 'restaurant'             },
  { id: 'progress',  icon: 'trending_up'            },
  { id: 'expenses',  icon: 'account_balance_wallet' },
]

export default function BottomNav({ active, onChange }: Props) {
  return (
    <nav style={{
      position: 'fixed',
      bottom: 'max(env(safe-area-inset-bottom, 0px) + 12px, 12px)',
      left: '50%',
      transform: 'translateX(-50%)',
      width: 'calc(100% - 32px)',
      maxWidth: 448,
      height: 62,
      background: 'rgba(18, 12, 6, 0.55)',
      backdropFilter: 'blur(28px) saturate(180%)',
      WebkitBackdropFilter: 'blur(28px) saturate(180%)',
      borderRadius: 22,
      border: '1px solid rgba(255,255,255,0.1)',
      display: 'grid',
      gridTemplateColumns: 'repeat(5, 1fr)',
      alignItems: 'center',
      padding: '0 6px',
      zIndex: 50,
      boxShadow: '0 8px 32px rgba(0,0,0,0.6), 0 2px 8px rgba(0,0,0,0.4), 0 0 0 0.5px rgba(255,255,255,0.06)',
    }}>
      {NAV_ITEMS.map(({ id, icon }) => {
        const isActive = active === id
        return (
          <button
            key={id}
            onClick={() => onChange(id)}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              height: 48, margin: '0 3px', borderRadius: 14,
              background: isActive ? ACCENT : 'transparent',
              cursor: 'pointer', transition: 'background 0.2s',
              border: 'none', outline: 'none',
            }}
          >
            <span
              className={`ms ms-sm ${isActive ? 'ms-fill' : ''}`}
              style={{ fontSize: 22, color: isActive ? '#1B1714' : IDLE, transition: 'color 0.2s' }}
            >
              {icon}
            </span>
          </button>
        )
      })}
    </nav>
  )
}
