import { ModuleDefinition, ModuleId, ModuleCategory, WorkspacePreferences, WorkspacePreset } from '../types';

export const MODULE_REGISTRY: ModuleDefinition[] = [
  {
    id: 'home',
    name: 'Home',
    iconName: 'Home',
    description: 'Your daily command center & workspace overview',
    category: 'core',
    route: '/',
    canHide: false,
    defaultOrderIndex: 0
  },
  {
    id: 'inbox',
    name: 'Universal Inbox',
    iconName: 'Inbox',
    description: 'Dump everything and let AI organize & process it',
    category: 'core',
    route: '/inbox',
    canHide: false,
    defaultOrderIndex: 1
  },
  {
    id: 'ai',
    name: 'AI Supervisor',
    iconName: 'Sparkles',
    description: 'AI observations, daily brief, insights and recommendations',
    category: 'core',
    route: '/ai',
    canHide: true,
    defaultOrderIndex: 2
  },
  {
    id: 'time',
    name: 'Time & Deep Work',
    iconName: 'Clock',
    description: 'Track how you spend your day & deep focus blocks',
    category: 'life',
    route: '/track',
    canHide: true,
    defaultOrderIndex: 3
  },
  {
    id: 'food',
    name: 'Food & Nutrition',
    iconName: 'Utensils',
    description: 'Meals, food spending & pantry consumption',
    category: 'life',
    route: '/food',
    canHide: true,
    defaultOrderIndex: 4
  },
  {
    id: 'health',
    name: 'Health & Recovery',
    iconName: 'Activity',
    description: 'Sleep, workouts, water, weight & wellness tracking',
    category: 'life',
    route: '/health',
    canHide: true,
    defaultOrderIndex: 5
  },
  {
    id: 'journal',
    name: 'Daily Journal',
    iconName: 'BookMarked',
    description: 'Daily reflections, mood ratings & tomorrow priorities',
    category: 'life',
    route: '/journal',
    canHide: true,
    defaultOrderIndex: 6
  },
  {
    id: 'finance',
    name: 'Finance & Money',
    iconName: 'DollarSign',
    description: 'Expenses, money outflow & daily consumption engine',
    category: 'money',
    route: '/finance',
    canHide: true,
    defaultOrderIndex: 7
  },
  {
    id: 'learning',
    name: 'Learning Mastery',
    iconName: 'BookOpen',
    description: 'Learning sessions, subjects, skills & technical projects',
    category: 'growth',
    route: '/learning',
    canHide: true,
    defaultOrderIndex: 8
  },
  {
    id: 'goals',
    name: 'Goals Hierarchy',
    iconName: 'Target',
    description: 'Long-term and short-term master objectives',
    category: 'growth',
    route: '/goals',
    canHide: true,
    defaultOrderIndex: 9
  },
  {
    id: 'milestones',
    name: 'Milestones & Arc',
    iconName: 'Flag',
    description: 'Important dates, checkpoints & Winter Arc deadlines',
    category: 'growth',
    route: '/milestones',
    canHide: true,
    defaultOrderIndex: 10
  },
  {
    id: 'cognitive',
    name: 'Cognitive Lab',
    iconName: 'BrainCircuit',
    description: 'Daily reasoning, logic & critical thinking drills',
    category: 'growth',
    route: '/cognitive',
    canHide: true,
    defaultOrderIndex: 11
  },
  {
    id: 'analytics',
    name: 'Analytics & Trends',
    iconName: 'BarChart3',
    description: 'Cross-module performance visualizations & statistics',
    category: 'insights',
    route: '/analytics',
    canHide: true,
    defaultOrderIndex: 12
  },
  {
    id: 'reports',
    name: 'Reports & Export',
    iconName: 'FileText',
    description: 'Generated PDF summaries & raw data export',
    category: 'insights',
    route: '/reports',
    canHide: true,
    defaultOrderIndex: 13
  },
  {
    id: 'evolution',
    name: 'Evolution & Dossier',
    iconName: 'Dna',
    description: 'Behavioral mirror, character evolution stages & timeline',
    category: 'growth',
    route: '/evolution',
    canHide: true,
    defaultOrderIndex: 14
  }
];

export const ALL_MODULE_IDS: ModuleId[] = MODULE_REGISTRY.map((m) => m.id);

export const DEFAULT_WORKSPACE_PREFERENCES: WorkspacePreferences = {
  enabledModules: [...ALL_MODULE_IDS],
  pinnedSidebarModules: ['home', 'inbox', 'time', 'learning', 'goals'],
  defaultView: 'home',
  dashboardOrder: [
    'ai',
    'time',
    'finance',
    'health',
    'learning',
    'goals',
    'milestones',
    'cognitive'
  ],
  quickActions: ['inbox', 'finance', 'time', 'learning', 'journal'],
  hasCompletedWorkspaceSetup: false
};

export const PRESET_CONFIGURATIONS: Record<WorkspacePreset, ModuleId[]> = {
  'Full Life': [...ALL_MODULE_IDS],
  'Productivity': ['home', 'inbox', 'time', 'learning', 'goals', 'milestones', 'cognitive', 'ai'],
  'Finance': ['home', 'inbox', 'finance', 'goals', 'analytics', 'reports'],
  'Health': ['home', 'inbox', 'food', 'health', 'time', 'goals'],
  'Developer': ['home', 'inbox', 'learning', 'time', 'goals', 'cognitive', 'ai']
};

export function getModuleById(id: ModuleId): ModuleDefinition | undefined {
  return MODULE_REGISTRY.find((m) => m.id === id);
}

export function getModulesByCategory(category: ModuleCategory): ModuleDefinition[] {
  return MODULE_REGISTRY.filter((m) => m.category === category);
}

export function isModuleEnabled(prefs: WorkspacePreferences, id: ModuleId): boolean {
  if (id === 'home' || id === 'inbox') return true;
  return prefs.enabledModules.includes(id);
}

export function isModulePinned(prefs: WorkspacePreferences, id: ModuleId): boolean {
  if (id === 'home' || id === 'inbox') return true;
  const pinned = prefs.pinnedSidebarModules || ['home', 'inbox', 'time', 'learning', 'goals'];
  return pinned.includes(id);
}
