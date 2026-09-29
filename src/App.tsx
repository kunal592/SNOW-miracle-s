import React, { useState, useEffect } from 'react';
import {
  User,
  InboxEntry,
  AIExtraction,
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
  CategoryType
} from './types';
import { Storage } from './lib/storage';
import { AppShell } from './components/AppShell';
import { ToastMessage } from './components/Toast';

// Views
import { HomeView } from './views/HomeView';
import { UniversalInboxView } from './views/UniversalInboxView';
import { AIReviewQueueView } from './views/AIReviewQueueView';
import { ExpenseDashboardView } from './views/ExpenseDashboardView';
import { ConsumptionEngineView } from './views/ConsumptionEngineView';
import { FuelTrackingView } from './views/FuelTrackingView';
import { TimeTrackingView } from './views/TimeTrackingView';
import { LearningDashboardView } from './views/LearningDashboardView';
import { FoodNutritionView } from './views/FoodNutritionView';
import { HealthWellnessView } from './views/HealthWellnessView';
import { GoalsView } from './views/GoalsView';
import { MilestonesView } from './views/MilestonesView';
import { JournalView } from './views/JournalView';
import { AnalyticsView } from './views/AnalyticsView';
import { ReportsView } from './views/ReportsView';
import { ExportCenterView } from './views/ExportCenterView';
import { SettingsView } from './views/SettingsView';
import { MoreMenuView } from './views/MoreMenuView';

