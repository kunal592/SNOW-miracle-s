**Profile Workspace / Module Customization** feature.

The important behavior is exactly what you described:

> **First-time user → everything is visible by default → user chooses what they actually want → app hides the rest.**

This should be a **user preference**, not deletion. If they hide Finance today, all Finance data remains intact; they can enable it again anytime.

I'd add this to the Lovable project with the following prompt:

# EXTEND EXISTING PERSONAL OS PWA

# FEATURE: PROFILE TABS + DEFAULT VIEW CUSTOMIZATION

The existing Personal OS PWA is already built.

Add a new personalization system that allows each user to choose which modules/tabs they want visible in their personal workspace and which screen should open by default.

DO NOT rebuild the existing application.

Preserve the existing design system, navigation, mobile-first PWA architecture and existing functionality.

---

# 1. CORE CONCEPT

Every user has different priorities.

One user may want:

Finance
Learning
Time
Goals

Another may only want:

Health
Fitness
Food
Sleep

Another may want:

AI
Learning
Projects
Time

Therefore, the application must allow users to customize their workspace.

IMPORTANT:

On first use, ALL available modules are enabled.

Nothing should be hidden by default.

The user must actively choose what they want to hide.

---

# 2. FIRST-TIME USER EXPERIENCE

When a new user opens the app for the first time:

Show the complete application.

All available modules are visible.

Then show a non-blocking onboarding card/banner:

## MAKE THIS YOUR OWN

"You currently have all modules enabled."

"Choose the areas you want in your workspace."

Buttons:

[ CUSTOMIZE NOW ]

[ DO THIS LATER ]

If the user selects "Do This Later", the full application remains visible.

---

# 3. CUSTOMIZATION SCREEN

Route:

`/settings/workspace`

Title:

# MY WORKSPACE

Subtitle:

"Choose what appears in your Personal OS."

Show every available module.

Each module has:

Icon

Name

Description

Toggle

Example:

### 🏠 Home

Your daily command center
[ ON ]

### 📥 Inbox

Dump everything and let AI organize it
[ ON ]

### 💰 Finance

Expenses, money and consumption
[ ON ]

### ⏱ Time

Track how you spend your day
[ ON ]

### 📚 Learning

Learning sessions, subjects and projects
[ ON ]

### 🍱 Food

Meals, food spending and consumption
[ ON ]

### 🏃 Health

Sleep, workouts, weight and wellness tracking
[ ON ]

### 🎯 Goals

Long-term and short-term objectives
[ ON ]

### 🏁 Milestones

Important dates and checkpoints
[ ON ]

### 🧠 Cognitive Lab

Daily reasoning and thinking challenges
[ ON ]

### 🤖 AI Supervisor

AI analysis, insights and recommendations
[ ON ]

### 📔 Journal

Daily reflections and notes
[ ON ]

### 📊 Analytics

Trends and performance analysis
[ ON ]

### 📄 Reports

Generated reports and exports
[ ON ]

---

# 4. MODULE CATEGORIES

Organize modules into groups to make the settings page easier to understand.

## CORE

Home

Inbox

AI Supervisor

## LIFE

Time

Food

Health

Journal

## MONEY

Finance

## GROWTH

Learning

Goals

Milestones

Cognitive Lab

## INSIGHTS

Analytics

Reports

---

# 5. SELECT ALL / CLEAR OPTIONAL MODULES

At the top:

[ SELECT ALL ]

[ RESET TO DEFAULT ]

Do NOT provide "Clear All" if doing so would hide critical navigation.

Home and Inbox should remain available.

If necessary, show:

"Home and Inbox are core modules and cannot be hidden."

---

# 6. DEFAULT VIEW

Add a section below module selection:

# DEFAULT VIEW

"Where should the app open when you launch it?"

Dropdown/select:

Home

Inbox

Finance

Time

Learning

Food

Health

Goals

Milestones

Cognitive Lab

AI Supervisor

Analytics

Journal

The list should only contain modules currently enabled.

Example:

Default view:
[ Home ▼ ]

If the user disables Finance, Finance should disappear from the default-view selection.

If the current default view is hidden, automatically move the default to Home.

---

# 7. MOBILE NAVIGATION CUSTOMIZATION

The mobile bottom navigation should automatically reflect the user's enabled modules.

Example user configuration:

Enabled:

Home

Inbox

Finance

Learning

Goals

Cognitive Lab

The mobile navigation could show:

Home | Inbox | + | Goals | More

The remaining enabled modules appear under:

More

