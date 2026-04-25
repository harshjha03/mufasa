import type { FoodItem, BudgetBreakdown, Profile } from '../types'

const GEMINI_KEY = 'AIzaSyB_DNvosZuGCYPfXVOOw2S1r5l0faYvJic'
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`
const GEMINI_SEARCH_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`

async function callGemini(prompt: string, useSearch = false): Promise<string> {
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
  const data = await res.json()
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
}

// ── AI FOOD SEARCH ──
export async function searchFoodAI(query: string): Promise<FoodItem[]> {
  const prompt = `You are a nutritionist with knowledge of Indian foods. 
A user searched for: "${query}"

Return ONLY a JSON array of up to 4 food items. No markdown, no explanation, just the array.
Each item must follow this exact format:
[
  {
    "id": "unique_id",
    "name": "Food name",
    "serving_label": "1 katori / 1 roti / 1 glass / 1 piece",
    "serving_grams": 150,
    "calories": 130,
    "protein": 9,
    "carbs": 22,
    "fat": 1.5,
    "category": "Lentils"
  }
]

Rules:
- Use Indian serving sizes (katori, roti, glass, piece, tbsp, scoop)
- All values per one serving
- Be accurate with macros
- If it's a supplement or protein powder, use per scoop
- category must be one of: Grains, Lentils, Dairy, Eggs, Meat, Vegetables, Fruits, Snacks, Supplements, Drinks, Meals`

  try {
    const raw = await callGemini(prompt)
    const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
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
  const prompt = `You are a fitness budget advisor in India. Estimate a monthly fitness budget breakdown.

USER PROFILE:
- Goal: ${profile.goal === 'lose' ? 'Fat loss' : profile.goal === 'gain' ? 'Muscle gain' : 'Recomposition'}
- Diet: ${profile.diet_type || 'non_vegetarian'}
- Gym access: ${profile.gym_access || 'full_gym'}
- Monthly budget: ₹${monthlyBudget}
- Weight: ${profile.weight}kg

Give realistic Indian 2024 prices (BigBasket/local market). 
Respond ONLY with a JSON object, no markdown:

{
  "gym": 1800,
  "supplements": 2000,
  "food": 1500,
  "total": 5300,
  "items": [
    { "name": "MuscleBlaze Biozyme Whey 1kg", "estimated_price": 1899, "monthly_qty": "1 bag", "category": "supplements" },
    { "name": "Eggs (farm fresh)", "estimated_price": 750, "monthly_qty": "120 eggs (4/day)", "category": "food" },
    { "name": "Gym membership (mid-tier)", "estimated_price": 1800, "monthly_qty": "1 month", "category": "gym" }
  ],
  "notes": "Your budget of ₹X is [sufficient/tight]. Suggestion: ..."
}`

  try {
    const raw = await callGemini(prompt)
    const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const start = cleaned.indexOf('{')
    const end = cleaned.lastIndexOf('}')
    const parsed = JSON.parse(cleaned.slice(start, end + 1))
    return { ...parsed, last_updated: new Date().toISOString() } as BudgetBreakdown
  } catch {
    // Fallback
    return {
      gym: Math.round(monthlyBudget * 0.3),
      supplements: Math.round(monthlyBudget * 0.35),
      food: Math.round(monthlyBudget * 0.35),
      total: monthlyBudget,
      items: [
        { name: 'Gym membership', estimated_price: Math.round(monthlyBudget * 0.3), monthly_qty: '1 month', category: 'gym' },
        { name: 'Whey protein', estimated_price: Math.round(monthlyBudget * 0.35), monthly_qty: '1 bag', category: 'supplements' },
        { name: 'Extra food items', estimated_price: Math.round(monthlyBudget * 0.35), monthly_qty: 'Monthly', category: 'food' },
      ],
      notes: `Budget of ₹${monthlyBudget} allocated across gym, supplements, and food.`,
      last_updated: new Date().toISOString()
    }
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
