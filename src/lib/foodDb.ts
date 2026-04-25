import type { FoodItem } from '../types'

export const FOOD_DB: FoodItem[] = [
  // Grains & Staples
  { id: 'roti', name: 'Roti / Chapati', serving_label: '1 roti', serving_grams: 40, calories: 104, protein: 3.1, carbs: 20, fat: 1.8, category: 'Grains' },
  { id: 'paratha', name: 'Paratha (plain)', serving_label: '1 paratha', serving_grams: 70, calories: 200, protein: 4, carbs: 28, fat: 8, category: 'Grains' },
  { id: 'rice_cooked', name: 'Rice (cooked)', serving_label: '1 katori (medium bowl)', serving_grams: 150, calories: 195, protein: 4, carbs: 42, fat: 0.4, category: 'Grains' },
  { id: 'bread_slice', name: 'White bread', serving_label: '1 slice', serving_grams: 30, calories: 79, protein: 2.7, carbs: 15, fat: 1, category: 'Grains' },
  { id: 'brown_bread', name: 'Brown bread', serving_label: '1 slice', serving_grams: 30, calories: 69, protein: 3, carbs: 13, fat: 1, category: 'Grains' },
  { id: 'oats', name: 'Oats (dry)', serving_label: '1 serving (½ cup)', serving_grams: 40, calories: 154, protein: 5.4, carbs: 27, fat: 2.5, category: 'Grains' },
  { id: 'poha', name: 'Poha (cooked)', serving_label: '1 plate', serving_grams: 150, calories: 180, protein: 3, carbs: 36, fat: 3, category: 'Grains' },
  { id: 'upma', name: 'Upma', serving_label: '1 plate', serving_grams: 150, calories: 185, protein: 4, carbs: 30, fat: 6, category: 'Grains' },
  { id: 'idli', name: 'Idli', serving_label: '2 idlis', serving_grams: 100, calories: 130, protein: 4, carbs: 25, fat: 0.5, category: 'Grains' },
  { id: 'dosa', name: 'Plain Dosa', serving_label: '1 dosa', serving_grams: 90, calories: 133, protein: 3.4, carbs: 25, fat: 2, category: 'Grains' },

  // Lentils & Legumes
  { id: 'dal_cooked', name: 'Dal (cooked)', serving_label: '1 katori', serving_grams: 150, calories: 130, protein: 9, carbs: 22, fat: 1.5, category: 'Lentils' },
  { id: 'rajma', name: 'Rajma (cooked)', serving_label: '1 katori', serving_grams: 150, calories: 165, protein: 11, carbs: 28, fat: 1, category: 'Lentils' },
  { id: 'chana_cooked', name: 'Chana (cooked)', serving_label: '1 katori', serving_grams: 150, calories: 180, protein: 12, carbs: 30, fat: 2, category: 'Lentils' },
  { id: 'roasted_chana', name: 'Roasted chana', serving_label: '1 handful (small bowl)', serving_grams: 30, calories: 105, protein: 5.5, carbs: 17, fat: 1.5, category: 'Lentils' },
  { id: 'moong_dal', name: 'Moong dal (cooked)', serving_label: '1 katori', serving_grams: 150, calories: 115, protein: 8, carbs: 20, fat: 0.5, category: 'Lentils' },
  { id: 'sprouts', name: 'Sprouts (mixed)', serving_label: '1 katori', serving_grams: 100, calories: 62, protein: 4.3, carbs: 11, fat: 0.4, category: 'Lentils' },

  // Dairy
  { id: 'milk_full', name: 'Full fat milk', serving_label: '1 glass (250ml)', serving_grams: 250, calories: 150, protein: 8, carbs: 12, fat: 8, category: 'Dairy' },
  { id: 'milk_toned', name: 'Toned milk', serving_label: '1 glass (250ml)', serving_grams: 250, calories: 120, protein: 8.5, carbs: 12, fat: 3, category: 'Dairy' },
  { id: 'curd', name: 'Curd / Dahi', serving_label: '1 katori', serving_grams: 150, calories: 98, protein: 6, carbs: 8, fat: 4.5, category: 'Dairy' },
  { id: 'paneer', name: 'Paneer', serving_label: '2 medium cubes', serving_grams: 60, calories: 164, protein: 12, carbs: 3, fat: 12, category: 'Dairy' },
  { id: 'greek_yogurt', name: 'Greek yogurt', serving_label: '1 small cup', serving_grams: 150, calories: 100, protein: 15, carbs: 6, fat: 1.5, category: 'Dairy' },
  { id: 'cheese_slice', name: 'Cheese slice', serving_label: '1 slice', serving_grams: 20, calories: 60, protein: 4, carbs: 0.5, fat: 4.5, category: 'Dairy' },

  // Eggs
  { id: 'egg_boiled', name: 'Boiled egg', serving_label: '1 egg', serving_grams: 50, calories: 77, protein: 6.3, carbs: 0.6, fat: 5.3, category: 'Eggs' },
  { id: 'egg_white', name: 'Egg white only', serving_label: '1 egg white', serving_grams: 33, calories: 17, protein: 3.6, carbs: 0.2, fat: 0, category: 'Eggs' },
  { id: 'omelette_2egg', name: 'Omelette (2 eggs)', serving_label: '1 omelette', serving_grams: 110, calories: 185, protein: 13, carbs: 1, fat: 14, category: 'Eggs' },

  // Chicken & Meat
  { id: 'chicken_breast', name: 'Chicken breast (cooked)', serving_label: '1 medium piece', serving_grams: 100, calories: 165, protein: 31, carbs: 0, fat: 3.6, category: 'Meat' },
  { id: 'chicken_curry', name: 'Chicken curry', serving_label: '1 katori (3-4 pieces)', serving_grams: 150, calories: 215, protein: 22, carbs: 6, fat: 11, category: 'Meat' },
  { id: 'egg_curry', name: 'Egg curry', serving_label: '2 eggs with gravy', serving_grams: 150, calories: 230, protein: 14, carbs: 8, fat: 16, category: 'Meat' },

  // Vegetables
  { id: 'sabzi', name: 'Mixed sabzi (dry)', serving_label: '1 katori', serving_grams: 100, calories: 80, protein: 2.5, carbs: 12, fat: 3, category: 'Vegetables' },
  { id: 'salad', name: 'Mixed salad', serving_label: '1 plate', serving_grams: 100, calories: 35, protein: 1.5, carbs: 7, fat: 0.3, category: 'Vegetables' },
  { id: 'palak', name: 'Palak / Spinach (cooked)', serving_label: '1 katori', serving_grams: 100, calories: 40, protein: 3.5, carbs: 5, fat: 1, category: 'Vegetables' },

  // Fruits
  { id: 'banana', name: 'Banana', serving_label: '1 medium banana', serving_grams: 120, calories: 105, protein: 1.3, carbs: 27, fat: 0.4, category: 'Fruits' },
  { id: 'apple', name: 'Apple', serving_label: '1 medium apple', serving_grams: 150, calories: 78, protein: 0.4, carbs: 21, fat: 0.2, category: 'Fruits' },
  { id: 'mango', name: 'Mango', serving_label: '1 medium mango', serving_grams: 200, calories: 130, protein: 1.4, carbs: 33, fat: 0.4, category: 'Fruits' },
  { id: 'orange', name: 'Orange', serving_label: '1 medium orange', serving_grams: 130, calories: 62, protein: 1.2, carbs: 15, fat: 0.2, category: 'Fruits' },

  // Snacks & Others
  { id: 'peanut_butter', name: 'Peanut butter', serving_label: '1 tbsp', serving_grams: 16, calories: 94, protein: 4, carbs: 3, fat: 8, category: 'Snacks' },
  { id: 'makhana', name: 'Makhana / Fox nuts', serving_label: '1 handful', serving_grams: 30, calories: 106, protein: 3.8, carbs: 20, fat: 0.5, category: 'Snacks' },
  { id: 'almonds', name: 'Almonds', serving_label: '10 almonds', serving_grams: 14, calories: 82, protein: 3, carbs: 3, fat: 7, category: 'Snacks' },
  { id: 'biscuits', name: 'Marie biscuits', serving_label: '3 biscuits', serving_grams: 24, calories: 100, protein: 1.5, carbs: 17, fat: 3, category: 'Snacks' },
  { id: 'samosa', name: 'Samosa', serving_label: '1 samosa', serving_grams: 60, calories: 140, protein: 2.5, carbs: 18, fat: 7, category: 'Snacks' },

  // Supplements
  { id: 'whey_scoop', name: 'Whey protein (1 scoop)', serving_label: '1 scoop', serving_grams: 30, calories: 120, protein: 24, carbs: 3, fat: 1.5, category: 'Supplements' },
  { id: 'creatine', name: 'Creatine', serving_label: '1 tsp (5g)', serving_grams: 5, calories: 0, protein: 0, carbs: 0, fat: 0, category: 'Supplements' },

  // Drinks
  { id: 'chai_milk', name: 'Chai (with milk & sugar)', serving_label: '1 cup (150ml)', serving_grams: 150, calories: 60, protein: 2, carbs: 9, fat: 2, category: 'Drinks' },
  { id: 'black_coffee', name: 'Black coffee', serving_label: '1 cup', serving_grams: 240, calories: 5, protein: 0.3, carbs: 0.7, fat: 0, category: 'Drinks' },
  { id: 'coconut_water', name: 'Coconut water', serving_label: '1 glass (250ml)', serving_grams: 250, calories: 45, protein: 1.7, carbs: 9, fat: 0.5, category: 'Drinks' },
  { id: 'lassi_sweet', name: 'Sweet lassi', serving_label: '1 glass (250ml)', serving_grams: 250, calories: 180, protein: 6, carbs: 28, fat: 5, category: 'Drinks' },

  // Restaurant / Common combos
  { id: 'dal_rice', name: 'Dal rice combo', serving_label: '1 full plate', serving_grams: 350, calories: 420, protein: 14, carbs: 78, fat: 3.5, category: 'Meals' },
  { id: 'thali_veg', name: 'Veg thali (restaurant)', serving_label: '1 thali', serving_grams: 500, calories: 650, protein: 18, carbs: 100, fat: 18, category: 'Meals' },
  { id: 'maggi', name: 'Maggi noodles', serving_label: '1 packet (cooked)', serving_grams: 70, calories: 310, protein: 7, carbs: 44, fat: 12, category: 'Meals' },
  { id: 'khichdi', name: 'Khichdi', serving_label: '1 plate', serving_grams: 250, calories: 280, protein: 10, carbs: 48, fat: 5, category: 'Meals' },
]

export function searchFoods(query: string): FoodItem[] {
  if (!query.trim()) return FOOD_DB.slice(0, 12)
  const q = query.toLowerCase()
  return FOOD_DB.filter(f =>
    f.name.toLowerCase().includes(q) ||
    f.category.toLowerCase().includes(q)
  ).slice(0, 8)
}