Do NOT put 10+ tabs directly in the mobile bottom navigation.

Keep the bottom navigation clean.

---

# 8. MORE / MODULE DRAWER

Create a "More" screen or bottom sheet.

Example:

MORE

Finance
Learning
Time
Food
Health
Milestones
Cognitive Lab
AI
Analytics
Reports
Journal
Settings

Only show enabled modules.

Hidden modules should not appear in navigation.

---

# 9. DESKTOP SIDEBAR

On desktop, the sidebar should dynamically show enabled modules.

Example:

WINTER ARC

Home
Inbox

────────────

Finance
Learning
Goals
Milestones

────────────

AI Supervisor
Cognitive Lab
Analytics

────────────

More
Settings

Do not show disabled modules.

---

# 10. HIDDEN MODULES ARE NOT DELETED

This is extremely important.

If the user turns off:

Finance

The following should happen:

Finance disappears from:

* Navigation
* Dashboard module shortcuts
* More menu

BUT:

Finance data remains completely intact.

The user can enable Finance again and all previous data returns.

The system should treat:

"Enabled/Disabled"

as a UI preference only.

Never delete data because a module is disabled.

---

# 11. DASHBOARD CUSTOMIZATION

The user's enabled modules should also influence the Home dashboard.

If Finance is enabled:

Show Finance summary.

If Learning is enabled:

Show Learning summary.

If Health is enabled:

Show Health summary.

If Cognitive Lab is enabled:

Show today's cognitive challenge.

If Milestones are enabled:

Show upcoming milestones.

If a module is disabled:

Do not show its dashboard card.

Example:

User disables:

Food
Health
Finance

Home should automatically become:

Today's overview

Time

Learning

Goals

Milestones

Cognitive Lab

AI Brief

---

# 12. DASHBOARD CARD ORDER

Allow users to reorder dashboard sections.

Settings:

# DASHBOARD ORDER

Example:

☰ Today's Overview
☰ AI Daily Brief
☰ Goals
☰ Learning
☰ Milestones
☰ Cognitive Challenge
☰ Finance

Use drag-and-drop on desktop.

On mobile, use a reorder interface.

This should be separate from enabling/disabling modules.

---

# 13. QUICK ACTION CUSTOMIZATION

The "+" quick action menu should also adapt.

If Finance is enabled:

* Add Expense

If Learning is enabled:

* Log Learning

If Food is enabled:

* Log Food

If Time is enabled:

* Start Timer

If Journal is enabled:

* Journal Entry

Always keep:

* Universal Inbox

The Universal Inbox should remain the universal input mechanism.

---

# 14. PROFILE MODE PRESETS

Add optional presets.

At the top of workspace customization:

## START WITH A PRESET

### Full Life

Everything enabled.

### Productivity

Time
Learning
Goals
Milestones
Cognitive Lab
AI Supervisor

### Finance

Finance
Goals
Analytics
Reports

### Health

Food
Health
Time
Goals

### Developer

Learning
Projects
Time
Goals
Cognitive Lab
AI Supervisor

IMPORTANT:

Presets should simply change the enabled modules.

They should NOT delete data.

After selecting a preset, the user can manually customize it.

---

# 15. SAVE STATE

For this frontend prototype, persist workspace preferences using localStorage or IndexedDB.

Create a structure similar to:

workspacePreferences:

{
enabledModules: [],
defaultView: "",
dashboardOrder: [],
quickActions: []
}

The backend can later store this per user.

---

# 16. TYPESCRIPT TYPES

Create:

type ModuleId =
| "home"
| "inbox"
| "finance"
| "time"
| "learning"
| "food"
| "health"
| "goals"
| "milestones"
| "cognitive"
| "ai"
| "journal"
| "analytics"
| "reports";

Create:

interface WorkspacePreferences {
enabledModules: ModuleId[];
defaultView: ModuleId;
dashboardOrder: ModuleId[];
quickActions: string[];
hasCompletedWorkspaceSetup: boolean;
}

---

# 17. MODULE REGISTRY

Do NOT hardcode navigation separately in every component.

Create a central module registry.

Example conceptual structure:

moduleRegistry = [
{
id: "finance",
name: "Finance",
icon: ...,
description: "...",
category: "money",
route: "/finance",
canHide: true
}
]

Navigation, settings, dashboard and More menu should all read from this registry.

This is important for future scalability.

---

# 18. DEFAULT FIRST-TIME STATE

For a completely new user:

enabledModules = ALL_MODULES

defaultView = "home"

dashboardOrder = DEFAULT_ORDER

