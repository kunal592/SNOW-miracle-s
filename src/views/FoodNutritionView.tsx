import React, { useState } from 'react';
import { Utensils, Droplets, Flame, DollarSign, Sparkles, Plus, CheckCircle2 } from 'lucide-react';
import { FoodEntry } from '../types';
import { formatCurrency } from '../lib/calculations';

interface FoodNutritionViewProps {
  foodEntries: FoodEntry[];
  onAddFoodEntry: (entry: FoodEntry) => void;
}

export const FoodNutritionView: React.FC<FoodNutritionViewProps> = ({
  foodEntries,
  onAddFoodEntry
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mealType, setMealType] = useState<'Breakfast' | 'Lunch' | 'Snack' | 'Dinner'>('Lunch');
  const [description, setDescription] = useState('');
  const [calories, setCalories] = useState('500');
  const [protein, setProtein] = useState('35');
  const [cost, setCost] = useState('120');

  const todayEntries = foodEntries.filter((f) => f.date === '2026-09-29');

  const totalCalories = todayEntries.reduce((sum, f) => sum + (f.calories || 0), 0);
  const totalProtein = todayEntries.reduce((sum, f) => sum + (f.proteinGrams || 0), 0);
  const totalCashFoodSpent = todayEntries.reduce((sum, f) => sum + f.cost, 0);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description) return;

    const newEntry: FoodEntry = {
      id: 'fe_' + Math.random().toString(36).substring(2, 9),
      date: new Date().toISOString().split('T')[0],
      mealType,
      description,
      calories: calories ? parseInt(calories, 10) : undefined,
      proteinGrams: protein ? parseInt(protein, 10) : undefined,
      cost: cost ? parseFloat(cost) : 0,
      isConsumptionBased: false
    };

    onAddFoodEntry(newEntry);
    setDescription('');
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-amber-100 font-outfit flex items-center gap-2">
            <Utensils className="w-6 h-6 text-amber-400" /> Food & Nutrition Engine
          </h1>
          <p className="text-xs text-amber-200/80">Track protein intake, daily meal costs, and pantry allocations.</p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-neutral-950 font-bold text-xs shadow-lg flex items-center gap-2 transition active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[3]" /> Log Meal Entry
        </button>
      </div>

      {/* METRIC CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-[#1c1815] border border-amber-500/20 space-y-1">
          <div className="text-xs text-neutral-400">Total Calories</div>
          <div className="text-2xl font-black text-amber-100 font-outfit">{totalCalories} <span className="text-xs font-normal">kcal</span></div>
          <div className="text-[10px] text-amber-400">Target: 2,200 kcal</div>
        </div>

        <div className="p-4 rounded-2xl bg-[#1c1815] border border-amber-500/20 space-y-1">
          <div className="text-xs text-neutral-400">Protein Intake</div>
          <div className="text-2xl font-black text-orange-200 font-outfit">{totalProtein}g</div>
          <div className="text-[10px] text-emerald-400">Optimal lean muscle goal</div>
        </div>

        <div className="p-4 rounded-2xl bg-[#1c1815] border border-amber-500/20 space-y-1">
          <div className="text-xs text-neutral-400">Food Cash Spent</div>
          <div className="text-2xl font-black text-emerald-200 font-outfit">₹{totalCashFoodSpent}</div>
          <div className="text-[10px] text-neutral-400">Direct instant purchases</div>
        </div>

        <div className="p-4 rounded-2xl bg-[#1c1815] border border-amber-500/20 space-y-1">
          <div className="text-xs text-neutral-400">Pantry Allocation</div>
          <div className="text-2xl font-black text-amber-300 font-outfit">₹245<span className="text-xs font-normal">/day</span></div>
          <div className="text-[10px] text-amber-400">Rice, oil & spices included</div>
        </div>
      </div>

      {/* FORM MODAL */}
      {isModalOpen && (
        <div className="p-5 rounded-3xl bg-[#1c1815] border border-amber-500/30 shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-amber-500/20 pb-3">
            <h2 className="text-base font-bold text-amber-100 font-outfit">Log Meal</h2>
            <button onClick={() => setIsModalOpen(false)} className="text-xs text-neutral-400">Cancel</button>
          </div>

          <form onSubmit={handleCreate} className="space-y-4 text-xs">
            <div>
              <label className="block text-neutral-300 mb-1">Meal Description</label>
              <input
                type="text"
                placeholder="e.g. Grilled Chicken Breast with Basmati Rice & Salad"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-[#12100e] border border-amber-500/30 rounded-xl p-3 text-amber-100"
              />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-neutral-300 mb-1">Meal Type</label>
                <select
                  value={mealType}
                  onChange={(e) => setMealType(e.target.value as any)}
                  className="w-full bg-[#12100e] border border-amber-500/30 rounded-xl p-2.5 text-amber-100"
                >
                  <option value="Breakfast">Breakfast</option>
                  <option value="Lunch">Lunch</option>
                  <option value="Snack">Snack</option>
                  <option value="Dinner">Dinner</option>
                </select>
              </div>

              <div>
                <label className="block text-neutral-300 mb-1">Calories (kcal)</label>
                <input
                  type="number"
                  value={calories}
                  onChange={(e) => setCalories(e.target.value)}
                  className="w-full bg-[#12100e] border border-amber-500/30 rounded-xl p-2.5 text-amber-100"
                />
              </div>

              <div>
                <label className="block text-neutral-300 mb-1">Protein (g)</label>
                <input
                  type="number"
                  value={protein}
                  onChange={(e) => setProtein(e.target.value)}
                  className="w-full bg-[#12100e] border border-amber-500/30 rounded-xl p-2.5 text-amber-100"
                />
              </div>

              <div>
                <label className="block text-neutral-300 mb-1">Cost (₹)</label>
                <input
                  type="number"
                  value={cost}
                  onChange={(e) => setCost(e.target.value)}
                  className="w-full bg-[#12100e] border border-amber-500/30 rounded-xl p-2.5 text-amber-100"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-neutral-950 font-bold text-xs shadow-lg flex items-center justify-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" /> Save Meal Entry
            </button>
          </form>
        </div>
      )}

      {/* TODAY'S MEALS LIST */}
      <div className="space-y-3">
        <h2 className="text-base font-bold text-amber-100 font-outfit">Today's Meals</h2>
        <div className="space-y-2">
          {todayEntries.map((food) => (
            <div key={food.id} className="p-4 rounded-2xl bg-[#1c1815] border border-amber-500/15 flex items-center justify-between text-xs">
              <div>
                <div className="font-bold text-amber-100">{food.description}</div>
                <div className="text-[10px] text-neutral-400 mt-0.5">
                  {food.mealType} • {food.calories} kcal • {food.proteinGrams}g Protein
                </div>
              </div>
              <div className="font-bold text-amber-300 font-outfit text-sm">
                ₹{food.cost}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
