import { useState } from 'react'
import { useStore } from '../store/useStore'
import { BUDGET_CATS } from '../lib/data'
import { refreshBudgetPricesAI } from '../lib/aiFood'
import type { Expense } from '../types'

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

const CAT_OPTIONS = [
  { value: 'supplement', label: 'Supplement' },
  { value: 'food',       label: 'Food'       },
  { value: 'gym',        label: 'Gym'        },
  { value: 'other',      label: 'Other'      },
] as const

export default function ExpensesScreen() {
  const { expenses, addExpense, deleteExpense, plan, profile } = useStore()
  const [name,   setName]   = useState('')
  const [amount, setAmount] = useState('')
  const [cat,    setCat]    = useState<Expense['cat']>('supplement')
  const [refreshingBudget, setRefreshingBudget] = useState(false)
  const [tab, setTab] = useState<'tracker' | 'budget'>('tracker')

  const month         = new Date().toISOString().slice(0, 7)
  const thisMonth     = expenses.filter(e => e.month === month)
  const total         = thisMonth.reduce((s, e) => s + e.amount, 0)
  const monthlyBudget = profile?.monthly_budget ?? 5000
  const budgetPct     = Math.min(100, total / monthlyBudget * 100)
  const budgetBreakdown = plan?.budgetBreakdown

  const barColor = budgetPct > 90 ? DANGER : budgetPct > 70 ? COPPER : GOLD

  const handleAdd = async () => {
    const amt = parseFloat(amount)
    if (!name.trim() || isNaN(amt) || amt <= 0) return
    await addExpense({ name: name.trim(), amount: amt, cat, month, date: new Date().toISOString().split('T')[0] })
    setName(''); setAmount('')
  }

  const handleRefreshBudget = async () => {
    if (!profile) return
    setRefreshingBudget(true)
    try {
      const breakdown = await refreshBudgetPricesAI(profile, monthlyBudget)
      alert(`Budget refreshed! Est. total: ₹${breakdown.total.toLocaleString('en-IN')}`)
    } finally {
      setRefreshingBudget(false)
    }
  }

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
          Expenses.
        </h1>

        {/* Tab switcher */}
        <div style={{ display: 'flex', gap: 6, background: ELEV, padding: 4, borderRadius: 14, border: `1px solid ${BORDER}` }}>
          {([['tracker', 'Tracker', 'bar_chart'], ['budget', 'Budget', 'lightbulb']] as const).map(([id, label, icon]) => (
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

      {/* ── TRACKER TAB ────────────────────────────────── */}
      {tab === 'tracker' && (
        <>
          {/* Summary cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, padding: '0 16px 12px' }}>
            <div style={{ background: CARD, borderRadius: 18, padding: 18, border: `1px solid ${BORDER}` }}>
              <p style={{ fontSize: 24, fontWeight: 800, color: total > monthlyBudget ? DANGER : TEXT, letterSpacing: '-0.5px', lineHeight: 1 }}>
                ₹{Math.round(total).toLocaleString('en-IN')}
              </p>
              <p style={{ fontSize: 10, fontWeight: 700, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 6 }}>Spent</p>
              <p style={{ fontSize: 11, color: MUTED, marginTop: 2 }}>This month</p>
            </div>
            <div style={{ background: CARD, borderRadius: 18, padding: 18, border: `1px solid ${BORDER}` }}>
              <p style={{ fontSize: 24, fontWeight: 800, color: total <= monthlyBudget ? GOLD : DANGER, letterSpacing: '-0.5px', lineHeight: 1 }}>
                ₹{Math.round(Math.max(0, monthlyBudget - total)).toLocaleString('en-IN')}
              </p>
              <p style={{ fontSize: 10, fontWeight: 700, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 6 }}>Remaining</p>
              <p style={{ fontSize: 11, color: MUTED, marginTop: 2 }}>of ₹{monthlyBudget.toLocaleString('en-IN')}</p>
            </div>
          </div>

          {/* Budget bar */}
          <div style={{ margin: '0 16px 12px', background: CARD, borderRadius: 20, padding: 18, border: `1px solid ${BORDER}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: TEXT }}>Monthly budget</span>
              <span style={{ fontSize: 13, fontWeight: 800, color: barColor }}>{Math.round(budgetPct)}%</span>
            </div>
            <div style={{ height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 6, overflow: 'hidden' }}>
              <div style={{
                height: '100%', borderRadius: 6, transition: 'width 0.5s ease',
                width: `${budgetPct}%`, background: barColor,
              }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
              <span style={{ fontSize: 10, color: MUTED }}>₹0</span>
              <span style={{ fontSize: 10, color: MUTED }}>₹{monthlyBudget.toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* Category bars */}
          <div style={{ margin: '0 16px 12px', background: CARD, borderRadius: 20, padding: '18px 18px 14px', border: `1px solid ${BORDER}` }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: MUTED, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 16 }}>
              By Category
            </p>
            {Object.entries(BUDGET_CATS).map(([key, info]) => {
              const catTotal = thisMonth.filter(e => e.cat === key).reduce((s, e) => s + e.amount, 0)
              const pct      = Math.min(100, info.max ? catTotal / info.max * 100 : 0)
              const catBar   = pct > 90 ? DANGER : info.color
              return (
                <div key={key} style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 7 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600, color: TEXT }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: info.color, flexShrink: 0 }} />
                      {info.label}
                    </span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: MUTED }}>
                      ₹{Math.round(catTotal).toLocaleString('en-IN')} / ₹{info.max.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div style={{ height: 5, background: 'rgba(255,255,255,0.06)', borderRadius: 5, overflow: 'hidden' }}>
                    <div style={{ height: '100%', borderRadius: 5, width: `${pct}%`, background: catBar, transition: 'width 0.5s ease' }} />
                  </div>
                </div>
              )
            })}
          </div>

          {/* Add expense */}
          <div style={{ margin: '0 16px 12px', background: CARD, borderRadius: 20, padding: 20, border: `1px solid ${BORDER}` }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: MUTED, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 14 }}>
              Add Expense
            </p>
            <input
              style={{
                width: '100%', background: ELEV, border: `1px solid ${BORDER}`,
                borderRadius: 14, padding: '13px 16px', fontSize: 14, color: TEXT,
                outline: 'none', marginBottom: 10,
                fontFamily: '-apple-system, BlinkMacSystemFont, system-ui',
              }}
              placeholder="Item name (e.g. Whey protein)"
              value={name} onChange={e => setName(e.target.value)}
            />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
              <input
                style={{
                  background: ELEV, border: `1px solid ${BORDER}`,
                  borderRadius: 14, padding: '13px 16px', fontSize: 14, color: TEXT,
                  outline: 'none',
                  fontFamily: '-apple-system, BlinkMacSystemFont, system-ui',
                }}
                type="number" placeholder="₹ Amount"
                value={amount} onChange={e => setAmount(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAdd()}
              />
              <select
                style={{
                  background: ELEV, border: `1px solid ${BORDER}`,
                  borderRadius: 14, padding: '13px 16px', fontSize: 14, color: TEXT,
                  outline: 'none', cursor: 'pointer',
                  fontFamily: '-apple-system, BlinkMacSystemFont, system-ui',
                }}
                value={cat} onChange={e => setCat(e.target.value as Expense['cat'])}>
                {CAT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <button onClick={handleAdd} style={{
              width: '100%', background: GOLD, color: '#120D08', fontWeight: 800, fontSize: 14,
              padding: '14px 0', borderRadius: 14, cursor: 'pointer',
            }}>
              Add Expense
            </button>
          </div>

          {/* Log entries */}
          {thisMonth.length > 0 && (
            <div style={{ margin: '0 16px 12px', background: CARD, borderRadius: 20, overflow: 'hidden', border: `1px solid ${BORDER}` }}>
              {thisMonth.map((e, i) => (
                <div key={e.id} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '14px 16px',
                  borderBottom: i < thisMonth.length - 1 ? `1px solid ${BORDER}` : 'none',
                }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', flexShrink: 0, background: BUDGET_CATS[e.cat]?.color }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 14, fontWeight: 600, color: TEXT, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.name}</p>
                    <p style={{ fontSize: 11, color: MUTED, marginTop: 3 }}>{e.date} · {BUDGET_CATS[e.cat]?.label}</p>
                  </div>
                  <span style={{ fontSize: 15, fontWeight: 800, color: TEXT, flexShrink: 0 }}>₹{e.amount.toLocaleString('en-IN')}</span>
                  <button onClick={() => deleteExpense(e.id)} style={{ color: MUTED, fontSize: 20, lineHeight: 1, padding: '0 4px', cursor: 'pointer' }}>×</button>
                </div>
              ))}
            </div>
          )}

          {thisMonth.length === 0 && (
            <div style={{ textAlign: 'center', padding: '32px 16px' }}>
              <span className="ms" style={{ color: 'rgba(212,168,75,0.2)', fontSize: 40, display: 'block', marginBottom: 12 }}>receipt_long</span>
              <p style={{ fontSize: 14, fontWeight: 600, color: MUTED }}>No expenses this month</p>
              <p style={{ fontSize: 12, color: MUTED, marginTop: 4, opacity: 0.6 }}>Tap above to log your first one</p>
            </div>
          )}
        </>
      )}

      {/* ── BUDGET TAB ─────────────────────────────────── */}
      {tab === 'budget' && (
        <>
          {budgetBreakdown ? (
            <>
              {/* AI estimate hero */}
              <div style={{
                margin: '0 16px 12px',
                background: 'linear-gradient(135deg, #1E1408 0%, #2A1C08 60%, rgba(212,168,75,0.15) 100%)',
                borderRadius: 20, padding: 20,
                border: '1px solid rgba(212,168,75,0.2)',
              }}>
                <p style={{ fontSize: 10, fontWeight: 700, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>
                  AI Budget Estimate
                </p>
                <p style={{ fontSize: 32, fontWeight: 800, color: TEXT, letterSpacing: '-1px', lineHeight: 1 }}>
                  ₹{budgetBreakdown.total.toLocaleString('en-IN')}
                </p>
                <p style={{ fontSize: 12, color: MUTED, marginTop: 4 }}>Estimated monthly spend</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginTop: 16 }}>
                  {[
                    { label: 'Gym',   val: budgetBreakdown.gym,         color: AZURE  },
                    { label: 'Supps', val: budgetBreakdown.supplements, color: COPPER },
                    { label: 'Food',  val: budgetBreakdown.food,        color: SAGE   },
                  ].map(({ label, val, color }) => (
                    <div key={label} style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 14, padding: '10px 8px', textAlign: 'center', border: `1px solid ${BORDER}` }}>
                      <p style={{ fontSize: 15, fontWeight: 800, color }}>{val ? `₹${val.toLocaleString('en-IN')}` : '—'}</p>
                      <p style={{ fontSize: 10, color: MUTED, marginTop: 4 }}>{label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI notes */}
              {budgetBreakdown.notes && (
                <div style={{ margin: '0 16px 12px', background: 'rgba(212,168,75,0.06)', borderRadius: 16, padding: '14px 16px', border: '1px solid rgba(212,168,75,0.15)' }}>
                  <p style={{ fontSize: 13, color: TEXT, lineHeight: 1.6, display: 'flex', gap: 8 }}>
                    <span className="ms ms-sm" style={{ color: GOLD, fontSize: 16, flexShrink: 0 }}>lightbulb</span>
                    {budgetBreakdown.notes}
                  </p>
                </div>
              )}

              {/* Item breakdown */}
              <div style={{ margin: '0 16px 12px', background: CARD, borderRadius: 20, padding: 18, border: `1px solid ${BORDER}` }}>
                <p style={{ fontSize: 10, fontWeight: 700, color: MUTED, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 14 }}>
                  Item Breakdown
                </p>
                {budgetBreakdown.items.map((item: any, i: number, arr: any[]) => (
                  <div key={i} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                    paddingTop: 10, paddingBottom: 10,
                    borderBottom: i < arr.length - 1 ? `1px solid ${BORDER}` : 'none',
                  }}>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: TEXT }}>{item.name}</p>
                      <p style={{ fontSize: 11, color: MUTED, marginTop: 3 }}>{item.monthly_qty}</p>
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 800, color: TEXT, marginLeft: 12 }}>
                      ₹{item.estimated_price.toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>

              {/* Refresh button */}
              <div style={{ padding: '0 16px 12px' }}>
                <button onClick={handleRefreshBudget} disabled={refreshingBudget} style={{
                  width: '100%', background: 'transparent', fontWeight: 700, fontSize: 13,
                  padding: '14px 0', borderRadius: 14, cursor: 'pointer',
                  color: refreshingBudget ? MUTED : GOLD,
                  border: `1px solid ${refreshingBudget ? BORDER : 'rgba(212,168,75,0.3)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  transition: 'all 0.2s',
                }}>
                  <span className="ms ms-sm" style={{ fontSize: 16 }}>{refreshingBudget ? 'hourglass_empty' : 'refresh'}</span>
                  {refreshingBudget ? 'Searching…' : 'Refresh with live prices'}
                </button>
                <p style={{ fontSize: 11, color: MUTED, textAlign: 'center', marginTop: 8 }}>
                  Uses web search for current BigBasket / Amazon prices
                </p>
                {budgetBreakdown.last_updated && (
                  <p style={{ fontSize: 10, color: MUTED, textAlign: 'center', marginTop: 4, opacity: 0.6 }}>
                    Last updated: {new Date(budgetBreakdown.last_updated).toLocaleDateString('en-IN')}
                  </p>
                )}
              </div>

              {/* vs your budget */}
              <div style={{ margin: '0 16px 16px', background: CARD, borderRadius: 20, padding: 18, border: `1px solid ${BORDER}` }}>
                <p style={{ fontSize: 10, fontWeight: 700, color: MUTED, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 14 }}>
                  vs Your Budget
                </p>
                {[
                  { label: 'Your budget',      val: `₹${monthlyBudget.toLocaleString('en-IN')}`, color: TEXT },
                  { label: 'Estimated spend',  val: `₹${budgetBreakdown.total.toLocaleString('en-IN')}`, color: TEXT },
                ].map(({ label, val, color }, i) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10, paddingBottom: 10, borderBottom: `1px solid ${BORDER}` }}>
                    <span style={{ fontSize: 13, color: MUTED }}>{label}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color }}>{val}</span>
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12 }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: TEXT }}>Difference</span>
                  <span style={{ fontSize: 14, fontWeight: 800, color: monthlyBudget >= budgetBreakdown.total ? GOLD : DANGER }}>
                    {monthlyBudget >= budgetBreakdown.total ? '+' : ''}₹{(monthlyBudget - budgetBreakdown.total).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '60px 24px' }}>
              <span className="ms" style={{ color: 'rgba(212,168,75,0.2)', fontSize: 44, display: 'block', marginBottom: 14 }}>account_balance_wallet</span>
              <p style={{ fontSize: 15, fontWeight: 700, color: MUTED }}>No budget estimate yet</p>
              <p style={{ fontSize: 13, color: MUTED, marginTop: 6, lineHeight: 1.6, opacity: 0.7 }}>
                Complete your profile with a monthly budget to get an AI estimate
              </p>
            </div>
          )}
        </>
      )}
    </div>
  )
}
