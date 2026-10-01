import React, { useState, useMemo } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Flame,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  Sparkles,
  TrendingUp,
  Clock,
  Tag,
  Save,
  RotateCcw
} from 'lucide-react';
import { ArcCalendarDay, ArcDayProgressStatus } from '../types';
import { Storage } from '../lib/storage';

interface ArcCalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const QUICK_REASONS = {
  progress: [
    'Deep work 4h+ completed',
    'Zero social media doomscrolling',
    'Hit gym & clean nutrition',
    'Woke at 5:30 AM monk mode',
    'Crushed critical milestone',
    'Focused learning session'
  ],
  distracted: [
    'Lost 2h+ scrolling Instagram / YouTube',
    'Procrastinated & skipped work block',
    'Sleep deprived & low energy',
    'Impulse spending & junk food',
    'Discord & chat context switching',
    'Late night binge watching'
  ]
};

export const ArcCalendarModal: React.FC<ArcCalendarModalProps> = ({
  isOpen,
  onClose,
  onShowToast
}) => {
  const [calendarDays, setCalendarDays] = useState<ArcCalendarDay[]>(() =>
    Storage.getArcCalendar()
  );

  // Default month: October 2026 (or September 2026)
  const [currentYear, setCurrentYear] = useState<number>(2026);
  const [currentMonth, setCurrentMonth] = useState<number>(9); // 0-indexed: 9 = October

  // Selected date for details inspector (default to today: 2026-10-01)
  const [selectedDate, setSelectedDate] = useState<string>('2026-10-01');

  // Interactive edit form state
  const [editStatus, setEditStatus] = useState<ArcDayProgressStatus>('progress');
  const [editReason, setEditReason] = useState<string>('');
  const [editHours, setEditHours] = useState<number>(4);

  // Sync edit fields whenever selectedDate changes
  React.useEffect(() => {
    const existing = calendarDays.find((d) => d.date === selectedDate);
    if (existing) {
      setEditStatus(existing.status);
      setEditReason(existing.reason || '');
      setEditHours(existing.deepWorkHours || 0);
    } else {
      setEditStatus('progress');
      setEditReason('');
      setEditHours(4);
    }
  }, [selectedDate, calendarDays]);

  // Calendar calculations
  const daysInMonth = useMemo(() => {
    return new Date(currentYear, currentMonth + 1, 0).getDate();
  }, [currentYear, currentMonth]);

  const firstDayOfWeek = useMemo(() => {
    // 0 = Sunday, 1 = Monday, etc. Adjust so Monday is 0
    const day = new Date(currentYear, currentMonth, 1).getDay();
    return day === 0 ? 6 : day - 1;
  }, [currentYear, currentMonth]);

  // Overall Statistics
  const stats = useMemo(() => {
    const progressCount = calendarDays.filter((d) => d.status === 'progress').length;
    const distractedCount = calendarDays.filter((d) => d.status === 'distracted').length;
    const totalTracked = progressCount + distractedCount;
    const disciplineRate = totalTracked > 0 ? Math.round((progressCount / totalTracked) * 100) : 0;

    // Calculate streak
    const sorted = [...calendarDays]
      .filter((d) => d.status === 'progress' || d.status === 'distracted')
      .sort((a, b) => b.date.localeCompare(a.date));

    let currentStreak = 0;
    for (const d of sorted) {
      if (d.status === 'progress') {
        currentStreak++;
      } else {
        break;
      }
    }

    return { progressCount, distractedCount, disciplineRate, currentStreak };
  }, [calendarDays]);

  if (!isOpen) return null;

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

  const handleSelectDay = (dayNum: number) => {
    const mStr = String(currentMonth + 1).padStart(2, '0');
    const dStr = String(dayNum).padStart(2, '0');
    const dateStr = `${currentYear}-${mStr}-${dStr}`;
    setSelectedDate(dateStr);
  };

  const handleSaveDayLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editReason.trim()) {
      onShowToast('Please provide a reason or note for this day', 'error');
      return;
    }

    const updatedDay: ArcCalendarDay = {
      date: selectedDate,
      status: editStatus,
      reason: editReason.trim(),
      deepWorkHours: editStatus === 'progress' ? Number(editHours) : 0,
      tags: editStatus === 'progress' ? ['Deep Work', 'Disciplined'] : ['Distracted', 'Lapse']
    };

    const updatedList = Storage.saveArcCalendarDay(updatedDay);
    setCalendarDays(updatedList);
    onShowToast(`Day updated: Marked as ${editStatus.toUpperCase()}`, 'success');
  };

  const selectedDayData = calendarDays.find((d) => d.date === selectedDate);

  // Format formatted date for header
  const formattedSelectedDate = new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-[#16120f] border border-amber-500/30 rounded-3xl shadow-2xl shadow-black/90 overflow-hidden">
        {/* MODAL HEADER */}
        <div className="px-6 py-4 border-b border-amber-500/20 bg-[#1a1512] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-br from-amber-500 via-orange-600 to-amber-700 text-neutral-950 font-black shadow-lg shadow-amber-950/50">
              <Calendar className="w-5 h-5 text-neutral-950 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg md:text-xl font-black text-amber-100 font-outfit">
                  Winter Arc Calendar & Focus Log
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Daily Execution Tracker
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Visual block calendar: <span className="text-emerald-400 font-semibold">Green blocks</span> for disciplined progress, <span className="text-rose-400 font-semibold">Red blocks</span> for distracted lapses with documented reasons.
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

        {/* MODAL BODY (SCROLLABLE) */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
          {/* STATS OVERVIEW CARDS */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-2xl bg-[#1c1815] border border-emerald-500/30 shadow-sm flex items-center gap-3">
              <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Progress Days</div>
                <div className="text-xl font-black text-emerald-300">{stats.progressCount} <span className="text-xs font-normal text-emerald-500">Days Green</span></div>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#1c1815] border border-rose-500/30 shadow-sm flex items-center gap-3">
              <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Distracted Days</div>
                <div className="text-xl font-black text-rose-300">{stats.distractedCount} <span className="text-xs font-normal text-rose-500">Days Red</span></div>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#1c1815] border border-amber-500/30 shadow-sm flex items-center gap-3">
              <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Discipline Rate</div>
                <div className="text-xl font-black text-amber-300">{stats.disciplineRate}% <span className="text-xs font-normal text-amber-500">Adherence</span></div>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#1c1815] border border-orange-500/30 shadow-sm flex items-center gap-3">
              <div className="p-2 rounded-xl bg-orange-500/20 text-orange-400">
                <Flame className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Active Streak</div>
                <div className="text-xl font-black text-orange-300">{stats.currentStreak} <span className="text-xs font-normal text-orange-500">Days In Zone</span></div>
              </div>
            </div>
          </div>

          {/* MAIN CALENDAR GRID & INSPECTOR SPLIT */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* LEFT / TOP: CALENDAR GRID (7 cols on lg) */}
            <div className="lg:col-span-7 bg-[#1c1815] border border-amber-500/20 rounded-3xl p-4 sm:p-5 shadow-md flex flex-col justify-between">
              {/* Month Navigation */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-amber-100 font-outfit">
                    {MONTH_NAMES[currentMonth]} {currentYear}
                  </h3>
                  <button
                    onClick={() => {
                      setCurrentMonth(9); // Oct
                      setCurrentYear(2026);
                      setSelectedDate('2026-10-01');
                    }}
                    className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/20 transition"
                  >
                    Today
                  </button>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={handlePrevMonth}
                    className="p-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-800 transition"
                    title="Previous month"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleNextMonth}
                    className="p-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-800 transition"
                    title="Next month"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Day of Week Headers */}
              <div className="grid grid-cols-7 gap-1.5 text-center mb-2">
                {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, idx) => (
                  <div key={idx} className="text-[11px] font-bold text-neutral-500 py-1">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Days Matrix */}
              <div className="grid grid-cols-7 gap-1.5">
                {/* Empty cells before start of month */}
                {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                  <div key={`empty-${i}`} className="aspect-square rounded-xl bg-[#14100e]/40 border border-neutral-900/40 opacity-30" />
                ))}

                {/* Actual Month Days */}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const dayNum = i + 1;
                  const mStr = String(currentMonth + 1).padStart(2, '0');
                  const dStr = String(dayNum).padStart(2, '0');
                  const dateStr = `${currentYear}-${mStr}-${dStr}`;

                  const entry = calendarDays.find((d) => d.date === dateStr);
                  const isSelected = selectedDate === dateStr;
                  const isToday = dateStr === '2026-10-01';

                  // Dynamic block styling based on Progress vs Distracted
                  let blockStyle = 'bg-[#14100e] border-neutral-800/80 text-neutral-400 hover:border-amber-500/40';
                  let statusBadge = null;

                  if (entry?.status === 'progress') {
                    blockStyle = 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200 hover:bg-emerald-900/50 shadow-[0_0_8px_rgba(16,185,129,0.15)]';
                    statusBadge = (
                      <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.9)]" />
                    );
                  } else if (entry?.status === 'distracted') {
                    blockStyle = 'bg-rose-950/40 border-rose-500/50 text-rose-200 hover:bg-rose-900/50 shadow-[0_0_8px_rgba(244,63,94,0.15)]';
                    statusBadge = (
                      <span className="w-2 h-2 rounded-full bg-rose-400 shadow-[0_0_6px_rgba(251,113,133,0.9)]" />
                    );
                  } else if (entry?.status === 'rest') {
                    blockStyle = 'bg-purple-950/30 border-purple-500/40 text-purple-200';
                    statusBadge = <span className="w-2 h-2 rounded-full bg-purple-400" />;
                  }

                  return (
                    <button
                      key={dateStr}
                      onClick={() => handleSelectDay(dayNum)}
                      className={`aspect-square rounded-2xl border p-1 sm:p-1.5 flex flex-col justify-between items-center transition relative cursor-pointer ${blockStyle} ${
                        isSelected
                          ? 'ring-2 ring-amber-400 ring-offset-2 ring-offset-[#1c1815] font-black scale-105 z-10'
                          : ''
                      } ${isToday ? 'border-amber-400/80 font-bold' : ''}`}
                    >
                      <div className="w-full flex items-center justify-between text-[11px] font-bold">
                        <span>{dayNum}</span>
                        {statusBadge}
                      </div>

                      {/* Small text label if screen allows */}
                      <div className="text-[9px] font-semibold truncate max-w-full">
                        {entry?.status === 'progress' && <span className="text-emerald-400 text-[8px] uppercase">Prog</span>}
                        {entry?.status === 'distracted' && <span className="text-rose-400 text-[8px] uppercase">Distr</span>}
                        {isToday && !entry && <span className="text-amber-400 text-[8px]">Today</span>}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Calendar Legend */}
              <div className="mt-4 pt-3 border-t border-amber-500/10 flex flex-wrap items-center justify-between text-[11px] text-neutral-400 gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-emerald-500/40 border border-emerald-500" />
                  <span>Progress (Green)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-rose-500/40 border border-rose-500" />
                  <span>Distracted (Red)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-[#14100e] border border-neutral-800" />
                  <span>Unlogged / Future</span>
                </div>
              </div>
            </div>

            {/* RIGHT: INSPECTOR & REASON LOG VIEW (5 cols on lg) */}
            <div className="lg:col-span-5 bg-[#1c1815] border border-amber-500/20 rounded-3xl p-5 shadow-md flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-amber-500/15">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                      Date Details & Reason
                    </div>
                    <h3 className="text-sm md:text-base font-bold text-amber-100 font-outfit">
                      {formattedSelectedDate}
                    </h3>
                  </div>

                  {selectedDayData?.status === 'progress' && (
                    <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold text-xs flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Progress
                    </span>
                  )}
                  {selectedDayData?.status === 'distracted' && (
                    <span className="px-2.5 py-1 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 font-bold text-xs flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-400" /> Distracted
                    </span>
                  )}
                  {(!selectedDayData || selectedDayData.status === 'upcoming') && (
                    <span className="px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-400 text-xs font-semibold">
                      Unlogged
                    </span>
                  )}
                </div>

                {/* CURRENT DOCUMENTED REASON CARD */}
                <div className="mt-3 p-3.5 rounded-2xl bg-[#14100e] border border-neutral-800/80 space-y-2">
                  <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3 text-amber-400" /> Documented Reason & Reflection
                  </div>

                  <p className="text-xs text-neutral-200 leading-relaxed min-h-[44px]">
                    {selectedDayData?.reason || 'No specific reason logged yet for this date. Choose a status below and document what happened.'}
                  </p>

                  {selectedDayData && (
                    <div className="flex items-center gap-3 pt-1 text-[11px] text-neutral-400">
                      {selectedDayData.deepWorkHours !== undefined && (
                        <span className="flex items-center gap-1 text-amber-300 font-medium">
                          <Clock className="w-3 h-3 text-amber-400" /> {selectedDayData.deepWorkHours}h Deep Work
                        </span>
                      )}
                      {selectedDayData.tags && selectedDayData.tags.length > 0 && (
                        <div className="flex items-center gap-1 flex-wrap">
                          {selectedDayData.tags.map((t, idx) => (
                            <span key={idx} className="px-1.5 py-0.5 rounded bg-neutral-900 text-neutral-400 text-[10px] border border-neutral-800">
                              #{t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* INTERACTIVE FORM TO EDIT / LOG REASON */}
              <form onSubmit={handleSaveDayLog} className="space-y-3 pt-3 border-t border-amber-500/15">
                <div className="text-[11px] font-bold text-amber-300">
                  Update or Log Status for This Day:
                </div>

                {/* STATUS TOGGLE */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setEditStatus('progress')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                      editStatus === 'progress'
                        ? 'bg-emerald-500/25 border-emerald-500 text-emerald-200 shadow-md shadow-emerald-950/50'
                        : 'bg-[#14100e] border-neutral-800 text-neutral-400 hover:text-neutral-200'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Progress (Green)
                  </button>

                  <button
                    type="button"
                    onClick={() => setEditStatus('distracted')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                      editStatus === 'distracted'
                        ? 'bg-rose-500/25 border-rose-500 text-rose-200 shadow-md shadow-rose-950/50'
                        : 'bg-[#14100e] border-neutral-800 text-neutral-400 hover:text-neutral-200'
                    }`}
                  >
                    <AlertTriangle className="w-4 h-4 text-rose-400" /> Distracted (Red)
                  </button>
                </div>

                {/* QUICK PRESET CHIPS */}
                <div className="space-y-1">
                  <div className="text-[10px] text-neutral-400">Quick Reason Presets:</div>
                  <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto">
                    {QUICK_REASONS[editStatus === 'progress' ? 'progress' : 'distracted'].map((reason, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setEditReason(reason)}
                        className="text-[10px] px-2 py-1 rounded-lg bg-[#14100e] hover:bg-neutral-800 border border-neutral-800 hover:border-amber-500/30 text-neutral-300 transition text-left cursor-pointer"
                      >
                        {reason}
                      </button>
                    ))}
                  </div>
                </div>

                {/* CUSTOM REASON TEXTAREA */}
                <div>
                  <textarea
                    value={editReason}
                    onChange={(e) => setEditReason(e.target.value)}
                    rows={2}
                    placeholder={`Explain why this day was marked as ${editStatus}... (e.g. key accomplishments, distractions, habits)`}
                    className="w-full bg-[#12100e] border border-amber-500/30 rounded-xl p-2.5 text-xs text-amber-100 placeholder-neutral-500 focus:outline-none focus:border-amber-400 resize-none"
                  />
                </div>

                {/* DEEP WORK HOURS (IF PROGRESS) */}
                {editStatus === 'progress' && (
                  <div className="flex items-center justify-between text-xs">
                    <label className="text-neutral-300 font-medium">Deep Work Hours Logged:</label>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      max="16"
                      value={editHours}
                      onChange={(e) => setEditHours(Number(e.target.value))}
                      className="w-20 bg-[#12100e] border border-amber-500/30 rounded-lg p-1 text-center text-amber-200 font-bold"
                    />
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-600 to-amber-600 text-neutral-950 font-bold text-xs shadow-lg shadow-amber-950/60 flex items-center justify-center gap-2 hover:brightness-110 active:scale-[0.99] transition cursor-pointer"
                >
                  <Save className="w-4 h-4" /> Save Reason & Status
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
