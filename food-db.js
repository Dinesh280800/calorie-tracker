// Food Database - Nutritional values per 100g
// Format: { name, category, calories, protein, carbs, fat, fiber }
const FOOD_DATABASE = [
  // === GRAINS & CEREALS ===
  { name: "White Rice (cooked)", category: "grains", calories: 130, protein: 2.7, carbs: 28, fat: 0.3, fiber: 0.4 },
  { name: "Brown Rice (cooked)", category: "grains", calories: 123, protein: 2.7, carbs: 26, fat: 1.0, fiber: 1.8 },
  { name: "Chapathi", category: "grains", calories: 240, protein: 7.9, carbs: 38, fat: 7.5, fiber: 4.0 },
  { name: "Roti (without oil)", category: "grains", calories: 200, protein: 7.0, carbs: 35, fat: 3.5, fiber: 3.5 },
  { name: "Oats (dry)", category: "grains", calories: 389, protein: 16.9, carbs: 66, fat: 6.9, fiber: 10.6 },
  { name: "Oats (cooked)", category: "grains", calories: 71, protein: 2.5, carbs: 12, fat: 1.5, fiber: 1.7 },
  { name: "Millet (Ragi/Finger Millet, cooked)", category: "grains", calories: 119, protein: 3.1, carbs: 25, fat: 0.6, fiber: 2.7 },
  { name: "Millet (Jowar/Sorghum, cooked)", category: "grains", calories: 120, protein: 3.5, carbs: 25, fat: 1.0, fiber: 2.5 },
  { name: "Millet (Bajra/Pearl Millet, cooked)", category: "grains", calories: 119, protein: 3.4, carbs: 23, fat: 1.7, fiber: 2.3 },
  { name: "Foxtail Millet (cooked)", category: "grains", calories: 118, protein: 3.3, carbs: 24, fat: 1.1, fiber: 2.4 },
  { name: "Quinoa (cooked)", category: "grains", calories: 120, protein: 4.4, carbs: 21, fat: 1.9, fiber: 2.8 },
  { name: "Bread (whole wheat, 1 slice ~30g)", category: "grains", calories: 247, protein: 13, carbs: 41, fat: 3.4, fiber: 7.0 },
  { name: "Dosa (plain)", category: "grains", calories: 168, protein: 3.9, carbs: 26, fat: 5.2, fiber: 0.8 },
  { name: "Idli (1 piece ~60g)", category: "grains", calories: 58, protein: 2.0, carbs: 12, fat: 0.2, fiber: 0.5 },
  { name: "Upma", category: "grains", calories: 135, protein: 3.5, carbs: 18, fat: 5.5, fiber: 1.2 },
  { name: "Poha (flattened rice, cooked)", category: "grains", calories: 130, protein: 2.5, carbs: 23, fat: 3.5, fiber: 0.8 },

  // === PROTEIN - CHICKEN ===
  { name: "Chicken Breast (cooked)", category: "protein", calories: 165, protein: 31, carbs: 0, fat: 3.6, fiber: 0 },
  { name: "Chicken Breast (raw)", category: "protein", calories: 120, protein: 22.5, carbs: 0, fat: 2.6, fiber: 0 },
  { name: "Chicken Thigh (cooked, skinless)", category: "protein", calories: 209, protein: 26, carbs: 0, fat: 10.9, fiber: 0 },
  { name: "Chicken Curry (homemade)", category: "protein", calories: 150, protein: 15, carbs: 5, fat: 8, fiber: 0.5 },
  { name: "Chicken Tikka", category: "protein", calories: 148, protein: 25, carbs: 2, fat: 4.5, fiber: 0 },
  { name: "Tandoori Chicken", category: "protein", calories: 140, protein: 24, carbs: 3, fat: 3.5, fiber: 0 },
  { name: "Chicken Keema", category: "protein", calories: 170, protein: 18, carbs: 4, fat: 9, fiber: 0.5 },

  // === PROTEIN - EGGS ===
  { name: "Whole Egg (boiled, 1 egg ~50g)", category: "protein", calories: 155, protein: 13, carbs: 1.1, fat: 11, fiber: 0 },
  { name: "Egg White (1 egg ~33g)", category: "protein", calories: 52, protein: 11, carbs: 0.7, fat: 0.2, fiber: 0 },
  { name: "Scrambled Eggs (with oil)", category: "protein", calories: 166, protein: 11, carbs: 1.6, fat: 12, fiber: 0 },
  { name: "Omelette (2 eggs)", category: "protein", calories: 154, protein: 11, carbs: 0.6, fat: 12, fiber: 0 },
  { name: "Egg Bhurji", category: "protein", calories: 170, protein: 12, carbs: 3, fat: 12, fiber: 0.3 },

  // === PROTEIN - FISH ===
  { name: "Fish (Rohu, cooked)", category: "protein", calories: 97, protein: 17, carbs: 0, fat: 3.2, fiber: 0 },
  { name: "Fish (Tilapia, cooked)", category: "protein", calories: 128, protein: 26, carbs: 0, fat: 2.7, fiber: 0 },
  { name: "Fish (Salmon, cooked)", category: "protein", calories: 208, protein: 20, carbs: 0, fat: 13, fiber: 0 },
  { name: "Fish (Pomfret, cooked)", category: "protein", calories: 96, protein: 18, carbs: 0, fat: 2.5, fiber: 0 },
  { name: "Fish Curry", category: "protein", calories: 120, protein: 14, carbs: 4, fat: 5, fiber: 0.3 },
  { name: "Tuna (canned in water)", category: "protein", calories: 116, protein: 26, carbs: 0, fat: 1, fiber: 0 },

  // === PROTEIN - PANEER & DAIRY PROTEIN ===
  { name: "Paneer (raw)", category: "protein", calories: 265, protein: 18.3, carbs: 1.2, fat: 20.8, fiber: 0 },
  { name: "Paneer Bhurji", category: "protein", calories: 230, protein: 15, carbs: 4, fat: 17, fiber: 0.5 },
  { name: "Paneer Tikka", category: "protein", calories: 220, protein: 16, carbs: 5, fat: 15, fiber: 0.5 },
  { name: "Tofu", category: "protein", calories: 76, protein: 8, carbs: 1.9, fat: 4.8, fiber: 0.3 },
  { name: "Whey Protein (1 scoop ~30g)", category: "protein", calories: 400, protein: 80, carbs: 10, fat: 5, fiber: 0 },

  // === DAIRY ===
  { name: "Curd/Yogurt (full fat)", category: "dairy", calories: 98, protein: 4.3, carbs: 4.7, fat: 4.5, fiber: 0 },
  { name: "Curd/Yogurt (low fat)", category: "dairy", calories: 63, protein: 5.3, carbs: 7.0, fat: 1.6, fiber: 0 },
  { name: "Greek Yogurt", category: "dairy", calories: 97, protein: 9, carbs: 3.6, fat: 5, fiber: 0 },
  { name: "Buttermilk (chaas)", category: "dairy", calories: 40, protein: 3.3, carbs: 4.8, fat: 0.9, fiber: 0 },
  { name: "Milk (full fat)", category: "dairy", calories: 62, protein: 3.2, carbs: 4.8, fat: 3.3, fiber: 0 },
  { name: "Milk (skimmed)", category: "dairy", calories: 34, protein: 3.4, carbs: 5, fat: 0.1, fiber: 0 },
  { name: "Lassi (sweet)", category: "dairy", calories: 75, protein: 2.5, carbs: 12, fat: 2, fiber: 0 },
  { name: "Cottage Cheese (Chenna)", category: "dairy", calories: 98, protein: 11, carbs: 3.4, fat: 4.3, fiber: 0 },

  // === FRUITS ===
  { name: "Banana", category: "fruits", calories: 89, protein: 1.1, carbs: 23, fat: 0.3, fiber: 2.6 },
  { name: "Apple", category: "fruits", calories: 52, protein: 0.3, carbs: 14, fat: 0.2, fiber: 2.4 },
  { name: "Orange", category: "fruits", calories: 47, protein: 0.9, carbs: 12, fat: 0.1, fiber: 2.4 },
  { name: "Watermelon", category: "fruits", calories: 30, protein: 0.6, carbs: 8, fat: 0.2, fiber: 0.4 },
  { name: "Mango", category: "fruits", calories: 60, protein: 0.8, carbs: 15, fat: 0.4, fiber: 1.6 },
  { name: "Papaya", category: "fruits", calories: 43, protein: 0.5, carbs: 11, fat: 0.3, fiber: 1.7 },
  { name: "Guava", category: "fruits", calories: 68, protein: 2.6, carbs: 14, fat: 1.0, fiber: 5.4 },
  { name: "Pomegranate", category: "fruits", calories: 83, protein: 1.7, carbs: 19, fat: 1.2, fiber: 4.0 },
  { name: "Grapes", category: "fruits", calories: 69, protein: 0.7, carbs: 18, fat: 0.2, fiber: 0.9 },
  { name: "Pineapple", category: "fruits", calories: 50, protein: 0.5, carbs: 13, fat: 0.1, fiber: 1.4 },

  // === VEGETABLES ===
  { name: "Spinach (cooked)", category: "vegetables", calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4, fiber: 2.2 },
  { name: "Broccoli", category: "vegetables", calories: 34, protein: 2.8, carbs: 7, fat: 0.4, fiber: 2.6 },
  { name: "Tomato", category: "vegetables", calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2, fiber: 1.2 },
  { name: "Onion", category: "vegetables", calories: 40, protein: 1.1, carbs: 9, fat: 0.1, fiber: 1.7 },
  { name: "Cucumber", category: "vegetables", calories: 16, protein: 0.7, carbs: 3.6, fat: 0.1, fiber: 0.5 },
  { name: "Carrot", category: "vegetables", calories: 41, protein: 0.9, carbs: 10, fat: 0.2, fiber: 2.8 },
  { name: "Capsicum (Bell Pepper)", category: "vegetables", calories: 31, protein: 1, carbs: 6, fat: 0.3, fiber: 2.1 },
  { name: "Cauliflower", category: "vegetables", calories: 25, protein: 1.9, carbs: 5, fat: 0.3, fiber: 2.0 },
  { name: "Cabbage", category: "vegetables", calories: 25, protein: 1.3, carbs: 6, fat: 0.1, fiber: 2.5 },
  { name: "Potato (boiled)", category: "vegetables", calories: 87, protein: 1.9, carbs: 20, fat: 0.1, fiber: 1.8 },
  { name: "Sweet Potato (boiled)", category: "vegetables", calories: 86, protein: 1.6, carbs: 20, fat: 0.1, fiber: 3.0 },
  { name: "Beans (French Beans)", category: "vegetables", calories: 31, protein: 1.8, carbs: 7, fat: 0.1, fiber: 3.4 },
  { name: "Ladies Finger (Okra)", category: "vegetables", calories: 33, protein: 1.9, carbs: 7, fat: 0.2, fiber: 3.2 },
  { name: "Bitter Gourd", category: "vegetables", calories: 17, protein: 1.0, carbs: 3.7, fat: 0.2, fiber: 2.8 },
  { name: "Bottle Gourd (Lauki)", category: "vegetables", calories: 14, protein: 0.6, carbs: 3.4, fat: 0.02, fiber: 0.5 },
  { name: "Ridge Gourd", category: "vegetables", calories: 20, protein: 1.2, carbs: 3.5, fat: 0.2, fiber: 1.5 },
  { name: "Mushroom", category: "vegetables", calories: 22, protein: 3.1, carbs: 3.3, fat: 0.3, fiber: 1.0 },
  { name: "Mixed Vegetable Curry", category: "vegetables", calories: 80, protein: 2.5, carbs: 8, fat: 4, fiber: 2.5 },

  // === LENTILS & LEGUMES ===
  { name: "Dal (Toor/Arhar, cooked)", category: "legumes", calories: 116, protein: 7.5, carbs: 18, fat: 1.5, fiber: 5.0 },
  { name: "Dal (Moong, cooked)", category: "legumes", calories: 105, protein: 7.0, carbs: 17, fat: 0.4, fiber: 4.5 },
  { name: "Dal (Masoor, cooked)", category: "legumes", calories: 116, protein: 9.0, carbs: 20, fat: 0.4, fiber: 4.0 },
  { name: "Chana Dal (cooked)", category: "legumes", calories: 164, protein: 8.9, carbs: 27, fat: 2.6, fiber: 7.6 },
  { name: "Rajma (Kidney Beans, cooked)", category: "legumes", calories: 127, protein: 8.7, carbs: 22, fat: 0.5, fiber: 6.4 },
  { name: "Chickpeas (Chole, cooked)", category: "legumes", calories: 164, protein: 8.9, carbs: 27, fat: 2.6, fiber: 7.6 },
  { name: "Sprouts (Moong)", category: "legumes", calories: 30, protein: 3.0, carbs: 5.9, fat: 0.2, fiber: 1.8 },
  { name: "Soybean (cooked)", category: "legumes", calories: 173, protein: 17, carbs: 10, fat: 9, fiber: 6.0 },

  // === BEVERAGES ===
  { name: "Black Coffee", category: "beverages", calories: 2, protein: 0.3, carbs: 0, fat: 0, fiber: 0 },
  { name: "Green Tea", category: "beverages", calories: 1, protein: 0, carbs: 0.2, fat: 0, fiber: 0 },
  { name: "Lemon Tea (no sugar)", category: "beverages", calories: 4, protein: 0.1, carbs: 1, fat: 0, fiber: 0 },
  { name: "Tea with milk (no sugar)", category: "beverages", calories: 15, protein: 0.7, carbs: 1.5, fat: 0.7, fiber: 0 },
  { name: "Coconut Water", category: "beverages", calories: 19, protein: 0.7, carbs: 3.7, fat: 0.2, fiber: 1.1 },
  { name: "Protein Shake (with water)", category: "beverages", calories: 120, protein: 24, carbs: 3, fat: 1.5, fiber: 0 },
  { name: "Lemon Water", category: "beverages", calories: 3, protein: 0, carbs: 1, fat: 0, fiber: 0 },

  // === NUTS & SEEDS ===
  { name: "Almonds", category: "nuts", calories: 579, protein: 21, carbs: 22, fat: 50, fiber: 12.5 },
  { name: "Walnuts", category: "nuts", calories: 654, protein: 15, carbs: 14, fat: 65, fiber: 6.7 },
  { name: "Peanuts (roasted)", category: "nuts", calories: 567, protein: 26, carbs: 16, fat: 49, fiber: 8.5 },
  { name: "Peanut Butter", category: "nuts", calories: 588, protein: 25, carbs: 20, fat: 50, fiber: 6.0 },
  { name: "Flax Seeds", category: "nuts", calories: 534, protein: 18, carbs: 29, fat: 42, fiber: 27.3 },
  { name: "Chia Seeds", category: "nuts", calories: 486, protein: 17, carbs: 42, fat: 31, fiber: 34.4 },
  { name: "Pumpkin Seeds", category: "nuts", calories: 559, protein: 30, carbs: 11, fat: 49, fiber: 6.0 },
  { name: "Sunflower Seeds", category: "nuts", calories: 584, protein: 21, carbs: 20, fat: 51, fiber: 8.6 },

  // === OILS & FATS ===
  { name: "Olive Oil (1 tbsp ~14g)", category: "fats", calories: 884, protein: 0, carbs: 0, fat: 100, fiber: 0 },
  { name: "Coconut Oil (1 tbsp ~14g)", category: "fats", calories: 862, protein: 0, carbs: 0, fat: 100, fiber: 0 },
  { name: "Ghee (1 tbsp ~14g)", category: "fats", calories: 900, protein: 0, carbs: 0, fat: 100, fiber: 0 },
  { name: "Butter (1 tbsp ~14g)", category: "fats", calories: 717, protein: 0.9, carbs: 0.1, fat: 81, fiber: 0 },

  // === SUPPLEMENTS (per serving) ===
  { name: "Creatine Monohydrate (5g)", category: "supplements", calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 },
  { name: "Omega-3 Fish Oil Capsule", category: "supplements", calories: 10, protein: 0, carbs: 0, fat: 1, fiber: 0 },
  { name: "Vitamin C Chewable Tab", category: "supplements", calories: 5, protein: 0, carbs: 1, fat: 0, fiber: 0 },
  { name: "Magnesium Glycinate Capsule", category: "supplements", calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 },

  // === SNACKS ===
  { name: "Roasted Chana", category: "snacks", calories: 364, protein: 19, carbs: 58, fat: 5.3, fiber: 12.2 },
  { name: "Makhana (Fox Nuts)", category: "snacks", calories: 347, protein: 9.7, carbs: 77, fat: 0.1, fiber: 7.5 },
  { name: "Rice Cake", category: "snacks", calories: 35, protein: 0.7, carbs: 7.3, fat: 0.3, fiber: 0.4 },
  { name: "Dark Chocolate (70%+)", category: "snacks", calories: 598, protein: 7.8, carbs: 46, fat: 43, fiber: 11 },
];

// Helper function to search foods
function searchFoods(query) {
  if (!query || query.length < 2) return [];
  const q = query.toLowerCase();
  return FOOD_DATABASE.filter(food => 
    food.name.toLowerCase().includes(q) || 
    food.category.toLowerCase().includes(q)
  ).slice(0, 15);
}

// Get nutrition for a given weight
function getNutrition(food, weightInGrams) {
  const multiplier = weightInGrams / 100;
  return {
    name: food.name,
    weight: weightInGrams,
    calories: Math.round(food.calories * multiplier),
    protein: Math.round(food.protein * multiplier * 10) / 10,
    carbs: Math.round(food.carbs * multiplier * 10) / 10,
    fat: Math.round(food.fat * multiplier * 10) / 10,
    fiber: Math.round(food.fiber * multiplier * 10) / 10
  };
}
