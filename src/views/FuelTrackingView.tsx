import React, { useState } from 'react';
import { Fuel, Gauge, Navigation, Plus, CheckCircle2, TrendingUp, Calendar, AlertCircle } from 'lucide-react';
import { FuelEntry } from '../types';
import { calculateFuelMetrics, formatCurrency } from '../lib/calculations';

interface FuelTrackingViewProps {
  fuelEntries: FuelEntry[];
  onAddFuelEntry: (entry: FuelEntry) => void;
}

export const FuelTrackingView: React.FC<FuelTrackingViewProps> = ({
  fuelEntries,
  onAddFuelEntry
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [amount, setAmount] = useState('200');
  const [litres, setLitres] = useState('2.0');
  const [currentOdometer, setCurrentOdometer] = useState('82460');
  const [durationDays, setDurationDays] = useState('3');
  const [station, setStation] = useState('HP Fuel Station');

  const latestEntry = fuelEntries[0];

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    const numLitres = parseFloat(litres);
    const numOdo = parseInt(currentOdometer, 10);
    const prevOdo = latestEntry ? latestEntry.odometerKm : 82400;
    const days = parseInt(durationDays, 10);

    const metrics = calculateFuelMetrics(numAmount, numLitres, numOdo, prevOdo, days);

    const newEntry: FuelEntry = {
      id: 'fuel_' + Math.random().toString(36).substring(2, 9),
      date: new Date().toISOString().split('T')[0],
      amountSpent: numAmount,
      litres: numLitres,
      odometerKm: numOdo,
      previousOdometerKm: prevOdo,
      distanceKm: metrics.distanceKm,
      mileageKmpl: metrics.mileageKmpl,
      costPerKm: metrics.costPerKm,
      expectedDurationDays: days,
      dailyFuelCost: metrics.dailyFuelCost,
      stationName: station
    };

    onAddFuelEntry(newEntry);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-amber-100 font-outfit flex items-center gap-2">
            <Fuel className="w-6 h-6 text-orange-400" /> Fuel & Vehicle Tracking
          </h1>
          <p className="text-xs text-amber-200/80">Monitor mileage (km/L), cost/km, and refill daily cost allocation.</p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-neutral-950 font-bold text-xs shadow-lg shadow-amber-950/60 flex items-center gap-2 transition active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[3]" /> Log Refill Entry
        </button>
      </div>

      {/* METRIC SUMMARY CARDS */}
      {latestEntry && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-4 rounded-2xl bg-[#1c1815] border border-amber-500/20 space-y-1">
            <div className="text-xs text-neutral-400">Current Odometer</div>
            <div className="text-xl font-black text-amber-100 font-outfit">{latestEntry.odometerKm.toLocaleString()} km</div>
            <div className="text-[10px] text-amber-400">Last refill: {latestEntry.date}</div>
          </div>

          <div className="p-4 rounded-2xl bg-[#1c1815] border border-amber-500/20 space-y-1">
            <div className="text-xs text-neutral-400">Average Mileage</div>
            <div className="text-xl font-black text-orange-200 font-outfit">{latestEntry.mileageKmpl} <span className="text-xs font-normal">km/L</span></div>
            <div className="text-[10px] text-emerald-400">Optimal efficiency</div>
          </div>

          <div className="p-4 rounded-2xl bg-[#1c1815] border border-amber-500/20 space-y-1">
            <div className="text-xs text-neutral-400">Cost per Kilometer</div>
            <div className="text-xl font-black text-amber-300 font-outfit">₹{latestEntry.costPerKm} <span className="text-xs font-normal">/km</span></div>
            <div className="text-[10px] text-neutral-400">Based on recent refills</div>
          </div>

          <div className="p-4 rounded-2xl bg-[#1c1815] border border-amber-500/20 space-y-1">
            <div className="text-xs text-neutral-400">Daily Fuel Cost</div>
            <div className="text-xl font-black text-emerald-200 font-outfit">₹{latestEntry.dailyFuelCost.toFixed(2)} <span className="text-xs font-normal">/day</span></div>
            <div className="text-[10px] text-emerald-400">Allocated over {latestEntry.expectedDurationDays} days</div>
          </div>
        </div>
      )}

      {/* MODAL FORM */}
      {isModalOpen && (
        <div className="p-5 rounded-3xl bg-[#1c1815] border border-amber-500/30 shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-amber-500/20 pb-3">
            <h2 className="text-base font-bold text-amber-100 font-outfit">Log Fuel Refill</h2>
            <button onClick={() => setIsModalOpen(false)} className="text-xs text-neutral-400">Cancel</button>
          </div>

          <form onSubmit={handleCreate} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-neutral-300 mb-1">Amount Spent (₹)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-[#12100e] border border-amber-500/30 rounded-xl p-2.5 text-amber-100"
                />
              </div>

              <div>
                <label className="block text-neutral-300 mb-1">Litres Filled</label>
                <input
                  type="number"
                  step="0.1"
                  value={litres}
                  onChange={(e) => setLitres(e.target.value)}
                  className="w-full bg-[#12100e] border border-amber-500/30 rounded-xl p-2.5 text-amber-100"
                />
              </div>

              <div>
                <label className="block text-neutral-300 mb-1">Current Odometer (km)</label>
                <input
                  type="number"
                  value={currentOdometer}
                  onChange={(e) => setCurrentOdometer(e.target.value)}
                  className="w-full bg-[#12100e] border border-amber-500/30 rounded-xl p-2.5 text-amber-100"
                />
              </div>

              <div>
                <label className="block text-neutral-300 mb-1">Expected Days</label>
                <input
                  type="number"
                  value={durationDays}
                  onChange={(e) => setDurationDays(e.target.value)}
                  className="w-full bg-[#12100e] border border-amber-500/30 rounded-xl p-2.5 text-amber-100"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-neutral-950 font-bold text-xs shadow-lg flex items-center justify-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" /> Save Fuel Record
            </button>
          </form>
        </div>
      )}

      {/* FUEL REFILL HISTORY TABLE */}
      <div className="space-y-3">
        <h2 className="text-base font-bold text-amber-100 font-outfit">Refill History</h2>
        <div className="space-y-3">
          {fuelEntries.map((entry) => (
            <div key={entry.id} className="p-4 rounded-2xl bg-[#1c1815] border border-amber-500/20 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-amber-100">{entry.stationName || 'Fuel Station'}</span>
                <span className="text-neutral-400 font-mono">{entry.date}</span>
              </div>

              <div className="grid grid-cols-4 gap-2 text-center p-2.5 rounded-xl bg-[#12100e] text-xs">
                <div>
                  <span className="text-[10px] text-neutral-500 block">Amount:</span>
                  <span className="font-bold text-amber-200">₹{entry.amountSpent}</span>
                </div>
                <div>
                  <span className="text-[10px] text-neutral-500 block">Distance:</span>
                  <span className="font-bold text-amber-200">{entry.distanceKm} km</span>
                </div>
                <div>
                  <span className="text-[10px] text-neutral-500 block">Mileage:</span>
                  <span className="font-bold text-orange-300">{entry.mileageKmpl} km/L</span>
                </div>
                <div>
                  <span className="text-[10px] text-neutral-500 block">Cost/km:</span>
                  <span className="font-bold text-emerald-300">₹{entry.costPerKm}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
