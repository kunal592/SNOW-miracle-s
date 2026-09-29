export type CategoryType = 
  | 'Transport' 
  | 'Food' 
  | 'Housing' 
  | 'Subscriptions' 
  | 'Personal Care' 
  | 'Learning' 
  | 'Work' 
  | 'Health' 
  | 'Entertainment' 
  | 'Utilities'
  | 'Other';

export type AllocationMethod = 'Equal daily' | 'Per quantity' | 'Per usage' | 'Subscription period';

export type GoalStatus = 'Not Started' | 'In Progress' | 'On Track' | 'At Risk' | 'Completed';
export type MilestoneStatus = 'Upcoming' | 'Today' | 'Completed' | 'Overdue';
export type InboxStatus = 'Raw' | 'Processing' | 'Needs Review' | 'Approved' | 'Rejected';

export interface User {
  id: string;
  name: string;
  title: string;
  winterArcStartDate: string; // ISO date '2026-09-29'
  currentDayIndex: number; // e.g. Day 1
  avatarUrl?: string;
  themePreference: 'warm-hearth' | 'cozy-light' | 'amber-gold' | 'cyber-ember';
}

export interface AIExtraction {
  id: string;
  rawText: string;
  extractedCategory: CategoryType;
  subcategory?: string;
  extractedAmount?: number;
  extractedDurationDays?: number;
  isConsumption: boolean;
  dailyAllocationCost?: number;
  extractedTimeHours?: number;
  confidenceScore: number; // 0 - 100
  aiExplanation: string;
  suggestedAction: 'Create Expense' | 'Create Consumption' | 'Log Time' | 'Log Learning' | 'Log Food' | 'Log Health';
}

export interface InboxEntry {
  id: string;
  timestamp: string; // ISO format
  rawText: string;
  status: InboxStatus;
  aiExtraction?: AIExtraction;
  tags?: string[];
  audioUrl?: string;
  imageUrl?: string;
}

export interface Expense {
  id: string;
  date: string;
  amount: number;
  category: CategoryType;
  title: string;
  description?: string;
  isConsumption: boolean;
  consumptionId?: string;
  paymentMethod?: string;
}

export interface ConsumptionAllocation {
  date: string;
  dailyCost: number;
  status: 'Allocated' | 'Pending';
}

export interface ConsumptionExpense {
  id: string;
  item: string;
  category: CategoryType;
  totalPurchaseAmount: number;
  purchaseDate: string;
  startDate: string;
  expectedDurationDays: number;
  dailyCost: number;
  quantity?: number;
  unit?: string;
  allocationMethod: AllocationMethod;
  status: 'Active' | 'Completed' | 'Paused';
  allocations?: ConsumptionAllocation[];
  notes?: string;
}

export interface FuelEntry {
  id: string;
  date: string;
  amountSpent: number;
  litres: number;
  odometerKm: number;
  previousOdometerKm: number;
  distanceKm: number;
  mileageKmpl: number;
  costPerKm: number;
  expectedDurationDays: number;
  dailyFuelCost: number;
  stationName?: string;
}

export interface TimeEntry {
  id: string;
  date: string;
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  durationMinutes: number;
  activity: string;
  category: 'Work' | 'Learning' | 'Health' | 'Personal' | 'Commute' | 'Entertainment' | 'Sleep' | 'Other';
  isDeepWork?: boolean;
}

export interface LearningSession {
  id: string;
  date: string;
  topic: string;
  durationMinutes: number;
  projectId?: string;
  projectName?: string;
  notes?: string;
  keyTakeaway?: string;
}

export interface LearningGoal {
  id: string;
  title: string;
  targetHours: number;
  completedHours: number;
  progressPercent: number;
  category: string;
  associatedProjects: {
    id: string;
    name: string;
    progressPercent: number;
  }[];
}

export interface FoodEntry {
  id: string;
  date: string;
  mealType: 'Breakfast' | 'Lunch' | 'Snack' | 'Dinner';
  description: string;
  calories?: number;
  proteinGrams?: number;
  cost: number;
  isConsumptionBased: boolean;
  consumptionDailyAllocation?: number;
}

export interface HealthEntry {
  id: string;
  date: string;
  sleepHours: number;
  sleepQuality?: 'Poor' | 'Fair' | 'Good' | 'Optimal';
  waterLiters: number;
  workoutCompleted: boolean;
  workoutType?: string;
  stepsCount: number;
  weightKg: number;
  energyLevel: number; // 1-10
  moodLevel: number; // 1-10
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  parentGoalId?: string; // For hierarchy e.g. Winter Arc -> Career -> AI Engineer
  category: 'Career' | 'Finance' | 'Health' | 'Mindset' | 'Skills';
  startDate: string;
  targetDate: string;
  progressPercent: number;
  status: GoalStatus;
  metrics: {
    label: string;
    current: number;
    target: number;
    unit: string;
  }[];
  subGoalsCount?: number;
}

export interface Milestone {
  id: string;
  title: string;
  date: string;
  time?: string;
  type: 'Checkpoint' | 'Review' | 'Deadline' | 'Personal';
  description: string;
  status: MilestoneStatus;
  linkedGoalIds: string[];
  checklist: {
    id: string;
    task: string;
    done: boolean;
  }[];
  reflectionQuestions?: string[];
}

export interface Checkpoint {
  id: string;
  milestoneId: string;
  date: string;
  title: string;
  statsSummary: {
    deepWorkHours: number;
    targetDeepWorkHours: number;
    workoutsDone: number;
    targetWorkouts: number;
    expenseTrackingDays: number;
    targetTrackingDays: number;
    avgScreenTime: string;
  };
  reflection: {
    whatWentWell: string;
    whatWentWrong: string;
    whatShouldChange: string;
    nextPriority: string;
  };
  completedAt?: string;
  isSnoozed?: boolean;
}

export interface JournalEntry {
  id: string;
  date: string;
  moodRating: number; // 1-5 or 1-10
  energyRating: number; // 1-10
  whatHappened: string;
  whatWentWell: string;
  whatWentWrong: string;
  tomorrowPriority: string;
  tags?: string[];
}

export interface Category {
  id: string;
  name: CategoryType;
  iconName: string;
  colorHex: string;
  monthlyBudget?: number;
}

export interface Report {
  id: string;
  title: string;
  type: 'Daily' | 'Weekly' | 'Monthly' | 'Winter Arc' | 'Financial' | 'Learning' | 'Health';
  generatedDate: string;
  periodLabel: string;
  summaryHighlights: string[];
  metrics: Record<string, string | number>;
  pdfUrl?: string;
}

export interface ExportJob {
  id: string;
  modules: string[];
  startDate: string;
  endDate: string;
  format: 'PDF' | 'XLSX' | 'CSV' | 'JSON';
  status: 'Pending' | 'Completed';
  createdAt: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  type: 'checkpoint' | 'consumption' | 'inbox' | 'system';
  actionRoute?: string;
}
