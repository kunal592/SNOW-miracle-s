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
  Database
} from 'lucide-react';

interface MoreMenuViewProps {
  onNavigate: (route: string) => void;
  unreadReviewCount: number;
}

export const MoreMenuView: React.FC<MoreMenuViewProps> = ({ onNavigate, unreadReviewCount }) => {
  const menuItems = [
    { route: '/cognitive', label: 'Cognitive Lab', icon: BrainCircuit, desc: 'Train reasoning & problem solving' },
    { route: '/cognitive/profile', label: 'Cognitive Skill Profile (TPI)', icon: Award, desc: 'Radar chart across 8 skills' },
    { route: '/ai', label: 'AI Supervisor', icon: MessageSquare, desc: 'Evidence-backed life observation' },
    { route: '/ai/memory', label: 'AI Memory Manager', icon: Database, desc: 'Inspect & edit AI rules' },
    { route: '/ai/activity', label: 'AI Activity Log', icon: Activity, desc: 'Audit log of automated actions' },
    { route: '/inbox/review', label: 'AI Review Queue', icon: CheckSquare, badge: unreadReviewCount, desc: 'Confirm AI extractions' },
    { route: '/finance', label: 'Finance & Accounting', icon: DollarSign, desc: 'Cash outflow vs consumption' },
    { route: '/finance/consumption', label: 'Consumption Engine', icon: Sparkles, desc: 'Daily cost allocation' },
    { route: '/finance/fuel', label: 'Fuel & Vehicle Track', icon: Fuel, desc: 'Mileage km/L & cost/km' },
    { route: '/track', label: 'Time & Deep Work', icon: Clock, desc: 'Stopwatch & timeline' },
    { route: '/learning', label: 'Learning Mastery', icon: Zap, desc: 'PyTorch, Python & skills' },
    { route: '/food', label: 'Food & Nutrition', icon: Utensils, desc: 'Meals & pantry spend' },
    { route: '/health', label: 'Health & Recovery', icon: Activity, desc: 'Sleep, water & workout' },
    { route: '/goals', label: 'Goals Hierarchy', icon: Target, desc: 'Decomposed milestone goals' },
    { route: '/journal', label: 'Daily Journal', icon: BookMarked, desc: 'Reflection & priorities' },
    { route: '/analytics', label: 'Analytics & Trends', icon: BarChart3, desc: 'Recharts visualizations' },
    { route: '/reports', label: 'Reports Generator', icon: FileText, desc: 'Daily/Weekly/Monthly PDF' },
    { route: '/export', label: 'Export Center', icon: Download, desc: 'JSON/CSV data backup' },
    { route: '/settings', label: 'Settings & Theme', icon: Settings, desc: 'Profile & aesthetics' }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
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
