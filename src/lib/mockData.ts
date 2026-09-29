import {
  User,
  InboxEntry,
  Expense,
  ConsumptionExpense,
  FuelEntry,
  TimeEntry,
  LearningSession,
  LearningGoal,
  FoodEntry,
  HealthEntry,
  Goal,
  Milestone,
  Checkpoint,
  JournalEntry,
  Category,
  Notification
} from '../types';

export const initialUser: User = {
  id: 'usr_001',
  name: 'Kunal',
  title: 'Winter Arc Protocol',
  winterArcStartDate: '2026-09-29',
  currentDayIndex: 1,
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  themePreference: 'warm-hearth'
};

export const initialCategories: Category[] = [
  { id: 'cat_1', name: 'Transport', iconName: 'Fuel', colorHex: '#ea580c', monthlyBudget: 4000 },
  { id: 'cat_2', name: 'Food', iconName: 'Utensils', colorHex: '#f59e0b', monthlyBudget: 9000 },
  { id: 'cat_3', name: 'Housing', iconName: 'Home', colorHex: '#d97706', monthlyBudget: 15000 },
  { id: 'cat_4', name: 'Subscriptions', iconName: 'Tv', colorHex: '#e11d48', monthlyBudget: 2000 },
  { id: 'cat_5', name: 'Personal Care', iconName: 'Sparkles', colorHex: '#8b5cf6', monthlyBudget: 3000 },
  { id: 'cat_6', name: 'Learning', iconName: 'BookOpen', colorHex: '#10b981', monthlyBudget: 5000 },
  { id: 'cat_7', name: 'Work', iconName: 'Briefcase', colorHex: '#3b82f6', monthlyBudget: 0 },
  { id: 'cat_8', name: 'Health', iconName: 'Activity', colorHex: '#06b6d4', monthlyBudget: 6000 }
];

export const initialConsumptionExpenses: ConsumptionExpense[] = [
  {
    id: 'con_1',
    item: 'Petrol Refill',
    category: 'Transport',
    totalPurchaseAmount: 200,
    purchaseDate: '2026-09-29',
    startDate: '2026-09-29',
    expectedDurationDays: 3,
    dailyCost: 66.67,
    quantity: 2.1,
    unit: 'Litres',
    allocationMethod: 'Equal daily',
    status: 'Active',
    notes: 'Commute & local errands allocation.'
  },
  {
    id: 'con_2',
    item: 'Basmati Rice (5kg)',
    category: 'Food',
    totalPurchaseAmount: 320,
    purchaseDate: '2026-09-20',
    startDate: '2026-09-20',
    expectedDurationDays: 20,
    dailyCost: 16.00,
    quantity: 5,
    unit: 'kg',
    allocationMethod: 'Per quantity',
    status: 'Active',
    notes: 'Daily staple pantry reserve.'
  },
  {
    id: 'con_3',
    item: 'Herbal Shampoo',
    category: 'Personal Care',
    totalPurchaseAmount: 450,
    purchaseDate: '2026-09-15',
    startDate: '2026-09-15',
    expectedDurationDays: 30,
    dailyCost: 15.00,
    quantity: 1,
    unit: 'Bottle',
    allocationMethod: 'Equal daily',
    status: 'Active'
  },
  {
    id: 'con_4',
    item: 'House Rent (Shared)',
    category: 'Housing',
    totalPurchaseAmount: 1700,
    purchaseDate: '2026-09-01',
    startDate: '2026-09-01',
    expectedDurationDays: 30,
    dailyCost: 56.67,
    allocationMethod: 'Subscription period',
    status: 'Active'
  },
  {
    id: 'con_5',
    item: 'Whey Protein Isolate (1kg)',
    category: 'Health',
    totalPurchaseAmount: 2800,
    purchaseDate: '2026-09-10',
    startDate: '2026-09-10',
    expectedDurationDays: 30,
    dailyCost: 93.33,
    quantity: 30,
    unit: 'Scoops',
    allocationMethod: 'Per usage',
    status: 'Active'
  },
  {
    id: 'con_6',
    item: 'Coffee Beans (500g)',
    category: 'Food',
    totalPurchaseAmount: 480,
    purchaseDate: '2026-09-22',
    startDate: '2026-09-22',
    expectedDurationDays: 15,
    dailyCost: 32.00,
    quantity: 500,
    unit: 'g',
    allocationMethod: 'Equal daily',
    status: 'Active'
  },
  {
    id: 'con_7',
    item: 'Netflix Premium Pass',
    category: 'Subscriptions',
    totalPurchaseAmount: 299,
    purchaseDate: '2026-09-12',
    startDate: '2026-09-12',
    expectedDurationDays: 30,
    dailyCost: 9.97,
    allocationMethod: 'Subscription period',
    status: 'Active'
  },
  {
    id: 'con_8',
    item: 'Cold Pressed Olive Oil (1L)',
    category: 'Food',
    totalPurchaseAmount: 650,
    purchaseDate: '2026-09-05',
    startDate: '2026-09-05',
    expectedDurationDays: 40,
    dailyCost: 16.25,
    quantity: 1,
    unit: 'Liter',
    allocationMethod: 'Equal daily',
    status: 'Active'
  },
  {
    id: 'con_9',
    item: 'High Speed Fiber WiFi',
    category: 'Housing',
    totalPurchaseAmount: 999,
    purchaseDate: '2026-09-01',
    startDate: '2026-09-01',
    expectedDurationDays: 30,
    dailyCost: 33.30,
    allocationMethod: 'Subscription period',
    status: 'Active'
  },
  {
    id: 'con_10',
    item: 'Gym Membership Pass',
    category: 'Health',
    totalPurchaseAmount: 1200,
    purchaseDate: '2026-09-01',
    startDate: '2026-09-01',
    expectedDurationDays: 30,
    dailyCost: 40.00,
    allocationMethod: 'Subscription period',
    status: 'Active'
  }
];

