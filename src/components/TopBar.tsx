import React from 'react';
import { Bell, WifiOff, Sparkles, Snowflake, LogOut, Calendar } from 'lucide-react';
import { User, Notification } from '../types';

interface TopBarProps {
  user: User;
  currentRoute: string;
  notifications: Notification[];
  onOpenNotifications: () => void;
  onOpenCheckpoint: () => void;
  onOpenCalendar?: () => void;
  onLogout?: () => void;
  isOffline?: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({
  user,
  currentRoute,
  notifications,
  onOpenNotifications,
  onOpenCheckpoint,
  onOpenCalendar,
  onLogout,
  isOffline = false
}) => {
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <header className="sticky top-0 z-30 bg-[#16120f]/95 backdrop-blur-md border-b border-amber-500/20 px-3.5 sm:px-6 py-2.5 sm:py-3 transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
        {/* App Branding & Date Section */}
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500 via-orange-600 to-amber-700 text-neutral-950 font-black shadow-md shadow-amber-950/40 md:hidden shrink-0">
            <Snowflake className="w-5 h-5 text-neutral-950 stroke-[2.5]" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg md:text-xl font-black text-amber-100 font-outfit tracking-wide flex items-center gap-1.5">
                <span>SNOW</span>
                <span className="hidden sm:inline text-xs font-normal text-amber-400/80">
                  — The miracles winter holds with it
                </span>
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 whitespace-nowrap">
                Day {user.currentDayIndex || 1}
              </span>
            </div>
            <p className="text-[11px] text-neutral-400 font-medium truncate">
              September 29, 2026 • Winter Arc Personal OS
            </p>
          </div>
        </div>

        {/* Action Buttons: Just below the snow day date on mobile, right-aligned on desktop */}
        <div className="flex items-center justify-between sm:justify-end gap-1.5 sm:gap-2 w-full sm:w-auto overflow-x-auto no-scrollbar py-0.5">
          {/* Status & Main Actions Group */}
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            {/* Sync Status Badge */}
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#26201b] border border-amber-500/20 text-[10px] text-amber-300 font-medium shrink-0">
              {isOffline ? (
                <>
                  <WifiOff className="w-3 h-3 text-rose-400" />
                  <span>Offline</span>
                </>
              ) : (
                <>
                  <span className="text-emerald-400 font-bold text-xs">✓</span>
                  <span>Synced</span>
                </>
              )}
            </div>

            {/* Logout Action */}
            {onLogout && (
              <button
                type="button"
                onClick={onLogout}
                className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#26201b] hover:bg-rose-950/40 border border-amber-500/20 hover:border-rose-500/40 text-[10px] text-neutral-300 hover:text-rose-300 font-medium transition cursor-pointer group shrink-0"
                title="Log out"
              >
                <LogOut className="w-3 h-3 text-neutral-400 group-hover:text-rose-400 transition" />
                <span>Logout</span>
              </button>
            )}

            {/* Checkpoint Trigger Button */}
            <button
              type="button"
              onClick={onOpenCheckpoint}
              className="px-2 py-0.5 rounded-full bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-[10px] font-semibold flex items-center gap-1 transition cursor-pointer shrink-0"
              title="Trigger Checkpoint Demo Modal"
            >
              <Sparkles className="w-3 h-3 text-amber-400 animate-spin" style={{ animationDuration: '4s' }} />
              <span>Checkpoint</span>
            </button>
          </div>

          {/* Quick Utility Icons (Calendar & Notifications) */}
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            {onOpenCalendar && (
              <button
                type="button"
                onClick={onOpenCalendar}
                className="p-1 rounded-full bg-[#26201b] hover:bg-[#322a24] border border-amber-500/20 text-neutral-300 hover:text-amber-200 transition cursor-pointer shrink-0"
                aria-label="Open Daily Progress Calendar"
                title="Daily Progress Calendar"
              >
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
              </button>
            )}

            <button
              type="button"
              onClick={onOpenNotifications}
              className="relative p-1 rounded-full bg-[#26201b] hover:bg-[#322a24] border border-amber-500/20 text-neutral-300 hover:text-amber-200 transition cursor-pointer shrink-0"
              aria-label="Open notifications"
              title="Notifications"
            >
              <Bell className="w-3.5 h-3.5 text-amber-400" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-orange-600 text-[8px] font-bold text-white flex items-center justify-center border border-[#16120f]">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
