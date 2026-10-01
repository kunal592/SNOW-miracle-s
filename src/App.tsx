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
  CategoryType,
  CognitiveAttempt,
  CognitiveProfile,
  AIMemory,
  AIActivity
} from './types';
import { Storage } from './lib/storage';
import {
  initialCognitiveQuestions,
  initialAIRecommendations,
  initialMilestonePaceAnalysis,
  initialDailyBrief,
  initialWeeklyReview
} from './lib/mockData';
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

// NEW COGNITIVE & AI VIEWS
import { CognitiveLabView } from './views/CognitiveLabView';
import { CognitiveProfileView } from './views/CognitiveProfileView';
import { WeeklyThinkingReviewView } from './views/WeeklyThinkingReviewView';
import { AICommandCenterView } from './views/AICommandCenterView';
import { AIMemoryView } from './views/AIMemoryView';
import { AIActivityLogView } from './views/AIActivityLogView';
import { AIProfileImportView } from './views/AIProfileImportView';
import { WorkspaceCustomizationView } from './views/WorkspaceCustomizationView';
import { OnboardingImportModal } from './components/OnboardingImportModal';
import { DailyProgressCalendarModal } from './components/DailyProgressCalendarModal';
import { LogoutConfirmModal } from './components/LogoutConfirmModal';
import { ArcCalendarModal } from './components/ArcCalendarModal';
import { AuthModal } from './components/AuthModal';
import { api } from './lib/api';
import { WorkspacePreferences } from './types';