export const initialExpenses: Expense[] = [
  { id: 'exp_1', date: '2026-09-29', amount: 200, category: 'Transport', title: 'Petrol Refill', isConsumption: true, consumptionId: 'con_1', paymentMethod: 'UPI' },
  { id: 'exp_2', date: '2026-09-29', amount: 150, category: 'Food', title: 'Fresh Chicken Breast', isConsumption: false, paymentMethod: 'UPI' },
  { id: 'exp_3', date: '2026-09-29', amount: 30, category: 'Food', title: 'Evening Chai & Biscuit', isConsumption: false, paymentMethod: 'Cash' },
  { id: 'exp_4', date: '2026-09-28', amount: 320, category: 'Food', title: 'Basmati Rice (5kg)', isConsumption: true, consumptionId: 'con_2', paymentMethod: 'Card' },
  { id: 'exp_5', date: '2026-09-28', amount: 80, category: 'Food', title: 'Protein Snack Bar', isConsumption: false, paymentMethod: 'UPI' },
  { id: 'exp_6', date: '2026-09-27', amount: 450, category: 'Personal Care', title: 'Herbal Shampoo', isConsumption: true, consumptionId: 'con_3', paymentMethod: 'UPI' },
  { id: 'exp_7', date: '2026-09-27', amount: 120, category: 'Food', title: 'Fresh Eggs & Bread', isConsumption: false, paymentMethod: 'UPI' },
  { id: 'exp_8', date: '2026-09-26', amount: 500, category: 'Transport', title: 'Cab to Client Office', isConsumption: false, paymentMethod: 'UPI' },
  { id: 'exp_9', date: '2026-09-25', amount: 650, category: 'Food', title: 'Cold Pressed Olive Oil', isConsumption: true, consumptionId: 'con_8', paymentMethod: 'UPI' },
  { id: 'exp_10', date: '2026-09-25', amount: 250, category: 'Learning', title: 'Technical eBook Download', isConsumption: false, paymentMethod: 'Card' },
  { id: 'exp_11', date: '2026-09-24', amount: 180, category: 'Food', title: 'Dinner bowl out', isConsumption: false, paymentMethod: 'UPI' },
  { id: 'exp_12', date: '2026-09-23', amount: 480, category: 'Food', title: 'Coffee Beans (500g)', isConsumption: true, consumptionId: 'con_6', paymentMethod: 'Card' },
  { id: 'exp_13', date: '2026-09-22', amount: 200, category: 'Transport', title: 'Petrol Refill', isConsumption: true, paymentMethod: 'UPI' },
  { id: 'exp_14', date: '2026-09-21', amount: 90, category: 'Health', title: 'Electrolyte Sachets', isConsumption: false, paymentMethod: 'Cash' },
  { id: 'exp_15', date: '2026-09-20', amount: 2800, category: 'Health', title: 'Whey Protein Isolate', isConsumption: true, consumptionId: 'con_5', paymentMethod: 'Card' },
  { id: 'exp_16', date: '2026-09-18', amount: 350, category: 'Entertainment', title: 'Weekend Movie Ticket', isConsumption: false, paymentMethod: 'UPI' },
  { id: 'exp_17', date: '2026-09-15', amount: 1700, category: 'Housing', title: 'House Rent (Shared)', isConsumption: true, consumptionId: 'con_4', paymentMethod: 'Bank Transfer' },
  { id: 'exp_18', date: '2026-09-12', amount: 299, category: 'Subscriptions', title: 'Netflix Subscription', isConsumption: true, consumptionId: 'con_7', paymentMethod: 'Card' },
  { id: 'exp_19', date: '2026-09-10', amount: 999, category: 'Housing', title: 'High Speed WiFi Bill', isConsumption: true, consumptionId: 'con_9', paymentMethod: 'UPI' },
  { id: 'exp_20', date: '2026-09-05', amount: 1200, category: 'Health', title: 'Gym Monthly Pass', isConsumption: true, consumptionId: 'con_10', paymentMethod: 'UPI' }
];

export const initialFuelEntries: FuelEntry[] = [
  {
    id: 'fuel_1',
    date: '2026-09-29',
    amountSpent: 200,
    litres: 2.0,
    odometerKm: 82400,
    previousOdometerKm: 82340,
    distanceKm: 60,
    mileageKmpl: 30.0,
    costPerKm: 3.33,
    expectedDurationDays: 3,
    dailyFuelCost: 66.67,
    stationName: 'HP Energy Station'
  },
  {
    id: 'fuel_2',
    date: '2026-09-22',
    amountSpent: 200,
    litres: 2.0,
    odometerKm: 82340,
    previousOdometerKm: 82275,
    distanceKm: 65,
    mileageKmpl: 32.5,
    costPerKm: 3.07,
    expectedDurationDays: 3,
    dailyFuelCost: 66.67,
    stationName: 'Indian Oil Hub'
  },
  {
    id: 'fuel_3',
    date: '2026-09-15',
    amountSpent: 500,
    litres: 5.1,
    odometerKm: 82275,
    previousOdometerKm: 82115,
    distanceKm: 160,
    mileageKmpl: 31.4,
    costPerKm: 3.12,
    expectedDurationDays: 7,
    dailyFuelCost: 71.43,
    stationName: 'Bharat Petroleum'
  }
];

