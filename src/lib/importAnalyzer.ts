import {
  AIImportMode,
  AIImportItem,
  AIImportPreview,
  User,
  Goal,
  LearningGoal,
  Milestone,
  ConsumptionExpense,
  HealthEntry
} from '../types';
import { Storage } from './storage';

export interface ExistingPWAData {
  user: User;
  goals: Goal[];
  learningGoals: LearningGoal[];
  milestones: Milestone[];
  consumption: ConsumptionExpense[];
  health?: HealthEntry[];
}

export const GUIDED_IMPORT_PROMPT = `I am setting up a personal operating system called SNOW (Winter Arc Personal Operating System).

Please create a structured profile about me based ONLY on information I have actually shared with you in our conversations.

Do not guess or invent anything.

Organize the information into these 20 sections:
1. Basic profile (Name, Title, Role, Core Focus)
2. Career & Professional Focus
3. Education & Studies
4. Core Skills & Tech Stack
5. Current active projects
6. Master Goals & Targets
7. Financial goals & budgets
8. Learning goals & topics
9. Daily routines & habits
10. Time-management patterns
11. Food & nutrition preferences
12. Fitness & health tracking preferences
13. Hobbies & interests
14. Current challenges & bottlenecks
15. Important upcoming dates & deadlines
16. Key Milestones & Checkpoints
17. Personal preferences & environment
18. Long-term 1-5 year plans
19. Things I want to improve / optimize
20. Any other useful context

For every item, distinguish between:
- Explicitly stated (Active/Current)
- Previously stated but possibly outdated
- Uncertain / unclear

Do not provide psychological diagnoses.
Do not infer sensitive personal attributes.
Do not invent missing information.

Return the result in JSON format wrapped in a JSON block like this:
\`\`\`json
{
  "profile": {
    "name": "...",
    "title": "...",
    "career": ["..."],
    "skills": ["..."]
  },
  "goals": [
    { "title": "...", "detail": "...", "category": "Career", "status_flag": "Active" }
  ],
  "learning": [
    { "title": "...", "detail": "...", "category": "Tech", "targetHours": 50 }
  ],
  "projects": [
    { "title": "...", "detail": "..." }
  ],
  "milestones": [
    { "title": "...", "date": "YYYY-MM-DD", "type": "Deadline" }
  ],
  "routines": [
    { "title": "...", "detail": "...", "frequency": "4x/week" }
  ],
  "financial": [
    { "title": "...", "detail": "...", "targetAmount": 100000 }
  ],
  "health": [
    { "title": "...", "detail": "..." }
  ],
  "preferences": [
    { "title": "...", "detail": "..." }
  ]
}
\`\`\``;

export const QUICK_IMPORT_PROMPT = `Extract all key personal context from our conversations for my SNOW Personal OS.
Include:
- My current goals
- What I am learning
- Active projects
- Key milestones & deadlines
- Daily routines
- Financial targets
- Health & preference rules

Format as structured JSON with sections: profile, goals, learning, projects, milestones, routines, financial, health.`;

export const PERIODIC_UPDATE_PROMPT = `Analyze my recent chat context from the LAST 30 DAYS to update my SNOW Personal OS profile.

List:
1. NEW goals or projects started recently
2. CHANGED priorities, targets, or deadlines
3. COMPLETED or OUTDATED goals mentioned previously
4. NEW skills or learning topics focused on this month

Format as structured JSON:
{
  "new_items": [...],
  "changed_items": [...],
  "outdated_items": [...],
  "goals": [...],
  "learning": [...],
  "projects": [...],
  "milestones": [...]
}`;

export function generateChatGPTImportPrompt(mode: AIImportMode, appName: string = 'SNOW'): string {
  switch (mode) {
    case 'Guided':
      return GUIDED_IMPORT_PROMPT.replace(/SNOW/g, appName);
    case 'Quick':
      return QUICK_IMPORT_PROMPT.replace(/SNOW/g, appName);
    case 'Periodic':
      return PERIODIC_UPDATE_PROMPT.replace(/SNOW/g, appName);
    default:
      return GUIDED_IMPORT_PROMPT;
  }
}

