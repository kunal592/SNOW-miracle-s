Extend the EXISTING Personal Operating System / WINTER ARC PWA.

Do NOT rebuild the application. Preserve all existing features, navigation, themes, profile calendar, AI Supervisor, Evolution System, workspace customization, Inbox, Finance, Learning, Cognitive Lab, etc.

Add a compact MANUAL APP USAGE TRACKER directly ABOVE the existing profile section at the bottom of the sidebar/navigation.

# 1. APP ICON ROW

Add a small horizontal row of app icons immediately above the existing profile card.

Initial apps:

1. Instagram
2. YouTube
3. LinkedIn
4. Groww
5. Chrome

Use recognizable app logos/icons where available.

The UI should remain compact and minimal.

Example:

```text
┌──────────────────────────────┐
│  ◎     ▶     in     G     ◉ │
│ IG    YT    LI   Groww   Chrome
├──────────────────────────────┤
│  👤  User Profile            │
└──────────────────────────────┘
```

On desktop, show the icons comfortably.

On mobile/sidebar-collapsed layouts, preserve the compact icon-only appearance where appropriate.

Do not make this a large dashboard card.

# 2. TAP = START TIMER

When the user taps an app icon and that app is NOT currently being tracked:

Start a timer immediately.

Example:

```text
Instagram
00:01
00:02
00:03
...
```

The icon should visually indicate that tracking is active.

Possible visual states:

* subtle glow
* animated ring
* small timer underneath/inside the icon
* active indicator

Keep it subtle and consistent with the existing design.

Example:

```text
      04:32
       🟣
   Instagram
```

The timer must continue while the user navigates around the PWA.

# 3. SECOND TAP = STOP TIMER

When the user taps the SAME active app again:

Stop the timer.

Calculate:

```text
duration = endTime - startTime
```

Create a usage session.

Example:

```text
Instagram

Started: 18:20
Ended:   18:51
Used:    31 minutes
```

The completed session should immediately be added to that day's usage history and total.

# 4. MULTIPLE SESSIONS PER DAY

This is extremely important.

Do NOT store only one usage duration per app.

A user may open Instagram 4 different times in one day.

Each usage must be stored as an independent session.

Example:

```text
Instagram — September 23

09:10 → 09:34     24m
12:45 → 13:02     17m
18:20 → 18:51     31m
22:10 → 22:18      8m
────────────────────────
Total              1h 20m
```

The system should retain all four sessions.

The total is calculated from those sessions.

# 5. USAGE HISTORY

Clicking/long-pressing an app icon or selecting an appropriate "Usage" action should open its usage details.

Example:

```text
Instagram
Today

Current:
Not active

Sessions
────────────────────
09:10 — 09:34     24m
12:45 — 13:02     17m
18:20 — 18:51     31m
22:10 — 22:18      8m

Total
1h 20m
```

Also support daily totals for each tracked application.

Example:

```text
Today's App Usage

Instagram       1h 20m
YouTube           52m
Chrome            1h 12m
LinkedIn          18m
Groww             11m

Total             3h 53m
```

# 6. DATA MODEL

Create frontend-ready TypeScript interfaces.

```ts
interface TrackedApp {
  id: string;
  name: string;
  slug: string;
  icon: string;
}

interface AppUsageSession {
  id: string;
  appId: string;
  userId: string;
  startedAt: string;
  endedAt: string | null;
  durationSeconds: number | null;
  date: string;
  status: "active" | "completed";
}
```

The source of truth should be individual sessions.

Do NOT store only:

```ts
instagramTotal: 3600
```

Instead store:

```text
Session 1
Session 2
Session 3
Session 4
```

and calculate the daily total from those sessions.

This will allow future analytics and AI analysis.

# 7. CROSS-DAY SAFETY

If a timer is started before midnight and remains active after midnight, correctly handle the session crossing midnight.

Example:

```text
23:55 → 00:10
```

The system should allocate:

```text
September 23: 5 minutes
September 24: 10 minutes
```

Do not incorrectly assign the entire session to one day.

For the initial frontend prototype, support the data model required for this behavior even if the mock timer implementation is simplified.

# 8. ONLY ONE ACTIVE SESSION PER APP

A user cannot have two simultaneous timers for the SAME app.

If Instagram is already active:

```text
Instagram
● 04:32
```

tapping Instagram again stops it.

However, different apps can have independent sessions if the product allows it.

