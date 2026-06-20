// Shift Schedule Data
// Roster is managed via the app's Roster Editor (stored in localStorage)

const SHIFT_ROSTER = {};

// Shift timings
const SHIFT_TIMINGS = {
  morning: { start: '05:00', end: '14:00', label: 'Morning Shift (5:00 AM - 2:00 PM)' },
  evening: { start: '13:00', end: '22:00', label: 'Evening Shift (1:00 PM - 10:00 PM)' },
  general: { start: '09:00', end: '18:00', label: 'General Shift (9:00 AM - 6:00 PM)' },
  compOff: { start: null, end: null, label: 'Compensatory Off' },
  leave: { start: null, end: null, label: 'Leave' }
};

// Get Dinesh S's shift for a given date
// Checks localStorage first (user-edited), then falls back to hardcoded roster
function getDineshShift(dateStr) {
  // Check user-edited roster in localStorage first
  const customRoster = getCustomRoster();
  const customShift = customRoster[dateStr];
  if (customShift) {
    const type = customShift.type || 'unknown';
    if (SHIFT_TIMINGS[type]) {
      return { type, ...SHIFT_TIMINGS[type] };
    }
    return { type, label: type.charAt(0).toUpperCase() + type.slice(1) };
  }

  // Fallback to hardcoded roster
  const roster = SHIFT_ROSTER[dateStr];
  if (!roster) return { type: 'unknown', label: 'No roster data' };
  
  if (roster.compOff && roster.compOff.includes('Dinesh S')) {
    return { type: 'compOff', ...SHIFT_TIMINGS.compOff };
  }
  if (roster.leave && roster.leave.includes('Dinesh S')) {
    return { type: 'leave', ...SHIFT_TIMINGS.leave };
  }
  if (roster.morning === 'Dinesh S') {
    return { type: 'morning', ...SHIFT_TIMINGS.morning };
  }
  if (roster.evening === 'Dinesh S') {
    return { type: 'evening', ...SHIFT_TIMINGS.evening };
  }
  if (roster.general && roster.general.includes('Dinesh S')) {
    return { type: 'general', ...SHIFT_TIMINGS.general };
  }
  return { type: 'off', label: 'Day Off' };
}

// Get custom roster from localStorage
function getCustomRoster() {
  try {
    return JSON.parse(localStorage.getItem('customRoster') || '{}');
  } catch { return {}; }
}

// Save custom roster to localStorage
function saveCustomRoster(roster) {
  localStorage.setItem('customRoster', JSON.stringify(roster));
}