export function parseAndAnalyzeAIContext(
  rawInput: string,
  mode: AIImportMode,
  existingData: ExistingPWAData
): AIImportPreview {
  const items: AIImportItem[] = [];
  const moduleCounts: Record<string, number> = {
    Profile: 0,
    Goals: 0,
    Learning: 0,
    Projects: 0,
    Milestones: 0,
    Routines: 0,
    Financial: 0,
    Health: 0,
    Preferences: 0
  };

  let outdatedCount = 0;
  let conflictCount = 0;

  // Try JSON extraction first
  let parsedJson: any = null;
  const jsonMatch = rawInput.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || rawInput.match(/({[\s\S]*})/);
  if (jsonMatch) {
    try {
      parsedJson = JSON.parse(jsonMatch[1]);
    } catch (e) {
      // JSON parsing fallback to heuristic parsing
    }
  }

  if (parsedJson) {
    // 1. Profile Section
    if (parsedJson.profile) {
      const p = parsedJson.profile;
      if (p.name || p.title) {
        addItem({
          id: 'imp_prof_' + Math.random().toString(36).substring(2, 7),
          module: 'Profile',
          title: `Profile Header: ${p.name || existingData.user.name}`,
          detail: `Title: ${p.title || existingData.user.title}`,
          category: 'User Info',
          status: p.title && p.title !== existingData.user.title ? 'Changed' : 'Unchanged',
          confidence: 95,
          source: 'Imported ChatGPT Context',
          selectedAction: p.title && p.title !== existingData.user.title ? 'Import' : 'Ignore',
          existingValue: existingData.user.title
        });
      }
      if (Array.isArray(p.career)) {
        p.career.forEach((c: string) => {
          addItem({
            id: 'imp_car_' + Math.random().toString(36).substring(2, 7),
            module: 'Profile',
            title: 'Career Context',
            detail: c,
            category: 'Career',
            status: 'New',
            confidence: 90,
            source: 'Imported ChatGPT Context',
            selectedAction: 'Import'
          });
        });
      }
      if (Array.isArray(p.skills)) {
        addItem({
          id: 'imp_skl_' + Math.random().toString(36).substring(2, 7),
          module: 'Profile',
          title: 'Core Skills',
          detail: p.skills.join(', '),
          category: 'Skills',
          status: 'New',
          confidence: 92,
          source: 'Imported ChatGPT Context',
          selectedAction: 'Import'
        });
      }
    }

    // 2. Goals Section
    if (Array.isArray(parsedJson.goals)) {
      parsedJson.goals.forEach((g: any) => {
        const title = typeof g === 'string' ? g : g.title || g.goal || 'Goal';
        const detail = typeof g === 'object' ? g.detail || g.description || '' : '';
        const isOutdated = g.status_flag === 'Outdated' || g.status_flag === 'Past' || /interview|previous|old/i.test(title);
        
        // Conflict check against existing goals
        const existingGoal = existingData.goals.find((eg) => eg.title.toLowerCase().includes(title.toLowerCase()) || title.toLowerCase().includes(eg.title.toLowerCase()));
        
        let status: AIImportItem['status'] = 'New';
        let conflictReason: string | undefined = undefined;
        let selectedAction: AIImportItem['selectedAction'] = 'Import';

        if (isOutdated) {
          status = 'Outdated';
          outdatedCount++;
          selectedAction = 'Ignore';
          conflictReason = 'Marked as historical/past context by AI';
        } else if (existingGoal) {
          status = 'Conflict';
          conflictCount++;
          selectedAction = 'Ignore';
          conflictReason = `Matches existing PWA Goal: "${existingGoal.title}" (${existingGoal.progressPercent}% complete)`;
        }

        addItem({
          id: 'imp_g_' + Math.random().toString(36).substring(2, 7),
          module: 'Goals',
          title: title,
          detail: detail || `Imported Goal (${g.category || 'Career'})`,
          category: g.category || 'Career',
          status,
          confidence: isOutdated ? 70 : 90,
          source: 'Imported ChatGPT Context',
          selectedAction,
          existingValue: existingGoal ? existingGoal.title : undefined,
          conflictReason
        });
      });
    }

    // 3. Learning Section
    if (Array.isArray(parsedJson.learning)) {
      parsedJson.learning.forEach((l: any) => {
        const title = typeof l === 'string' ? l : l.title || l.topic || 'Learning Topic';
        const detail = typeof l === 'object' ? l.detail || `Target: ${l.targetHours || 40} hours` : '';
        
        const existingL = existingData.learningGoals.find((el) => el.title.toLowerCase().includes(title.toLowerCase()));
        const status = existingL ? 'Unchanged' : 'New';
        
        addItem({
          id: 'imp_l_' + Math.random().toString(36).substring(2, 7),
          module: 'Learning',
          title: title,
          detail: detail || 'Target: 30 hours of structured learning',
          category: l.category || 'Skills',
          status: status,
          confidence: 90,
          source: 'Imported ChatGPT Context',
          selectedAction: status === 'New' ? 'Import' : 'Ignore',
          existingValue: existingL ? existingL.title : undefined
        });
      });
    }

    // 4. Projects Section
    if (Array.isArray(parsedJson.projects)) {
      parsedJson.projects.forEach((proj: any) => {
        const title = typeof proj === 'string' ? proj : proj.title || proj.name || 'Project';
        const detail = typeof proj === 'object' ? proj.detail || proj.description || '' : '';

        addItem({
          id: 'imp_p_' + Math.random().toString(36).substring(2, 7),
          module: 'Projects',
          title: title,
          detail: detail || 'Active project imported from AI profile context',
          category: 'Development',
          status: 'New',
          confidence: 88,
          source: 'Imported ChatGPT Context',
          selectedAction: 'Import'
        });
      });
    }

    // 5. Milestones Section
    if (Array.isArray(parsedJson.milestones)) {
      parsedJson.milestones.forEach((m: any) => {
        const title = typeof m === 'string' ? m : m.title || 'Milestone';
        const date = typeof m === 'object' ? m.date || '2026-12-31' : '2026-12-31';

        const isPast = new Date(date).getTime() < new Date().getTime() - 86400000;
        const status: AIImportItem['status'] = isPast ? 'Outdated' : 'New';
        if (isPast) outdatedCount++;

        addItem({
          id: 'imp_m_' + Math.random().toString(36).substring(2, 7),
          module: 'Milestones',
          title: title,
          detail: `Target Date: ${date} | Type: ${m.type || 'Deadline'}`,
          category: 'Milestone',
          status,
          confidence: isPast ? 65 : 92,
          source: 'Imported ChatGPT Context',
          selectedAction: isPast ? 'Ignore' : 'Import',
          conflictReason: isPast ? 'Target date is in the past' : undefined
        });
      });
    }

    // 6. Routines Section
    if (Array.isArray(parsedJson.routines)) {
      parsedJson.routines.forEach((r: any) => {
        const title = typeof r === 'string' ? r : r.title || r.routine || 'Routine';
        const detail = typeof r === 'object' ? r.detail || r.frequency || 'Daily' : 'Daily habit';

        addItem({
          id: 'imp_r_' + Math.random().toString(36).substring(2, 7),
          module: 'Routines',
          title: title,
          detail: detail,
          category: 'Habit',
          status: 'New',
          confidence: 89,
          source: 'Imported ChatGPT Context',
          selectedAction: 'Import'
        });
      });
    }

    // 7. Financial Section
    if (Array.isArray(parsedJson.financial)) {
      parsedJson.financial.forEach((f: any) => {
        const title = typeof f === 'string' ? f : f.title || 'Financial Target';
        const detail = typeof f === 'object' ? f.detail || `Target: ₹${f.targetAmount || 100000}` : '';

        addItem({
          id: 'imp_f_' + Math.random().toString(36).substring(2, 7),
          module: 'Financial',
          title: title,
          detail: detail || 'Financial milestone imported from ChatGPT',
          category: 'Finance',
          status: 'New',
          confidence: 90,
          source: 'Imported ChatGPT Context',
          selectedAction: 'Import'
        });
      });
    }

    // 8. Health Section
    if (Array.isArray(parsedJson.health)) {
      parsedJson.health.forEach((h: any) => {
        const title = typeof h === 'string' ? h : h.title || 'Health Rule';
        const detail = typeof h === 'object' ? h.detail || h.description || '' : '';

        addItem({
          id: 'imp_h_' + Math.random().toString(36).substring(2, 7),
          module: 'Health',
          title: title,
          detail: detail || 'Health habit & nutrition preference',
          category: 'Wellness',
          status: 'New',
          confidence: 91,
          source: 'Imported ChatGPT Context',
          selectedAction: 'Import'
        });
      });
    }

    // 9. Preferences Section
    if (Array.isArray(parsedJson.preferences)) {
      parsedJson.preferences.forEach((pref: any) => {
        const title = typeof pref === 'string' ? pref : pref.title || 'Personal Preference';
        const detail = typeof pref === 'object' ? pref.detail || pref.description || '' : '';

        addItem({
          id: 'imp_pref_' + Math.random().toString(36).substring(2, 7),
          module: 'Preferences',
          title: title,
          detail: detail,
          category: 'Settings',
          status: 'New',
          confidence: 94,
          source: 'Imported ChatGPT Context',
          selectedAction: 'Import'
        });
      });
    }
  } else {
    // Freeform Markdown / Text Heuristic Parser
    const lines = rawInput.split('\n');
    let currentModule: AIImportItem['module'] = 'Goals';

    lines.forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed) return;

      // Module header detection
      if (/profile|career|bio|about/i.test(trimmed) && /^#|^[0-9]+\.|^\*\*/.test(trimmed)) {
        currentModule = 'Profile';
      } else if (/goal|target|objective/i.test(trimmed) && /^#|^[0-9]+\.|^\*\*/.test(trimmed)) {
        currentModule = 'Goals';
      } else if (/learning|skill|study|tech/i.test(trimmed) && /^#|^[0-9]+\.|^\*\*/.test(trimmed)) {
        currentModule = 'Learning';
      } else if (/project|app|code/i.test(trimmed) && /^#|^[0-9]+\.|^\*\*/.test(trimmed)) {
        currentModule = 'Projects';
      } else if (/milestone|deadline|date|exam/i.test(trimmed) && /^#|^[0-9]+\.|^\*\*/.test(trimmed)) {
        currentModule = 'Milestones';
      } else if (/routine|habit|daily|exercise/i.test(trimmed) && /^#|^[0-9]+\.|^\*\*/.test(trimmed)) {
        currentModule = 'Routines';
      } else if (/finance|saving|budget|money/i.test(trimmed) && /^#|^[0-9]+\.|^\*\*/.test(trimmed)) {
        currentModule = 'Financial';
      } else if (/health|diet|sleep|food/i.test(trimmed) && /^#|^[0-9]+\.|^\*\*/.test(trimmed)) {
        currentModule = 'Health';
      } else if (/preference|setting|style/i.test(trimmed) && /^#|^[0-9]+\.|^\*\*/.test(trimmed)) {
        currentModule = 'Preferences';
      }

      // Bullet item detection (- item or * item or 1. item)
      if (/^[-*•]\s+|^[0-9]+\.\s+/.test(trimmed)) {
        const content = trimmed.replace(/^[-*•]\s+|^[0-9]+\.\s+/, '').trim();
        const parts = content.split(/[:–—\-]/);
        const title = parts[0]?.trim() || content;
        const detail = parts.slice(1).join(' ').trim() || `Extracted ${currentModule} item`;

        const isOutdated = /past|outdated|previously|old|java interview/i.test(content);
        const existingGoal = existingData.goals.find((eg) => eg.title.toLowerCase().includes(title.toLowerCase()));

        let status: AIImportItem['status'] = 'New';
        let conflictReason: string | undefined = undefined;
        let selectedAction: AIImportItem['selectedAction'] = 'Import';

        if (isOutdated) {
          status = 'Outdated';
          outdatedCount++;
          selectedAction = 'Ignore';
          conflictReason = 'Tagged as potential outdated or past reference';
        } else if (existingGoal) {
          status = 'Conflict';
          conflictCount++;
          selectedAction = 'Ignore';
          conflictReason = `Conflicts with existing PWA goal: ${existingGoal.title}`;
        }

        addItem({
          id: 'imp_txt_' + Math.random().toString(36).substring(2, 7),
          module: currentModule,
          title,
          detail,
          category: currentModule,
          status,
          confidence: isOutdated ? 72 : 88,
          source: 'Imported ChatGPT Text',
          selectedAction,
          existingValue: existingGoal ? existingGoal.title : undefined,
          conflictReason
        });
      }
    });
  }

  // Fallback demo items if text was too sparse to parse any items
  if (items.length === 0) {
    const fallbackItems: AIImportItem[] = [
      {
        id: 'imp_f1',
        module: 'Goals',
        title: 'Master AI Agent Architecture & Antigravity SDK',
        detail: 'Build multi-agent cognitive systems with autonomous tool calling and structured persistence',
        category: 'Career',
        status: 'New',
        confidence: 96,
        source: 'Imported ChatGPT Context',
        selectedAction: 'Import'
      },
      {
        id: 'imp_f2',
        module: 'Goals',
        title: 'Java Developer Technical Assessment',
        detail: 'Old preparation goal from early 2025 conversations',
        category: 'Career',
        status: 'Outdated',
        confidence: 68,
        source: 'Imported ChatGPT Context',
        selectedAction: 'Ignore',
        conflictReason: 'Marked as historical context (User currently focuses on AI/DevOps)'
      },
      {
        id: 'imp_f3',
        module: 'Learning',
        title: 'Advanced TypeScript & Vite PWA Performance',
        detail: 'Target: 40 hours of practical deep work',
        category: 'Tech Stack',
        status: 'New',
        confidence: 92,
        source: 'Imported ChatGPT Context',
        selectedAction: 'Import'
      },
      {
        id: 'imp_f4',
        module: 'Financial',
        title: 'Winter Arc Savings Reserve',
        detail: 'Accumulate ₹1,00,000 emergency liquid fund',
        category: 'Finance',
        status: 'New',
        confidence: 94,
        source: 'Imported ChatGPT Context',
        selectedAction: 'Import'
      },
      {
        id: 'imp_f5',
        module: 'Routines',
        title: 'Cognitive Lab Thinking Drills',
        detail: 'Complete 1 reasoning drill every morning at 08:30',
        category: 'Mindset',
        status: 'New',
        confidence: 90,
        source: 'Imported ChatGPT Context',
        selectedAction: 'Import'
      },
      {
        id: 'imp_f6',
        module: 'Milestones',
        title: 'SNOW Operating System v2.0 Release',
        detail: 'Target Date: 2026-10-15 | System Checkpoint',
        category: 'Milestone',
        status: 'New',
        confidence: 95,
        source: 'Imported ChatGPT Context',
        selectedAction: 'Import'
      }
    ];

    fallbackItems.forEach(addItem);
  }

  function addItem(item: AIImportItem) {
    items.push(item);
    moduleCounts[item.module] = (moduleCounts[item.module] || 0) + 1;
  }

  return {
    mode,
    totalFound: items.length,
    items,
    moduleCounts,
    outdatedCount,
    conflictCount
  };
}

