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

// COGNITIVE & AI SUPERVISOR TYPES
export type CognitiveSkillCategory = 
  | 'Logical' 
  | 'Analytical' 
  | 'Critical' 
  | 'Operational' 
  | 'Observational' 
  | 'Numerical' 
  | 'Systems Thinking'
  | 'Problem Solving';

export type CognitiveDifficultyLevel = 1 | 2 | 3 | 4 | 5;

// AI PROFILE IMPORT & CONTEXT TYPES
export type AIImportMode = 'Guided' | 'Quick' | 'Periodic';
export type AIImportItemStatus = 'New' | 'Changed' | 'Outdated' | 'Conflict' | 'Unchanged';

export interface AIImportItem {
  id: string;
  module: 'Profile' | 'Goals' | 'Learning' | 'Projects' | 'Milestones' | 'Routines' | 'Financial' | 'Health' | 'Preferences';
  title: string;
  detail: string;
  category?: string;
  status: AIImportItemStatus;
  confidence: number;
  source: string;
  selectedAction: 'Import' | 'Ignore' | 'Edit';
  editedTitle?: string;
  editedDetail?: string;
  existingValue?: string;
  conflictReason?: string;
}

export interface AIImportPreview {
  mode: AIImportMode;
  totalFound: number;
  items: AIImportItem[];
  moduleCounts: Record<string, number>;
  outdatedCount: number;
  conflictCount: number;
}

export interface CognitiveQuestion {
  id: string;
  category: CognitiveSkillCategory;
  difficulty: CognitiveDifficultyLevel;
  question: string;
  contextData?: string;
  hints: string[];
  correctAnswer: string;
  explanation: string;
  skills: string[];
  estimatedTimeMins: number;
}

export interface CognitiveAttempt {
  id: string;
  questionId: string;
  startedAt: string;
  completedAt?: string;
  timeTakenSecs: number;
  userAnswer: string;
  isCorrect: boolean;
  isAssisted: boolean;
  hintsRequested: number;
  attemptsCount: number;
  reasoningScore: number;
  aiFeedback: {
    verdict: 'Correct' | 'Incorrect' | 'Partial';
    qualityScore: number;
    whatWentWell: string[];
    whatCouldImprove: string[];
    detailedReasoning: string;
  };
}

export interface CognitiveProfile {
  level: number;
  streakDays: number;
  totalSolved: number;
  independentSolves: number;
  assistedSolves: number;
  averageSolveTimeSecs: number;
  averageReasoningScore: number;
  trainingPerformanceIndex: Record<CognitiveSkillCategory, number>;
  skillLevels: Record<CognitiveSkillCategory, number>;
}

export interface AIInsight {
  id: string;
  title: string;
  module: 'Finance' | 'Time' | 'Learning' | 'Health' | 'Milestones' | 'Cognitive';
  confidenceLevel: 'High' | 'Moderate' | 'Low';
  confidenceReason: string;
  fact: string;
  interpretation: string;
  hypothesis: string;
  recommendation: string;
  underlyingData: {
    metric: string;
    value: string;
    previousValue?: string;
  }[];
  createdAt: string;
}

export interface AIRecommendation {
  id: string;
  title: string;
  description: string;
  priority: 'High' | 'Medium' | 'Low';
  actionRoute: string;
  actionLabel: string;
}

export interface AIMemory {
  id: string;
  category: 'Goals' | 'Preferences' | 'Patterns' | 'Milestones' | 'Financial Rules' | 'Learning History';
  memoryText: string;
  confidence: number;
  createdAt: string;
}

export interface AIActivity {
  id: string;
  timestamp: string;
  action: string;
  module: string;
  details: string;
}

export interface MilestonePaceAnalysis {
  milestoneId: string;
  milestoneTitle: string;
  targetHours: number;
  currentHours: number;
  progressPercent: number;
  daysRemaining: number;
  requiredDailyPace: string;
  actualRecentPace: string;
  status: 'Ahead' | 'On Track' | 'Pace Increase Required' | 'At Risk';
  aiObservation: string;
  suggestedAction: 'Increase Daily Pace' | 'Adjust Target Date' | 'Modify Scope';
}

