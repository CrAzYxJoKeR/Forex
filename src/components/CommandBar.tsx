import React, { useState, useEffect } from 'react';
import { Play, Terminal, Volume2, Copy, Check, RefreshCw, Sparkles } from 'lucide-react';

interface CommandBarProps {
  onRunPreMarket: (customPrompt?: string, forceRefresh?: boolean) => void;
  isLoading: boolean;
  onPlaySquawk: () => void;
  isPlayingAudio: boolean;
  onCopyBriefing: () => void;
  isCopied: boolean;
  lastRunTime?: string;
  sourceNote?: string | null;
  isRateLimited?: boolean;
}

export const CommandBar: React.FC<CommandBarProps> = ({
  onRunPreMarket,
  isLoading,
  onPlaySquawk,
  isPlayingAudio,
  onCopyBriefing,
  isCopied,
  lastRunTime,
  sourceNote,
  isRateLimited,
}) => {
  const [commandInput, setCommandInput] = useState<string>('RUN PRE-MARKET');
  const [loadingStep, setLoadingStep] = useState<string>('');

  useEffect(() => {
    if (!isLoading) {
      setLoadingStep('');
      return;
    }

    const steps = [
      'Connecting to Institutional Macro Desk engine...',
      'Searching live web: ForexFactory & Investing.com calendar...',
      'Querying Federal Reserve (Fed) & ECB recent rate headlines...',
      'Analyzing US 10Y Treasury vs German 10Y Bund yield spreads...',
      'Computing exact CET Red Folder No-Trade Windows (±30 mins)...',
      'Determining Directional Bias, Session Gameplan & Risk Modifier...',
    ];

    let current = 0;
    setLoadingStep(steps[0]);
    const interval = setInterval(() => {
      current = (current + 1) % steps.length;
      setLoadingStep(steps[current]);
    }, 1800);

    return () => clearInterval(interval);
  }, [isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    onRunPreMarket(commandInput.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      onRunPreMarket(commandInput.trim());
    }
  };

  return (
    <div className="bg-[#0f1420] border-b border-slate-800 p-4">
      <div className="max-w-7xl mx-auto space-y-3">
        {/* Main Command Input Box & Run Button */}
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-stretch gap-2.5">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-amber-400">
              <Terminal className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={commandInput}
              onChange={(e) => setCommandInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              placeholder="Type 'RUN PRE-MARKET' or customize your desk query..."
              className="w-full bg-[#080b11] border border-slate-700/80 rounded-lg pl-10 pr-24 py-2.5 text-sm font-mono text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 transition-all uppercase tracking-wide"
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <kbd className="hidden md:inline-block text-[10px] font-mono bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded border border-slate-700">
                ⌘ + ↵
              </kbd>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="submit"
              disabled={isLoading}
              className={`px-5 py-2.5 rounded-lg font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
                isLoading
                  ? 'bg-amber-600/50 text-amber-200 cursor-not-allowed'
                  : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/20 active:scale-[0.98]'
              }`}
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>ANALYZING DESK...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>RUN PRE-MARKET</span>
                </>
              )}
            </button>

            {/* Squawk Box Audio Readout */}
            <button
              type="button"
              onClick={onPlaySquawk}
              title="Listen to Institutional Desk Squawk Box"
              className={`px-3 py-2.5 rounded-lg border font-mono text-xs flex items-center gap-1.5 transition-colors cursor-pointer ${
                isPlayingAudio
                  ? 'bg-amber-500/20 border-amber-500 text-amber-300 animate-pulse'
                  : 'bg-slate-900 border-slate-700 hover:bg-slate-800 text-slate-300'
              }`}
            >
              <Volume2 className="w-4 h-4" />
              <span className="hidden sm:inline">
                {isPlayingAudio ? 'SQUAWKING...' : 'DESK SQUAWK'}
              </span>
            </button>

            {/* Copy Full 4-Part Briefing */}
            <button
              type="button"
              onClick={onCopyBriefing}
              title="Copy 4-Part Briefing to Clipboard"
              className="px-3 py-2.5 rounded-lg border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-300 font-mono text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {isCopied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400 hidden sm:inline">COPIED</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span className="hidden sm:inline">COPY</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Quick Institutional Action Presets */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-slate-500 text-[11px] uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" />
              QUICK COMMANDS:
            </span>
            {[
              'RUN PRE-MARKET',
              'RUN FOMC RISK CHECK',
              'CHECK ECB RATE DIFFERENTIAL',
              'GBP/USD LIQUIDITY SWEEP CHECK',
            ].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => {
                  setCommandInput(preset);
                  onRunPreMarket(preset);
                }}
                disabled={isLoading}
                className="px-2.5 py-1 rounded bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-amber-300 text-[11px] transition-colors cursor-pointer"
              >
                {preset}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {isRateLimited && (
              <span className="px-2 py-0.5 rounded bg-blue-950/80 border border-blue-500/40 text-blue-300 text-[10px] font-bold uppercase tracking-wider">
                DESK MODEL (429 SAFEGUARD)
              </span>
            )}
            {lastRunTime && (
              <div className="text-[11px] text-slate-400 font-mono">
                Last Briefing: <span className="text-slate-200 font-bold">{lastRunTime} CET</span>
              </div>
            )}
          </div>
        </div>

        {/* Real-time scanning progress banner when loading */}
        {isLoading && (
          <div className="p-3 rounded-lg bg-amber-950/30 border border-amber-500/30 flex items-center gap-3 text-xs font-mono text-amber-200">
            <RefreshCw className="w-4 h-4 animate-spin text-amber-400 flex-shrink-0" />
            <div className="flex-1">
              <div className="font-bold flex items-center justify-between">
                <span>INSTITUTIONAL MACRO ENGINE EXECUTING LIVE SEARCH</span>
                <span className="text-amber-400/80 text-[10px] animate-pulse">SEARCHING WEB</span>
              </div>
              <div className="text-slate-300 text-[11px] mt-0.5">{loadingStep}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
