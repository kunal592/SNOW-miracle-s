import { AIExtraction, CategoryType } from '../types';

export function simulateAIExtraction(rawInput: string): AIExtraction {
  const text = rawInput.toLowerCase();
  
  // Extract money figure (₹200, 200 rs, rs 200, 200 INR)
  const moneyMatch = rawInput.match(/(?:₹|rs\.?|inr)\s*(\d+(?:\.\d+)?)|(\d+(?:\.\d+)?)\s*(?:₹|rs\.?|inr|rupees)/i) || rawInput.match(/\b(\d{2,6})\b/);
  const amount = moneyMatch ? parseFloat(moneyMatch[1] || moneyMatch[2]) : undefined;

  // Extract duration days (3 days, 20 days)
  const durationMatch = text.match(/(\d+)\s*(?:days?|d\b)/);
  const durationDays = durationMatch ? parseInt(durationMatch[1], 10) : undefined;

  // Extract time hours/minutes (2 hours, 45 min)
  const hoursMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:hours?|hrs?|h\b)/);
  const minutesMatch = text.match(/(\d+)\s*(?:mins?|minutes?|m\b)/);
  let timeHours = hoursMatch ? parseFloat(hoursMatch[1]) : undefined;
  if (!timeHours && minutesMatch) {
    timeHours = parseFloat((parseInt(minutesMatch[1], 10) / 60).toFixed(2));
  }

  // Determine intent & category
  let category: CategoryType = 'Other';
  let isConsumption = false;
  let suggestedAction: AIExtraction['suggestedAction'] = 'Create Expense';
  let explanation = 'Identified general activity entry.';
  let confidence = 88;

  if (text.includes('petrol') || text.includes('fuel') || text.includes('diesel') || text.includes('bike') || text.includes('car')) {
    category = 'Transport';
    isConsumption = true;
    suggestedAction = 'Create Consumption';
    confidence = 99;
    explanation = 'Detected fuel/petrol purchase. Categorized as Transport → Fuel with multi-day consumption allocation.';
  } else if (text.includes('rice') || text.includes('chicken') || text.includes('grocery') || text.includes('groceries') || text.includes('shampoo') || text.includes('oil') || text.includes('milk')) {
    category = text.includes('shampoo') ? 'Personal Care' : 'Food';
    isConsumption = durationDays !== undefined || text.includes('last') || text.includes('kg');
    suggestedAction = isConsumption ? 'Create Consumption' : 'Log Food';
    confidence = 96;
    explanation = isConsumption 
      ? `Recognized consumable store purchase. Allocated over estimated ${durationDays || 15} days.`
      : 'Recognized food item expense.';
  } else if (text.includes('studied') || text.includes('python') || text.includes('react') || text.includes('ai') || text.includes('course') || text.includes('learning')) {
    category = 'Learning';
    suggestedAction = 'Log Learning';
    confidence = 97;
    explanation = `Identified learning activity (${timeHours || 1}h duration detected).`;
  } else if (text.includes('work') || text.includes('worked') || text.includes('meeting') || text.includes('code') || text.includes('dashboard')) {
    category = 'Work';
    suggestedAction = 'Log Time';
    confidence = 95;
    explanation = 'Detected professional work hours session.';
  } else if (text.includes('gym') || text.includes('workout') || text.includes('run') || text.includes('slept') || text.includes('sleep') || text.includes('water')) {
    category = 'Health';
    suggestedAction = 'Log Health';
    confidence = 94;
    explanation = 'Identified wellness / health tracking entry.';
  } else if (amount && (text.includes('rent') || text.includes('bill') || text.includes('electricity') || text.includes('netflix') || text.includes('subscription'))) {
    category = text.includes('rent') ? 'Housing' : (text.includes('netflix') ? 'Subscriptions' : 'Utilities');
    isConsumption = text.includes('month') || text.includes('rent') || text.includes('subscription');
    suggestedAction = isConsumption ? 'Create Consumption' : 'Create Expense';
    confidence = 98;
    explanation = 'Detected recurring fixed expense / subscription.';
  }

  const days = durationDays || (isConsumption ? (category === 'Transport' ? 3 : 20) : 1);
  const dailyAllocationCost = amount ? Number((amount / days).toFixed(2)) : undefined;

  return {
    id: 'ai_' + Math.random().toString(36).substring(2, 9),
    rawText: rawInput,
    extractedCategory: category,
    subcategory: category === 'Transport' ? 'Fuel' : (category === 'Food' ? 'Groceries' : undefined),
    extractedAmount: amount,
    extractedDurationDays: isConsumption ? days : undefined,
    isConsumption,
    dailyAllocationCost: isConsumption ? dailyAllocationCost : undefined,
    extractedTimeHours: timeHours,
    confidenceScore: confidence,
    aiExplanation: explanation,
    suggestedAction
  };
}
