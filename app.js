// ==========================================
// CalTracker - Main Application Logic
// ==========================================

// Register Service Worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js')
    .then(reg => console.log('SW registered'))
    .catch(err => console.log('SW registration failed:', err));
}

// ==========================================
// STATE MANAGEMENT
// ==========================================

const APP_STATE = {
  currentDate: new Date().toISOString().split('T')[0],
  currentMealType: 'breakfast',
  selectedFood: null,
};

// ==========================================
// LOCAL STORAGE HELPERS
// ==========================================

function getStorage(key, defaultValue) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function setStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

// ==========================================
// USER PROFILE & MACRO CALCULATIONS
// ==========================================

function getProfile() {
  return getStorage('profile', {
    weight: 94,
    heightFt: 5,
    heightIn: 10,
    deficit: 500,
    gymDays: [1, 3, 5, 0] // Mon, Wed, Fri, Sun (0=Sunday)
  });
}

function saveProfile(profile) {
  setStorage('profile', profile);
  // Save weight history
  const history = getStorage('weightHistory', []);
  const today = new Date().toISOString().split('T')[0];
  const existingIdx = history.findIndex(h => h.date === today);
  if (existingIdx >= 0) {
    history[existingIdx].weight = profile.weight;
  } else {
    history.push({ date: today, weight: profile.weight });
  }
  setStorage('weightHistory', history);
}

function calculateMacros(profile) {
  const w = profile.weight;
  const maintenance = Math.round(w * 24);
  const target = maintenance - profile.deficit;
  const protein = Math.round(w * 1.8 * 10) / 10;
  const fat = Math.round(w * 0.7 * 10) / 10;
  const fiber = Math.round((target / 1000) * 14 * 10) / 10;
  const carbs = Math.round(((target - (protein * 4) - (fat * 9)) / 4) * 10) / 10;

  return {
    maintenance,
    target,
    protein,
    fat,
    fiber,
    carbs: Math.max(carbs, 0) // Ensure non-negative
  };
}

// ==========================================
// DAILY LOG MANAGEMENT
// ==========================================

function getDayLog(date) {
  return getStorage(`log_${date}`, {
    meals: [],
    exercises: [],
    water: 0,
    supplements: {
      omega3: false,
      magnesium: false,
      vitaminC: false,
      creatine: false
    }
  });
}

function saveDayLog(date, log) {
  setStorage(`log_${date}`, log);
}

function addFoodToLog(date, mealType, foodEntry) {
  const log = getDayLog(date);
  log.meals.push({
    ...foodEntry,
    mealType,
    timestamp: new Date().toISOString()
  });
  saveDayLog(date, log);
  return log;
}

function removeFoodFromLog(date, index) {
  const log = getDayLog(date);
  log.meals.splice(index, 1);
  saveDayLog(date, log);
  return log;
}

function addExercise(date, exercise) {
  const log = getDayLog(date);
  log.exercises.push({
    ...exercise,
    timestamp: new Date().toISOString()
  });
  saveDayLog(date, log);
  return log;
}

function updateWater(date, count) {
  const log = getDayLog(date);
  log.water = count;
  saveDayLog(date, log);
  return log;
}

function updateSupplement(date, supplement, taken) {
  const log = getDayLog(date);
  log.supplements[supplement] = taken;
  saveDayLog(date, log);
  return log;
}

// ==========================================
// CALORIE CALCULATIONS
// ==========================================

function getDayTotals(date) {
  const log = getDayLog(date);
  const totals = { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 };
  
  log.meals.forEach(meal => {
    totals.calories += meal.calories || 0;
    totals.protein += meal.protein || 0;
    totals.carbs += meal.carbs || 0;
    totals.fat += meal.fat || 0;
    totals.fiber += meal.fiber || 0;
  });

  return {
    ...totals,
    calories: Math.round(totals.calories),
    protein: Math.round(totals.protein * 10) / 10,
    carbs: Math.round(totals.carbs * 10) / 10,
    fat: Math.round(totals.fat * 10) / 10,
    fiber: Math.round(totals.fiber * 10) / 10
  };
}

function getExerciseCalories(date) {
  const log = getDayLog(date);
  return log.exercises.reduce((total, ex) => total + (ex.caloriesBurned || 0), 0);
}

// ==========================================
// UI RENDERING
// ==========================================

function renderDashboard() {
  const profile = getProfile();
  const macros = calculateMacros(profile);
  const totals = getDayTotals(APP_STATE.currentDate);
  const log = getDayLog(APP_STATE.currentDate);
  const exerciseCals = getExerciseCalories(APP_STATE.currentDate);

  // Update date
  const dateObj = new Date(APP_STATE.currentDate + 'T12:00:00');
  document.getElementById('current-date').textContent = dateObj.toLocaleDateString('en-IN', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
  });

  // Calorie ring
  const consumed = totals.calories;
  const target = macros.target;
  const progress = Math.min(consumed / target, 1.5);
  const ring = document.getElementById('calorie-ring');
  const circumference = 2 * Math.PI * 52;
  ring.style.strokeDasharray = circumference;
  ring.style.strokeDashoffset = circumference * (1 - progress);
  
  if (consumed > target) {
    ring.classList.add('over');
  } else {
    ring.classList.remove('over');
  }

  document.getElementById('cal-consumed').textContent = consumed;
  document.getElementById('cal-target').textContent = target;

  // Macro bars
  updateMacroBar('protein', totals.protein, macros.protein);
  updateMacroBar('carbs', totals.carbs, macros.carbs);
  updateMacroBar('fat', totals.fat, macros.fat);
  updateMacroBar('fiber', totals.fiber, macros.fiber);

  // Targets display
  document.getElementById('protein-target').textContent = Math.round(macros.protein);
  document.getElementById('carbs-target').textContent = Math.round(macros.carbs);
  document.getElementById('fat-target').textContent = Math.round(macros.fat);
  document.getElementById('fiber-target').textContent = Math.round(macros.fiber);

  // Shift info
  renderShiftCard();

  // Water tracker
  renderWaterTracker(log.water);

  // Exercise summary
  renderExerciseSummary(log.exercises, exerciseCals);

  // Supplements
  renderSupplements(log.supplements);

  // Today's meals
  renderTodaysMeals(log.meals);
}

function updateMacroBar(macro, consumed, target) {
  const pct = Math.min((consumed / target) * 100, 100);
  document.getElementById(`${macro}-consumed`).textContent = consumed;
  document.getElementById(`${macro}-bar`).style.width = `${pct}%`;
}

function renderShiftCard() {
  const shift = getDineshShift(APP_STATE.currentDate);
  const shiftEl = document.getElementById('today-shift');
  const briefEl = document.getElementById('meal-schedule-brief');
  
  if (shift.type === 'unknown') {
    shiftEl.textContent = 'No roster data for this date';
    briefEl.textContent = 'Upload new roster in Settings > Meal Plan tab';
  } else {
    shiftEl.textContent = shift.label;
    const plan = MEAL_PLANS[shift.type];
    if (plan && plan.meals.length > 0) {
      const nextMeal = getNextMeal(plan.meals);
      briefEl.textContent = nextMeal 
        ? `Next: ${nextMeal.label} at ${nextMeal.time}` 
        : 'All meals done for today!';
    }
  }
}

function getNextMeal(meals) {
  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes();
  
  for (const meal of meals) {
    const [h, m] = meal.time.split(':').map(Number);
    const mealTime = h * 60 + m;
    if (mealTime > currentTime) return meal;
  }
  return null;
}

