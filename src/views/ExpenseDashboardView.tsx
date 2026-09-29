import React from 'react';
import { DollarSign, Sparkles, Fuel, ArrowUpRight, ShieldCheck, Wallet, PieChart } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { Expense, ConsumptionExpense } from '../types';
import { formatCurrency, calculateActiveDailyConsumptionCost } from '../lib/calculations';

interface ExpenseDashboardViewProps {
  expenses: Expense[];
  consumptionExpenses: ConsumptionExpense[];
  onNavigate: (route: string) => void;
}

export const ExpenseDashboardView: React.FC<ExpenseDashboardViewProps> = ({
  expenses,
  consumptionExpenses,
  onNavigate
}) => {
  const cashOutflowThisMonth = 8420;
  const consumptionCostThisMonth = 9730;
  const outstandingAllocations = 2340;
  const dailyConsumptionRate = calculateActiveDailyConsumptionCost(consumptionExpenses);

  const chartData = [
    { day: 'Sep 23', CashOutflow: 680, ConsumptionCost: 320 },
    { day: 'Sep 24', CashOutflow: 180, ConsumptionCost: 324 },
    { day: 'Sep 25', CashOutflow: 900, ConsumptionCost: 340 },
    { day: 'Sep 26', CashOutflow: 500, ConsumptionCost: 320 },
    { day: 'Sep 27', CashOutflow: 570, ConsumptionCost: 335 },
    { day: 'Sep 28', CashOutflow: 400, ConsumptionCost: 340 },
    { day: 'Sep 29', CashOutflow: 380, ConsumptionCost: 347 }
  ];

  const categoryBreakdown = [
    { name: 'Food', amount: 3240, color: '#f59e0b', percent: 38 },
    { name: 'Transport', amount: 1860, color: '#ea580c', percent: 22 },
    { name: 'Housing', amount: 1700, color: '#d97706', percent: 20 },
    { name: 'Subscriptions', amount: 420, color: '#e11d48', percent: 5 },
    { name: 'Other', amount: 2510, color: '#8b5cf6', percent: 15 }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-amber-100 font-outfit">Finance & Accounting</h1>
          <p className="text-xs text-amber-200/80">Track actual cash paid vs daily consumption value delivered.</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('/finance/consumption')}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-neutral-950 font-bold text-xs shadow-lg shadow-amber-950/50 flex items-center gap-1.5 transition"
          >
            <Sparkles className="w-4 h-4" /> Consumption Engine
          </button>
          <button
            onClick={() => onNavigate('/finance/fuel')}
            className="px-4 py-2 rounded-xl bg-[#26201b] border border-amber-500/20 hover:border-amber-500/50 text-amber-200 font-bold text-xs flex items-center gap-1.5 transition"
          >
            <Fuel className="w-4 h-4 text-orange-400" /> Fuel Tracker
          </button>
        </div>
      </div>

      {/* METRIC SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-[#1c1815] border border-amber-500/20 shadow-md space-y-1">
          <div className="text-xs text-neutral-400 font-medium flex items-center gap-1.5">
            <Wallet className="w-4 h-4 text-amber-400" /> Cash Outflow (30D)
          </div>
          <div className="text-2xl font-black text-amber-100 font-outfit">
            {formatCurrency(cashOutflowThisMonth)}
          </div>
          <div className="text-[10px] text-neutral-400">Total cash actually paid out</div>
        </div>

        <div className="p-5 rounded-2xl bg-[#1c1815] border border-amber-500/20 shadow-md space-y-1">
          <div className="text-xs text-neutral-400 font-medium flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-orange-400" /> Consumption Cost (30D)
          </div>
          <div className="text-2xl font-black text-orange-200 font-outfit">
            {formatCurrency(consumptionCostThisMonth)}
          </div>
          <div className="text-[10px] text-amber-400">₹{dailyConsumptionRate.toFixed(0)}/day active allocation</div>
        </div>

        <div className="p-5 rounded-2xl bg-[#1c1815] border border-amber-500/20 shadow-md space-y-1">
          <div className="text-xs text-neutral-400 font-medium flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" /> Outstanding Allocations
          </div>
          <div className="text-2xl font-black text-emerald-200 font-outfit">
            {formatCurrency(outstandingAllocations)}
          </div>
          <div className="text-[10px] text-emerald-400">Pre-funded future usage</div>
        </div>
      </div>

      {/* CHART: CASH OUTFLOW VS CONSUMPTION COST */}
      <div className="p-5 rounded-3xl bg-[#1c1815] border border-amber-500/20 shadow-md space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-amber-100 font-outfit">Cash Outflow vs. Consumption Cost</h2>
            <p className="text-xs text-neutral-400">Spiky cash payments vs smooth daily allocation cost.</p>
          </div>
        </div>

        <div className="h-64 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(245, 158, 11, 0.1)" />
              <XAxis dataKey="day" stroke="#a89f91" fontSize={11} />
              <YAxis stroke="#a89f91" fontSize={11} />
              <Tooltip
                contentStyle={{ backgroundColor: '#16120f', borderColor: 'rgba(245, 158, 11, 0.3)', borderRadius: '12px' }}
                itemStyle={{ color: '#f4efe6', fontSize: '12px' }}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Bar dataKey="CashOutflow" fill="#ea580c" radius={[6, 6, 0, 0]} name="Cash Outflow (₹)" />
              <Bar dataKey="ConsumptionCost" fill="#f59e0b" radius={[6, 6, 0, 0]} name="Consumption Cost (₹)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* CATEGORY BREAKDOWN LIST */}
      <div className="p-5 rounded-3xl bg-[#1c1815] border border-amber-500/20 shadow-md space-y-4">
        <h2 className="text-base font-bold text-amber-100 font-outfit flex items-center gap-2">
          <PieChart className="w-5 h-5 text-amber-400" /> Category Breakdown
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {categoryBreakdown.map((cat) => (
            <div key={cat.name} className="p-3.5 rounded-2xl bg-[#12100e] border border-amber-500/15 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                <div>
                  <div className="text-xs font-bold text-amber-100">{cat.name}</div>
                  <div className="text-[10px] text-neutral-400">{cat.percent}% of total spending</div>
                </div>
              </div>
              <div className="text-xs font-bold text-amber-200">
                {formatCurrency(cat.amount)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