export function App() {
  const [workspacePreferences, setWorkspacePreferences] = useState<WorkspacePreferences>(() =>
    Storage.getWorkspacePreferences()
  );

  const [currentRoute, setCurrentRoute] = useState<string>(() => {
    const defaultRoute = workspacePreferences.defaultView === 'home' ? '/' : `/${workspacePreferences.defaultView}`;
    return window.location.pathname !== '/' ? window.location.pathname : defaultRoute;
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

  // Cognitive & AI state
  const [cognitiveAttempts, setCognitiveAttempts] = useState<CognitiveAttempt[]>(() => Storage.getCognitiveAttempts());
  const [cognitiveProfile, setCognitiveProfile] = useState<CognitiveProfile>(() => Storage.getCognitiveProfile());
  const [aiMemories, setAIMemories] = useState<AIMemory[]>(() => Storage.getAIMemories());
  const [aiActivityLogs, setAIActivityLogs] = useState<AIActivity[]>(() => Storage.getAIActivityLogs());
  const [aiInsights] = useState(() => Storage.getAIInsights());

  // Toast System State
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Daily Progress Calendar & Logout Confirmation Modals
  const [isDailyCalendarOpen, setIsDailyProgressCalendarOpen] = useState(false);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Logout confirmation flow according to specification
  const handleLogoutClick = () => {
    setIsLogoutConfirmOpen(true);
  };

  const handleConfirmLogout = async () => {
    try {
      await api.auth.logout();
    } catch (err) {
      console.warn('Backend logout call:', err);
    }
    Storage.clearAuthSession();
    Storage.clearTokens();
    handleShowToast('Logged out. Your data is safely synced.', 'info');
    setIsAuthModalOpen(true);
  };

  // Dynamic Visual Aesthetics Theme switcher effect
  useEffect(() => {
    if (user.themePreference) {
      document.documentElement.setAttribute('data-theme', user.themePreference);
    }
  }, [user.themePreference]);

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

  // COGNITIVE & AI MUTATIONS
  const handleSaveCognitiveAttempt = (attempt: CognitiveAttempt) => {
    const updatedAttempts = [attempt, ...cognitiveAttempts];
    setCognitiveAttempts(updatedAttempts);
    Storage.setCognitiveAttempts(updatedAttempts);

    const newProf: CognitiveProfile = {
      ...cognitiveProfile,
      totalSolved: cognitiveProfile.totalSolved + 1,
      independentSolves: attempt.isAssisted ? cognitiveProfile.independentSolves : cognitiveProfile.independentSolves + 1,
      assistedSolves: attempt.isAssisted ? cognitiveProfile.assistedSolves + 1 : cognitiveProfile.assistedSolves,
      streakDays: cognitiveProfile.streakDays + 1
    };
    setCognitiveProfile(newProf);
    Storage.setCognitiveProfile(newProf);

    handleShowToast(
      attempt.isCorrect
        ? `🎉 Challenge solved! Reasoning Score: ${attempt.reasoningScore}/10`
        : 'Attempt recorded. Review feedback below.',
      attempt.isCorrect ? 'success' : 'info'
    );
  };

  const handleAddAIMemory = (memory: AIMemory) => {
    const updated = [memory, ...aiMemories];
    setAIMemories(updated);
    Storage.setAIMemories(updated);
    handleShowToast('AI Memory rule saved', 'success');
  };

  const handleDeleteAIMemory = (id: string) => {
    const updated = aiMemories.filter((m) => m.id !== id);
    setAIMemories(updated);
    Storage.setAIMemories(updated);
    handleShowToast('AI Memory deleted', 'info');
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
            dailyBrief={initialDailyBrief}
            workspacePreferences={workspacePreferences}
            onCompleteWorkspaceSetup={() => {
              const updated = { ...workspacePreferences, hasCompletedWorkspaceSetup: true };
              setWorkspacePreferences(updated);
              Storage.setWorkspacePreferences(updated);
            }}
          />
        );
      case '/cognitive':
        return (
          <CognitiveLabView
            questions={initialCognitiveQuestions}
            attempts={cognitiveAttempts}
            onSaveAttempt={handleSaveCognitiveAttempt}
            onNavigate={handleNavigate}
          />
        );
      case '/cognitive/profile':
        return (
          <CognitiveProfileView
            profile={cognitiveProfile}
            onNavigate={handleNavigate}
          />
        );
      case '/cognitive/review':
        return (
          <WeeklyThinkingReviewView
            weeklyReview={initialWeeklyReview}
            onNavigate={handleNavigate}
          />
        );
      case '/ai':
        return (
          <AICommandCenterView
            dailyBrief={initialDailyBrief}
            insights={aiInsights}
            recommendations={initialAIRecommendations}
            milestonePace={initialMilestonePaceAnalysis}
            onNavigate={handleNavigate}
          />
        );
      case '/ai/memory':
        return (
          <AIMemoryView
            memories={aiMemories}
            onAddMemory={handleAddAIMemory}
            onDeleteMemory={handleDeleteAIMemory}
          />
        );
      case '/ai/activity':
        return (
          <AIActivityLogView activityLogs={aiActivityLogs} />
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
            onNavigate={handleNavigate}
            onOpenCalendar={() => setIsDailyProgressCalendarOpen(true)}
            onLogout={handleLogoutClick}
          />
        );
      case '/settings/workspace':
        return (
          <WorkspaceCustomizationView
            preferences={workspacePreferences}
            onUpdatePreferences={(newPrefs) => {
              setWorkspacePreferences(newPrefs);
              Storage.setWorkspacePreferences(newPrefs);
            }}
            onShowToast={handleShowToast}
            onNavigate={handleNavigate}
          />
        );
      case '/settings/import':
        return (
          <AIProfileImportView
            user={user}
            goals={goals}
            learningGoals={learningGoals}
            milestones={milestones}
            consumption={consumption}
            health={health}
            onNavigate={handleNavigate}
            onShowToast={handleShowToast}
            onRefreshData={() => {
              setUser(Storage.getUser());
              setGoals(Storage.getGoals());
              setLearningGoals(Storage.getLearningGoals());
              setMilestones(Storage.getMilestones());
              setConsumption(Storage.getConsumption());
              setHealth(Storage.getHealth());
            }}
          />
        );
      case '/more':
        return (
          <MoreMenuView
            onNavigate={handleNavigate}
            unreadReviewCount={unreadReviewCount}
            workspacePreferences={workspacePreferences}
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
            dailyBrief={initialDailyBrief}
            workspacePreferences={workspacePreferences}
            onCompleteWorkspaceSetup={() => {
              const updated = { ...workspacePreferences, hasCompletedWorkspaceSetup: true };
              setWorkspacePreferences(updated);
              Storage.setWorkspacePreferences(updated);
            }}
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
      workspacePreferences={workspacePreferences}
      onOpenCalendar={() => setIsDailyProgressCalendarOpen(true)}
      onLogout={handleLogoutClick}
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

      {/* Daily Progress & Distraction Calendar Modal (Profile Card Click) */}
      <DailyProgressCalendarModal
        isOpen={isDailyCalendarOpen}
        onClose={() => setIsDailyProgressCalendarOpen(false)}
        onViewFullDay={(date) => {
          handleNavigate('/track');
        }}
      />

      {/* Logout Confirmation Dialog (Synced TopBar Action) */}
      <LogoutConfirmModal
        isOpen={isLogoutConfirmOpen}
        onClose={() => setIsLogoutConfirmOpen(false)}
        onConfirm={handleConfirmLogout}
      />

      {/* Auth & Re-login Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={(authedUser) => {
          setUser(authedUser);
          handleShowToast(`Session active as ${authedUser.name}`, 'success');
        }}
        onShowToast={handleShowToast}
      />
    </AppShell>
  );
}
