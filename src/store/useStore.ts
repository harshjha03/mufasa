import { create } from 'zustand'
import type { User } from '@supabase/supabase-js'
import type { Profile, AIPlan, WeightEntry, Expense, WorkoutDone, FoodLog, PersonalRecord } from '../types'
import { sb } from '../lib/supabase'
import { generateAIPlan, calcMacros } from '../lib/gemini'
import { DEMO_PROFILE, DEMO_PLAN, DEMO_WEIGHT_LOG, DEMO_PRS, DEMO_EXPENSES } from '../lib/demoData'

const ANON_PROFILE_KEY = 'mufasa_anon_profile'
const ANON_PLAN_KEY    = 'mufasa_anon_plan'

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
  prs: Record<string, PersonalRecord>
  showAuthModal: boolean
  showProfileUpgradePrompt: boolean
  isDemo: boolean
  setUser: (user: User | null) => void
  setSelectedDay: (day: number) => void
  setLoading: (v: boolean) => void
  setShowAuthModal: (v: boolean) => void
  setShowProfileUpgradePrompt: (v: boolean) => void
  loadDemoData: () => void
  exitDemo: () => void
  loadAnonData: () => void
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
  logPR: (exerciseName: string, weight: number, reps: number) => boolean
  signOut: () => Promise<void>
  deactivateAccount: () => Promise<void>
  restoreAccount: () => Promise<void>
}

