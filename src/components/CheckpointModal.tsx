import React, { useState } from 'react';
import { X, Sparkles, CheckCircle, Clock, Award, Activity, Wallet, Monitor } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Checkpoint } from '../types';

interface CheckpointModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (data: Partial<Checkpoint>) => void;
}

export const CheckpointModal: React.FC<CheckpointModalProps> = ({
  isOpen,
  onClose,
  onComplete
}) => {
  const [whatWentWell, setWhatWentWell] = useState('Maintained strict deep work blocks every morning without phone checks. Finished PyTorch learning module ahead of schedule.');
  const [whatWentWrong, setWhatWentWrong] = useState('Occasional afternoon slump led to 1h screen time leak on social media.');
  const [whatShouldChange, setWhatShouldChange] = useState('Block social media apps past 13:00 and increase hydration during afternoon sessions.');
  const [nextPriority, setNextPriority] = useState('Ship SNOW universal inbox AI review engine and double down on AI Engineering project #1.');

  if (!isOpen) return null;

  const handleComplete = () => {
    // Fire celebratory confetti!
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#f59e0b', '#ea580c', '#d97706', '#f4efe6']
    });

    onComplete({
      reflection: {
        whatWentWell,
        whatWentWrong,
        whatShouldChange,
        nextPriority
      },
      completedAt: new Date().toISOString()
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-[#1c1815] border border-amber-500/30 rounded-2xl shadow-2xl shadow-amber-950/50 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-amber-950/60 via-[#26201b] to-orange-950/40 border-b border-amber-500/20 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Milestone Checkpoint
                </span>
                <span className="text-xs text-neutral-400">Oct 15, 2026</span>
              </div>
              <h2 className="text-xl font-bold text-amber-100 font-outfit mt-0.5">
                🔔 WINTER ARC CHECKPOINT
              </h2>
              <p className="text-xs text-amber-200/80">"Time for your first Winter Arc checkup."</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white p-1 rounded-lg hover:bg-neutral-800/60 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-5 overflow-y-auto custom-scrollbar flex-1 text-sm">
          {/* Stats Review Grid */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
              14-Day Performance Audit
            </h3>
            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-3 rounded-xl bg-[#26201b]/80 border border-amber-500/15 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[11px] text-neutral-400">Deep Work</div>
                  <div className="font-bold text-amber-200">24h / 30h <span className="text-[10px] text-amber-400/80 font-normal">(80%)</span></div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#26201b]/80 border border-amber-500/15 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-orange-500/10 text-orange-400">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[11px] text-neutral-400">Workouts</div>
                  <div className="font-bold text-orange-200">14 / 12 <span className="text-[10px] text-emerald-400 font-normal">✓ Exceeded</span></div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#26201b]/80 border border-amber-500/15 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                  <Wallet className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[11px] text-neutral-400">Expense Tracking</div>
                  <div className="font-bold text-emerald-200">27 / 30 days</div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#26201b]/80 border border-amber-500/15 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400">
                  <Monitor className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[11px] text-neutral-400">Screen Time</div>
                  <div className="font-bold text-neutral-200">1h 37m<span className="text-[10px] text-neutral-400">/day</span></div>
                </div>
              </div>
            </div>
          </div>

          {/* Reflection Form */}
          <div className="space-y-3 pt-2 border-t border-amber-500/15">
            <h3 className="text-xs font-semibold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5" /> Reflection & Accountability
            </h3>

            <div>
              <label className="block text-xs text-neutral-300 mb-1 font-medium">
                What went well?
              </label>
              <textarea
                value={whatWentWell}
                onChange={(e) => setWhatWentWell(e.target.value)}
                rows={2}
                className="w-full bg-[#12100e] border border-amber-500/20 rounded-xl p-2.5 text-xs text-amber-100 focus:outline-none focus:border-amber-500/60"
              />
            </div>

            <div>
              <label className="block text-xs text-neutral-300 mb-1 font-medium">
                What went wrong / time leaks?
              </label>
              <textarea
                value={whatWentWrong}
                onChange={(e) => setWhatWentWrong(e.target.value)}
                rows={2}
                className="w-full bg-[#12100e] border border-amber-500/20 rounded-xl p-2.5 text-xs text-amber-100 focus:outline-none focus:border-amber-500/60"
              />
            </div>

            <div>
              <label className="block text-xs text-neutral-300 mb-1 font-medium">
                What should change starting tomorrow?
              </label>
              <input
                type="text"
                value={whatShouldChange}
                onChange={(e) => setWhatShouldChange(e.target.value)}
                className="w-full bg-[#12100e] border border-amber-500/20 rounded-xl p-2.5 text-xs text-amber-100 focus:outline-none focus:border-amber-500/60"
              />
            </div>

            <div>
              <label className="block text-xs text-amber-300 mb-1 font-semibold">
                What is your next priority?
              </label>
              <input
                type="text"
                value={nextPriority}
                onChange={(e) => setNextPriority(e.target.value)}
                className="w-full bg-[#12100e] border border-amber-500/40 rounded-xl p-2.5 text-xs text-amber-100 font-medium focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-[#12100e] border-t border-amber-500/20 flex items-center gap-2 justify-end">
          <button
            onClick={onClose}
            className="px-3 py-2 text-xs font-medium text-neutral-400 hover:text-neutral-200 transition"
          >
            Review Later
          </button>
          <button
            onClick={handleComplete}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-neutral-950 shadow-lg shadow-amber-950/50 flex items-center gap-1.5 transition active:scale-95"
          >
            <CheckCircle className="w-4 h-4" /> Complete Checkpoint
          </button>
        </div>
      </div>
    </div>
  );
};