function renderWaterTracker(count) {
  const container = document.getElementById('water-glasses');
  container.innerHTML = '';
  for (let i = 0; i < 10; i++) {
    const glass = document.createElement('button');
    glass.className = `water-glass ${i < count ? 'filled' : ''}`;
    glass.textContent = '💧';
    glass.onclick = () => {
      const newCount = i < count ? i : i + 1;
      updateWater(APP_STATE.currentDate, newCount);
      renderWaterTracker(newCount);
      document.getElementById('water-count').textContent = newCount;
    };
    container.appendChild(glass);
  }
  document.getElementById('water-count').textContent = count;
}

function renderExerciseSummary(exercises, totalCals) {
  const el = document.getElementById('exercise-summary');
  if (exercises.length === 0) {
    el.innerHTML = '<p class="muted">No exercise logged today</p>';
    return;
  }
  const activities = getActivities();
  el.innerHTML = exercises.map(ex => {
    const activity = activities.find(a => a.key === ex.type) || {};
    const icon = activity.icon || '🏃';
    return `<div class="exercise-item">
      <span>${icon} ${ex.type} - ${ex.duration} min</span>
      <span class="cal-burned">-${ex.caloriesBurned} kcal</span>
    </div>`;
  }).join('') + `<div class="exercise-total">Total burned: <strong>${totalCals} kcal</strong></div>`;
}

function renderSupplements(supplements) {
  const el = document.getElementById('supplements-checklist');
  const items = getSupplements();
  
  el.innerHTML = items.map(item => `
    <label class="supplement-item ${supplements[item.key] ? 'taken' : ''}">
      <input type="checkbox" ${supplements[item.key] ? 'checked' : ''} 
        onchange="toggleSupplement('${item.key}', this.checked)">
      <span>${item.icon} ${item.label}</span>
    </label>
  `).join('');
}

function toggleSupplement(key, taken) {
  updateSupplement(APP_STATE.currentDate, key, taken);
  showToast(`${taken ? '✅' : '❌'} Supplement ${taken ? 'taken' : 'unmarked'}`);
}

// ==========================================
// SUPPLEMENTS (Dynamic)
// ==========================================

const DEFAULT_SUPPLEMENTS = [
  { key: 'omega3', label: 'Omega-3 Fish Oil', icon: '🐟' },
  { key: 'magnesium', label: 'Magnesium Glycinate', icon: '💊' },
  { key: 'vitaminC', label: 'Vitamin C', icon: '🍊' },
  { key: 'creatine', label: 'Creatine (5g)', icon: '💪' }
];

function getSupplements() {
  return getStorage('supplements', DEFAULT_SUPPLEMENTS);
}

function saveSupplements(supplements) {
  setStorage('supplements', supplements);
}

function initSupplementManager() {
  document.getElementById('btn-add-supplement').addEventListener('click', addNewSupplement);
  renderSupplementManager();
}

function addNewSupplement() {
  const name = document.getElementById('new-supplement-name').value.trim();
  const icon = document.getElementById('new-supplement-icon').value.trim() || '💊';

  if (!name) { showToast('Enter supplement name'); return; }

  const supplements = getSupplements();
  const key = name.toLowerCase().replace(/[^a-z0-9]/g, '_');

  if (supplements.find(s => s.key === key)) {
    showToast('Supplement already exists');
    return;
  }

  supplements.push({ key, label: name, icon });
  saveSupplements(supplements);

  document.getElementById('new-supplement-name').value = '';
  document.getElementById('new-supplement-icon').value = '';

  renderSupplementManager();
  renderDashboard();
  showToast(`✅ Added "${name}"`);
}

function removeSupplement(key) {
  const supplements = getSupplements().filter(s => s.key !== key);
  saveSupplements(supplements);
  renderSupplementManager();
  renderDashboard();
  showToast('Supplement removed');
}

function renderSupplementManager() {
  const el = document.getElementById('supplement-manager-list');
  if (!el) return;
  const supplements = getSupplements();

  el.innerHTML = supplements.map(s => `
    <div class="manage-item">
      <span>${s.icon} ${s.label}</span>
      <button class="btn-remove" onclick="removeSupplement('${s.key}')">✕</button>
    </div>
  `).join('');
}

function renderTodaysMeals(meals) {
  const el = document.getElementById('todays-meals');
  if (meals.length === 0) {
    el.innerHTML = '<p class="muted">No meals logged yet. Tap "Log" to add food.</p>';
    return;
  }

  const grouped = {};
  meals.forEach((meal, idx) => {
    if (!grouped[meal.mealType]) grouped[meal.mealType] = [];
    grouped[meal.mealType].push({ ...meal, idx });
  });

  el.innerHTML = Object.entries(grouped).map(([type, items]) => `
    <div class="meal-group">
      <h4 class="meal-group-title">${type.charAt(0).toUpperCase() + type.slice(1)}</h4>
      ${items.map(item => `
        <div class="meal-item">
          <div class="meal-item-info">
            <span class="meal-item-name">${item.name}</span>
            <span class="meal-item-detail">${item.weight}g · ${item.calories} kcal · P:${item.protein}g C:${item.carbs}g F:${item.fat}g</span>
          </div>
          <button class="btn-remove" onclick="removeFood(${item.idx})">✕</button>
        </div>
      `).join('')}
    </div>
  `).join('');
}

function removeFood(index) {
  removeFoodFromLog(APP_STATE.currentDate, index);
  renderDashboard();
  showToast('Food removed');
}

// ==========================================
// FOOD LOGGING
// ==========================================

function initFoodSearch() {
  const searchInput = document.getElementById('food-search');
  const suggestionsEl = document.getElementById('food-suggestions');
  const weightInput = document.getElementById('food-weight');

  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.trim();
    const results = searchFoods(query);
    
    if (results.length === 0) {
      suggestionsEl.classList.add('hidden');
      return;
    }

    suggestionsEl.innerHTML = results.map(food => `
      <div class="suggestion-item" data-food='${JSON.stringify(food).replace(/'/g, "&#39;")}'>
        <span class="food-name">${food.name}</span>
        <span class="food-cal">${food.calories} kcal/100g</span>
      </div>
    `).join('');
    suggestionsEl.classList.remove('hidden');

    suggestionsEl.querySelectorAll('.suggestion-item').forEach(item => {
      item.addEventListener('click', () => {
        const food = JSON.parse(item.dataset.food);
        selectFood(food);
        suggestionsEl.classList.add('hidden');
        searchInput.value = food.name;
      });
    });
  });

  // Close suggestions on outside click
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.search-container')) {
      suggestionsEl.classList.add('hidden');
    }
  });

  // Weight input change - update preview
  weightInput.addEventListener('input', () => {
    if (APP_STATE.selectedFood) {
      updateNutritionPreview();
    }
  });
}

function selectFood(food) {
  APP_STATE.selectedFood = food;
  document.getElementById('selected-food-name').textContent = food.name;
  document.getElementById('food-entry-form').classList.remove('hidden');
  document.getElementById('food-weight').value = 100;
  document.getElementById('food-weight').focus();
  updateNutritionPreview();
}

function updateNutritionPreview() {
  const weight = parseFloat(document.getElementById('food-weight').value) || 0;
  const food = APP_STATE.selectedFood;
  if (!food) return;

  const nutrition = getNutrition(food, weight);
  document.getElementById('preview-cal').textContent = nutrition.calories;
  document.getElementById('preview-protein').textContent = nutrition.protein + 'g';
  document.getElementById('preview-carbs').textContent = nutrition.carbs + 'g';
  document.getElementById('preview-fat').textContent = nutrition.fat + 'g';
  document.getElementById('preview-fiber').textContent = nutrition.fiber + 'g';
}

