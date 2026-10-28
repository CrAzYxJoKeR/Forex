import React, { useState } from 'react';
import { Terminal, Play, Volume2, FileText, Copy, Check, RefreshCw, Sparkles, Filter } from 'lucide-react';

interface CommandFilterBarProps {
  onRunPreMarket: (prompt?: string) => void;
  isLoading: boolean;
  onOpenPasteModal: () => void;
  onPlaySquawk: () => void;
  isPlayingAudio: boolean;
  onCopyBriefing: () => void;
  isCopied: boolean;
  activeAssetFilter: string;
  onSelectAssetFilter: (filter: string) => void;
  lastBriefingTime?: string;
  isGrounded?: boolean;
}

export const CommandFilterBar: React.FC<CommandFilterBarProps> = ({
  onRunPreMarket,
  isLoading,
  onOpenPasteModal,
  onPlaySquawk,
  isPlayingAudio,
  onCopyBriefing,
  isCopied,
  activeAssetFilter,
  onSelectAssetFilter,
  lastBriefingTime,
  isGrounded,
}) => {
  const [inputVal, setInputVal] = useState('RUN PRE-MARKET');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    onRunPreMarket(inputVal.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      onRunPreMarket(inputVal.trim());
    }
  };

  const filterTabs = [
    { id: 'ALL', label: 'ALL ASSETS' },
    { id: 'CRYPTO', label: 'CRYPTO (BINANCE)' },
    { id: 'FOREX', label: 'G10 FOREX' },
    { id: 'COMMODITIES', label: 'GOLD & OIL' },
    { id: 'INDICES', label: 'INDICES (NAS/SPX)' },
    { id: 'STOCKS', label: 'MEGA-CAP STOCKS' },
  ];

  return (
    <div className="bg-[#070b14] border-b border-slate-800/90 p-3 space-y-2.5 font-mono">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5">
        {/* Command Form */}
        <form onSubmit={handleSubmit} className="flex items-center gap-2 flex-1">
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-amber-400">
              <Terminal className="w-3.5 h-3.5" />
            </span>
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              placeholder="Type 'RUN PRE-MARKET' or custom query..."
              className="w-full bg-[#04060c] border border-slate-700/80 rounded-xl pl-9 pr-14 py-2 text-xs font-mono text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 uppercase tracking-wide"
            />
            <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none">
              <kbd className="hidden sm:inline-block text-[9px] bg-slate-800 text-slate-400 px-1 py-0.5 rounded border border-slate-700">
                ⌘+↵
              </kbd>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5">
            <button
              type="submit"
              disabled={isLoading}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer shadow-md ${
                isLoading
                  ? 'bg-amber-600/50 text-amber-200 cursor-not-allowed'
                  : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20 active:scale-[0.98]'
              }`}
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span className="hidden sm:inline">GROUNDING...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span className="hidden sm:inline">RUN PRE-MARKET</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onOpenPasteModal}
              title="Paste Economic Calendar / RSS"
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-slate-700 cursor-pointer text-xs flex items-center gap-1"
            >
              <FileText className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden lg:inline text-[11px]">PASTE CALENDAR</span>
            </button>

            <button
              type="button"
              onClick={onPlaySquawk}
              title="Desk Audio Squawk"
              className={`p-2 rounded-xl border text-xs flex items-center gap-1 cursor-pointer transition-colors ${
                isPlayingAudio
                  ? 'bg-amber-500/20 border-amber-500 text-amber-300 animate-pulse'
                  : 'bg-slate-900 border-slate-800 hover:bg-slate-800 text-slate-300'
              }`}
            >
              <Volume2 className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden lg:inline text-[11px]">{isPlayingAudio ? 'STOP' : 'SQUAWK'}</span>
            </button>

            <button
              type="button"
              onClick={onCopyBriefing}
              title="Copy 4-Part Briefing"
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-slate-700 cursor-pointer text-xs flex items-center gap-1"
            >
              {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="hidden lg:inline text-[11px]">{isCopied ? 'COPIED' : 'COPY'}</span>
            </button>
          </div>
        </form>

        {/* Status / Timestamp */}
        <div className="flex items-center gap-2 text-[10px] text-slate-400 justify-end">
          {isGrounded ? (
            <span className="px-2 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block" />
              GEMINI SEARCH GROUNDED
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-full bg-amber-950/60 border border-amber-500/40 text-amber-300 font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />
              DESK MODEL (LIVE WS & SPOT)
            </span>
          )}
          {lastBriefingTime && (
            <span className="text-slate-300">
              Briefing: <strong className="text-amber-300">{lastBriefingTime} CET</strong>
            </span>
          )}
        </div>
      </div>

      {/* 5 Asset Class Quick Filter Pills */}
      <div className="max-w-7xl mx-auto flex items-center gap-1.5 overflow-x-auto scrollbar-none pt-1">
        <div className="flex items-center gap-1 text-[10px] text-slate-500 pr-1.5 border-r border-slate-800 uppercase font-bold">
          <Filter className="w-3 h-3 text-amber-400" />
          <span>FILTER:</span>
        </div>
        {filterTabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onSelectAssetFilter(tab.id)}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-wider transition-all cursor-pointer whitespace-nowrap ${
              activeAssetFilter === tab.id
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'bg-slate-900/70 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
};