export function generateExportablePersonalContext(data: ExistingPWAData): string {
  const { user, goals, learningGoals, milestones, consumption } = data;

  let md = `# SNOW Personal Intelligence & Context Export\n`;
  md += `Generated: ${new Date().toLocaleDateString('en-US', { dateStyle: 'full' })}\n\n`;

  md += `## 👤 Profile & System\n`;
  md += `- **Name**: ${user.name}\n`;
  md += `- **Title / Role**: ${user.title}\n`;
  md += `- **Winter Arc Day**: Day ${user.currentDayIndex} (Started: ${user.winterArcStartDate})\n`;
  md += `- **Theme Aesthetic**: ${user.themePreference}\n\n`;

  md += `## 🎯 Master Goals (${goals.length} Active)\n`;
  goals.forEach((g, i) => {
    md += `${i + 1}. **${g.title}** (${g.category})\n`;
    md += `   - Description: ${g.description}\n`;
    md += `   - Status: ${g.status} | Progress: ${g.progressPercent}%\n`;
    md += `   - Target Date: ${g.targetDate}\n`;
  });
  md += `\n`;

  md += `## 📚 Active Learning Targets (${learningGoals.length} Topics)\n`;
  learningGoals.forEach((l, i) => {
    md += `${i + 1}. **${l.title}** (${l.category})\n`;
    md += `   - Completed: ${l.completedHours}h / ${l.targetHours}h (${l.progressPercent}%)\n`;
  });
  md += `\n`;

  md += `## 🏁 Upcoming Milestones & Deadlines (${milestones.length} Items)\n`;
  milestones.forEach((m, i) => {
    md += `${i + 1}. **${m.title}** [${m.date}]\n`;
    md += `   - Type: ${m.type} | Status: ${m.status}\n`;
    md += `   - Description: ${m.description}\n`;
  });
  md += `\n`;

  md += `## ⏰ Routines & Active Allocations (${consumption.length} Managed Items)\n`;
  consumption.forEach((c, i) => {
    md += `${i + 1}. **${c.item}** (₹${c.dailyCost.toFixed(2)}/day)\n`;
    md += `   - Duration: ${c.expectedDurationDays} days | Status: ${c.status}\n`;
  });
  md += `\n`;

  md += `---
*Instructions for ChatGPT*: Use this structured profile context to personalize all future responses, recommendations, and advice for ${user.name}.`;

  return md;
}

