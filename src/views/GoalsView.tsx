import React, { useState } from 'react';
import { Target, Plus, CheckCircle2, ChevronRight, Layers, ArrowUpRight } from 'lucide-react';
import { Goal, GoalStatus } from '../types';

interface GoalsViewProps {
  goals: Goal[];
  onAddGoal: (goal: Goal) => void;
}

export const GoalsView: React.FC<GoalsViewProps> = ({ goals, onAddGoal }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<Goal['category']>('Career');
  const [targetDate, setTargetDate] = useState('2026-12-31');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    const newGoal: Goal = {
      id: 'g_' + Math.random().toString(36).substring(2, 9),
      title,
      description,
      category,
      startDate: new Date().toISOString().split('T')[0],
      targetDate,
      progressPercent: 0,
      status: 'In Progress',
      metrics: [
        { label: 'Milestone Tasks', current: 0, target: 10, unit: 'Tasks' }
      ]
    };

    onAddGoal(newGoal);
    setTitle('');
    setDescription('');
    setIsModalOpen(false);
  };

  // Build hierarchy tree: root goals vs child goals
  const rootGoals = goals.filter((g) => !g.parentGoalId);
  const getChildGoals = (parentId: string) => goals.filter((g) => g.parentGoalId === parentId);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-amber-100 font-outfit flex items-center gap-2">
            <Target className="w-6 h-6 text-amber-400" /> Winter Arc Goal Hierarchy
          </h1>
          <p className="text-xs text-amber-200/80">Structured macro-goals decomposed into measurable milestones and daily actions.</p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-neutral-950 font-bold text-xs shadow-lg flex items-center gap-2 transition active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[3]" /> Create New Goal
        </button>
      </div>

      {/* FORM MODAL */}
      {isModalOpen && (
        <div className="p-5 rounded-3xl bg-[#1c1815] border border-amber-500/30 shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-amber-500/20 pb-3">
            <h2 className="text-base font-bold text-amber-100 font-outfit">Create New Goal</h2>
            <button onClick={() => setIsModalOpen(false)} className="text-xs text-neutral-400">Cancel</button>
          </div>

          <form onSubmit={handleCreate} className="space-y-4 text-xs">
            <div>
              <label className="block text-neutral-300 mb-1">Goal Title</label>
              <input
                type="text"
                placeholder="e.g. Master PyTorch Fine-tuning"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-[#12100e] border border-amber-500/30 rounded-xl p-3 text-amber-100"
              />
            </div>

            <div>
              <label className="block text-neutral-300 mb-1">Description</label>
              <textarea
                placeholder="Why is this goal critical for your Winter Arc?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="w-full bg-[#12100e] border border-amber-500/30 rounded-xl p-3 text-amber-100 resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-neutral-300 mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full bg-[#12100e] border border-amber-500/30 rounded-xl p-2.5 text-amber-100"
                >
                  <option value="Career">Career</option>
                  <option value="Finance">Finance</option>
                  <option value="Health">Health</option>
                  <option value="Mindset">Mindset</option>
                  <option value="Skills">Skills</option>
                </select>
              </div>

              <div>
                <label className="block text-neutral-300 mb-1">Target Date</label>
                <input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="w-full bg-[#12100e] border border-amber-500/30 rounded-xl p-2.5 text-amber-100"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-neutral-950 font-bold text-xs shadow-lg flex items-center justify-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" /> Save Goal
            </button>
          </form>
        </div>
      )}

      {/* GOALS HIERARCHY TREE */}
      <div className="space-y-4">
        {rootGoals.map((root) => {
          const children = getChildGoals(root.id);

          return (
            <div key={root.id} className="p-5 rounded-3xl bg-[#1c1815] border border-amber-500/25 shadow-xl space-y-4">
              {/* ROOT GOAL HEADER */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-500/15 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase">
                      {root.category}
                    </span>
                    <span className="text-xs text-neutral-400">Target: {root.targetDate}</span>
                  </div>
                  <h2 className="text-lg font-bold text-amber-100 font-outfit mt-1">{root.title}</h2>
                  <p className="text-xs text-neutral-400 mt-0.5">{root.description}</p>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-2xl font-black text-amber-300 font-outfit">{root.progressPercent}%</div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                    {root.status}
                  </span>
                </div>
              </div>

              {/* PROGRESS BAR */}
              <div className="w-full bg-[#12100e] h-2.5 rounded-full overflow-hidden border border-amber-500/20">
                <div
                  className="bg-gradient-to-r from-amber-500 to-orange-500 h-full rounded-full"
                  style={{ width: `${root.progressPercent}%` }}
                />
              </div>

              {/* SUB-GOALS DECOMPOSITION */}
              {children.length > 0 && (
                <div className="space-y-3 pt-2 pl-4 border-l-2 border-amber-500/20">
                  <div className="text-xs font-bold text-amber-400 flex items-center gap-1.5 uppercase tracking-wider">
                    <Layers className="w-3.5 h-3.5" /> Sub-Goals & Pillars
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {children.map((child) => {
                      const grandChildren = getChildGoals(child.id);

                      return (
                        <div key={child.id} className="p-3.5 rounded-2xl bg-[#12100e] border border-amber-500/15 space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-amber-100">{child.title}</span>
                            <span className="font-bold text-amber-400">{child.progressPercent}%</span>
                          </div>
                          <p className="text-[11px] text-neutral-400 line-clamp-1">{child.description}</p>
                          <div className="w-full bg-[#26201b] h-1.5 rounded-full overflow-hidden">
                            <div
                              className="bg-gradient-to-r from-amber-500 to-orange-500 h-full rounded-full"
                              style={{ width: `${child.progressPercent}%` }}
                            />
                          </div>

                          {/* GRANDCHILDREN (PROJECT LEVEL) */}
                          {grandChildren.length > 0 && (
                            <div className="pt-2 space-y-1 text-[11px] border-t border-amber-500/10">
                              {grandChildren.map((gc) => (
                                <div key={gc.id} className="flex justify-between text-neutral-300">
                                  <span>↳ {gc.title}</span>
                                  <span className="font-bold text-amber-300">{gc.progressPercent}%</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
