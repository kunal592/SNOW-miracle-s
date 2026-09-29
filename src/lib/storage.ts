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
  JournalEntry,
  Category,
  Notification
} from '../types';
import {
  initialUser,
  initialCategories,
  initialConsumptionExpenses,
  initialExpenses,
  initialFuelEntries,
  initialTimeEntries,
  initialLearningSessions,
  initialLearningGoals,
  initialFoodEntries,
  initialHealthEntries,
  initialGoals,
  initialMilestones,
  initialInboxEntries,
  initialJournalEntries,
  initialNotifications
} from './mockData';

const STORAGE_KEYS = {
  USER: 'snow_user',
  CATEGORIES: 'snow_categories',
  CONSUMPTION: 'snow_consumption',
  EXPENSES: 'snow_expenses',
  FUEL: 'snow_fuel',
  TIME: 'snow_time',
  LEARNING_SESSIONS: 'snow_learning_sessions',
  LEARNING_GOALS: 'snow_learning_goals',
  FOOD: 'snow_food',
  HEALTH: 'snow_health',
  GOALS: 'snow_goals',
  MILESTONES: 'snow_milestones',
  INBOX: 'snow_inbox',
  JOURNAL: 'snow_journal',
  NOTIFICATIONS: 'snow_notifications'
};

function getItem<T>(key: string, fallback: T): T {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch (err) {
    console.error(`Error reading ${key} from storage`, err);
    return fallback;
  }
}

function setItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Error writing ${key} to storage`, err);
  }
}

export const Storage = {
  getUser: (): User => getItem(STORAGE_KEYS.USER, initialUser),
  setUser: (user: User) => setItem(STORAGE_KEYS.USER, user),

  getCategories: (): Category[] => getItem(STORAGE_KEYS.CATEGORIES, initialCategories),
  setCategories: (cats: Category[]) => setItem(STORAGE_KEYS.CATEGORIES, cats),

  getConsumption: (): ConsumptionExpense[] => getItem(STORAGE_KEYS.CONSUMPTION, initialConsumptionExpenses),
  setConsumption: (items: ConsumptionExpense[]) => setItem(STORAGE_KEYS.CONSUMPTION, items),

  getExpenses: (): Expense[] => getItem(STORAGE_KEYS.EXPENSES, initialExpenses),
  setExpenses: (items: Expense[]) => setItem(STORAGE_KEYS.EXPENSES, items),

  getFuel: (): FuelEntry[] => getItem(STORAGE_KEYS.FUEL, initialFuelEntries),
  setFuel: (items: FuelEntry[]) => setItem(STORAGE_KEYS.FUEL, items),

  getTimeEntries: (): TimeEntry[] => getItem(STORAGE_KEYS.TIME, initialTimeEntries),
  setTimeEntries: (items: TimeEntry[]) => setItem(STORAGE_KEYS.TIME, items),

  getLearningSessions: (): LearningSession[] => getItem(STORAGE_KEYS.LEARNING_SESSIONS, initialLearningSessions),
  setLearningSessions: (items: LearningSession[]) => setItem(STORAGE_KEYS.LEARNING_SESSIONS, items),

  getLearningGoals: (): LearningGoal[] => getItem(STORAGE_KEYS.LEARNING_GOALS, initialLearningGoals),
  setLearningGoals: (items: LearningGoal[]) => setItem(STORAGE_KEYS.LEARNING_GOALS, items),

  getFood: (): FoodEntry[] => getItem(STORAGE_KEYS.FOOD, initialFoodEntries),
  setFood: (items: FoodEntry[]) => setItem(STORAGE_KEYS.FOOD, items),

  getHealth: (): HealthEntry[] => getItem(STORAGE_KEYS.HEALTH, initialHealthEntries),
  setHealth: (items: HealthEntry[]) => setItem(STORAGE_KEYS.HEALTH, items),

  getGoals: (): Goal[] => getItem(STORAGE_KEYS.GOALS, initialGoals),
  setGoals: (items: Goal[]) => setItem(STORAGE_KEYS.GOALS, items),

  getMilestones: (): Milestone[] => getItem(STORAGE_KEYS.MILESTONES, initialMilestones),
  setMilestones: (items: Milestone[]) => setItem(STORAGE_KEYS.MILESTONES, items),

  getInbox: (): InboxEntry[] => getItem(STORAGE_KEYS.INBOX, initialInboxEntries),
  setInbox: (items: InboxEntry[]) => setItem(STORAGE_KEYS.INBOX, items),

  getJournal: (): JournalEntry[] => getItem(STORAGE_KEYS.JOURNAL, initialJournalEntries),
  setJournal: (items: JournalEntry[]) => setItem(STORAGE_KEYS.JOURNAL, items),

  getNotifications: (): Notification[] => getItem(STORAGE_KEYS.NOTIFICATIONS, initialNotifications),
  setNotifications: (items: Notification[]) => setItem(STORAGE_KEYS.NOTIFICATIONS, items),

  resetAll: () => {
    localStorage.clear();
  }
};
