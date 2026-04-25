interface Props {
  active: string
  onChange: (screen: string) => void
}

const NAV_ITEMS = [
  { id: 'today', icon: '🏠', label: 'Today' },
  { id: 'workout', icon: '🏋️', label: 'Workout' },
  { id: 'nutrition', icon: '🥗', label: 'Nutrition' },
  { id: 'progress', icon: '📈', label: 'Progress' },
  { id: 'expenses', icon: '💰', label: 'Expenses' },
  { id: 'profile', icon: '👤', label: 'Profile' },
]

export default function BottomNav({ active, onChange }: Props) {
  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] h-16 bg-white border-t border-cream-3 flex items-center justify-around px-2 z-50">
      {NAV_ITEMS.map(({ id, icon, label }) => (
        <button
          key={id}
          onClick={() => onChange(id)}
          className={`flex flex-col items-center gap-0.5 px-1 py-2 rounded-xl flex-1 min-w-0 transition-all ${active === id ? '' : 'opacity-40'}`}
        >
          <span className={`text-lg transition-transform ${active === id ? 'scale-110' : ''}`}>{icon}</span>
          <span className={`text-[9px] font-semibold tracking-wide truncate w-full text-center ${active === id ? 'text-teal' : 'text-ink/40'}`}>{label}</span>
        </button>
      ))}
    </nav>
  )
}