export const initialTimeEntries: TimeEntry[] = [
  { id: 't_1', date: '2026-09-29', startTime: '06:30', endTime: '07:15', durationMinutes: 45, activity: 'Morning Routine & Hydration', category: 'Health' },
  { id: 't_2', date: '2026-09-29', startTime: '07:15', endTime: '08:00', durationMinutes: 45, activity: 'Gym Workout - Upper Body Focus', category: 'Health' },
  { id: 't_3', date: '2026-09-29', startTime: '08:00', endTime: '09:00', durationMinutes: 60, activity: 'Commute & Podcast', category: 'Commute' },
  { id: 't_4', date: '2026-09-29', startTime: '09:00', endTime: '12:40', durationMinutes: 220, activity: 'Deep Work: Core Dashboard Logic', category: 'Work', isDeepWork: true },
  { id: 't_5', date: '2026-09-29', startTime: '12:40', endTime: '13:30', durationMinutes: 50, activity: 'Lunch Break & Walk', category: 'Personal' },
  { id: 't_6', date: '2026-09-29', startTime: '13:30', endTime: '17:00', durationMinutes: 210, activity: 'Work: Team Sync & Code Reviews', category: 'Work' },
  { id: 't_7', date: '2026-09-29', startTime: '17:00', endTime: '18:00', durationMinutes: 60, activity: 'Commute Home', category: 'Commute' },
  { id: 't_8', date: '2026-09-29', startTime: '18:30', endTime: '20:00', durationMinutes: 90, activity: 'AI Engineering Course & PyTorch', category: 'Learning', isDeepWork: true },
  { id: 't_9', date: '2026-09-29', startTime: '20:00', endTime: '20:40', durationMinutes: 40, activity: 'Python Data Pipeline Scripting', category: 'Learning' },
  { id: 't_10', date: '2026-09-29', startTime: '20:40', endTime: '21:30', durationMinutes: 50, activity: 'Dinner & Relaxation', category: 'Personal' },
  { id: 't_11', date: '2026-09-29', startTime: '21:30', endTime: '22:30', durationMinutes: 60, activity: 'PWA Mobile Operating System', category: 'Learning', isDeepWork: true },
  { id: 't_12', date: '2026-09-28', startTime: '09:00', endTime: '17:00', durationMinutes: 480, activity: 'Frontend Architecture Work', category: 'Work', isDeepWork: true },
  { id: 't_13', date: '2026-09-28', startTime: '19:00', endTime: '21:00', durationMinutes: 120, activity: 'LLM Fine-tuning Study', category: 'Learning', isDeepWork: true },
  { id: 't_14', date: '2026-09-27', startTime: '08:00', endTime: '09:30', durationMinutes: 90, activity: '5K Run & Core Training', category: 'Health' },
  { id: 't_15', date: '2026-09-27', startTime: '14:00', endTime: '17:30', durationMinutes: 210, activity: 'React Native & PWA Prototyping', category: 'Learning' },
  { id: 't_16', date: '2026-09-26', startTime: '09:00', endTime: '18:00', durationMinutes: 540, activity: 'Sprint Delivery', category: 'Work' },
  { id: 't_17', date: '2026-09-25', startTime: '20:00', endTime: '22:00', durationMinutes: 120, activity: 'Python Asyncio Deep Dive', category: 'Learning' },
  { id: 't_18', date: '2026-09-24', startTime: '07:00', endTime: '08:00', durationMinutes: 60, activity: 'Morning HIIT', category: 'Health' },
  { id: 't_19', date: '2026-09-23', startTime: '19:30', endTime: '21:30', durationMinutes: 120, activity: 'AI Agents Architecture', category: 'Learning', isDeepWork: true },
  { id: 't_20', date: '2026-09-22', startTime: '09:00', endTime: '17:00', durationMinutes: 480, activity: 'System Engineering', category: 'Work' }
];

export const initialLearningSessions: LearningSession[] = [
  { id: 'ls_1', date: '2026-09-29', topic: 'PyTorch Model Fine-tuning', durationMinutes: 90, projectName: 'AI Project #1', notes: 'Explored LoRA parameter efficient fine tuning adapters.' },
  { id: 'ls_2', date: '2026-09-29', topic: 'Python Async Pipelines', durationMinutes: 40, projectName: 'Data Processing Engine', notes: 'Mastered asyncio.gather and concurrency limits.' },
  { id: 'ls_3', date: '2026-09-29', topic: 'PWA Offline Caching', durationMinutes: 60, projectName: 'SNOW Operating System', notes: 'Implemented robust offline service worker strategies.' },
  { id: 'ls_4', date: '2026-09-28', topic: 'LLM Prompt Engineering Patterns', durationMinutes: 75, projectName: 'AI Project #1' },
  { id: 'ls_5', date: '2026-09-28', topic: 'Vector Embeddings & RAG Architecture', durationMinutes: 45, projectName: 'AI Project #1' },
  { id: 'ls_6', date: '2026-09-27', topic: 'Docker Container Security', durationMinutes: 120, projectName: 'DevOps Mastery' },
  { id: 'ls_7', date: '2026-09-26', topic: 'FastAPI Microservices', durationMinutes: 90, projectName: 'Data Processing Engine' },
  { id: 'ls_8', date: '2026-09-25', topic: 'Python Metaclasses & Decorators', durationMinutes: 120, projectName: 'Python 50 Hours' },
  { id: 'ls_9', date: '2026-09-24', topic: 'TypeScript Advanced Generics', durationMinutes: 60, projectName: 'SNOW Operating System' },
  { id: 'ls_10', date: '2026-09-23', topic: 'LangChain & Agent Tools', durationMinutes: 120, projectName: 'AI Project #1' },
  { id: 'ls_11', date: '2026-09-22', topic: 'SQL Query Optimization', durationMinutes: 90, projectName: 'Data Processing Engine' },
  { id: 'ls_12', date: '2026-09-21', topic: 'Transformers Architecture Paper', durationMinutes: 105, projectName: 'AI Project #1' },
  { id: 'ls_13', date: '2026-09-20', topic: 'System Design Patterns', durationMinutes: 80, projectName: 'DevOps Mastery' },
  { id: 'ls_14', date: '2026-09-19', topic: 'Git Advanced Rebase & Cherry-pick', durationMinutes: 45, projectName: 'DevOps Mastery' },
  { id: 'ls_15', date: '2026-09-18', topic: 'NumPy Vectorized Operations', durationMinutes: 75, projectName: 'Python 50 Hours' }
];

