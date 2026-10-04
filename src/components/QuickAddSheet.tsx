import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Mic,
  Camera,
  Paperclip,
  Send,
  Clock,
  Utensils,
  BookOpen,
  DollarSign,
  Heart,
  CheckCircle2
} from 'lucide-react';
import { simulateAIExtraction } from '../lib/aiSimulator';
import { useSpeechRecognition } from '../lib/useSpeechRecognition';
import { AIExtraction, CategoryType, WorkspacePreferences } from '../types';

interface QuickAddSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onAddUniversalDump: (text: string, extraction: AIExtraction) => void;
  onAddExpense: (data: { title: string; amount: number; category: CategoryType }) => void;
  onAddLogTime: (data: { activity: string; minutes: number; category: 'Work' | 'Learning' | 'Health' | 'Personal' }) => void;
  workspacePreferences?: WorkspacePreferences;
}

export const QuickAddSheet: React.FC<QuickAddSheetProps> = ({
  isOpen,
  onClose,
  onAddUniversalDump,
  onAddExpense,
  onAddLogTime,
  workspacePreferences
}) => {
  const enabledModules = workspacePreferences?.enabledModules;
  const isFinanceEnabled = !enabledModules || enabledModules.includes('finance');
  const isTimeEnabled = !enabledModules || enabledModules.includes('time');
  const [activeTab, setActiveTab] = useState<'dump' | 'expense' | 'time' | 'food' | 'learning'>('dump');
  
  // Dump state
  const [dumpText, setDumpText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  // Quick expense state
  const [expTitle, setExpTitle] = useState('');
  const [expAmount, setExpAmount] = useState('');
  const [expCat, setExpCat] = useState<CategoryType>('Food');

  // Quick time state
  const [timeActivity, setTimeActivity] = useState('');
  const [timeHours, setTimeHours] = useState('1');
  const [timeCat, setTimeCat] = useState<'Work' | 'Learning' | 'Health' | 'Personal'>('Learning');

  if (!isOpen) return null;

  const handleProcessDump = (overrideText?: string) => {
    const textToProcess = overrideText || dumpText;
    if (!textToProcess.trim()) return;

    setIsProcessing(true);
    setTimeout(() => {
      const extraction = simulateAIExtraction(textToProcess);
      onAddUniversalDump(textToProcess, extraction);
      setIsProcessing(false);
      setDumpText('');
      onClose();
    }, 700);
  };

  const { isListening, startListening, stopListening, isSupported } = useSpeechRecognition((spokenText) => {
    if (spokenText) setDumpText(spokenText);
  });

  const handleMicClick = () => {
    if (isListening) {
      stopListening();
    } else {
      if (isSupported) {
        startListening();
      } else {
        setIsRecording(true);
        setTimeout(() => {
          setDumpText('₹200 petrol refill today, lasted 3 days');
          setIsRecording(false);
        }, 2000);
      }
    }
  };

  const handleCreateExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expTitle || !expAmount) return;
    onAddExpense({
      title: expTitle,
      amount: parseFloat(expAmount),
      category: expCat
    });
    setExpTitle('');
    setExpAmount('');
    onClose();
  };

  const handleCreateTime = (e: React.FormEvent) => {
    e.preventDefault();
    if (!timeActivity) return;
    onAddLogTime({
      activity: timeActivity,
      minutes: Math.round(parseFloat(timeHours || '1') * 60),
      category: timeCat
    });
    setTimeActivity('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-[#1c1815] border border-amber-500/30 rounded-t-3xl sm:rounded-2xl shadow-2xl shadow-amber-950/60 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Drag handle / Header */}
        <div className="p-4 bg-[#26201b] border-b border-amber-500/20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
            <h2 className="text-base font-bold text-amber-100 font-outfit">
              {activeTab === 'dump' ? 'Universal Life Dump' : 'Quick Record'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white p-1 rounded-lg hover:bg-neutral-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center bg-[#12100e] p-1 border-b border-amber-500/15 text-xs">
          <button
            onClick={() => setActiveTab('dump')}
            className={`flex-1 py-2 rounded-lg font-medium flex items-center justify-center gap-1.5 transition ${
              activeTab === 'dump'
                ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-neutral-950 font-bold shadow'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" /> Dump Everything
          </button>
          {isFinanceEnabled && (
            <button
              onClick={() => setActiveTab('expense')}
              className={`flex-1 py-2 rounded-lg font-medium flex items-center justify-center gap-1.5 transition ${
                activeTab === 'expense'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <DollarSign className="w-3.5 h-3.5" /> Expense
            </button>
          )}
          {isTimeEnabled && (
            <button
              onClick={() => setActiveTab('time')}
              className={`flex-1 py-2 rounded-lg font-medium flex items-center justify-center gap-1.5 transition ${
                activeTab === 'time'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Clock className="w-3.5 h-3.5" /> Time
            </button>
          )}
        </div>

        {/* Body content */}
        <div className="p-5 overflow-y-auto">
          {activeTab === 'dump' && (
            <div className="space-y-4">
              <div className="relative">
                <textarea
                  value={dumpText}
                  onChange={(e) => setDumpText(e.target.value)}
                  placeholder='Dump what happened... e.g. "₹200 petrol today lasted 3 days" or "Studied Python 2 hours"'
                  rows={4}
                  className="w-full bg-[#12100e] border border-amber-500/30 rounded-2xl p-4 text-sm text-amber-100 placeholder-neutral-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition resize-none"
                />
                {isRecording && (
                  <div className="absolute inset-0 bg-[#12100e]/95 rounded-2xl flex items-center justify-center gap-3 text-amber-400 border border-amber-500/50">
                    <Mic className="w-6 h-6 animate-bounce text-orange-400" />
                    <span className="text-sm font-semibold animate-pulse">Listening to voice input...</span>
                  </div>
                )}
              </div>

              {/* Action Toolbar */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleMicClick}
                    className={`p-2.5 rounded-xl border transition ${
                      isRecording
                        ? 'bg-rose-500/20 border-rose-500 text-rose-400'
                        : 'bg-[#26201b] border-amber-500/20 text-amber-400 hover:border-amber-500/50'
                    }`}
                    title="Voice dictation"
                  >
                    <Mic className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDumpText('Bought rice for ₹320, lasted 20 days')}
                    className="p-2.5 rounded-xl bg-[#26201b] border border-amber-500/20 text-amber-400 hover:border-amber-500/50 transition"
                    title="Attach photo/receipt"
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                </div>

                <button
                  disabled={!dumpText.trim() || isProcessing}
                  onClick={() => handleProcessDump()}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 disabled:opacity-50 text-neutral-950 font-bold text-sm shadow-lg shadow-amber-950/50 flex items-center gap-2 transition active:scale-95"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-neutral-950 border-t-transparent rounded-full animate-spin" />
                      <span>Understanding...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" /> Process Entry
                    </>
                  )}
                </button>
              </div>

              {/* Sample Preset Chips */}
              <div className="pt-2 border-t border-amber-500/15">
                <div className="text-[11px] text-neutral-400 mb-2">Tap sample preset:</div>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    '₹200 petrol today, lasted 3 days',
                    'Studied PyTorch for 2 hours',
                    'Worked 8 hours on frontend',
                    'Spent ₹150 on fresh chicken',
                    'Went to gym for 45 mins'
                  ].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => handleProcessDump(preset)}
                      className="px-2.5 py-1.5 rounded-lg bg-[#26201b] hover:bg-[#332a24] border border-amber-500/20 text-xs text-amber-200/90 transition text-left"
                    >
                      + {preset}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'expense' && (
            <form onSubmit={handleCreateExpense} className="space-y-4">
              <div>
                <label className="block text-xs text-neutral-300 mb-1 font-medium">Item Title</label>
                <input
                  type="text"
                  placeholder="e.g. Petrol refill, Coffee, Groceries"
                  value={expTitle}
                  onChange={(e) => setExpTitle(e.target.value)}
                  className="w-full bg-[#12100e] border border-amber-500/30 rounded-xl p-3 text-sm text-amber-100 placeholder-neutral-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-neutral-300 mb-1 font-medium">Amount (₹)</label>
                  <input
                    type="number"
                    placeholder="200"
                    value={expAmount}
                    onChange={(e) => setExpAmount(e.target.value)}
                    className="w-full bg-[#12100e] border border-amber-500/30 rounded-xl p-3 text-sm text-amber-100 placeholder-neutral-500 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs text-neutral-300 mb-1 font-medium">Category</label>
                  <select
                    value={expCat}
                    onChange={(e) => setExpCat(e.target.value as CategoryType)}
                    className="w-full bg-[#12100e] border border-amber-500/30 rounded-xl p-3 text-sm text-amber-100 focus:outline-none focus:border-amber-500"
                  >
                    <option value="Food">Food</option>
                    <option value="Transport">Transport</option>
                    <option value="Personal Care">Personal Care</option>
                    <option value="Housing">Housing</option>
                    <option value="Subscriptions">Subscriptions</option>
                    <option value="Learning">Learning</option>
                    <option value="Health">Health</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-neutral-950 font-bold text-sm shadow-lg shadow-amber-950/50 flex items-center justify-center gap-2 transition"
              >
                <CheckCircle2 className="w-4 h-4" /> Save Expense
              </button>
            </form>
          )}

          {activeTab === 'time' && (
            <form onSubmit={handleCreateTime} className="space-y-4">
              <div>
                <label className="block text-xs text-neutral-300 mb-1 font-medium">Activity Name</label>
                <input
                  type="text"
                  placeholder="e.g. PyTorch Deep Learning, Core Feature Code"
                  value={timeActivity}
                  onChange={(e) => setTimeActivity(e.target.value)}
                  className="w-full bg-[#12100e] border border-amber-500/30 rounded-xl p-3 text-sm text-amber-100 placeholder-neutral-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-neutral-300 mb-1 font-medium">Duration (Hours)</label>
                  <input
                    type="number"
                    step="0.5"
                    placeholder="1.5"
                    value={timeHours}
                    onChange={(e) => setTimeHours(e.target.value)}
                    className="w-full bg-[#12100e] border border-amber-500/30 rounded-xl p-3 text-sm text-amber-100 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs text-neutral-300 mb-1 font-medium">Category</label>
                  <select
                    value={timeCat}
                    onChange={(e) => setTimeCat(e.target.value as any)}
                    className="w-full bg-[#12100e] border border-amber-500/30 rounded-xl p-3 text-sm text-amber-100 focus:outline-none focus:border-amber-500"
                  >
                    <option value="Learning">Learning</option>
                    <option value="Work">Work</option>
                    <option value="Health">Health</option>
                    <option value="Personal">Personal</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-neutral-950 font-bold text-sm shadow-lg shadow-amber-950/50 flex items-center justify-center gap-2 transition"
              >
                <CheckCircle2 className="w-4 h-4" /> Log Time Entry
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
