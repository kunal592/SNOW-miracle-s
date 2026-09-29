import React from 'react';
import { Home, Inbox, Target, Plus, Menu } from 'lucide-react';

interface MobileBottomNavProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
  onOpenQuickAdd: () => void;
  unreadInboxCount: number;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentRoute,
  onNavigate,
  onOpenQuickAdd,
  unreadInboxCount
}) => {
  const navItems = [
    { route: '/', label: 'Home', icon: Home },
    { route: '/inbox', label: 'Inbox', icon: Inbox, badge: unreadInboxCount },
    { route: 'QUICK_ADD', label: 'Add', icon: Plus, isAction: true },
    { route: '/goals', label: 'Goals', icon: Target },
    { route: '/more', label: 'More', icon: Menu }
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#16120f]/95 backdrop-blur-md border-t border-amber-500/20 safe-pb shadow-2xl">
      <div className="flex items-center justify-around h-16 px-2 max-w-md mx-auto relative">
        {navItems.map((item) => {
          if (item.isAction) {
            return (
              <button
                key="quick_add_btn"
                onClick={onOpenQuickAdd}
                className="relative -top-4 p-3.5 rounded-full bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 text-neutral-950 font-bold shadow-lg shadow-amber-950/80 hover:scale-105 active:scale-95 transition-all border-2 border-[#12100e] group"
                aria-label="Quick Add Entry"
              >
                <Plus className="w-6 h-6 stroke-[2.5]" />
              </button>
            );
          }

          const isActive = currentRoute === item.route || (item.route !== '/' && currentRoute.startsWith(item.route));
          const Icon = item.icon;

          return (
            <button
              key={item.route}
              onClick={() => onNavigate(item.route)}
              className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-xs font-medium transition-all relative ${
                isActive ? 'text-amber-400' : 'text-neutral-400 hover:text-amber-200/80'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : ''}`} />
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1 -right-2 min-w-4 h-4 px-1 rounded-full bg-orange-600 text-[9px] font-bold text-white flex items-center justify-center border border-[#16120f]">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] mt-1 ${isActive ? 'font-bold text-amber-300' : ''}`}>
                {item.label}
              </span>

              {/* Active warm indicator pill */}
              {isActive && (
                <span className="absolute top-0 w-8 h-0.5 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