export const initialLearningGoals: LearningGoal[] = [
  {
    id: 'lg_1',
    title: 'AI Engineering Mastery',
    targetHours: 100,
    completedHours: 42,
    progressPercent: 42,
    category: 'AI & Machine Learning',
    associatedProjects: [
      { id: 'p_1', name: 'AI Project #1 (Universal Assistant)', progressPercent: 72 },
      { id: 'p_2', name: 'RAG Knowledge Graph Search', progressPercent: 31 }
    ]
  },
  {
    id: 'lg_2',
    title: 'Python 50 Hours Challenge',
    targetHours: 50,
    completedHours: 32.5,
    progressPercent: 65,
    category: 'Software Development',
    associatedProjects: [
      { id: 'p_3', name: 'Data Processing Engine', progressPercent: 80 }
    ]
  },
  {
    id: 'lg_3',
    title: 'DevOps & Cloud Architecture',
    targetHours: 40,
    completedHours: 16,
    progressPercent: 40,
    category: 'Infrastructure',
    associatedProjects: [
      { id: 'p_4', name: 'CI/CD Automated Deployment', progressPercent: 45 }
    ]
  }
];

export const initialFoodEntries: FoodEntry[] = [
  { id: 'fe_1', date: '2026-09-29', mealType: 'Breakfast', description: 'Oats with Almond Milk & Chia Seeds', calories: 420, proteinGrams: 16, cost: 45, isConsumptionBased: true, consumptionDailyAllocation: 16 },
  { id: 'fe_2', date: '2026-09-29', mealType: 'Lunch', description: 'Grilled Chicken Breast with Basmati Rice & Salad', calories: 680, proteinGrams: 52, cost: 150, isConsumptionBased: true, consumptionDailyAllocation: 16 },
  { id: 'fe_3', date: '2026-09-29', mealType: 'Snack', description: 'Whey Protein Shake & Apple', calories: 240, proteinGrams: 28, cost: 93.33, isConsumptionBased: true, consumptionDailyAllocation: 93.33 },
  { id: 'fe_4', date: '2026-09-29', mealType: 'Dinner', description: 'Egg Scramble with Whole Wheat Toast', calories: 510, proteinGrams: 34, cost: 60, isConsumptionBased: false },
  { id: 'fe_5', date: '2026-09-28', mealType: 'Breakfast', description: 'Scrambled Eggs & Espresso', calories: 380, proteinGrams: 22, cost: 50, isConsumptionBased: false },
  { id: 'fe_6', date: '2026-09-28', mealType: 'Lunch', description: 'Paneer Rice Bowl', calories: 610, proteinGrams: 28, cost: 120, isConsumptionBased: false },
  { id: 'fe_7', date: '2026-09-28', mealType: 'Dinner', description: 'Chicken Soup & Veggies', calories: 490, proteinGrams: 42, cost: 140, isConsumptionBased: false },
  { id: 'fe_8', date: '2026-09-27', mealType: 'Breakfast', description: 'Protein Pancakes', calories: 450, proteinGrams: 30, cost: 80, isConsumptionBased: false },
  { id: 'fe_9', date: '2026-09-27', mealType: 'Lunch', description: 'Fish Curry & Rice', calories: 650, proteinGrams: 48, cost: 180, isConsumptionBased: false },
  { id: 'fe_10', date: '2026-09-27', mealType: 'Dinner', description: 'Lentil Soup with Multigrain Roti', calories: 480, proteinGrams: 24, cost: 70, isConsumptionBased: false },
  { id: 'fe_11', date: '2026-09-26', mealType: 'Breakfast', description: 'Banana Peanut Butter Smoothie', calories: 410, proteinGrams: 20, cost: 60, isConsumptionBased: false },
  { id: 'fe_12', date: '2026-09-26', mealType: 'Lunch', description: 'Chicken Salad Wrap', calories: 550, proteinGrams: 40, cost: 130, isConsumptionBased: false },
  { id: 'fe_13', date: '2026-09-25', mealType: 'Dinner', description: 'Tofu Veggie Stir Fry', calories: 460, proteinGrams: 32, cost: 110, isConsumptionBased: false },
  { id: 'fe_14', date: '2026-09-24', mealType: 'Lunch', description: 'Chicken Biryani Special', calories: 750, proteinGrams: 45, cost: 220, isConsumptionBased: false },
  { id: 'fe_15', date: '2026-09-23', mealType: 'Breakfast', description: 'Avocado Toast & Eggs', calories: 490, proteinGrams: 22, cost: 100, isConsumptionBased: false }
];

export const initialHealthEntries: HealthEntry[] = [
  { id: 'he_1', date: '2026-09-29', sleepHours: 7.08, sleepQuality: 'Optimal', waterLiters: 2.8, workoutCompleted: true, workoutType: 'Upper Body Resistance', stepsCount: 8450, weightKg: 74.2, energyLevel: 8, moodLevel: 9 },
  { id: 'he_2', date: '2026-09-28', sleepHours: 6.8, sleepQuality: 'Good', waterLiters: 2.5, workoutCompleted: true, workoutType: 'Cardio Run 5k', stepsCount: 10200, weightKg: 74.4, energyLevel: 7, moodLevel: 8 },
  { id: 'he_3', date: '2026-09-27', sleepHours: 7.5, sleepQuality: 'Optimal', waterLiters: 3.0, workoutCompleted: true, workoutType: 'Lower Body Leg Day', stepsCount: 9100, weightKg: 74.3, energyLevel: 9, moodLevel: 9 },
  { id: 'he_4', date: '2026-09-26', sleepHours: 6.2, sleepQuality: 'Fair', waterLiters: 2.2, workoutCompleted: false, stepsCount: 6300, weightKg: 74.6, energyLevel: 6, moodLevel: 7 },
  { id: 'he_5', date: '2026-09-25', sleepHours: 7.2, sleepQuality: 'Good', waterLiters: 2.6, workoutCompleted: true, workoutType: 'Push Workout', stepsCount: 8800, weightKg: 74.5, energyLevel: 8, moodLevel: 8 },
  { id: 'he_6', date: '2026-09-24', sleepHours: 6.9, sleepQuality: 'Good', waterLiters: 2.4, workoutCompleted: true, workoutType: 'Pull Workout', stepsCount: 7900, weightKg: 74.7, energyLevel: 7, moodLevel: 8 },
  { id: 'he_7', date: '2026-09-23', sleepHours: 7.8, sleepQuality: 'Optimal', waterLiters: 3.1, workoutCompleted: true, workoutType: 'Active Recovery Yoga', stepsCount: 8300, weightKg: 74.8, energyLevel: 9, moodLevel: 9 },
  { id: 'he_8', date: '2026-09-22', sleepHours: 6.4, sleepQuality: 'Fair', waterLiters: 2.1, workoutCompleted: false, stepsCount: 5400, weightKg: 74.9, energyLevel: 6, moodLevel: 6 },
  { id: 'he_9', date: '2026-09-21', sleepHours: 7.1, sleepQuality: 'Good', waterLiters: 2.7, workoutCompleted: true, workoutType: 'Chest & Arms', stepsCount: 9400, weightKg: 75.0, energyLevel: 8, moodLevel: 8 },
  { id: 'he_10', date: '2026-09-20', sleepHours: 8.0, sleepQuality: 'Optimal', waterLiters: 3.2, workoutCompleted: true, workoutType: 'Outdoor Cycle 15km', stepsCount: 11500, weightKg: 75.1, energyLevel: 9, moodLevel: 10 }
];

