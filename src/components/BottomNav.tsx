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
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] h-16 bg-white border-t-2 border-cream-3 flex items-center justify-around px-2 z-50"
      style={{boxShadow: '0 -4px 20px rgba(42,31,20,0.08)'}}>
      {NAV_ITEMS.map(({ id, icon, label }) => (
        <button
          key={id}
          onClick={() => onChange(id)}
          className="flex flex-col items-center gap-0.5 px-1 py-2 rounded-xl flex-1 min-w-0 transition-all relative"
        >
          {active === id && (
            <div className="absolute top-1 left-1/2 -translate-x-1/2 w-8 h-8 rounded-xl bg-gold-pale" />
          )}
          <span className={`ms ms-sm relative z-10 ${active === id ? 'text-gold-dark ms-fill' : 'text-ink/50'}`}
            style={{fontSize: active === id ? 22 : 20}}>
            {icon}
          </span>
          <span className={`text-[9px] font-bold tracking-wide truncate w-full text-center relative z-10 ${active === id ? 'text-gold-dark' : 'text-ink/40'}`}>
            {label}
          </span>
        </button>
      ))}
    </nav>
  )
}
