import { create } from 'zustand'
import type { User } from '@supabase/supabase-js'
import type { Profile, AIPlan, WeightEntry, Expense, WorkoutDone, FoodLog } from '../types'
import { sb } from '../lib/supabase'
import { generateAIPlan, calcMacros } from '../lib/gemini'
import { estimateBudgetAI } from '../lib/aiFood'

interface AppState {
  user: User | null
  profile: Profile | null
  plan: AIPlan | null
  weightLog: WeightEntry[]
  workoutDone: WorkoutDone
  expenses: Expense[]
  foodLogs: FoodLog[]
  startDate: string | null
  selectedDay: number
  loading: boolean
  generatingPlan: boolean
  setUser: (user: User | null) => void
  setSelectedDay: (day: number) => void
  setLoading: (v: boolean) => void
  loadUserData: (userId: string) => Promise<void>
  logWeight: (weight: number) => Promise<void>
  toggleExercise: (date: string, index: number) => Promise<void>
  addExpense: (expense: Omit<Expense, 'id'>) => Promise<void>
  deleteExpense: (id: string) => Promise<void>
  saveProfile: (profile: Profile) => Promise<void>
  regeneratePlan: () => Promise<void>
  addFoodLog: (log: Omit<FoodLog, 'id'>) => Promise<void>
  deleteFoodLog: (id: string) => Promise<void>
  loadFoodLogs: (date: string) => Promise<void>
  signOut: () => Promise<void>
  deactivateAccount: () => Promise<void>
  restoreAccount: () => Promise<void>
}