function addFoodEntry() {
  const weight = parseFloat(document.getElementById('food-weight').value);
  if (!weight || !APP_STATE.selectedFood) {
    showToast('Please enter weight in grams');
    return;
  }

  const nutrition = getNutrition(APP_STATE.selectedFood, weight);
  addFoodToLog(APP_STATE.currentDate, APP_STATE.currentMealType, nutrition);
  
  // Reset form
  document.getElementById('food-search').value = '';
  document.getElementById('food-entry-form').classList.add('hidden');
  document.getElementById('food-weight').value = '';
  APP_STATE.selectedFood = null;

  showToast(`✅ Added ${nutrition.name} (${weight}g)`);
  renderDashboard();
}

function addCustomFood() {
  const name = document.getElementById('custom-food-name').value.trim();
  const weight = parseFloat(document.getElementById('custom-food-weight').value) || 0;
  const calories = parseFloat(document.getElementById('custom-cal').value) || 0;
  const protein = parseFloat(document.getElementById('custom-protein').value) || 0;
  const carbs = parseFloat(document.getElementById('custom-carbs').value) || 0;
  const fat = parseFloat(document.getElementById('custom-fat').value) || 0;
  const fiber = parseFloat(document.getElementById('custom-fiber').value) || 0;

  if (!name) {
    showToast('Please enter food name');
    return;
  }

  const entry = { name, weight, calories, protein, carbs, fat, fiber };
  addFoodToLog(APP_STATE.currentDate, APP_STATE.currentMealType, entry);

  // Clear form
  ['custom-food-name', 'custom-food-weight', 'custom-cal', 'custom-protein', 'custom-carbs', 'custom-fat', 'custom-fiber']
    .forEach(id => document.getElementById(id).value = '');

  showToast(`✅ Added ${name}`);
  renderDashboard();
}

// ==========================================
// EXERCISE (Dynamic Activities)
// ==========================================

const DEFAULT_ACTIVITIES = [
  { key: 'walk', label: 'Walking (brisk)', icon: '🚶', calPerMin: 3.3 },
  { key: 'gym_strength', label: 'Gym - Strength', icon: '🏋️', calPerMin: 5 },
  { key: 'gym_cardio', label: 'Gym - Cardio', icon: '🏃', calPerMin: 7 },
  { key: 'gym_mixed', label: 'Gym - Mixed', icon: '💪', calPerMin: 6 },
  { key: 'cycling', label: 'Cycling', icon: '🚴', calPerMin: 6.5 },
  { key: 'swimming', label: 'Swimming', icon: '🏊', calPerMin: 8 },
  { key: 'yoga', label: 'Yoga', icon: '🧘', calPerMin: 3 },
  { key: 'sports', label: 'Sports (Cricket/Badminton)', icon: '🏏', calPerMin: 5.5 },
  { key: 'stairs', label: 'Stair Climbing', icon: '🪜', calPerMin: 9 },
  { key: 'stretching', label: 'Stretching', icon: '🤸', calPerMin: 2.5 },
];

function getActivities() {
  return getStorage('activities', DEFAULT_ACTIVITIES);
}

function saveActivities(activities) {
  setStorage('activities', activities);
}

function initExercise() {
  const durationInput = document.getElementById('activity-duration');
  const activitySelect = document.getElementById('activity-select');

  // Populate activity dropdown
  renderActivitySelect();

  activitySelect.addEventListener('change', updateActivityCalories);
  durationInput.addEventListener('input', updateActivityCalories);

  function updateActivityCalories() {
    const activities = getActivities();
    const selected = activities.find(a => a.key === activitySelect.value);
    const mins = parseInt(durationInput.value) || 0;
    const cals = selected ? Math.round(mins * selected.calPerMin) : 0;
    document.getElementById('activity-calories').textContent = `~${cals}`;
  }

  // Render gym schedule
  renderGymSchedule();
  
  // Render activity manager list
  renderActivityManager();

  // Event listeners
  document.getElementById('btn-log-activity').addEventListener('click', logActivity);
  document.getElementById('btn-add-activity').addEventListener('click', addNewActivity);
}

function renderActivitySelect() {
  const select = document.getElementById('activity-select');
  const activities = getActivities();
  select.innerHTML = activities.map(a => 
    `<option value="${a.key}">${a.icon} ${a.label} (~${a.calPerMin} cal/min)</option>`
  ).join('');
  // Trigger calorie update
  const durationInput = document.getElementById('activity-duration');
  const mins = parseInt(durationInput.value) || 0;
  const selected = activities[0];
  if (selected) {
    document.getElementById('activity-calories').textContent = `~${Math.round(mins * selected.calPerMin)}`;
  }
}

function logActivity() {
  const activities = getActivities();
  const select = document.getElementById('activity-select');
  const duration = parseInt(document.getElementById('activity-duration').value) || 0;
  const selected = activities.find(a => a.key === select.value);

  if (!selected || duration <= 0) {
    showToast('Select activity and enter duration');
    return;
  }

  const cals = Math.round(duration * selected.calPerMin);
  addExercise(APP_STATE.currentDate, {
    type: selected.key,
    label: selected.label,
    icon: selected.icon,
    duration,
    caloriesBurned: cals
  });
  showToast(`${selected.icon} Logged ${duration} min ${selected.label} (-${cals} kcal)`);
  renderDashboard();
  renderExerciseLog();
}

function addNewActivity() {
  const name = document.getElementById('new-activity-name').value.trim();
  const icon = document.getElementById('new-activity-icon').value.trim() || '🏃';
  const calPerMin = parseFloat(document.getElementById('new-activity-calmin').value);

  if (!name) { showToast('Enter activity name'); return; }
  if (!calPerMin || calPerMin <= 0) { showToast('Enter calories/min'); return; }

  const activities = getActivities();
  const key = name.toLowerCase().replace(/[^a-z0-9]/g, '_');
  
  if (activities.find(a => a.key === key)) {
    showToast('Activity already exists');
    return;
  }

  activities.push({ key, label: name, icon, calPerMin });
  saveActivities(activities);

  // Clear form
  document.getElementById('new-activity-name').value = '';
  document.getElementById('new-activity-icon').value = '';
  document.getElementById('new-activity-calmin').value = '';

  renderActivitySelect();
  renderActivityManager();
  showToast(`✅ Added "${name}"`);
}

function removeActivity(key) {
  const activities = getActivities().filter(a => a.key !== key);
  saveActivities(activities);
  renderActivitySelect();
  renderActivityManager();
  showToast('Activity removed');
}

function renderActivityManager() {
  const el = document.getElementById('activity-list');
  const activities = getActivities();
  
  el.innerHTML = activities.map(a => `
    <div class="manage-item">
      <span>${a.icon} ${a.label} <small class="muted">(${a.calPerMin} cal/min)</small></span>
      <button class="btn-remove" onclick="removeActivity('${a.key}')">✕</button>
    </div>
  `).join('');
}

function renderExerciseLog() {
  const log = getDayLog(APP_STATE.currentDate);
  const el = document.getElementById('exercise-log');
  
  if (log.exercises.length === 0) {
    el.innerHTML = '<p class="muted">No exercises logged today</p>';
    return;
  }

  const activities = getActivities();
  el.innerHTML = log.exercises.map((ex, idx) => {
    const activity = activities.find(a => a.key === ex.type) || {};
    const icon = ex.icon || activity.icon || '🏃';
    return `<div class="exercise-log-item">
      <span>${icon} ${ex.label || ex.type} - ${ex.duration} min - ${ex.caloriesBurned} kcal</span>
      <button class="btn-remove" onclick="removeExercise(${idx})">✕</button>
    </div>`;
  }).join('');
}

