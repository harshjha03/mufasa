export interface Profile {
  id?: string
  user_id?: string
  name: string
  age: number
  gender: 'male' | 'female' | 'other'
  weight: number
  height: number
  activity_level: 'sedentary' | 'light' | 'moderate' | 'very'
  goal: 'lose' | 'recomp' | 'gain'
  sport?: string
  sport_frequency?: string
  injuries?: string
  wake_time?: string
  sleep_time?: string
  gym_access?: 'full_gym' | 'home' | 'none'
  diet_type?: 'vegetarian' | 'non_vegetarian' | 'vegan'
  monthly_budget?: number
  deactivated?: boolean
  deactivated_at?: string
}

export interface Exercise {
  name: string
  sets: string
  muscle: string
  anim: string
}

export interface WorkoutDay {
  name: string
  exercises: Exercise[]
}

export interface Meal {
  time: string
  name: string
  food: string
  cal: number
  p: number
  c: number
  f: number
  swaps: { name: string; macros: string; badge: string }[]
}

export interface SportProtocol {
  pre: string[]
  post: string[]
  nutrition: string
  recovery: string
}

export interface BudgetBreakdown {
  gym: number
  supplements: number
  food: number
  total: number
  items: { name: string; estimated_price: number; monthly_qty: string; category: string }[]
  notes: string
  last_updated?: string
}

export interface AIPlan {
  bmr: number
  tdee: number
  calories: number
  protein: number
  carbs: number
  fat: number
  bmi: string
  bmiCat: string
  weightTarget: string
  workoutLevel: 'beginner' | 'intermediate' | 'advanced'
  meals: Meal[]
  workout: Record<number, WorkoutDay | null>
  warmup: Exercise[]
  sportProtocol?: SportProtocol
  tips: string[]
  budgetBreakdown?: BudgetBreakdown
  generatedAt?: string
}

export type Plan = AIPlan

export interface FoodItem {
  id: string
  name: string
  serving_label: string
  serving_grams: number
  calories: number
  protein: number
  carbs: number
  fat: number
  category: string
}

export interface FoodLog {
  id: string
  date: string
  meal_slot: 'breakfast' | 'lunch' | 'snack' | 'dinner' | 'night'
  food_name: string
  serving_label: string
  serving_grams?: number
  calories: number
  protein: number
  carbs: number
  fat: number
  quantity: number
}

export interface WeightEntry {
  date: string
  weight: number
}

export interface Expense {
  id: string
  name: string
  amount: number
  cat: 'supplement' | 'food' | 'gym' | 'other'
  month: string
  date: string
}

export interface WorkoutDone {
  [dateKey: string]: { [exerciseIndex: number]: boolean }
}

export type ActivityLevel = Profile['activity_level']
export type Goal = Profile['goal']
export type Gender = Profile['gender']
