import React, { useState, useRef, useEffect } from 'react';
import { Bell, Wifi, WifiOff, Sparkles, Snowflake, LogOut, MoreVertical, Calendar } from 'lucide-react';
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
  const [isActionMenuOpen, setIsActionMenuOpen] = useState(false);
  const actionMenuRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (actionMenuRef.current && !actionMenuRef.current.contains(e.target as Node)) {
        setIsActionMenuOpen(false);
      }
    };
    if (isActionMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isActionMenuOpen]);

  return (
    <header className="sticky top-0 z-30 bg-[#16120f]/90 backdrop-blur-md border-b border-amber-500/20 px-4 py-3 flex items-center justify-between">
      {/* App Branding Mobile / Desktop route title */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500 via-orange-600 to-amber-700 text-neutral-950 font-black shadow-md shadow-amber-950/40 md:hidden">
          <Snowflake className="w-5 h-5 text-neutral-950 stroke-[2.5]" />
        </div>

        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg md:text-xl font-black text-amber-100 font-outfit tracking-wide flex items-center gap-1.5">
              <span>SNOW</span>
              <span className="hidden sm:inline text-xs font-normal text-amber-400/80">
                — The miracles winter holds with it
              </span>
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Day 1
            </span>
          </div>
          <p className="text-[11px] text-neutral-400 font-medium">
            September 29, 2026 • Winter Arc Personal OS
          </p>
        </div>
      </div>

      {/* Right Action Icons */}
      <div className="flex items-center gap-2 relative">
        {/* Sync Status Badge */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#26201b] border border-amber-500/20 text-[11px] text-amber-300 font-medium">
          {isOffline ? (
            <>
              <WifiOff className="w-3.5 h-3.5 text-rose-400" />
              <span>Offline</span>
            </>
          ) : (
            <>
              <span className="text-emerald-400 font-bold text-xs">✓</span>
              <span>Synced</span>
            </>
          )}
        </div>

        {/* Desktop: Explicit Logout Action next to Synced (✓ Synced     Logout) */}
        {onLogout && (
          <button
            onClick={onLogout}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#26201b] hover:bg-rose-950/40 border border-amber-500/20 hover:border-rose-500/40 text-[11px] text-neutral-300 hover:text-rose-300 font-medium transition cursor-pointer group"
            title="Log out"
          >
            <LogOut className="w-3.5 h-3.5 text-neutral-400 group-hover:text-rose-400 transition" />
            <span>Logout</span>
          </button>
        )}

        {/* Mobile: Compact Action Menu Trigger (✓ Synced    ⋮) */}
        <div className="sm:hidden relative" ref={actionMenuRef}>
          <button
            onClick={() => setIsActionMenuOpen((prev) => !prev)}
            className="p-1.5 rounded-full bg-[#26201b] hover:bg-neutral-800 border border-amber-500/20 text-neutral-300 hover:text-amber-300 transition cursor-pointer"
            aria-label="Account actions menu"
            title="Account actions"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {/* Mobile Dropdown Menu */}
          {isActionMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-52 rounded-2xl bg-[#1c1815] border border-amber-500/30 shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-3 py-2 border-b border-amber-500/15 mb-1">
                <div className="text-xs font-bold text-amber-100 truncate">{user.name}</div>
                <div className="text-[10px] text-amber-400/80">Day {user.currentDayIndex} of Winter Arc</div>
              </div>

              {onOpenCalendar && (
                <button
                  type="button"
                  onClick={() => {
                    setIsActionMenuOpen(false);
                    onOpenCalendar();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-neutral-200 hover:bg-[#28221d] hover:text-amber-300 text-left transition cursor-pointer"
                >
                  <Calendar className="w-4 h-4 text-amber-400" />
                  <span>Daily Progress Calendar</span>
                </button>
              )}

              {onLogout && (
                <button
                  type="button"
                  onClick={() => {
                    setIsActionMenuOpen(false);
                    onLogout();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-rose-300 hover:bg-rose-950/40 text-left transition cursor-pointer mt-1 border-t border-amber-500/10"
                >
                  <LogOut className="w-4 h-4 text-rose-400" />
                  <span className="font-semibold">Log out</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Demo Checkpoint Trigger Button */}
        <button
          onClick={onOpenCheckpoint}
          className="px-2.5 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
          title="Trigger Checkpoint Demo Modal"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" style={{ animationDuration: '4s' }} />
          <span className="hidden xs:inline">Checkpoint</span>
        </button>

        {/* Notifications Button */}
        <button
          onClick={onOpenNotifications}
          className="relative p-2 rounded-xl bg-[#26201b] border border-amber-500/20 text-neutral-300 hover:text-amber-200 transition cursor-pointer"
          aria-label="Open notifications"
        >
          <Bell className="w-5 h-5 text-amber-400" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-orange-600 text-[9px] font-bold text-white flex items-center justify-center border border-[#16120f]">
              {unreadCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
};
