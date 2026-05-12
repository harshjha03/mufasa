import { useState, useEffect, useRef } from 'react'
import { useStore } from '../store/useStore'
import { searchFoods } from '../lib/foodDb'
import { searchFoodWeb } from '../lib/aiFood'
import type { FoodItem } from '../types'

// ── Design tokens ────────────────────────────────────────
const BG     = '#120D08'
const CARD   = '#1C1410'
const ELEV   = '#221A12'
const BORDER = 'rgba(255,255,255,0.07)'
const TEXT   = '#F0E4C8'
const MUTED  = 'rgba(240,228,200,0.45)'
const GOLD   = '#D4A84B'
const COPPER = '#D4905A'
const AZURE  = '#5B8FA8'
const SAGE   = '#7BAE8A'
const DANGER = '#E05252'

const MEAL_SLOTS = [
  { id: 'breakfast', label: 'Breakfast', icon: 'wb_twilight' },
  { id: 'lunch',     label: 'Lunch',     icon: 'wb_sunny' },
  { id: 'snack',     label: 'Snack',     icon: 'nutrition' },
  { id: 'dinner',    label: 'Dinner',    icon: 'dinner_dining' },
  { id: 'night',     label: 'Night',     icon: 'bedtime' },
] as const

type MealSlot = typeof MEAL_SLOTS[number]['id']

