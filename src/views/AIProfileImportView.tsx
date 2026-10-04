import React, { useState } from 'react';
import {
  Sparkles,
  Copy,
  Check,
  ArrowRight,
  RefreshCw,
  AlertTriangle,
  FileText,
  ShieldCheck,
  Layers,
  Edit3,
  CheckCircle,
  XCircle,
  Clock,
  Download,
  Upload,
  UserCheck,
  Target,
  BookOpen,
  FolderGit2,
  Flag,
  RotateCcw,
  DollarSign,
  Heart,
  Settings as SettingsIcon,
  HelpCircle
} from 'lucide-react';
import {
  AIImportMode,
  AIImportItem,
  AIImportItemStatus,
  AIImportPreview,
  User,
  Goal,
  LearningGoal,
  Milestone,
  ConsumptionExpense,
  HealthEntry
} from '../types';
import {
  generateChatGPTImportPrompt,
  parseAndAnalyzeAIContext,
  generateExportablePersonalContext,
  commitImportItems,
  ExistingPWAData
} from '../lib/importAnalyzer';

interface AIProfileImportViewProps {
  user: User;
  goals: Goal[];
  learningGoals: LearningGoal[];
  milestones: Milestone[];
  consumption: ConsumptionExpense[];
  health: HealthEntry[];
  onNavigate: (route: string) => void;
  onShowToast: (text: string, type?: 'success' | 'error' | 'info') => void;
  onRefreshData?: () => void;
}

