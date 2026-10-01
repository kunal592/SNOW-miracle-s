import React, { useState, useMemo } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Target,
  BookOpen,
  Clock,
  AlertCircle,
  Sparkles,
  ArrowRight,
  TrendingUp,
  CheckCircle2,
  Calendar as CalendarIcon
} from 'lucide-react';
import { DailyProgress, DailyProgressStatus } from '../types';
import { Storage } from '../lib/storage';

interface DailyProgressCalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  onViewFullDay?: (date: string) => void;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const DailyProgressCalendarModal: React.FC<DailyProgressCalendarModalProps> = ({
  isOpen,
  onClose,
  onViewFullDay
}) => {
  const [history] = useState<DailyProgress[]>(() => Storage.getDailyProgress());

  // Default to September/October 2026
  const [currentYear, setCurrentYear] = useState<number>(2026);
  const [currentMonth, setCurrentMonth] = useState<number>(8); // 8 = September (where full data lives)

  // Default selected date: 2026-09-10 (matching specification example) or today (2026-10-01)
  const [selectedDate, setSelectedDate] = useState<string>('2026-09-10');

  // Month days calculation
  const daysInMonth = useMemo(() => {
    return new Date(currentYear, currentMonth + 1, 0).getDate();
  }, [currentYear, currentMonth]);

  const firstDayOfWeek = useMemo(() => {
    // 0 = Sunday, 1 = Monday. Shift so Monday = 0
    const day = new Date(currentYear, currentMonth, 1).getDay();
    return day === 0 ? 6 : day - 1;
  }, [currentYear, currentMonth]);

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handleJumpToday = () => {
    setCurrentYear(2026);
    setCurrentMonth(9); // October
    setSelectedDate('2026-10-01');
  };

  const selectedData = useMemo(() => {
    return history.find((d) => d.date === selectedDate);
  }, [history, selectedDate]);

  if (!isOpen) return null;

  // Formatted date string for display
  const formattedSelectedDate = new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  const formatMinutes = (mins?: number) => {
    if (!mins) return '0m';
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (h === 0) return `${m}m`;
    if (m === 0) return `${h}h`;
    return `${h}h ${m}m`;
  };

  const getStatusBadge = (status?: DailyProgressStatus) => {
    switch (status) {
      case 'excellent':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            Progress (High Focus)
          </span>
        );
      case 'good':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-300/90 border border-emerald-500/30 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500/70" />
            Progress (Consistent)
          </span>
        );
      case 'neutral':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            Neutral / Baseline
          </span>
        );
      case 'distracted':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-400" />
            Distracted
          </span>
        );
      case 'poor':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-950/60 text-rose-200 border border-rose-600/60 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            High Distraction
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-neutral-800 text-neutral-400 border border-neutral-700">
            No Activity Recorded
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-[#16120f] border border-amber-500/30 rounded-3xl shadow-2xl shadow-black/90 overflow-hidden">
        {/* MODAL HEADER */}
        <div className="px-6 py-4 border-b border-amber-500/20 bg-[#1a1512] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-br from-amber-500 via-orange-600 to-amber-700 text-neutral-950 font-black shadow-lg shadow-amber-950/50">
              <CalendarIcon className="w-5 h-5 text-neutral-950 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-black text-amber-100 font-outfit">
                Daily Progress & Focus History
              </h2>
              <p className="text-xs text-neutral-400">
                Objective daily execution timeline. What your days actually looked like.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-neutral-900/60 hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200 border border-neutral-700/50 transition cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* MODAL BODY */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* LEFT: CALENDAR GRID (7 cols on lg) */}
            <div className="lg:col-span-7 bg-[#1c1815] border border-amber-500/20 rounded-3xl p-4 sm:p-5 shadow-md flex flex-col justify-between">
              {/* Header: Month/Year navigation + Today */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <h3 className="text-base font-bold text-amber-100 font-outfit">
                    {MONTH_NAMES[currentMonth]} {currentYear}
                  </h3>
                  <button
                    onClick={handleJumpToday}
                    className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/20 transition cursor-pointer"
                  >
                    Today
                  </button>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={handlePrevMonth}
                    className="p-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-800 transition cursor-pointer"
                    aria-label="Previous month"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleNextMonth}
                    className="p-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-800 transition cursor-pointer"
                    aria-label="Next month"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Day of Week Headers (Monday to Sunday) */}
              <div className="grid grid-cols-7 gap-1.5 text-center mb-2">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                  <div key={day} className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider py-1">
                    {day}
                  </div>
                ))}
              </div>

              {/* Day Grid Matrix */}
              <div className="grid grid-cols-7 gap-1.5">
                {/* Empty cells before 1st of month */}
                {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                  <div key={`empty-${i}`} className="aspect-square rounded-2xl bg-[#14100e]/30 border border-neutral-900/30 opacity-20" />
                ))}

                {/* Month Days */}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const dayNum = i + 1;
                  const mStr = String(currentMonth + 1).padStart(2, '0');
                  const dStr = String(dayNum).padStart(2, '0');
                  const dateStr = `${currentYear}-${mStr}-${dStr}`;

                  const entry = history.find((d) => d.date === dateStr);
                  const isSelected = selectedDate === dateStr;
                  const isToday = dateStr === '2026-10-01';

                  // Multi-level status styles
                  let cellStyle = 'bg-[#14100e] border-neutral-800/80 text-neutral-400 hover:border-amber-500/40';
                  let dotColor = null;

                  if (entry?.status === 'excellent') {
                    cellStyle = 'bg-emerald-950/60 border-emerald-500/60 text-emerald-200 hover:bg-emerald-900/60 shadow-[0_0_8px_rgba(16,185,129,0.15)]';
                    dotColor = 'bg-emerald-400';
                  } else if (entry?.status === 'good') {
                    cellStyle = 'bg-emerald-950/35 border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/45';
                    dotColor = 'bg-emerald-500/80';
                  } else if (entry?.status === 'neutral') {
                    cellStyle = 'bg-amber-950/20 border-amber-500/30 text-amber-200 hover:bg-amber-900/30';
                    dotColor = 'bg-amber-400';
                  } else if (entry?.status === 'distracted') {
                    cellStyle = 'bg-rose-950/40 border-rose-500/40 text-rose-200 hover:bg-rose-900/50 shadow-[0_0_8px_rgba(244,63,94,0.15)]';
                    dotColor = 'bg-rose-400';
                  } else if (entry?.status === 'poor') {
                    cellStyle = 'bg-rose-950/70 border-rose-500/70 text-rose-100 hover:bg-rose-900/70 shadow-[0_0_10px_rgba(225,29,72,0.25)]';
                    dotColor = 'bg-rose-500';
                  }

                  return (
                    <button
                      key={dateStr}
                      onClick={() => setSelectedDate(dateStr)}
                      className={`aspect-square rounded-2xl border p-1.5 flex flex-col justify-between items-center transition relative cursor-pointer ${cellStyle} ${
                        isSelected
                          ? 'ring-2 ring-amber-400 ring-offset-2 ring-offset-[#1c1815] font-black scale-105 z-10'
                          : ''
                      } ${isToday ? 'border-amber-400/90 font-bold' : ''}`}
                    >
                      <div className="w-full flex items-center justify-between text-[11px] font-bold">
                        <span>{dayNum}</span>
                        {dotColor && <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />}
                      </div>

                      {entry?.progressScore !== undefined && (
                        <div className="text-[9px] font-mono opacity-80">
                          {entry.progressScore}%
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* SPECIFICATION LEGEND */}
              <div className="mt-5 pt-3 border-t border-amber-500/15 flex flex-wrap items-center justify-between text-[11px] text-neutral-400 gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-emerald-500/40 border border-emerald-500" />
                  <span>🟩 Progress</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-amber-500/30 border border-amber-500" />
                  <span>🟨 Neutral</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-rose-500/40 border border-rose-500" />
                  <span>🟥 Distracted</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-[#14100e] border border-neutral-800" />
                  <span>⬜ No data</span>
                </div>
              </div>
            </div>

            {/* RIGHT: SELECTED DATE DETAILS (5 cols on lg) */}
            <div className="lg:col-span-5 bg-[#1c1815] border border-amber-500/20 rounded-3xl p-5 shadow-md flex flex-col justify-between space-y-4">
              <div className="space-y-4">
                {/* DATE & OVERALL STATUS */}
                <div className="pb-3 border-b border-amber-500/15 space-y-1">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-amber-400/80">
                    Selected Day Timeline
                  </div>
                  <h3 className="text-base md:text-lg font-bold text-amber-100 font-outfit">
                    {formattedSelectedDate}
                  </h3>
                  <div className="pt-1">
                    {getStatusBadge(selectedData?.status)}
                  </div>
                </div>

                {/* PROGRESS SUMMARY */}
                <div className="space-y-2">
                  <div className="text-[11px] font-bold text-amber-200 uppercase tracking-wider flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-amber-400" /> Progress Summary
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-[#14100e] border border-neutral-800/80">
                      <div className="text-[10px] text-neutral-400 font-medium">Goals</div>
                      <div className="font-bold text-neutral-200 mt-0.5">
                        {selectedData?.goalsCompleted !== undefined && selectedData?.goalsTotal !== undefined
                          ? `${selectedData.goalsCompleted}/${selectedData.goalsTotal} completed`
                          : '—'}
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-[#14100e] border border-neutral-800/80">
                      <div className="text-[10px] text-neutral-400 font-medium">Learning Time</div>
                      <div className="font-bold text-amber-300 mt-0.5">
                        {selectedData?.learningMinutes ? formatMinutes(selectedData.learningMinutes) : '—'}
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-[#14100e] border border-neutral-800/80">
                      <div className="text-[10px] text-neutral-400 font-medium">Focus / Productive</div>
                      <div className="font-bold text-emerald-300 mt-0.5">
                        {selectedData?.focusMinutes ? formatMinutes(selectedData.focusMinutes) : '—'}
                        {selectedData?.progressScore !== undefined && (
                          <span className="text-[10px] text-neutral-400 font-normal ml-1">
                            ({selectedData.progressScore}%)
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-[#14100e] border border-neutral-800/80">
                      <div className="text-[10px] text-neutral-400 font-medium">Distraction</div>
                      <div className="font-bold text-rose-300 mt-0.5">
                        {selectedData?.distractionMinutes ? formatMinutes(selectedData.distractionMinutes) : '0m'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* IMPORTANT ACTIVITIES */}
                {selectedData?.importantActivities && selectedData.importantActivities.length > 0 && (
                  <div className="space-y-1.5">
                    <div className="text-[11px] font-bold text-neutral-300 uppercase tracking-wider">
                      Important Activities
                    </div>
                    <ul className="space-y-1">
                      {selectedData.importantActivities.map((act, idx) => (
                        <li key={idx} className="text-xs text-neutral-300 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                          <span>{act}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* DISTRACTIONS LIST */}
                {selectedData?.distractions && selectedData.distractions.length > 0 && (
                  <div className="space-y-1.5">
                    <div className="text-[11px] font-bold text-rose-300 uppercase tracking-wider flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 text-rose-400" /> Distraction Events
                    </div>
                    <div className="space-y-1.5">
                      {selectedData.distractions.map((dis, idx) => (
                        <div key={idx} className="p-2 rounded-xl bg-rose-950/20 border border-rose-500/20 text-xs">
                          <div className="flex items-center justify-between font-semibold text-rose-200">
                            <span>{dis.source}</span>
                            <span className="text-rose-400 font-mono">{formatMinutes(dis.minutes)}</span>
                          </div>
                          {dis.reason && (
                            <div className="text-[11px] text-neutral-400 mt-0.5 italic">
                              "{dis.reason}"
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* REASON / REFLECTION */}
                {selectedData?.reflection && (
                  <div className="p-3 rounded-2xl bg-[#14100e] border border-amber-500/15 space-y-1">
                    <div className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                      Reason / Reflection
                    </div>
                    <p className="text-xs text-neutral-300 italic leading-relaxed">
                      "{selectedData.reflection}"
                    </p>
                  </div>
                )}

                {!selectedData && (
                  <div className="p-4 rounded-2xl bg-[#14100e] border border-neutral-800 text-center text-xs text-neutral-500">
                    No timeline data recorded for this day. Activity will automatically log here as you use the Personal OS.
                  </div>
                )}
              </div>

              {/* VIEW FULL DAY ACTION */}
              <div className="pt-3 border-t border-amber-500/15">
                <button
                  type="button"
                  onClick={() => {
                    if (onViewFullDay) {
                      onViewFullDay(selectedDate);
                      onClose();
                    }
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-orange-600 to-amber-600 hover:brightness-110 text-neutral-950 font-bold text-xs shadow-lg shadow-amber-950/60 flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <span>View Full Day</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
