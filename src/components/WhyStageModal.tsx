import React from 'react';
import {
  X,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Clock,
  BookOpen,
  ArrowRight,
  ShieldAlert,
  BrainCircuit,
  Target
} from 'lucide-react';
import { EvolutionState } from '../types';

interface WhyStageModalProps {
  isOpen: boolean;
  onClose: () => void;
  evolutionState: EvolutionState;
  onViewEvolutionTimeline?: () => void;
}

export const WhyStageModal: React.FC<WhyStageModalProps> = ({
  isOpen,
  onClose,
  evolutionState,
  onViewEvolutionTimeline
}) => {
  if (!isOpen) return null;

  const {
    currentStage,
    currentStageName,
    currentArchetype,
    progressToNextEvolution,
    currentProfile,
    currentEvidence,
    characterImageUrl,
    candidateEvaluation
  } = evolutionState;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[92vh] flex flex-col bg-[#16120f] border border-amber-500/30 rounded-3xl shadow-2xl shadow-black/90 overflow-hidden">
        {/* HEADER */}
        <div className="px-6 py-4 border-b border-amber-500/20 bg-[#1a1512] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-br from-amber-500 via-orange-600 to-amber-700 text-neutral-950 font-black shadow-lg shadow-amber-950/50">
              <Sparkles className="w-5 h-5 text-neutral-950 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-black text-amber-100 font-outfit">
                Why am I at this stage?
              </h2>
              <p className="text-xs text-neutral-400">
                AI Supervisor Evidence Dossier • Objective behavioral observation
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-neutral-900/60 hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200 border border-neutral-700/50 transition cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 custom-scrollbar">
          {/* CHARACTER & CURRENT STAGE BANNER */}
          <div className="relative overflow-hidden rounded-2xl border border-amber-500/25 bg-gradient-to-r from-[#1c1815] via-[#241c16] to-[#1a1512] p-4 flex flex-col sm:flex-row items-center gap-4">
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border border-amber-500/40 shrink-0 bg-neutral-950">
              <img
                src={characterImageUrl}
                alt={currentArchetype}
                className="w-full h-full object-cover"
              />
              <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded-md text-[9px] font-black bg-amber-500 text-neutral-950">
                STG {currentStage}
              </span>
            </div>

            <div className="flex-1 text-center sm:text-left space-y-1">
              <div className="text-[10px] font-bold tracking-wider text-amber-400/90 uppercase">
                CURRENT ARCHETYPE & EVOLUTION
              </div>
              <h3 className="text-xl font-black text-amber-100 font-outfit tracking-wide">
                THE {currentArchetype.toUpperCase()} • EVOLUTION {currentStage}
              </h3>
              <p className="text-xs text-neutral-300 italic">
                "{currentStageName}" — Based on sustained patterns over the last 30 days.
              </p>

              {/* Progress to next evolution */}
              <div className="pt-2">
                <div className="flex items-center justify-between text-xs font-semibold mb-1">
                  <span className="text-neutral-400 text-[11px]">Progression to Stage {currentStage + 1}</span>
                  <span className="text-amber-400 font-mono text-xs">{progressToNextEvolution}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-neutral-900 border border-neutral-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500 shadow-[0_0_8px_rgba(245,158,11,0.5)] transition-all duration-500"
                    style={{ width: `${progressToNextEvolution}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* OBJECTIVE EVIDENCE CHECKLIST */}
          <div className="space-y-2.5">
            <div className="text-xs font-bold text-amber-200 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>30-Day Observational Evidence</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="p-3 rounded-xl bg-[#1c1815] border border-neutral-800/80 flex items-start gap-2.5">
                <div className="p-1 rounded-md bg-emerald-500/20 text-emerald-400 shrink-0 mt-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="font-bold text-neutral-200">
                    {currentEvidence.trackingConsistencyPct}% Tracking Consistency
                  </div>
                  <div className="text-[11px] text-neutral-400 mt-0.5">
                    Uninterrupted logs across time, learning, nutrition & finances
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#1c1815] border border-neutral-800/80 flex items-start gap-2.5">
                <div className="p-1 rounded-md bg-emerald-500/20 text-emerald-400 shrink-0 mt-0.5">
                  <BookOpen className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="font-bold text-amber-300">
                    {currentEvidence.learningHours}h Dedicated Learning
                  </div>
                  <div className="text-[11px] text-neutral-400 mt-0.5">
                    High focus volume logged in PyTorch, Go & system design
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#1c1815] border border-neutral-800/80 flex items-start gap-2.5">
                <div className="p-1 rounded-md bg-emerald-500/20 text-emerald-400 shrink-0 mt-0.5">
                  <Target className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="font-bold text-emerald-300">
                    {currentEvidence.milestoneCompletionPct}% Milestone Completion
                  </div>
                  <div className="text-[11px] text-neutral-400 mt-0.5">
                    Decomposed objectives reached on scheduled arc pace
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#1c1815] border border-neutral-800/80 flex items-start gap-2.5">
                <div className="p-1 rounded-md bg-emerald-500/20 text-emerald-400 shrink-0 mt-0.5">
                  <BrainCircuit className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="font-bold text-purple-300">
                    {currentEvidence.cognitivePerformanceScore}% Cognitive Performance
                  </div>
                  <div className="text-[11px] text-neutral-400 mt-0.5">
                    Average reasoning & analytical score in Cognitive Lab
                  </div>
                </div>
              </div>
            </div>

            {/* FRICTION & SETBACK OBSERVATIONS */}
            <div className="space-y-1.5 pt-1">
              <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/25 text-xs flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-amber-200">
                    ⚠ Inconsistent sleep recovery: {currentEvidence.sleepConsistency}
                  </div>
                  <div className="text-[11px] text-neutral-400 mt-0.5">
                    Late sleep times fragmented morning deep-work readiness.
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-rose-950/20 border border-rose-500/25 text-xs flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-rose-200">
                    ⚠ Financial friction: {currentEvidence.financialAdherence}
                  </div>
                  <div className="text-[11px] text-neutral-400 mt-0.5">
                    Unplanned impulse expenses exceeded monthly target ceiling.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* AI SUPERVISOR DIAGNOSIS */}
          <div className="p-4 rounded-2xl bg-[#1c1815] border border-amber-500/20 space-y-2">
            <div className="text-[11px] font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
              <span>AI Supervisor Evaluation Breakdown</span>
            </div>

            <div className="text-xs text-neutral-300 space-y-1.5 leading-relaxed">
              <p>
                <strong className="text-amber-200">Strongest Area:</strong>{' '}
                {currentEvidence.strongestArea}.
              </p>
              <p>
                <strong className="text-rose-300">Biggest Inconsistency:</strong>{' '}
                {currentEvidence.biggestInconsistency}.
              </p>
              <p className="pt-1 text-neutral-400 italic">
                "{currentEvidence.nextEvolutionCriteria}"
              </p>
            </div>
          </div>

          {/* EVOLUTION SAFEGUARD PRINCIPLE */}
          <div className="p-3.5 rounded-2xl bg-[#14100e] border border-neutral-800 text-xs text-neutral-400 flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-neutral-200">Evolution Safeguard: </span>
              The AI never changes your character because of a single good day. Evolution requires
              sustained behavioral stability over an observation period of 28+ days.
            </div>
          </div>
        </div>

        {/* FOOTER ACTIONS */}
        <div className="p-4 bg-[#1a1512] border-t border-amber-500/20 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-semibold text-xs transition cursor-pointer"
          >
            Close
          </button>

          {onViewEvolutionTimeline && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onViewEvolutionTimeline();
              }}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-600 to-amber-600 hover:brightness-110 text-neutral-950 font-bold text-xs shadow-lg shadow-amber-950/60 flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <span>View Full Evolution Timeline & Dossier</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