export interface DailyBrief {
  id: string;
  date: string;
  todayFocus: string;
  whyFocus: string;
  evidenceText: string;
  todayChallengeId: string;
  todayChallengeTitle: string;
  upcomingMilestoneTitle: string;
}

export interface WeeklyReview {
  id: string;
  weekLabel: string;
  challengesCompleted: number;
  independentSolves: number;
  assistedSolves: number;
  averageReasoningScore: number;
  strongestSkill: CognitiveSkillCategory;
  weakestSkill: CognitiveSkillCategory;
  weeklyPattern: string;
  suggestedFocusNextWeek: CognitiveSkillCategory;
  suggestedChallengeMix: { category: CognitiveSkillCategory; percent: number }[];
}

// BASE TYPES
export type EvolutionTheme =
  | 'dark'
  | 'light-clean'
  | 'light-cinematic'
  | 'warm-hearth'
  | 'cozy-light'
  | 'amber-gold'
  | 'cyber-ember';

export type EvolutionCharacterVisibility = 'show' | 'minimal' | 'hide';

export type CharacterArtStyle =
  | 'anime'
  | 'manga'
  | 'cinematic'
  | 'fantasy'
  | 'sci-fi'
  | 'realistic'
  | 'minimal';

export type CharacterArchetype =
  | 'Strategist'
  | 'Warrior'
  | 'Scholar'
  | 'Explorer'
  | 'Engineer'
  | 'Mage'
  | 'Leader';

export interface User {
  id: string;
  name: string;
  email?: string;
  title: string;
  winterArcStartDate: string;
  currentDayIndex: number;
  avatarUrl?: string;
  themePreference: EvolutionTheme;
  characterVisibility?: EvolutionCharacterVisibility;
  characterStyle?: CharacterArtStyle;
  preferredArchetype?: CharacterArchetype;
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
  confidenceScore: number;
  aiExplanation: string;
  suggestedAction: 'Create Expense' | 'Create Consumption' | 'Log Time' | 'Log Learning' | 'Log Food' | 'Log Health';
}

