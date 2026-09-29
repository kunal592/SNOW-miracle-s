import React, { useState } from 'react';
import { Download, CheckSquare, FileSpreadsheet, FileCode, FileText, CheckCircle2 } from 'lucide-react';

interface ExportCenterViewProps {
  onShowToast: (msg: string, type?: 'success' | 'info') => void;
}

export const ExportCenterView: React.FC<ExportCenterViewProps> = ({ onShowToast }) => {
  const [selectedModules, setSelectedModules] = useState<string[]>([
    'Finance',
    'Food',
    'Time',
    'Learning',
    'Health',
    'Goals',
    'Journal',
    'Inbox'
  ]);
  const [startDate, setStartDate] = useState('2026-09-01');
  const [endDate, setEndDate] = useState('2026-09-29');
  const [format, setFormat] = useState<'PDF' | 'XLSX' | 'CSV' | 'JSON'>('JSON');
  const [isExporting, setIsExporting] = useState(false);

  const modulesList = [
    'Everything',
    'Finance',
    'Consumption',
    'Food',
    'Time',
    'Learning',
    'Health',
    'Goals',
    'Milestones',
    'Journal',
    'Inbox'
  ];

  const toggleModule = (mod: string) => {
    if (mod === 'Everything') {
      if (selectedModules.length === modulesList.length - 1) {
        setSelectedModules([]);
      } else {
        setSelectedModules(modulesList.filter((m) => m !== 'Everything'));
      }
      return;
    }
    if (selectedModules.includes(mod)) {
      setSelectedModules(selectedModules.filter((m) => m !== mod));
    } else {
      setSelectedModules([...selectedModules, mod]);
    }
  };

  const handleExport = () => {
    if (selectedModules.length === 0) {
      onShowToast('Please select at least one module to export', 'info');
      return;
    }

    setIsExporting(true);
    onShowToast(`Packaging ${selectedModules.length} modules into ${format}...`, 'info');

    setTimeout(() => {
      setIsExporting(false);
      onShowToast(`🎉 Export package ready! Downloaded snow_export_${format.toLowerCase()}_20260929.${format.toLowerCase()}`, 'success');
    }, 1500);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl font-black text-amber-100 font-outfit flex items-center gap-2">
          <Download className="w-6 h-6 text-amber-400" /> Export Data Center
        </h1>
        <p className="text-xs text-amber-200/80">Export complete raw structured datasets for backup or custom external analytics.</p>
      </div>

      <div className="p-6 rounded-3xl bg-[#1c1815] border border-amber-500/20 shadow-xl space-y-6">
        {/* MODULE SELECTION CHECKBOXES */}
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-amber-100 uppercase tracking-wider">Select Modules to Include</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {modulesList.map((mod) => {
              const isChecked = mod === 'Everything' ? selectedModules.length === modulesList.length - 1 : selectedModules.includes(mod);

              return (
                <button
                  key={mod}
                  type="button"
                  onClick={() => toggleModule(mod)}
                  className={`p-3 rounded-2xl border text-xs font-semibold flex items-center gap-2.5 transition text-left ${
                    isChecked
                      ? 'bg-amber-500/20 border-amber-500/50 text-amber-200 shadow-md shadow-amber-950/30'
                      : 'bg-[#12100e] border-amber-500/15 text-neutral-400 hover:border-amber-500/30'
                  }`}
                >
                  <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                    isChecked ? 'bg-amber-500 border-amber-500 text-neutral-950' : 'border-neutral-600'
                  }`}>
                    {isChecked && <CheckCircle2 className="w-3.5 h-3.5" />}
                  </div>
                  <span>{mod}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* DATE RANGE & FORMAT SELECTOR */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-amber-500/15 text-xs">
          <div>
            <label className="block text-neutral-300 mb-1 font-semibold">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full bg-[#12100e] border border-amber-500/30 rounded-xl p-2.5 text-amber-100"
            />
          </div>

          <div>
            <label className="block text-neutral-300 mb-1 font-semibold">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full bg-[#12100e] border border-amber-500/30 rounded-xl p-2.5 text-amber-100"
            />
          </div>

          <div>
            <label className="block text-neutral-300 mb-1 font-semibold">Format</label>
            <div className="grid grid-cols-4 gap-1.5 p-1 bg-[#12100e] rounded-xl border border-amber-500/30">
              {(['PDF', 'XLSX', 'CSV', 'JSON'] as const).map((fmt) => (
                <button
                  key={fmt}
                  type="button"
                  onClick={() => setFormat(fmt)}
                  className={`py-1.5 rounded-lg text-xs font-bold transition ${
                    format === fmt ? 'bg-amber-500 text-neutral-950 shadow' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  {fmt}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* EXPORT ACTION BUTTON */}
        <button
          disabled={isExporting}
          onClick={handleExport}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-600 to-amber-600 text-neutral-950 font-extrabold text-sm shadow-xl shadow-amber-950/60 flex items-center justify-center gap-2 transition active:scale-98"
        >
          {isExporting ? (
            <>
              <div className="w-4 h-4 border-2 border-neutral-950 border-t-transparent rounded-full animate-spin" />
              <span>Packaging Dataset...</span>
            </>
          ) : (
            <>
              <Download className="w-4 h-4 stroke-[2.5]" /> Export {selectedModules.length} Modules ({format})
            </>
          )}
        </button>
      </div>
    </div>
  );
};
