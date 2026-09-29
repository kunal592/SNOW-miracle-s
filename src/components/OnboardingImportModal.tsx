import React, { useState } from 'react';
import { Sparkles, X, Copy, Check, ArrowRight, ShieldCheck, CheckCircle } from 'lucide-react';
import { User, Goal, LearningGoal, Milestone, ConsumptionExpense, HealthEntry } from '../types';
import { generateChatGPTImportPrompt, parseAndAnalyzeAIContext, commitImportItems, ExistingPWAData } from '../lib/importAnalyzer';

interface OnboardingImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  goals: Goal[];
  learningGoals: LearningGoal[];
  milestones: Milestone[];
  consumption: ConsumptionExpense[];
  health: HealthEntry[];
  onShowToast: (text: string, type?: 'success' | 'error' | 'info') => void;
  onNavigate: (route: string) => void;
}

export function OnboardingImportModal({
  isOpen,
  onClose,
  user,
  goals,
  learningGoals,
  milestones,
  consumption,
  health,
  onShowToast,
  onNavigate
}: OnboardingImportModalProps) {
  const [copied, setCopied] = useState(false);
  const [pastedText, setPastedText] = useState('');
  const [step, setStep] = useState<'Prompt' | 'Review' | 'Complete'>('Prompt');
  const [preview, setPreview] = useState<any>(null);

  if (!isOpen) return null;

  const existingData: ExistingPWAData = { user, goals, learningGoals, milestones, consumption, health };
  const promptText = generateChatGPTImportPrompt('Guided', 'SNOW');

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(promptText);
    setCopied(true);
    onShowToast('Prompt copied! Paste it into ChatGPT.', 'success');
    setTimeout(() => setCopied(false), 3000);
  };

  const handleAnalyze = () => {
    if (!pastedText.trim()) {
      onShowToast('Please paste ChatGPT output first.', 'error');
      return;
    }
    const res = parseAndAnalyzeAIContext(pastedText, 'Guided', existingData);
    setPreview(res);
    setStep('Review');
  };

  const handleCommit = () => {
    if (!preview) return;
    const selected = preview.items.filter((i: any) => i.selectedAction === 'Import');
    commitImportItems(selected, existingData);
    setStep('Complete');
    onShowToast(`Imported ${selected.length} items to Personal OS!`, 'success');
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-stone-900 border border-amber-500/30 w-full max-w-2xl rounded-2xl p-6 shadow-2xl space-y-6 relative overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-200 rounded-lg bg-stone-800"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-100">Initialize OS from ChatGPT</h2>
            <p className="text-xs text-slate-400">Import your existing goals, skills, routines & projects</p>
          </div>
        </div>

        {step === 'Prompt' && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-stone-950 border border-stone-800 space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-300 font-medium">
                <span>Step 1: Copy prompt & paste into ChatGPT</span>
                <span className="text-amber-400 font-mono">Guided Import</span>
              </div>
              <div className="p-3 bg-stone-900 rounded-lg text-xs font-mono text-amber-200/90 max-h-36 overflow-y-auto">
                <pre className="whitespace-pre-wrap font-sans text-xs">{promptText}</pre>
              </div>
              <button
                onClick={handleCopyPrompt}
                className={`w-full py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2 ${
                  copied ? 'bg-emerald-600 text-white' : 'bg-amber-500 text-stone-950 hover:bg-amber-400'
                }`}
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied to Clipboard' : 'Copy Prompt for ChatGPT'}
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-300">Step 2: Paste ChatGPT's output here</label>
              <textarea
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                placeholder="Paste the output response from ChatGPT..."
                className="w-full h-32 bg-stone-950 border border-stone-800 rounded-xl p-3 text-xs text-slate-200 font-mono focus:outline-none focus:border-amber-500/50"
              />
            </div>

            <button
              onClick={handleAnalyze}
              disabled={!pastedText.trim()}
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2"
            >
              Analyze & Preview Import <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {step === 'Review' && preview && (
          <div className="space-y-4 max-h-[60vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-slate-100">Review {preview.totalFound} Found Items</span>
              <span className="text-xs text-emerald-400 font-medium">Ready to import</span>
            </div>

            <div className="space-y-2">
              {preview.items.map((item: any) => (
                <div key={item.id} className="p-3 bg-stone-950 rounded-xl border border-stone-800 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-200">{item.module}: {item.title}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-400">
                      {item.status}
                    </span>
                  </div>
                  <p className="text-slate-400 text-[11px]">{item.detail}</p>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setStep('Prompt')}
                className="px-4 py-2 rounded-lg bg-stone-800 text-slate-300 text-xs font-medium"
              >
                Back
              </button>
              <button
                onClick={handleCommit}
                className="px-6 py-2.5 rounded-lg bg-emerald-600 text-white text-xs font-bold flex items-center gap-2"
              >
                <CheckCircle className="w-4 h-4" /> Confirm & Import All
              </button>
            </div>
          </div>
        )}

        {step === 'Complete' && (
          <div className="text-center py-8 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold text-slate-100">Personal OS Populated!</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Your ChatGPT context has been transferred into your Goals, Learning, Milestones, and Routines.
            </p>
            <div className="flex justify-center gap-3 pt-4">
              <button
                onClick={() => {
                  onClose();
                  onNavigate('/goals');
                }}
                className="px-6 py-2.5 rounded-xl bg-amber-500 text-stone-950 font-bold text-xs flex items-center gap-2"
              >
                Explore Goals <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
