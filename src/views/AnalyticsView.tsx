import React, { useState } from 'react';
import { BarChart3, Clock, DollarSign, BookOpen, Activity, Target } from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

export const AnalyticsView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'Overview' | 'Time' | 'Money' | 'Learning' | 'Health'>('Overview');
  const [range, setRange] = useState<'7D' | '30D' | '90D'>('7D');

  const timeData = [
    { day: 'Mon', DeepWork: 4.5, Learning: 2.0, Work: 7.5, ScreenTime: 1.2 },
    { day: 'Tue', DeepWork: 5.0, Learning: 2.5, Work: 8.0, ScreenTime: 1.5 },
    { day: 'Wed', DeepWork: 3.5, Learning: 1.8, Work: 7.0, ScreenTime: 2.0 },
    { day: 'Thu', DeepWork: 6.0, Learning: 3.0, Work: 8.5, ScreenTime: 1.0 },
    { day: 'Fri', DeepWork: 4.0, Learning: 2.2, Work: 7.8, ScreenTime: 1.4 },
    { day: 'Sat', DeepWork: 2.5, Learning: 4.0, Work: 3.0, ScreenTime: 1.8 },
    { day: 'Sun', DeepWork: 3.8, Learning: 3.5, Work: 4.0, ScreenTime: 1.1 }
  ];

  const moneyData = [
    { day: 'Mon', Cash: 450, Consumption: 320 },
    { day: 'Tue', Cash: 200, Consumption: 325 },
    { day: 'Wed', Cash: 800, Consumption: 330 },
    { day: 'Thu', Cash: 150, Consumption: 320 },
    { day: 'Fri', Cash: 650, Consumption: 335 },
    { day: 'Sat', Cash: 300, Consumption: 340 },
    { day: 'Sun', Cash: 380, Consumption: 347 }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-amber-100 font-outfit flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-amber-400" /> Analytics & Intelligence
          </h1>
          <p className="text-xs text-amber-200/80">Cross-domain visualization of time, capital allocation, and health trends.</p>
        </div>

        {/* Range Selector */}
        <div className="flex items-center gap-1 bg-[#1c1815] p-1 rounded-xl border border-amber-500/20 text-xs shrink-0">
          {(['7D', '30D', '90D'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-3 py-1 rounded-lg font-bold transition ${
                range === r ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'text-neutral-400 hover:text-white'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* TABS */}
      <div className="flex items-center gap-2 border-b border-amber-500/15 pb-2">
        {(['Overview', 'Time', 'Money', 'Learning', 'Health'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === tab ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* CHART 1: TIME DEEP WORK */}
      <div className="p-5 rounded-3xl bg-[#1c1815] border border-amber-500/20 shadow-md space-y-3">
        <h2 className="text-base font-bold text-amber-100 font-outfit flex items-center gap-2">
          <Clock className="w-4 h-4 text-amber-400" /> Time Allocation (Hours/Day)
        </h2>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={timeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(245, 158, 11, 0.1)" />
              <XAxis dataKey="day" stroke="#a89f91" fontSize={11} />
              <YAxis stroke="#a89f91" fontSize={11} />
              <Tooltip contentStyle={{ backgroundColor: '#16120f', borderColor: 'rgba(245, 158, 11, 0.3)', borderRadius: '12px' }} />
              <Area type="monotone" dataKey="DeepWork" stroke="#f59e0b" fill="rgba(245, 158, 11, 0.2)" name="Deep Work (h)" />
              <Area type="monotone" dataKey="Learning" stroke="#10b981" fill="rgba(16, 185, 129, 0.15)" name="Learning (h)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* CHART 2: CASH VS CONSUMPTION */}
      <div className="p-5 rounded-3xl bg-[#1c1815] border border-amber-500/20 shadow-md space-y-3">
        <h2 className="text-base font-bold text-amber-100 font-outfit flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-emerald-400" /> Cash Outflow vs Daily Consumption (₹)
        </h2>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={moneyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(245, 158, 11, 0.1)" />
              <XAxis dataKey="day" stroke="#a89f91" fontSize={11} />
              <YAxis stroke="#a89f91" fontSize={11} />
              <Tooltip contentStyle={{ backgroundColor: '#16120f', borderColor: 'rgba(245, 158, 11, 0.3)', borderRadius: '12px' }} />
              <Bar dataKey="Cash" fill="#ea580c" radius={[6, 6, 0, 0]} name="Cash Outflow (₹)" />
              <Bar dataKey="Consumption" fill="#f59e0b" radius={[6, 6, 0, 0]} name="Consumption (₹)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
