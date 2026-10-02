import React, { useState, useEffect, useCallback, useRef } from 'react';
import { X, Clock, TrendingUp } from 'lucide-react';
import { TrackedApp, AppUsageSession } from '../types';
import { Storage } from '../lib/storage';

// ─── Default Tracked Apps ──────────────────────────────────────────────────────

const DEFAULT_APPS: TrackedApp[] = [
  { id: 'app_instagram', name: 'Instagram', slug: 'instagram', icon: '📸', category: 'social', color: '#e1306c' },
  { id: 'app_youtube', name: 'YouTube', slug: 'youtube', icon: '▶', category: 'video', color: '#ff0000' },
  { id: 'app_linkedin', name: 'LinkedIn', slug: 'linkedin', icon: 'in', category: 'professional', color: '#0077b5' },
  { id: 'app_groww', name: 'Groww', slug: 'groww', icon: '📈', category: 'finance', color: '#00d09c' },
  { id: 'app_chrome', name: 'Chrome', slug: 'chrome', icon: '🌐', category: 'browser', color: '#4285f4' },
];

// ─── Utility helpers ───────────────────────────────────────────────────────────

function todayDate(): string {
  return new Date().toISOString().split('T')[0];
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const h = Math.floor(m / 60);
  if (h > 0) return `${h}h ${m % 60}m`;
  return `${m}m`;
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false });
}

function getDailyTotal(sessions: AppUsageSession[], appId: string, date: string): number {
  return sessions
    .filter((s) => s.appId === appId && s.date === date && s.status === 'completed' && s.durationSeconds != null)
    .reduce((acc, s) => acc + (s.durationSeconds ?? 0), 0);
}

function getSessionsForDay(sessions: AppUsageSession[], appId: string, date: string): AppUsageSession[] {
  return sessions
    .filter((s) => s.appId === appId && s.date === date && s.status === 'completed')
    .sort((a, b) => a.startedAt.localeCompare(b.startedAt));
}

// ─── Single App Icon Button ────────────────────────────────────────────────────

interface AppIconButtonProps {
  app: TrackedApp;
  isActive: boolean;
  elapsedSeconds: number;
  dailyTotalSeconds: number;
  onClick: () => void;
  onLongPress: () => void;
}

const AppIconButton: React.FC<AppIconButtonProps> = ({
  app,
  isActive,
  elapsedSeconds,
  dailyTotalSeconds,
  onClick,
  onLongPress,
}) => {
  const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const didLongPress = useRef(false);

  const startHold = () => {
    didLongPress.current = false;
    holdTimer.current = setTimeout(() => {
      didLongPress.current = true;
      onLongPress();
    }, 500);
  };

  const endHold = () => {
    if (holdTimer.current) {
      clearTimeout(holdTimer.current);
      holdTimer.current = null;
    }
  };

  const handleClick = () => {
    if (!didLongPress.current) onClick();
  };

  return (
    <button
      onClick={handleClick}
      onMouseDown={startHold}
      onMouseUp={endHold}
      onMouseLeave={endHold}
      onTouchStart={startHold}
      onTouchEnd={endHold}
      title={`${app.name}${isActive ? ' — Tracking active' : dailyTotalSeconds > 0 ? ` — ${formatDuration(dailyTotalSeconds)} today` : ' — Tap to track'}`}
      className="relative flex flex-col items-center gap-0.5 group select-none"
    >
      {/* Icon circle */}
      <div
        className="w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold transition-all duration-200 border relative overflow-hidden"
        style={{
          background: isActive
            ? `linear-gradient(135deg, ${app.color}44, ${app.color}22)`
            : 'rgba(255,255,255,0.05)',
          borderColor: isActive ? `${app.color}cc` : 'transparent',
          boxShadow: isActive ? `0 0 10px ${app.color}66` : undefined,
          transform: isActive ? 'scale(1.08)' : undefined,
        }}
      >
        {isActive && (
          <span
            className="absolute inset-0 rounded-xl animate-ping opacity-20"
            style={{ background: app.color }}
          />
        )}
        <span className="relative z-10 text-[13px] leading-none">{app.icon}</span>
      </div>

      {/* Timer or total display */}
      <span
        className="text-[8px] font-mono leading-none h-3 transition-colors"
        style={{ color: isActive ? '#fbbf24' : '#6b7280' }}
      >
        {isActive
          ? formatDuration(elapsedSeconds)
          : dailyTotalSeconds > 0
          ? formatDuration(dailyTotalSeconds)
          : ''}
      </span>
    </button>
  );
};

// ─── Usage Detail Sheet ────────────────────────────────────────────────────────

interface UsageDetailSheetProps {
  app: TrackedApp;
  sessions: AppUsageSession[];
  isActive: boolean;
  elapsedSeconds: number;
  onClose: () => void;
}

