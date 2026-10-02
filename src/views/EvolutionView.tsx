import React, { useState } from 'react';
import {
  Sparkles,
  Dna,
  ShieldCheck,
  TrendingUp,
  Clock,
  BookOpen,
  Target,
  BrainCircuit,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Lock,
  ChevronRight,
  Flame,
  Award,
  Layers,
  HelpCircle,
  RotateCw
} from 'lucide-react';
import { EvolutionState, EvolutionStageRecord, CharacterArchetype } from '../types';
import { generateEvolutionCharacterSvg } from '../lib/evolutionArt';

interface EvolutionViewProps {
  evolutionState: EvolutionState;
  onOpenWhyStageModal: () => void;
  onNavigate: (route: string) => void;
  onShowToast: (text: string, type?: 'success' | 'error' | 'info') => void;
}

const ALL_STAGES = [
  { stage: 1, name: 'Awakening', desc: 'Establishing initial tracking consistency and baseline routines' },
  { stage: 2, name: 'Discipline', desc: '21+ days continuous logging without drop-off; learning routines locked' },
  { stage: 3, name: 'Growth', desc: 'Decomposed milestone execution; heightened problem-solving clarity' },
  { stage: 4, name: 'Execution', desc: 'High milestone completion; zero time leaks; strict financial control' },
  { stage: 5, name: 'Mastery', desc: 'Apex alignment: all personal systems working consistently and calmly' }
];

