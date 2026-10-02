import React, { useState } from 'react';
import {
  Home,
  Inbox,
  CheckSquare,
  DollarSign,
  Fuel,
  Clock,
  BookOpen,
  Utensils,
  Activity,
  Target,
  Flag,
  BookMarked,
  BarChart3,
  FileText,
  Download,
  Settings,
  Plus,
  Sparkles,
  BrainCircuit,
  Zap,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Layers,
  Calendar,
  Dna
} from 'lucide-react';
import { User, WorkspacePreferences, ModuleId } from '../types';
import { AppUsageTracker } from './AppUsageTracker';

interface DesktopSidebarProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
  onOpenQuickAdd: () => void;
  onOpenCalendar?: () => void;
  user: User;
  unreadInboxCount: number;
  workspacePreferences?: WorkspacePreferences;
  onShowToast?: (text: string, type?: 'success' | 'error' | 'info') => void;
}

interface NavItem {
  route: string;
  label: string;
  icon: any;
  badge?: number;
  moduleId?: ModuleId;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export const DesktopSidebar: React.FC<DesktopSidebarProps> = ({
  currentRoute,
  onNavigate,
  onOpenQuickAdd,
  onOpenCalendar,
  user,
  unreadInboxCount,
  workspacePreferences,
  onShowToast
}) => {
  const [isMoreExpanded, setIsMoreExpanded] = useState(false);

  const enabledModules = workspacePreferences?.enabledModules;
  const pinnedModules = workspacePreferences?.pinnedSidebarModules || ['home', 'inbox', 'time', 'learning', 'goals'];

  const isEnabled = (modId?: ModuleId) => {
    if (!enabledModules || !modId) return true;
    if (modId === 'home' || modId === 'inbox') return true;
    return enabledModules.includes(modId);
  };

  const isPinned = (modId?: ModuleId) => {
    if (!modId) return true; // System items pinned by default
    if (modId === 'home' || modId === 'inbox') return true;
    return pinnedModules.includes(modId);
  };

  const navSections: NavSection[] = [
    {
      title: 'OPERATING SYSTEM',
      items: [
        { route: '/', label: 'Command Center', icon: Home, moduleId: 'home' },
        { route: '/inbox', label: 'Universal Inbox', icon: Inbox, badge: unreadInboxCount, moduleId: 'inbox' },
        { route: '/inbox/review', label: 'AI Review Queue', icon: CheckSquare, moduleId: 'inbox' }
      ]
    },
    {
      title: 'AI & COGNITION',
      items: [
        { route: '/cognitive', label: 'Cognitive Lab', icon: BrainCircuit, moduleId: 'cognitive' },
        { route: '/cognitive/profile', label: 'Skill Profile (TPI)', icon: Sparkles, moduleId: 'cognitive' },
        { route: '/evolution', label: 'Evolution Dossier', icon: Dna, moduleId: 'evolution' },
        { route: '/ai', label: 'AI Supervisor', icon: MessageSquare, moduleId: 'ai' }
      ]
    },
    {
      title: 'FINANCE & CONSUMPTION',
      items: [
        { route: '/finance', label: 'Finance Dashboard', icon: DollarSign, moduleId: 'finance' },
        { route: '/finance/consumption', label: 'Consumption Engine', icon: Sparkles, moduleId: 'finance' },
        { route: '/finance/fuel', label: 'Fuel Vehicle Track', icon: Fuel, moduleId: 'finance' }
      ]
    },
    {
      title: 'LIFE LOGGING',
      items: [
        { route: '/track', label: 'Time & Deep Work', icon: Clock, moduleId: 'time' },
        { route: '/learning', label: 'Learning Mastery', icon: BookOpen, moduleId: 'learning' },
        { route: '/food', label: 'Food & Nutrition', icon: Utensils, moduleId: 'food' },
        { route: '/health', label: 'Health & Sleep', icon: Activity, moduleId: 'health' },
        { route: '/journal', label: 'Daily Journal', icon: BookMarked, moduleId: 'journal' }
      ]
    },
    {
      title: 'GOALS & STRATEGY',
      items: [
        { route: '/goals', label: 'Goals Hierarchy', icon: Target, moduleId: 'goals' },
        { route: '/milestones', label: 'Milestones & Arc', icon: Flag, moduleId: 'milestones' },
        { route: '/analytics', label: 'Analytics & Insights', icon: BarChart3, moduleId: 'analytics' },
        { route: '/reports', label: 'Reports Generator', icon: FileText, moduleId: 'reports' }
      ]
    }
  ];

  const systemItems: NavItem[] = [
    { route: '/settings/workspace', label: 'Customize Workspace', icon: Sparkles },
    { route: '/settings/import', label: 'AI Profile Import', icon: Sparkles },
    { route: '/export', label: 'Export Data', icon: Download },
    { route: '/settings', label: 'Settings', icon: Settings }
  ];

  // Flatten all enabled items
  const allEnabledItems: NavItem[] = [];
  navSections.forEach((section) => {
    section.items.forEach((item) => {
      if (isEnabled(item.moduleId)) {
        allEnabledItems.push(item);
      }
    });
  });

  // Separate pinned items (Daily Use) vs unpinned items (More Menu)
  const pinnedItems = allEnabledItems.filter((item) => isPinned(item.moduleId));
  const unpinnedItems = allEnabledItems.filter((item) => !isPinned(item.moduleId));

  // Check if current route is inside unpinned items (auto-expand if active)
  const isCurrentRouteUnpinned = unpinnedItems.some((item) => item.route === currentRoute);
  const showMore = isMoreExpanded || isCurrentRouteUnpinned;

  return (
    <aside className="hidden md:flex flex-col w-64 bg-[#16120f] border-r border-amber-500/20 h-screen sticky top-0 shrink-0 select-none">
      {/* App Branding */}
      <div className="p-5 border-b border-amber-500/20 flex items-center justify-between">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => onNavigate('/')}>
          <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500 via-orange-600 to-amber-700 text-neutral-950 font-black shadow-lg shadow-amber-950/60">
            <Zap className="w-5 h-5 fill-neutral-950" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-wider text-amber-100 font-outfit leading-none">
              SNOW
            </h1>
            <p className="text-[10px] text-amber-300/80 font-medium tracking-wide">
              WINTER ARC OS
            </p>
          </div>
        </div>
      </div>

      {/* Quick Add Button */}
      <div className="p-4">
        <button
          onClick={onOpenQuickAdd}
          className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-neutral-950 font-bold text-xs shadow-lg shadow-amber-950/60 flex items-center justify-center gap-2 transition active:scale-98"
        >
          <Plus className="w-4 h-4 stroke-[3]" /> Quick Life Dump
        </button>
      </div>

      {/* Nav Menu Container */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-4 custom-scrollbar">
        {/* 1. DAILY USE / PINNED TABS SECTION */}
        <div className="space-y-1">
          <div className="px-3 text-[10px] font-bold text-amber-400/90 tracking-wider flex items-center justify-between">
            <span>DAILY USE (PINNED)</span>
            <span className="text-[9px] font-normal text-neutral-500">{pinnedItems.length} active</span>
          </div>

          {pinnedItems.map((item) => {
            const isActive = currentRoute === item.route;
            const Icon = item.icon;

            return (
              <button
                key={item.route}
                onClick={() => onNavigate(item.route)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition ${
                  isActive
                    ? 'bg-amber-500/15 text-amber-200 border border-amber-500/30 font-semibold'
                    : 'text-neutral-300 hover:bg-[#26201b] hover:text-amber-200/90'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-neutral-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full bg-orange-600 text-white text-[10px] font-bold">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* 2. MORE MODULES (COLLAPSIBLE SECTION) */}
        {unpinnedItems.length > 0 && (
          <div className="space-y-1 pt-2 border-t border-amber-500/15">
            <button
              onClick={() => setIsMoreExpanded(!isMoreExpanded)}
              className="w-full px-3 py-2 rounded-xl text-xs font-bold text-amber-300 hover:text-amber-200 hover:bg-[#26201b] flex items-center justify-between transition"
            >
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-amber-400" />
                <span>MORE MODULES ({unpinnedItems.length})</span>
              </div>
              {showMore ? (
                <ChevronUp className="w-4 h-4 text-neutral-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-neutral-400" />
              )}
            </button>

            {showMore && (
              <div className="space-y-1 pl-2 border-l border-amber-500/20 ml-3 pt-1">
                {unpinnedItems.map((item) => {
                  const isActive = currentRoute === item.route;
                  const Icon = item.icon;

                  return (
                    <button
                      key={item.route}
                      onClick={() => onNavigate(item.route)}
                      className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-medium transition ${
                        isActive
                          ? 'bg-amber-500/15 text-amber-200 border border-amber-500/30 font-semibold'
                          : 'text-neutral-400 hover:bg-[#26201b] hover:text-neutral-200'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-400' : 'text-neutral-500'}`} />
                        <span>{item.label}</span>
                      </div>
                      {item.badge !== undefined && item.badge > 0 && (
                        <span className="px-1.5 py-0.5 rounded-full bg-orange-600 text-white text-[10px] font-bold">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* 3. SYSTEM SECTION */}
        <div className="space-y-1 pt-2 border-t border-amber-500/15">
          <div className="px-3 text-[10px] font-bold text-neutral-400 tracking-wider">
            SYSTEM & PREFERENCES
          </div>
          {systemItems.map((item) => {
            const isActive = currentRoute === item.route;
            const Icon = item.icon;

            return (
              <button
                key={item.route}
                onClick={() => onNavigate(item.route)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition ${
                  isActive
                    ? 'bg-amber-500/15 text-amber-200 border border-amber-500/30 font-semibold'
                    : 'text-neutral-400 hover:bg-[#26201b] hover:text-neutral-200'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-neutral-500'}`} />
                  <span>{item.label}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* App Usage Tracker — ABOVE the profile card, per spec */}
      <AppUsageTracker onShowToast={onShowToast ?? (() => {})} />

      {/* User Footer: Click to open Winter Arc Progress & Distraction Calendar */}
      <div className="p-3 border-t border-amber-500/20 bg-[#12100e]">
        <button
          onClick={onOpenCalendar}
          className="w-full flex items-center gap-3 p-2 rounded-2xl bg-[#1c1815] hover:bg-[#25201c] border border-amber-500/15 hover:border-amber-500/40 transition-all group text-left cursor-pointer shadow-sm hover:shadow-amber-950/40"
          title="Click to view Winter Arc Progress & Distraction Calendar"
        >
          <div className="relative">
            <img
              src={user.avatarUrl}
              alt={user.name}
              className="w-8 h-8 rounded-full border border-amber-500/40 object-cover group-hover:scale-105 transition-transform"
            />
            {/* Live arc status indicator badge */}
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-[#1c1815] shadow-[0_0_6px_rgba(16,185,129,0.8)]" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-100 group-hover:text-amber-300 transition-colors truncate">
                {user.name}
              </span>
              <Calendar className="w-3.5 h-3.5 text-amber-400/60 group-hover:text-amber-400 transition-colors shrink-0" />
            </div>
            <div className="text-[10px] text-amber-400/80 group-hover:text-amber-300 transition-colors truncate flex items-center gap-1">
              <span>Day {user.currentDayIndex} of Arc</span>
              <span>•</span>
              <span className="text-emerald-400 font-semibold">Calendar</span>
            </div>
          </div>
        </button>
      </div>
    </aside>
  );
};