// Meal timing plans based on shift type
const MEAL_PLANS = {
  morning: {
    // Shift: 5:00 AM - 2:00 PM
    meals: [
      { time: '04:30', type: 'pre-workout', label: 'Pre-Workout Snack', suggestion: 'Black coffee + Banana or Oats (small portion)' },
      { time: '08:00', type: 'breakfast', label: 'Breakfast (at work)', suggestion: 'Eggs (3-4) + Toast/Roti + Veggies' },
      { time: '11:00', type: 'snack', label: 'Mid-Morning Snack', suggestion: 'Buttermilk/Curd + Fruits' },
      { time: '14:30', type: 'lunch', label: 'Lunch (post shift)', suggestion: 'Rice/Millet + Chicken/Fish + Dal + Salad' },
      { time: '17:00', type: 'snack', label: 'Evening Snack', suggestion: 'Green Tea + Roasted Chana/Makhana' },
      { time: '18:30', type: 'dinner', label: 'Dinner (by 6:30 PM)', suggestion: 'Chapathi + Paneer/Chicken + Veggies + Curd' }
    ],
    exercise: { time: '15:30', suggestion: '2hr Walk + Gym (alt days) after shift' }
  },
  evening: {
    // Shift: 1:00 PM - 10:00 PM
    meals: [
      { time: '06:00', type: 'pre-workout', label: 'Pre-Workout', suggestion: 'Black coffee + Banana' },
      { time: '06:30', type: 'exercise', label: 'Exercise Window', suggestion: '2hr Walk + Gym (alt days)' },
      { time: '09:00', type: 'breakfast', label: 'Breakfast', suggestion: 'Oats/Millet Dosa + Eggs (3-4) + Veggies' },
      { time: '11:30', type: 'lunch', label: 'Early Lunch', suggestion: 'Rice + Chicken/Fish + Dal + Salad' },
      { time: '15:00', type: 'snack', label: 'Snack (at work)', suggestion: 'Protein Shake + Almonds' },
      { time: '18:00', type: 'dinner', label: 'Dinner (at work, by 6:30 PM MAX)', suggestion: 'Chapathi + Paneer/Egg + Veggies + Buttermilk' }
    ],
    exercise: { time: '06:30', suggestion: 'Morning exercise before shift' }
  },
  general: {
    // Shift: 9:00 AM - 6:00 PM
    meals: [
      { time: '06:00', type: 'pre-workout', label: 'Pre-Workout', suggestion: 'Black coffee + Banana' },
      { time: '06:30', type: 'exercise', label: 'Morning Walk', suggestion: '1hr Walk (remaining in evening)' },
      { time: '08:00', type: 'breakfast', label: 'Breakfast', suggestion: 'Oats/Eggs + Toast + Fruits' },
      { time: '11:00', type: 'snack', label: 'Mid-Morning Snack', suggestion: 'Buttermilk + Roasted Chana' },
      { time: '13:00', type: 'lunch', label: 'Lunch', suggestion: 'Rice/Chapathi + Chicken/Fish + Dal + Salad' },
      { time: '16:00', type: 'snack', label: 'Evening Snack', suggestion: 'Green Tea + Fruits/Makhana' },
      { time: '18:30', type: 'dinner', label: 'Dinner (by 6:30 PM)', suggestion: 'Chapathi + Paneer/Egg + Veggies + Curd' }
    ],
    exercise: { time: '18:45', suggestion: '1hr Walk (evening) + Gym (alt days)' }
  },
  compOff: {
    meals: [
      { time: '06:00', type: 'pre-workout', label: 'Pre-Workout', suggestion: 'Black coffee' },
      { time: '06:30', type: 'exercise', label: 'Exercise', suggestion: '2hr Walk + Gym' },
      { time: '09:00', type: 'breakfast', label: 'Breakfast', suggestion: 'Oats + Eggs (3-4) + Fruits' },
      { time: '12:00', type: 'snack', label: 'Mid-Day Snack', suggestion: 'Protein Shake + Almonds' },
      { time: '13:30', type: 'lunch', label: 'Lunch', suggestion: 'Rice + Chicken (200g) + Dal + Veggies' },
      { time: '16:00', type: 'snack', label: 'Evening Snack', suggestion: 'Green Tea + Makhana + Fruits' },
      { time: '18:30', type: 'dinner', label: 'Dinner (by 6:30 PM)', suggestion: 'Chapathi + Fish/Paneer + Curd + Salad' }
    ],
    exercise: { time: '06:30', suggestion: 'Full workout - Walk + Gym' }
  },
  off: {
    meals: [
      { time: '06:00', type: 'pre-workout', label: 'Pre-Workout', suggestion: 'Black coffee' },
      { time: '06:30', type: 'exercise', label: 'Exercise', suggestion: '2hr Walk + Gym' },
      { time: '09:00', type: 'breakfast', label: 'Breakfast', suggestion: 'Oats + Eggs + Fruits' },
      { time: '12:00', type: 'snack', label: 'Mid-Day Snack', suggestion: 'Buttermilk + Roasted Chana' },
      { time: '13:30', type: 'lunch', label: 'Lunch', suggestion: 'Millet/Rice + Chicken/Fish + Dal + Veggies' },
      { time: '16:00', type: 'snack', label: 'Evening Snack', suggestion: 'Green Tea + Fruits' },
      { time: '18:30', type: 'dinner', label: 'Dinner (by 6:30 PM)', suggestion: 'Chapathi + Egg/Paneer + Veggies + Curd' }
    ],
    exercise: { time: '06:30', suggestion: 'Full workout - Walk + Gym' }
  },
  leave: {
    meals: [
      { time: '07:00', type: 'pre-workout', label: 'Pre-Workout', suggestion: 'Black coffee' },
      { time: '07:30', type: 'exercise', label: 'Exercise', suggestion: '2hr Walk + Gym' },
      { time: '10:00', type: 'breakfast', label: 'Breakfast', suggestion: 'Oats + Eggs + Fruits' },
      { time: '13:00', type: 'lunch', label: 'Lunch', suggestion: 'Rice + Chicken + Dal + Veggies' },
      { time: '16:00', type: 'snack', label: 'Snack', suggestion: 'Green Tea + Makhana' },
      { time: '18:30', type: 'dinner', label: 'Dinner (by 6:30 PM)', suggestion: 'Light - Chapathi + Paneer + Salad' }
    ],
    exercise: { time: '07:30', suggestion: 'Full workout' }
  },
  unknown: {
    meals: [
      { time: '07:00', type: 'breakfast', label: 'Breakfast', suggestion: 'Oats/Eggs + Toast' },
      { time: '10:00', type: 'snack', label: 'Snack', suggestion: 'Fruits + Buttermilk' },
      { time: '13:00', type: 'lunch', label: 'Lunch', suggestion: 'Rice + Protein + Dal + Veggies' },
      { time: '16:00', type: 'snack', label: 'Snack', suggestion: 'Green Tea + Nuts' },
      { time: '18:30', type: 'dinner', label: 'Dinner', suggestion: 'Chapathi + Protein + Veggies' }
    ],
    exercise: { time: '06:30', suggestion: 'Walk + Gym' }
  }
};

