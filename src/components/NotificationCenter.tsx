import React from 'react';
import { X, Bell, Check, ExternalLink, Inbox, Calendar, AlertTriangle, ShieldCheck } from 'lucide-react';
import { Notification } from '../types';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: Notification[];
  onMarkAllAsRead: () => void;
  onNavigate: (route: string) => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAllAsRead,
  onNavigate
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-[#1c1815] border-l border-amber-500/20 h-full flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-4 bg-[#26201b] border-b border-amber-500/20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-amber-400" />
            <h2 className="font-bold text-amber-100 text-base font-outfit">Notifications</h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
              {notifications.filter((n) => !n.isRead).length} New
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={onMarkAllAsRead}
              className="text-xs text-amber-400 hover:text-amber-300 p-1.5 rounded-lg hover:bg-amber-500/10 flex items-center gap-1 transition"
              title="Mark all read"
            >
              <Check className="w-3.5 h-3.5" /> Read All
            </button>
            <button
              onClick={onClose}
              className="text-neutral-400 hover:text-white p-1.5 rounded-lg hover:bg-neutral-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2.5 custom-scrollbar">
          {notifications.length === 0 ? (
            <div className="text-center py-12 text-neutral-400 text-sm">
              No notifications. You are all caught up!
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => {
                  if (notif.actionRoute) onNavigate(notif.actionRoute);
                  onClose();
                }}
                className={`p-3 rounded-xl border transition cursor-pointer ${
                  notif.isRead
                    ? 'bg-[#12100e]/60 border-amber-500/10 text-neutral-300 hover:bg-[#26201b]'
                    : 'bg-[#26201b] border-amber-500/30 text-amber-100 shadow-md shadow-amber-950/30 hover:border-amber-500/60'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <div className="mt-0.5 p-1.5 rounded-lg bg-amber-500/20 text-amber-400 shrink-0">
                    {notif.type === 'checkpoint' && <Calendar className="w-4 h-4 text-orange-400" />}
                    {notif.type === 'inbox' && <Inbox className="w-4 h-4 text-amber-400" />}
                    {notif.type === 'consumption' && <ShieldCheck className="w-4 h-4 text-emerald-400" />}
                    {notif.type === 'system' && <Bell className="w-4 h-4 text-amber-400" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between text-xs mb-0.5">
                      <span className="font-semibold text-amber-200 truncate">{notif.title}</span>
                      {!notif.isRead && (
                        <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-neutral-400 line-clamp-2">{notif.message}</p>
                    <div className="mt-1.5 text-[10px] text-amber-500/80 flex items-center justify-between">
                      <span>{new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      {notif.actionRoute && (
                        <span className="flex items-center gap-0.5 hover:underline">
                          View details <ExternalLink className="w-2.5 h-2.5" />
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