// ── Compact macro ring ───────────────────────────────────
function MiniRing({ value, target, label, color, unit = 'g' }: {
  value: number; target: number; label: string; color: string; unit?: string
}) {
  const r    = 26
  const circ = 2 * Math.PI * r
  const pct  = target > 0 ? Math.min(1, value / target) : 0
  const display = value > 0 ? value : target
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
      <div style={{ position: 'relative', width: 64, height: 64 }}>
        <svg width="64" height="64" viewBox="0 0 64 64" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx="32" cy="32" r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="5.5" />
          <circle cx="32" cy="32" r={r} fill="none" stroke={color} strokeWidth="5.5"
            strokeDasharray={circ} strokeDashoffset={circ * (1 - pct)} strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.6s ease' }} />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
          <span style={{ fontSize: unit === 'kcal' ? 9 : 12, fontWeight: 800, color: TEXT, lineHeight: 1 }}>{display}</span>
          <span style={{ fontSize: 8, color: MUTED, lineHeight: 1 }}>{unit}</span>
        </div>
      </div>
      <span style={{ fontSize: 9, fontWeight: 700, color: MUTED, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{label}</span>
    </div>
  )
}

// ────────────────────────────────────────────────────────
export default function NutritionScreen() {
  const { plan, foodLogs, addFoodLog, deleteFoodLog, loadFoodLogs } = useStore()
  const [tab, setTab]                 = useState<'plan' | 'log'>('plan')
  const [openMeal, setOpenMeal]       = useState<number | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<MealSlot>('breakfast')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<FoodItem[]>([])
  const [webSearching, setWebSearching] = useState(false)
  const [webSearched, setWebSearched]   = useState(false)
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null)
  const [quantity, setQuantity]         = useState(1)
  const [showAddModal, setShowAddModal] = useState(false)
  const searchTimeout = useRef<any>(null)
  const today = new Date().toISOString().split('T')[0]

  useEffect(() => { loadFoodLogs(today) }, [today])

  useEffect(() => {
    setWebSearched(false); setWebSearching(false)
    if (!searchQuery.trim()) { setSearchResults(searchFoods('')); return }
    clearTimeout(searchTimeout.current)
    searchTimeout.current = setTimeout(() => setSearchResults(searchFoods(searchQuery)), 300)
  }, [searchQuery])

  const handleWebSearch = async () => {
    if (!searchQuery.trim() || webSearching) return
    setWebSearching(true)
    try {
      const results  = await searchFoodWeb(searchQuery)
      const local    = searchFoods(searchQuery)
      setSearchResults([...local, ...results])
      setWebSearched(true)
    } catch { setWebSearched(true) }
    finally   { setWebSearching(false) }
  }

  const todayLogs = foodLogs.filter(f => f.date === today)
  const totalCal  = todayLogs.reduce((s, f) => s + f.calories * (f.quantity || 1), 0)
  const totalP    = todayLogs.reduce((s, f) => s + f.protein  * (f.quantity || 1), 0)
  const totalC    = todayLogs.reduce((s, f) => s + f.carbs    * (f.quantity || 1), 0)
  const totalF    = todayLogs.reduce((s, f) => s + f.fat      * (f.quantity || 1), 0)

  const targetCal = plan?.calories ?? 2000
  const targetP   = plan?.protein  ?? 150
  const targetC   = plan?.carbs    ?? 200
  const targetF   = plan?.fat      ?? 60

  const handleAddFood = async () => {
    if (!selectedFood) return
    await addFoodLog({
      date: today, meal_slot: selectedSlot,
      food_name:      selectedFood.name,
      serving_label:  selectedFood.serving_label,
      serving_grams:  selectedFood.serving_grams * quantity,
      calories:       selectedFood.calories * quantity,
      protein:        selectedFood.protein  * quantity,
      carbs:          selectedFood.carbs    * quantity,
      fat:            selectedFood.fat      * quantity,
      quantity,
    })
    setShowAddModal(false); setSelectedFood(null); setSearchQuery(''); setQuantity(1)
  }

  const calStatus = () => {
    if (totalCal >= targetCal * 0.9 && totalCal <= targetCal * 1.1) return { text: '✓ On target', color: GOLD }
    if (totalCal > targetCal * 1.1) return { text: `↑ ${Math.round(totalCal - targetCal)} kcal over`, color: DANGER }
    return { text: `↓ ${Math.round(targetCal - totalCal)} kcal remaining`, color: MUTED }
  }

  const meals = plan?.meals ?? []

  return (
    <div style={{ background: 'linear-gradient(180deg, #2A1608 0%, #180B04 25%, #120D08 55%, #0E0A06 100%)', minHeight: '100vh', paddingBottom: 96 }}>

      {/* ── Header ──────────────────────────────────────── */}
      <div style={{ padding: 'max(env(safe-area-inset-top, 0px), 24px) 20px 16px' }}>
        <h1 style={{
          fontSize: 40, fontWeight: 800, color: TEXT,
          letterSpacing: '-1.5px', lineHeight: 1,
          fontFamily: '-apple-system, BlinkMacSystemFont, system-ui',
          marginBottom: 16,
        }}>
          Nutrition.
        </h1>

        {/* Tab switcher */}
        <div style={{ display: 'flex', gap: 6, background: ELEV, padding: 4, borderRadius: 14, border: `1px solid ${BORDER}` }}>
          {([['plan', 'Meal Plan', 'assignment'], ['log', 'Food Log', 'edit_note']] as const).map(([id, label, icon]) => (
            <button key={id} onClick={() => setTab(id)} style={{
              flex: 1, padding: '10px 0', borderRadius: 10, fontSize: 12, fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, cursor: 'pointer',
              background: tab === id ? CARD : 'transparent',
              color: tab === id ? TEXT : MUTED,
              border: tab === id ? `1px solid ${BORDER}` : '1px solid transparent',
              transition: 'all 0.2s',
            }}>
              <span className="ms ms-sm" style={{ fontSize: 14 }}>{icon}</span>{label}
            </button>
          ))}
        </div>
      </div>

      {/* ── PLAN TAB ───────────────────────────────────── */}
      {tab === 'plan' && (
        <>
          {/* Daily targets — 4 rings */}
          <div style={{ margin: '0 16px 12px', background: CARD, borderRadius: 20, padding: '18px 16px', border: `1px solid ${BORDER}` }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: MUTED, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 16 }}>
              Daily Targets
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 4 }}>
              <MiniRing value={0} target={plan?.calories ?? 2000} label="Kcal"    color={GOLD}   unit="kcal" />
              <MiniRing value={0} target={plan?.protein  ?? 150}  label="Protein" color={COPPER} />
              <MiniRing value={0} target={plan?.carbs    ?? 200}  label="Carbs"   color={AZURE}  />
              <MiniRing value={0} target={plan?.fat      ?? 60}   label="Fat"     color={SAGE}   />
            </div>
          </div>

          {/* Meal cards */}
          {meals.map((m: any, idx: number) => (
            <div key={idx} style={{ margin: '0 16px 10px', background: CARD, borderRadius: 20, overflow: 'hidden', border: `1px solid ${BORDER}` }}>
              <button style={{ width: '100%', padding: 18, textAlign: 'left', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', cursor: 'pointer' }}
                onClick={() => setOpenMeal(openMeal === idx ? null : idx)}>
                <div style={{ flex: 1 }}>
                  <span style={{ background: 'rgba(212,168,75,0.1)', color: GOLD, fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 20, border: '1px solid rgba(212,168,75,0.2)' }}>
                    {m.time}
                  </span>
                  <p style={{ fontSize: 15, fontWeight: 700, color: TEXT, marginTop: 10 }}>{m.food}</p>
                  <p style={{ fontSize: 11, color: MUTED, marginTop: 4 }}>{m.cal} kcal · {m.p}g P · {m.c}g C · {m.f}g F</p>
                </div>
                <span style={{ fontSize: 18, color: MUTED, marginLeft: 12, transition: 'transform 0.2s', transform: openMeal === idx ? 'rotate(180deg)' : 'rotate(0deg)' }}>⌄</span>
              </button>

              {/* Macro bar */}
              <div style={{ padding: '0 18px 16px' }}>
                <div style={{ display: 'flex', height: 4, borderRadius: 4, overflow: 'hidden', background: 'rgba(255,255,255,0.06)', gap: 1 }}>
                  <div style={{ background: COPPER, borderRadius: 4, width: `${m.p * 4 / m.cal * 100}%` }} />
                  <div style={{ background: AZURE,  borderRadius: 4, width: `${m.c * 4 / m.cal * 100}%` }} />
                  <div style={{ background: GOLD,   borderRadius: 4, width: `${m.f * 9 / m.cal * 100}%` }} />
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
                  {[
                    { l: `P ${m.p}g`, bg: 'rgba(212,144,90,0.12)', t: COPPER },
                    { l: `C ${m.c}g`, bg: 'rgba(91,143,168,0.12)', t: AZURE },
                    { l: `F ${m.f}g`, bg: 'rgba(212,168,75,0.12)', t: GOLD },
                  ].map(({ l, bg, t }) => (
                    <span key={l} style={{ fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: bg, color: t }}>
                      {l}
                    </span>
                  ))}
                </div>
              </div>

              {/* Swap options */}
              {openMeal === idx && (
                <div style={{ borderTop: `1px solid ${BORDER}` }}>
                  <p style={{ padding: '12px 18px 8px', fontSize: 9, fontWeight: 700, color: GOLD, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                    Swap Options
                  </p>
                  {m.swaps.map((sw: any, si: number) => (
                    <div key={si} style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                      padding: '10px 18px', borderBottom: si < m.swaps.length - 1 ? `1px solid ${BORDER}` : 'none',
                    }}>
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 600, color: TEXT }}>{sw.name}</p>
                        <p style={{ fontSize: 11, color: MUTED, marginTop: 3 }}>{sw.macros}</p>
                      </div>
                      <span style={{ background: 'rgba(212,168,75,0.1)', color: GOLD, fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 20, marginLeft: 12, whiteSpace: 'nowrap', border: '1px solid rgba(212,168,75,0.2)' }}>
                        {sw.badge}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Never eat */}
          <div style={{ margin: '0 16px 12px', background: CARD, borderRadius: 20, padding: 20, border: `1px solid ${BORDER}` }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: MUTED, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 14 }}>
              Never Eat These
            </p>
            {[
              { item: 'Sugary drinks — Coke, Pepsi, packaged juice', reason: 'Pure sugar, zero nutrition, direct fat gain' },
              { item: 'Office biscuits & namkeen',                   reason: '500 invisible calories' },
              { item: 'Maida — samosa, pav, kachori',                reason: 'Blood sugar spike → stored as fat' },
              { item: 'Heavy meals after 10 PM',                     reason: 'No activity after, goes straight to fat' },
              { item: 'Alcohol',                                      reason: 'Kills testosterone, destroys sleep, stops fat loss' },
            ].map(({ item, reason }, i, arr) => (
              <div key={i} style={{ display: 'flex', gap: 12, paddingTop: 10, paddingBottom: 10, borderBottom: i < arr.length - 1 ? `1px solid ${BORDER}` : 'none' }}>
                <span style={{ color: DANGER, fontWeight: 900, fontSize: 16, lineHeight: 1, marginTop: 1, flexShrink: 0 }}>×</span>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: TEXT }}>{item}</p>
                  <p style={{ fontSize: 11, color: MUTED, marginTop: 3 }}>{reason}</p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── LOG TAB ────────────────────────────────────── */}
      {tab === 'log' && (
        <>
          {/* Macro rings — live progress */}
          <div style={{ margin: '0 16px 12px', background: CARD, borderRadius: 20, padding: '18px 16px', border: `1px solid ${BORDER}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: MUTED, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                Today's Intake
              </p>
              <p style={{ fontSize: 11, fontWeight: 700, color: calStatus().color }}>{calStatus().text}</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 4 }}>
              <MiniRing value={Math.round(totalCal)} target={targetCal} label="Kcal"    color={GOLD}   unit="kcal" />
              <MiniRing value={Math.round(totalP)}   target={targetP}   label="Protein" color={COPPER} />
              <MiniRing value={Math.round(totalC)}   target={targetC}   label="Carbs"   color={AZURE}  />
              <MiniRing value={Math.round(totalF)}   target={targetF}   label="Fat"     color={SAGE}   />
            </div>
          </div>

          {/* Meal slot pills */}
          <div className="scrollbar-none" style={{ display: 'flex', gap: 8, padding: '0 16px 12px', overflowX: 'auto' }}>
            {MEAL_SLOTS.map(slot => (
              <button key={slot.id} onClick={() => setSelectedSlot(slot.id)} style={{
                flexShrink: 0, display: 'flex', alignItems: 'center', gap: 6,
                padding: '8px 14px', borderRadius: 20, fontSize: 12, fontWeight: 700, cursor: 'pointer',
                background: selectedSlot === slot.id ? ELEV : CARD,
                color: selectedSlot === slot.id ? TEXT : MUTED,
                border: `1px solid ${selectedSlot === slot.id ? 'rgba(212,168,75,0.3)' : BORDER}`,
                transition: 'all 0.2s',
              }}>
                <span className="ms ms-sm" style={{ fontSize: 13 }}>{slot.icon}</span>{slot.label}
              </button>
            ))}
          </div>

          {/* Add food CTA */}
          <div style={{ padding: '0 16px 12px' }}>
            <button
              onClick={() => { setShowAddModal(true); setSearchResults(searchFoods('')) }}
              style={{
                width: '100%', background: GOLD, color: '#120D08', fontWeight: 800, fontSize: 14,
                padding: '14px 0', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer',
              }}>
              <span style={{ fontSize: 18, lineHeight: 1 }}>+</span>
              Log food for {MEAL_SLOTS.find(s => s.id === selectedSlot)?.label}
            </button>
          </div>

          {/* Logged items by slot */}
          {MEAL_SLOTS.map(slot => {
            const slotLogs = todayLogs.filter(f => f.meal_slot === slot.id)
            if (!slotLogs.length) return null
            const slotCal = slotLogs.reduce((s, f) => s + f.calories * (f.quantity || 1), 0)
            return (
              <div key={slot.id} style={{ margin: '0 16px 10px', background: CARD, borderRadius: 18, overflow: 'hidden', border: `1px solid ${BORDER}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderBottom: `1px solid ${BORDER}` }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: TEXT, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span className="ms ms-sm" style={{ fontSize: 14, color: MUTED }}>{slot.icon}</span>{slot.label}
                  </span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: MUTED }}>{Math.round(slotCal)} kcal</span>
                </div>
                {slotLogs.map((log, li) => (
                  <div key={log.id} style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '12px 16px', borderBottom: li < slotLogs.length - 1 ? `1px solid ${BORDER}` : 'none',
                  }}>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: TEXT }}>{log.food_name}</p>
                      <p style={{ fontSize: 11, color: MUTED, marginTop: 3 }}>
                        {log.quantity > 1 ? `${log.quantity}× ` : ''}{log.serving_label}
                        {log.serving_grams ? ` · ${Math.round(log.serving_grams)}g` : ''}
                      </p>
                      <p style={{ fontSize: 11, color: MUTED, marginTop: 1 }}>
                        {Math.round(log.calories * (log.quantity || 1))} kcal · {Math.round(log.protein * (log.quantity || 1))}g P
                      </p>
                    </div>
                    <button onClick={() => deleteFoodLog(log.id)} style={{ color: MUTED, fontSize: 20, padding: '0 4px', lineHeight: 1, cursor: 'pointer' }}>×</button>
                  </div>
                ))}
              </div>
            )
          })}

          {todayLogs.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px 16px' }}>
              <span className="ms" style={{ color: 'rgba(212,168,75,0.2)', fontSize: 40, display: 'block', marginBottom: 12 }}>restaurant</span>
              <p style={{ fontSize: 14, fontWeight: 600, color: MUTED }}>Nothing logged yet</p>
              <p style={{ fontSize: 12, color: MUTED, marginTop: 4, opacity: 0.6 }}>Tap the button above to log your first meal</p>
            </div>
          )}
        </>
      )}

      {/* ── ADD FOOD MODAL ─────────────────────────────── */}
      {showAddModal && (
        <div
          onClick={e => { if (e.target === e.currentTarget) { setShowAddModal(false); setSelectedFood(null) } }}
          style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', flexDirection: 'column', background: 'rgba(0,0,0,0.7)' }}>
          <div style={{
            background: '#1A1208', borderRadius: '28px 28px 0 0', marginTop: 'auto',
            maxHeight: '88vh', overflowY: 'auto', border: `1px solid ${BORDER}`,
            borderBottom: 'none',
          }}>
            <div style={{ padding: '20px 20px 8px' }}>
              {/* Handle */}
              <div style={{ width: 36, height: 4, background: 'rgba(255,255,255,0.12)', borderRadius: 4, margin: '0 auto 20px' }} />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h3 style={{ fontSize: 17, fontWeight: 800, color: TEXT }}>
                  {selectedFood ? 'Confirm serving' : `Log to ${MEAL_SLOTS.find(s => s.id === selectedSlot)?.label}`}
                </h3>
                <button onClick={() => { setShowAddModal(false); setSelectedFood(null); setSearchQuery('') }}
                  style={{ fontSize: 22, color: MUTED, cursor: 'pointer', lineHeight: 1 }}>×</button>
              </div>

              {!selectedFood ? (
                <>
                  <input
                    className="scrollbar-none"
                    style={{
                      width: '100%', background: ELEV, border: `1px solid ${BORDER}`,
                      borderRadius: 14, padding: '13px 16px', fontSize: 14, color: TEXT,
                      outline: 'none', marginBottom: 12,
                      fontFamily: '-apple-system, BlinkMacSystemFont, system-ui',
                    }}
                    placeholder="Search food… e.g. dal, chicken, banana"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    autoFocus
                  />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {searchResults.map(food => (
                      <button key={food.id} onClick={() => setSelectedFood(food)} style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        background: ELEV, padding: '14px 16px', borderRadius: 14, textAlign: 'left', cursor: 'pointer',
                        border: `1px solid ${BORDER}`,
                      }}>
                        <div>
                          <p style={{ fontSize: 14, fontWeight: 600, color: TEXT }}>{food.name}</p>
                          <p style={{ fontSize: 11, color: MUTED, marginTop: 3 }}>{food.serving_label} · {food.serving_grams}g</p>
                        </div>
                        <div style={{ textAlign: 'right', marginLeft: 12, flexShrink: 0 }}>
                          <p style={{ fontSize: 14, fontWeight: 800, color: TEXT }}>{food.calories} kcal</p>
                          <p style={{ fontSize: 11, color: MUTED }}>{food.protein}g P · {food.carbs}g C</p>
                        </div>
                      </button>
                    ))}
                    {searchQuery.trim() && (
                      <button onClick={handleWebSearch} disabled={webSearching || webSearched} style={{
                        width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                        padding: '14px 0', marginTop: 4, borderRadius: 14, fontSize: 13, fontWeight: 700, cursor: 'pointer',
                        background: webSearched ? 'rgba(212,168,75,0.1)' : ELEV,
                        color: webSearched ? GOLD : MUTED,
                        border: `1px solid ${webSearched ? 'rgba(212,168,75,0.25)' : BORDER}`,
                      }}>
                        {webSearching
                          ? <><span className="ms ms-sm" style={{ fontSize: 15 }}>hourglass_empty</span> Searching web...</>
                          : webSearched
                          ? <><span className="ms ms-sm" style={{ fontSize: 15 }}>check_circle</span> Web results loaded</>
                          : <><span className="ms ms-sm" style={{ fontSize: 15 }}>public</span> Search Web for "{searchQuery}"</>
                        }
                      </button>
                    )}
                    {searchResults.length === 0 && searchQuery && !webSearching && (
                      <p style={{ textAlign: 'center', fontSize: 13, color: MUTED, padding: '12px 0' }}>
                        No local results — tap Search Web above
                      </p>
                    )}
                  </div>
                </>
              ) : (
                <div>
                  <div style={{ background: ELEV, borderRadius: 14, padding: 16, marginBottom: 20, border: `1px solid ${BORDER}` }}>
                    <p style={{ fontSize: 15, fontWeight: 700, color: TEXT }}>{selectedFood.name}</p>
                    <p style={{ fontSize: 12, color: MUTED, marginTop: 4 }}>
                      Standard serving: {selectedFood.serving_label} ({selectedFood.serving_grams}g)
                    </p>
                  </div>

                  <p style={{ fontSize: 10, fontWeight: 700, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
                    How many servings?
                  </p>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
                    {[0.5, 1, 1.5, 2, 3].map(q => (
                      <button key={q} onClick={() => setQuantity(q)} style={{
                        padding: '10px 18px', borderRadius: 14, fontSize: 14, fontWeight: 700, cursor: 'pointer',
                        background: quantity === q ? 'rgba(212,168,75,0.12)' : ELEV,
                        color: quantity === q ? GOLD : MUTED,
                        border: `1px solid ${quantity === q ? 'rgba(212,168,75,0.3)' : BORDER}`,
                        transition: 'all 0.2s',
                      }}>
                        {q === 0.5 ? '½' : q}×
                      </button>
                    ))}
                  </div>

                  {/* Macro preview */}
                  <div style={{ background: 'rgba(212,168,75,0.06)', borderRadius: 14, padding: 16, marginBottom: 20, border: '1px solid rgba(212,168,75,0.15)' }}>
                    <p style={{ fontSize: 10, fontWeight: 700, color: GOLD, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>You'll log</p>
                    <p style={{ fontSize: 14, fontWeight: 600, color: TEXT }}>{quantity === 0.5 ? 'Half' : quantity + '×'} {selectedFood.serving_label}</p>
                    <p style={{ fontSize: 11, color: MUTED, marginTop: 3 }}>{Math.round(selectedFood.serving_grams * quantity)}g total</p>
                    <div style={{ display: 'flex', gap: 20, marginTop: 12 }}>
                      {[
                        { val: Math.round(selectedFood.calories * quantity), label: 'kcal', color: TEXT },
                        { val: Math.round(selectedFood.protein  * quantity), label: 'Protein', color: COPPER },
                        { val: Math.round(selectedFood.carbs    * quantity), label: 'Carbs',   color: AZURE },
                        { val: Math.round(selectedFood.fat      * quantity), label: 'Fat',     color: GOLD },
                      ].map(({ val, label, color }) => (
                        <div key={label} style={{ textAlign: 'center' }}>
                          <p style={{ fontSize: 16, fontWeight: 800, color }}>{val}{label !== 'kcal' ? 'g' : ''}</p>
                          <p style={{ fontSize: 10, color: MUTED, marginTop: 2 }}>{label}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 10 }}>
                    <button onClick={() => setSelectedFood(null)} style={{
                      flexShrink: 0, background: ELEV, color: MUTED, fontWeight: 700, fontSize: 13,
                      padding: '14px 18px', borderRadius: 14, cursor: 'pointer', border: `1px solid ${BORDER}`,
                    }}>← Back</button>
                    <button onClick={handleAddFood} style={{
                      flex: 1, background: GOLD, color: '#120D08', fontWeight: 800, fontSize: 14,
                      padding: '14px 0', borderRadius: 14, cursor: 'pointer',
                    }}>Log This →</button>
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