// Sample meal templates with exact portions for calorie tracking
const MEAL_TEMPLATES = {
  breakfast: {
    highProtein: [
      { foods: [{ name: 'Whole Egg (boiled, 1 egg ~50g)', weight: 200 }, { name: 'Oats (cooked)', weight: 250 }, { name: 'Banana', weight: 100 }], label: '4 Boiled Eggs + Oats Bowl + Banana' },
      { foods: [{ name: 'Egg White (1 egg ~33g)', weight: 200 }, { name: 'Chapathi', weight: 120 }, { name: 'Spinach (cooked)', weight: 100 }], label: '6 Egg Whites + 2 Chapathi + Spinach' },
      { foods: [{ name: 'Oats (cooked)', weight: 300 }, { name: 'Whey Protein (1 scoop ~30g)', weight: 30 }, { name: 'Banana', weight: 100 }], label: 'Protein Oats + Banana' },
    ],
    balanced: [
      { foods: [{ name: 'Idli (1 piece ~60g)', weight: 240 }, { name: 'Whole Egg (boiled, 1 egg ~50g)', weight: 100 }, { name: 'Curd/Yogurt (low fat)', weight: 100 }], label: '4 Idlis + 2 Eggs + Curd' },
      { foods: [{ name: 'Dosa (plain)', weight: 150 }, { name: 'Whole Egg (boiled, 1 egg ~50g)', weight: 150 }], label: '2 Dosa + 3 Boiled Eggs' },
    ]
  },
  lunch: {
    highProtein: [
      { foods: [{ name: 'White Rice (cooked)', weight: 200 }, { name: 'Chicken Breast (cooked)', weight: 150 }, { name: 'Dal (Toor/Arhar, cooked)', weight: 150 }, { name: 'Mixed Vegetable Curry', weight: 100 }], label: 'Rice + Chicken Breast + Dal + Veggies' },
      { foods: [{ name: 'Chapathi', weight: 120 }, { name: 'Chicken Curry (homemade)', weight: 200 }, { name: 'Curd/Yogurt (low fat)', weight: 100 }, { name: 'Cucumber', weight: 100 }], label: '2 Chapathi + Chicken Curry + Curd + Salad' },
    ]
  },
  dinner: {
    light: [
      { foods: [{ name: 'Chapathi', weight: 60 }, { name: 'Paneer Bhurji', weight: 150 }, { name: 'Mixed Vegetable Curry', weight: 150 }, { name: 'Curd/Yogurt (low fat)', weight: 100 }], label: '1 Chapathi + Paneer Bhurji + Veggies + Curd' },
      { foods: [{ name: 'Chapathi', weight: 60 }, { name: 'Chicken Tikka', weight: 150 }, { name: 'Spinach (cooked)', weight: 150 }, { name: 'Buttermilk (chaas)', weight: 200 }], label: '1 Chapathi + Chicken Tikka + Spinach + Buttermilk' },
    ]
  }
};