function removeExercise(index) {
  const log = getDayLog(APP_STATE.currentDate);
  log.exercises.splice(index, 1);
  saveDayLog(APP_STATE.currentDate, log);
  renderDashboard();
  renderExerciseLog();
  showToast('Exercise removed');
}

function renderGymSchedule() {
  const profile = getProfile();
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const el = document.getElementById('gym-week-plan');
  
  el.innerHTML = days.map((day, idx) => {
    const isGymDay = profile.gymDays.includes(idx);
    return `<span class="gym-day ${isGymDay ? 'active' : ''}">${day}</span>`;
  }).join('');
}

// ==========================================
// MEAL PLAN & SHIFT
// ==========================================

function renderMealPlan() {
  const shift = getDineshShift(APP_STATE.currentDate);
  const plan = MEAL_PLANS[shift.type] || MEAL_PLANS.unknown;
  const profile = getProfile();
  const macros = calculateMacros(profile);

  // Shift info
  document.getElementById('plan-shift-info').innerHTML = `
    <p><strong>Shift:</strong> ${shift.label}</p>
    <p><strong>Target Calories:</strong> ${macros.target} kcal</p>
    <p><strong>Dinner Cutoff:</strong> 6:30 PM (max 7:00 PM)</p>
  `;

  // Meal plan
  document.getElementById('meal-plan-content').innerHTML = plan.meals.map(meal => `
    <div class="plan-meal-item">
      <div class="plan-time">${meal.time}</div>
      <div class="plan-details">
        <strong>${meal.label}</strong>
        <p>${meal.suggestion}</p>
      </div>
    </div>
  `).join('');

  // Meal timing
  document.getElementById('meal-timing').innerHTML = `
    <div class="timing-info">
      <p>⏰ <strong>Exercise:</strong> ${plan.exercise.time} - ${plan.exercise.suggestion}</p>
      <p>🍽️ <strong>Dinner cutoff:</strong> 6:30 PM (latest 7:00 PM)</p>
      <p>⚡ <strong>Supplements:</strong> Take with breakfast (Omega-3, Vit C, Creatine) & before bed (Magnesium)</p>
    </div>
  `;

  // Roster display
  renderRoster();
}

function renderRoster() {
  const el = document.getElementById('roster-display');
  
  // Merge hardcoded + custom roster dates
  const customRoster = getCustomRoster();
  const allDates = new Set([...Object.keys(SHIFT_ROSTER), ...Object.keys(customRoster)]);
  const dates = [...allDates].sort();
  
  if (dates.length === 0) {
    el.innerHTML = '<p class="muted">No roster data loaded. Tap "Edit Roster" to add your shifts.</p>';
    return;
  }

  const month = dates[0].substring(0, 7);
  el.innerHTML = `
    <p><strong>Loaded:</strong> ${month} (${dates.length} days)</p>
    <div class="roster-grid">
      ${dates.map(date => {
        const shift = getDineshShift(date);
        const d = new Date(date + 'T12:00:00');
        const isToday = date === APP_STATE.currentDate;
        const typeClass = shift.type;
        return `<div class="roster-day ${typeClass} ${isToday ? 'today' : ''}" title="${date}: ${shift.label}">
          <span class="roster-date">${d.getDate()}</span>
          <span class="roster-shift">${shift.type.charAt(0).toUpperCase()}</span>
        </div>`;
      }).join('')}
    </div>
    <div class="roster-legend">
      <span class="legend-item"><span class="dot morning"></span> Morning</span>
      <span class="legend-item"><span class="dot evening"></span> Evening</span>
      <span class="legend-item"><span class="dot general"></span> General</span>
      <span class="legend-item"><span class="dot compOff"></span> Comp Off</span>
    </div>
  `;
}

// ==========================================
// ROSTER EDITOR
// ==========================================

function initRosterEditor() {
  document.getElementById('btn-edit-roster').addEventListener('click', () => {
    const editor = document.getElementById('roster-editor');
    editor.classList.toggle('hidden');
  });

  document.getElementById('btn-load-month').addEventListener('click', loadRosterMonth);
  document.getElementById('btn-save-roster').addEventListener('click', saveRosterEdits);
}

function loadRosterMonth() {
  const monthInput = document.getElementById('roster-month').value;
  if (!monthInput) {
    showToast('Select a month');
    return;
  }

  const [year, month] = monthInput.split('-').map(Number);
  const daysInMonth = new Date(year, month, 0).getDate();
  const grid = document.getElementById('roster-edit-grid');
  const customRoster = getCustomRoster();

  const shiftOptions = ['morning', 'evening', 'general', 'compOff', 'leave', 'off'];
  
  let html = '<div class="roster-edit-list">';
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const d = new Date(dateStr + 'T12:00:00');
    const dayName = d.toLocaleDateString('en-IN', { weekday: 'short' });
    
    // Determine current shift for this date
    const currentShift = getDineshShift(dateStr);
    
    html += `
      <div class="roster-edit-row">
        <div class="roster-edit-date">
          <strong>${day}</strong> <small>${dayName}</small>
        </div>
        <select class="roster-shift-select" data-date="${dateStr}">
          ${shiftOptions.map(opt => `
            <option value="${opt}" ${currentShift.type === opt ? 'selected' : ''}>
              ${opt === 'compOff' ? 'Comp Off' : opt.charAt(0).toUpperCase() + opt.slice(1)}
            </option>
          `).join('')}
        </select>
      </div>
    `;
  }
  html += '</div>';
  
  grid.innerHTML = html;
  document.getElementById('btn-save-roster').classList.remove('hidden');
}

function saveRosterEdits() {
  const selects = document.querySelectorAll('.roster-shift-select');
  const customRoster = getCustomRoster();
  
  selects.forEach(select => {
    const date = select.dataset.date;
    const shiftType = select.value;
    customRoster[date] = { type: shiftType };
  });

  saveCustomRoster(customRoster);
  renderRoster();
  renderDashboard();
  showToast('✅ Roster saved!');
}

// ==========================================
// SETTINGS
// ==========================================

function initSettings() {
  const profile = getProfile();
  document.getElementById('setting-weight').value = profile.weight;
  document.getElementById('setting-height-ft').value = profile.heightFt;
  document.getElementById('setting-height-in').value = profile.heightIn;
  document.getElementById('setting-deficit').value = profile.deficit;
  
  renderCalculatedGoals();
  renderWeightHistory();
}

function saveSettings() {
  const weight = parseFloat(document.getElementById('setting-weight').value);
  const heightFt = parseInt(document.getElementById('setting-height-ft').value);
  const heightIn = parseInt(document.getElementById('setting-height-in').value);
  const deficit = parseInt(document.getElementById('setting-deficit').value);

  if (!weight || weight < 30 || weight > 300) {
    showToast('Enter valid weight (30-300 kg)');
    return;
  }

  const profile = getProfile();
  profile.weight = weight;
  profile.heightFt = heightFt || profile.heightFt;
  profile.heightIn = heightIn !== undefined ? heightIn : profile.heightIn;
  profile.deficit = deficit || 500;

  saveProfile(profile);
  renderCalculatedGoals();
  renderWeightHistory();
  renderDashboard();
  showToast('✅ Profile saved! All goals recalculated.');
}

