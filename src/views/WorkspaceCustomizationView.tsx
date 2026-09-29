import React, { useState } from 'react';
import {
  Layout,
  CheckCircle,
  RotateCcw,
  Sparkles,
  Home,
  Inbox,
  DollarSign,
  Clock,
  BookOpen,
  Utensils,
  Activity,
  Target,
  Flag,
  BrainCircuit,
  BookMarked,
  BarChart3,
  FileText,
  Lock,
  ArrowUp,
  ArrowDown,
  SlidersHorizontal,
  Eye,
  EyeOff,
  Layers,
  ShieldCheck,
  Check,
  AlertCircle
} from 'lucide-react';
import {
  ModuleDefinition,
  ModuleId,
  ModuleCategory,
  WorkspacePreferences,
  WorkspacePreset
} from '../types';
import {
  MODULE_REGISTRY,
  ALL_MODULE_IDS,
  PRESET_CONFIGURATIONS,
  DEFAULT_WORKSPACE_PREFERENCES,
  getModulesByCategory,
  getModuleById
} from '../lib/moduleRegistry';

interface WorkspaceCustomizationViewProps {
  preferences: WorkspacePreferences;
  onUpdatePreferences: (newPrefs: WorkspacePreferences) => void;
  onShowToast: (msg: string, type?: 'success' | 'info') => void;
  onNavigate: (route: string) => void;
}