const UsageDetailSheet: React.FC<UsageDetailSheetProps> = ({
  app,
  sessions,
  isActive,
  elapsedSeconds,
  onClose,
}) => {
  const today = todayDate();
  const todaySessions = getSessionsForDay(sessions, app.id, today);
  const dailyTotal = getDailyTotal(sessions, app.id, today);
  const allCompleted = sessions.filter((s) => s.appId === app.id && s.status === 'completed');
  const allTimeTotal = allCompleted.reduce((acc, s) => acc + (s.durationSeconds ?? 0), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative w-full max-w-xs rounded-2xl bg-[#1c1815] border shadow-2xl overflow-hidden"
        style={{ borderColor: `${app.color}44` }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-xl border"
              style={{ borderColor: `${app.color}66`, background: `${app.color}22` }}
            >
              {app.icon}
            </div>
            <div>
              <h3 className="text-sm font-bold text-amber-100">{app.name}</h3>
              <p className="text-[10px] text-neutral-400 capitalize">{app.category}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 text-neutral-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Active timer */}
        {isActive && (
          <div className="mx-4 mt-3 p-3 rounded-xl border border-amber-500/30 bg-amber-500/10 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-xs font-semibold text-amber-300">Tracking active</span>
            <span className="ml-auto font-mono text-xs text-amber-200 font-bold">
              {formatDuration(elapsedSeconds)}
            </span>
          </div>
        )}

        {/* Today stats */}
        <div className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-3.5 h-3.5 text-neutral-400" />
            <span className="text-[10px] font-bold text-neutral-400 tracking-wider uppercase">Today</span>
            {dailyTotal > 0 && (
              <span
                className="ml-auto text-xs font-bold px-2 py-0.5 rounded-full"
                style={{ background: `${app.color}22`, color: app.color }}
              >
                {formatDuration(dailyTotal)} total
              </span>
            )}
          </div>

          {todaySessions.length === 0 && !isActive ? (
            <p className="text-xs text-neutral-500 text-center py-4">No sessions today yet.</p>
          ) : (
            <div className="space-y-2 max-h-36 overflow-y-auto custom-scrollbar">
              {todaySessions.map((session) => (
                <div
                  key={session.id}
                  className="flex items-center gap-2 text-xs text-neutral-300 py-1 border-b border-white/5 last:border-0"
                >
                  <span className="text-neutral-500 font-mono text-[10px]">
                    {formatTime(session.startedAt)} → {session.endedAt ? formatTime(session.endedAt) : '—'}
                  </span>
                  <span className="ml-auto font-medium text-neutral-200">
                    {session.durationSeconds != null ? formatDuration(session.durationSeconds) : '—'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* All-time stats */}
        {allCompleted.length > 0 && (
          <div className="px-4 pb-4 pt-0">
            <div className="p-2.5 rounded-xl bg-white/5 flex items-center gap-3">
              <TrendingUp className="w-3.5 h-3.5 text-neutral-400" />
              <div>
                <p className="text-[10px] text-neutral-500 uppercase tracking-wide">All time</p>
                <p className="text-xs font-bold text-neutral-200">
                  {formatDuration(allTimeTotal)}{' '}
                  <span className="text-neutral-500 font-normal">across {allCompleted.length} sessions</span>
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Main AppUsageTracker Component ───────────────────────────────────────────

interface AppUsageTrackerProps {
  onShowToast: (text: string, type?: 'success' | 'error' | 'info') => void;
}

export const AppUsageTracker: React.FC<AppUsageTrackerProps> = ({ onShowToast }) => {
  const [sessions, setSessions] = useState<AppUsageSession[]>(() =>
    Storage.getAppUsageSessions()
  );

  const [activeSessions, setActiveSessions] = useState<Record<string, string>>(() => {
    const stored = Storage.getAppUsageSessions();
    const active: Record<string, string> = {};
    stored.forEach((s) => {
      if (s.status === 'active') {
        active[s.appId] = s.id;
      }
    });
    return active;
  });

  const [elapsedTimes, setElapsedTimes] = useState<Record<string, number>>({});
  const [selectedApp, setSelectedApp] = useState<TrackedApp | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Tick elapsed times every second
  useEffect(() => {
    timerRef.current = setInterval(() => {
      const now = Date.now();
      const allSessions = Storage.getAppUsageSessions();
      setActiveSessions((prevActive) => {
        const updated: Record<string, number> = {};
        Object.entries(prevActive).forEach(([appId, sessionId]) => {
          const session = allSessions.find((s) => s.id === sessionId);
          if (session) {
            updated[appId] = Math.floor((now - new Date(session.startedAt).getTime()) / 1000);
          }
        });
        setElapsedTimes(updated);
        return prevActive;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const handleToggle = useCallback(
    (app: TrackedApp) => {
      const activeSessionId = activeSessions[app.id];

      if (activeSessionId) {
        // ── STOP ──
        const now = new Date().toISOString();
        const allSessions = Storage.getAppUsageSessions();
        const sessionIdx = allSessions.findIndex((s) => s.id === activeSessionId);
        if (sessionIdx === -1) return;

        const session = allSessions[sessionIdx];
        const startMs = new Date(session.startedAt).getTime();
        const endMs = Date.now();
        const durationSeconds = Math.floor((endMs - startMs) / 1000);
        const startDate = session.startedAt.split('T')[0];
        const endDate = todayDate();

        let updatedSessions = [...allSessions];

        if (startDate !== endDate) {
          // Cross-midnight split
          const midnightEnd = `${startDate}T23:59:59.999Z`;
          const midnightMs = new Date(midnightEnd).getTime();
          const firstDuration = Math.floor((midnightMs - startMs) / 1000);
          const secondDuration = Math.floor((endMs - midnightMs) / 1000);

          updatedSessions[sessionIdx] = {
            ...session,
            endedAt: midnightEnd,
            durationSeconds: Math.max(0, firstDuration),
            status: 'completed',
          };
          updatedSessions.push({
            id: 'aus_' + Math.random().toString(36).substring(2, 9),
            appId: app.id,
            userId: 'usr_001',
            startedAt: `${endDate}T00:00:00.000Z`,
            endedAt: now,
            durationSeconds: Math.max(0, secondDuration),
            date: endDate,
            status: 'completed',
          });
        } else {
          updatedSessions[sessionIdx] = {
            ...session,
            endedAt: now,
            durationSeconds,
            status: 'completed',
          };
        }

        Storage.setAppUsageSessions(updatedSessions);
        setSessions(updatedSessions);

        const todayTotal = getDailyTotal(updatedSessions, app.id, endDate);
        onShowToast(
          `${app.name} — ${formatDuration(durationSeconds)} recorded. Today: ${formatDuration(todayTotal)}`,
          'success'
        );

        setActiveSessions((prev) => {
          const next = { ...prev };
          delete next[app.id];
          return next;
        });
        setElapsedTimes((prev) => {
          const next = { ...prev };
          delete next[app.id];
          return next;
        });
      } else {
        // ── START ──
        const now = new Date().toISOString();
        const newSession: AppUsageSession = {
          id: 'aus_' + Math.random().toString(36).substring(2, 9),
          appId: app.id,
          userId: 'usr_001',
          startedAt: now,
          endedAt: null,
          durationSeconds: null,
          date: todayDate(),
          status: 'active',
        };

        const updatedSessions = [...sessions, newSession];
        Storage.setAppUsageSessions(updatedSessions);
        setSessions(updatedSessions);
        setActiveSessions((prev) => ({ ...prev, [app.id]: newSession.id }));
        setElapsedTimes((prev) => ({ ...prev, [app.id]: 0 }));
        onShowToast(`${app.name} tracking started`, 'info');
      }
    },
    [activeSessions, sessions, onShowToast]
  );

  const today = todayDate();

  return (
    <>
      <div className="px-3 pb-2 border-b border-amber-500/15 mb-0">
        {/* Section label */}
        <div className="px-1 mb-2 flex items-center justify-between">
          <span className="text-[9px] font-bold text-neutral-500 tracking-wider uppercase">
            App Usage
          </span>
          <span className="text-[9px] text-neutral-600">hold for details</span>
        </div>

        {/* App icon row */}
        <div className="flex items-center justify-between px-1">
          {DEFAULT_APPS.map((app) => {
            const isActive = Boolean(activeSessions[app.id]);
            const elapsed = elapsedTimes[app.id] ?? 0;
            const dailyTotal = getDailyTotal(sessions, app.id, today);

            return (
              <AppIconButton
                key={app.id}
                app={app}
                isActive={isActive}
                elapsedSeconds={elapsed}
                dailyTotalSeconds={dailyTotal}
                onClick={() => handleToggle(app)}
                onLongPress={() => setSelectedApp(app)}
              />
            );
          })}
        </div>

        {/* Active session badges */}
        {Object.keys(activeSessions).length > 0 && (
          <div className="mt-2 px-1 flex flex-wrap gap-1">
            {Object.keys(activeSessions).map((appId) => {
              const app = DEFAULT_APPS.find((a) => a.id === appId);
              if (!app) return null;
              return (
                <span
                  key={appId}
                  className="inline-flex items-center gap-1 text-[9px] font-medium px-1.5 py-0.5 rounded-full"
                  style={{ background: `${app.color}22`, color: app.color }}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full animate-pulse"
                    style={{ background: app.color }}
                  />
                  {app.name}{' '}
                  <span className="font-mono">{formatDuration(elapsedTimes[appId] ?? 0)}</span>
                </span>
              );
            })}
          </div>
        )}
      </div>

      {/* Usage Detail Sheet */}
      {selectedApp && (
        <UsageDetailSheet
          app={selectedApp}
          sessions={sessions}
          isActive={Boolean(activeSessions[selectedApp.id])}
          elapsedSeconds={elapsedTimes[selectedApp.id] ?? 0}
          onClose={() => setSelectedApp(null)}
        />
      )}
    </>
  );
};
