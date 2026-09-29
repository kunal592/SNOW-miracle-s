import React, { useState } from 'react';
import { FileText, Download, Eye, Sparkles, CheckCircle2 } from 'lucide-react';
import { Report } from '../types';

interface ReportsViewProps {
  onShowToast: (msg: string, type?: 'success' | 'info') => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({ onShowToast }) => {
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  const reportsList: Report[] = [
    {
      id: 'rep_1',
      title: 'Daily Protocol Execution Report',
      type: 'Daily',
      generatedDate: '2026-09-29',
      periodLabel: 'Day 1 of Winter Arc',
      summaryHighlights: [
        'Deep Work: 3h 40m completed across 2 main focus sprints.',
        'Cash Outflow: ₹380, Consumption Allocation: ₹347/day.',
        'Zero unreviewed items remaining in Universal Inbox.'
      ],
      metrics: { DayScore: '78/100', Sleep: '7.1h', Water: '2.8L', Workout: 'Completed' }
    },
    {
      id: 'rep_2',
      title: 'Weekly Performance Audit',
      type: 'Weekly',
      generatedDate: '2026-09-28',
      periodLabel: 'Sep 22 – Sep 28',
      summaryHighlights: [
        'Total Deep Work: 24h 15m (92% of target).',
        'Fuel Mileage: Averaged 31.2 km/L across 2 refills.',
        'Completed 30-Hour Python milestone.'
      ],
      metrics: { WeeklyDeepWork: '24.2h', TotalCashSpent: '₹3,420', HabitScore: '89%' }
    },
    {
      id: 'rep_3',
      title: 'Monthly Financial Audit',
      type: 'Monthly',
      generatedDate: '2026-09-01',
      periodLabel: 'August 2026',
      summaryHighlights: [
        'Cash outflow vs consumption variance: +₹1,310.',
        'Saved ₹5,000 into liquid emergency reserve.'
      ],
      metrics: { CashOutflow: '₹14,200', ConsumptionCost: '₹12,890', SavingsRate: '28%' }
    },
    {
      id: 'rep_4',
      title: 'Winter Arc Macro Report',
      type: 'Winter Arc',
      generatedDate: '2026-09-29',
      periodLabel: 'Day 1 to Day 90',
      summaryHighlights: [
        'Initialized SNOW OS protocol baseline.',
        'Targeting 100 hours AI Engineering and ₹100k emergency fund.'
      ],
      metrics: { GoalProgress: '18%', AdherenceRate: '95%' }
    }
  ];

  const handleExportPDF = (title: string) => {
    onShowToast(`Generating PDF report for ${title}...`, 'info');
    setTimeout(() => {
      onShowToast(`📄 ${title} PDF generated and ready!`, 'success');
    }, 1200);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl font-black text-amber-100 font-outfit flex items-center gap-2">
          <FileText className="w-6 h-6 text-amber-400" /> Automated Reports Generator
        </h1>
        <p className="text-xs text-amber-200/80">Synthesize multi-source life data into executive PDF/Markdown summaries.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reportsList.map((rep) => (
          <div key={rep.id} className="p-5 rounded-3xl bg-[#1c1815] border border-amber-500/20 shadow-md space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase">
                  {rep.type} Report
                </span>
                <h2 className="text-base font-bold text-amber-100 font-outfit mt-1">{rep.title}</h2>
                <div className="text-[10px] text-neutral-400">{rep.periodLabel} • Generated {rep.generatedDate}</div>
              </div>
            </div>

            <div className="space-y-1.5 text-xs text-neutral-300 bg-[#12100e] p-3 rounded-2xl border border-amber-500/15">
              <div className="text-[10px] font-bold text-neutral-400 uppercase">Key Highlights:</div>
              {rep.summaryHighlights.map((hl, idx) => (
                <div key={idx} className="flex items-start gap-1.5 text-[11px]">
                  <span className="text-amber-400 font-bold">•</span>
                  <span>{hl}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 justify-end pt-1">
              <button
                onClick={() => setSelectedReport(rep)}
                className="px-3.5 py-1.5 rounded-xl bg-[#26201b] hover:bg-[#332a24] border border-amber-500/20 text-amber-200 text-xs font-semibold flex items-center gap-1 transition"
              >
                <Eye className="w-3.5 h-3.5" /> View Details
              </button>
              <button
                onClick={() => handleExportPDF(rep.title)}
                className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-neutral-950 text-xs font-bold flex items-center gap-1 transition shadow"
              >
                <Download className="w-3.5 h-3.5" /> Export PDF
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* VIEW MODAL */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-[#1c1815] border border-amber-500/30 rounded-3xl p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-amber-500/20 pb-3">
              <h3 className="font-bold text-amber-100 font-outfit text-lg">{selectedReport.title}</h3>
              <button onClick={() => setSelectedReport(null)} className="text-neutral-400 text-xs">Close</button>
            </div>
            <div className="space-y-2 text-xs text-amber-200">
              <div className="font-bold text-amber-400">Metrics Breakdown:</div>
              <pre className="bg-[#12100e] p-3 rounded-xl border border-amber-500/20 text-[11px] font-mono">
                {JSON.stringify(selectedReport.metrics, null, 2)}
              </pre>
            </div>
            <button
              onClick={() => {
                handleExportPDF(selectedReport.title);
                setSelectedReport(null);
              }}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-neutral-950 font-bold text-xs"
            >
              Export Full PDF Report
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