function renderCalculatedGoals() {
  const profile = getProfile();
  const macros = calculateMacros(profile);
  const el = document.getElementById('calculated-goals');

  const heightCm = Math.round((profile.heightFt * 30.48) + (profile.heightIn * 2.54));
  const bmi = (profile.weight / ((heightCm / 100) ** 2)).toFixed(1);

  el.innerHTML = `
    <div class="goals-grid">
      <div class="goal-item">
        <span class="goal-label">Weight</span>
        <span class="goal-value">${profile.weight} kg</span>
      </div>
      <div class="goal-item">
        <span class="goal-label">Height</span>
        <span class="goal-value">${profile.heightFt}'${profile.heightIn}" (${heightCm} cm)</span>
      </div>
      <div class="goal-item">
        <span class="goal-label">BMI</span>
        <span class="goal-value">${bmi}</span>
      </div>
      <div class="goal-item highlight">
        <span class="goal-label">Maintenance</span>
        <span class="goal-value">${macros.maintenance} kcal</span>
        <small>weight × 24</small>
      </div>
      <div class="goal-item highlight">
        <span class="goal-label">Target (Deficit)</span>
        <span class="goal-value">${macros.target} kcal</span>
        <small>-${profile.deficit} deficit</small>
      </div>
      <div class="goal-item">
        <span class="goal-label">Protein</span>
        <span class="goal-value">${macros.protein}g</span>
        <small>weight × 1.8</small>
      </div>
      <div class="goal-item">
        <span class="goal-label">Fat</span>
        <span class="goal-value">${macros.fat}g</span>
        <small>weight × 0.7</small>
      </div>
      <div class="goal-item">
        <span class="goal-label">Carbs</span>
        <span class="goal-value">${macros.carbs}g</span>
        <small>(cal - P×4 - F×9) / 4</small>
      </div>
      <div class="goal-item">
        <span class="goal-label">Fiber</span>
        <span class="goal-value">${macros.fiber}g</span>
        <small>cal/1000 × 14</small>
      </div>
    </div>
  `;
}