export const initialGoals: Goal[] = [
  {
    id: 'g_winter_arc',
    title: 'Winter Arc Protocol',
    description: 'Transform mind, career, body, and financial discipline through intense focus during the winter months.',
    category: 'Mindset',
    startDate: '2026-09-29',
    targetDate: '2026-12-31',
    progressPercent: 18,
    status: 'In Progress',
    metrics: [
      { label: 'Days Completed', current: 1, target: 90, unit: 'Days' },
      { label: 'Protocol Adherence', current: 95, target: 100, unit: '%' }
    ]
  },
  {
    id: 'g_career',
    title: 'Career Transformation',
    parentGoalId: 'g_winter_arc',
    description: 'Elevate software architecture & AI engineering skills.',
    category: 'Career',
    startDate: '2026-09-29',
    targetDate: '2026-12-15',
    progressPercent: 64,
    status: 'On Track',
    metrics: [
      { label: 'Deep Work Hours', current: 64, target: 100, unit: 'Hours' }
    ]
  },
  {
    id: 'g_ai_engineer',
    title: 'Full Stack AI Engineer Mastery',
    parentGoalId: 'g_career',
    description: 'Master LLM orchestration, RAG pipelines, PyTorch fine-tuning, and agentic workflows.',
    category: 'Skills',
    startDate: '2026-09-01',
    targetDate: '2026-11-30',
    progressPercent: 64,
    status: 'On Track',
    metrics: [
      { label: 'Learning Hours', current: 42, target: 100, unit: 'Hours' },
      { label: 'Projects Built', current: 1, target: 3, unit: 'Apps' }
    ]
  },
  {
    id: 'g_build_project_1',
    title: 'Build AI Project #1 (SNOW OS)',
    parentGoalId: 'g_ai_engineer',
    description: 'Complete mobile-first PWA personal operating system with universal inbox and consumption engine.',
    category: 'Career',
    startDate: '2026-09-20',
    targetDate: '2026-10-15',
    progressPercent: 78,
    status: 'On Track',
    metrics: [
      { label: 'Frontend Modules', current: 10, target: 10, unit: 'Modules' }
    ]
  },
  {
    id: 'g_finance',
    title: 'Financial Fortification',
    parentGoalId: 'g_winter_arc',
    description: 'Master cash vs consumption accounting and eliminate unnecessary drain.',
    category: 'Finance',
    startDate: '2026-09-01',
    targetDate: '2026-12-31',
    progressPercent: 32,
    status: 'In Progress',
    metrics: [
      { label: 'Emergency Fund', current: 32000, target: 100000, unit: '₹' },
      { label: 'Debt EMI Cleared', current: 12000, target: 20000, unit: '₹' }
    ]
  },
  {
    id: 'g_health_physique',
    title: 'Peak Physical Conditioning',
    parentGoalId: 'g_winter_arc',
    description: 'Achieve lean body mass, consistent workout routine, and strict recovery sleep.',
    category: 'Health',
    startDate: '2026-09-15',
    targetDate: '2026-12-31',
    progressPercent: 45,
    status: 'On Track',
    metrics: [
      { label: 'Workouts Completed', current: 14, target: 50, unit: 'Sessions' },
      { label: 'Avg Sleep', current: 7.2, target: 7.5, unit: 'Hours/day' }
    ]
  },
  {
    id: 'g_python_50',
    title: 'Complete 50 Hours Python Challenge',
    parentGoalId: 'g_ai_engineer',
    description: 'Master async Python, generators, typed fast API backends, and data pipelines.',
    category: 'Skills',
    startDate: '2026-09-10',
    targetDate: '2026-10-31',
    progressPercent: 65,
    status: 'On Track',
    metrics: [
      { label: 'Python Hours Logged', current: 32.5, target: 50, unit: 'Hours' }
    ]
  },
  {
    id: 'g_emergency_fund',
    title: 'Build 3-Month Emergency Fund',
    parentGoalId: 'g_finance',
    description: 'Liquid cash reserve for emergency coverage.',
    category: 'Finance',
    startDate: '2026-08-01',
    targetDate: '2026-12-31',
    progressPercent: 32,
    status: 'In Progress',
    metrics: [
      { label: 'Saved Amount', current: 32000, target: 100000, unit: '₹' }
    ]
  }
];

