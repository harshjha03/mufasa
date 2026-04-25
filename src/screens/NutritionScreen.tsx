import { useState, useEffect, useRef } from 'react'
import { useStore } from '../store/useStore'
import { searchFoods } from '../lib/foodDb'
import { searchFoodAI } from '../lib/aiFood'
import type { FoodItem, FoodLog } from '../types'

const MEAL_SLOTS = [
  { id: 'breakfast', label: 'Breakfast', icon: '🌅' },
  { id: 'lunch', label: 'Lunch', icon: '☀️' },
  { id: 'snack', label: 'Snack', icon: '🍎' },
  { id: 'dinner', label: 'Dinner', icon: '🌙' },
  { id: 'night', label: 'Night', icon: '😴' },
] as const

type MealSlot = typeof MEAL_SLOTS[number]['id']

export default function NutritionScreen() {
  const { plan, foodLogs, addFoodLog, deleteFoodLog, loadFoodLogs } = useStore()
  const [tab, setTab] = useState<'plan' | 'log'>('plan')
  const [openMeal, setOpenMeal] = useState<number | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<MealSlot>('breakfast')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<FoodItem[]>([])
  const [aiSearching, setAiSearching] = useState(false)
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [showAddModal, setShowAddModal] = useState(false)
  const searchTimeout = useRef<any>(null)
  const today = new Date().toISOString().split('T')[0]

  useEffect(() => { loadFoodLogs(today) }, [today])

  // Search with debounce — local first, AI fallback
  useEffect(() => {
    if (!searchQuery.trim()) { setSearchResults(searchFoods('')); return }
    clearTimeout(searchTimeout.current)
    searchTimeout.current = setTimeout(async () => {
      const local = searchFoods(searchQuery)
      setSearchResults(local)
      if (local.length < 3) {
        setAiSearching(true)
        const ai = await searchFoodAI(searchQuery)
        setSearchResults([...local, ...ai].slice(0, 8))
        setAiSearching(false)
      }
    }, 500)
  }, [searchQuery])

  const todayLogs = foodLogs.filter(f => f.date === today)
  const totalCal = todayLogs.reduce((s, f) => s + f.calories * (f.quantity || 1), 0)
  const totalP = todayLogs.reduce((s, f) => s + f.protein * (f.quantity || 1), 0)
  const totalC = todayLogs.reduce((s, f) => s + f.carbs * (f.quantity || 1), 0)
  const totalF = todayLogs.reduce((s, f) => s + f.fat * (f.quantity || 1), 0)
  const targetCal = plan?.calories ?? 2000
  const targetP = plan?.protein ?? 150
  const calPct = Math.min(100, (totalCal / targetCal) * 100)
  const pPct = Math.min(100, (totalP / targetP) * 100)

  const handleAddFood = async () => {
    if (!selectedFood) return
    await addFoodLog({
      date: today,
      meal_slot: selectedSlot,
      food_name: selectedFood.name,
      serving_label: selectedFood.serving_label,
      serving_grams: selectedFood.serving_grams * quantity,
      calories: selectedFood.calories * quantity,
      protein: selectedFood.protein * quantity,
      carbs: selectedFood.carbs * quantity,
      fat: selectedFood.fat * quantity,
      quantity,
    })
    setShowAddModal(false)
    setSelectedFood(null)
    setSearchQuery('')
    setQuantity(1)
  }

  const meals = plan?.meals ?? []

  return (
    <div className="pb-24">
      <div className="px-4 pt-12 pb-3">
        <h1 className="font-serif text-3xl font-bold text-ink">Nutrition</h1>
        {/* Tab switcher */}
        <div className="flex gap-1 bg-cream-2 p-1 rounded-xl mt-3">
          {([['plan', '📋 Plan'], ['log', '📝 Log']] as const).map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${tab === id ? 'bg-white text-ink shadow-sm' : 'text-ink/40'}`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── PLAN TAB ── */}
      {tab === 'plan' && (
        <>
          {/* Daily total */}
          <div className="mx-4 mb-3 rounded-card p-5 text-white" style={{ background: 'linear-gradient(135deg, #005F73, #0A9396)' }}>
            <p className="text-xs font-bold tracking-widest opacity-60 uppercase mb-3">Daily Targets — Weekday</p>
            <div className="flex gap-5 flex-wrap">
              {[
                { val: plan?.calories.toLocaleString('en-IN') ?? '—', label: 'Calories' },
                { val: plan ? `${plan.protein}g` : '—', label: 'Protein' },
                { val: plan ? `${plan.carbs}g` : '—', label: 'Carbs' },
                { val: plan ? `${plan.fat}g` : '—', label: 'Fat' },
              ].map(({ val, label }) => (
                <div key={label}><p className="text-2xl font-extrabold leading-none">{val}</p><p className="text-xs opacity-60 mt-1">{label}</p></div>
              ))}
            </div>
          </div>

          {/* Meal cards */}
          {meals.map((m, idx) => (
            <div key={idx} className="bg-white rounded-card shadow-card mx-4 mb-3 overflow-hidden">
              <button className="w-full p-5 text-left flex items-start justify-between" onClick={() => setOpenMeal(openMeal === idx ? null : idx)}>
                <div className="flex-1">
                  <span className="bg-ink-2 text-white text-xs font-bold px-2.5 py-1 rounded-full">{m.time}</span>
                  <p className="text-base font-bold text-ink mt-2">{m.food}</p>
                  <p className="text-xs text-ink/40 mt-1">{m.cal} kcal · {m.p}g P · {m.c}g C · {m.f}g F</p>
                </div>
                <span className={`text-xl text-ink/30 ml-3 transition-transform duration-200 ${openMeal === idx ? 'rotate-180' : ''}`}>⌄</span>
              </button>
              <div className="px-5 pb-4">
                <div className="flex gap-0.5 h-1.5 rounded-full overflow-hidden bg-cream-2">
                  <div className="bg-sage rounded-full" style={{ width: `${m.p * 4 / m.cal * 100}%` }} />
                  <div className="bg-blue-light rounded-full" style={{ width: `${m.c * 4 / m.cal * 100}%` }} />
                  <div className="bg-gold rounded-full" style={{ width: `${m.f * 9 / m.cal * 100}%` }} />
                </div>
                <div className="flex gap-2 mt-2 flex-wrap">
                  {[{ l: `P ${m.p}g`, bg: 'bg-sage-pale', t: 'text-sage' }, { l: `C ${m.c}g`, bg: 'bg-blue/10', t: 'text-blue' }, { l: `F ${m.f}g`, bg: 'bg-gold-pale', t: 'text-gold' }].map(({ l, bg, t }) => (
                    <span key={l} className={`${bg} ${t} text-xs font-bold px-2.5 py-1 rounded-full`}>{l}</span>
                  ))}
                </div>
              </div>
              {openMeal === idx && (
                <div className="border-t border-cream-2">
                  <p className="px-5 py-3 text-xs font-bold tracking-widest text-teal uppercase">Swap Options</p>
                  {m.swaps.map((sw, si) => (
                    <div key={si} className="flex justify-between items-start px-5 py-3 border-b border-cream-2 last:border-0">
                      <div><p className="text-sm font-semibold text-ink">{sw.name}</p><p className="text-xs text-ink/40 mt-0.5">{sw.macros}</p></div>
                      <span className="bg-teal-pale text-teal text-xs font-bold px-2.5 py-1 rounded-full ml-3 whitespace-nowrap">{sw.badge}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Avoid */}
          <div className="bg-white rounded-card shadow-card mx-4 mb-3 p-5">
            <p className="text-xs font-bold tracking-widest text-ink/30 uppercase mb-3">Never Eat These</p>
            {[
              { item: 'Sugary drinks — Coke, Pepsi, packaged juice', reason: 'Pure sugar, zero nutrition, direct fat gain' },
              { item: 'Office biscuits & namkeen', reason: '500 invisible calories' },
              { item: 'Maida — samosa, pav, kachori', reason: 'Blood sugar spike → stored as fat' },
              { item: 'Heavy meals after 10 PM', reason: 'No activity after, goes straight to fat' },
              { item: 'Alcohol', reason: 'Kills testosterone, destroys sleep, stops fat loss' },
            ].map(({ item, reason }, i) => (
              <div key={i} className="flex gap-3 py-2.5 border-b border-cream-2 last:border-0">
                <span className="text-danger font-black text-lg leading-none mt-0.5">×</span>
                <div><p className="text-sm font-semibold text-ink">{item}</p><p className="text-xs text-ink/40 mt-0.5">{reason}</p></div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── LOG TAB ── */}
      {tab === 'log' && (
        <>
          {/* Daily progress */}
          <div className="mx-4 mb-3 bg-white rounded-card shadow-card p-5">
            <div className="flex justify-between items-center mb-3">
              <p className="text-xs font-bold tracking-widest text-ink/30 uppercase">Today's Intake</p>
              <p className="text-xs font-bold text-ink/40">{new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>
            </div>

            {/* Calorie ring + stats */}
            <div className="flex items-center gap-4 mb-4">
              <div className="relative w-20 h-20 flex-shrink-0">
                <svg width="80" height="80" viewBox="0 0 80 80" style={{ transform: 'rotate(-90deg)' }}>
                  <circle cx="40" cy="40" r="32" fill="none" stroke="#EDE9E1" strokeWidth="8" />
                  <circle cx="40" cy="40" r="32" fill="none" stroke="#0A9396" strokeWidth="8"
                    strokeDasharray={`${2 * Math.PI * 32}`}
                    strokeDashoffset={`${2 * Math.PI * 32 * (1 - calPct / 100)}`}
                    strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <p className="text-base font-extrabold text-ink leading-none">{Math.round(totalCal)}</p>
                  <p className="text-xs text-ink/40">kcal</p>
                </div>
              </div>
              <div className="flex-1">
                <div className="grid grid-cols-3 gap-2 text-center">
                  {[
                    { val: Math.round(totalP), target: targetP, label: 'Protein', color: 'bg-sage' },
                    { val: Math.round(totalC), target: plan?.carbs ?? 200, label: 'Carbs', color: 'bg-blue-light' },
                    { val: Math.round(totalF), target: plan?.fat ?? 60, label: 'Fat', color: 'bg-gold' },
                  ].map(({ val, target, label, color }) => (
                    <div key={label}>
                      <p className="text-base font-extrabold text-ink">{val}g</p>
                      <p className="text-xs text-ink/30">/ {target}g</p>
                      <div className="bg-cream-2 rounded-full h-1 mt-1 overflow-hidden">
                        <div className={`${color} h-full rounded-full`} style={{ width: `${Math.min(100, val / target * 100)}%` }} />
                      </div>
                      <p className="text-xs text-ink/40 mt-0.5">{label}</p>
                    </div>
                  ))}
                </div>
                <p className={`text-xs font-bold mt-2 ${totalCal >= targetCal * 0.9 && totalCal <= targetCal * 1.1 ? 'text-teal' : totalCal > targetCal * 1.1 ? 'text-danger' : 'text-gold'}`}>
                  {totalCal >= targetCal * 0.9 && totalCal <= targetCal * 1.1 ? '✓ On target' : totalCal > targetCal * 1.1 ? `↑ ${Math.round(totalCal - targetCal)} kcal over` : `↓ ${Math.round(targetCal - totalCal)} kcal remaining`}
                </p>
              </div>
            </div>

            {/* Protein bar */}
            <div>
              <div className="flex justify-between text-xs text-ink/40 mb-1">
                <span>Protein progress</span><span>{Math.round(totalP)}g / {targetP}g</span>
              </div>
              <div className="bg-cream-2 rounded-full h-2 overflow-hidden">
                <div className="bg-sage h-full rounded-full transition-all" style={{ width: `${pPct}%` }} />
              </div>
            </div>
          </div>

          {/* Meal slot selector */}
          <div className="flex gap-2 px-4 mb-3 overflow-x-auto scrollbar-none">
            {MEAL_SLOTS.map(slot => (
              <button key={slot.id} onClick={() => setSelectedSlot(slot.id)}
                className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl border-2 text-xs font-bold transition-all ${selectedSlot === slot.id ? 'bg-ink-2 border-ink-2 text-white' : 'bg-white border-cream-3 text-ink/50'}`}>
                {slot.icon} {slot.label}
              </button>
            ))}
          </div>

          {/* Add food button */}
          <div className="mx-4 mb-3">
            <button onClick={() => { setShowAddModal(true); setSearchResults(searchFoods('')) }}
              className="w-full bg-teal text-white font-bold text-sm py-3.5 rounded-xl flex items-center justify-center gap-2 active:opacity-80">
              <span className="text-lg">+</span> Log food for {MEAL_SLOTS.find(s => s.id === selectedSlot)?.label}
            </button>
          </div>

          {/* Logged food by slot */}
          {MEAL_SLOTS.map(slot => {
            const slotLogs = todayLogs.filter(f => f.meal_slot === slot.id)
            if (!slotLogs.length) return null
            const slotCal = slotLogs.reduce((s, f) => s + f.calories * (f.quantity || 1), 0)
            return (
              <div key={slot.id} className="bg-white rounded-card shadow-card mx-4 mb-3 overflow-hidden">
                <div className="flex justify-between items-center px-5 py-3 border-b border-cream-2">
                  <span className="text-sm font-bold text-ink">{slot.icon} {slot.label}</span>
                  <span className="text-xs font-bold text-ink/40">{Math.round(slotCal)} kcal</span>
                </div>
                {slotLogs.map(log => (
                  <div key={log.id} className="flex items-center gap-3 px-5 py-3 border-b border-cream-2 last:border-0">
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-ink">{log.food_name}</p>
                      <p className="text-xs text-ink/40 mt-0.5">
                        {log.quantity > 1 ? `${log.quantity}× ` : ''}{log.serving_label}
                        {log.serving_grams ? ` · ${Math.round(log.serving_grams)}g` : ''}
                      </p>
                      <p className="text-xs text-ink/30 mt-0.5">{Math.round(log.calories * (log.quantity || 1))} kcal · {Math.round(log.protein * (log.quantity || 1))}g P</p>
                    </div>
                    <button onClick={() => deleteFoodLog(log.id)} className="text-ink/20 hover:text-danger text-xl px-1 transition-colors">×</button>
                  </div>
                ))}
              </div>
            )
          })}

          {todayLogs.length === 0 && (
            <div className="text-center py-10 px-4">
              <p className="text-4xl mb-3">🍽️</p>
              <p className="text-sm font-semibold text-ink/50">Nothing logged yet today</p>
              <p className="text-xs text-ink/30 mt-1">Tap the button above to log your first meal</p>
            </div>
          )}
        </>
      )}

      {/* ── ADD FOOD MODAL ── */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex flex-col" style={{ background: 'rgba(0,0,0,0.5)' }} onClick={(e) => { if (e.target === e.currentTarget) { setShowAddModal(false); setSelectedFood(null) } }}>
          <div className="bg-cream rounded-t-3xl mt-auto max-h-[85vh] overflow-y-auto">
            <div className="px-5 pt-5 pb-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-extrabold text-ink">
                  {selectedFood ? 'Confirm serving' : `Add to ${MEAL_SLOTS.find(s => s.id === selectedSlot)?.label}`}
                </h3>
                <button onClick={() => { setShowAddModal(false); setSelectedFood(null); setSearchQuery('') }} className="text-ink/30 text-2xl">×</button>
              </div>

              {!selectedFood ? (
                <>
                  {/* Search bar */}
                  <div className="relative mb-3">
                    <input
                      className="w-full bg-white border-2 border-cream-3 focus:border-teal text-ink text-sm px-4 py-3 rounded-xl outline-none transition-colors"
                      placeholder="Search food... e.g. dal, chicken, banana"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      autoFocus
                    />
                    {aiSearching && <span className="absolute right-3 top-3 text-xs text-teal">🤖 searching...</span>}
                  </div>

                  {/* Search results */}
                  <div className="flex flex-col gap-2">
                    {searchResults.map(food => (
                      <button key={food.id} onClick={() => setSelectedFood(food)}
                        className="flex justify-between items-center bg-white p-4 rounded-xl border border-cream-3 text-left active:bg-teal-pale transition-all">
                        <div>
                          <p className="text-sm font-bold text-ink">{food.name}</p>
                          <p className="text-xs text-ink/40 mt-0.5">{food.serving_label} · {food.serving_grams}g</p>
                        </div>
                        <div className="text-right ml-3 flex-shrink-0">
                          <p className="text-sm font-extrabold text-ink">{food.calories} kcal</p>
                          <p className="text-xs text-ink/40">{food.protein}g P · {food.carbs}g C</p>
                        </div>
                      </button>
                    ))}
                    {searchResults.length === 0 && searchQuery && !aiSearching && (
                      <p className="text-center text-sm text-ink/40 py-4">No results — try a different term</p>
                    )}
                  </div>
                </>
              ) : (
                /* Serving size confirm */
                <div>
                  <div className="bg-white rounded-xl p-4 mb-4">
                    <p className="text-base font-bold text-ink">{selectedFood.name}</p>
                    <p className="text-xs text-ink/40 mt-1">Standard serving: {selectedFood.serving_label} ({selectedFood.serving_grams}g)</p>
                  </div>

                  <p className="text-xs font-bold tracking-widest text-ink/40 uppercase mb-2">How many servings?</p>
                  <div className="flex gap-2 mb-4 flex-wrap">
                    {[0.5, 1, 1.5, 2, 3].map(q => (
                      <button key={q} onClick={() => setQuantity(q)}
                        className={`px-4 py-2 rounded-xl border-2 text-sm font-bold transition-all ${quantity === q ? 'bg-teal border-teal text-white' : 'bg-white border-cream-3 text-ink/60'}`}>
                        {q === 0.5 ? '½' : q}×
                      </button>
                    ))}
                  </div>

                  {/* Macro preview */}
                  <div className="bg-teal-pale rounded-xl p-4 mb-4">
                    <p className="text-xs font-bold text-teal uppercase tracking-wide mb-2">You'll log</p>
                    <p className="text-sm font-semibold text-ink">{quantity === 0.5 ? 'Half' : quantity + '×'} {selectedFood.serving_label}</p>
                    <p className="text-xs text-ink/50 mt-0.5">{Math.round(selectedFood.serving_grams * quantity)}g total</p>
                    <div className="flex gap-3 mt-3">
                      {[
                        { val: Math.round(selectedFood.calories * quantity), label: 'kcal', color: 'text-ink' },
                        { val: Math.round(selectedFood.protein * quantity) + 'g', label: 'Protein', color: 'text-sage' },
                        { val: Math.round(selectedFood.carbs * quantity) + 'g', label: 'Carbs', color: 'text-blue' },
                        { val: Math.round(selectedFood.fat * quantity) + 'g', label: 'Fat', color: 'text-gold' },
                      ].map(({ val, label, color }) => (
                        <div key={label} className="text-center">
                          <p className={`text-base font-extrabold ${color}`}>{val}</p>
                          <p className="text-xs text-ink/30">{label}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button onClick={() => setSelectedFood(null)} className="flex-shrink-0 bg-cream-2 text-ink/60 font-bold text-sm py-3 px-5 rounded-xl">← Back</button>
                    <button onClick={handleAddFood} className="flex-1 bg-teal text-white font-bold text-sm py-3 rounded-xl active:opacity-80">Log This →</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
