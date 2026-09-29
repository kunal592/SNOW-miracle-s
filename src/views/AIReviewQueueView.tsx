import React, { useState } from 'react';
import { Sparkles, CheckCircle2, XCircle, Edit3, CheckCheck, Info, Tag } from 'lucide-react';
import { InboxEntry, CategoryType } from '../types';

interface AIReviewQueueViewProps {
  inbox: InboxEntry[];
  onApprove: (id: string) => void;
  onApproveAll: () => void;
  onReject: (id: string) => void;
}

export const AIReviewQueueView: React.FC<AIReviewQueueViewProps> = ({
  inbox,
  onApprove,
  onApproveAll,
  onReject
}) => {
  const pendingItems = inbox.filter((i) => i.status === 'Needs Review' || i.status === 'Raw');

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Banner */}
      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-xs text-amber-200">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-amber-400 shrink-0" />
          <span>AI suggestions are simulated using rule-based parsing in this frontend prototype.</span>
        </div>
        {pendingItems.length > 0 && (
          <button
            onClick={onApproveAll}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-neutral-950 font-bold flex items-center gap-1 transition shrink-0"
          >
            <CheckCheck className="w-4 h-4" /> Approve All ({pendingItems.length})
          </button>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-amber-100 font-outfit">AI Review Queue</h1>
          <p className="text-xs text-amber-200/80">Confirm or adjust extracted records before committing to system totals.</p>
        </div>
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
          {pendingItems.length} Pending
        </span>
      </div>

      <div className="space-y-3">
        {pendingItems.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-[#1c1815] border border-amber-500/15 text-neutral-400 text-sm space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
            <div className="font-bold text-amber-100">Review Queue is Clean</div>
            <div>All inbox entries have been verified and processed.</div>
          </div>
        ) : (
          pendingItems.map((item) => {
            const ext = item.aiExtraction;

            return (
              <div
                key={item.id}
                className="p-5 rounded-2xl bg-[#1c1815] border border-amber-500/25 shadow-md space-y-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-[11px] text-neutral-400 font-mono">RAW INPUT:</div>
                    <div className="text-base font-bold text-amber-100 font-outfit">"{item.rawText}"</div>
                  </div>
                  {ext && (
                    <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/40">
                      {ext.confidenceScore}% Confidence
                    </span>
                  )}
                </div>

                {ext && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3.5 rounded-xl bg-[#12100e] border border-amber-500/15 text-xs">
                    <div>
                      <span className="text-neutral-400">Category:</span>
                      <div className="font-bold text-amber-300 mt-0.5">{ext.extractedCategory}</div>
                    </div>

                    <div>
                      <span className="text-neutral-400">Type & Allocation:</span>
                      <div className="font-bold text-orange-300 mt-0.5">
                        {ext.isConsumption ? `Consumption (₹${ext.dailyAllocationCost}/day)` : 'One-time Outflow'}
                      </div>
                    </div>

                    <div>
                      <span className="text-neutral-400">Suggested Action:</span>
                      <div className="font-bold text-emerald-300 mt-0.5">{ext.suggestedAction}</div>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => onReject(item.id)}
                    className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-rose-950 text-neutral-300 hover:text-rose-200 text-xs font-semibold flex items-center gap-1 transition"
                  >
                    <XCircle className="w-3.5 h-3.5" /> Reject
                  </button>
                  <button
                    onClick={() => onApprove(item.id)}
                    className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-neutral-950 text-xs font-bold flex items-center gap-1 transition shadow"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> Confirm & Approve
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
