import React, { useState } from 'react';
import { Sparkles, Plus, Calendar, Clock, DollarSign, Edit2, Trash2, CheckCircle2, ShieldCheck, RefreshCw } from 'lucide-react';
import { ConsumptionExpense, CategoryType, AllocationMethod } from '../types';
import { formatCurrency, calculateDailyCost } from '../lib/calculations';

interface ConsumptionEngineViewProps {
  consumptionItems: ConsumptionExpense[];
  onAddConsumption: (item: Omit<ConsumptionExpense, 'id'>) => void;
  onUpdateConsumption: (id: string, updated: Partial<ConsumptionExpense>) => void;
  onDeleteConsumption: (id: string) => void;
}

export const ConsumptionEngineView: React.FC<ConsumptionEngineViewProps> = ({
  consumptionItems,
  onAddConsumption,
  onUpdateConsumption,
  onDeleteConsumption
}) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state
  const [itemTitle, setItemTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<CategoryType>('Food');
  const [durationDays, setDurationDays] = useState('20');
  const [allocationMethod, setAllocationMethod] = useState<AllocationMethod>('Equal daily');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('kg');

  const totalActiveDailyCost = consumptionItems
    .filter((i) => i.status === 'Active')
    .reduce((sum, i) => sum + i.dailyCost, 0);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemTitle || !amount || !durationDays) return;

    const numAmount = parseFloat(amount);
    const numDays = parseInt(durationDays, 10);
    const dailyCost = calculateDailyCost(numAmount, numDays);

    if (editingId) {
      onUpdateConsumption(editingId, {
        item: itemTitle,
        totalPurchaseAmount: numAmount,
        category,
        expectedDurationDays: numDays,
        dailyCost,
        allocationMethod,
        quantity: quantity ? parseFloat(quantity) : undefined,
        unit: unit || undefined
      });
      setEditingId(null);
    } else {
      onAddConsumption({
        item: itemTitle,
        category,
        totalPurchaseAmount: numAmount,
        purchaseDate: new Date().toISOString().split('T')[0],
        startDate: new Date().toISOString().split('T')[0],
        expectedDurationDays: numDays,
        dailyCost,
        allocationMethod,
        quantity: quantity ? parseFloat(quantity) : undefined,
        unit: unit || undefined,
        status: 'Active'
      });
    }

    setItemTitle('');
    setAmount('');
    setDurationDays('20');
    setIsFormOpen(false);
  };

  const handleEditClick = (item: ConsumptionExpense) => {
    setEditingId(item.id);
    setItemTitle(item.item);
    setAmount(item.totalPurchaseAmount.toString());
    setCategory(item.category);
    setDurationDays(item.expectedDurationDays.toString());
    setAllocationMethod(item.allocationMethod);
    setQuantity(item.quantity?.toString() || '');
    setUnit(item.unit || '');
    setIsFormOpen(true);
  };

  // Preview live dynamic calculation
  const livePreviewDailyCost = amount && durationDays ? calculateDailyCost(parseFloat(amount), parseInt(durationDays, 10)) : 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-[#26201b] via-[#1c1815] to-[#12100e] border border-amber-500/25 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h1 className="text-2xl font-black text-amber-100 font-outfit">Consumption Accounting</h1>
          </div>
          <p className="text-xs text-amber-200/80 mt-1">
            "Buy once. The tracker calculates your daily cost automatically."
          </p>
        </div>

        <button
          onClick={() => {
            setEditingId(null);
            setItemTitle('');
            setAmount('');
            setIsFormOpen(true);
          }}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-neutral-950 font-bold text-xs shadow-lg shadow-amber-950/60 flex items-center gap-2 transition active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[3]" /> Add Consumption Purchase
        </button>
      </div>

      {/* TOTAL DAILY CONSUMPTION COST PILL */}
      <div className="p-4 rounded-2xl bg-[#1c1815] border border-amber-500/20 shadow-md flex items-center justify-between">
        <div>
          <div className="text-xs text-neutral-400">Total Active Daily Allocation</div>
          <div className="text-xl font-black text-amber-300 font-outfit">
            {formatCurrency(totalActiveDailyCost)} <span className="text-xs font-normal text-neutral-400">/ day</span>
          </div>
        </div>
        <span className="px-3 py-1 rounded-full bg-amber-500/15 text-amber-300 text-xs font-bold border border-amber-500/30">
          {consumptionItems.filter((i) => i.status === 'Active').length} Active Items
        </span>
      </div>

      {/* Form Modal */}
      {isFormOpen && (
        <div className="p-5 rounded-3xl bg-[#1c1815] border border-amber-500/30 shadow-2xl space-y-4 animate-in slide-in-from-top-4">
          <div className="flex items-center justify-between border-b border-amber-500/20 pb-3">
            <h2 className="text-base font-bold text-amber-100 font-outfit">
              {editingId ? 'Edit Consumption Allocation' : 'Add New Consumption Item'}
            </h2>
            <button
              onClick={() => setIsFormOpen(false)}
              className="text-xs text-neutral-400 hover:text-white"
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleSave} className="space-y-4 text-xs">
            <div>
              <label className="block text-neutral-300 mb-1 font-semibold">Item / Purchase Title</label>
              <input
                type="text"
                placeholder="e.g. Petrol refill, Basmati Rice 5kg, Herbal Shampoo"
                value={itemTitle}
                onChange={(e) => setItemTitle(e.target.value)}
                className="w-full bg-[#12100e] border border-amber-500/30 rounded-xl p-3 text-sm text-amber-100 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-neutral-300 mb-1 font-semibold">Total Amount (₹)</label>
                <input
                  type="number"
                  placeholder="200"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-[#12100e] border border-amber-500/30 rounded-xl p-2.5 text-xs text-amber-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-neutral-300 mb-1 font-semibold">Duration (Days)</label>
                <input
                  type="number"
                  placeholder="3"
                  value={durationDays}
                  onChange={(e) => setDurationDays(e.target.value)}
                  className="w-full bg-[#12100e] border border-amber-500/30 rounded-xl p-2.5 text-xs text-amber-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-neutral-300 mb-1 font-semibold">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as CategoryType)}
                  className="w-full bg-[#12100e] border border-amber-500/30 rounded-xl p-2.5 text-xs text-amber-100 focus:outline-none focus:border-amber-500"
                >
                  <option value="Transport">Transport</option>
                  <option value="Food">Food</option>
                  <option value="Personal Care">Personal Care</option>
                  <option value="Housing">Housing</option>
                  <option value="Subscriptions">Subscriptions</option>
                  <option value="Health">Health</option>
                </select>
              </div>

              <div>
                <label className="block text-neutral-300 mb-1 font-semibold">Allocation Method</label>
                <select
                  value={allocationMethod}
                  onChange={(e) => setAllocationMethod(e.target.value as AllocationMethod)}
                  className="w-full bg-[#12100e] border border-amber-500/30 rounded-xl p-2.5 text-xs text-amber-100 focus:outline-none focus:border-amber-500"
                >
                  <option value="Equal daily">Equal daily</option>
                  <option value="Per quantity">Per quantity</option>
                  <option value="Per usage">Per usage</option>
                  <option value="Subscription period">Subscription period</option>
                </select>
              </div>
            </div>

            {/* DYNAMIC CALCULATION PREVIEW BOX */}
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
              <span className="font-medium text-amber-200">Calculated Daily Allocation:</span>
              <span className="text-base font-black text-amber-400 font-outfit">
                ₹{livePreviewDailyCost.toFixed(2)} / day
              </span>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-neutral-950 font-bold text-xs shadow-lg shadow-amber-950/50 flex items-center justify-center gap-1.5 transition"
            >
              <CheckCircle2 className="w-4 h-4" /> Save Consumption Allocation
            </button>
          </form>
        </div>
      )}

      {/* Active Consumption Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {consumptionItems.map((item) => (
          <div
            key={item.id}
            className="p-4 rounded-2xl bg-[#1c1815] border border-amber-500/20 shadow-md space-y-3 transition hover:border-amber-500/40"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                  {item.category}
                </span>
                <h3 className="text-base font-bold text-amber-100 font-outfit">{item.item}</h3>
              </div>
              <div className="text-right">
                <div className="text-sm font-black text-amber-300 font-outfit">
                  ₹{item.dailyCost.toFixed(2)}<span className="text-[10px] font-normal text-neutral-400">/day</span>
                </div>
                <div className="text-[10px] text-neutral-400">{item.allocationMethod}</div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-[#12100e] text-[11px] text-neutral-300">
              <div>
                <span className="text-[10px] text-neutral-500 block">Total Paid:</span>
                <span className="font-bold text-amber-100">₹{item.totalPurchaseAmount}</span>
              </div>
              <div>
                <span className="text-[10px] text-neutral-500 block">Duration:</span>
                <span className="font-bold text-amber-100">{item.expectedDurationDays} Days</span>
              </div>
              <div>
                <span className="text-[10px] text-neutral-500 block">Started:</span>
                <span className="font-bold text-amber-100">{item.startDate}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1 text-xs">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                {item.status}
              </span>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleEditClick(item)}
                  className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition"
                  title="Edit allocation"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onDeleteConsumption(item.id)}
                  className="p-1.5 rounded-lg bg-neutral-800 hover:bg-rose-950 text-neutral-400 hover:text-rose-300 transition"
                  title="Delete"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
