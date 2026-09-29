import React, { useState } from 'react';
import { Sparkles, BrainCircuit, MessageSquare, Send, ShieldCheck, ArrowRight, Eye, Database, Activity, Target, AlertTriangle } from 'lucide-react';
import { AIInsight, AIRecommendation, MilestonePaceAnalysis, DailyBrief } from '../types';
import { generateStructuredAIResponse } from '../lib/cognitiveEngine';

interface AICommandCenterViewProps {
  dailyBrief: DailyBrief;
  insights: AIInsight[];
  recommendations: AIRecommendation[];
  milestonePace: MilestonePaceAnalysis[];
  onNavigate: (route: string) => void;
}

export const AICommandCenterView: React.FC<AICommandCenterViewProps> = ({
  dailyBrief,
  insights,
  recommendations,
  milestonePace,
  onNavigate
}) => {
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<{ sender: 'user' | 'ai'; text: string }[]>([
    {
      sender: 'ai',
      text: `## Answer
Welcome to the AI Supervisor Command Center. I observe your tracked data across Finance, Time, Learning, Health, and Milestones to provide evidence-backed supervision.

## Evidence
- 15 Inbox Entries categorized.
- 10 Active Consumption Allocations tracked at ₹347/day.
- 24h 15m Deep Work logged this week.

## Interpretation
Your daily operational tracking discipline is high. Primary current focus is aligning learning pace with Oct 15 Checkpoint.

## Uncertainty
Behavioral patterns will gain higher confidence as additional days are logged.

## Suggested Next Step
Ask me any question about your time leaks, expense variance, or milestone pace below.`
    }
  ]);
  const [isAsking, setIsAsking] = useState(false);

  const handleSendChat = (e?: React.FormEvent, overrideText?: string) => {
    if (e) e.preventDefault();
    const query = overrideText || chatInput;
    if (!query.trim()) return;

    setChatMessages((prev) => [...prev, { sender: 'user', text: query }]);
    if (!overrideText) setChatInput('');
    setIsAsking(true);

    setTimeout(() => {
      const aiReply = generateStructuredAIResponse(query);
      setChatMessages((prev) => [...prev, { sender: 'ai', text: aiReply }]);
      setIsAsking(false);
    }, 700);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-[#26201b] via-[#1c1815] to-[#12100e] border border-amber-500/30 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-amber-100 font-outfit">AI SUPERVISOR COMMAND CENTER</h1>
              <p className="text-xs text-amber-300/90 font-medium">"Truthful, evidence-backed observation & milestone supervision."</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => onNavigate('/ai/memory')}
            className="px-3.5 py-2 rounded-xl bg-[#26201b] hover:bg-[#332a24] border border-amber-500/20 text-amber-200 font-bold text-xs flex items-center gap-1.5 transition"
          >
            <Database className="w-4 h-4 text-amber-400" /> AI Memory
          </button>
          <button
            onClick={() => onNavigate('/ai/activity')}
            className="px-3.5 py-2 rounded-xl bg-[#26201b] hover:bg-[#332a24] border border-amber-500/20 text-neutral-300 font-bold text-xs flex items-center gap-1.5 transition"
          >
            <Activity className="w-4 h-4 text-orange-400" /> Activity Log
          </button>
        </div>
      </div>

      {/* TODAY'S AI BRIEF CARD */}
      <div className="p-6 rounded-3xl bg-[#1c1815] border border-amber-500/30 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-amber-500/20 pb-3">
          <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-400" /> Today's AI Brief ({dailyBrief.date})
          </span>
          <span className="text-[10px] text-emerald-400 font-bold">Evidence Verified</span>
        </div>

        <div className="space-y-2 text-xs">
          <div>
            <span className="text-neutral-400 font-semibold block text-[10px] uppercase">Today's Focus:</span>
            <p className="text-sm font-bold text-amber-100 font-outfit">{dailyBrief.todayFocus}</p>
          </div>

          <div>
            <span className="text-neutral-400 font-semibold block text-[10px] uppercase">Why:</span>
            <p className="text-amber-200/90">{dailyBrief.whyFocus}</p>
          </div>

          <div className="p-3 rounded-xl bg-[#12100e] border border-amber-500/15 text-[11px] text-neutral-300">
            <span className="font-bold text-amber-400 block uppercase text-[10px]">Underlying Data Evidence:</span>
            {dailyBrief.evidenceText}
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-amber-500/15">
          <div className="text-xs text-neutral-300">
            Challenge: <span className="font-bold text-amber-300">{dailyBrief.todayChallengeTitle}</span>
          </div>
          <button
            onClick={() => onNavigate('/cognitive')}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-neutral-950 font-bold text-xs shadow flex items-center gap-1.5"
          >
            Start Challenge <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* MILESTONE PACE ANALYSIS */}
      {milestonePace.length > 0 && (
        <div className="p-5 rounded-3xl bg-[#1c1815] border border-amber-500/25 shadow-md space-y-4">
          <h2 className="text-base font-bold text-amber-100 font-outfit flex items-center gap-2">
            <Target className="w-5 h-5 text-orange-400" /> AI Milestone Pace Supervision
          </h2>

          {milestonePace.map((mp) => (
            <div key={mp.milestoneId} className="p-4 rounded-2xl bg-[#12100e] border border-amber-500/20 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-amber-100 text-sm font-outfit">{mp.milestoneTitle}</h3>
                  <div className="text-[10px] text-neutral-400">{mp.currentHours} / {mp.targetHours} hours ({mp.progressPercent}%)</div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-orange-500/20 text-orange-300 font-bold border border-orange-500/30">
                  {mp.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-[#1c1815] text-[11px]">
                <div>
                  <span className="text-[10px] text-neutral-500 block">Required Daily Pace:</span>
                  <span className="font-bold text-amber-300">{mp.requiredDailyPace}</span>
                </div>
                <div>
                  <span className="text-[10px] text-neutral-500 block">Actual Recent Pace:</span>
                  <span className="font-bold text-rose-300">{mp.actualRecentPace}</span>
                </div>
              </div>

              <p className="text-amber-200/90 italic">"{mp.aiObservation}"</p>
            </div>
          ))}
        </div>
      )}

      {/* EVIDENCE-BASED AI INSIGHTS */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-amber-100 font-outfit flex items-center gap-2">
          <BrainCircuit className="w-5 h-5 text-amber-400" /> Evidence-Backed Observations & Insights
        </h2>

        <div className="space-y-4">
          {insights.map((insight) => (
            <div key={insight.id} className="p-5 rounded-3xl bg-[#1c1815] border border-amber-500/20 shadow-md space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase">
                    {insight.module}
                  </span>
                  <h3 className="font-bold text-amber-100 text-sm font-outfit">{insight.title}</h3>
                </div>
                <span className="text-[10px] text-amber-400 font-semibold">{insight.confidenceLevel} Confidence</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-2.5 pt-1">
                <div className="p-3 rounded-xl bg-[#12100e] border border-amber-500/15">
                  <span className="font-bold text-amber-400 block text-[10px] uppercase mb-0.5">FACT (Observed Data):</span>
                  <p className="text-neutral-200">{insight.fact}</p>
                </div>

                <div className="p-3 rounded-xl bg-[#12100e] border border-amber-500/15">
                  <span className="font-bold text-orange-400 block text-[10px] uppercase mb-0.5">INTERPRETATION:</span>
                  <p className="text-neutral-200">{insight.interpretation}</p>
                </div>

                <div className="p-3 rounded-xl bg-[#12100e] border border-amber-500/15">
                  <span className="font-bold text-purple-400 block text-[10px] uppercase mb-0.5">HYPOTHESIS:</span>
                  <p className="text-neutral-200">{insight.hypothesis}</p>
                </div>

                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-100">
                  <span className="font-bold text-amber-300 block text-[10px] uppercase mb-0.5">RECOMMENDATION:</span>
                  <p>{insight.recommendation}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CONVERSATIONAL ASK AI CHAT */}
      <div className="p-6 rounded-3xl bg-[#1c1815] border border-amber-500/30 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-amber-500/20 pb-3">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-bold text-amber-100 font-outfit">Ask AI Supervisor</h2>
          </div>
          <span className="text-[10px] text-neutral-400 font-mono">Truthful 5-Part Response Protocol</span>
        </div>

        {/* CHAT MESSAGES LOG */}
        <div className="space-y-4 max-h-96 overflow-y-auto custom-scrollbar p-2">
          {chatMessages.map((msg, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-2xl text-xs leading-relaxed space-y-2 font-sans ${
                msg.sender === 'user'
                  ? 'bg-amber-500/15 border border-amber-500/30 text-amber-100 ml-8'
                  : 'bg-[#12100e] border border-amber-500/20 text-neutral-200 mr-4'
              }`}
            >
              <div className="font-bold text-[10px] uppercase tracking-wider text-amber-400">
                {msg.sender === 'user' ? 'You' : 'AI Supervisor'}
              </div>
              <div className="whitespace-pre-wrap font-sans">{msg.text}</div>
            </div>
          ))}

          {isAsking && (
            <div className="p-3 rounded-xl bg-[#12100e] border border-amber-500/20 text-xs text-amber-400 flex items-center gap-2 animate-pulse">
              <div className="w-3 h-3 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
              <span>Analyzing cross-domain datasets...</span>
            </div>
          )}
        </div>

        {/* SAMPLE PRESET QUESTIONS */}
        <div className="pt-2 border-t border-amber-500/15">
          <div className="text-[10px] text-neutral-400 mb-1.5">Preset Questions:</div>
          <div className="flex flex-wrap gap-1.5 text-xs">
            {[
              'How am I doing this month?',
              'Where am I wasting time?',
              'Why did my expenses increase?',
              'Review my milestone pace'
            ].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => handleSendChat(undefined, preset)}
                className="px-2.5 py-1 rounded-lg bg-[#12100e] hover:bg-[#26201b] border border-amber-500/20 text-amber-200 text-[11px] transition"
              >
                ? {preset}
              </button>
            ))}
          </div>
        </div>

        {/* INPUT FORM */}
        <form onSubmit={handleSendChat} className="flex gap-2 pt-2">
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder="Ask AI Supervisor about your time, finance, or goals..."
            className="flex-1 bg-[#12100e] border border-amber-500/30 rounded-xl p-3 text-xs text-amber-100 placeholder-neutral-500 focus:outline-none focus:border-amber-500"
          />
          <button
            type="submit"
            disabled={!chatInput.trim() || isAsking}
            className="px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-neutral-950 font-bold text-xs shadow flex items-center gap-1.5 transition"
          >
            <Send className="w-4 h-4" /> Ask
          </button>
        </form>
      </div>
    </div>
  );
};