export function WorkspaceCustomizationView({
  preferences,
  onUpdatePreferences,
  onShowToast,
  onNavigate
}: WorkspaceCustomizationViewProps) {
  const [localPrefs, setLocalPrefs] = useState<WorkspacePreferences>(preferences);
  const [activePreset, setActivePreset] = useState<WorkspacePreset | 'Custom'>('Custom');
  const [showRestoreModal, setShowRestoreModal] = useState(false);

  const enabledCount = localPrefs.enabledModules.length;
  const hiddenCount = ALL_MODULE_IDS.length - enabledCount;

  // Helper to resolve icon component dynamically
  const renderModuleIcon = (iconName: string, className: string = 'w-5 h-5') => {
    switch (iconName) {
      case 'Home':
        return <Home className={className} />;
      case 'Inbox':
        return <Inbox className={className} />;
      case 'Sparkles':
        return <Sparkles className={className} />;
      case 'Clock':
        return <Clock className={className} />;
      case 'Utensils':
        return <Utensils className={className} />;
      case 'Activity':
        return <Activity className={className} />;
      case 'BookMarked':
        return <BookMarked className={className} />;
      case 'DollarSign':
        return <DollarSign className={className} />;
      case 'BookOpen':
        return <BookOpen className={className} />;
      case 'Target':
        return <Target className={className} />;
      case 'Flag':
        return <Flag className={className} />;
      case 'BrainCircuit':
        return <BrainCircuit className={className} />;
      case 'BarChart3':
        return <BarChart3 className={className} />;
      case 'FileText':
        return <FileText className={className} />;
      default:
        return <Layout className={className} />;
    }
  };

  const handleToggleModule = (id: ModuleId) => {
    if (id === 'home' || id === 'inbox') return; // Cannot hide core modules

    const isCurrentlyEnabled = localPrefs.enabledModules.includes(id);
    let updatedEnabled: ModuleId[];

    if (isCurrentlyEnabled) {
      updatedEnabled = localPrefs.enabledModules.filter((m) => m !== id);
    } else {
      updatedEnabled = [...localPrefs.enabledModules, id];
    }

    // Ensure defaultView is still an enabled module
    let updatedDefault = localPrefs.defaultView;
    if (!updatedEnabled.includes(updatedDefault)) {
      updatedDefault = 'home';
    }

    const updated = {
      ...localPrefs,
      enabledModules: updatedEnabled,
      defaultView: updatedDefault,
      hasCompletedWorkspaceSetup: true
    };

    setLocalPrefs(updated);
    setActivePreset('Custom');
    onUpdatePreferences(updated);
    onShowToast(isCurrentlyEnabled ? `Module hidden from workspace` : `Module added to workspace`, 'info');
  };

  const handleApplyPreset = (presetName: WorkspacePreset) => {
    const presetModules = PRESET_CONFIGURATIONS[presetName];
    let updatedDefault = localPrefs.defaultView;
    if (!presetModules.includes(updatedDefault)) {
      updatedDefault = 'home';
    }

    const updated = {
      ...localPrefs,
      enabledModules: [...presetModules],
      defaultView: updatedDefault,
      hasCompletedWorkspaceSetup: true
    };

    setLocalPrefs(updated);
    setActivePreset(presetName);
    onUpdatePreferences(updated);
    onShowToast(`Applied ${presetName} workspace preset!`, 'success');
  };

  const handleSelectAll = () => {
    const updated = {
      ...localPrefs,
      enabledModules: [...ALL_MODULE_IDS],
      hasCompletedWorkspaceSetup: true
    };
    setLocalPrefs(updated);
    setActivePreset('Full Life');
    onUpdatePreferences(updated);
    onShowToast('All modules enabled in workspace', 'success');
  };

  const handleResetToDefault = () => {
    setLocalPrefs(DEFAULT_WORKSPACE_PREFERENCES);
    setActivePreset('Full Life');
    onUpdatePreferences(DEFAULT_WORKSPACE_PREFERENCES);
    setShowRestoreModal(false);
    onShowToast('Restored full workspace defaults', 'success');
  };

  const handleSetDefaultView = (viewId: ModuleId) => {
    const updated = {
      ...localPrefs,
      defaultView: viewId,
      hasCompletedWorkspaceSetup: true
    };
    setLocalPrefs(updated);
    onUpdatePreferences(updated);
    onShowToast(`App will now open directly to ${viewId.toUpperCase()}`, 'success');
  };

  const handleMoveDashboardItem = (index: number, direction: 'up' | 'down') => {
    const list = [...localPrefs.dashboardOrder];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= list.length) return;

    const temp = list[index];
    list[index] = list[targetIndex];
    list[targetIndex] = temp;

    const updated = {
      ...localPrefs,
      dashboardOrder: list
    };
    setLocalPrefs(updated);
    onUpdatePreferences(updated);
  };

  const categories: { key: ModuleCategory; title: string; desc: string }[] = [
    { key: 'core', title: 'CORE SYSTEM', desc: 'Essential operating system foundation' },
    { key: 'life', title: 'LIFE LOGGING', desc: 'Time, daily habits, food, health & reflection' },
    { key: 'money', title: 'MONEY & CONSUMPTION', desc: 'Financial tracking & resource allocation' },
    { key: 'growth', title: 'GROWTH & STRATEGY', desc: 'Learning, goals, milestones & cognitive lab' },
    { key: 'insights', title: 'INSIGHTS & REPORTS', desc: 'Analytics visualizations & generated reports' }
  ];

  const enabledModuleDefs = MODULE_REGISTRY.filter((m) => localPrefs.enabledModules.includes(m.id));
  const hiddenModuleDefs = MODULE_REGISTRY.filter((m) => !localPrefs.enabledModules.includes(m.id));

  return (
    <div className="space-y-6 pb-16 max-w-5xl mx-auto animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-950/70 via-stone-900 to-amber-900/40 p-6 rounded-3xl border border-amber-500/25 shadow-xl backdrop-blur-md relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-amber-400 text-xs font-bold tracking-wider uppercase mb-1">
              <SlidersHorizontal className="w-4 h-4" />
              Workspace Customization
            </div>
            <h1 className="text-3xl font-black text-amber-100 font-outfit tracking-tight">MY WORKSPACE</h1>
            <p className="text-xs md:text-sm text-neutral-300 mt-1 max-w-xl">
              Choose what appears in your Personal OS. Hide areas you don't use to keep your workspace focused and clutter-free.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSelectAll}
              className="px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-amber-200 border border-amber-500/30 font-bold text-xs transition"
            >
              [ SELECT ALL ]
            </button>
            <button
              onClick={() => setShowRestoreModal(true)}
              className="px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-neutral-300 border border-stone-700 font-bold text-xs transition"
            >
              [ RESET DEFAULT ]
            </button>
          </div>
        </div>

        {/* Safety Data Integrity Note */}
        <div className="mt-4 pt-3 border-t border-amber-500/20 flex items-center justify-between text-xs text-amber-300/80">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="font-semibold text-emerald-300">Data Integrity Safe:</span> Hiding a module never deletes your data or logs.
          </div>
          <span className="text-neutral-400 italic text-[11px]">Re-enable anytime to restore full UI view</span>
        </div>
      </div>

      {/* 1. PERSONALIZATION SUMMARY BAR */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 rounded-2xl bg-[#1c1815] border border-amber-500/20 shadow-md">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-[#12100e] border border-emerald-500/20">
          <div className="p-2.5 rounded-lg bg-emerald-500/20 text-emerald-400 font-bold">
            <Eye className="w-5 h-5" />
          </div>
          <div>
            <div className="text-lg font-black text-emerald-300 font-outfit">{enabledCount} Modules Active</div>
            <div className="text-[11px] text-neutral-400">Visible in navigation & dashboard</div>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 rounded-xl bg-[#12100e] border border-amber-500/15">
          <div className="p-2.5 rounded-lg bg-stone-800 text-neutral-400 font-bold">
            <EyeOff className="w-5 h-5" />
          </div>
          <div>
            <div className="text-lg font-black text-neutral-300 font-outfit">{hiddenCount} Hidden Modules</div>
            <div className="text-[11px] text-neutral-400">Data intact in background</div>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 rounded-xl bg-[#12100e] border border-amber-500/20">
          <div className="p-2.5 rounded-lg bg-amber-500/20 text-amber-400 font-bold">
            <Home className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs text-neutral-400">Default Launch Screen</div>
            <div className="text-base font-bold text-amber-200 capitalize truncate font-outfit">
              {localPrefs.defaultView}
            </div>
          </div>
        </div>
      </div>

      {/* 2. PROFILE MODE PRESETS */}
      <div className="p-5 rounded-3xl bg-[#1c1815] border border-amber-500/20 shadow-md space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-amber-100 uppercase tracking-wider font-outfit flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" /> Start With A Preset
          </h2>
          <span className="text-[10px] text-neutral-400">1-Click Workspace Profiles</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          {(['Full Life', 'Productivity', 'Finance', 'Health', 'Developer'] as WorkspacePreset[]).map((preset) => {
            const isActive = activePreset === preset;
            return (
              <button
                key={preset}
                onClick={() => handleApplyPreset(preset)}
                className={`p-3 rounded-2xl border text-xs font-bold transition text-left flex flex-col justify-between ${
                  isActive
                    ? 'bg-amber-500/20 border-amber-500 text-amber-200 shadow-md shadow-amber-950/40'
                    : 'bg-[#12100e] border-neutral-800 text-neutral-300 hover:border-amber-500/40'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span className="font-outfit text-sm">{preset}</span>
                  {isActive && <Check className="w-3.5 h-3.5 text-amber-400" />}
                </div>
                <div className="text-[10px] font-normal text-neutral-400">
                  {preset === 'Full Life'
                    ? '14 modules'
                    : preset === 'Productivity'
                    ? '8 modules'
                    : preset === 'Finance'
                    ? '6 modules'
                    : preset === 'Health'
                    ? '6 modules'
                    : '7 modules'}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. MODULE CATEGORIES TOGGLE LIST */}
      <div className="space-y-6">
        {categories.map((cat) => {
          const categoryModules = getModulesByCategory(cat.key);
          if (categoryModules.length === 0) return null;

          return (
            <div key={cat.key} className="p-6 rounded-3xl bg-[#1c1815] border border-amber-500/20 shadow-md space-y-4">
              <div>
                <h2 className="text-base font-extrabold text-amber-100 font-outfit tracking-wide">{cat.title}</h2>
                <p className="text-xs text-neutral-400">{cat.desc}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {categoryModules.map((mod) => {
                  const isEnabled = localPrefs.enabledModules.includes(mod.id);
                  const isCore = !mod.canHide;

                  return (
                    <div
                      key={mod.id}
                      onClick={() => !isCore && handleToggleModule(mod.id)}
                      className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-3 ${
                        isCore
                          ? 'bg-[#12100e] border-amber-500/30'
                          : isEnabled
                          ? 'bg-[#12100e] border-amber-500/25 hover:border-amber-500/50 cursor-pointer shadow-md'
                          : 'bg-[#12100e]/40 border-neutral-800 opacity-60 hover:opacity-100 hover:border-neutral-700 cursor-pointer'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`p-2.5 rounded-xl shrink-0 mt-0.5 ${
                            isEnabled
                              ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                              : 'bg-stone-800 text-neutral-500 border border-neutral-700'
                          }`}
                        >
                          {renderModuleIcon(mod.iconName)}
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-bold text-amber-100 font-outfit">{mod.name}</h3>
                            {isCore && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                                <Lock className="w-3 h-3 text-amber-400" /> Core
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-neutral-400 mt-1 leading-relaxed">{mod.description}</p>
                        </div>
                      </div>

                      {/* Toggle Switch */}
                      {!isCore ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleModule(mod.id);
                          }}
                          className={`px-3 py-1.5 rounded-xl font-extrabold text-xs transition shrink-0 flex items-center gap-1.5 ${
                            isEnabled
                              ? 'bg-amber-500 text-neutral-950 shadow-md shadow-amber-950/60'
                              : 'bg-stone-800 text-neutral-400 hover:text-neutral-200'
                          }`}
                        >
                          {isEnabled ? 'SHOW' : 'HIDE'}
                        </button>
                      ) : (
                        <span className="text-[11px] font-bold text-amber-400/80 px-2 py-1 rounded bg-amber-500/10">
                          ALWAYS ON
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* 4. DEFAULT VIEW SELECTOR */}
      <div className="p-6 rounded-3xl bg-[#1c1815] border border-amber-500/20 shadow-md space-y-4">
        <div>
          <h2 className="text-base font-extrabold text-amber-100 font-outfit">OPEN APP TO (DEFAULT VIEW)</h2>
          <p className="text-xs text-neutral-400">Where should your Personal OS open when you launch it?</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {enabledModuleDefs.map((mod) => {
            const isSelected = localPrefs.defaultView === mod.id;
            return (
              <button
                key={mod.id}
                onClick={() => handleSetDefaultView(mod.id)}
                className={`p-3.5 rounded-2xl border text-xs font-bold transition flex items-center justify-between ${
                  isSelected
                    ? 'bg-amber-500/20 border-amber-500 text-amber-200 shadow-md'
                    : 'bg-[#12100e] border-neutral-800 text-neutral-300 hover:border-amber-500/30'
                }`}
              >
                <div className="flex items-center gap-2">
                  {renderModuleIcon(mod.iconName, 'w-4 h-4 text-amber-400')}
                  <span className="font-outfit truncate">{mod.name}</span>
                </div>
                {isSelected && <Check className="w-4 h-4 text-amber-400 shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* 5. ARRANGE HOME DASHBOARD ORDER */}
      <div className="p-6 rounded-3xl bg-[#1c1815] border border-amber-500/20 shadow-md space-y-4">
        <div>
          <h2 className="text-base font-extrabold text-amber-100 font-outfit">ARRANGE YOUR HOME SCREEN</h2>
          <p className="text-xs text-neutral-400">Reorder dashboard section cards on your Home command center.</p>
        </div>

        <div className="space-y-2">
          {localPrefs.dashboardOrder.map((modId, idx) => {
            const mod = getModuleById(modId);
            if (!mod) return null;
            const isEnabled = localPrefs.enabledModules.includes(modId);

            return (
              <div
                key={modId}
                className={`p-3 rounded-2xl border flex items-center justify-between ${
                  isEnabled ? 'bg-[#12100e] border-amber-500/20' : 'bg-[#12100e]/40 border-neutral-800 opacity-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-stone-800 text-amber-300 text-xs font-bold flex items-center justify-center font-outfit">
                    {idx + 1}
                  </span>
                  {renderModuleIcon(mod.iconName, 'w-4 h-4 text-amber-400')}
                  <span className="text-xs font-bold text-amber-100 font-outfit">{mod.name}</span>
                  {!isEnabled && <span className="text-[10px] text-orange-400 font-medium">(Hidden in Workspace)</span>}
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleMoveDashboardItem(idx, 'up')}
                    disabled={idx === 0}
                    className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 disabled:opacity-30 text-neutral-300"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleMoveDashboardItem(idx, 'down')}
                    disabled={idx === localPrefs.dashboardOrder.length - 1}
                    className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 disabled:opacity-30 text-neutral-300"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 6. HIDDEN MODULES RESTORATION SECTION */}
      {hiddenModuleDefs.length > 0 && (
        <div className="p-6 rounded-3xl bg-[#1c1815] border border-orange-500/20 shadow-md space-y-4">
          <div>
            <h2 className="text-base font-extrabold text-orange-300 font-outfit flex items-center gap-2">
              <EyeOff className="w-5 h-5 text-orange-400" /> HIDDEN MODULES ({hiddenModuleDefs.length})
            </h2>
            <p className="text-xs text-neutral-400">These modules are hidden from navigation. Tap enable to restore them anytime.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {hiddenModuleDefs.map((mod) => (
              <div key={mod.id} className="p-3.5 rounded-2xl bg-[#12100e] border border-neutral-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {renderModuleIcon(mod.iconName, 'w-4 h-4 text-neutral-400')}
                  <div>
                    <div className="text-xs font-bold text-neutral-300 font-outfit">{mod.name}</div>
                    <div className="text-[10px] text-neutral-500">Currently Hidden</div>
                  </div>
                </div>

                <button
                  onClick={() => handleToggleModule(mod.id)}
                  className="px-3 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow"
                >
                  [ ENABLE ]
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* RESTORE CONFIRMATION MODAL */}
      {showRestoreModal && (
        <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1c1815] border border-amber-500/30 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-amber-500/20 text-amber-400">
                <RotateCcw className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-amber-100 font-outfit">Restore Full Workspace?</h3>
                <p className="text-xs text-neutral-400">Enable all 14 modules across navigation & home screen.</p>
              </div>
            </div>

            <p className="text-xs text-neutral-300 leading-relaxed bg-[#12100e] p-3 rounded-xl border border-neutral-800">
              Your logged entries, goals, financial data, and AI knowledge will remain unchanged.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowRestoreModal(false)}
                className="px-4 py-2 rounded-xl bg-stone-800 text-neutral-300 font-bold text-xs"
              >
                [ CANCEL ]
              </button>
              <button
                onClick={handleResetToDefault}
                className="px-5 py-2 rounded-xl bg-amber-500 text-neutral-950 font-extrabold text-xs shadow-lg shadow-amber-950/60"
              >
                [ RESTORE WORKSPACE ]
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