export const useStore = create<AppState>((set, get) => ({
  user: null, profile: null, plan: null, weightLog: [], workoutDone: {},
  expenses: [], foodLogs: [], startDate: null,
  selectedDay: new Date().getDay(), loading: true, generatingPlan: false,

  setUser: (user) => set({ user }),
  setSelectedDay: (day) => set({ selectedDay: day }),
  setLoading: (v) => set({ loading: v }),

  loadUserData: async (userId) => {
    try {

      const { data: profileData, error: profileError } = await sb
        .from('profiles').select('*').eq('user_id', userId).single()

      if (profileData) {
        const profile: Profile = {
          id: profileData.id, user_id: profileData.user_id,
          name: profileData.name, age: profileData.age, gender: profileData.gender,
          weight: profileData.weight, height: profileData.height,
          activity_level: profileData.activity_level, goal: profileData.goal,
          sport: profileData.sport, sport_frequency: profileData.sport_frequency,
          injuries: profileData.injuries, wake_time: profileData.wake_time,
          sleep_time: profileData.sleep_time, gym_access: profileData.gym_access,
          diet_type: profileData.diet_type, monthly_budget: profileData.monthly_budget,
          deactivated: profileData.deactivated, deactivated_at: profileData.deactivated_at,
          body_type: profileData.body_type,
        }
        set({ profile })
        const { data: planData, error: planError } = await sb
          .from('ai_plans').select('plan').eq('user_id', userId).single()

        if (planData?.plan) {
          set({ plan: planData.plan as AIPlan })
        } else {
          set({ generatingPlan: true });
          (async () => {
            try {
              const plan = await generateAIPlan(profile)
              if (profile.monthly_budget) {
                plan.budgetBreakdown = await estimateBudgetAI(profile, profile.monthly_budget)
              }
              await sb.from('ai_plans').upsert(
                { user_id: userId, plan, updated_at: new Date().toISOString() },
                { onConflict: 'user_id' }
              )
              set({ plan })
            } catch (e) {
            } finally {
              set({ generatingPlan: false })
            }
          })()
        }
      }
      const since = new Date(); since.setDate(since.getDate() - 60)
      const [wlRes, wdRes, expRes, flRes] = await Promise.all([
        sb.from('weight_log').select('*').eq('user_id', userId).order('date'),
        sb.from('workout_done').select('*').eq('user_id', userId).gte('date', since.toISOString().split('T')[0]),
        sb.from('expenses').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
        sb.from('food_logs').select('*').eq('user_id', userId).eq('date', new Date().toISOString().split('T')[0]).order('logged_at'),
      ])

      const weightLog: WeightEntry[] = (wlRes.data || []).map((r: any) => ({ date: r.date, weight: parseFloat(r.weight) }))
      const workoutDone: WorkoutDone = {}
      ;(wdRes.data || []).forEach((r: any) => {
        const key = 'wd_' + r.date
        if (!workoutDone[key]) workoutDone[key] = {}
        workoutDone[key][r.exercise_index] = r.done
      })
      const expenses: Expense[] = (expRes.data || []).map((r: any) => ({
        id: r.id, name: r.name, amount: parseFloat(r.amount),
        cat: r.category, month: r.month, date: r.expense_date,
      }))
      const foodLogs: FoodLog[] = (flRes.data || []).map((r: any) => ({
        id: r.id, date: r.date, meal_slot: r.meal_slot,
        food_name: r.food_name, serving_label: r.serving_label,
        serving_grams: r.serving_grams, calories: parseFloat(r.calories),
        protein: parseFloat(r.protein), carbs: parseFloat(r.carbs),
        fat: parseFloat(r.fat), quantity: r.quantity || 1,
      }))
      const startDate = weightLog.length > 0 ? weightLog[0].date : new Date().toISOString().split('T')[0]
      set({ weightLog, workoutDone, expenses, foodLogs, startDate, loading: false })

    } catch (e) {
      set({ loading: false })
    }
  },

  loadFoodLogs: async (date) => {
    const { user } = get(); if (!user) return
    const { data: fl } = await sb.from('food_logs').select('*').eq('user_id', user.id).eq('date', date).order('logged_at')
    const foodLogs: FoodLog[] = (fl || []).map((r: any) => ({
      id: r.id, date: r.date, meal_slot: r.meal_slot, food_name: r.food_name,
      serving_label: r.serving_label, serving_grams: r.serving_grams,
      calories: parseFloat(r.calories), protein: parseFloat(r.protein),
      carbs: parseFloat(r.carbs), fat: parseFloat(r.fat), quantity: r.quantity || 1,
    }))
    set({ foodLogs })
  },

  saveProfile: async (profile) => {
    const { user } = get(); if (!user) return
    const { error: saveError } = await sb.from('profiles').upsert({
      user_id: user.id, name: profile.name, age: profile.age, gender: profile.gender,
      weight: profile.weight, height: profile.height, activity_level: profile.activity_level,
      goal: profile.goal, sport: profile.sport || 'none',
      sport_frequency: profile.sport_frequency || null, injuries: profile.injuries || 'none',
      wake_time: profile.wake_time || '06:00', sleep_time: profile.sleep_time || '22:30',
      gym_access: profile.gym_access || 'full_gym', diet_type: profile.diet_type || 'non_vegetarian',
      monthly_budget: profile.monthly_budget || 5000, deactivated: false, deactivated_at: null,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' })
    if (saveError) {
      throw new Error(saveError.message)
    }
    set({ profile, generatingPlan: true });
    (async () => {
      try {
        const plan = await generateAIPlan(profile)
        if (profile.monthly_budget) plan.budgetBreakdown = await estimateBudgetAI(profile, profile.monthly_budget)
        await sb.from('ai_plans').upsert({ user_id: user.id, plan, updated_at: new Date().toISOString() }, { onConflict: 'user_id' })
        set({ plan })
      } catch (e) {
 }
      finally { set({ generatingPlan: false }) }
    })()
  },

  regeneratePlan: async () => {
    const { user, profile } = get(); if (!user || !profile) return
    set({ generatingPlan: true });
    (async () => {
      try {
        const plan = await generateAIPlan(profile)
        if (profile.monthly_budget) plan.budgetBreakdown = await estimateBudgetAI(profile, profile.monthly_budget)
        await sb.from('ai_plans').upsert({ user_id: user.id, plan, updated_at: new Date().toISOString() }, { onConflict: 'user_id' })
        set({ plan })
      } catch (e) {
 }
      finally { set({ generatingPlan: false }) }
    })()
  },

  logWeight: async (weight) => {
    const { user, weightLog, profile, plan } = get(); if (!user) return
    const date = new Date().toISOString().split('T')[0]
    await sb.from('weight_log').upsert({ user_id: user.id, date, weight }, { onConflict: 'user_id,date' })
    const updated = [...weightLog.filter(e => e.date !== date), { date, weight }].sort((a, b) => a.date.localeCompare(b.date))
    set({ weightLog: updated, startDate: updated[0]?.date ?? date })

    // Update profile weight and recalculate macros if weight changed by more than 1kg
    if (profile && plan && Math.abs(weight - profile.weight) >= 1) {
      const updatedProfile = { ...profile, weight }

      // Update profile in DB
      await sb.from('profiles').update({ weight, updated_at: new Date().toISOString() }).eq('user_id', user.id)
      set({ profile: updatedProfile })

      // Recalculate macros with new weight
      if (calcMacros) {
        const newMacros = calcMacros(updatedProfile)
        const updatedPlan = {
          ...plan,
          bmr: newMacros.bmr,
          tdee: newMacros.tdee,
          calories: newMacros.calories,
          protein: newMacros.protein,
          carbs: newMacros.carbs,
          fat: newMacros.fat,
          bmi: newMacros.bmi,
          bmiCat: newMacros.bmiCat,
          weightTarget: newMacros.weightTarget,
        }
        await sb.from('ai_plans').update({ plan: updatedPlan, updated_at: new Date().toISOString() }).eq('user_id', user.id)
        set({ plan: updatedPlan })
      }
    }
  },

  toggleExercise: async (date, index) => {
    const { user, workoutDone } = get(); if (!user) return
    const key = 'wd_' + date
    const newVal = !(workoutDone[key]?.[index] ?? false)
    set({ workoutDone: { ...workoutDone, [key]: { ...(workoutDone[key] || {}), [index]: newVal } } })
    await sb.from('workout_done').upsert({ user_id: user.id, date, exercise_index: index, done: newVal }, { onConflict: 'user_id,date,exercise_index' })
  },

  addExpense: async (expense) => {
    const { user, expenses } = get(); if (!user) return
    const { data } = await sb.from('expenses').insert({
      user_id: user.id, name: expense.name, amount: expense.amount,
      category: expense.cat, month: expense.month, expense_date: expense.date,
    }).select().single()
    if (data) set({ expenses: [{ ...expense, id: data.id }, ...expenses] })
  },

  deleteExpense: async (id) => {
    const { user, expenses } = get(); if (!user) return
    await sb.from('expenses').delete().eq('id', id).eq('user_id', user.id)
    set({ expenses: expenses.filter(e => e.id !== id) })
  },

  addFoodLog: async (log) => {
    const { user, foodLogs } = get(); if (!user) return
    const { data } = await sb.from('food_logs').insert({
      user_id: user.id, date: log.date, meal_slot: log.meal_slot,
      food_name: log.food_name, serving_label: log.serving_label,
      serving_grams: log.serving_grams, calories: log.calories,
      protein: log.protein, carbs: log.carbs, fat: log.fat, quantity: log.quantity || 1,
    }).select().single()
    if (data) set({ foodLogs: [...foodLogs, { ...log, id: data.id }] })
  },

  deleteFoodLog: async (id) => {
    const { user, foodLogs } = get(); if (!user) return
    await sb.from('food_logs').delete().eq('id', id).eq('user_id', user.id)
    set({ foodLogs: foodLogs.filter(f => f.id !== id) })
  },

  deactivateAccount: async () => {
    const { user } = get(); if (!user) return
    await sb.from('profiles').update({ deactivated: true, deactivated_at: new Date().toISOString() }).eq('user_id', user.id)
    await sb.auth.signOut()
    set({ user: null, profile: null, plan: null, weightLog: [], workoutDone: {}, expenses: [], foodLogs: [], startDate: null })
  },

  restoreAccount: async () => {
    const { user } = get(); if (!user) return
    await sb.from('profiles').update({ deactivated: false, deactivated_at: null }).eq('user_id', user.id)
    await get().loadUserData(user.id)
  },

  signOut: async () => {
    await sb.auth.signOut()
    set({ user: null, profile: null, plan: null, weightLog: [], workoutDone: {}, expenses: [], foodLogs: [], startDate: null })
  },
}))
