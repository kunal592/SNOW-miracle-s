import React from 'react';
import {
  Sparkles,
  Flame,
  Clock,
  DollarSign,
  Activity,
  BookOpen,
  Target,
  Calendar,
  Plus,
  ArrowRight,
  TrendingUp,
  CheckCircle2,
  ChevronRight,
  Zap,
  Coffee,
  BrainCircuit
} from 'lucide-react';
import {
  User,
  TimeEntry,
  Expense,
  ConsumptionExpense,
  HealthEntry,
  LearningSession,
  Goal,
  Milestone,
  InboxEntry
} from '../types';
import { formatCurrency, formatMinutes, calculateActiveDailyConsumptionCost } from '../lib/calculations';

interface HomeViewProps {
  user: User;
  onNavigate: (route: string) => void;
  onOpenQuickAdd: () => void;
  timeEntries: TimeEntry[];
  expenses: Expense[];
  consumptionExpenses: ConsumptionExpense[];
  healthEntries: HealthEntry[];
  learningSessions: LearningSession[];
  goals: Goal[];
  milestones: Milestone[];
  inbox: InboxEntry[];
}

export const HomeView: React.FC<HomeViewProps> = ({
  user,
  onNavigate,
  onOpenQuickAdd,
  timeEntries,
  expenses,
  consumptionExpenses,
  healthEntries,
  learningSessions,
  goals,
  milestones,
  inbox
}) => {
  const todayStr = '2026-09-29';
  const todayHealth = healthEntries.find((h) => h.date === todayStr) || healthEntries[0];

  // Daily totals
  const todayTime = timeEntries.filter((t) => t.date === todayStr);
  const deepWorkMins = todayTime
    .filter((t) => t.isDeepWork || t.category === 'Work')
    .reduce((sum, t) => sum + t.durationMinutes, 0);
  const learningMins = todayTime
    .filter((t) => t.category === 'Learning')
    .reduce((sum, t) => sum + t.durationMinutes, 0);
  const workMins = todayTime
    .filter((t) => t.category === 'Work')
    .reduce((sum, t) => sum + t.durationMinutes, 0);

  // Cash spent today vs consumption cost
  const todayExpenses = expenses.filter((e) => e.date === todayStr);
  const cashSpentToday = todayExpenses.reduce((sum, e) => sum + e.amount, 0);
  const dailyConsumptionCost = calculateActiveDailyConsumptionCost(consumptionExpenses);

  const activeGoals = goals.slice(0, 4);
  const upcomingMilestones = milestones.filter((m) => m.status === 'Upcoming').slice(0, 3);
  const recentInbox = inbox.slice(0, 3);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl p-6 bg-gradient-to-br from-[#26201b] via-[#1c1815] to-[#12100e] border border-amber-500/25 shadow-xl shadow-amber-950/40">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Flame className="w-48 h-48 text-amber-500" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Day {user.currentDayIndex} of your Winter Arc</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-amber-100 font-outfit tracking-tight">
              Welcome back, {user.name}
            </h1>
            <p className="text-xs md:text-sm text-neutral-400 mt-1 max-w-lg">
              "The miracles winter holds with it — dump what happens, let your OS organize and analyze."
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onOpenQuickAdd}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-neutral-950 font-extrabold text-sm shadow-lg shadow-amber-950/60 flex items-center gap-2 transition active:scale-95"
            >
              <Plus className="w-5 h-5 stroke-[3]" /> Fast Life Dump
            </button>
          </div>
        </div>
      </div>

      {/* TODAY SCORE & 4 CORE OS METRIC CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {/* DAY SCORE */}
        <div className="col-span-2 md:col-span-1 p-4 rounded-2xl bg-[#1c1815] border border-amber-500/20 shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span className="font-semibold uppercase tracking-wider">Day Score</span>
            <Flame className="w-4 h-4 text-orange-500" />
          </div>
          <div className="my-2">
            <div className="text-3xl font-black text-amber-100 font-outfit">78<span className="text-sm font-normal text-neutral-500">/100</span></div>
            <div className="w-full bg-[#12100e] h-2 rounded-full mt-2 overflow-hidden border border-amber-500/20">
              <div className="bg-gradient-to-r from-amber-500 to-orange-500 h-full w-[78%]" />
            </div>
          </div>
          <div className="text-[10px] text-amber-400 font-medium">High Focus Day</div>
        </div>

        {/* TIME CARD */}
        <div className="p-3.5 rounded-2xl bg-[#1c1815] border border-amber-500/20 shadow-md space-y-2">
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span className="font-semibold uppercase tracking-wider flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-amber-400" /> Time
            </span>
          </div>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-neutral-400">Deep Work</span>
              <span className="font-bold text-amber-200">{formatMinutes(deepWorkMins)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-400">Learning</span>
              <span className="font-bold text-emerald-300">{formatMinutes(learningMins)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-400">Screen Time</span>
              <span className="font-bold text-rose-300">1h 42m</span>
            </div>
          </div>
        </div>

        {/* MONEY CARD */}
        <div className="p-3.5 rounded-2xl bg-[#1c1815] border border-amber-500/20 shadow-md space-y-2">
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span className="font-semibold uppercase tracking-wider flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5 text-emerald-400" /> Money
            </span>
          </div>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-neutral-400">Cash Spent</span>
              <span className="font-bold text-amber-100">{formatCurrency(cashSpentToday)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-400">Consumption</span>
              <span className="font-bold text-orange-300">{formatCurrency(dailyConsumptionCost)}/d</span>
            </div>
          </div>
        </div>

        {/* BODY / HEALTH */}
        <div className="p-3.5 rounded-2xl bg-[#1c1815] border border-amber-500/20 shadow-md space-y-2">
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span className="font-semibold uppercase tracking-wider flex items-center gap-1">
              <Activity className="w-3.5 h-3.5 text-cyan-400" /> Body
            </span>
          </div>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-neutral-400">Sleep</span>
              <span className="font-bold text-cyan-200">{todayHealth.sleepHours}h</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-400">Water</span>
              <span className="font-bold text-cyan-300">{todayHealth.waterLiters}L</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-400">Workout</span>
              <span className="font-bold text-emerald-400">✓ Completed</span>
            </div>
          </div>
        </div>

        {/* LEARNING */}
        <div className="p-3.5 rounded-2xl bg-[#1c1815] border border-amber-500/20 shadow-md space-y-2">
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span className="font-semibold uppercase tracking-wider flex items-center gap-1">
              <BrainCircuit className="w-3.5 h-3.5 text-purple-400" /> Learning
            </span>
          </div>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-neutral-400">AI Engineering</span>
              <span className="font-bold text-purple-200">1h 30m</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-400">Python</span>
              <span className="font-bold text-purple-300">40m</span>
            </div>
          </div>
        </div>
      </div>

      {/* TWO COLUMN GRID: ACTIVE GOALS & UPCOMING MILESTONES */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* ACTIVE GOALS */}
        <div className="p-5 rounded-3xl bg-[#1c1815] border border-amber-500/20 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-amber-400" />
              <h2 className="text-base font-bold text-amber-100 font-outfit">Active Goals</h2>
            </div>
            <button
              onClick={() => onNavigate('/goals')}
              className="text-xs text-amber-400 hover:underline flex items-center gap-1"
            >
              View all <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {activeGoals.map((goal) => (
              <div
                key={goal.id}
                onClick={() => onNavigate('/goals')}
                className="p-3.5 rounded-2xl bg-[#12100e] border border-amber-500/15 hover:border-amber-500/40 cursor-pointer transition"
              >
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-bold text-amber-100">{goal.title}</span>
                  <span className="font-bold text-amber-400">{goal.progressPercent}%</span>
                </div>
                <div className="w-full bg-[#26201b] h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-amber-500 to-orange-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${goal.progressPercent}%` }}
                  />
                </div>
                <div className="mt-2 text-[10px] text-neutral-400 flex items-center justify-between">
                  <span>Target: {goal.targetDate}</span>
                  <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 font-semibold">{goal.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* UPCOMING MILESTONES */}
        <div className="p-5 rounded-3xl bg-[#1c1815] border border-amber-500/20 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-orange-400" />
              <h2 className="text-base font-bold text-amber-100 font-outfit">Upcoming Milestones</h2>
            </div>
            <button
              onClick={() => onNavigate('/milestones')}
              className="text-xs text-amber-400 hover:underline flex items-center gap-1"
            >
              View all <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {upcomingMilestones.map((ms) => (
              <div
                key={ms.id}
                onClick={() => onNavigate('/milestones')}
                className="p-3.5 rounded-2xl bg-[#12100e] border border-amber-500/15 hover:border-amber-500/40 cursor-pointer transition flex items-center justify-between"
              >
                <div>
                  <div className="text-xs font-bold text-amber-100">{ms.title}</div>
                  <div className="text-[11px] text-neutral-400 mt-0.5">{ms.description}</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-xs font-bold text-orange-400">{ms.date}</div>
                  <div className="text-[10px] text-neutral-500 uppercase">{ms.type}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RECENT INBOX & QUICK ACTIONS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* RECENT INBOX */}
        <div className="md:col-span-2 p-5 rounded-3xl bg-[#1c1815] border border-amber-500/20 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-amber-100 font-outfit flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" /> Recent Universal Inbox Entries
            </h2>
            <button
              onClick={() => onNavigate('/inbox')}
              className="text-xs text-amber-400 hover:underline"
            >
              Go to Inbox →
            </button>
          </div>

          <div className="space-y-2">
            {recentInbox.map((item) => (
              <div
                key={item.id}
                onClick={() => onNavigate('/inbox')}
                className="p-3 rounded-2xl bg-[#12100e] border border-amber-500/15 flex items-center justify-between text-xs cursor-pointer hover:border-amber-500/40 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-amber-400" />
                  <span className="text-amber-100 font-medium">{item.rawText}</span>
                </div>
                <div className="flex items-center gap-2">
                  {item.aiExtraction && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-500/15 text-amber-300 font-semibold border border-amber-500/30">
                      {item.aiExtraction.extractedCategory}
                    </span>
                  )}
                  <span className="text-[10px] text-neutral-500">Approved</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* QUICK ACTIONS PANEL */}
        <div className="p-5 rounded-3xl bg-[#1c1815] border border-amber-500/20 space-y-3">
          <h2 className="text-base font-bold text-amber-100 font-outfit">Quick Life Actions</h2>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={onOpenQuickAdd}
              className="p-3 rounded-2xl bg-[#12100e] border border-amber-500/20 hover:border-amber-500/50 text-amber-200 text-left transition font-medium flex flex-col justify-between"
            >
              <DollarSign className="w-4 h-4 text-emerald-400 mb-1" />
              <span>+ Add Expense</span>
            </button>
            <button
              onClick={onOpenQuickAdd}
              className="p-3 rounded-2xl bg-[#12100e] border border-amber-500/20 hover:border-amber-500/50 text-amber-200 text-left transition font-medium flex flex-col justify-between"
            >
              <Clock className="w-4 h-4 text-amber-400 mb-1" />
              <span>+ Log Time</span>
            </button>
            <button
              onClick={() => onNavigate('/finance/consumption')}
              className="p-3 rounded-2xl bg-[#12100e] border border-amber-500/20 hover:border-amber-500/50 text-amber-200 text-left transition font-medium flex flex-col justify-between"
            >
              <Sparkles className="w-4 h-4 text-orange-400 mb-1" />
              <span>+ Consumption</span>
            </button>
            <button
              onClick={() => onNavigate('/journal')}
              className="p-3 rounded-2xl bg-[#12100e] border border-amber-500/20 hover:border-amber-500/50 text-amber-200 text-left transition font-medium flex flex-col justify-between"
            >
              <BookOpen className="w-4 h-4 text-purple-400 mb-1" />
              <span>+ Write Journal</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