For example:

```text
Instagram   active
Chrome      active
```

should be technically supported by the model.

However, make the UX clear that these are manually tracked sessions.

# 9. APP CATEGORIES

Add metadata so the AI Supervisor can later classify applications.

Example:

```ts
type AppUsageCategory =
  | "social"
  | "video"
  | "professional"
  | "finance"
  | "browser"
  | "other";
```

Initial mapping:

```text
Instagram → social
YouTube   → video
LinkedIn  → professional
Groww     → finance
Chrome    → browser
```

Do NOT automatically label all usage as "bad".

For example:

* LinkedIn may be productive.
* Chrome could be learning, work, entertainment, or distraction.
* Groww could be financial research or unnecessary checking.
* YouTube could be education or entertainment.

The AI Supervisor should later interpret usage using context rather than assuming every minute is negative.

# 10. CONNECTION WITH PROFILE CALENDAR

Integrate this data with the previously implemented Profile → Calendar feature.

The calendar's daily details should eventually be able to show:

```text
September 23

App Usage

Instagram      1h 20m
YouTube          52m
LinkedIn         18m
Groww            11m
Chrome          1h 12m

Total           3h 53m
```

And the individual session history should remain available.

The calendar's green/red status should NOT be determined solely by app usage.

App usage is evidence that can contribute to the daily analysis.

# 11. AI SUPERVISOR INTEGRATION

Prepare the data for future AI analysis.

The AI Supervisor may eventually identify patterns such as:

```text
"Your Instagram usage was concentrated between
18:00–23:00 over the last 7 days."

"You had 4 separate Instagram sessions today."

"Your YouTube usage increased by 42% compared
with your previous 7-day average."
```

However, the AI must distinguish:

FACT:
"Instagram was tracked for 1h 20m."

INTERPRETATION:
"Most tracked Instagram usage occurred in the evening."

HYPOTHESIS:
"This may be associated with your evening distraction pattern."

Do not make unsupported psychological claims.

# 12. PERSISTENCE

For the current frontend prototype:

* Persist active timers.
* Persist completed sessions.
* Survive route changes.
* Survive page refresh where practical.
* Use the existing local persistence architecture (localStorage/IndexedDB) already used by the project.

Do not introduce a second unrelated persistence system.

# 13. FUTURE BACKEND API

Prepare the frontend service layer for:

```text
GET    /api/v1/app-usage/apps
GET    /api/v1/app-usage/sessions
POST   /api/v1/app-usage/sessions
PATCH  /api/v1/app-usage/sessions/:id
GET    /api/v1/app-usage/daily/:date
GET    /api/v1/app-usage/summary
```

Future PostgreSQL model:

```text
tracked_apps
app_usage_sessions
```

Each session should contain:

```text
id
user_id
app_id
started_at
ended_at
duration_seconds
date
created_at
updated_at
```

# 14. IMPORTANT: MANUAL TRACKING

Clearly treat this feature as:

"Manual App Usage Tracking"

The PWA cannot automatically know that the user switched to Instagram, YouTube, LinkedIn, Groww, or Chrome simply because the user tapped the icon.

The icon tap means:

"I am starting to track this app now."

The second tap means:

"I am stopping tracking this app now."

Do not falsely claim that the PWA has detected actual device-level application usage.

# 15. MICRO-INTERACTION

When starting:

```text
Instagram tracking started
```

When stopping:

```text
Instagram
31m session recorded
Today's total: 1h 20m
```

Use a small toast rather than a large popup.

# 16. PROFILE POSITION

Final sidebar bottom hierarchy:

```text
                ...
          other navigation
                ...

     ┌───────────────────────────┐
     │ IG  YT  LI  G  Chrome     │
     └───────────────────────────┘
     │ 👤 Profile                │
     └───────────────────────────┘
```

The app tracker must appear ABOVE the profile section.

The existing profile → progress calendar interaction must remain intact.

# 17. DESIGN PRINCIPLE

This should feel like a compact personal control panel.

Do not turn it into a huge screen.

The main interaction should be:

TAP → TIMER STARTS
TAP AGAIN → TIMER STOPS
SESSION SAVED
DAILY TOTAL UPDATED

All historical sessions remain available for the user's daily analytics and AI Supervisor.

Preserve the existing visual language, spacing, typography, theme system, animations, mobile responsiveness, and accessibility.