hasCompletedWorkspaceSetup = false

After the user customizes:

hasCompletedWorkspaceSetup = true

---

# 19. PROFILE SETTINGS LOCATION

Add:

Settings
→ Workspace
→ Profile Tabs

OR:

Settings
→ Customize Workspace

Use a clear name.

Recommended:

# Customize Workspace

This is easier for users to understand than "Module Configuration."

---

# 20. PROFILE / PERSONALIZATION SUMMARY

At the top of the customization page show:

## YOUR WORKSPACE

Enabled:
9 modules

Hidden:
5 modules

Default view:
Home

Example:

9 active modules

5 hidden modules

[ EDIT ]

---

# 21. HIDDEN MODULES SECTION

At the bottom:

# HIDDEN MODULES

Show disabled modules.

Example:

Finance
Currently hidden

[ ENABLE ]

Food
Currently hidden

[ ENABLE ]

Health
Currently hidden

[ ENABLE ]

This allows the user to easily restore something.

---

# 22. RESTORE EVERYTHING

Provide:

[ RESTORE FULL WORKSPACE ]

Confirmation:

"Restore all modules to your workspace?"

"Your data will not be changed."

[ CANCEL ]

[ RESTORE ]

---

# 23. USER EXPERIENCE RULES

The system must behave predictably.

If a module is disabled:

* Hide from navigation
* Hide from dashboard
* Hide from quick actions
* Hide from default-view options

But:

* Keep all data
* Keep all historical records
* Keep goals and milestones
* Keep AI knowledge
* Keep analytics data

Re-enabling the module restores its UI.

---

# 24. AI INTEGRATION

The AI Supervisor should be aware of the user's enabled modules.

Example:

If Finance is disabled:

Do not show Finance insights prominently on the Home dashboard.

But the AI can still use Finance data if the user explicitly asks:

"Analyze my spending."

The user has hidden the module, not deleted the data.

Similarly, if Cognitive Lab is disabled:

Do not show daily cognitive challenges.

But the user can re-enable it later.

---

# 25. FIRST-TIME USER FLOW

The complete flow should be:

INSTALL PWA

↓

OPEN APP

↓

ALL MODULES VISIBLE

↓

OPTIONAL CUSTOMIZATION PROMPT

"Your workspace currently has everything enabled."

↓

CUSTOMIZE WORKSPACE

↓

SELECT / DESELECT MODULES

↓

SELECT DEFAULT VIEW

↓

OPTIONALLY REORDER DASHBOARD

↓

SAVE

↓

PERSONALIZED HOME

---

# 26. IMPORTANT DESIGN PRINCIPLE

The app should feel like:

"Build your own Personal OS."

Not:

"Configure an enterprise dashboard."

Use friendly language.

Examples:

Instead of:

"Module Configuration"

Use:

"Customize Your Workspace"

Instead of:

"Enable/Disable"

Use:

"Show / Hide"

Instead of:

"Default Route"

Use:

"Open app to"

Instead of:

"Dashboard Widget Ordering"

Use:

"Arrange your Home screen"

---

# 27. MOBILE UI

The customization page should be designed primarily for mobile.

Each module should be a comfortable card:

┌───────────────────────────────┐
│ 🧠  Cognitive Lab       ON   │
│     Train your reasoning      │
│                               │
│     Daily thinking challenges │
└───────────────────────────────┘

Tap the card or switch to toggle.

Use bottom sticky button:

[ SAVE CHANGES ]

If changes are automatically saved, show:

✓ Saved

---

# 28. FINAL RESULT

The user should be able to create a completely personalized Personal OS.

Example:

USER A:

Home
Inbox
Finance
Learning
Goals
Milestones

USER B:

Home
Inbox
Health
Food
Time
Journal

USER C:

Home
Inbox
Learning
Cognitive Lab
AI Supervisor
Goals

All three use the same application.

Their interface is personalized without creating separate application versions.

Implement this feature fully in the existing frontend using mock/local persistence.

Do not rebuild the application.

Do not remove existing features.

Make the system scalable so future modules can be added simply by adding them to the central module registry.

### One extra thing I'd add

I'd make **Home and Inbox special "core modules."**

Everything else can be hidden.

That means a user can create an extremely minimal setup like:

```text
Home
Inbox
```

and then slowly enable:

```text
+ Learning
+ Finance
+ Goals
+ Cognitive Lab
```

as their needs change.

This also fits your **AI Supervisor** perfectly: the AI can understand the user's active workspace and avoid cluttering their daily interface with areas they deliberately don't use.
