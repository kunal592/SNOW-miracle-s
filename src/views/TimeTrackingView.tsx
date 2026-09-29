import React, { useState, useEffect } from 'react';
import { Clock, Play, Square, Plus, CheckCircle2, Flame, Award, BrainCircuit } from 'lucide-react';
import { TimeEntry } from '../types';
import { formatMinutes } from '../lib/calculations';

interface TimeTrackingViewProps {
  timeEntries: TimeEntry[];
  onAddTimeEntry: (entry: TimeEntry) => void;
}

export const TimeTrackingView: React.FC<TimeTrackingViewProps> = ({
  timeEntries,
  onAddTimeEntry
}) => {
  // Live Timer State
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerActivity, setTimerActivity] = useState('AI Learning & PyTorch');
  const [timerCategory, setTimerCategory] = useState<'Learning' | 'Work' | 'Health' | 'Personal'>('Learning');

  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    } else if (!isTimerRunning && timerSeconds !== 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerSeconds]);

  const handleStartTimer = () => {
    setIsTimerRunning(true);
  };

  const handleStopTimer = () => {
    setIsTimerRunning(false);
    const mins = Math.max(1, Math.round(timerSeconds / 60));

    const newEntry: TimeEntry = {
      id: 'time_' + Math.random().toString(36).substring(2, 9),
      date: new Date().toISOString().split('T')[0],
      startTime: new Date(Date.now() - timerSeconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      endTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      durationMinutes: mins,
      activity: timerActivity,
      category: timerCategory,
      isDeepWork: timerCategory === 'Work' || timerCategory === 'Learning'
    };

    onAddTimeEntry(newEntry);
    setTimerSeconds(0);
  };

  const formatTime = (secs: number) => {
    const hrs = Math.floor(secs / 3600);
    const mins = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Timeline list for today
  const todayEntries = timeEntries.filter((t) => t.date === '2026-09-29');

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-amber-100 font-outfit flex items-center gap-2">
            <Clock className="w-6 h-6 text-amber-400" /> Time & Deep Work Tracker
          </h1>
          <p className="text-xs text-amber-200/80">Track deep work sessions, learning blocks, and screen time.</p>
        </div>
      </div>

      {/* LIVE TIMER WIDGET */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-[#26201b] via-[#1c1815] to-[#12100e] border border-amber-500/30 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
            <BrainCircuit className="w-4 h-4" /> Live Timer Engine
          </span>
          {isTimerRunning && (
            <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-xs font-bold border border-rose-500/40 animate-pulse">
              ● Recording Active
            </span>
          )}
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2 flex-1">
            <input
              type="text"
              value={timerActivity}
              onChange={(e) => setTimerActivity(e.target.value)}
              placeholder="What are you focusing on?"
              disabled={isTimerRunning}
              className="w-full bg-[#12100e] border border-amber-500/30 rounded-xl p-3 text-sm text-amber-100 placeholder-neutral-500 focus:outline-none focus:border-amber-500"
            />
            <div className="flex gap-2">
              {(['Learning', 'Work', 'Health', 'Personal'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setTimerCategory(cat)}
                  disabled={isTimerRunning}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                    timerCategory === cat ? 'bg-amber-500/25 text-amber-200 border border-amber-500/40' : 'bg-[#12100e] text-neutral-400'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <div className="font-mono text-3xl font-black text-amber-200 tracking-wider">
              {formatTime(timerSeconds)}
            </div>

            {isTimerRunning ? (
              <button
                onClick={handleStopTimer}
                className="px-6 py-3 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg flex items-center gap-2 transition active:scale-95"
              >
                <Square className="w-4 h-4 fill-white" /> STOP & LOG
              </button>
            ) : (
              <button
                onClick={handleStartTimer}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-neutral-950 font-extrabold text-xs shadow-lg shadow-amber-950/60 flex items-center gap-2 transition active:scale-95"
              >
                <Play className="w-4 h-4 fill-neutral-950" /> START TIMER
              </button>
            )}
          </div>
        </div>
      </div>

      {/* TODAY'S TIMELINE LOG */}
      <div className="p-5 rounded-3xl bg-[#1c1815] border border-amber-500/20 space-y-4">
        <h2 className="text-base font-bold text-amber-100 font-outfit">Today's Timeline Schedule</h2>

        <div className="space-y-3 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-amber-500/20">
          {todayEntries.map((entry) => (
            <div key={entry.id} className="relative pl-8 flex items-center justify-between p-3 rounded-2xl bg-[#12100e] border border-amber-500/15">
              <div className="absolute left-1.5 w-3 h-3 rounded-full bg-amber-500 border-2 border-[#16120f]" />
              <div>
                <div className="text-xs font-bold text-amber-100">{entry.activity}</div>
                <div className="text-[10px] text-neutral-400 mt-0.5">
                  {entry.startTime} – {entry.endTime} ({formatMinutes(entry.durationMinutes)})
                </div>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                {entry.category}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