export const initialMilestones: Milestone[] = [
  {
    id: 'ms_1',
    title: 'Winter Arc Protocol Checkpoint #1',
    date: '2026-10-15',
    time: '20:00',
    type: 'Checkpoint',
    description: 'First major 15-day evaluation of Winter Arc progress, deep work consistency, and expense control.',
    status: 'Upcoming',
    linkedGoalIds: ['g_winter_arc', 'g_ai_engineer'],
    checklist: [
      { id: 'ck_1', task: 'Complete 30 Hours AI Engineering study', done: false },
      { id: 'ck_2', task: 'Log 12 Gym workouts', done: true },
      { id: 'ck_3', task: 'Zero unreviewed Universal Inbox entries', done: true },
      { id: 'ck_4', task: 'Maintain daily consumption cost < ₹350/day', done: false }
    ],
    reflectionQuestions: [
      'What was your single biggest achievement this fortnight?',
      'Where did unexpected time leaks occur?',
      'What non-essential expenditure can be eliminated next?'
    ]
  },
  {
    id: 'ms_2',
    title: 'Monthly Operating System Review',
    date: '2026-10-31',
    time: '21:00',
    type: 'Review',
    description: 'Comprehensive financial audit, cash outflow vs consumption comparison, and goal recalibration.',
    status: 'Upcoming',
    linkedGoalIds: ['g_finance', 'g_career'],
    checklist: [
      { id: 'ck_5', task: 'Generate Monthly PDF Financial Report', done: false },
      { id: 'ck_6', task: 'Review fuel consumption mileage metrics', done: false },
      { id: 'ck_7', task: 'Allocate 10% bonus to Emergency Fund', done: false }
    ]
  },
  {
    id: 'ms_3',
    title: 'AI Project #1 Milestone Launch',
    date: '2026-11-15',
    time: '18:00',
    type: 'Deadline',
    description: 'Deploy SNOW frontend architecture and demonstrate zero-friction universal inbox.',
    status: 'Upcoming',
    linkedGoalIds: ['g_build_project_1'],
    checklist: [
      { id: 'ck_8', task: 'Test PWA mobile installability on phone', done: true },
      { id: 'ck_9', task: 'Validate consumption expense auto-allocations', done: true }
    ]
  },
  {
    id: 'ms_4',
    title: 'SNOW Architecture Spec Complete',
    date: '2026-09-29',
    time: '12:00',
    type: 'Personal',
    description: 'Finalize TypeScript contracts and mock frontend design for SNOW Operating System.',
    status: 'Today',
    linkedGoalIds: ['g_build_project_1'],
    checklist: [
      { id: 'ck_10', task: 'Create mock data layer with 20+ expenses', done: true },
      { id: 'ck_11', task: 'Implement warm theme visual aesthetics', done: true }
    ]
  },
  {
    id: 'ms_5',
    title: 'Emergency Fund ₹35,000 Level 1',
    date: '2026-09-20',
    type: 'Deadline',
    description: 'Cross initial milestone target for emergency savings.',
    status: 'Completed',
    linkedGoalIds: ['g_emergency_fund'],
    checklist: [
      { id: 'ck_12', task: 'Transfer ₹5,000 surplus into high-yield savings', done: true }
    ]
  },
  {
    id: 'ms_6',
    title: 'Python 30 Hours Milestone',
    date: '2026-09-25',
    type: 'Checkpoint',
    description: 'Passed 30 hours of focused Python code practice.',
    status: 'Completed',
    linkedGoalIds: ['g_python_50'],
    checklist: [
      { id: 'ck_13', task: 'Build Async web scraper script', done: true }
    ]
  },
  {
    id: 'ms_7',
    title: '7-Day Sleep Consistency Streak',
    date: '2026-09-28',
    type: 'Personal',
    description: 'Averaged over 7 hours of sleep per night for 7 consecutive days.',
    status: 'Completed',
    linkedGoalIds: ['g_health_physique'],
    checklist: [
      { id: 'ck_14', task: 'No screen exposure after 22:30', done: true }
    ]
  },
  {
    id: 'ms_8',
    title: 'Fuel Mileage Audit #2',
    date: '2026-09-22',
    type: 'Review',
    description: 'Audit vehicle efficiency and cost per km.',
    status: 'Completed',
    linkedGoalIds: ['g_finance'],
    checklist: [
      { id: 'ck_15', task: 'Log odometer 82,340 km', done: true }
    ]
  },
  {
    id: 'ms_9',
    title: 'Winter Arc Launch Day',
    date: '2026-09-29',
    type: 'Checkpoint',
    description: 'Official commencement of the Winter Arc protocol.',
    status: 'Today',
    linkedGoalIds: ['g_winter_arc'],
    checklist: [
      { id: 'ck_16', task: 'Initialize SNOW Personal OS', done: true }
    ]
  },
  {
    id: 'ms_10',
    title: 'Q4 Goal Alignment Session',
    date: '2026-10-05',
    type: 'Review',
    description: 'Review macro goals for Q4 and allocate weekly deep work sprints.',
    status: 'Upcoming',
    linkedGoalIds: ['g_winter_arc', 'g_career'],
    checklist: [
      { id: 'ck_17', task: 'Audit calendar time blocks', done: false }
    ]
  }
];

