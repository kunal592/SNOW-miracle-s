import React, { useState, useEffect } from 'react';
import { User, Notification, InboxEntry, AIExtraction, CategoryType, Checkpoint, WorkspacePreferences } from '../types';
import { TopBar } from './TopBar';
import { MobileBottomNav } from './MobileBottomNav';
import { DesktopSidebar } from './DesktopSidebar';
import { QuickAddSheet } from './QuickAddSheet';
import { CheckpointModal } from './CheckpointModal';
import { NotificationCenter } from './NotificationCenter';
import { ToastContainer, ToastMessage } from './Toast';
import { Storage } from '../lib/storage';

interface AppShellProps {
  children: React.ReactNode;
  currentRoute: string;
  onNavigate: (route: string) => void;
  user: User;
  onUpdateUser: (user: User) => void;
  toasts: ToastMessage[];
  onDismissToast: (id: string) => void;
  onShowToast: (text: string, type?: 'success' | 'error' | 'info') => void;
  inbox: InboxEntry[];
  onAddUniversalDump: (text: string, extraction: AIExtraction) => void;
  onAddExpense: (data: { title: string; amount: number; category: CategoryType }) => void;
  onAddLogTime: (data: { activity: string; minutes: number; category: 'Work' | 'Learning' | 'Health' | 'Personal' }) => void;
  workspacePreferences?: WorkspacePreferences;
  onOpenCalendar?: () => void;
  onLogout?: () => void;
}

export const AppShell: React.FC<AppShellProps> = ({
  children,
  currentRoute,
  onNavigate,
  user,
  onUpdateUser,
  toasts,
  onDismissToast,
  onShowToast,
  inbox,
  onAddUniversalDump,
  onAddExpense,
  onAddLogTime,
  workspacePreferences,
  onOpenCalendar,
  onLogout
}) => {
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [isCheckpointOpen, setIsCheckpointOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    setNotifications(Storage.getNotifications());

    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleMarkAllRead = () => {
    const updated = notifications.map((n: Notification) => ({ ...n, isRead: true }));
    setNotifications(updated);
    Storage.setNotifications(updated);
    onShowToast('All notifications marked as read', 'info');
  };

  const handleCompleteCheckpoint = (data: Partial<Checkpoint>) => {
    onShowToast('🎉 Checkpoint completed! Winter Arc score updated.', 'success');
  };

  const unreadInboxCount = inbox.filter((i) => i.status === 'Needs Review' || i.status === 'Raw').length;

  return (
    <div className="min-h-screen bg-[#12100e] text-[#f4efe6] flex flex-col md:flex-row antialiased selection:bg-amber-500/30 selection:text-amber-200">
      {/* Desktop Left Navigation Sidebar */}
      <DesktopSidebar
        currentRoute={currentRoute}
        onNavigate={onNavigate}
        onOpenQuickAdd={() => setIsQuickAddOpen(true)}
        onOpenCalendar={onOpenCalendar}
        user={user}
        unreadInboxCount={unreadInboxCount}
        workspacePreferences={workspacePreferences}
        onShowToast={onShowToast}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <TopBar
          user={user}
          currentRoute={currentRoute}
          notifications={notifications}
          onOpenNotifications={() => setIsNotifOpen(true)}
          onOpenCheckpoint={() => setIsCheckpointOpen(true)}
          onOpenCalendar={onOpenCalendar}
          onLogout={onLogout}
          isOffline={isOffline}
        />

        {/* View Component */}
        <main className="flex-1 p-4 md:p-6 pb-24 md:pb-8 max-w-6xl mx-auto w-full">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <MobileBottomNav
        currentRoute={currentRoute}
        onNavigate={onNavigate}
        onOpenQuickAdd={() => setIsQuickAddOpen(true)}
        unreadInboxCount={unreadInboxCount}
        workspacePreferences={workspacePreferences}
      />

      {/* Modals & Drawers */}
      <QuickAddSheet
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        workspacePreferences={workspacePreferences}
        onAddUniversalDump={(text, ext) => {
          onAddUniversalDump(text, ext);
          onShowToast('Processed & added to Universal Inbox', 'success');
        }}
        onAddExpense={(data) => {
          onAddExpense(data);
          onShowToast(`Expense recorded: ₹${data.amount}`, 'success');
        }}
        onAddLogTime={(data) => {
          onAddLogTime(data);
          onShowToast(`Logged ${data.minutes}m of ${data.activity}`, 'success');
        }}
      />

      <CheckpointModal
        isOpen={isCheckpointOpen}
        onClose={() => setIsCheckpointOpen(false)}
        onComplete={handleCompleteCheckpoint}
      />

      <NotificationCenter
        isOpen={isNotifOpen}
        onClose={() => setIsNotifOpen(false)}
        notifications={notifications}
        onMarkAllAsRead={handleMarkAllRead}
        onNavigate={onNavigate}
      />

      <ToastContainer toasts={toasts} onDismiss={onDismissToast} />
    </div>
  );
};
