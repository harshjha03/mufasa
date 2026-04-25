import { useState } from 'react'
import { useStore } from '../store/useStore'
import { BUDGET_CATS } from '../lib/data'
import { refreshBudgetPricesAI } from '../lib/aiFood'
import type { Expense } from '../types'

const CAT_OPTIONS = [
  { value: 'supplement', label: 'Supplement' },
  { value: 'food', label: 'Food' },
  { value: 'gym', label: 'Gym' },
  { value: 'other', label: 'Other' },
] as const

export default function ExpensesScreen() {
  const { expenses, addExpense, deleteExpense, plan, profile } = useStore()
  const [name, setName] = useState('')
  const [amount, setAmount] = useState('')
  const [cat, setCat] = useState<Expense['cat']>('supplement')
  const [refreshingBudget, setRefreshingBudget] = useState(false)
  const [tab, setTab] = useState<'tracker' | 'budget'>('tracker')

  const month = new Date().toISOString().slice(0, 7)
  const thisMonth = expenses.filter(e => e.month === month)
  const total = thisMonth.reduce((s, e) => s + e.amount, 0)
  const monthlyBudget = profile?.monthly_budget ?? 5000
  const budgetBreakdown = plan?.budgetBreakdown

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
      // Update plan in store — for now just show the result
      alert(`Budget refreshed! Est. total: ₹${breakdown.total.toLocaleString('en-IN')}`)
    } finally {
      setRefreshingBudget(false)
    }
  }

  return (
    <div className="pb-24">
      <div className="px-4 pt-12 pb-3">
        <h1 className="font-serif text-3xl font-bold text-ink">Expenses</h1>
        <div className="flex gap-1 bg-cream-2 p-1 rounded-xl mt-3">
          {([['tracker', '📊 Tracker'], ['budget', '💡 Budget']] as const).map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${tab === id ? 'bg-white text-ink shadow-sm' : 'text-ink/40'}`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── TRACKER TAB ── */}
      {tab === 'tracker' && (
        <>
          {/* Summary */}
          <div className="grid grid-cols-2 gap-3 mx-4 mb-3">
            <div className="bg-white rounded-xl shadow-card p-4">
              <p className={`text-2xl font-extrabold leading-none ${total > monthlyBudget ? 'text-danger' : 'text-ink'}`}>₹{Math.round(total).toLocaleString('en-IN')}</p>
              <p className="text-xs font-bold tracking-wide text-ink/30 uppercase mt-1">Spent</p>
              <p className="text-xs text-ink/30 mt-0.5">This month</p>
            </div>
            <div className="bg-white rounded-xl shadow-card p-4">
              <p className={`text-2xl font-extrabold leading-none ${total <= monthlyBudget ? 'text-teal' : 'text-danger'}`}>
                ₹{Math.round(Math.max(0, monthlyBudget - total)).toLocaleString('en-IN')}
              </p>
              <p className="text-xs font-bold tracking-wide text-ink/30 uppercase mt-1">Remaining</p>
              <p className="text-xs text-ink/30 mt-0.5">of ₹{monthlyBudget.toLocaleString('en-IN')}</p>
            </div>
          </div>

          {/* Overall budget bar */}
          <div className="bg-white rounded-card shadow-card mx-4 mb-3 p-4">
            <div className="flex justify-between text-sm font-semibold text-ink mb-2">
              <span>Monthly budget</span>
              <span className={total > monthlyBudget ? 'text-danger' : 'text-teal'}>
                {Math.round(total / monthlyBudget * 100)}%
              </span>
            </div>
            <div className="bg-cream-2 rounded-full h-3 overflow-hidden">
              <div className={`h-full rounded-full transition-all duration-500 ${total > monthlyBudget ? 'bg-danger' : total > monthlyBudget * 0.8 ? 'bg-gold' : 'bg-teal'}`}
                style={{ width: `${Math.min(100, total / monthlyBudget * 100)}%` }} />
            </div>
            <div className="flex justify-between text-xs text-ink/30 mt-1">
              <span>₹0</span><span>₹{monthlyBudget.toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* Category bars */}
          <div className="bg-white rounded-card shadow-card mx-4 mb-3 p-5">
            <p className="text-xs font-bold tracking-widest text-ink/30 uppercase mb-4">By Category</p>
            {Object.entries(BUDGET_CATS).map(([key, info]) => {
              const catTotal = thisMonth.filter(e => e.cat === key).reduce((s, e) => s + e.amount, 0)
              const pct = Math.min(100, info.max ? catTotal / info.max * 100 : 0)
              return (
                <div key={key} className="mb-4 last:mb-0">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="flex items-center gap-2 text-sm font-semibold text-ink">
                      <span className="w-2 h-2 rounded-full" style={{ background: info.color }} />
                      {info.label}
                    </span>
                    <span className="text-xs font-bold text-ink/50">₹{Math.round(catTotal).toLocaleString('en-IN')} / ₹{info.max.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="bg-cream-2 rounded-full h-2 overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: pct > 90 ? '#AE2012' : info.color }} />
                  </div>
                </div>
              )
            })}
          </div>

          {/* Add expense */}
          <div className="bg-white rounded-card shadow-card mx-4 mb-3 p-5">
            <p className="text-xs font-bold tracking-widest text-ink/30 uppercase mb-3">Add Expense</p>
            <input className="w-full bg-cream border-2 border-cream-3 focus:border-teal text-ink text-sm px-4 py-3 rounded-xl outline-none mb-2.5 transition-colors"
              placeholder="Item name (e.g. Whey protein)" value={name} onChange={e => setName(e.target.value)} />
            <div className="grid grid-cols-2 gap-2.5 mb-2.5">
              <input className="bg-cream border-2 border-cream-3 focus:border-teal text-ink text-sm px-4 py-3 rounded-xl outline-none transition-colors"
                type="number" placeholder="₹ Amount" value={amount} onChange={e => setAmount(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAdd()} />
              <select className="bg-cream border-2 border-cream-3 focus:border-teal text-ink text-sm px-4 py-3 rounded-xl outline-none transition-colors"
                value={cat} onChange={e => setCat(e.target.value as Expense['cat'])}>
                {CAT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <button onClick={handleAdd} className="w-full bg-teal text-white font-bold text-sm py-3 rounded-xl active:opacity-80">Add Expense</button>
          </div>

          {/* Entries */}
          {thisMonth.length > 0 && (
            <div className="bg-white rounded-card shadow-card mx-4 mb-3 overflow-hidden">
              {thisMonth.map(e => (
                <div key={e.id} className="flex items-center gap-3 px-4 py-3.5 border-b border-cream-2 last:border-0">
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: BUDGET_CATS[e.cat]?.color }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-ink truncate">{e.name}</p>
                    <p className="text-xs text-ink/40 mt-0.5">{e.date} · {BUDGET_CATS[e.cat]?.label}</p>
                  </div>
                  <span className="text-base font-extrabold text-ink">₹{e.amount.toLocaleString('en-IN')}</span>
                  <button onClick={() => deleteExpense(e.id)} className="text-ink/20 hover:text-danger text-xl px-1 transition-colors">×</button>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ── BUDGET TAB ── */}
      {tab === 'budget' && (
        <>
          {/* AI Budget breakdown */}
          {budgetBreakdown ? (
            <>
              <div className="mx-4 mb-3 rounded-card p-5 text-white" style={{ background: 'linear-gradient(135deg, #2D3561, #005F73)' }}>
                <p className="text-xs font-bold tracking-widest opacity-60 uppercase mb-2">AI Budget Estimate</p>
                <p className="text-3xl font-extrabold">₹{budgetBreakdown.total.toLocaleString('en-IN')}</p>
                <p className="text-xs opacity-50 mt-1">Estimated monthly spend</p>
                <div className="grid grid-cols-3 gap-2 mt-4">
                  {[
                    { label: 'Gym', val: budgetBreakdown.gym },
                    { label: 'Supps', val: budgetBreakdown.supplements },
                    { label: 'Food', val: budgetBreakdown.food },
                  ].map(({ label, val }) => (
                    <div key={label} className="bg-white/10 rounded-xl p-2.5 text-center">
                      <p className="text-base font-extrabold">₹{val.toLocaleString('en-IN')}</p>
                      <p className="text-xs opacity-50 mt-1">{label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Notes */}
              {budgetBreakdown.notes && (
                <div className="mx-4 mb-3 bg-cream-2 rounded-xl p-4">
                  <p className="text-sm text-ink/70 leading-relaxed">💡 {budgetBreakdown.notes}</p>
                </div>
              )}

              {/* Item breakdown */}
              <div className="bg-white rounded-card shadow-card mx-4 mb-3 p-5">
                <p className="text-xs font-bold tracking-widest text-ink/30 uppercase mb-3">Item Breakdown</p>
                {budgetBreakdown.items.map((item, i) => (
                  <div key={i} className="flex justify-between items-center py-2.5 border-b border-cream-2 last:border-0">
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-ink">{item.name}</p>
                      <p className="text-xs text-ink/40 mt-0.5">{item.monthly_qty}</p>
                    </div>
                    <span className="text-sm font-bold text-ink ml-3">₹{item.estimated_price.toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>

              {/* Refresh prices button */}
              <div className="mx-4 mb-3">
                <button onClick={handleRefreshBudget} disabled={refreshingBudget}
                  className="w-full bg-white border-2 border-teal text-teal font-bold text-sm py-3.5 rounded-xl active:opacity-80 disabled:opacity-50 transition-all">
                  {refreshingBudget ? '🔍 Searching live prices...' : '🔄 Refresh with live prices'}
                </button>
                <p className="text-xs text-ink/30 text-center mt-2">Uses web search for current BigBasket / Amazon prices</p>
                {budgetBreakdown.last_updated && (
                  <p className="text-xs text-ink/20 text-center mt-1">Last updated: {new Date(budgetBreakdown.last_updated).toLocaleDateString('en-IN')}</p>
                )}
              </div>

              {/* vs your budget */}
              <div className="bg-white rounded-card shadow-card mx-4 mb-3 p-5">
                <p className="text-xs font-bold tracking-widest text-ink/30 uppercase mb-3">vs Your Budget</p>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-ink/60">Your budget</span>
                  <span className="text-sm font-bold text-ink">₹{monthlyBudget.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-ink/60">Estimated spend</span>
                  <span className="text-sm font-bold text-ink">₹{budgetBreakdown.total.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-cream-2">
                  <span className="text-sm font-bold text-ink">Difference</span>
                  <span className={`text-sm font-bold ${monthlyBudget >= budgetBreakdown.total ? 'text-teal' : 'text-danger'}`}>
                    {monthlyBudget >= budgetBreakdown.total ? '+' : ''}₹{(monthlyBudget - budgetBreakdown.total).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-16 px-4">
              <p className="text-4xl mb-3">💰</p>
              <p className="text-sm font-semibold text-ink/50">No budget estimate yet</p>
              <p className="text-xs text-ink/30 mt-1">Complete your profile with a monthly budget to get an AI estimate</p>
            </div>
          )}
        </>
      )}
    </div>
  )
}
