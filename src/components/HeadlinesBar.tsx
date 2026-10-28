import React from 'react';
import { Newspaper, ExternalLink } from 'lucide-react';

interface Headline {
  headline: string;
  source: string;
  impact: string;
}

interface HeadlinesBarProps {
  headlines: Headline[];
}

export const HeadlinesBar: React.FC<HeadlinesBarProps> = ({ headlines }) => {
  if (!headlines || headlines.length === 0) return null;

  return (
    <div className="bg-[#0a0e17] border border-slate-800 rounded-xl p-4 font-mono">
      <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
        <Newspaper className="w-4 h-4 text-amber-400" />
        <span>CENTRAL BANK & MACRO HEADLINES (FED, ECB, BOE)</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {headlines.map((item, idx) => (
          <div
            key={idx}
            className="p-3 rounded-lg bg-slate-900/50 border border-slate-800/80 hover:border-slate-700 transition-colors flex flex-col justify-between"
          >
            <p className="text-xs text-slate-200 leading-snug font-medium mb-2">
              "{item.headline}"
            </p>
            <div className="flex items-center justify-between text-[10px] text-slate-400 pt-2 border-t border-slate-800/60">
              <span className="text-amber-400/90 font-semibold">{item.source}</span>
              <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                {item.impact}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