export const initialInboxEntries: InboxEntry[] = [
  {
    id: 'inb_1',
    timestamp: '2026-09-29T19:30:00Z',
    rawText: '₹200 petrol today, lasted 3 days',
    status: 'Approved',
    aiExtraction: {
      id: 'ai_1',
      rawText: '₹200 petrol today, lasted 3 days',
      extractedCategory: 'Transport',
      subcategory: 'Fuel',
      extractedAmount: 200,
      extractedDurationDays: 3,
      isConsumption: true,
      dailyAllocationCost: 66.67,
      confidenceScore: 99,
      aiExplanation: 'Detected fuel refill item. Automatically calculated daily allocation of ₹66.67/day over 3 days.',
      suggestedAction: 'Create Consumption'
    }
  },
  {
    id: 'inb_2',
    timestamp: '2026-09-29T18:00:00Z',
    rawText: 'Studied PyTorch model fine-tuning for 1.5 hours',
    status: 'Approved',
    aiExtraction: {
      id: 'ai_2',
      rawText: 'Studied PyTorch model fine-tuning for 1.5 hours',
      extractedCategory: 'Learning',
      extractedTimeHours: 1.5,
      isConsumption: false,
      confidenceScore: 97,
      aiExplanation: 'Identified learning log entry. Logged 90 minutes toward AI Engineering goal.',
      suggestedAction: 'Log Learning'
    }
  },
  {
    id: 'inb_3',
    timestamp: '2026-09-29T15:00:00Z',
    rawText: 'Bought rice for ₹320, should last around 20 days',
    status: 'Approved',
    aiExtraction: {
      id: 'ai_3',
      rawText: 'Bought rice for ₹320, should last around 20 days',
      extractedCategory: 'Food',
      subcategory: 'Groceries',
      extractedAmount: 320,
      extractedDurationDays: 20,
      isConsumption: true,
      dailyAllocationCost: 16.00,
      confidenceScore: 98,
      aiExplanation: 'Pantry staple purchase. Allocated ₹16.00/day daily consumption cost.',
      suggestedAction: 'Create Consumption'
    }
  },
  {
    id: 'inb_4',
    timestamp: '2026-09-29T12:00:00Z',
    rawText: 'Worked 9 to 5, focused on frontend architecture and universal inbox',
    status: 'Approved',
    aiExtraction: {
      id: 'ai_4',
      rawText: 'Worked 9 to 5',
      extractedCategory: 'Work',
      extractedTimeHours: 8,
      isConsumption: false,
      confidenceScore: 95,
      aiExplanation: 'Identified 8 hours professional work block.',
      suggestedAction: 'Log Time'
    }
  },
  {
    id: 'inb_5',
    timestamp: '2026-09-29T08:00:00Z',
    rawText: 'Spent ₹150 on fresh chicken breast for protein meal prep',
    status: 'Approved',
    aiExtraction: {
      id: 'ai_5',
      rawText: 'Spent ₹150 on fresh chicken',
      extractedCategory: 'Food',
      extractedAmount: 150,
      isConsumption: false,
      confidenceScore: 96,
      aiExplanation: 'Direct cash food expenditure.',
      suggestedAction: 'Log Food'
    }
  },
  {
    id: 'inb_6',
    timestamp: '2026-09-28T21:00:00Z',
    rawText: 'Slept at 23:30 and woke up at 06:38, 2.8L water',
    status: 'Approved',
    aiExtraction: {
      id: 'ai_6',
      rawText: 'Slept at 23:30 and woke up at 06:38',
      extractedCategory: 'Health',
      extractedTimeHours: 7.1,
      isConsumption: false,
      confidenceScore: 94,
      aiExplanation: 'Health metric entry: calculated 7.1 hours sleep duration.',
      suggestedAction: 'Log Health'
    }
  },
  {
    id: 'inb_7',
    timestamp: '2026-09-28T19:30:00Z',
    rawText: 'Herbal shampoo ₹450 expected to last 30 days',
    status: 'Needs Review',
    aiExtraction: {
      id: 'ai_7',
      rawText: 'Herbal shampoo ₹450 expected to last 30 days',
      extractedCategory: 'Personal Care',
      extractedAmount: 450,
      extractedDurationDays: 30,
      isConsumption: true,
      dailyAllocationCost: 15.00,
      confidenceScore: 96,
      aiExplanation: 'Personal care item. Categorized with ₹15/day daily cost allocation.',
      suggestedAction: 'Create Consumption'
    }
  },
  {
    id: 'inb_8',
    timestamp: '2026-09-28T14:00:00Z',
    rawText: 'Spent 1.2 hours on Instagram reels after lunch',
    status: 'Needs Review',
    aiExtraction: {
      id: 'ai_8',
      rawText: 'Spent 1.2 hours on Instagram',
      extractedCategory: 'Entertainment',
      extractedTimeHours: 1.2,
      isConsumption: false,
      confidenceScore: 91,
      aiExplanation: 'Screen time distraction logged.',
      suggestedAction: 'Log Time'
    }
  },
  {
    id: 'inb_9',
    timestamp: '2026-09-27T18:00:00Z',
    rawText: 'Finished React dashboard prototype for SNOW OS',
    status: 'Approved',
    aiExtraction: {
      id: 'ai_9',
      rawText: 'Finished React dashboard prototype',
      extractedCategory: 'Learning',
      extractedTimeHours: 3.5,
      isConsumption: false,
      confidenceScore: 98,
      aiExplanation: 'Project milestone task completed.',
      suggestedAction: 'Log Learning'
    }
  },
  {
    id: 'inb_10',
    timestamp: '2026-09-27T07:30:00Z',
    rawText: 'Went to gym - 45 min upper body push session',
    status: 'Approved',
    aiExtraction: {
      id: 'ai_10',
      rawText: 'Went to gym',
      extractedCategory: 'Health',
      extractedTimeHours: 0.75,
      isConsumption: false,
      confidenceScore: 99,
      aiExplanation: 'Workout session recorded.',
      suggestedAction: 'Log Health'
    }
  },
  {
    id: 'inb_11',
    timestamp: '2026-09-26T20:00:00Z',
    rawText: 'Paid ₹1,700 monthly house rent',
    status: 'Approved',
    aiExtraction: {
      id: 'ai_11',
      rawText: 'Paid ₹1,700 rent',
      extractedCategory: 'Housing',
      extractedAmount: 1700,
      extractedDurationDays: 30,
      isConsumption: true,
      dailyAllocationCost: 56.67,
      confidenceScore: 99,
      aiExplanation: 'Monthly housing rental expense.',
      suggestedAction: 'Create Consumption'
    }
  },
  {
    id: 'inb_12',
    timestamp: '2026-09-25T16:00:00Z',
    rawText: 'Cold pressed olive oil ₹650 for cooking, 40 days supply',
    status: 'Needs Review',
    aiExtraction: {
      id: 'ai_12',
      rawText: 'Cold pressed olive oil ₹650',
      extractedCategory: 'Food',
      extractedAmount: 650,
      extractedDurationDays: 40,
      isConsumption: true,
      dailyAllocationCost: 16.25,
      confidenceScore: 94,
      aiExplanation: 'Pantry oil supply allocation ₹16.25/day.',
      suggestedAction: 'Create Consumption'
    }
  },
  {
    id: 'inb_13',
    timestamp: '2026-09-24T10:00:00Z',
    rawText: 'Spent ₹250 on Python technical eBook download',
    status: 'Approved',
    aiExtraction: {
      id: 'ai_13',
      rawText: 'Spent ₹250 on Python eBook',
      extractedCategory: 'Learning',
      extractedAmount: 250,
      isConsumption: false,
      confidenceScore: 96,
      aiExplanation: 'Educational resource purchase.',
      suggestedAction: 'Create Expense'
    }
  },
  {
    id: 'inb_14',
    timestamp: '2026-09-23T11:00:00Z',
    rawText: 'Refilled coffee beans 500g ₹480',
    status: 'Needs Review',
    aiExtraction: {
      id: 'ai_14',
      rawText: 'Refilled coffee beans ₹480',
      extractedCategory: 'Food',
      extractedAmount: 480,
      extractedDurationDays: 15,
      isConsumption: true,
      dailyAllocationCost: 32.00,
      confidenceScore: 93,
      aiExplanation: 'Coffee supplies daily cost ₹32/day.',
      suggestedAction: 'Create Consumption'
    }
  },
  {
    id: 'inb_15',
    timestamp: '2026-09-22T08:30:00Z',
    rawText: 'Morning 5km run completed in 26 minutes',
    status: 'Approved',
    aiExtraction: {
      id: 'ai_15',
      rawText: 'Morning 5km run',
      extractedCategory: 'Health',
      extractedTimeHours: 0.43,
      isConsumption: false,
      confidenceScore: 98,
      aiExplanation: 'Outdoor running workout entry.',
      suggestedAction: 'Log Health'
    }
  }
];

