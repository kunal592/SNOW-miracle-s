import React from 'react';
import { Award, BrainCircuit, Sparkles, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';
import { WeeklyReview } from '../types';

interface WeeklyThinkingReviewViewProps {
  weeklyReview: WeeklyReview;
  onNavigate: (route: string) => void;
}

export const WeeklyThinkingReviewView: React.FC<WeeklyThinkingReviewViewProps> = ({
  weeklyReview,
  onNavigate
}) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl font-black text-amber-100 font-outfit flex items-center gap-2">
          <BrainCircuit className="w-6 h-6 text-amber-400" /> Weekly Thinking Review
        </h1>
        <p className="text-xs text-amber-200/80">Weekly audit of reasoning patterns, hint reliance, and skill domain focus.</p>
      </div>

      <div className="p-6 rounded-3xl bg-[#1c1815] border border-amber-500/25 shadow-xl space-y-6">
        <div className="flex items-center justify-between border-b border-amber-500/20 pb-4">
          <div>
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              {weeklyReview.weekLabel}
            </span>
            <h2 className="text-xl font-bold text-amber-100 font-outfit mt-1">Weekly Cognition Summary</h2>
          </div>
          <div className="text-right">
            <div className="text-2xl font-black text-amber-300 font-outfit">{weeklyReview.averageReasoningScore}/10</div>
            <div className="text-[10px] text-neutral-400">Avg Reasoning Score</div>
          </div>
        </div>

        {/* METRICS ROW */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3.5 rounded-2xl bg-[#12100e] border border-amber-500/15">
            <span className="text-neutral-400 block text-[10px]">Challenges Completed</span>
            <span className="text-lg font-bold text-amber-100">{weeklyReview.challengesCompleted}</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#12100e] border border-amber-500/15">
            <span className="text-neutral-400 block text-[10px]">Independent Solves</span>
            <span className="text-lg font-bold text-emerald-300">{weeklyReview.independentSolves}</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#12100e] border border-amber-500/15">
            <span className="text-neutral-400 block text-[10px]">Strongest Skill</span>
            <span className="text-lg font-bold text-cyan-300">{weeklyReview.strongestSkill}</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#12100e] border border-amber-500/15">
            <span className="text-neutral-400 block text-[10px]">Weakest Focus Skill</span>
            <span className="text-lg font-bold text-rose-300">{weeklyReview.weakestSkill}</span>
          </div>
        </div>

        {/* WEEKLY PATTERN INSIGHT */}
        <div className="p-4 rounded-2xl bg-[#12100e] border border-amber-500/20 space-y-1.5 text-xs text-amber-200">
          <span className="font-bold text-amber-400 block uppercase text-[10px]">Identified Thinking Pattern:</span>
          <p className="leading-relaxed font-sans">{weeklyReview.weeklyPattern}</p>
        </div>

        {/* SUGGESTED CHALLENGE MIX FOR NEXT WEEK */}
        <div className="space-y-3 pt-2 border-t border-amber-500/15">
          <h3 className="text-xs font-bold text-amber-100 uppercase tracking-wider">
            Suggested Challenge Mix for Next Week (Focus: {weeklyReview.suggestedFocusNextWeek})
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            {weeklyReview.suggestedChallengeMix.map((mix) => (
              <div key={mix.category} className="p-3 rounded-xl bg-[#12100e] border border-amber-500/15 flex items-center justify-between">
                <span className="text-neutral-300 font-semibold">{mix.category}</span>
                <span className="font-bold text-amber-400">{mix.percent}%</span>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={() => onNavigate('/cognitive')}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-neutral-950 font-bold text-xs shadow-lg flex items-center justify-center gap-2"
        >
          Start Next Cognitive Challenge <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
