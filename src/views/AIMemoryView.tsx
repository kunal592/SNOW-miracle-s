import React, { useState } from 'react';
import { Database, Plus, Trash2, Edit2, CheckCircle2, ShieldCheck } from 'lucide-react';
import { AIMemory } from '../types';

interface AIMemoryViewProps {
  memories: AIMemory[];
  onAddMemory: (memory: AIMemory) => void;
  onDeleteMemory: (id: string) => void;
}

export const AIMemoryView: React.FC<AIMemoryViewProps> = ({
  memories,
  onAddMemory,
  onDeleteMemory
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [category, setCategory] = useState<AIMemory['category']>('Preferences');
  const [memoryText, setMemoryText] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!memoryText) return;

    const newMem: AIMemory = {
      id: 'aim_' + Math.random().toString(36).substring(2, 9),
      category,
      memoryText,
      confidence: 99,
      createdAt: new Date().toISOString()
    };

    onAddMemory(newMem);
    setMemoryText('');
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-amber-100 font-outfit flex items-center gap-2">
            <Database className="w-6 h-6 text-amber-400" /> AI Memory Manager
          </h1>
          <p className="text-xs text-amber-200/80">User-visible memory store. Inspect, edit, or delete persistent AI observations.</p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-neutral-950 font-bold text-xs shadow-lg flex items-center gap-2 transition active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[3]" /> Add Explicit Memory Rule
        </button>
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <div className="p-5 rounded-3xl bg-[#1c1815] border border-amber-500/30 shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-amber-500/20 pb-3">
            <h2 className="text-base font-bold text-amber-100 font-outfit">Add AI Memory Rule</h2>
            <button onClick={() => setIsModalOpen(false)} className="text-xs text-neutral-400">Cancel</button>
          </div>

          <form onSubmit={handleCreate} className="space-y-4 text-xs">
            <div>
              <label className="block text-neutral-300 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full bg-[#12100e] border border-amber-500/30 rounded-xl p-2.5 text-amber-100"
              >
                <option value="Preferences">Preferences</option>
                <option value="Goals">Goals</option>
                <option value="Financial Rules">Financial Rules</option>
                <option value="Patterns">Patterns</option>
                <option value="Milestones">Milestones</option>
              </select>
            </div>

            <div>
              <label className="block text-neutral-300 mb-1">Memory Statement</label>
              <textarea
                value={memoryText}
                onChange={(e) => setMemoryText(e.target.value)}
                placeholder="e.g. Always reserve 2 hours for deep work before lunch."
                rows={3}
                className="w-full bg-[#12100e] border border-amber-500/30 rounded-xl p-3 text-amber-100 resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-neutral-950 font-bold text-xs shadow-lg flex items-center justify-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" /> Save Memory
            </button>
          </form>
        </div>
      )}

      {/* MEMORY LIST */}
      <div className="space-y-3">
        {memories.map((mem) => (
          <div key={mem.id} className="p-4 rounded-2xl bg-[#1c1815] border border-amber-500/20 flex items-center justify-between text-xs space-y-1">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {mem.category}
                </span>
                <span className="text-[10px] text-neutral-400 font-mono">{mem.confidence}% Confidence</span>
              </div>
              <p className="text-amber-100 font-medium">{mem.memoryText}</p>
            </div>

            <button
              onClick={() => onDeleteMemory(mem.id)}
              className="p-2 rounded-lg bg-neutral-800 hover:bg-rose-950 text-neutral-400 hover:text-rose-300 transition shrink-0 ml-3"
              title="Delete memory"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
