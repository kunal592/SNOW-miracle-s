import React from 'react';
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
  MessageSquare
} from 'lucide-react';
import { User } from '../types';

interface DesktopSidebarProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
  onOpenQuickAdd: () => void;
  user: User;
  unreadInboxCount: number;
}

export const DesktopSidebar: React.FC<DesktopSidebarProps> = ({
  currentRoute,
  onNavigate,
  onOpenQuickAdd,
  user,
  unreadInboxCount
}) => {
  const navSections = [
    {
      title: 'OPERATING SYSTEM',
      items: [
        { route: '/', label: 'Command Center', icon: Home },
        { route: '/inbox', label: 'Universal Inbox', icon: Inbox, badge: unreadInboxCount },
        { route: '/inbox/review', label: 'AI Review Queue', icon: CheckSquare }
      ]
    },
    {
      title: 'AI & COGNITION',
      items: [
        { route: '/cognitive', label: 'Cognitive Lab', icon: BrainCircuit },
        { route: '/cognitive/profile', label: 'Skill Profile (TPI)', icon: Sparkles },
        { route: '/ai', label: 'AI Supervisor', icon: MessageSquare }
      ]
    },
    {
      title: 'FINANCE & CONSUMPTION',
      items: [
        { route: '/finance', label: 'Finance Dashboard', icon: DollarSign },
        { route: '/finance/consumption', label: 'Consumption Engine', icon: Sparkles },
        { route: '/finance/fuel', label: 'Fuel Vehicle Track', icon: Fuel }
      ]
    },
    {
      title: 'LIFE LOGGING',
      items: [
        { route: '/track', label: 'Time & Deep Work', icon: Clock },
        { route: '/learning', label: 'Learning Mastery', icon: BookOpen },
        { route: '/food', label: 'Food & Nutrition', icon: Utensils },
        { route: '/health', label: 'Health & Sleep', icon: Activity },
        { route: '/journal', label: 'Daily Journal', icon: BookMarked }
      ]
    },
    {
      title: 'GOALS & STRATEGY',
      items: [
        { route: '/goals', label: 'Goals Hierarchy', icon: Target },
        { route: '/milestones', label: 'Milestones & Arc', icon: Flag },
        { route: '/analytics', label: 'Analytics & Insights', icon: BarChart3 },
        { route: '/reports', label: 'Reports Generator', icon: FileText }
      ]
    },
    {
      title: 'SYSTEM',
      items: [
        { route: '/settings/import', label: 'AI Profile Import', icon: Sparkles },
        { route: '/export', label: 'Export Data', icon: Download },
        { route: '/settings', label: 'Settings', icon: Settings }
      ]
    }
  ];

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

      {/* Nav Menu */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-4 custom-scrollbar">
        {navSections.map((section) => (
          <div key={section.title} className="space-y-1">
            <div className="px-3 text-[10px] font-bold text-neutral-400 tracking-wider">
              {section.title}
            </div>
            {section.items.map((item) => {
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
        ))}
      </div>

      {/* User Footer */}
      <div className="p-3 border-t border-amber-500/20 bg-[#12100e]">
        <div className="flex items-center gap-3 p-2 rounded-xl bg-[#1c1815] border border-amber-500/15">
          <img
            src={user.avatarUrl}
            alt={user.name}
            className="w-8 h-8 rounded-full border border-amber-500/40 object-cover"
          />
          <div className="flex-1 min-w-0">
            <div className="text-xs font-bold text-amber-100 truncate">{user.name}</div>
            <div className="text-[10px] text-amber-400/80 truncate">Day {user.currentDayIndex} of Winter Arc</div>
          </div>
        </div>
      </div>
    </aside>
  );
};
