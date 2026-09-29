import React from 'react';
import { Activity, Moon, Droplets, Dumbbell, Footprints, Smile, BatteryCharging, CheckCircle2 } from 'lucide-react';
import { HealthEntry } from '../types';

interface HealthWellnessViewProps {
  healthEntries: HealthEntry[];
  onUpdateTodayHealth: (entry: Partial<HealthEntry>) => void;
}

export const HealthWellnessView: React.FC<HealthWellnessViewProps> = ({
  healthEntries,
  onUpdateTodayHealth
}) => {
  const todayHealth = healthEntries[0] || {
    date: '2026-09-29',
    sleepHours: 7.08,
    sleepQuality: 'Optimal',
    waterLiters: 2.8,
    workoutCompleted: true,
    workoutType: 'Upper Body Resistance',
    stepsCount: 8450,
    weightKg: 74.2,
    energyLevel: 8,
    moodLevel: 9
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl font-black text-amber-100 font-outfit flex items-center gap-2">
          <Activity className="w-6 h-6 text-cyan-400" /> Health & Recovery Operating System
        </h1>
        <p className="text-xs text-amber-200/80">Track sleep consistency, workout completion, hydration, and energy trends.</p>
      </div>

      {/* METRIC TILES */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* SLEEP */}
        <div className="p-4 rounded-2xl bg-[#1c1815] border border-amber-500/20 space-y-2">
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span className="flex items-center gap-1 font-semibold"><Moon className="w-4 h-4 text-cyan-400" /> Sleep</span>
            <span className="text-[10px] text-emerald-400">{todayHealth.sleepQuality}</span>
          </div>
          <div className="text-2xl font-black text-amber-100 font-outfit">{todayHealth.sleepHours}h</div>
          <div className="text-[10px] text-neutral-400">Target: 7.5h per night</div>
        </div>

        {/* WORKOUT */}
        <div className="p-4 rounded-2xl bg-[#1c1815] border border-amber-500/20 space-y-2">
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span className="flex items-center gap-1 font-semibold"><Dumbbell className="w-4 h-4 text-orange-400" /> Workout</span>
            <span className="text-[10px] text-emerald-400">Done</span>
          </div>
          <div className="text-base font-bold text-amber-100 font-outfit truncate">
            {todayHealth.workoutType || 'Resistance Training'}
          </div>
          <div className="text-[10px] text-emerald-400">✓ Completed today</div>
        </div>

        {/* WATER */}
        <div className="p-4 rounded-2xl bg-[#1c1815] border border-amber-500/20 space-y-2">
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span className="flex items-center gap-1 font-semibold"><Droplets className="w-4 h-4 text-blue-400" /> Water</span>
            <span className="text-[10px] text-blue-300">Hydrated</span>
          </div>
          <div className="text-2xl font-black text-blue-200 font-outfit">{todayHealth.waterLiters}L</div>
          <div className="text-[10px] text-neutral-400">Goal: 3.0L</div>
        </div>

        {/* STEPS */}
        <div className="p-4 rounded-2xl bg-[#1c1815] border border-amber-500/20 space-y-2">
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span className="flex items-center gap-1 font-semibold"><Footprints className="w-4 h-4 text-emerald-400" /> Steps</span>
            <span className="text-[10px] text-emerald-400">Active</span>
          </div>
          <div className="text-2xl font-black text-emerald-200 font-outfit">{todayHealth.stepsCount.toLocaleString()}</div>
          <div className="text-[10px] text-neutral-400">Goal: 10,000 steps</div>
        </div>
      </div>

      {/* ENERGY & MOOD TRENDS */}
      <div className="p-5 rounded-3xl bg-[#1c1815] border border-amber-500/20 space-y-4">
        <h2 className="text-base font-bold text-amber-100 font-outfit">Today's Subjective Vitality</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-[#12100e] border border-amber-500/15 space-y-2">
            <div className="flex justify-between text-xs text-neutral-300 font-semibold">
              <span className="flex items-center gap-1"><BatteryCharging className="w-4 h-4 text-amber-400" /> Energy Level</span>
              <span className="font-bold text-amber-400">{todayHealth.energyLevel}/10</span>
            </div>
            <div className="w-full bg-[#26201b] h-2 rounded-full overflow-hidden">
              <div className="bg-gradient-to-r from-amber-500 to-orange-500 h-full" style={{ width: `${todayHealth.energyLevel * 10}%` }} />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#12100e] border border-amber-500/15 space-y-2">
            <div className="flex justify-between text-xs text-neutral-300 font-semibold">
              <span className="flex items-center gap-1"><Smile className="w-4 h-4 text-orange-400" /> Mood Level</span>
              <span className="font-bold text-orange-400">{todayHealth.moodLevel}/10</span>
            </div>
            <div className="w-full bg-[#26201b] h-2 rounded-full overflow-hidden">
              <div className="bg-gradient-to-r from-orange-500 to-rose-500 h-full" style={{ width: `${todayHealth.moodLevel * 10}%` }} />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#12100e] border border-amber-500/15 space-y-2">
            <div className="flex justify-between text-xs text-neutral-300 font-semibold">
              <span>Body Weight</span>
              <span className="font-bold text-amber-100">{todayHealth.weightKg} kg</span>
            </div>
            <div className="text-[10px] text-emerald-400">Lean conditioning goal</div>
          </div>
        </div>
      </div>
    </div>
  );
};
