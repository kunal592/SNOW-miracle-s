import React, { useState } from 'react';
import { BookOpen, Plus, Award, Target, CheckCircle2, Sparkles, Folder } from 'lucide-react';
import { LearningSession, LearningGoal } from '../types';
import { formatMinutes } from '../lib/calculations';

interface LearningDashboardViewProps {
  learningSessions: LearningSession[];
  learningGoals: LearningGoal[];
  onAddLearningSession: (session: LearningSession) => void;
}

export const LearningDashboardView: React.FC<LearningDashboardViewProps> = ({
  learningSessions,
  learningGoals,
  onAddLearningSession
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [topic, setTopic] = useState('');
  const [minutes, setMinutes] = useState('90');
  const [projectName, setProjectName] = useState('AI Project #1');
  const [notes, setNotes] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic || !minutes) return;

    const newSession: LearningSession = {
      id: 'ls_' + Math.random().toString(36).substring(2, 9),
      date: new Date().toISOString().split('T')[0],
      topic,
      durationMinutes: parseInt(minutes, 10),
      projectName,
      notes
    };

    onAddLearningSession(newSession);
    setTopic('');
    setNotes('');
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-amber-100 font-outfit flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-emerald-400" /> Learning & Mastery
          </h1>
          <p className="text-xs text-amber-200/80">Track targeted skill acquisition, reading hours, and project milestones.</p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-neutral-950 font-bold text-xs shadow-lg shadow-amber-950/60 flex items-center gap-2 transition active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[3]" /> Log Learning Session
        </button>
      </div>

      {/* WEEKLY LEARNING SUMMARY CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-[#1c1815] border border-amber-500/20 space-y-1">
          <div className="text-xs text-neutral-400">Total This Week</div>
          <div className="text-2xl font-black text-emerald-300 font-outfit">12h 30m</div>
          <div className="text-[10px] text-emerald-400">On track with weekly target</div>
        </div>

        <div className="p-4 rounded-2xl bg-[#1c1815] border border-amber-500/20 space-y-1">
          <div className="text-xs text-neutral-400">AI Engineering</div>
          <div className="text-2xl font-black text-amber-200 font-outfit">6h 20m</div>
          <div className="text-[10px] text-amber-400">PyTorch & RAG pipelines</div>
        </div>

        <div className="p-4 rounded-2xl bg-[#1c1815] border border-amber-500/20 space-y-1">
          <div className="text-xs text-neutral-400">Python 50H</div>
          <div className="text-2xl font-black text-purple-300 font-outfit">3h 10m</div>
          <div className="text-[10px] text-purple-400">Asyncio & Data Science</div>
        </div>

        <div className="p-4 rounded-2xl bg-[#1c1815] border border-amber-500/20 space-y-1">
          <div className="text-xs text-neutral-400">DevOps</div>
          <div className="text-2xl font-black text-cyan-200 font-outfit">2h 00m</div>
          <div className="text-[10px] text-cyan-400">Docker & PWA Caching</div>
        </div>
      </div>

      {/* LEARNING GOALS PROGRESS CARDS */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-amber-100 font-outfit flex items-center gap-2">
          <Target className="w-5 h-5 text-amber-400" /> Targeted Skill Goals
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {learningGoals.map((lg) => (
            <div key={lg.id} className="p-5 rounded-2xl bg-[#1c1815] border border-amber-500/20 shadow-md space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-amber-100 text-sm font-outfit">{lg.title}</h3>
                <span className="text-xs font-bold text-emerald-400">{lg.progressPercent}%</span>
              </div>

              <div className="w-full bg-[#12100e] h-2.5 rounded-full overflow-hidden border border-amber-500/20">
                <div
                  className="bg-gradient-to-r from-emerald-500 to-amber-500 h-full rounded-full"
                  style={{ width: `${lg.progressPercent}%` }}
                />
              </div>

              <div className="text-xs text-neutral-400 flex justify-between">
                <span>Completed: {lg.completedHours}h</span>
                <span>Target: {lg.targetHours}h</span>
              </div>

              <div className="pt-2 border-t border-amber-500/15 space-y-1 text-xs">
                <div className="text-[10px] text-neutral-500 font-bold uppercase">Associated Projects:</div>
                {lg.associatedProjects.map((p) => (
                  <div key={p.id} className="flex justify-between items-center text-[11px] text-amber-200/90">
                    <span className="flex items-center gap-1"><Folder className="w-3 h-3 text-amber-400" /> {p.name}</span>
                    <span className="font-bold text-amber-400">{p.progressPercent}%</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FORM MODAL */}
      {isModalOpen && (
        <div className="p-5 rounded-3xl bg-[#1c1815] border border-amber-500/30 shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-amber-500/20 pb-3">
            <h2 className="text-base font-bold text-amber-100 font-outfit">Log Learning Session</h2>
            <button onClick={() => setIsModalOpen(false)} className="text-xs text-neutral-400">Cancel</button>
          </div>

          <form onSubmit={handleCreate} className="space-y-4 text-xs">
            <div>
              <label className="block text-neutral-300 mb-1">Topic / Subject</label>
              <input
                type="text"
                placeholder="e.g. PyTorch LoRA Fine-tuning, RAG Architecture"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full bg-[#12100e] border border-amber-500/30 rounded-xl p-3 text-amber-100"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-neutral-300 mb-1">Duration (Minutes)</label>
                <input
                  type="number"
                  placeholder="90"
                  value={minutes}
                  onChange={(e) => setMinutes(e.target.value)}
                  className="w-full bg-[#12100e] border border-amber-500/30 rounded-xl p-2.5 text-amber-100"
                />
              </div>

              <div>
                <label className="block text-neutral-300 mb-1">Project Name</label>
                <input
                  type="text"
                  placeholder="AI Project #1"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="w-full bg-[#12100e] border border-amber-500/30 rounded-xl p-2.5 text-amber-100"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-neutral-950 font-bold text-xs shadow-lg flex items-center justify-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" /> Save Learning Session
            </button>
          </form>
        </div>
      )}

      {/* SESSIONS LOG */}
      <div className="space-y-3">
        <h2 className="text-base font-bold text-amber-100 font-outfit">Recent Learning Sessions</h2>
        <div className="space-y-2">
          {learningSessions.map((ls) => (
            <div key={ls.id} className="p-3.5 rounded-2xl bg-[#1c1815] border border-amber-500/15 flex items-center justify-between text-xs">
              <div>
                <div className="font-bold text-amber-100">{ls.topic}</div>
                <div className="text-[10px] text-neutral-400">{ls.projectName} • {ls.date}</div>
              </div>
              <div className="font-bold text-emerald-300 font-mono">
                {formatMinutes(ls.durationMinutes)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
