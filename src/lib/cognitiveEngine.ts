import {
  CognitiveQuestion,
  CognitiveAttempt,
  CognitiveProfile,
  AIInsight,
  AIRecommendation
} from '../types';

/**
 * Evaluates user's answer to a cognitive challenge
 */
export function evaluateCognitiveAnswer(
  question: CognitiveQuestion,
  userAnswer: string,
  hintsUsedCount: number,
  timeTakenSecs: number
): CognitiveAttempt['aiFeedback'] & { isCorrect: boolean; qualityScore: number } {
  const text = userAnswer.trim().toLowerCase();
  const correctText = question.correctAnswer.toLowerCase();

  // Keyword match heuristics for mock evaluation
  const isMatch =
    text.length > 5 &&
    (text.includes('warm') ||
      text.includes('hot') ||
      text.includes('temperature') ||
      text.includes('food') ||
      text.includes('fuel') ||
      text.includes('50.67') ||
      text.includes('32.5') ||
      text.includes('correlation') ||
      text.includes('causation') ||
      text.includes('carol') ||
      text.includes('block a') ||
      text.includes('220') ||
      text.includes('5l') ||
      text.includes('3l') ||
      text.includes('heat'));

  const isCorrect = isMatch;
  let score = isCorrect ? 9 : 4;
  if (hintsUsedCount > 0) score = Math.max(5, score - hintsUsedCount);

  const whatWentWell: string[] = [];
  const whatCouldImprove: string[] = [];

  if (isCorrect) {
    whatWentWell.push('Identified the core hidden variable / constraint.');
    if (hintsUsedCount === 0) whatWentWell.push('Solved independently without requesting hints.');
    if (timeTakenSecs < 300) whatWentWell.push('Fast analytical processing speed.');
    whatCouldImprove.push('Explicitly state alternative edge cases where applicable.');
  } else {
    whatWentWell.push('Attempted problem and structured a initial hypothesis.');
    whatCouldImprove.push('Check for unstated physical or logical constraints.');
    whatCouldImprove.push('Avoid assuming binary states when continuous variables exist.');
  }

  const detailedReasoning = isCorrect
    ? `Your reasoning successfully isolates the key constraint. ${question.explanation}`
    : `Your conclusion conflicts with the problem constraints. ${question.explanation}`;

  return {
    isCorrect,
    verdict: isCorrect ? 'Correct' : 'Incorrect',
    qualityScore: score,
    whatWentWell,
    whatCouldImprove,
    detailedReasoning
  };
}

/**
 * Formats structured AI Chat Responses following the strict 5-part architecture:
 * ## Answer
 * ## Evidence
 * ## Interpretation
 * ## Uncertainty
 * ## Suggested Next Step
 */
export function generateStructuredAIResponse(prompt: string): string {
  const query = prompt.toLowerCase();

  if (query.includes('how am i doing') || query.includes('review') || query.includes('month') || query.includes('summary')) {
    return `## Answer
You are executing at 95% Winter Arc protocol adherence, but a pace deficit has opened up in your AI Engineering milestone.

## Evidence
- Tracked Deep Work: 24h 15m this week.
- Cash Outflow 30D: ₹8,420 vs Consumption Cost ₹347/day.
- AI Learning: 18 / 30 hours completed for Oct 15 Checkpoint (60%).
- Recent 7-day learning pace: 1h 05m/day vs required 1h 43m/day.

## Interpretation
Your overall daily habit discipline is strong (7.1h avg sleep, workouts 14/12). However, afternoon entertainment screen time (1h 37m/day) is competing with your evening learning blocks.

## Uncertainty
The system cannot verify whether recent afternoon distractions are due to work fatigue or lack of block scheduling.

## Suggested Next Step
Move your planned 90-minute PyTorch learning block to 08:30 AM immediately after morning workout for the next 7 days.`;
  }

  if (query.includes('waste') || query.includes('time') || query.includes('leak') || query.includes('instagram')) {
    return `## Answer
Your primary time leak is afternoon social media entertainment between 13:30 and 15:00.

## Evidence
- Logged Instagram/Entertainment time: 1h 37m/day average over the last 14 days.
- In contrast, your AI Engineering study averaged 58m/day during the same period.

## Interpretation
Post-lunch cognitive dip is triggering passive phone browsing instead of structured rest or focused work.

## Uncertainty
It is unclear if lowering screen time will automatically transfer into deep work hours without explicit calendar blocking.

## Suggested Next Step
Set an app limit of 20 minutes for social media between 12:00 PM and 18:00 PM starting tomorrow.`;
  }

  if (query.includes('money') || query.includes('expense') || query.includes('cost') || query.includes('petrol') || query.includes('spend')) {
    return `## Answer
Your financial outlays are well-controlled at ₹347/day active consumption cost, but lump-sum cash outlays create short-term cash tightness.

## Evidence
- Total Cash Outflow this month: ₹8,420.
- Daily Consumption Allocation: ₹347/day.
- Petrol Refill: ₹200 allocated at ₹66.67/day over 3-day refill cycles.

## Interpretation
Upfront multi-day purchases (Whey Protein ₹2,800, Rice ₹320, Shampoo ₹450) cause temporary cash dips, but daily consumption value remains within budget.

## Uncertainty
Future vehicle commute frequency may vary if additional client office visits are scheduled.

## Suggested Next Step
Maintain ₹2,500 in liquid reserve to absorb upfront bulk purchases without disturbing savings targets.`;
  }

  return `## Answer
Based on your tracked data, your Winter Arc execution remains strong across health and daily habit consistency.

## Evidence
- Day 1 Score: 78/100.
- Deep Work: 3h 40m logged today.
- Cognitive Streak: 4 days active.

## Interpretation
Your personal operating system is accurately capturing life entries. Protecting focus blocks is your current primary leverage point.

## Uncertainty
Data depth will increase as more daily entries are accumulated.

## Suggested Next Step
Complete today's Cognitive Challenge in Cognitive Lab to maintain your reasoning streak.`;
}
