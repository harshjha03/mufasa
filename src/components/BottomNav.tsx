interface Props {
  active: string
  onChange: (screen: string) => void
}

const NAV_ITEMS = [
  { id: 'today', icon: 'home', label: 'Today' },
  { id: 'workout', icon: 'fitness_center', label: 'Workout' },
  { id: 'nutrition', icon: 'restaurant', label: 'Nutrition' },
  { id: 'progress', icon: 'trending_up', label: 'Progress' },
  { id: 'expenses', icon: 'account_balance_wallet', label: 'Expenses' },
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
          <span className={`ms ms-sm ${active === id ? 'text-gold-dark ms-fill' : 'text-ink'}`}>{icon}</span>
          <span className={`text-[9px] font-semibold tracking-wide truncate w-full text-center ${active === id ? 'text-gold-dark' : 'text-ink/40'}`}>{label}</span>
        </button>
      ))}
    </nav>
  )
}
