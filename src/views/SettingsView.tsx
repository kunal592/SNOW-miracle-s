import React, { useState } from 'react';
import { Settings, User as UserIcon, Sparkles, Moon, Sun, Bell, Database, ShieldAlert, Trash2, CheckCircle2 } from 'lucide-react';
import { User, Category } from '../types';
import { Storage } from '../lib/storage';

interface SettingsViewProps {
  user: User;
  onUpdateUser: (user: User) => void;
  categories: Category[];
  onShowToast: (msg: string, type?: 'success' | 'info') => void;
  onNavigate?: (route: string) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  user,
  onUpdateUser,
  categories,
  onShowToast,
  onNavigate
}) => {
  const [userName, setUserName] = useState(user.name);
  const [userTitle, setUserTitle] = useState(user.title);
  const [theme, setTheme] = useState(user.themePreference || 'warm-hearth');

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = { ...user, name: userName, title: userTitle, themePreference: theme };
    onUpdateUser(updated);
    onShowToast('Profile & Settings updated successfully', 'success');
  };

  const handleResetData = () => {
    if (window.confirm('Are you sure you want to reset local storage? This will revert all mock data to initial defaults.')) {
      Storage.resetAll();
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl font-black text-amber-100 font-outfit flex items-center gap-2">
          <Settings className="w-6 h-6 text-amber-400" /> Settings & Preferences
        </h1>
        <p className="text-xs text-amber-200/80">Configure profile, theme aesthetic, offline synchronization, and protocol parameters.</p>
      </div>

      <div className="space-y-6">
        {/* PROFILE SECTION */}
        <div className="p-6 rounded-3xl bg-[#1c1815] border border-amber-500/20 shadow-md space-y-4">
          <h2 className="text-base font-bold text-amber-100 font-outfit flex items-center gap-2">
            <UserIcon className="w-4 h-4 text-amber-400" /> User Profile & Protocol Title
          </h2>

          <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-neutral-300 mb-1 font-semibold">User Name</label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full bg-[#12100e] border border-amber-500/30 rounded-xl p-3 text-amber-100"
                />
              </div>

              <div>
                <label className="block text-neutral-300 mb-1 font-semibold">Protocol Subtitle</label>
                <input
                  type="text"
                  value={userTitle}
                  onChange={(e) => setUserTitle(e.target.value)}
                  className="w-full bg-[#12100e] border border-amber-500/30 rounded-xl p-3 text-amber-100"
                />
              </div>
            </div>

            {/* APPEARANCE THEMES */}
            <div className="space-y-2 pt-2 border-t border-amber-500/15">
              <label className="block text-neutral-300 font-semibold">Visual Aesthetics Theme</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  { id: 'warm-hearth', label: 'Warm Hearth (Default)', color: 'bg-gradient-to-r from-amber-500 to-orange-600' },
                  { id: 'cozy-light', label: 'Cozy Sunset Light', color: 'bg-amber-200 text-neutral-900' },
                  { id: 'amber-gold', label: 'Amber Gold', color: 'bg-amber-400 text-neutral-950' },
                  { id: 'cyber-ember', label: 'Cyber Ember', color: 'bg-gradient-to-r from-orange-500 to-rose-600' }
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTheme(t.id as any)}
                    className={`p-3 rounded-2xl border text-xs font-bold transition flex items-center justify-between ${
                      theme === t.id ? 'border-amber-500 bg-amber-500/20 text-amber-200' : 'border-neutral-800 bg-[#12100e] text-neutral-400'
                    }`}
                  >
                    <span>{t.label}</span>
                    <div className={`w-3 h-3 rounded-full ${t.color}`} />
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-neutral-950 font-bold text-xs shadow-lg flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" /> Save Profile Preferences
            </button>
          </form>
        </div>

        {/* CUSTOMIZE WORKSPACE & PROFILE TABS */}
        <div className="p-6 rounded-3xl bg-[#1c1815] border border-amber-500/30 shadow-md space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-amber-100 font-outfit flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" /> Customize Workspace & Profile Tabs
            </h2>
            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
              NEW
            </span>
          </div>

          <p className="text-xs text-neutral-300 leading-relaxed">
            Choose which modules appear in your Personal OS navigation and home dashboard. Hide areas you don't use, select your launch view, or start with 1-click workspace presets.
          </p>

          <div className="pt-2 flex items-center gap-3">
            <button
              onClick={() => onNavigate && onNavigate('/settings/workspace')}
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition"
            >
              <Sparkles className="w-4 h-4" /> Open Workspace Customization
            </button>
          </div>
        </div>

        {/* AI PROFILE IMPORT BRIDGE */}
        <div className="p-6 rounded-3xl bg-[#1c1815] border border-amber-500/30 shadow-md space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-amber-100 font-outfit flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" /> AI Profile Import & Life Context Sync
            </h2>
            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
              FEATURED
            </span>
          </div>

          <p className="text-xs text-neutral-300 leading-relaxed">
            Bring your existing ChatGPT context, goals, skills, routines, and milestones directly into your Personal OS without manual entry. Features a 5-step preview, conflict detector, and two-way sync.
          </p>

          <div className="pt-2 flex items-center gap-3">
            <button
              onClick={() => onNavigate && onNavigate('/settings/import')}
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition"
            >
              <Sparkles className="w-4 h-4" /> Open AI Profile Import Engine
            </button>
          </div>
        </div>

        {/* DATA & OFFLINE RESET */}
        <div className="p-6 rounded-3xl bg-[#1c1815] border border-rose-500/20 shadow-md space-y-3">
          <h2 className="text-base font-bold text-rose-300 font-outfit flex items-center gap-2">
            <Database className="w-4 h-4 text-rose-400" /> Data Storage & Reset
          </h2>
          <p className="text-xs text-neutral-400">
            This prototype stores all mock data in browser local storage. You can reset to initial mock dataset anytime.
          </p>
          <button
            onClick={handleResetData}
            className="px-4 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 font-bold text-xs flex items-center gap-1.5 transition"
          >
            <Trash2 className="w-4 h-4" /> Reset Storage to Mock Defaults
          </button>
        </div>
      </div>
    </div>
  );
};
