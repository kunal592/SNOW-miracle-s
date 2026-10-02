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
  BrainCircuit,
  HelpCircle,
  Dna
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
  InboxEntry,
  DailyBrief,
  WorkspacePreferences,
  ModuleId,
  EvolutionState
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
  dailyBrief: DailyBrief;
  workspacePreferences?: WorkspacePreferences;
  onCompleteWorkspaceSetup?: () => void;
  evolutionState?: EvolutionState;
  onOpenWhyStage?: () => void;
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
  inbox,
  dailyBrief,
  workspacePreferences,
  onCompleteWorkspaceSetup,
  evolutionState,
  onOpenWhyStage
}) => {
  const enabledModules = workspacePreferences?.enabledModules;
  const isEnabled = (m: ModuleId) => !enabledModules || enabledModules.includes(m);
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

  // Cash spent today vs consumption cost
  const todayExpenses = expenses.filter((e) => e.date === todayStr);
  const cashSpentToday = todayExpenses.reduce((sum, e) => sum + e.amount, 0);
  const dailyConsumptionCost = calculateActiveDailyConsumptionCost(consumptionExpenses);

  const activeGoals = goals.slice(0, 4);
  const upcomingMilestones = milestones.filter((m) => m.status === 'Upcoming').slice(0, 3);
  const recentInbox = inbox.slice(0, 3);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* EVOLUTION CHARACTER HERO BANNER */}
      {user.characterVisibility !== 'hide' && evolutionState ? (
        <div className="relative overflow-hidden rounded-3xl p-6 bg-gradient-to-r from-[#181310] via-[#211a15] to-[#12100e] border border-amber-500/30 shadow-2xl shadow-black/80">
          {/* CHARACTER ARTWORK HERO BACKGROUND WITH GRADIENT OVERLAY */}
          <div className="absolute top-0 right-0 w-full sm:w-1/2 md:w-5/12 h-full opacity-35 sm:opacity-50 pointer-events-none overflow-hidden flex items-center justify-end">
            <img
              src={evolutionState.characterImageUrl}
              alt={evolutionState.currentArchetype}
              className="h-full w-auto object-cover object-center transform scale-110 sm:scale-125 filter contrast-125"
            />
            {/* Smooth gradient scrim overlay ensuring all text remains crisp and readable */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#181310] via-[#181310]/80 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#181310] via-transparent to-transparent" />
          </div>

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-3 max-w-xl">
              {/* TOP TAGS: WINTER ARC DAY & EVOLUTION STAGE */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/35 text-amber-300 text-xs font-bold shadow-sm">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>WINTER ARC • DAY {user.currentDayIndex}</span>
                </div>

                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#26201b]/90 border border-amber-500/25 text-amber-200 text-xs font-semibold">
                  <Dna className="w-3.5 h-3.5 text-amber-400" />
                  <span>THE {evolutionState.currentArchetype.toUpperCase()} • EVOLUTION {evolutionState.currentStage}</span>
                </div>
              </div>

              {/* WELCOME HEADLINE */}
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-amber-100 font-outfit tracking-tight">
                  Welcome back, {user.name}
                </h1>
                <p className="text-xs sm:text-sm text-neutral-300 mt-1 leading-relaxed">
                  "The character is a visual mirror of your actual behavior. Unlocked Stage {evolutionState.currentStage} ({evolutionState.currentStageName})."
                </p>
              </div>

              {/* NEXT EVOLUTION PROGRESS BAR */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-neutral-400 text-[11px] uppercase tracking-wider">
                    {evolutionState.progressToNextEvolution}% → NEXT EVOLUTION (Stage {evolutionState.currentStage + 1})
                  </span>
                  <span className="text-amber-400 font-mono text-xs">{evolutionState.progressToNextEvolution}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-neutral-950/80 border border-neutral-800/80 overflow-hidden max-w-md">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.6)] transition-all duration-700"
                    style={{ width: `${evolutionState.progressToNextEvolution}%` }}
                  />
                </div>
              </div>

              {/* TAP THE CHARACTER TRIGGER: WHY AM I AT THIS STAGE? */}
              <div className="pt-1 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={onOpenWhyStage}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/35 text-amber-300 text-xs font-bold transition cursor-pointer group"
                >
                  <HelpCircle className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
                  <span>Why am I at this stage?</span>
                  <ArrowRight className="w-3.5 h-3.5 text-amber-400 group-hover:translate-x-0.5 transition-transform" />
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate('/evolution')}
                  className="text-xs text-neutral-400 hover:text-amber-200 transition font-medium underline underline-offset-4"
                >
                  View Evolution Timeline →
                </button>
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex flex-col sm:flex-row lg:flex-col gap-3 self-start lg:self-center shrink-0">
              <button
                onClick={onOpenQuickAdd}
                className="px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-neutral-950 font-extrabold text-sm shadow-lg shadow-amber-950/60 flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer"
              >
                <Plus className="w-5 h-5 stroke-[3]" /> Fast Life Dump
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* CLEAN TEXT-ONLY WELCOME BANNER (when character visibility is 'hide') */
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
      )}

      {/* MAKE THIS YOUR OWN ONBOARDING BANNER */}
      {workspacePreferences && !workspacePreferences.hasCompletedWorkspaceSetup && (
        <div className="p-5 rounded-3xl bg-gradient-to-r from-amber-950 via-[#1c1815] to-orange-950 border border-amber-500/40 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-amber-500/20 text-amber-400 shrink-0">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base font-bold text-amber-100 font-outfit">MAKE THIS YOUR OWN</h2>
              <p className="text-xs text-neutral-300 mt-0.5">
                You currently have all modules enabled. Choose the areas you want in your personal workspace.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
            <button
              onClick={() => onNavigate('/settings/workspace')}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs shadow-lg shadow-amber-950/60 transition"
            >
              [ CUSTOMIZE NOW ]
            </button>
            <button
              onClick={() => onCompleteWorkspaceSetup && onCompleteWorkspaceSetup()}
              className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-neutral-300 font-bold text-xs border border-stone-700 transition"
            >
              [ DO THIS LATER ]
            </button>
          </div>
        </div>
      )}

      {/* AI DAILY BRIEF CARD */}
      {isEnabled('ai') && (
        <div className="p-5 rounded-3xl bg-[#1c1815] border border-amber-500/30 shadow-xl space-y-3">
          <div className="flex items-center justify-between border-b border-amber-500/15 pb-2.5">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
                <Sparkles className="w-4 h-4 animate-pulse" />
              </div>
              <h2 className="text-base font-bold text-amber-100 font-outfit">AI DAILY BRIEF</h2>
            </div>
            <button
              onClick={() => onNavigate('/ai')}
              className="text-xs text-amber-400 hover:underline flex items-center gap-1"
            >
              Ask AI Supervisor →
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-2xl bg-[#12100e] border border-amber-500/15 space-y-1">
              <span className="font-bold text-amber-400 uppercase text-[10px]">Today's Focus:</span>
              <p className="text-amber-100 font-semibold">{dailyBrief.todayFocus}</p>
            </div>

            <div className="p-3 rounded-2xl bg-[#12100e] border border-amber-500/15 space-y-1">
              <span className="font-bold text-orange-400 uppercase text-[10px]">Evidence / Why:</span>
              <p className="text-neutral-300">{dailyBrief.whyFocus}</p>
            </div>

            {isEnabled('cognitive') && (
              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col justify-between">
                <div>
                  <span className="font-bold text-amber-300 uppercase text-[10px] block mb-0.5">Cognitive Challenge:</span>
                  <p className="text-amber-100 font-bold font-outfit truncate">{dailyBrief.todayChallengeTitle}</p>
                </div>
                <button
                  onClick={() => onNavigate('/cognitive')}
                  className="mt-2 py-1.5 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-neutral-950 font-bold text-[11px] shadow flex items-center justify-center gap-1"
                >
                  Start Challenge <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TODAY SCORE & CORE OS METRIC CARDS */}
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
        {isEnabled('time') && (
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
        )}

        {/* MONEY CARD */}
        {isEnabled('finance') && (
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
        )}

        {/* BODY / HEALTH */}
        {isEnabled('health') && (
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
        )}

        {/* LEARNING */}
        {isEnabled('learning') && (
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
        )}
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
    </div>
  );
};
