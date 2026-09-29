import React from 'react';
import { Award, BrainCircuit, ShieldAlert, Sparkles, TrendingUp, CheckCircle2, AlertCircle } from 'lucide-react';
import { CognitiveProfile } from '../types';

interface CognitiveProfileViewProps {
  profile: CognitiveProfile;
  onNavigate: (route: string) => void;
}

export const CognitiveProfileView: React.FC<CognitiveProfileViewProps> = ({ profile, onNavigate }) => {
  const skillsList = [
    { name: 'Logical Reasoning', score: profile.trainingPerformanceIndex.Logical, level: profile.skillLevels.Logical, color: '#f59e0b' },
    { name: 'Analytical Thinking', score: profile.trainingPerformanceIndex.Analytical, level: profile.skillLevels.Analytical, color: '#ea580c' },
    { name: 'Critical Thinking', score: profile.trainingPerformanceIndex.Critical, level: profile.skillLevels.Critical, color: '#e11d48' },
    { name: 'Operational Thinking', score: profile.trainingPerformanceIndex.Operational, level: profile.skillLevels.Operational, color: '#10b981' },
    { name: 'Observational Thinking', score: profile.trainingPerformanceIndex.Observational, level: profile.skillLevels.Observational, color: '#06b6d4' },
    { name: 'Numerical Reasoning', score: profile.trainingPerformanceIndex.Numerical, level: profile.skillLevels.Numerical, color: '#3b82f6' },
    { name: 'Systems Thinking', score: profile.trainingPerformanceIndex['Systems Thinking'], level: profile.skillLevels['Systems Thinking'], color: '#8b5cf6' },
    { name: 'Problem Solving', score: profile.trainingPerformanceIndex['Problem Solving'], level: profile.skillLevels['Problem Solving'], color: '#d97706' }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-amber-100 font-outfit flex items-center gap-2">
          <Award className="w-6 h-6 text-amber-400" /> Cognitive Skill Profile
        </h1>
        <p className="text-xs text-amber-200/80">Track performance metrics across 8 cognitive thinking domains over time.</p>
      </div>

      {/* DISCLAIMER BANNER */}
      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3 text-xs text-amber-200">
        <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-amber-300 block mb-0.5">Training Performance Index (Internal Metric)</span>
          These scores represent systematic practice performance on structured cognitive challenges. They are internal skill-building indicators, not clinical IQ tests or psychological assessments.
        </div>
      </div>

      {/* SUMMARY METRIC CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-[#1c1815] border border-amber-500/20 space-y-1">
          <div className="text-xs text-neutral-400">Current Level</div>
          <div className="text-2xl font-black text-amber-100 font-outfit">Level {profile.level}</div>
          <div className="text-[10px] text-amber-400">Adaptive difficulty active</div>
        </div>

        <div className="p-4 rounded-2xl bg-[#1c1815] border border-amber-500/20 space-y-1">
          <div className="text-xs text-neutral-400">Training Streak</div>
          <div className="text-2xl font-black text-orange-200 font-outfit">{profile.streakDays} Days</div>
          <div className="text-[10px] text-emerald-400">Consistent daily practice</div>
        </div>

        <div className="p-4 rounded-2xl bg-[#1c1815] border border-amber-500/20 space-y-1">
          <div className="text-xs text-neutral-400">Independent Solves</div>
          <div className="text-2xl font-black text-emerald-200 font-outfit">
            {profile.independentSolves} <span className="text-xs font-normal text-neutral-400">/ {profile.totalSolved}</span>
          </div>
          <div className="text-[10px] text-emerald-400">No hints requested</div>
        </div>

        <div className="p-4 rounded-2xl bg-[#1c1815] border border-amber-500/20 space-y-1">
          <div className="text-xs text-neutral-400">Avg Reasoning Score</div>
          <div className="text-2xl font-black text-purple-200 font-outfit">{profile.averageReasoningScore} / 10</div>
          <div className="text-[10px] text-purple-400">Based on AI evaluation</div>
        </div>
      </div>

      {/* SKILL PROFILE PROGRESS BARS */}
      <div className="p-6 rounded-3xl bg-[#1c1815] border border-amber-500/20 shadow-md space-y-4">
        <h2 className="text-base font-bold text-amber-100 font-outfit flex items-center gap-2">
          <BrainCircuit className="w-5 h-5 text-amber-400" /> Skill Domain Performance Breakdown
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {skillsList.map((skill) => (
            <div key={skill.name} className="p-4 rounded-2xl bg-[#12100e] border border-amber-500/15 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-amber-100 font-outfit">{skill.name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 font-bold border border-amber-500/20">
                    Lvl {skill.level}
                  </span>
                  <span className="font-bold text-amber-400">{skill.score}/100</span>
                </div>
              </div>

              <div className="w-full bg-[#26201b] h-2.5 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${skill.score}%`, backgroundColor: skill.color }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
