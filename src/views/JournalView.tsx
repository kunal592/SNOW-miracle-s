import React, { useState } from 'react';
import { BookMarked, Plus, Sparkles, CheckCircle2, Calendar, Smile, Battery } from 'lucide-react';
import { JournalEntry } from '../types';

interface JournalViewProps {
  journalEntries: JournalEntry[];
  onAddJournalEntry: (entry: JournalEntry) => void;
}

export const JournalView: React.FC<JournalViewProps> = ({
  journalEntries,
  onAddJournalEntry
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mood, setMood] = useState(9);
  const [energy, setEnergy] = useState(9);
  const [whatHappened, setWhatHappened] = useState('');
  const [whatWentWell, setWhatWentWell] = useState('');
  const [whatWentWrong, setWhatWentWrong] = useState('');
  const [tomorrowPriority, setTomorrowPriority] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!whatHappened) return;

    const newJournal: JournalEntry = {
      id: 'j_' + Math.random().toString(36).substring(2, 9),
      date: new Date().toISOString().split('T')[0],
      moodRating: mood,
      energyRating: energy,
      whatHappened,
      whatWentWell,
      whatWentWrong,
      tomorrowPriority,
      tags: ['WinterArc', 'DailyLog']
    };

    onAddJournalEntry(newJournal);
    setWhatHappened('');
    setWhatWentWell('');
    setWhatWentWrong('');
    setTomorrowPriority('');
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-amber-100 font-outfit flex items-center gap-2">
            <BookMarked className="w-6 h-6 text-purple-400" /> Daily Journal & Reflection
          </h1>
          <p className="text-xs text-amber-200/80">Reflect on wins, mistakes, and set tomorrow's non-negotiable priority.</p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-neutral-950 font-bold text-xs shadow-lg flex items-center gap-2 transition active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[3]" /> Write Today's Journal
        </button>
      </div>

      {/* FORM MODAL */}
      {isModalOpen && (
        <div className="p-5 rounded-3xl bg-[#1c1815] border border-amber-500/30 shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-amber-500/20 pb-3">
            <h2 className="text-base font-bold text-amber-100 font-outfit">New Journal Entry</h2>
            <button onClick={() => setIsModalOpen(false)} className="text-xs text-neutral-400">Cancel</button>
          </div>

          <form onSubmit={handleCreate} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-neutral-300 mb-1 font-semibold">Mood Rating ({mood}/10)</label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={mood}
                  onChange={(e) => setMood(parseInt(e.target.value, 10))}
                  className="w-full accent-amber-500"
                />
              </div>

              <div>
                <label className="block text-neutral-300 mb-1 font-semibold">Energy Rating ({energy}/10)</label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={energy}
                  onChange={(e) => setEnergy(parseInt(e.target.value, 10))}
                  className="w-full accent-orange-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-neutral-300 mb-1 font-semibold">What happened today?</label>
              <textarea
                value={whatHappened}
                onChange={(e) => setWhatHappened(e.target.value)}
                rows={3}
                placeholder="Summary of today's key activities..."
                className="w-full bg-[#12100e] border border-amber-500/30 rounded-xl p-3 text-amber-100 resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-neutral-300 mb-1 font-semibold">What went well?</label>
                <input
                  type="text"
                  value={whatWentWell}
                  onChange={(e) => setWhatWentWell(e.target.value)}
                  className="w-full bg-[#12100e] border border-amber-500/30 rounded-xl p-2.5 text-amber-100"
                />
              </div>

              <div>
                <label className="block text-neutral-300 mb-1 font-semibold">What went wrong?</label>
                <input
                  type="text"
                  value={whatWentWrong}
                  onChange={(e) => setWhatWentWrong(e.target.value)}
                  className="w-full bg-[#12100e] border border-amber-500/30 rounded-xl p-2.5 text-amber-100"
                />
              </div>
            </div>

            <div>
              <label className="block text-amber-300 mb-1 font-bold">Tomorrow's Priority</label>
              <input
                type="text"
                value={tomorrowPriority}
                onChange={(e) => setTomorrowPriority(e.target.value)}
                placeholder="Single most critical outcome for tomorrow"
                className="w-full bg-[#12100e] border border-amber-500/50 rounded-xl p-2.5 text-amber-100 font-medium"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-neutral-950 font-bold text-xs shadow-lg flex items-center justify-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" /> Save Journal Entry
            </button>
          </form>
        </div>
      )}

      {/* JOURNAL HISTORY LIST */}
      <div className="space-y-4">
        {journalEntries.map((j) => (
          <div key={j.id} className="p-5 rounded-3xl bg-[#1c1815] border border-amber-500/20 shadow-md space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-amber-400" />
                <span className="font-bold text-amber-100 text-sm font-outfit">{j.date}</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 font-bold">Mood: {j.moodRating}/10</span>
                <span className="px-2 py-0.5 rounded bg-orange-500/15 text-orange-300 font-bold">Energy: {j.energyRating}/10</span>
              </div>
            </div>

            <p className="text-xs text-amber-100 leading-relaxed font-sans">{j.whatHappened}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-2 border-t border-amber-500/15">
              <div className="p-2.5 rounded-xl bg-emerald-950/20 border border-emerald-500/20 text-emerald-200">
                <span className="font-bold text-emerald-400 block text-[10px] uppercase">What Went Well</span>
                {j.whatWentWell || 'N/A'}
              </div>

              <div className="p-2.5 rounded-xl bg-rose-950/20 border border-rose-500/20 text-rose-200">
                <span className="font-bold text-rose-400 block text-[10px] uppercase">What Went Wrong</span>
                {j.whatWentWrong || 'N/A'}
              </div>
            </div>

            {j.tomorrowPriority && (
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200">
                <span className="font-bold text-amber-400 block text-[10px] uppercase">Tomorrow's Priority</span>
                {j.tomorrowPriority}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
