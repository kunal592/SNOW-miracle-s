import React, { useState } from 'react';
import {
  Sparkles,
  Mic,
  Camera,
  Paperclip,
  CheckCircle2,
  Edit3,
  Trash2,
  AlertCircle,
  Clock,
  DollarSign,
  ArrowRight,
  Filter,
  Check
} from 'lucide-react';
import { InboxEntry, AIExtraction } from '../types';
import { simulateAIExtraction } from '../lib/aiSimulator';
import { useSpeechRecognition } from '../lib/useSpeechRecognition';

interface UniversalInboxViewProps {
  inbox: InboxEntry[];
  onAddEntry: (rawText: string, extraction: AIExtraction) => void;
  onApproveEntry: (id: string) => void;
  onDeleteEntry: (id: string) => void;
  onNavigateToReview: () => void;
}

export const UniversalInboxView: React.FC<UniversalInboxViewProps> = ({
  inbox,
  onAddEntry,
  onApproveEntry,
  onDeleteEntry,
  onNavigateToReview
}) => {
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [filter, setFilter] = useState<'All' | 'Needs Review' | 'Approved'>('All');

  const { isListening, startListening, stopListening, isSupported } = useSpeechRecognition((spokenText) => {
    if (spokenText) setInputText(spokenText);
  });

  const handleProcess = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    setIsProcessing(true);
    setTimeout(() => {
      const extraction = simulateAIExtraction(inputText);
      onAddEntry(inputText, extraction);
      setIsProcessing(false);
      setInputText('');
    }, 750);
  };

  const handleVoiceDictation = () => {
    if (isListening) {
      stopListening();
    } else {
      if (isSupported) {
        startListening();
      } else {
        setIsRecording(true);
        setTimeout(() => {
          setInputText('Spent ₹320 on Basmati Rice, expected to last 20 days');
          setIsRecording(false);
        }, 1500);
      }
    }
  };

  const filteredEntries = inbox.filter((item) => {
    if (filter === 'Needs Review') return item.status === 'Needs Review' || item.status === 'Raw';
    if (filter === 'Approved') return item.status === 'Approved';
    return true;
  });

  const pendingReviewCount = inbox.filter((i) => i.status === 'Needs Review' || i.status === 'Raw').length;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-[#1c1815] border border-amber-500/25 shadow-xl space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-amber-100 font-outfit">Universal Inbox</h1>
            <p className="text-xs text-amber-200/80">"Dump everything. We'll organize, calculate & analyze it."</p>
          </div>
          {pendingReviewCount > 0 && (
            <button
              onClick={onNavigateToReview}
              className="px-3.5 py-2 rounded-xl bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/40 text-orange-200 text-xs font-bold flex items-center gap-1.5 transition"
            >
              <AlertCircle className="w-4 h-4 text-orange-400" />
              <span>{pendingReviewCount} Review Queue</span>
            </button>
          )}
        </div>

        {/* Input Box */}
        <form onSubmit={handleProcess} className="pt-3 space-y-3">
          <div className="relative">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder='What happened? e.g. "₹200 petrol today, lasted 3 days" or "Studied PyTorch for 2 hours"'
              rows={4}
              className="w-full bg-[#12100e] border border-amber-500/30 rounded-2xl p-4 text-sm text-amber-100 placeholder-neutral-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition resize-none"
            />
            {isRecording && (
              <div className="absolute inset-0 bg-[#12100e]/95 rounded-2xl flex items-center justify-center gap-3 text-amber-400 border border-amber-500/50">
                <Mic className="w-6 h-6 animate-bounce text-orange-400" />
                <span className="text-sm font-semibold animate-pulse">Listening... speak now</span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleVoiceDictation}
                className={`p-2.5 rounded-xl border transition ${
                  isRecording ? 'bg-rose-500/20 border-rose-500 text-rose-400' : 'bg-[#26201b] border-amber-500/20 text-amber-400 hover:border-amber-500/50'
                }`}
                title="Voice input"
              >
                <Mic className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setInputText('Bought shampoo ₹450, lasts 30 days')}
                className="p-2.5 rounded-xl bg-[#26201b] border border-amber-500/20 text-amber-400 hover:border-amber-500/50 transition"
                title="Camera scan"
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>

            <button
              type="submit"
              disabled={!inputText.trim() || isProcessing}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 disabled:opacity-50 text-neutral-950 font-extrabold text-sm shadow-lg shadow-amber-950/60 flex items-center gap-2 transition active:scale-95"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-neutral-950 border-t-transparent rounded-full animate-spin" />
                  <span>Understanding...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" /> Process with AI
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Filter Tabs & History List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-amber-100 font-outfit">Inbox Log</h2>
          <div className="flex items-center gap-1 bg-[#1c1815] p-1 rounded-xl border border-amber-500/20 text-xs">
            {(['All', 'Needs Review', 'Approved'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-3 py-1 rounded-lg transition ${
                  filter === tab ? 'bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30' : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {filteredEntries.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-[#1c1815] border border-amber-500/15 text-neutral-400 text-sm">
              Your inbox is clean. Dump an activity or purchase above!
            </div>
          ) : (
            filteredEntries.map((item) => {
              const ext = item.aiExtraction;

              return (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl bg-[#1c1815] border border-amber-500/20 shadow-md space-y-3 transition hover:border-amber-500/40"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-xs text-neutral-400 font-mono">
                        {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <div className="text-sm font-bold text-amber-100 mt-0.5">"{item.rawText}"</div>
                    </div>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        item.status === 'Approved'
                          ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                          : 'bg-orange-500/20 text-orange-300 border border-orange-500/40'
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>

                  {ext && (
                    <div className="p-3 rounded-xl bg-[#12100e] border border-amber-500/15 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-amber-400">{ext.extractedCategory}</span>
                          {ext.subcategory && (
                            <span className="text-neutral-400">• {ext.subcategory}</span>
                          )}
                        </div>
                        <span className="text-[10px] text-amber-500 font-mono">{ext.confidenceScore}% Confidence</span>
                      </div>

                      {ext.isConsumption && ext.dailyAllocationCost && (
                        <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-between text-amber-200">
                          <span>Consumption Allocation:</span>
                          <span className="font-bold">₹{ext.dailyAllocationCost}/day over {ext.extractedDurationDays} days</span>
                        </div>
                      )}

                      <p className="text-[11px] text-neutral-400 italic">"{ext.aiExplanation}"</p>
                    </div>
                  )}

                  <div className="flex items-center justify-end gap-2 pt-1">
                    {item.status !== 'Approved' && (
                      <button
                        onClick={() => onApproveEntry(item.id)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-200 text-xs font-semibold flex items-center gap-1 transition"
                      >
                        <Check className="w-3.5 h-3.5" /> Approve
                      </button>
                    )}
                    <button
                      onClick={() => onDeleteEntry(item.id)}
                      className="p-1.5 rounded-lg bg-neutral-800 hover:bg-rose-950 text-neutral-400 hover:text-rose-300 transition"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