export const EvolutionView: React.FC<EvolutionViewProps> = ({
  evolutionState,
  onOpenWhyStageModal,
  onNavigate,
  onShowToast
}) => {
  const [selectedRecordId, setSelectedRecordId] = useState<string>(
    evolutionState.history[evolutionState.history.length - 1]?.id || 'evo_stage_3'
  );
  const [isEvaluating, setIsEvaluating] = useState(false);

  const selectedRecord =
    evolutionState.history.find((r) => r.id === selectedRecordId) ||
    evolutionState.history[evolutionState.history.length - 1];

  const {
    currentStage,
    currentStageName,
    currentArchetype,
    progressToNextEvolution,
    currentProfile,
    currentEvidence,
    candidateEvaluation,
    characterImageUrl
  } = evolutionState;

  const handleRunEvaluation = () => {
    setIsEvaluating(true);
    setTimeout(() => {
      setIsEvaluating(false);
      onShowToast(
        'AI Evolution Review complete: Behavior improved in learning, but time management requires 14 more days of consistency.',
        'info'
      );
    }, 1200);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-semibold mb-2">
            <Dna className="w-3.5 h-3.5 text-amber-400" />
            <span>Evolution System & Behavioral Mirror</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-amber-100 font-outfit tracking-tight">
            Evolution Dossier & Timeline
          </h1>
          <p className="text-xs md:text-sm text-neutral-400 mt-1 max-w-xl">
            Your character is an objective visual representation of sustained habits and execution.
            The AI never upgrades a stage from a single good day.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenWhyStageModal}
            className="px-4 py-2.5 rounded-xl bg-[#1c1815] hover:bg-[#25201c] border border-amber-500/30 text-amber-300 text-xs font-bold flex items-center gap-2 transition cursor-pointer shadow-md"
          >
            <HelpCircle className="w-4 h-4 text-amber-400" />
            <span>Why am I at this stage?</span>
          </button>

          <button
            onClick={handleRunEvaluation}
            disabled={isEvaluating}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-neutral-950 text-xs font-extrabold flex items-center gap-2 transition active:scale-95 cursor-pointer shadow-lg shadow-amber-950/60"
          >
            <RotateCw className={`w-4 h-4 stroke-[2.5] ${isEvaluating ? 'animate-spin' : ''}`} />
            <span>{isEvaluating ? 'Analyzing...' : 'Run AI Evaluation'}</span>
          </button>
        </div>
      </div>

      {/* TOP HERO SPOTLIGHT: CURRENT CHARACTER & MULTI-DIMENSIONAL PROFILE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* CHARACTER ARTWORK CARD (5 cols) */}
        <div className="lg:col-span-5 rounded-3xl bg-[#1c1815] border border-amber-500/25 p-5 shadow-xl flex flex-col justify-between relative overflow-hidden group">
          <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-neutral-950 border border-amber-500/30 shadow-inner">
            <img
              src={characterImageUrl}
              alt={currentArchetype}
              className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
            />
            {/* Ambient Overlay gradient for legibility */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none" />

            <div className="absolute top-3 left-3 flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-amber-500 text-neutral-950 shadow-md">
                STAGE {currentStage}
              </span>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-neutral-900/80 backdrop-blur-md text-amber-300 border border-amber-500/30">
                {currentStageName}
              </span>
            </div>

            <div className="absolute bottom-3 left-3 right-3 text-left">
              <div className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">
                ACTIVE ARCHETYPE
              </div>
              <h2 className="text-xl font-black text-amber-100 font-outfit">
                THE {currentArchetype.toUpperCase()}
              </h2>
              <div className="text-xs text-neutral-300 mt-0.5 flex items-center justify-between">
                <span>Winter Arc Day 37</span>
                <span className="text-amber-400 font-bold">{progressToNextEvolution}% to Next Stage</span>
              </div>
            </div>
          </div>

          {/* PROGRESS BAR TO NEXT EVOLUTION */}
          <div className="pt-4 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-neutral-400 font-medium">Progression to Stage 4 (Execution)</span>
              <span className="text-amber-300 font-mono font-bold">{progressToNextEvolution}%</span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-neutral-900 border border-neutral-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.6)] transition-all duration-700"
                style={{ width: `${progressToNextEvolution}%` }}
              />
            </div>
            <p className="text-[11px] text-neutral-400 italic pt-1 text-center">
              Requires 14 additional days of bedtime adherence and disciplined time management.
            </p>
          </div>
        </div>

        {/* MULTI-DIMENSIONAL EVOLUTION PROFILE BARS (7 cols) */}
        <div className="lg:col-span-7 rounded-3xl bg-[#1c1815] border border-amber-500/25 p-5 sm:p-6 shadow-xl space-y-5 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-amber-500/15 pb-3">
            <div>
              <h3 className="text-base font-bold text-amber-100 font-outfit flex items-center gap-2">
                <BrainCircuit className="w-4 h-4 text-amber-400" />
                <span>Multi-Dimensional Evolution Profile</span>
              </h3>
              <p className="text-xs text-neutral-400">
                Deterministic evidence score derived across 9 behavioral dimensions.
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-black text-amber-300 font-outfit">
                {currentProfile.overallScore}
                <span className="text-xs text-neutral-400 font-normal"> / 100</span>
              </div>
              <div className="text-[10px] text-neutral-400">Composite Score</div>
            </div>
          </div>

          {/* 9 DIMENSIONS GRID */}
          <div className="space-y-3">
            {[
              { label: 'Discipline', val: currentProfile.discipline, color: 'from-amber-500 to-orange-500' },
              { label: 'Consistency', val: currentProfile.consistency, color: 'from-amber-400 to-amber-600' },
              { label: 'Learning Volume', val: currentProfile.learning, color: 'from-emerald-400 to-teal-500' },
              { label: 'Execution', val: currentProfile.execution, color: 'from-orange-500 to-red-500' },
              { label: 'Health & Recovery', val: currentProfile.health, color: 'from-rose-400 to-pink-500' },
              { label: 'Financial Control', val: currentProfile.financialControl, color: 'from-emerald-500 to-emerald-600' },
              { label: 'Time Management', val: currentProfile.timeManagement, color: 'from-blue-400 to-indigo-500' },
              { label: 'Cognitive Growth', val: currentProfile.cognitiveGrowth, color: 'from-purple-400 to-purple-600' },
              { label: 'Goal Progress', val: currentProfile.goalProgress, color: 'from-amber-400 to-emerald-500' }
            ].map((dim) => (
              <div key={dim.label} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-neutral-300 font-semibold">{dim.label}</span>
                  <span className="font-mono font-bold text-neutral-200">{dim.val}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-[#12100e] border border-neutral-800/80 overflow-hidden">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${dim.color} transition-all duration-500`}
                    style={{ width: `${dim.val}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* AI SUMMARY HIGHLIGHT */}
          <div className="p-3.5 rounded-2xl bg-[#14100e] border border-amber-500/20 text-xs flex items-start gap-3">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <p className="text-neutral-300 leading-relaxed">
              <strong className="text-amber-200">AI Observation: </strong>
              Strongest pillar is <strong className="text-emerald-300">Learning (81)</strong> and{' '}
              <strong className="text-purple-300">Cognitive Growth (77)</strong>. The primary barrier to
              unlocking Stage 4 is <strong className="text-rose-300">Health (59)</strong> and{' '}
              <strong className="text-blue-300">Time Management (64)</strong>.
            </p>
          </div>
        </div>
      </div>

      {/* EVOLUTION TIMELINE (CHRONOLOGICAL STAGES) */}
      <div className="rounded-3xl bg-[#1c1815] border border-amber-500/25 p-5 sm:p-6 shadow-xl space-y-6">
        <div>
          <h3 className="text-lg font-black text-amber-100 font-outfit flex items-center gap-2">
            <Calendar className="w-5 h-5 text-amber-400" />
            <span>Evolution Journey Timeline</span>
          </h3>
          <p className="text-xs text-neutral-400">
            Chronological stages unlocked through sustained evidence. Look back to see where you started.
          </p>
        </div>

        {/* TIMELINE HORIZONTAL NODES */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {ALL_STAGES.map((stg) => {
            const isUnlocked = stg.stage <= currentStage;
            const isCurrent = stg.stage === currentStage;
            const historyItem = evolutionState.history.find((h) => h.stage === stg.stage);

            return (
              <div
                key={stg.stage}
                onClick={() => {
                  if (historyItem) setSelectedRecordId(historyItem.id);
                }}
                className={`p-3.5 rounded-2xl border transition-all text-left relative ${
                  historyItem ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'
                } ${
                  isCurrent
                    ? 'bg-amber-500/15 border-amber-500 shadow-md shadow-amber-950/40 ring-1 ring-amber-400'
                    : isUnlocked
                    ? selectedRecordId === historyItem?.id
                      ? 'bg-[#25201c] border-amber-500/60'
                      : 'bg-[#14100e] border-neutral-800 hover:border-amber-500/30'
                    : 'bg-[#12100e]/50 border-neutral-900'
                }`}
              >
                <div className="flex items-center justify-between text-[11px] font-bold mb-1">
                  <span className={isUnlocked ? 'text-amber-400' : 'text-neutral-500'}>
                    STAGE {stg.stage}
                  </span>
                  {historyItem && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-neutral-800 text-neutral-300">
                      {historyItem.unlockedDate}
                    </span>
                  )}
                  {!isUnlocked && <Lock className="w-3.5 h-3.5 text-neutral-600" />}
                </div>

                <div className="font-extrabold text-xs text-neutral-200 truncate">
                  {stg.name}
                </div>
                <div className="text-[10px] text-neutral-400 mt-1 line-clamp-2">
                  {stg.desc}
                </div>

                {isCurrent && (
                  <div className="mt-2 text-[9px] font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Current Active</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* SELECTED STAGE DETAIL DOSSIER */}
        {selectedRecord && (
          <div className="p-5 rounded-2xl bg-[#14100e] border border-amber-500/20 space-y-4 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-500/15 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl overflow-hidden border border-amber-500/40 shrink-0 bg-neutral-950">
                  <img
                    src={selectedRecord.characterImageUrl}
                    alt={selectedRecord.archetype}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <div className="text-[10px] font-bold text-amber-400 tracking-wider uppercase">
                    STAGE {selectedRecord.stage} DOSSIER • UNLOCKED {selectedRecord.unlockedDate} (DAY {selectedRecord.unlockedDayIndex})
                  </div>
                  <h4 className="text-base font-extrabold text-amber-100 font-outfit">
                    The {selectedRecord.archetype} — "{selectedRecord.stageName}"
                  </h4>
                </div>
              </div>

              <div className="text-xs px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 font-semibold w-fit">
                Score: {selectedRecord.evolutionScore}/100
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1.5">
                <div className="font-bold text-neutral-300 uppercase tracking-wider text-[11px]">
                  Environment & Visual Aura
                </div>
                <p className="text-neutral-400 italic">
                  "{selectedRecord.environmentDescription}"
                </p>
                <div className="text-neutral-300 font-medium mt-1">
                  Pose: {selectedRecord.characterPose}
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="font-bold text-neutral-300 uppercase tracking-wider text-[11px]">
                  AI Unlocking Rationale
                </div>
                <p className="text-neutral-300 leading-relaxed">
                  "{selectedRecord.aiExplanation}"
                </p>
              </div>
            </div>

            {selectedRecord.userReflection && (
              <div className="p-3 rounded-xl bg-[#1c1815] border border-amber-500/15 text-xs space-y-1">
                <div className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                  Personal Reflection At Milestone
                </div>
                <p className="text-neutral-300 italic">
                  "{selectedRecord.userReflection}"
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* AI SUPERVISOR SAFEGUARD & CANDIDATE EVALUATION CARD */}
      <div className="rounded-3xl bg-[#1c1815] border border-amber-500/25 p-5 sm:p-6 shadow-xl space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-amber-100 font-outfit">
              AI Evolution Safeguards & Next Stage Criteria
            </h3>
            <p className="text-xs text-neutral-400">
              The AI Supervisor requires sustained multi-week evidence to prevent gamification.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#14100e] border border-neutral-800 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-amber-200">
              Candidate Target: Stage {candidateEvaluation.targetStage} ({candidateEvaluation.targetStageName})
            </span>
            <span className="px-2 py-0.5 rounded-md bg-neutral-800 text-neutral-300 text-[11px] font-mono">
              Observation Period: {candidateEvaluation.observationPeriodDays} Days
            </span>
          </div>

          <p className="text-xs text-neutral-300 leading-relaxed italic">
            "{candidateEvaluation.summaryExplanation}"
          </p>

          <div className="space-y-1.5 pt-2 border-t border-neutral-800/80">
            <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-2">
              Prerequisite Safeguard Criteria:
            </div>
            {candidateEvaluation.detailedCriteria.map((crit, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2 rounded-xl bg-[#1c1815] border border-neutral-800/80 text-xs"
              >
                <div className="flex items-center gap-2">
                  {crit.met ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                  )}
                  <span className="text-neutral-200">{crit.label}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[11px] text-neutral-400 font-mono">Target: {crit.target}</span>
                  <span
                    className={`font-mono font-bold text-[11px] ${
                      crit.met ? 'text-emerald-400' : 'text-amber-400'
                    }`}
                  >
                    Actual: {crit.actual}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