export const useStore = create<AppState>((set, get) => ({
  user: null, profile: null, plan: null, weightLog: [], workoutDone: {},
  expenses: [], foodLogs: [], startDate: null,
  selectedDay: new Date().getDay(), loading: true, generatingPlan: false,
  showAuthModal: false,
  showProfileUpgradePrompt: false,
  isDemo: false,
  prs: JSON.parse(localStorage.getItem('mufasa_prs') || '{}'),

  setUser: (user) => set({ user }),
  setSelectedDay: (day) => set({ selectedDay: day }),
  setLoading: (v) => set({ loading: v }),
  setShowAuthModal: (v) => set({ showAuthModal: v }),
  setShowProfileUpgradePrompt: (v) => set({ showProfileUpgradePrompt: v }),

  loadDemoData: () => {
    const d = (offset: number) => {
      const date = new Date()
      date.setDate(date.getDate() - offset)
      return date.toISOString().split('T')[0]
    }
    const today = d(0)

    // Simulate recent workout completions (all 5 exercises per day)
    const workoutDone: WorkoutDone = {
      ['wd_' + today]:  { 0: true, 1: true, 2: false, 3: false, 4: false },
      ['wd_' + d(3)]:   { 0: true, 1: true, 2: true, 3: true, 4: true },
      ['wd_' + d(5)]:   { 0: true, 1: true, 2: true, 3: true, 4: true },
      ['wd_' + d(7)]:   { 0: true, 1: true, 2: true, 3: true, 4: false },
      ['wd_' + d(10)]:  { 0: true, 1: true, 2: true, 3: true, 4: true },
      ['wd_' + d(12)]:  { 0: true, 1: true, 2: true, 3: false, 4: false },
      ['wd_' + d(14)]:  { 0: true, 1: true, 2: true, 3: true, 4: true },
    }

    const foodLogs: FoodLog[] = [
      { id: 'demo_fl1', date: today, meal_slot: 'breakfast', food_name: '4 whole eggs + 2 slices brown bread', serving_label: '1 serving', calories: 480, protein: 32, carbs: 38, fat: 18, quantity: 1 },
      { id: 'demo_fl2', date: today, meal_slot: 'lunch',     food_name: 'Dal tadka + brown rice + cucumber salad', serving_label: '1 serving', calories: 520, protein: 18, carbs: 78, fat: 8,  quantity: 1 },
      { id: 'demo_fl3', date: today, meal_slot: 'snack',     food_name: 'Whey protein shake + 1 apple', serving_label: '1 scoop + 1 medium', calories: 200, protein: 30, carbs: 20, fat: 2, quantity: 1 },
    ]

    set({
      profile: DEMO_PROFILE,
      plan: DEMO_PLAN,
      weightLog: DEMO_WEIGHT_LOG,
      prs: DEMO_PRS,
      expenses: DEMO_EXPENSES,
      startDate: DEMO_WEIGHT_LOG[0].date,
      workoutDone,
      foodLogs,
      isDemo: true,
      loading: false,
    })
  },

  exitDemo: () => set({
    profile: null, plan: null, weightLog: [], prs: {}, startDate: null,
    workoutDone: {}, foodLogs: [], isDemo: false,
  }),

  loadAnonData: () => {
    try {
      const profile: Profile | null = JSON.parse(localStorage.getItem(ANON_PROFILE_KEY) || 'null')
      const plan: AIPlan | null     = JSON.parse(localStorage.getItem(ANON_PLAN_KEY) || 'null')
      set({ profile, plan })
    } catch {}
  },

  loadUserData: async (userId) => {
    try {
      const { data: profileData } = await sb
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
        // Clear anonymous data since we have a real profile
        localStorage.removeItem(ANON_PROFILE_KEY)
        localStorage.removeItem(ANON_PLAN_KEY)

        const { data: planData } = await sb
          .from('ai_plans').select('plan').eq('user_id', userId).single()

        if (planData?.plan) {
          set({ plan: planData.plan as AIPlan })
        } else {
          set({ generatingPlan: true });
          (async () => {
            try {
              const plan = await generateAIPlan(profile)
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
      } else {
        // No Supabase profile — sync anon data to DB then prompt for missing details
        const anonProfile: Profile | null = (() => {
          try { return JSON.parse(localStorage.getItem(ANON_PROFILE_KEY) || 'null') } catch { return null }
        })()
        const anonPlan: AIPlan | null = (() => {
          try { return JSON.parse(localStorage.getItem(ANON_PLAN_KEY) || 'null') } catch { return null }
        })()
        if (anonProfile) {
          set({ profile: anonProfile })
          if (anonPlan) set({ plan: anonPlan })
          // Fire-and-forget sync — don't block loading
          Promise.all([
            sb.from('profiles').upsert({
              user_id: userId, name: anonProfile.name, age: anonProfile.age, gender: anonProfile.gender,
              weight: anonProfile.weight, height: anonProfile.height,
              activity_level: anonProfile.activity_level, goal: anonProfile.goal,
              sport: anonProfile.sport || 'none', injuries: anonProfile.injuries || 'none',
              wake_time: anonProfile.wake_time || '06:00', sleep_time: anonProfile.sleep_time || '22:30',
              gym_access: anonProfile.gym_access || 'home', diet_type: anonProfile.diet_type || 'non_vegetarian',
              deactivated: false, updated_at: new Date().toISOString(),
            }, { onConflict: 'user_id' }),
            anonPlan
              ? sb.from('ai_plans').upsert({ user_id: userId, plan: anonPlan, updated_at: new Date().toISOString() }, { onConflict: 'user_id' })
              : Promise.resolve(),
          ])
          localStorage.removeItem(ANON_PROFILE_KEY)
          localStorage.removeItem(ANON_PLAN_KEY)
          set({ showProfileUpgradePrompt: true })
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
        fat: parseFloat(r.fat), quantity: 1,
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
      carbs: parseFloat(r.carbs), fat: parseFloat(r.fat), quantity: 1,
    }))
    set({ foodLogs })
  },

  saveProfile: async (profile) => {
    const { user } = get()

    if (!user) {
      // Anonymous: fill sensible defaults for missing fields, save to localStorage
      const filled: Profile = {
        weight: profile.gender === 'female' ? 58 : 70,
        height: profile.gender === 'female' ? 163 : 175,
        activity_level: 'moderate',
        goal: 'recomp',
        diet_type: 'non_vegetarian',
        gym_access: 'home',
        sport: 'none',
        injuries: 'none',
        wake_time: '06:00',
        sleep_time: '22:30',
        ...profile,
      } as Profile
      localStorage.setItem(ANON_PROFILE_KEY, JSON.stringify(filled))
      set({ profile: filled, generatingPlan: true })
      ;(async () => {
        try {
          const plan = await generateAIPlan(filled)
          localStorage.setItem(ANON_PLAN_KEY, JSON.stringify(plan))
          set({ plan })
        } catch (e) {}
        finally { set({ generatingPlan: false }) }
      })()
      return
    }

    // Logged-in: save to Supabase
    const { error: saveError } = await sb.from('profiles').upsert({
      user_id: user.id, name: profile.name, age: profile.age, gender: profile.gender,
      weight: profile.weight, height: profile.height, activity_level: profile.activity_level,
      goal: profile.goal, sport: profile.sport || 'none',
      sport_frequency: profile.sport_frequency || null, injuries: profile.injuries || 'none',
      wake_time: profile.wake_time || '06:00', sleep_time: profile.sleep_time || '22:30',
      gym_access: profile.gym_access || 'full_gym', diet_type: profile.diet_type || 'non_vegetarian',
      deactivated: false, deactivated_at: null,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' })
    if (saveError) {
      throw new Error(saveError.message)
    }
    // Clear anonymous data
    localStorage.removeItem(ANON_PROFILE_KEY)
    localStorage.removeItem(ANON_PLAN_KEY)
    set({ profile, generatingPlan: true });
    (async () => {
      try {
        const plan = await generateAIPlan(profile)
        await sb.from('ai_plans').upsert({ user_id: user.id, plan, updated_at: new Date().toISOString() }, { onConflict: 'user_id' })
        set({ plan })
      } catch (e) {}
      finally { set({ generatingPlan: false }) }
    })()
  },

  regeneratePlan: async () => {
    const { user, profile } = get(); if (!profile) return
    set({ generatingPlan: true });
    (async () => {
      try {
        const plan = await generateAIPlan(profile)
        if (user) {
          await sb.from('ai_plans').upsert({ user_id: user.id, plan, updated_at: new Date().toISOString() }, { onConflict: 'user_id' })
        } else {
          localStorage.setItem(ANON_PLAN_KEY, JSON.stringify(plan))
        }
        set({ plan })
      } catch (e) {}
      finally { set({ generatingPlan: false }) }
    })()
  },

  logWeight: async (weight) => {
    const { user, weightLog, profile, plan } = get(); if (!user) return
    const date = new Date().toISOString().split('T')[0]
    await sb.from('weight_log').upsert({ user_id: user.id, date, weight }, { onConflict: 'user_id,date' })
    const updated = [...weightLog.filter(e => e.date !== date), { date, weight }].sort((a, b) => a.date.localeCompare(b.date))
    set({ weightLog: updated, startDate: updated[0]?.date ?? date })

    if (profile && plan && Math.abs(weight - profile.weight) >= 1) {
      const updatedProfile = { ...profile, weight }
      await sb.from('profiles').update({ weight, updated_at: new Date().toISOString() }).eq('user_id', user.id)
      set({ profile: updatedProfile })
      if (calcMacros) {
        const newMacros = calcMacros(updatedProfile)
        const updatedPlan = {
          ...plan,
          bmr: newMacros.bmr, tdee: newMacros.tdee, calories: newMacros.calories,
          protein: newMacros.protein, carbs: newMacros.carbs, fat: newMacros.fat,
          bmi: newMacros.bmi, bmiCat: newMacros.bmiCat, weightTarget: newMacros.weightTarget,
        }
        await sb.from('ai_plans').update({ plan: updatedPlan, updated_at: new Date().toISOString() }).eq('user_id', user.id)
        set({ plan: updatedPlan })
      }
    }
  },

  toggleExercise: async (date, index) => {
    const { user, workoutDone } = get()
    if (!user) { set({ showAuthModal: true }); return }
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
    const { user, foodLogs } = get()
    if (!user) { set({ showAuthModal: true }); return }
    const tempId = 'temp_' + Date.now()
    set({ foodLogs: [...foodLogs, { ...log, id: tempId }] })
    const { data, error } = await sb.from('food_logs').insert({
      user_id: user.id, date: log.date, meal_slot: log.meal_slot,
      food_name: log.food_name, serving_label: log.serving_label,
      serving_grams: log.serving_grams, calories: log.calories,
      protein: log.protein, carbs: log.carbs, fat: log.fat,
    }).select().single()
    if (data) {
      set({ foodLogs: get().foodLogs.map(f => f.id === tempId ? { ...log, id: data.id } : f) })
    } else if (error) {
      set({ foodLogs: get().foodLogs.filter(f => f.id !== tempId) })
      throw new Error(error.message)
    }
  },

  deleteFoodLog: async (id) => {
    const { user, foodLogs } = get(); if (!user) return
    await sb.from('food_logs').delete().eq('id', id).eq('user_id', user.id)
    set({ foodLogs: foodLogs.filter(f => f.id !== id) })
  },

  logPR: (exerciseName, weight, reps) => {
    const { prs } = get()
    const key = exerciseName.toLowerCase().trim()
    const existing = prs[key]
    const isNewPR = !existing
      || weight > existing.weight
      || (weight === existing.weight && reps > existing.reps)
    if (isNewPR) {
      const updated = {
        ...prs,
        [key]: { exercise_name: exerciseName, weight, reps, date: new Date().toISOString().split('T')[0] }
      }
      set({ prs: updated })
      localStorage.setItem('mufasa_prs', JSON.stringify(updated))
    }
    return isNewPR
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