export function App() {
  const [currentRoute, setCurrentRoute] = useState<string>(() => {
    return window.location.pathname || '/';
  });

  // Main state synced with localStorage
  const [user, setUser] = useState<User>(() => Storage.getUser());
  const [inbox, setInbox] = useState<InboxEntry[]>(() => Storage.getInbox());
  const [expenses, setExpenses] = useState<Expense[]>(() => Storage.getExpenses());
  const [consumption, setConsumption] = useState<ConsumptionExpense[]>(() => Storage.getConsumption());
  const [fuel, setFuel] = useState<FuelEntry[]>(() => Storage.getFuel());
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>(() => Storage.getTimeEntries());
  const [learningSessions, setLearningSessions] = useState<LearningSession[]>(() => Storage.getLearningSessions());
  const [learningGoals, setLearningGoals] = useState<LearningGoal[]>(() => Storage.getLearningGoals());
  const [food, setFood] = useState<FoodEntry[]>(() => Storage.getFood());
  const [health, setHealth] = useState<HealthEntry[]>(() => Storage.getHealth());
  const [goals, setGoals] = useState<Goal[]>(() => Storage.getGoals());
  const [milestones, setMilestones] = useState<Milestone[]>(() => Storage.getMilestones());
  const [journal, setJournal] = useState<JournalEntry[]>(() => Storage.getJournal());

  // Toast System State
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const handleShowToast = (text: string, type: 'success' | 'error' | 'info' = 'info') => {
    const newToast: ToastMessage = { id: Math.random().toString(36), text, type };
    setToasts((prev) => [...prev, newToast]);
  };

  const handleDismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Sync route state with history API
  const handleNavigate = (route: string) => {
    setCurrentRoute(route);
    window.history.pushState({}, '', route);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const handlePopState = () => {
      setCurrentRoute(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Handlers for data mutations
  const handleAddUniversalDump = (rawText: string, extraction: AIExtraction) => {
    const newEntry: InboxEntry = {
      id: 'inb_' + Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toISOString(),
      rawText,
      status: extraction.confidenceScore >= 95 ? 'Approved' : 'Needs Review',
      aiExtraction: extraction
    };

    const updatedInbox = [newEntry, ...inbox];
    setInbox(updatedInbox);
    Storage.setInbox(updatedInbox);

    // If auto-approved consumption or expense, process into system
    if (extraction.confidenceScore >= 95) {
      if (extraction.isConsumption && extraction.extractedAmount && extraction.dailyAllocationCost) {
        const newCons: ConsumptionExpense = {
          id: 'con_' + Math.random().toString(36).substring(2, 9),
          item: rawText,
          category: extraction.extractedCategory,
          totalPurchaseAmount: extraction.extractedAmount,
          purchaseDate: new Date().toISOString().split('T')[0],
          startDate: new Date().toISOString().split('T')[0],
          expectedDurationDays: extraction.extractedDurationDays || 3,
          dailyCost: extraction.dailyAllocationCost,
          allocationMethod: 'Equal daily',
          status: 'Active'
        };
        const updatedCons = [newCons, ...consumption];
        setConsumption(updatedCons);
        Storage.setConsumption(updatedCons);
      }
    }
  };

  const handleApproveInboxEntry = (id: string) => {
    const updated = inbox.map((item) => (item.id === id ? { ...item, status: 'Approved' as const } : item));
    setInbox(updated);
    Storage.setInbox(updated);
    handleShowToast('Approved inbox entry', 'success');
  };

  const handleApproveAllInbox = () => {
    const updated = inbox.map((item) => ({ ...item, status: 'Approved' as const }));
    setInbox(updated);
    Storage.setInbox(updated);
    handleShowToast('All inbox entries approved & processed!', 'success');
  };

  const handleDeleteInboxEntry = (id: string) => {
    const updated = inbox.filter((i) => i.id !== id);
    setInbox(updated);
    Storage.setInbox(updated);
    handleShowToast('Deleted inbox item', 'info');
  };

  const handleAddExpense = (data: { title: string; amount: number; category: CategoryType }) => {
    const newExp: Expense = {
      id: 'exp_' + Math.random().toString(36).substring(2, 9),
      date: new Date().toISOString().split('T')[0],
      amount: data.amount,
      category: data.category,
      title: data.title,
      isConsumption: false,
      paymentMethod: 'UPI'
    };
    const updated = [newExp, ...expenses];
    setExpenses(updated);
    Storage.setExpenses(updated);
  };

  const handleAddConsumption = (item: Omit<ConsumptionExpense, 'id'>) => {
    const newCons: ConsumptionExpense = {
      ...item,
      id: 'con_' + Math.random().toString(36).substring(2, 9)
    };
    const updated = [newCons, ...consumption];
    setConsumption(updated);
    Storage.setConsumption(updated);
    handleShowToast(`Created consumption: ₹${item.dailyCost.toFixed(2)}/day`, 'success');
  };

  const handleUpdateConsumption = (id: string, updatedFields: Partial<ConsumptionExpense>) => {
    const updated = consumption.map((item) => (item.id === id ? { ...item, ...updatedFields } : item));
    setConsumption(updated);
    Storage.setConsumption(updated);
    handleShowToast('Updated consumption allocation', 'success');
  };

  const handleDeleteConsumption = (id: string) => {
    const updated = consumption.filter((i) => i.id !== id);
    setConsumption(updated);
    Storage.setConsumption(updated);
    handleShowToast('Deleted consumption item', 'info');
  };

  const handleAddFuelEntry = (entry: FuelEntry) => {
    const updated = [entry, ...fuel];
    setFuel(updated);
    Storage.setFuel(updated);
    handleShowToast(`Refill logged! Mileage: ${entry.mileageKmpl} km/L`, 'success');
  };

  const handleAddTimeEntry = (entry: TimeEntry) => {
    const updated = [entry, ...timeEntries];
    setTimeEntries(updated);
    Storage.setTimeEntries(updated);
  };

  const handleAddLearningSession = (session: LearningSession) => {
    const updated = [session, ...learningSessions];
    setLearningSessions(updated);
    Storage.setLearningSessions(updated);
    handleShowToast(`Logged ${session.durationMinutes}m of ${session.topic}`, 'success');
  };

  const handleAddFoodEntry = (entry: FoodEntry) => {
    const updated = [entry, ...food];
    setFood(updated);
    Storage.setFood(updated);
    handleShowToast(`Meal recorded: ${entry.description}`, 'success');
  };

  const handleAddGoal = (goal: Goal) => {
    const updated = [goal, ...goals];
    setGoals(updated);
    Storage.setGoals(updated);
    handleShowToast(`Created Goal: ${goal.title}`, 'success');
  };

  const handleAddMilestone = (milestone: Milestone) => {
    const updated = [milestone, ...milestones];
    setMilestones(updated);
    Storage.setMilestones(updated);
    handleShowToast(`Created Milestone: ${milestone.title}`, 'success');
  };

  const handleToggleChecklistItem = (milestoneId: string, itemId: string) => {
    const updated = milestones.map((ms) => {
      if (ms.id === milestoneId) {
        return {
          ...ms,
          checklist: ms.checklist.map((ck) => (ck.id === itemId ? { ...ck, done: !ck.done } : ck))
        };
      }
      return ms;
    });
    setMilestones(updated);
    Storage.setMilestones(updated);
  };

  const handleAddJournalEntry = (entry: JournalEntry) => {
    const updated = [entry, ...journal];
    setJournal(updated);
    Storage.setJournal(updated);
    handleShowToast('Journal entry saved!', 'success');
  };

  const handleUpdateUser = (newUser: User) => {
    setUser(newUser);
    Storage.setUser(newUser);
  };

  const unreadReviewCount = inbox.filter((i) => i.status === 'Needs Review' || i.status === 'Raw').length;

  // View routing switch
  const renderView = () => {
    switch (currentRoute) {
      case '/':
        return (
          <HomeView
            user={user}
            onNavigate={handleNavigate}
            onOpenQuickAdd={() => {}}
            timeEntries={timeEntries}
            expenses={expenses}
            consumptionExpenses={consumption}
            healthEntries={health}
            learningSessions={learningSessions}
            goals={goals}
            milestones={milestones}
            inbox={inbox}
          />
        );
      case '/inbox':
        return (
          <UniversalInboxView
            inbox={inbox}
            onAddEntry={handleAddUniversalDump}
            onApproveEntry={handleApproveInboxEntry}
            onDeleteEntry={handleDeleteInboxEntry}
            onNavigateToReview={() => handleNavigate('/inbox/review')}
          />
        );
      case '/inbox/review':
        return (
          <AIReviewQueueView
            inbox={inbox}
            onApprove={handleApproveInboxEntry}
            onApproveAll={handleApproveAllInbox}
            onReject={handleDeleteInboxEntry}
          />
        );
      case '/finance':
        return (
          <ExpenseDashboardView
            expenses={expenses}
            consumptionExpenses={consumption}
            onNavigate={handleNavigate}
          />
        );
      case '/finance/consumption':
        return (
          <ConsumptionEngineView
            consumptionItems={consumption}
            onAddConsumption={handleAddConsumption}
            onUpdateConsumption={handleUpdateConsumption}
            onDeleteConsumption={handleDeleteConsumption}
          />
        );
      case '/finance/fuel':
        return (
          <FuelTrackingView
            fuelEntries={fuel}
            onAddFuelEntry={handleAddFuelEntry}
          />
        );
      case '/track':
        return (
          <TimeTrackingView
            timeEntries={timeEntries}
            onAddTimeEntry={handleAddTimeEntry}
          />
        );
      case '/learning':
        return (
          <LearningDashboardView
            learningSessions={learningSessions}
            learningGoals={learningGoals}
            onAddLearningSession={handleAddLearningSession}
          />
        );
      case '/food':
        return (
          <FoodNutritionView
            foodEntries={food}
            onAddFoodEntry={handleAddFoodEntry}
          />
        );
      case '/health':
        return (
          <HealthWellnessView
            healthEntries={health}
            onUpdateTodayHealth={() => {}}
          />
        );
      case '/goals':
        return (
          <GoalsView
            goals={goals}
            onAddGoal={handleAddGoal}
          />
        );
      case '/milestones':
        return (
          <MilestonesView
            milestones={milestones}
            onAddMilestone={handleAddMilestone}
            onToggleChecklistItem={handleToggleChecklistItem}
            onOpenCheckpointModal={() => {}}
          />
        );
      case '/journal':
        return (
          <JournalView
            journalEntries={journal}
            onAddJournalEntry={handleAddJournalEntry}
          />
        );
      case '/analytics':
        return <AnalyticsView />;
      case '/reports':
        return <ReportsView onShowToast={handleShowToast} />;
      case '/export':
        return <ExportCenterView onShowToast={handleShowToast} />;
      case '/settings':
        return (
          <SettingsView
            user={user}
            onUpdateUser={handleUpdateUser}
            categories={Storage.getCategories()}
            onShowToast={handleShowToast}
          />
        );
      case '/more':
        return (
          <MoreMenuView
            onNavigate={handleNavigate}
            unreadReviewCount={unreadReviewCount}
          />
        );
      default:
        return (
          <HomeView
            user={user}
            onNavigate={handleNavigate}
            onOpenQuickAdd={() => {}}
            timeEntries={timeEntries}
            expenses={expenses}
            consumptionExpenses={consumption}
            healthEntries={health}
            learningSessions={learningSessions}
            goals={goals}
            milestones={milestones}
            inbox={inbox}
          />
        );
    }
  };

  return (
    <AppShell
      currentRoute={currentRoute}
      onNavigate={handleNavigate}
      user={user}
      onUpdateUser={handleUpdateUser}
      toasts={toasts}
      onDismissToast={handleDismissToast}
      onShowToast={handleShowToast}
      inbox={inbox}
      onAddUniversalDump={handleAddUniversalDump}
      onAddExpense={handleAddExpense}
      onAddLogTime={(data) => {
        handleAddTimeEntry({
          id: 't_' + Math.random().toString(36).substring(2, 9),
          date: new Date().toISOString().split('T')[0],
          startTime: '10:00',
          endTime: '11:30',
          durationMinutes: data.minutes,
          activity: data.activity,
          category: data.category
        });
      }}
    >
      {renderView()}
    </AppShell>
  );
}
