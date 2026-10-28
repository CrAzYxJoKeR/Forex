import React from 'react';
import { ExternalLink, CheckCircle2, Globe } from 'lucide-react';

interface GroundingSourcesBarProps {
  sources: { title: string; url: string }[];
}

export const GroundingSourcesBar: React.FC<GroundingSourcesBarProps> = ({ sources }) => {
  if (!sources || sources.length === 0) return null;

  return (
    <div className="bg-[#060912] border border-slate-800 rounded-2xl p-4 font-mono text-xs">
      <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2 text-slate-300 font-bold">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>VERIFIED LIVE WEB SOURCES (GOOGLE SEARCH GROUNDED)</span>
        </div>
        <div className="text-[10px] text-slate-500 uppercase">
          Zero Simulation • Live Calendar Data
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {sources.map((s, idx) => (
          <a
            key={idx}
            href={s.url}
            target="_blank"
            rel="noreferrer"
            className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-amber-300 transition-colors flex items-center gap-1.5 text-[11px] group cursor-pointer"
          >
            <Globe className="w-3 h-3 text-slate-500 group-hover:text-amber-400" />
            <span className="truncate max-w-[240px]">{s.title}</span>
            <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-slate-300 flex-shrink-0" />
          </a>
        ))}
      </div>
    </div>
  );
};
