import React from 'react';
import {
  Fuel,
  Sparkles,
  FileText,
  Download,
  BookMarked,
  Activity,
  Utensils,
  CheckSquare,
  BarChart3,
  Settings,
  Zap,
  Target,
  Clock,
  DollarSign,
  BrainCircuit,
  Award,
  MessageSquare,
  Database,
  Calendar
} from 'lucide-react';
import { WorkspacePreferences, ModuleId, User } from '../types';

interface MoreMenuViewProps {
  onNavigate: (route: string) => void;
  unreadReviewCount: number;
  workspacePreferences?: WorkspacePreferences;
  user?: User;
  onOpenCalendar?: () => void;
}

export const MoreMenuView: React.FC<MoreMenuViewProps> = ({
  onNavigate,
  unreadReviewCount,
  workspacePreferences,
  user,
  onOpenCalendar
}) => {
  const enabledModules = workspacePreferences?.enabledModules;

  const isEnabled = (modId?: ModuleId) => {
    if (!enabledModules || !modId) return true;
    if (modId === 'home' || modId === 'inbox') return true;
    return enabledModules.includes(modId);
  };

  const menuItems = [
    { route: '/settings/workspace', label: 'Customize Workspace', icon: Sparkles, desc: 'Show/hide modules & launch route' },
    { route: '/cognitive', label: 'Cognitive Lab', icon: BrainCircuit, desc: 'Train reasoning & problem solving', moduleId: 'cognitive' as ModuleId },
    { route: '/cognitive/profile', label: 'Cognitive Skill Profile (TPI)', icon: Award, desc: 'Radar chart across 8 skills', moduleId: 'cognitive' as ModuleId },
    { route: '/ai', label: 'AI Supervisor', icon: MessageSquare, desc: 'Evidence-backed life observation', moduleId: 'ai' as ModuleId },
    { route: '/ai/memory', label: 'AI Memory Manager', icon: Database, desc: 'Inspect & edit AI rules', moduleId: 'ai' as ModuleId },
    { route: '/ai/activity', label: 'AI Activity Log', icon: Activity, desc: 'Audit log of automated actions', moduleId: 'ai' as ModuleId },
    { route: '/inbox/review', label: 'AI Review Queue', icon: CheckSquare, badge: unreadReviewCount, desc: 'Confirm AI extractions', moduleId: 'inbox' as ModuleId },
    { route: '/finance', label: 'Finance & Accounting', icon: DollarSign, desc: 'Cash outflow vs consumption', moduleId: 'finance' as ModuleId },
    { route: '/finance/consumption', label: 'Consumption Engine', icon: Sparkles, desc: 'Daily cost allocation', moduleId: 'finance' as ModuleId },
    { route: '/finance/fuel', label: 'Fuel & Vehicle Track', icon: Fuel, desc: 'Mileage km/L & cost/km', moduleId: 'finance' as ModuleId },
    { route: '/track', label: 'Time & Deep Work', icon: Clock, desc: 'Stopwatch & timeline', moduleId: 'time' as ModuleId },
    { route: '/learning', label: 'Learning Mastery', icon: Zap, desc: 'PyTorch, Python & skills', moduleId: 'learning' as ModuleId },
    { route: '/food', label: 'Food & Nutrition', icon: Utensils, desc: 'Meals & pantry spend', moduleId: 'food' as ModuleId },
    { route: '/health', label: 'Health & Recovery', icon: Activity, desc: 'Sleep, water & workout', moduleId: 'health' as ModuleId },
    { route: '/goals', label: 'Goals Hierarchy', icon: Target, desc: 'Decomposed milestone goals', moduleId: 'goals' as ModuleId },
    { route: '/journal', label: 'Daily Journal', icon: BookMarked, desc: 'Reflection & priorities', moduleId: 'journal' as ModuleId },
    { route: '/analytics', label: 'Analytics & Trends', icon: BarChart3, desc: 'Recharts visualizations', moduleId: 'analytics' as ModuleId },
    { route: '/reports', label: 'Reports Generator', icon: FileText, desc: 'Daily/Weekly/Monthly PDF', moduleId: 'reports' as ModuleId },
    { route: '/export', label: 'Export Center', icon: Download, desc: 'JSON/CSV data backup', moduleId: 'reports' as ModuleId },
    { route: '/settings/import', label: 'AI Profile Import', icon: Sparkles, desc: 'Import ChatGPT context into OS' },
    { route: '/settings', label: 'Settings & Theme', icon: Settings, desc: 'Profile & aesthetics' }
  ].filter((item) => isEnabled(item.moduleId));

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* USER PROFILE & DAILY PROGRESS CALENDAR CARD */}
      {user && onOpenCalendar && (
        <div
          onClick={onOpenCalendar}
          className="p-4 rounded-3xl bg-gradient-to-r from-[#1c1815] to-[#25201c] border border-amber-500/25 hover:border-amber-500/50 p-4 flex items-center justify-between cursor-pointer transition shadow-lg group"
        >
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="w-12 h-12 rounded-full border-2 border-amber-500/40 object-cover group-hover:scale-105 transition-transform"
              />
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-[#1c1815] shadow-[0_0_6px_rgba(16,185,129,0.8)]" />
            </div>
            <div>
              <div className="text-sm font-bold text-amber-100 font-outfit group-hover:text-amber-300 transition-colors">
                {user.name}
              </div>
              <div className="text-xs text-amber-400/80">
                Day {user.currentDayIndex} of Winter Arc • Tap for Progress Calendar
              </div>
            </div>
          </div>
          <div className="p-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 group-hover:scale-105 transition-transform">
            <Calendar className="w-5 h-5 text-amber-400" />
          </div>
        </div>
      )}

      <div>
        <h1 className="text-2xl font-black text-amber-100 font-outfit">SNOW Directory</h1>
        <p className="text-xs text-amber-200/80">Access all personal operating system modules, Cognitive Lab, and AI Supervisor features.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.route}
              onClick={() => onNavigate(item.route)}
              className="p-4 rounded-2xl bg-[#1c1815] border border-amber-500/20 hover:border-amber-500/50 cursor-pointer transition flex items-center justify-between shadow-md"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-amber-100 font-outfit flex items-center gap-2">
                    <span>{item.label}</span>
                    {item.badge !== undefined && item.badge > 0 && (
                      <span className="px-1.5 py-0.5 rounded-full bg-orange-600 text-white text-[10px] font-bold">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-neutral-400 mt-0.5">{item.desc}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
