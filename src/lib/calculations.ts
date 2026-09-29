import { ConsumptionExpense, FuelEntry, TimeEntry } from '../types';

/**
 * Calculates daily cost of a consumption purchase
 */
export function calculateDailyCost(totalAmount: number, durationDays: number): number {
  if (durationDays <= 0) return totalAmount;
  return Number((totalAmount / durationDays).toFixed(2));
}

/**
 * Calculates per unit cost (e.g. ₹/kg, ₹/liter)
 */
export function calculateUnitCost(totalAmount: number, quantity: number): number {
  if (quantity <= 0) return totalAmount;
  return Number((totalAmount / quantity).toFixed(2));
}

/**
 * Fuel vehicle metrics calculation
 */
export function calculateFuelMetrics(
  amountSpent: number,
  litres: number,
  currentOdometer: number,
  previousOdometer: number,
  expectedDurationDays: number = 3
): {
  distanceKm: number;
  mileageKmpl: number;
  costPerKm: number;
  dailyFuelCost: number;
} {
  const distanceKm = Math.max(0, currentOdometer - previousOdometer);
  const mileageKmpl = litres > 0 && distanceKm > 0 ? Number((distanceKm / litres).toFixed(1)) : 0;
  const costPerKm = distanceKm > 0 ? Number((amountSpent / distanceKm).toFixed(2)) : 0;
  const dailyFuelCost = calculateDailyCost(amountSpent, expectedDurationDays);

  return {
    distanceKm,
    mileageKmpl,
    costPerKm,
    dailyFuelCost
  };
}

/**
 * Format minutes into readable "3h 40m" string
 */
export function formatMinutes(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}

/**
 * Calculate total active daily consumption cost
 */
export function calculateActiveDailyConsumptionCost(items: ConsumptionExpense[]): number {
  return items
    .filter((i) => i.status === 'Active')
    .reduce((sum, item) => sum + item.dailyCost, 0);
}

/**
 * Calculate total deep work minutes from time entries
 */
export function calculateDeepWorkMinutes(entries: TimeEntry[]): number {
  return entries
    .filter((e) => e.isDeepWork || e.category === 'Work' || e.category === 'Learning')
    .reduce((sum, entry) => sum + entry.durationMinutes, 0);
}

/**
 * Currency formatter (₹ INR standard)
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2
  }).format(amount);
}