export const initialJournalEntries: JournalEntry[] = [
  {
    id: 'j_1',
    date: '2026-09-29',
    moodRating: 9,
    energyRating: 9,
    whatHappened: 'Commenced Day 1 of Winter Arc. Designed and built the SNOW Personal Operating System frontend. Completed 3h 40m of deep work and 2h 10m of AI Engineering.',
    whatWentWell: 'Eliminated morning phone distraction. Seamless execution of deep work blocks.',
    whatWentWrong: 'A slight delay in lunch break due to debugging code.',
    tomorrowPriority: 'Ship Universal Inbox review queue and complete consumption expense engine.',
    tags: ['WinterArc', 'Day1', 'DeepWork', 'SNOW']
  },
  {
    id: 'j_2',
    date: '2026-09-28',
    moodRating: 8,
    energyRating: 8,
    whatHappened: 'Built frontend architecture for time tracking and consumption math.',
    whatWentWell: 'Consistent sleep schedule (6h 50m). Hit 10,000 steps with afternoon cardio run.',
    whatWentWrong: 'Spent 1.2 hours on social media after lunch.',
    tomorrowPriority: 'Launch Winter Arc Day 1 protocol with 100% focus.',
    tags: ['PreArc', 'Preparation']
  },
  {
    id: 'j_3',
    date: '2026-09-27',
    moodRating: 9,
    energyRating: 9,
    whatHappened: 'Leg day workout in morning. Completed Docker & container security learning session.',
    whatWentWell: 'High energy throughout the day. Perfect meal prep adherence.',
    whatWentWrong: 'None.',
    tomorrowPriority: 'Finalize TypeScript schema definitions.',
    tags: ['Workout', 'DevOps']
  },
  {
    id: 'j_4',
    date: '2026-09-26',
    moodRating: 7,
    energyRating: 7,
    whatHappened: 'Long work sprint delivering client features.',
    whatWentWell: 'Shipped all assigned tasks before deadline.',
    whatWentWrong: 'Felt tired in evening due to shorter sleep night before.',
    tomorrowPriority: 'Prioritize recovery sleep and 7.5 hours duration.',
    tags: ['WorkSprint']
  },
  {
    id: 'j_5',
    date: '2026-09-25',
    moodRating: 8,
    energyRating: 8,
    whatHappened: 'Python Async Deep Dive session. Bought high quality olive oil for meal prep.',
    whatWentWell: 'Grasped Python asyncio task queues effortlessly.',
    whatWentWrong: 'A bit late on dinner routine.',
    tomorrowPriority: 'Sprint delivery prep.',
    tags: ['Learning', 'Python']
  }
];

export const initialNotifications: Notification[] = [
  {
    id: 'n_1',
    title: 'Winter Arc Day 1 Protocol Active',
    message: 'Welcome to SNOW. Your daily score goal is 85/100 today.',
    timestamp: '2026-09-29T07:00:00Z',
    isRead: false,
    type: 'system',
    actionRoute: '/'
  },
  {
    id: 'n_2',
    title: '3 Items Waiting in Universal Inbox Review Queue',
    message: 'Review AI extraction suggestions for shampoo, coffee beans, and olive oil.',
    timestamp: '2026-09-29T18:00:00Z',
    isRead: false,
    type: 'inbox',
    actionRoute: '/inbox/review'
  },
  {
    id: 'n_3',
    title: 'Petrol Consumption Allocation Active',
    message: '₹200 petrol refill allocated at ₹66.67/day for the next 3 days.',
    timestamp: '2026-09-29T19:30:00Z',
    isRead: true,
    type: 'consumption',
    actionRoute: '/finance/consumption'
  },
  {
    id: 'n_4',
    title: 'Winter Arc Checkpoint #1 Upcoming',
    message: 'October 15 Checkpoint is 16 days away. You are on track with AI Engineering.',
    timestamp: '2026-09-28T09:00:00Z',
    isRead: true,
    type: 'checkpoint',
    actionRoute: '/milestones'
  }
];
