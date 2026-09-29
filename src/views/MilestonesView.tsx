import React, { useState } from 'react';
import { Flag, Plus, CheckCircle2, Clock, Sparkles, AlertCircle, Calendar } from 'lucide-react';
import { Milestone, MilestoneStatus } from '../types';

interface MilestonesViewProps {
  milestones: Milestone[];
  onAddMilestone: (milestone: Milestone) => void;
  onToggleChecklistItem: (milestoneId: string, itemId: string) => void;
  onOpenCheckpointModal: () => void;
}

export const MilestonesView: React.FC<MilestonesViewProps> = ({
  milestones,
  onAddMilestone,
  onToggleChecklistItem,
  onOpenCheckpointModal
}) => {
  const [activeTab, setActiveTab] = useState<'Upcoming' | 'Today' | 'Completed'>('Upcoming');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('2026-10-15');
  const [type, setType] = useState<Milestone['type']>('Checkpoint');
  const [description, setDescription] = useState('');

  const filteredMilestones = milestones.filter((m) => {
    if (activeTab === 'Today') return m.status === 'Today';
    if (activeTab === 'Completed') return m.status === 'Completed';
    return m.status === 'Upcoming';
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    const newMs: Milestone = {
      id: 'ms_' + Math.random().toString(36).substring(2, 9),
      title,
      date,
      type,
      description,
      status: 'Upcoming',
      linkedGoalIds: ['g_winter_arc'],
      checklist: [
        { id: 'ck_' + Math.random(), task: 'Complete milestone review', done: false }
      ]
    };

    onAddMilestone(newMs);
    setTitle('');
    setDescription('');
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-[#26201b] via-[#1c1815] to-[#12100e] border border-amber-500/25 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-amber-100 font-outfit flex items-center gap-2">
            <Flag className="w-6 h-6 text-orange-400" /> Milestones & Checkpoints
          </h1>
          <p className="text-xs text-amber-200/80 mt-1">
            "Accountability checkpoints that measure execution speed and discipline."
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onOpenCheckpointModal}
            className="px-4 py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-bold text-xs flex items-center gap-1.5 transition"
          >
            <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
            <span>Trigger Checkpoint Demo</span>
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-neutral-950 font-bold text-xs shadow-lg flex items-center gap-1.5 transition"
          >
            <Plus className="w-4 h-4 stroke-[3]" /> Add Milestone
          </button>
        </div>
      </div>

      {/* TABS */}
      <div className="flex items-center gap-2 border-b border-amber-500/15 pb-2">
        {(['Upcoming', 'Today', 'Completed'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === tab
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            {tab} ({milestones.filter((m) => m.status === tab).length})
          </button>
        ))}
      </div>

      {/* FORM MODAL */}
      {isModalOpen && (
        <div className="p-5 rounded-3xl bg-[#1c1815] border border-amber-500/30 shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-amber-500/20 pb-3">
            <h2 className="text-base font-bold text-amber-100 font-outfit">Add Milestone</h2>
            <button onClick={() => setIsModalOpen(false)} className="text-xs text-neutral-400">Cancel</button>
          </div>

          <form onSubmit={handleCreate} className="space-y-4 text-xs">
            <div>
              <label className="block text-neutral-300 mb-1">Title</label>
              <input
                type="text"
                placeholder="e.g. Winter Arc Checkpoint #2"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-[#12100e] border border-amber-500/30 rounded-xl p-3 text-amber-100"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-neutral-300 mb-1">Target Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-[#12100e] border border-amber-500/30 rounded-xl p-2.5 text-amber-100"
                />
              </div>

              <div>
                <label className="block text-neutral-300 mb-1">Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="w-full bg-[#12100e] border border-amber-500/30 rounded-xl p-2.5 text-amber-100"
                >
                  <option value="Checkpoint">Checkpoint</option>
                  <option value="Review">Review</option>
                  <option value="Deadline">Deadline</option>
                  <option value="Personal">Personal</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-neutral-300 mb-1">Description</label>
              <textarea
                placeholder="Brief summary of expected outcomes"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="w-full bg-[#12100e] border border-amber-500/30 rounded-xl p-3 text-amber-100 resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-neutral-950 font-bold text-xs shadow-lg flex items-center justify-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" /> Save Milestone
            </button>
          </form>
        </div>
      )}

      {/* MILESTONES LIST */}
      <div className="space-y-4">
        {filteredMilestones.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-[#1c1815] border border-amber-500/15 text-neutral-400 text-sm">
            No milestones under {activeTab}.
          </div>
        ) : (
          filteredMilestones.map((ms) => (
            <div key={ms.id} className="p-5 rounded-3xl bg-[#1c1815] border border-amber-500/25 shadow-md space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-orange-500/20 text-orange-300 border border-orange-500/30 uppercase">
                      {ms.type}
                    </span>
                    <span className="text-xs font-mono text-amber-400">{ms.date}</span>
                  </div>
                  <h3 className="text-lg font-bold text-amber-100 font-outfit mt-1">{ms.title}</h3>
                  <p className="text-xs text-neutral-400 mt-0.5">{ms.description}</p>
                </div>

                <button
                  onClick={onOpenCheckpointModal}
                  className="px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-xs font-semibold shrink-0"
                >
                  Start Review →
                </button>
              </div>

              {/* CHECKLIST */}
              <div className="space-y-2 pt-2 border-t border-amber-500/15">
                <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Milestone Checklist</div>
                <div className="space-y-1.5">
                  {ms.checklist.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => onToggleChecklistItem(ms.id, item.id)}
                      className="flex items-center gap-2.5 p-2 rounded-xl bg-[#12100e] border border-amber-500/10 cursor-pointer hover:border-amber-500/30 transition text-xs"
                    >
                      <input
                        type="checkbox"
                        checked={item.done}
                        onChange={() => {}}
                        className="w-4 h-4 rounded border-amber-500/40 text-amber-500 focus:ring-amber-500"
                      />
                      <span className={`text-neutral-200 ${item.done ? 'line-through text-neutral-500' : ''}`}>
                        {item.task}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
