import React from 'react';
import { Activity, Clock, ShieldCheck } from 'lucide-react';
import { AIActivity } from '../types';

interface AIActivityLogViewProps {
  activityLogs: AIActivity[];
}

export const AIActivityLogView: React.FC<AIActivityLogViewProps> = ({ activityLogs }) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl font-black text-amber-100 font-outfit flex items-center gap-2">
          <Activity className="w-6 h-6 text-orange-400" /> AI Supervisor Activity Log
        </h1>
        <p className="text-xs text-amber-200/80">Audit trail of automated background extractions, analyses, and challenge evaluations.</p>
      </div>

      <div className="space-y-3">
        {activityLogs.map((log) => (
          <div key={log.id} className="p-4 rounded-2xl bg-[#1c1815] border border-amber-500/20 text-xs space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-orange-500/20 text-orange-300 border border-orange-500/30 uppercase">
                  {log.module}
                </span>
                <span className="font-bold text-amber-100">{log.action}</span>
              </div>
              <span className="text-[10px] text-neutral-400 font-mono">
                {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <p className="text-neutral-400">{log.details}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