function renderWeightHistory() {
  const history = getStorage('weightHistory', []).slice(-30);
  const el = document.getElementById('weight-history');
  
  if (history.length === 0) {
    el.innerHTML = '<p class="muted">No weight history yet</p>';
    return;
  }

  const latest = history[history.length - 1];
  const first = history[0];
  const change = (latest.weight - first.weight).toFixed(1);
  const changeSign = change > 0 ? '+' : '';

  el.innerHTML = `
    <p>Started: ${first.weight} kg → Current: ${latest.weight} kg 
    (<span class="${change < 0 ? 'text-green' : 'text-red'}">${changeSign}${change} kg</span>)</p>
    <div class="weight-entries">
      ${history.slice(-7).reverse().map(h => `
        <div class="weight-entry">
          <span>${new Date(h.date + 'T12:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
          <span>${h.weight} kg</span>
        </div>
      `).join('')}
    </div>
  `;

  // Simple chart
  renderWeightChart(history);
}

function renderWeightChart(history) {
  const canvas = document.getElementById('weight-chart');
  if (!canvas || history.length < 2) return;
  
  const ctx = canvas.getContext('2d');
  const width = canvas.width = canvas.parentElement.offsetWidth - 32;
  const height = canvas.height = 150;
  const padding = 30;

  ctx.clearRect(0, 0, width, height);

  const weights = history.map(h => h.weight);
  const minW = Math.min(...weights) - 1;
  const maxW = Math.max(...weights) + 1;
  const range = maxW - minW || 1;

  // Draw grid
  ctx.strokeStyle = '#333';
  ctx.lineWidth = 0.5;
  for (let i = 0; i <= 4; i++) {
    const y = padding + ((height - 2 * padding) * i / 4);
    ctx.beginPath();
    ctx.moveTo(padding, y);
    ctx.lineTo(width - padding, y);
    ctx.stroke();
    
    ctx.fillStyle = '#888';
    ctx.font = '10px Inter';
    ctx.fillText((maxW - (range * i / 4)).toFixed(1), 0, y + 4);
  }

  // Draw line
  ctx.strokeStyle = '#4ecdc4';
  ctx.lineWidth = 2;
  ctx.beginPath();
  
  history.forEach((h, i) => {
    const x = padding + (i / (history.length - 1)) * (width - 2 * padding);
    const y = padding + ((maxW - h.weight) / range) * (height - 2 * padding);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.stroke();

  // Draw points
  ctx.fillStyle = '#4ecdc4';
  history.forEach((h, i) => {
    const x = padding + (i / (history.length - 1)) * (width - 2 * padding);
    const y = padding + ((maxW - h.weight) / range) * (height - 2 * padding);
    ctx.beginPath();
    ctx.arc(x, y, 3, 0, Math.PI * 2);
    ctx.fill();
  });
}

// ==========================================
// LEARNING TRACKER
// ==========================================

const DEFAULT_LEARNING_TOPICS = [
  { key: 'aws', label: 'AWS', icon: '☁️', tools: ['EC2', 'EKS', 'ECS', 'Lambda', 'S3', 'IAM', 'VPC', 'CloudFormation', 'Route53', 'CloudWatch', 'RDS', 'DynamoDB', 'SQS', 'SNS', 'API Gateway', 'CodePipeline', 'Secrets Manager', 'WAF', 'GuardDuty', 'ECR', 'Fargate', 'Step Functions'] },
  { key: 'kubernetes', label: 'Kubernetes', icon: '⎈', tools: ['Pods', 'Deployments', 'Services', 'Ingress', 'ConfigMaps', 'Secrets', 'StatefulSets', 'DaemonSets', 'HPA', 'VPA', 'RBAC', 'Network Policies', 'Helm', 'Kustomize', 'Operators', 'CRDs', 'Service Mesh', 'Pod Security', 'Resource Quotas', 'Namespaces'] },
  { key: 'keda', label: 'KEDA', icon: '⚡', tools: ['ScaledObject', 'ScaledJob', 'TriggerAuthentication', 'HTTP Scaler', 'Kafka Scaler', 'AWS Scalers', 'Prometheus Scaler', 'Cron Scaler', 'Custom Scalers'] },
  { key: 'networking', label: 'Networking', icon: '🌐', tools: ['TCP/IP', 'DNS', 'HTTP/HTTPS', 'Load Balancers', 'Firewalls', 'VPN', 'CDN', 'SSL/TLS', 'CIDR', 'Subnetting', 'NAT', 'Proxy', 'BGP', 'OSI Model', 'mTLS', 'Service Discovery'] },
  { key: 'github_cicd', label: 'GitHub CI/CD', icon: '🔄', tools: ['GitHub Actions', 'Workflows', 'Runners', 'Matrix Builds', 'Reusable Workflows', 'Composite Actions', 'Environments', 'Secrets', 'OIDC', 'Artifact Management', 'Caching', 'Container Actions'] },
  { key: 'terraform', label: 'Terraform', icon: '🏗️', tools: ['HCL', 'Providers', 'Modules', 'State Management', 'Backends', 'Workspaces', 'Variables', 'Outputs', 'Data Sources', 'Provisioners', 'Import', 'Moved Blocks', 'Terragrunt', 'Atlantis', 'Sentinel', 'tfvars'] },
  { key: 'observability', label: 'Observability', icon: '📡', tools: ['Prometheus', 'Grafana', 'Loki', 'Tempo', 'Metrics', 'Logs', 'Traces', 'AlertManager', 'PromQL', 'LogQL', 'Dashboards', 'SLO/SLA/SLI', 'OpenTelemetry', 'Jaeger', 'Mimir', 'Thanos', 'PagerDuty', 'Datadog'] },
  { key: 'ai', label: 'AI / ML', icon: '🤖', tools: ['LLMs', 'Prompt Engineering', 'RAG', 'LangChain', 'Vector DBs', 'Fine-tuning', 'MLOps', 'SageMaker', 'Bedrock', 'AI Agents', 'Copilot', 'OpenAI API', 'HuggingFace', 'Model Serving'] },
  { key: 'devsecops', label: 'DevSecOps', icon: '🛡️', tools: ['SAST', 'DAST', 'SCA', 'Container Scanning', 'Trivy', 'Snyk', 'Checkov', 'tfsec', 'OPA/Gatekeeper', 'Vault', 'Secret Management', 'SBOM', 'Supply Chain Security', 'Policy as Code', 'Compliance as Code'] },
  { key: 'linux', label: 'Linux', icon: '🐧', tools: ['Shell Scripting', 'Systemd', 'cgroups', 'namespaces', 'iptables/nftables', 'strace', 'Performance Tuning', 'File Systems', 'SELinux', 'SSH', 'Package Management'] },
  { key: 'docker', label: 'Docker / Containers', icon: '🐳', tools: ['Dockerfile', 'Multi-stage Builds', 'Docker Compose', 'Buildx', 'Image Optimization', 'Registry', 'Networking', 'Volumes', 'Security Scanning', 'Rootless Containers', 'Podman'] },
  { key: 'gitops', label: 'GitOps', icon: '📦', tools: ['ArgoCD', 'Flux', 'App of Apps', 'ApplicationSets', 'Sync Policies', 'Rollbacks', 'Progressive Delivery', 'Argo Rollouts', 'Flagger'] },
  { key: 'python', label: 'Python / Go', icon: '🐍', tools: ['Python Scripting', 'Boto3', 'FastAPI', 'Flask', 'Go Basics', 'Go CLI Tools', 'Automation Scripts', 'Testing'] },
  { key: 'databases', label: 'Databases', icon: '🗄️', tools: ['MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'Elasticsearch', 'DynamoDB', 'Database Scaling', 'Replication', 'Backup/Restore', 'Query Optimization'] },
  { key: 'messaging', label: 'Messaging / Streaming', icon: '📨', tools: ['Kafka', 'RabbitMQ', 'SQS/SNS', 'Event-Driven Architecture', 'Pub/Sub', 'Stream Processing', 'Dead Letter Queues'] },
  { key: 'sre', label: 'SRE Practices', icon: '🔧', tools: ['Incident Management', 'Postmortems', 'Runbooks', 'Chaos Engineering', 'Capacity Planning', 'Toil Reduction', 'Error Budgets', 'On-Call', 'Game Days', 'Disaster Recovery'] },
];

const DEFAULT_LEARN_PROFILE = {
  designation: 'DevOps/SRE Engineer',
  dailyGoalMins: 60,
};

function getLearningTopics() {
  return getStorage('learningTopics', DEFAULT_LEARNING_TOPICS);
}

function saveLearningTopics(topics) {
  setStorage('learningTopics', topics);
}

function getLearnProfile() {
  return getStorage('learnProfile', DEFAULT_LEARN_PROFILE);
}

function saveLearnProfile(profile) {
  setStorage('learnProfile', profile);
}

function getLearningLog(date) {
  return getStorage(`learn_${date}`, []);
}

function saveLearningLog(date, log) {
  setStorage(`learn_${date}`, log);
}

function initLearning() {
  const topicSelect = document.getElementById('learn-topic-select');
  const subtopicSelect = document.getElementById('learn-subtopic-select');

  // Load profile
  const profile = getLearnProfile();
  document.getElementById('learn-designation').value = profile.designation;
  document.getElementById('learn-daily-goal').value = profile.dailyGoalMins;

  // Populate topic dropdown
  renderTopicSelects();

  topicSelect.addEventListener('change', () => {
    renderSubtopicSelect(topicSelect.value);
  });

  // Event listeners
  document.getElementById('btn-save-learn-profile').addEventListener('click', () => {
    const designation = document.getElementById('learn-designation').value.trim();
    const dailyGoalMins = parseInt(document.getElementById('learn-daily-goal').value) || 60;
    saveLearnProfile({ designation, dailyGoalMins });
    showToast('✅ Learning profile saved');
    renderLearningTab();
  });

  document.getElementById('btn-log-learning').addEventListener('click', logLearning);
  document.getElementById('btn-add-topic').addEventListener('click', addNewTopic);

  renderLearningTab();
}

function renderTopicSelects() {
  const topics = getLearningTopics();
  const select = document.getElementById('learn-topic-select');
  select.innerHTML = topics.map(t => `<option value="${t.key}">${t.icon} ${t.label}</option>`).join('');
  if (topics.length > 0) {
    renderSubtopicSelect(topics[0].key);
  }
}

function renderSubtopicSelect(topicKey) {
  const topics = getLearningTopics();
  const topic = topics.find(t => t.key === topicKey);
  const select = document.getElementById('learn-subtopic-select');
  if (!topic || !topic.tools.length) {
    select.innerHTML = '<option value="general">General</option>';
    return;
  }
  select.innerHTML = '<option value="general">General / Overview</option>' +
    topic.tools.map(tool => `<option value="${tool}">${tool}</option>`).join('');
}

function logLearning() {
  const topicKey = document.getElementById('learn-topic-select').value;
  const subtopic = document.getElementById('learn-subtopic-select').value;
  const duration = parseInt(document.getElementById('learn-duration').value) || 0;
  const notes = document.getElementById('learn-notes').value.trim();

  if (duration <= 0) { showToast('Enter duration'); return; }

  const topics = getLearningTopics();
  const topic = topics.find(t => t.key === topicKey);
  if (!topic) { showToast('Select a topic'); return; }

  const log = getLearningLog(APP_STATE.currentDate);
  log.push({
    topicKey,
    topicLabel: topic.label,
    topicIcon: topic.icon,
    subtopic,
    duration,
    notes,
    timestamp: new Date().toISOString()
  });
  saveLearningLog(APP_STATE.currentDate, log);

  document.getElementById('learn-notes').value = '';
  showToast(`${topic.icon} Logged ${duration} min of ${topic.label}`);
  renderLearningTab();
}

function removeLearningEntry(index) {
  const log = getLearningLog(APP_STATE.currentDate);
  log.splice(index, 1);
  saveLearningLog(APP_STATE.currentDate, log);
  renderLearningTab();
  showToast('Entry removed');
}

function renderLearningTab() {
  const profile = getLearnProfile();
  const log = getLearningLog(APP_STATE.currentDate);
  const totalMins = log.reduce((sum, e) => sum + e.duration, 0);
  const goal = profile.dailyGoalMins;
  const pct = Math.min(Math.round((totalMins / goal) * 100), 100);

  // Progress
  document.getElementById('learn-today-mins').textContent = totalMins;
  document.getElementById('learn-goal-mins').textContent = goal;
  document.getElementById('learn-today-pct').textContent = pct + '%';
  document.getElementById('learn-progress-bar').style.width = pct + '%';

  // Today's log
  const logEl = document.getElementById('learn-today-log');
  if (log.length === 0) {
    logEl.innerHTML = '<p class="muted" style="margin-top:12px">No learning logged today. Start learning!</p>';
  } else {
    logEl.innerHTML = log.map((entry, idx) => `
      <div class="learn-log-item">
        <div class="learn-log-info">
          <span class="learn-log-topic">${entry.topicIcon} ${entry.topicLabel}</span>
          <span class="learn-log-detail">${entry.subtopic} · ${entry.duration} min${entry.notes ? ' · ' + entry.notes : ''}</span>
        </div>
        <button class="btn-remove" onclick="removeLearningEntry(${idx})">✕</button>
      </div>
    `).join('');
  }

  // Streak
  renderLearningStreak();

  // Skill map
  renderSkillMap();

  // Topic manager
  renderTopicManager();
}

function renderLearningStreak() {
  const el = document.getElementById('learn-streak-display');
  let streak = 0;
  const today = new Date();

  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const log = getLearningLog(dateStr);
    if (log.length > 0) {
      streak++;
    } else if (i > 0) {
      break;
    }
  }

  // Last 14 days heatmap
  const days = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const log = getLearningLog(dateStr);
    const mins = log.reduce((sum, e) => sum + e.duration, 0);
    days.push({ date: dateStr, mins, day: d.toLocaleDateString('en-IN', { weekday: 'narrow' }) });
  }

  el.innerHTML = `
    <div class="streak-number">${streak} day${streak !== 1 ? 's' : ''} 🔥</div>
    <div class="streak-heatmap">
      ${days.map(d => {
        const level = d.mins === 0 ? 0 : d.mins < 30 ? 1 : d.mins < 60 ? 2 : 3;
        return `<div class="heatmap-cell level-${level}" title="${d.date}: ${d.mins} min">
          <span class="heatmap-day">${d.day}</span>
        </div>`;
      }).join('')}
    </div>
    <div class="heatmap-legend">
      <small>Less</small>
      <div class="heatmap-cell level-0 small"></div>
      <div class="heatmap-cell level-1 small"></div>
      <div class="heatmap-cell level-2 small"></div>
      <div class="heatmap-cell level-3 small"></div>
      <small>More</small>
    </div>
  `;
}

function renderSkillMap() {
  const el = document.getElementById('skill-map');
  const topics = getLearningTopics();

  // Aggregate all time across all dates for each topic
  const topicHours = {};
  topics.forEach(t => { topicHours[t.key] = 0; });

  // Scan last 90 days
  const today = new Date();
  for (let i = 0; i < 90; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const log = getLearningLog(dateStr);
    log.forEach(entry => {
      if (topicHours[entry.topicKey] !== undefined) {
        topicHours[entry.topicKey] += entry.duration;
      }
    });
  }

  const maxMins = Math.max(...Object.values(topicHours), 1);

  el.innerHTML = topics.map(t => {
    const mins = topicHours[t.key] || 0;
    const hrs = (mins / 60).toFixed(1);
    const pct = Math.round((mins / maxMins) * 100);
    return `
      <div class="skill-item">
        <div class="skill-label">
          <span>${t.icon} ${t.label}</span>
          <span class="skill-hours">${hrs}h</span>
        </div>
        <div class="progress-bar"><div class="progress-fill skill" style="width:${pct}%"></div></div>
      </div>
    `;
  }).join('');
}

function addNewTopic() {
  const name = document.getElementById('new-topic-name').value.trim();
  const icon = document.getElementById('new-topic-icon').value.trim() || '📘';
  const toolsStr = document.getElementById('new-topic-tools').value.trim();

  if (!name) { showToast('Enter topic name'); return; }

  const topics = getLearningTopics();
  const key = name.toLowerCase().replace(/[^a-z0-9]/g, '_');

  if (topics.find(t => t.key === key)) {
    showToast('Topic already exists');
    return;
  }

  const tools = toolsStr ? toolsStr.split(',').map(t => t.trim()).filter(Boolean) : [];
  topics.push({ key, label: name, icon, tools });
  saveLearningTopics(topics);

  document.getElementById('new-topic-name').value = '';
  document.getElementById('new-topic-icon').value = '';
  document.getElementById('new-topic-tools').value = '';

  renderTopicSelects();
  renderTopicManager();
  showToast(`✅ Added "${name}"`);
}

function removeTopic(key) {
  const topics = getLearningTopics().filter(t => t.key !== key);
  saveLearningTopics(topics);
  renderTopicSelects();
  renderTopicManager();
  showToast('Topic removed');
}

function addToolToTopic(topicKey) {
  const input = document.getElementById(`add-tool-${topicKey}`);
  const toolName = input.value.trim();
  if (!toolName) return;

  const topics = getLearningTopics();
  const topic = topics.find(t => t.key === topicKey);
  if (!topic) return;

  if (topic.tools.includes(toolName)) {
    showToast('Tool already exists');
    return;
  }

  topic.tools.push(toolName);
  saveLearningTopics(topics);
  input.value = '';
  renderTopicManager();
  renderTopicSelects();
  showToast(`Added "${toolName}" to ${topic.label}`);
}

function removeToolFromTopic(topicKey, toolName) {
  const topics = getLearningTopics();
  const topic = topics.find(t => t.key === topicKey);
  if (!topic) return;
  topic.tools = topic.tools.filter(t => t !== toolName);
  saveLearningTopics(topics);
  renderTopicManager();
  renderTopicSelects();
}

function renderTopicManager() {
  const el = document.getElementById('learn-topic-manager');
  const topics = getLearningTopics();

  el.innerHTML = topics.map(t => `
    <details class="topic-details">
      <summary>
        <span>${t.icon} ${t.label}</span>
        <button class="btn-remove" onclick="event.stopPropagation(); removeTopic('${t.key}')">✕</button>
      </summary>
      <div class="topic-tools-list">
        ${t.tools.map(tool => `
          <span class="tool-tag">
            ${tool}
            <button class="tag-remove" onclick="removeToolFromTopic('${t.key}', '${tool.replace(/'/g, "\\'")}')">×</button>
          </span>
        `).join('')}
        <div class="add-tool-inline">
          <input type="text" id="add-tool-${t.key}" placeholder="Add tool..." class="inline-input">
          <button class="btn-inline-add" onclick="addToolToTopic('${t.key}')">+</button>
        </div>
      </div>
    </details>
  `).join('');
}

// ==========================================
// NOTIFICATIONS
// ==========================================

async function enableNotifications() {
  if (!('Notification' in window)) {
    showToast('Notifications not supported on this device');
    return;
  }

  const permission = await Notification.requestPermission();
  if (permission === 'granted') {
    showToast('✅ Notifications enabled!');
    scheduleNotifications();
  } else {
    showToast('❌ Notification permission denied');
  }
}

function scheduleNotifications() {
  const shift = getDineshShift(APP_STATE.currentDate);
  const plan = MEAL_PLANS[shift.type] || MEAL_PLANS.unknown;
  const settings = getNotificationSettings();
  
  if (!settings.meals && !settings.supplements && !settings.water && !settings.exercise && !settings.dinnerCutoff) return;

  const now = new Date();
  
  // Schedule meal reminders
  if (settings.meals) {
    plan.meals.forEach(meal => {
      const [h, m] = meal.time.split(':').map(Number);
      const mealTime = new Date(now);
      mealTime.setHours(h, m, 0, 0);
      
      const delay = mealTime.getTime() - now.getTime();
      if (delay > 0) {
        scheduleNotification(`🍽️ ${meal.label}`, meal.suggestion, delay);
      }
    });
  }

  // Dinner cutoff warning
  if (settings.dinnerCutoff) {
    const cutoff = new Date(now);
    cutoff.setHours(18, 15, 0, 0); // 6:15 PM warning
    const delay = cutoff.getTime() - now.getTime();
    if (delay > 0) {
      scheduleNotification('⚠️ Dinner Cutoff Soon!', 'Complete dinner by 6:30 PM (max 7:00 PM)', delay);
    }
  }

  // Supplement reminders
  if (settings.supplements) {
    const morningSupp = new Date(now);
    morningSupp.setHours(8, 0, 0, 0);
    let delay = morningSupp.getTime() - now.getTime();
    if (delay > 0) {
      scheduleNotification('💊 Take Supplements', 'Omega-3, Vitamin C, Creatine', delay);
    }

    const nightSupp = new Date(now);
    nightSupp.setHours(21, 30, 0, 0);
    delay = nightSupp.getTime() - now.getTime();
    if (delay > 0) {
      scheduleNotification('💊 Magnesium Glycinate', 'Take before bed for better sleep', delay);
    }
  }

  // Water reminders every 2 hours
  if (settings.water) {
    for (let h = 8; h <= 20; h += 2) {
      const waterTime = new Date(now);
      waterTime.setHours(h, 0, 0, 0);
      const delay = waterTime.getTime() - now.getTime();
      if (delay > 0) {
        scheduleNotification('💧 Drink Water', 'Stay hydrated! Have a glass of water.', delay);
      }
    }
  }

  // Exercise reminder
  if (settings.exercise && plan.exercise) {
    const [h, m] = plan.exercise.time.split(':').map(Number);
    const exTime = new Date(now);
    exTime.setHours(h, m, 0, 0);
    const delay = exTime.getTime() - now.getTime();
    if (delay > 0) {
      scheduleNotification('🏃 Exercise Time!', plan.exercise.suggestion, delay);
    }
  }

  // Learning reminder - 9 PM daily
  const learnReminder = new Date(now);
  learnReminder.setHours(21, 0, 0, 0);
  const learnDelay = learnReminder.getTime() - now.getTime();
  if (learnDelay > 0) {
    const todayLog = getLearningLog(now.toISOString().split('T')[0]);
    const todayMins = todayLog.reduce((s, e) => s + e.duration, 0);
    const learnProfile = getLearnProfile();
    if (todayMins < learnProfile.dailyGoalMins) {
      const remaining = learnProfile.dailyGoalMins - todayMins;
      scheduleNotification('📚 Learning Reminder', `You still need ${remaining} min to hit your daily goal!`, learnDelay);
    }
  }
}

function scheduleNotification(title, body, delay) {
  if (navigator.serviceWorker && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({
      type: 'SCHEDULE_NOTIFICATION',
      title,
      body,
      delay
    });
  } else {
    // Fallback: use setTimeout directly
    setTimeout(() => {
      if (Notification.permission === 'granted') {
        new Notification(title, { body, icon: 'icons/icon-192.png' });
      }
    }, delay);
  }
}

function getNotificationSettings() {
  return {
    meals: document.getElementById('notify-meals')?.checked ?? true,
    supplements: document.getElementById('notify-supplements')?.checked ?? true,
    water: document.getElementById('notify-water')?.checked ?? true,
    exercise: document.getElementById('notify-exercise')?.checked ?? true,
    dinnerCutoff: document.getElementById('notify-dinner-cutoff')?.checked ?? true
  };
}

// ==========================================
// DATA EXPORT/IMPORT
// ==========================================

function exportData() {
  const data = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    data[key] = getStorage(key, null);
  }
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `caltracker-backup-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('📁 Data exported');
}

function importData() {
  document.getElementById('import-file').click();
}

function handleImport(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);
      Object.entries(data).forEach(([key, value]) => {
        setStorage(key, value);
      });
      showToast('✅ Data imported successfully');
      renderDashboard();
      initSettings();
    } catch {
      showToast('❌ Invalid file format');
    }
  };
  reader.readAsText(file);
}

function clearTodayLog() {
  if (confirm('Clear all data for today? This cannot be undone.')) {
    localStorage.removeItem(`log_${APP_STATE.currentDate}`);
    renderDashboard();
    showToast('Today\'s log cleared');
  }
}

// ==========================================
// NAVIGATION & UI
// ==========================================

function initNavigation() {
  const navBtns = document.querySelectorAll('.nav-btn');
  const tabContents = document.querySelectorAll('.tab-content');
  const titles = {
    dashboard: 'Dashboard',
    log: 'Log Food',
    exercise: 'Exercise',
    learn: 'Learning',
    plan: 'Meal Plan',
    settings: 'Settings'
  };

  navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.tab;
      
      navBtns.forEach(b => b.classList.remove('active'));
      tabContents.forEach(t => t.classList.remove('active'));
      
      btn.classList.add('active');
      document.getElementById(`tab-${tab}`).classList.add('active');
      document.getElementById('header-title').textContent = titles[tab];

      // Render tab-specific content
      if (tab === 'dashboard') renderDashboard();
      if (tab === 'plan') renderMealPlan();
      if (tab === 'settings') { initSettings(); renderSupplementManager(); }
      if (tab === 'exercise') { renderExerciseLog(); renderActivityManager(); }
      if (tab === 'learn') renderLearningTab();
    });
  });

  // Meal type buttons
  document.querySelectorAll('.meal-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.meal-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      APP_STATE.currentMealType = btn.dataset.meal;
    });
  });

  // Date navigation
  document.getElementById('prev-day').addEventListener('click', () => {
    const d = new Date(APP_STATE.currentDate + 'T12:00:00');
    d.setDate(d.getDate() - 1);
    APP_STATE.currentDate = d.toISOString().split('T')[0];
    renderDashboard();
  });

  document.getElementById('next-day').addEventListener('click', () => {
    const d = new Date(APP_STATE.currentDate + 'T12:00:00');
    d.setDate(d.getDate() + 1);
    APP_STATE.currentDate = d.toISOString().split('T')[0];
    renderDashboard();
  });
}

// ==========================================
// TOAST NOTIFICATIONS
// ==========================================

function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.remove('hidden');
  setTimeout(() => toast.classList.add('hidden'), 3000);
}

// ==========================================
// INITIALIZATION
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initFoodSearch();
  initExercise();
  initRosterEditor();
  initSupplementManager();
  initLearning();
  renderDashboard();

  // Event listeners
  document.getElementById('btn-add-food').addEventListener('click', addFoodEntry);
  document.getElementById('btn-add-custom').addEventListener('click', addCustomFood);
  document.getElementById('btn-save-stats').addEventListener('click', saveSettings);
  document.getElementById('btn-enable-notifications').addEventListener('click', enableNotifications);
  document.getElementById('btn-export').addEventListener('click', exportData);
  document.getElementById('btn-import').addEventListener('click', importData);
  document.getElementById('import-file').addEventListener('change', handleImport);
  document.getElementById('btn-clear-today').addEventListener('click', clearTodayLog);
  document.getElementById('btn-refresh').addEventListener('click', () => {
    renderDashboard();
    showToast('Refreshed!');
  });

  // Schedule notifications on load
  if (Notification.permission === 'granted') {
    scheduleNotifications();
  }

  // Auto-refresh at midnight
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  const msToMidnight = midnight.getTime() - now.getTime();
  setTimeout(() => {
    APP_STATE.currentDate = new Date().toISOString().split('T')[0];
    renderDashboard();
    scheduleNotifications();
  }, msToMidnight);
});
