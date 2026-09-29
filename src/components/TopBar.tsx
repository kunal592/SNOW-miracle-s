import React from 'react';
import { Bell, Wifi, WifiOff, Sparkles, Snowflake } from 'lucide-react';
import { User, Notification } from '../types';

interface TopBarProps {
  user: User;
  currentRoute: string;
  notifications: Notification[];
  onOpenNotifications: () => void;
  onOpenCheckpoint: () => void;
  isOffline?: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({
  user,
  currentRoute,
  notifications,
  onOpenNotifications,
  onOpenCheckpoint,
  isOffline = false
}) => {
  const unreadCount = notifications.filter((n) => !n.isRead).length;

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
      <div className="flex items-center gap-2">
        {/* Sync Status Badge */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#26201b] border border-amber-500/20 text-[11px] text-amber-300 font-medium">
          {isOffline ? (
            <>
              <WifiOff className="w-3.5 h-3.5 text-rose-400" />
              <span>Offline</span>
            </>
          ) : (
            <>
              <Wifi className="w-3.5 h-3.5 text-emerald-400" />
              <span>Synced</span>
            </>
          )}
        </div>

        {/* Demo Checkpoint Trigger Button */}
        <button
          onClick={onOpenCheckpoint}
          className="px-2.5 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-xs font-semibold flex items-center gap-1.5 transition"
          title="Trigger Checkpoint Demo Modal"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" style={{ animationDuration: '4s' }} />
          <span className="hidden xs:inline">Checkpoint</span>
        </button>

        {/* Notifications Button */}
        <button
          onClick={onOpenNotifications}
          className="relative p-2 rounded-xl bg-[#26201b] border border-amber-500/20 text-neutral-300 hover:text-amber-200 transition"
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
