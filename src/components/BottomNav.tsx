// Design tokens
const ACCENT = '#E4B26A'   // immersiveBronze accent
const IDLE   = 'rgba(255,255,255,0.5)'

interface Props {
  active: string
  onChange: (screen: string) => void
}

const NAV_ITEMS = [
  { id: 'today',     icon: 'home',                  label: 'Today'     },
  { id: 'workout',   icon: 'fitness_center',         label: 'Workout'   },
  { id: 'nutrition', icon: 'restaurant',             label: 'Nutrition' },
  { id: 'progress',  icon: 'trending_up',            label: 'Progress'  },
  { id: 'expenses',  icon: 'account_balance_wallet', label: 'Expenses'  },
]

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
              cursor: 'pointer',
              transition: 'background 0.2s',
              border: 'none',
              outline: 'none',
            }}
          >
            <span
              className={`ms ms-sm ${isActive ? 'ms-fill' : ''}`}
              style={{
                fontSize: 22,
                color: isActive ? '#1B1714' : IDLE,
                transition: 'color 0.2s',
              }}
            >
              {icon}
            </span>
          </button>
        )
      })}
    </nav>
  )
}
