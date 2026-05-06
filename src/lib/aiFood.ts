import type { FoodItem, BudgetBreakdown, Profile } from '../types'

const GEMINI_KEY = 'AIzaSyB_DNvosZuGCYPfXVOOw2S1r5l0faYvJic'
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`
const GEMINI_SEARCH_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`

async function callGemini(prompt: string, useSearch = false, retries = 2): Promise<string> {
  const body: any = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: { temperature: 0.3, maxOutputTokens: 1024 }
  }
  if (useSearch) {
    body.tools = [{ google_search: {} }]
  }
  const url = useSearch ? GEMINI_SEARCH_URL : GEMINI_URL
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })

  if (res.status === 429 && retries > 0) {
    await new Promise(r => setTimeout(r, 5000))
    return callGemini(prompt, useSearch, retries - 1)
  }

  if (!res.ok) {
    return ''
  }

  const data = await res.json()
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
}

// ── AI FOOD SEARCH (training data) ──
export async function searchFoodAI(query: string): Promise<FoodItem[]> {
  return _searchFood(query, false)
}

// ── WEB FOOD SEARCH (falls back to AI without web) ──
export async function searchFoodWeb(query: string): Promise<FoodItem[]> {
  return _searchFood(query, false)
}

async function _searchFood(query: string, _useWeb: boolean): Promise<FoodItem[]> {
  const prompt = `'You are a nutritionist with knowledge of Indian foods. A user searched for: '"${query}"

Return ONLY a JSON array of up to 6 food items with accurate nutritional data. No markdown, no explanation, just the array.
Each item must follow this exact format:
[
  {
    "id": "unique_lowercase_id",
    "name": "Exact food name (brand if applicable)",
    "serving_label": "1 katori / 1 piece / 1 glass / per 100g",
    "serving_grams": 150,
    "calories": 130,
    "protein": 9,
    "carbs": 22,
    "fat": 1.5,
    "category": "Meals"
  }
]

Rules:
- Use Indian serving sizes where applicable (katori, roti, glass, piece, tbsp, scoop)
- For branded/packaged foods use per-pack or per-serving as labelled
- All macro values per one serving
- Be accurate — use real nutritional data
- category must be one of: Grains, Lentils, Dairy, Eggs, Meat, Vegetables, Fruits, Snacks, Supplements, Drinks, Meals, FastFood`

  try {
    const raw = await callGroq(prompt)
    const cleaned = raw.replace(/\`\`\`json\n?/g, '').replace(/\`\`\`\n?/g, '').trim()
    const start = cleaned.indexOf('[')
    const end = cleaned.lastIndexOf(']')
    if (start === -1 || end === -1) return []
    return JSON.parse(cleaned.slice(start, end + 1)) as FoodItem[]
  } catch {
    return []
  }
}

// ── BUDGET ESTIMATION (Phase 1 — from training data) ──
export async function estimateBudgetAI(profile: Profile, monthlyBudget: number): Promise<BudgetBreakdown> {
  const hasGym = profile.gym_access === 'full_gym'
  const hasSupplements = monthlyBudget >= 3000

  // Don't call AI at all — calculate deterministically to avoid AI ignoring rules
  const gymCost = hasGym ? Math.min(1800, Math.round(monthlyBudget * 0.3)) : 0
  const suppCost = hasSupplements ? Math.min(1500, Math.round(monthlyBudget * 0.25)) : 0
  const foodCost = monthlyBudget - gymCost - suppCost

  const items: BudgetBreakdown['items'] = []

  if (hasGym) {
    items.push({ name: 'Gym membership', estimated_price: gymCost, monthly_qty: '1 month', category: 'gym' })
  }

  if (hasSupplements) {
    items.push({ name: 'MuscleBlaze Whey protein (1kg)', estimated_price: suppCost, monthly_qty: '1 bag', category: 'supplements' })
  }

  // Food items based on diet and remaining budget
  const dietType = profile.diet_type || 'non_vegetarian'
  if (dietType === 'non_vegetarian' || (dietType as string) === 'eggetarian') {
    items.push({ name: 'Eggs (6/day)', estimated_price: Math.round(foodCost * 0.35), monthly_qty: '~180 eggs', category: 'food' })
    if (dietType === 'non_vegetarian') {
      items.push({ name: 'Chicken breast', estimated_price: Math.round(foodCost * 0.3), monthly_qty: '~3kg/week', category: 'food' })
    }
    items.push({ name: 'Dal, sabzi, roti (staples)', estimated_price: Math.round(foodCost * 0.35), monthly_qty: 'Daily meals', category: 'food' })
  } else {
    items.push({ name: 'Paneer (500g × 4)', estimated_price: Math.round(foodCost * 0.35), monthly_qty: '4 packs/month', category: 'food' })
    items.push({ name: 'Milk (1L/day)', estimated_price: Math.round(foodCost * 0.25), monthly_qty: '30L/month', category: 'food' })
    items.push({ name: 'Dal, sabzi, roti (staples)', estimated_price: Math.round(foodCost * 0.4), monthly_qty: 'Daily meals', category: 'food' })
  }

  const notes = monthlyBudget < 2500
    ? `₹${monthlyBudget} is a tight budget. Focus on whole food protein — eggs, dal, curd, milk. No supplements needed at this stage.`
    : monthlyBudget < 5000
    ? `₹${monthlyBudget} is a comfortable budget for basics. ${hasSupplements ? 'Basic whey included.' : ''} Prioritise food quality over supplements.`
    : `₹${monthlyBudget} is well-funded. ${hasGym ? 'Good gym + ' : ''}protein sources + ${hasSupplements ? 'quality supplements' : 'whole foods'} covered.`

  return {
    gym: gymCost,
    supplements: suppCost,
    food: foodCost,
    total: monthlyBudget,
    items,
    notes,
    last_updated: new Date().toISOString()
  }
}

// ── BUDGET REFRESH (Phase 2 — live web search) ──
export async function refreshBudgetPricesAI(profile: Profile, monthlyBudget: number): Promise<BudgetBreakdown> {
  const prompt = `Search for current prices of fitness supplements and food items in India (BigBasket, Amazon India, local markets) in 2024.

For someone with:
- Goal: ${profile.goal}
- Diet: ${profile.diet_type || 'non_vegetarian'}
- Budget: ₹${monthlyBudget}/month

Find current prices and return a JSON budget breakdown:
{
  "gym": <amount>,
  "supplements": <amount>,
  "food": <amount>,
  "total": <amount>,
  "items": [
    { "name": "item", "estimated_price": 0, "monthly_qty": "qty", "category": "supplements|food|gym" }
  ],
  "notes": "budget assessment"
}
Only JSON, no markdown.`

  try {
    const raw = await callGemini(prompt, true) // useSearch = true
    const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const start = cleaned.indexOf('{')
    const end = cleaned.lastIndexOf('}')
    const parsed = JSON.parse(cleaned.slice(start, end + 1))
    return { ...parsed, last_updated: new Date().toISOString() } as BudgetBreakdown
  } catch {
    return estimateBudgetAI(profile, monthlyBudget)
  }
}