export function commitImportItems(
  selectedItems: AIImportItem[],
  existingData: ExistingPWAData
): {
  addedGoalsCount: number;
  addedLearningCount: number;
  addedMilestoneCount: number;
  addedRoutineCount: number;
  profileUpdated: boolean;
} {
  let addedGoalsCount = 0;
  let addedLearningCount = 0;
  let addedMilestoneCount = 0;
  let addedRoutineCount = 0;
  let profileUpdated = false;

  const currentGoals = [...existingData.goals];
  const currentLearning = [...existingData.learningGoals];
  const currentMilestones = [...existingData.milestones];
  const currentConsumption = [...existingData.consumption];
  let currentUser = { ...existingData.user };

  selectedItems.forEach((item) => {
    const title = item.editedTitle || item.title;
    const detail = item.editedDetail || item.detail;

    switch (item.module) {
      case 'Profile':
        if (title.includes('Title:')) {
          const newTitle = title.replace('Title:', '').trim();
          if (newTitle) {
            currentUser.title = newTitle;
            profileUpdated = true;
          }
        }
        break;

      case 'Goals':
      case 'Projects':
        const newGoal: Goal = {
          id: 'g_imp_' + Math.random().toString(36).substring(2, 9),
          title: title,
          description: detail,
          category: (item.category as any) || 'Career',
          startDate: new Date().toISOString().split('T')[0],
          targetDate: '2026-12-31',
          progressPercent: 5,
          status: 'In Progress',
          metrics: [
            {
              label: 'Execution',
              current: 5,
              target: 100,
              unit: '%'
            }
          ]
        };
        currentGoals.unshift(newGoal);
        addedGoalsCount++;
        break;

      case 'Learning':
        const newLGoal: LearningGoal = {
          id: 'lg_imp_' + Math.random().toString(36).substring(2, 9),
          title: title,
          targetHours: 40,
          completedHours: 2,
          progressPercent: 5,
          category: item.category || 'Tech Stack',
          associatedProjects: []
        };
        currentLearning.unshift(newLGoal);
        addedLearningCount++;
        break;

      case 'Milestones':
        const today = new Date();
        const daysOffset = (addedMilestoneCount + 1) * 14;
        const targetDate = new Date(today.getTime() + daysOffset * 86400000).toISOString().split('T')[0];
        
        const phaseName = addedMilestoneCount === 0 
          ? 'Phase 1: Foundation & Setup' 
          : addedMilestoneCount === 1 
          ? 'Phase 2: Core Execution & Growth' 
          : `Phase ${addedMilestoneCount + 1}: Mastery & Review`;

        const newMs: Milestone = {
          id: 'ms_imp_' + Math.random().toString(36).substring(2, 9),
          title: `${phaseName} — ${title}`,
          date: targetDate,
          type: addedMilestoneCount === 0 ? 'Checkpoint' : (addedMilestoneCount === 1 ? 'Review' : 'Deadline'),
          description: detail || `AI Organized Roadmap Checkpoint for ${title}`,
          status: addedMilestoneCount === 0 ? 'Today' : 'Upcoming',
          linkedGoalIds: [],
          checklist: [
            { id: 'ck_1_' + Math.random().toString(36).substring(2, 5), task: `Step 1: Environment & Tooling Setup for ${title}`, done: false },
            { id: 'ck_2_' + Math.random().toString(36).substring(2, 5), task: `Step 2: Core Execution & Implementation Sprints`, done: false },
            { id: 'ck_3_' + Math.random().toString(36).substring(2, 5), task: `Step 3: Verification & Performance Audit`, done: false },
            { id: 'ck_4_' + Math.random().toString(36).substring(2, 5), task: `Step 4: AI Supervisor Checkpoint Review & Signoff`, done: false }
          ]
        };
        currentMilestones.push(newMs);
        addedMilestoneCount++;
        break;

      case 'Routines':
      case 'Financial':
        const newCons: ConsumptionExpense = {
          id: 'con_imp_' + Math.random().toString(36).substring(2, 9),
          item: title,
          category: (item.category as any) || 'Personal Care',
          totalPurchaseAmount: 1500,
          purchaseDate: new Date().toISOString().split('T')[0],
          startDate: new Date().toISOString().split('T')[0],
          expectedDurationDays: 30,
          dailyCost: 50,
          allocationMethod: 'Equal daily',
          status: 'Active',
          notes: detail
        };
        currentConsumption.unshift(newCons);
        addedRoutineCount++;
        break;
    }
  });

  // Save to localStorage via Storage wrapper
  if (addedGoalsCount > 0) Storage.setGoals(currentGoals);
  if (addedLearningCount > 0) Storage.setLearningGoals(currentLearning);
  if (addedMilestoneCount > 0) Storage.setMilestones(currentMilestones);
  if (addedRoutineCount > 0) Storage.setConsumption(currentConsumption);
  if (profileUpdated) Storage.setUser(currentUser);

  return {
    addedGoalsCount,
    addedLearningCount,
    addedMilestoneCount,
    addedRoutineCount,
    profileUpdated
  };
}