export function AIProfileImportView({
  user,
  goals,
  learningGoals,
  milestones,
  consumption,
  health,
  onNavigate,
  onShowToast,
  onRefreshData
}: AIProfileImportViewProps) {
  const [activeTab, setActiveTab] = useState<AIImportMode | 'Export'>('Guided');
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [copiedExport, setCopiedExport] = useState(false);
  const [pastedText, setPastedText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [preview, setPreview] = useState<AIImportPreview | null>(null);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('All');
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [importSuccessResult, setImportSuccessResult] = useState<{
    addedGoalsCount: number;
    addedLearningCount: number;
    addedMilestoneCount: number;
    addedRoutineCount: number;
    profileUpdated: boolean;
  } | null>(null);

  const existingData: ExistingPWAData = { user, goals, learningGoals, milestones, consumption, health };

  const currentPromptText = generateChatGPTImportPrompt(
    activeTab === 'Export' ? 'Guided' : activeTab,
    'SNOW'
  );

  const exportableText = generateExportablePersonalContext(existingData);

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(currentPromptText);
    setCopiedPrompt(true);
    onShowToast('Prompt copied to clipboard! Paste it into ChatGPT.', 'success');
    setTimeout(() => setCopiedPrompt(false), 3000);
  };

  const handleCopyExport = () => {
    navigator.clipboard.writeText(exportableText);
    setCopiedExport(true);
    onShowToast('Personal profile context copied! Paste into ChatGPT.', 'success');
    setTimeout(() => setCopiedExport(false), 3000);
  };

  const handleAnalyzeText = () => {
    if (!pastedText.trim()) {
      onShowToast('Please paste your ChatGPT response text first.', 'error');
      return;
    }

    setIsAnalyzing(true);
    setImportSuccessResult(null);

    setTimeout(() => {
      const modeToUse = activeTab === 'Export' ? 'Guided' : activeTab;
      const res = parseAndAnalyzeAIContext(pastedText, modeToUse, existingData);
      setPreview(res);
      setIsAnalyzing(false);
      onShowToast(`Analyzed! Found ${res.totalFound} context items.`, 'success');
    }, 600);
  };

  const handleToggleItemAction = (itemId: string, action: 'Import' | 'Ignore' | 'Edit') => {
    if (!preview) return;

    const updatedItems = preview.items.map((item) => {
      if (item.id === itemId) {
        return { ...item, selectedAction: action };
      }
      return item;
    });

    setPreview({
      ...preview,
      items: updatedItems
    });
  };

  const handleUpdateItemField = (itemId: string, field: 'editedTitle' | 'editedDetail', val: string) => {
    if (!preview) return;

    const updatedItems = preview.items.map((item) => {
      if (item.id === itemId) {
        return { ...item, [field]: val };
      }
      return item;
    });

    setPreview({
      ...preview,
      items: updatedItems
    });
  };

  const handleSelectAll = (select: boolean) => {
    if (!preview) return;

    const updatedItems = preview.items.map((item) => ({
      ...item,
      selectedAction: select ? ('Import' as const) : ('Ignore' as const)
    }));

    setPreview({
      ...preview,
      items: updatedItems
    });
  };

  const handleCommitImport = () => {
    if (!preview) return;

    const selectedItems = preview.items.filter((item) => item.selectedAction === 'Import');
    if (selectedItems.length === 0) {
      onShowToast('No items selected for import.', 'info');
      return;
    }

    const result = commitImportItems(selectedItems, existingData);
    setImportSuccessResult(result);
    setPreview(null);
    setPastedText('');

    if (onRefreshData) onRefreshData();

    onShowToast(`Import complete! Added ${selectedItems.length} items into your Personal OS.`, 'success');
  };

  const filteredItems = preview
    ? preview.items.filter((item) => {
        if (selectedCategoryFilter === 'All') return true;
        if (selectedCategoryFilter === 'Needs Review')
          return item.status === 'Outdated' || item.status === 'Conflict';
        return item.module === selectedCategoryFilter;
      })
    : [];

  const getModuleIcon = (mod: AIImportItem['module']) => {
    switch (mod) {
      case 'Profile':
        return <UserCheck className="w-4 h-4 text-amber-400" />;
      case 'Goals':
        return <Target className="w-4 h-4 text-emerald-400" />;
      case 'Learning':
        return <BookOpen className="w-4 h-4 text-blue-400" />;
      case 'Projects':
        return <FolderGit2 className="w-4 h-4 text-purple-400" />;
      case 'Milestones':
        return <Flag className="w-4 h-4 text-red-400" />;
      case 'Routines':
        return <Clock className="w-4 h-4 text-amber-300" />;
      case 'Financial':
        return <DollarSign className="w-4 h-4 text-emerald-300" />;
      case 'Health':
        return <Heart className="w-4 h-4 text-rose-400" />;
      case 'Preferences':
        return <SettingsIcon className="w-4 h-4 text-cyan-400" />;
      default:
        return <Sparkles className="w-4 h-4 text-amber-400" />;
    }
  };

  const getStatusBadge = (status: AIImportItemStatus) => {
    switch (status) {
      case 'New':
        return (
          <span className="px-2 py-0.5 rounded text-xs font-medium bg-emerald-950/80 text-emerald-300 border border-emerald-800/50 flex items-center gap-1">
            <CheckCircle className="w-3 h-3 text-emerald-400" /> New Item
          </span>
        );
      case 'Changed':
        return (
          <span className="px-2 py-0.5 rounded text-xs font-medium bg-amber-950/80 text-amber-300 border border-amber-800/50 flex items-center gap-1">
            <RefreshCw className="w-3 h-3 text-amber-400" /> Updated
          </span>
        );
      case 'Outdated':
        return (
          <span className="px-2 py-0.5 rounded text-xs font-medium bg-orange-950/80 text-orange-300 border border-orange-800/50 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3 text-orange-400" /> ⚠ Needs confirmation
          </span>
        );
      case 'Conflict':
        return (
          <span className="px-2 py-0.5 rounded text-xs font-medium bg-red-950/80 text-red-300 border border-red-800/50 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3 text-red-400" /> ⚠ Conflict with PWA
          </span>
        );
      case 'Unchanged':
        return (
          <span className="px-2 py-0.5 rounded text-xs font-medium bg-slate-800 text-slate-400 border border-slate-700 flex items-center gap-1">
            Unchanged
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-950/60 via-stone-900 to-amber-900/40 p-6 rounded-2xl border border-amber-500/20 shadow-xl backdrop-blur-md relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Sparkles className="w-40 h-40 text-amber-400" />
        </div>
        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-2 text-amber-400 text-sm font-semibold tracking-wider uppercase">
            <Sparkles className="w-4 h-4" />
            AI Context Bridge
          </div>
          <h1 className="text-3xl font-bold text-slate-100 tracking-tight">AI Profile Import</h1>
          <p className="text-slate-300 max-w-2xl text-sm leading-relaxed">
            Bring your existing ChatGPT context into your SNOW Personal Operating System. Initialize or update your goals, skills, routines, learning paths, and milestones with zero manual entry.
          </p>
        </div>

        {/* Safety Rule Badge & Quick Skip */}
        <div className="mt-4 pt-4 border-t border-amber-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-300/90">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-medium">Protocol:</span> Copy Prompt → Paste ChatGPT Output → Analyze & Import
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onNavigate('/')}
              className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-200 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
            >
              <span>Skip & Start Clean Workspace</span>
              <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Mode Selector Tabs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 p-1.5 bg-stone-900/80 rounded-xl border border-stone-800">
        <button
          onClick={() => {
            setActiveTab('Guided');
            setPreview(null);
          }}
          className={`flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium text-xs md:text-sm transition-all ${
            activeTab === 'Guided'
              ? 'bg-amber-500 text-stone-950 font-semibold shadow-lg shadow-amber-500/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-stone-800/50'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          Guided Import
        </button>

        <button
          onClick={() => {
            setActiveTab('Quick');
            setPreview(null);
          }}
          className={`flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium text-xs md:text-sm transition-all ${
            activeTab === 'Quick'
              ? 'bg-amber-500 text-stone-950 font-semibold shadow-lg shadow-amber-500/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-stone-800/50'
          }`}
        >
          <Upload className="w-4 h-4" />
          Quick Dump
        </button>

        <button
          onClick={() => {
            setActiveTab('Periodic');
            setPreview(null);
          }}
          className={`flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium text-xs md:text-sm transition-all ${
            activeTab === 'Periodic'
              ? 'bg-amber-500 text-stone-950 font-semibold shadow-lg shadow-amber-500/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-stone-800/50'
          }`}
        >
          <RotateCcw className="w-4 h-4" />
          30-Day Refresh
        </button>

        <button
          onClick={() => {
            setActiveTab('Export');
            setPreview(null);
          }}
          className={`flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium text-xs md:text-sm transition-all ${
            activeTab === 'Export'
              ? 'bg-amber-500 text-stone-950 font-semibold shadow-lg shadow-amber-500/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-stone-800/50'
          }`}
        >
          <Download className="w-4 h-4" />
          Two-Way Export
        </button>
      </div>

      {/* Main Content Area */}
      {activeTab !== 'Export' ? (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Step 1: Prompt Card */}
          <div className="bg-stone-900/70 rounded-2xl border border-stone-800 p-6 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-amber-500 text-stone-950 text-xs font-bold flex items-center justify-center">
                    1
                  </span>
                  <h2 className="text-lg font-semibold text-slate-100">
                    {activeTab === 'Guided'
                      ? 'Generate Structured Prompt'
                      : activeTab === 'Quick'
                      ? 'Quick Context Extractor'
                      : '30-Day Delta Refresh Prompt'}
                  </h2>
                </div>
                <span className="text-xs px-2 py-1 rounded bg-stone-800 text-amber-300 font-mono">
                  {activeTab} Mode
                </span>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">
                Copy this prompt and paste it into ChatGPT. It instructs ChatGPT to gather your goals, skills, routines, and milestones into a clean structure.
              </p>

              <div className="bg-stone-950 p-4 rounded-xl border border-stone-800 max-h-64 overflow-y-auto text-xs font-mono text-amber-200/90 leading-relaxed space-y-2 relative group">
                <pre className="whitespace-pre-wrap font-sans text-xs text-amber-100/80">
                  {currentPromptText}
                </pre>
              </div>
            </div>

            <button
              onClick={handleCopyPrompt}
              className={`w-full py-3 px-4 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-all ${
                copiedPrompt
                  ? 'bg-emerald-600 text-white'
                  : 'bg-amber-500 hover:bg-amber-400 text-stone-950 shadow-lg shadow-amber-500/10'
              }`}
            >
              {copiedPrompt ? (
                <>
                  <Check className="w-4 h-4" />
                  Copied Prompt to Clipboard!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  [ COPY PROMPT ]
                </>
              )}
            </button>
          </div>

          {/* Step 2: Paste Response Card */}
          <div className="bg-stone-900/70 rounded-2xl border border-stone-800 p-6 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-amber-500 text-stone-950 text-xs font-bold flex items-center justify-center">
                  2
                </span>
                <h2 className="text-lg font-semibold text-slate-100">Paste ChatGPT Response</h2>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">
                Paste the response from ChatGPT here. Accepts structured JSON, code blocks, or bullet lists.
              </p>

              <textarea
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                placeholder="Paste ChatGPT output here... (JSON block or markdown notes)"
                className="w-full h-64 bg-stone-950 p-4 rounded-xl border border-stone-800 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-500/60 font-mono resize-none"
              />
            </div>

            <button
              onClick={handleAnalyzeText}
              disabled={isAnalyzing || !pastedText.trim()}
              className={`w-full py-3 px-4 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-all ${
                isAnalyzing || !pastedText.trim()
                  ? 'bg-stone-800 text-slate-500 cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20'
              }`}
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Analyzing ChatGPT Context...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  [ ANALYZE & IMPORT ]
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        /* Two-Way Export View */
        <div className="bg-stone-900/70 rounded-2xl border border-stone-800 p-6 space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold uppercase">
              <Download className="w-4 h-4" />
              PWA → ChatGPT Context Sync
            </div>
            <h2 className="text-xl font-bold text-slate-100">Two-Way Context Export</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Export your current PWA state (goals, learning topics, milestones, daily routines) as structured Markdown. Paste this into ChatGPT so your external AI always understands your active priorities.
            </p>
          </div>

          <div className="bg-stone-950 p-5 rounded-xl border border-stone-800 max-h-96 overflow-y-auto text-xs font-mono text-emerald-300/90 leading-relaxed">
            <pre className="whitespace-pre-wrap">{exportableText}</pre>
          </div>

          <button
            onClick={handleCopyExport}
            className={`w-full md:w-auto py-3 px-6 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-all ${
              copiedExport
                ? 'bg-emerald-600 text-white'
                : 'bg-amber-500 hover:bg-amber-400 text-stone-950 font-semibold shadow-lg shadow-amber-500/20'
            }`}
          >
            {copiedExport ? (
              <>
                <Check className="w-4 h-4" />
                Context Copied to Clipboard!
              </>
            ) : (
                <>
                <Copy className="w-4 h-4" />
                [ COPY PERSONAL CONTEXT FOR CHATGPT ]
              </>
            )}
          </button>
        </div>
      )}

      {/* Success Banner when committed */}
      {importSuccessResult && (
        <div className="bg-emerald-950/70 border border-emerald-500/40 p-6 rounded-2xl space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-emerald-200">Import Successful!</h3>
              <p className="text-xs text-emerald-300/80">
                Your Personal OS has been populated with approved items.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
            <div className="bg-stone-900/80 p-3 rounded-lg border border-emerald-500/20 text-center">
              <div className="text-xl font-bold text-emerald-400">{importSuccessResult.addedGoalsCount}</div>
              <div className="text-xs text-slate-400">Goals Added</div>
            </div>
            <div className="bg-stone-900/80 p-3 rounded-lg border border-emerald-500/20 text-center">
              <div className="text-xl font-bold text-blue-400">{importSuccessResult.addedLearningCount}</div>
              <div className="text-xs text-slate-400">Learning Topics</div>
            </div>
            <div className="bg-stone-900/80 p-3 rounded-lg border border-emerald-500/20 text-center">
              <div className="text-xl font-bold text-red-400">{importSuccessResult.addedMilestoneCount}</div>
              <div className="text-xs text-slate-400">Milestones</div>
            </div>
            <div className="bg-stone-900/80 p-3 rounded-lg border border-emerald-500/20 text-center">
              <div className="text-xl font-bold text-amber-400">{importSuccessResult.addedRoutineCount}</div>
              <div className="text-xs text-slate-400">Routines & Allocations</div>
            </div>
          </div>

          <div className="pt-3 border-t border-emerald-500/20 space-y-2">
            <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider block">What to do next:</span>
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => onNavigate('/')}
                className="py-2.5 px-4 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-stone-950 font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg cursor-pointer"
              >
                🚀 Go to Home Dashboard <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => onNavigate('/goals')}
                className="py-2.5 px-4 bg-emerald-600/30 hover:bg-emerald-600/40 border border-emerald-500/40 text-emerald-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
              >
                🎯 View Goals & Milestones
              </button>
              <button
                onClick={() => onNavigate('/settings/workspace')}
                className="py-2.5 px-4 bg-stone-800 hover:bg-stone-700 text-neutral-300 rounded-xl text-xs font-bold border border-stone-700 transition cursor-pointer"
              >
                ⚙️ Customize Workspace
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Import Preview & Review Panel */}
      {preview && (
        <div className="bg-stone-900/80 rounded-2xl border border-amber-500/30 p-6 space-y-6 shadow-2xl backdrop-blur-md">
          {/* Header & Stats Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-stone-800">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-wider">
                <Layers className="w-4 h-4" />
                Step 3 — Import Preview & Review
              </div>
              <h2 className="text-2xl font-bold text-slate-100">
                Found {preview.totalFound} Context Items
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Review each item below before committing. Items flagged with warnings require explicit confirmation.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleSelectAll(true)}
                className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-slate-300 rounded-lg text-xs font-medium border border-stone-700"
              >
                [ Select All ]
              </button>
              <button
                onClick={() => handleSelectAll(false)}
                className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-slate-300 rounded-lg text-xs font-medium border border-stone-700"
              >
                [ Deselect All ]
              </button>
            </div>
          </div>

          {/* Module Summary Chips */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategoryFilter('All')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                selectedCategoryFilter === 'All'
                  ? 'bg-amber-500 text-stone-950 border-amber-400 font-semibold'
                  : 'bg-stone-950 text-slate-400 border-stone-800 hover:border-stone-700'
              }`}
            >
              All ({preview.totalFound})
            </button>

            {(preview.outdatedCount > 0 || preview.conflictCount > 0) && (
              <button
                onClick={() => setSelectedCategoryFilter('Needs Review')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all flex items-center gap-1.5 ${
                  selectedCategoryFilter === 'Needs Review'
                    ? 'bg-orange-500 text-stone-950 border-orange-400 font-semibold'
                    : 'bg-orange-950/60 text-orange-300 border-orange-800/60 hover:bg-orange-900/60'
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                Needs Review ({preview.outdatedCount + preview.conflictCount})
              </button>
            )}

            {Object.entries(preview.moduleCounts).map(([mod, count]) => {
              if (count === 0) return null;
              return (
                <button
                  key={mod}
                  onClick={() => setSelectedCategoryFilter(mod)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all flex items-center gap-1.5 ${
                    selectedCategoryFilter === mod
                      ? 'bg-amber-500 text-stone-950 border-amber-400 font-semibold'
                      : 'bg-stone-950 text-slate-300 border-stone-800 hover:border-stone-700'
                  }`}
                >
                  {getModuleIcon(mod as any)}
                  {mod} ({count})
                </button>
              );
            })}
          </div>

          {/* Items Review List */}
          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
            {filteredItems.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-xs italic">
                No items match the selected category filter.
              </div>
            ) : (
              filteredItems.map((item) => {
                const isEditing = editingItemId === item.id;
                const isSelected = item.selectedAction === 'Import';

                return (
                  <div
                    key={item.id}
                    className={`p-4 rounded-xl border transition-all space-y-3 ${
                      item.status === 'Outdated' || item.status === 'Conflict'
                        ? 'bg-stone-950/90 border-orange-500/30'
                        : isSelected
                        ? 'bg-stone-950 border-amber-500/30'
                        : 'bg-stone-950/50 border-stone-800/80 opacity-60'
                    }`}
                  >
                    {/* Top Row: Module Icon, Title, Badges */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="p-1.5 rounded-lg bg-stone-900 border border-stone-800">
                          {getModuleIcon(item.module)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-slate-200">
                              {item.module}
                            </span>
                            <span className="text-[10px] text-slate-500">•</span>
                            <span className="text-[11px] text-slate-400">{item.category}</span>
                          </div>

                          {!isEditing ? (
                            <h3 className="text-sm font-bold text-slate-100">
                              {item.editedTitle || item.title}
                            </h3>
                          ) : (
                            <input
                              type="text"
                              value={item.editedTitle || item.title}
                              onChange={(e) =>
                                handleUpdateItemField(item.id, 'editedTitle', e.target.value)
                              }
                              className="bg-stone-900 border border-amber-500/50 rounded px-2 py-1 text-xs text-amber-200 focus:outline-none mt-1 w-full"
                            />
                          )}
                        </div>
                      </div>

                      {/* Status & Action controls */}
                      <div className="flex items-center gap-2 self-start sm:self-auto">
                        {getStatusBadge(item.status)}

                        <div className="flex items-center bg-stone-900 p-0.5 rounded-lg border border-stone-800">
                          <button
                            onClick={() => handleToggleItemAction(item.id, 'Import')}
                            className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                              item.selectedAction === 'Import'
                                ? 'bg-emerald-600 text-white shadow'
                                : 'text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            ✓ Import
                          </button>

                          <button
                            onClick={() => setEditingItemId(isEditing ? null : item.id)}
                            className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                              isEditing
                                ? 'bg-amber-500 text-stone-950 shadow'
                                : 'text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            ✎ Edit
                          </button>

                          <button
                            onClick={() => handleToggleItemAction(item.id, 'Ignore')}
                            className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                              item.selectedAction === 'Ignore'
                                ? 'bg-stone-800 text-slate-400'
                                : 'text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            × Ignore
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Detail Body */}
                    {!isEditing ? (
                      <p className="text-xs text-slate-300 leading-relaxed pl-9">
                        {item.editedDetail || item.detail}
                      </p>
                    ) : (
                      <div className="pl-9 space-y-2">
                        <textarea
                          value={item.editedDetail || item.detail}
                          onChange={(e) =>
                            handleUpdateItemField(item.id, 'editedDetail', e.target.value)
                          }
                          className="w-full bg-stone-900 border border-amber-500/50 rounded p-2 text-xs text-amber-200 focus:outline-none resize-none h-16"
                        />
                      </div>
                    )}

                    {/* Warning / Conflict callout banner */}
                    {item.conflictReason && (
                      <div className="ml-9 p-2.5 rounded-lg bg-orange-950/60 border border-orange-500/30 text-xs text-orange-200 flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-semibold text-orange-300">Potential Outdated Context: </span>
                          {item.conflictReason}
                        </div>
                      </div>
                    )}

                    {/* Source metadata footer */}
                    <div className="ml-9 text-[11px] text-slate-500 flex items-center justify-between pt-1">
                      <span>Source: {item.source}</span>
                      <span>Confidence: {item.confidence}%</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Bottom Action Footer */}
          <div className="pt-4 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-400">
              Selected <span className="text-amber-400 font-bold">{preview.items.filter((i) => i.selectedAction === 'Import').length}</span> of {preview.totalFound} items to import
            </div>

            <button
              onClick={handleCommitImport}
              className="w-full sm:w-auto py-3 px-8 rounded-xl font-bold text-sm bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all"
            >
              <CheckCircle className="w-5 h-5" />
              [ IMPORT APPROVED ITEMS ]
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