export interface InboxEntry {
  id: string;
  timestamp: string;
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
  startTime: string;
  endTime: string;
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
  energyLevel: number;
  moodLevel: number;
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  parentGoalId?: string;
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
  moodRating: number;
  energyRating: number;
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

// WORKSPACE CUSTOMIZATION & MODULE TYPES
export type ModuleId =
  | 'home'
  | 'inbox'
  | 'finance'
  | 'time'
  | 'learning'
  | 'food'
  | 'health'
  | 'goals'
  | 'milestones'
  | 'cognitive'
  | 'ai'
  | 'evolution'
  | 'journal'
  | 'analytics'
  | 'reports';

export type ModuleCategory = 'core' | 'life' | 'money' | 'growth' | 'insights';

export interface ModuleDefinition {
  id: ModuleId;
  name: string;
  iconName: string;
  description: string;
  category: ModuleCategory;
  route: string;
  canHide: boolean;
  defaultOrderIndex: number;
}

export interface WorkspacePreferences {
  enabledModules: ModuleId[];
  pinnedSidebarModules: ModuleId[];
  defaultView: ModuleId;
  dashboardOrder: ModuleId[];
  quickActions: string[];
  hasCompletedWorkspaceSetup: boolean;
}

export type WorkspacePreset = 'Full Life' | 'Productivity' | 'Finance' | 'Health' | 'Developer';

// DAILY PROGRESS & DISTRACTION CALENDAR
export type DailyProgressStatus = 'excellent' | 'good' | 'neutral' | 'distracted' | 'poor' | 'no_data';

export interface DistractionEvent {
  source: string;
  minutes: number;
  reason?: string;
}

export interface DailyProgress {
  date: string; // YYYY-MM-DD
  status: DailyProgressStatus;
  progressScore?: number; // 0 - 100
  goalsCompleted?: number;
  goalsTotal?: number;
  learningMinutes?: number;
  focusMinutes?: number;
  distractionMinutes?: number;
  importantActivities?: string[];
  distractions?: DistractionEvent[];
  reflection?: string;
}

export interface DailyProgressResponse {
  date: string;
  status: DailyProgressStatus;
  progressScore: number;
  evidence: {
    goalsCompleted: number;
    goalsTotal: number;
    learningMinutes: number;
    focusMinutes: number;
    distractionMinutes: number;
  };
  distractions: DistractionEvent[];
  reflection?: string;
}

// AUTH SESSION
export interface AuthSession {
  userId: string;
  email?: string;
  provider?: 'google' | 'email';
  expiresAt?: string;
}

// LEGACY ARC CALENDAR TYPES (backward compatibility)
export type ArcDayProgressStatus = 'progress' | 'distracted' | 'rest' | 'upcoming';

export interface ArcCalendarDay {
  date: string; // YYYY-MM-DD
  dayIndex?: number;
  status: ArcDayProgressStatus;
  reason: string; // Reason for progress or distraction
  deepWorkHours?: number;
  tags?: string[];
  updatedAt?: string;
}

// ==========================================
// EVOLUTION THEME & CHARACTER SYSTEM
// ==========================================

export interface EvolutionProfile {
  discipline: number; // 0 - 100
  consistency: number;
  learning: number;
  execution: number;
  health: number;
  financialControl: number;
  timeManagement: number;
  cognitiveGrowth: number;
  goalProgress: number;
  overallScore: number;
}

export interface EvolutionEvidence {
  trackingConsistencyPct: number; // e.g. 87%
  learningHours: number; // e.g. 24h
  milestoneCompletionPct: number; // e.g. 81%
  cognitivePerformanceScore: number; // e.g. 76%
  sleepConsistency: string; // e.g. "Inconsistent sleep (avg 6.1h)"
  financialAdherence: string; // e.g. "Spending slightly above monthly discretionary ceiling"
  positiveEvidences: string[];
  frictionPoints: string[];
  strongestArea: string;
  biggestInconsistency: string;
  nextEvolutionCriteria: string;
}

export interface EvolutionStageRecord {
  id: string;
  stage: number; // 0 - 5
  stageName: string; // "Awakening", "Discipline", "Growth", "Execution", "Mastery"
  archetype: CharacterArchetype;
  unlockedDate: string; // e.g. "OCT 2026", "NOV 2026", "2026-10-15"
  unlockedDayIndex: number;
  characterImageUrl: string;
  characterPose: string;
  environmentDescription: string;
  evolutionScore: number;
  profile: EvolutionProfile;
  evidence: EvolutionEvidence;
  aiExplanation: string;
  userReflection?: string;
}

export interface EvolutionCandidateEvaluation {
  currentStage: number;
  currentStageName: string;
  targetStage: number;
  targetStageName: string;
  targetArchetype: CharacterArchetype;
  observationPeriodDays: number;
  confidenceScore: number; // e.g. 91%
  isReady: boolean;
  status: 'Ready for evolution' | 'Observation period in progress' | 'Stage maintained (inconsistent patterns)';
  summaryExplanation: string;
  detailedCriteria: {
    label: string;
    target: string;
    actual: string;
    met: boolean;
  }[];
}

export interface EvolutionState {
  currentStage: number; // 0 - 5
  currentStageName: string;
  currentArchetype: CharacterArchetype;
  characterStyle: CharacterArtStyle;
  characterVisibility: EvolutionCharacterVisibility;
  progressToNextEvolution: number; // e.g. 73%
  observationPeriodDays: number; // e.g. 28 days
  aiConfidenceScore: number; // e.g. 91%
  currentProfile: EvolutionProfile;
  currentEvidence: EvolutionEvidence;
  characterImageUrl: string;
  history: EvolutionStageRecord[];
  lastEvaluatedAt: string;
  candidateEvaluation: EvolutionCandidateEvaluation;
}

// ==========================================
// APP USAGE TRACKER
// ==========================================

export type AppUsageCategory =
  | 'social'
  | 'video'
  | 'professional'
  | 'finance'
  | 'browser'
  | 'other';

export interface TrackedApp {
  id: string;
  name: string;
  slug: string;
  icon: string; // emoji or icon identifier
  category: AppUsageCategory;
  color: string; // accent color for the app
}

export interface AppUsageSession {
  id: string;
  appId: string;
  userId: string;
  startedAt: string; // ISO timestamp
  endedAt: string | null; // null if active
  durationSeconds: number | null; // null if active
  date: string; // YYYY-MM-DD
  status: 'active' | 'completed';
}

