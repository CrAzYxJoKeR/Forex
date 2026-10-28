/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { SessionKillzoneTracker } from './components/SessionKillzoneTracker';
import { G8MatrixBar } from './components/G8MatrixBar';
import { TradingViewWidget } from './components/TradingViewWidget';
import { Part1DangerZones } from './components/Part1DangerZones';
import { Part2CurrencyStrength } from './components/Part2CurrencyStrength';
import { Part3PairGameplans } from './components/Part3PairGameplans';
import { Part4RiskModifier } from './components/Part4RiskModifier';
import { MacroInputModal } from './components/MacroInputModal';
import { HeadlinesBar } from './components/HeadlinesBar';
import { MacroBriefing, isInsideNoTradeWindow } from './utils/deskRules';
import { Play, Terminal, Volume2, Copy, Check, RefreshCw, FileText, Sparkles, AlertCircle } from 'lucide-react';

export default function App() {
  const [briefing, setBriefing] = useState<MacroBriefing | null>(null);
  const [rates, setRates] = useState<Record<string, number>>({ EUR: 0.92, GBP: 0.77, JPY: 152.5, CHF: 0.88, AUD: 1.51, CAD: 1.38, NZD: 1.65, USD: 1.0 });
  const [selectedPair, setSelectedPair] = useState<string>('EUR/USD');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'ALL' | 'DANGER' | 'STRENGTH' | 'GAMEPLAN' | 'RISK'>('ALL');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [commandInput, setCommandInput] = useState<string>('RUN PRE-MARKET');
  const [sourceNote, setSourceNote] = useState<string | null>(null);

  // Live CET time clock state updated every second
  const [currentCetTime, setCurrentCetTime] = useState<string>('10:30');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const timeStr = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Europe/Paris',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }).format(now);
      setCurrentCetTime(timeStr);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch live ER-API rates on load and every 30 seconds
  const fetchRates = useCallback(async () => {
    try {
      const res = await fetch('/api/rates');
      const data = await res.json();
      if (data && data.rates) {
        setRates(data.rates);
      }
    } catch (err) {
      console.warn('Live rate polling warning:', err);
    }
  }, []);

  useEffect(() => {
    fetchRates();
    const interval = setInterval(fetchRates, 30000);
    return () => clearInterval(interval);
  }, [fetchRates]);

  // Fetch / Execute Pre-Market Briefing
  const runPreMarket = useCallback(async (customPrompt?: string, forceRefresh?: boolean) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await fetch('/api/pre-market', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userPrompt: customPrompt || 'RUN PRE-MARKET',
          forceRefresh: Boolean(forceRefresh),
        }),
      });

      if (!res.ok) {
        throw new Error(`Server returned HTTP ${res.status}`);
      }

      const data = await res.json();
      if (data.success && data.briefing) {
        setBriefing(data.briefing);
        setSourceNote(data.note || null);
        if (data.briefing.marketSnapshot?.rates) {
          setRates(data.briefing.marketSnapshot.rates);
        }
      } else {
        throw new Error(data.message || 'Failed to retrieve macro briefing');
      }
    } catch (err: any) {
      console.warn('Pre-market execution warning:', err?.message || err);
      setErrorMessage('Desk server was unable to complete the query. Verify network connection and retry.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Run on initial load
  useEffect(() => {
    runPreMarket('RUN PRE-MARKET');
  }, [runPreMarket]);

  const activeBlackoutEvent = useMemo(() => {
    if (!briefing || !briefing.dangerZones?.events) return null;
    return briefing.dangerZones.events.find((ev) =>
      isInsideNoTradeWindow(currentCetTime, ev.noTradeWindowStart, ev.noTradeWindowEnd)
    );
  }, [briefing, currentCetTime]);

  const handleCopyBriefing = useCallback(() => {
    if (!briefing) return;
    const lines = [
      `=====================================================`,
      `G10 FOREX MACRO & RISK DESK BRIEFING (CET: ${currentCetTime})`,
      `=====================================================`,
      ``,
      `1. RED FOLDER DANGER ZONES:`,
      ...briefing.dangerZones.events.map(
        (e) => `• [${e.currency}] ${e.timeCet} CET: ${e.event} | Window: ${e.noTradeWindowStart} - ${e.noTradeWindowEnd} CET`
      ),
      ``,
      `2. G8 CURRENCY STRENGTH:`,
      ...Object.values(briefing.currencies).map((c) => `• ${c.currency}: Score ${c.score}/5 (${c.rating}) - ${c.rationale}`),
      ``,
      `3. SESSION GAMEPLAN (${briefing.sessionGameplan.primaryStrategy}):`,
      `• Playbook: ${briefing.sessionGameplan.executionPlaybook}`,
      ``,
      `4. RISK MODIFIER:`,
      `• RECOMMENDATION: ${briefing.riskModifier.recommendation}`,
      `• Rule: ${briefing.riskModifier.riskRuleExplanation}`,
      `=====================================================`,
    ];

    navigator.clipboard.writeText(lines.join('\n'));
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  }, [briefing, currentCetTime]);

  const handlePlaySquawk = useCallback(() => {
    if (!briefing || typeof window === 'undefined' || !window.speechSynthesis) return;

    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      return;
    }

    const script = `G10 Forex Macro Desk Squawk. Red Folder Danger Zones: ${briefing.dangerZones.events.length} high impact releases scheduled today. Session primary regime is ${briefing.sessionGameplan.primaryStrategy}. Risk modifier recommendation: ${briefing.riskModifier.recommendation}. Position size accordingly.`;

    const utterance = new SpeechSynthesisUtterance(script);
    utterance.rate = 1.05;
    utterance.pitch = 0.95;
    utterance.onend = () => setIsPlayingAudio(false);
    utterance.onerror = () => setIsPlayingAudio(false);

    setIsPlayingAudio(true);
    window.speechSynthesis.speak(utterance);
  }, [briefing, isPlayingAudio]);

  return (
    <div className="min-h-screen bg-[#05080f] text-slate-100 flex flex-col font-sans selection:bg-amber-500/30 selection:text-amber-200">
      {/* 1. Live Session & Killzone Tracker Header */}
      <SessionKillzoneTracker
        activeBlackout={Boolean(activeBlackoutEvent)}
        blackoutEventTitle={activeBlackoutEvent?.event}
      />

      {/* 2. G8 Major Pairs Matrix (Top Bar) */}
      <G8MatrixBar
        rates={rates}
        selectedPair={selectedPair}
        onSelectPair={(p) => setSelectedPair(p)}
      />

      {/* 3. Command Center & Run Pre-Market Bar */}
      <div className="bg-[#080d16] border-b border-slate-800 p-4">
        <div className="max-w-7xl mx-auto space-y-3">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (isLoading) return;
              runPreMarket(commandInput.trim(), true);
            }}
            className="flex flex-col sm:flex-row items-stretch gap-2.5"
          >
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-amber-400">
                <Terminal className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={commandInput}
                onChange={(e) => setCommandInput(e.target.value)}
                disabled={isLoading}
                placeholder="Type 'RUN PRE-MARKET' or customize your G10 query..."
                className="w-full bg-[#04060b] border border-slate-700/80 rounded-xl pl-10 pr-24 py-3 text-sm font-mono text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 transition-all uppercase tracking-wide shadow-inner"
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
                className={`px-6 py-3 rounded-xl font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg ${
                  isLoading
                    ? 'bg-amber-600/50 text-amber-200 cursor-not-allowed'
                    : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20 active:scale-[0.98]'
                }`}
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>COMPUTING G10...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" />
                    <span>RUN PRE-MARKET</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                title="Paste Raw Calendar / RSS Feed"
                className="px-3.5 py-3 rounded-xl border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-300 font-mono text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <FileText className="w-4 h-4 text-amber-400" />
                <span className="hidden sm:inline">PASTE CALENDAR</span>
              </button>

              <button
                type="button"
                onClick={handlePlaySquawk}
                title="Institutional Squawk Box Audio"
                className={`px-3.5 py-3 rounded-xl border font-mono text-xs flex items-center gap-1.5 transition-colors cursor-pointer ${
                  isPlayingAudio
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300 animate-pulse'
                    : 'bg-slate-900 border-slate-700 hover:bg-slate-800 text-slate-300'
                }`}
              >
                <Volume2 className="w-4 h-4 text-amber-400" />
                <span className="hidden sm:inline">{isPlayingAudio ? 'SQUAWKING...' : 'SQUAWK'}</span>
              </button>

              <button
                type="button"
                onClick={handleCopyBriefing}
                title="Copy Briefing"
                className="px-3.5 py-3 rounded-xl border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-300 font-mono text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {isCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span className="hidden sm:inline">{isCopied ? 'COPIED' : 'COPY'}</span>
              </button>
            </div>
          </form>

          {/* Quick Preset Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-slate-500 text-[11px] uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" />
                QUICK DESK COMMANDS:
              </span>
              {[
                'RUN PRE-MARKET',
                'FOMC RATE DECISION CHECK',
                'ECB & SNB DANGER ZONES',
                'G8 LIQUIDITY SWEEP CHECK',
              ].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => {
                    setCommandInput(preset);
                    runPreMarket(preset, true);
                  }}
                  disabled={isLoading}
                  className="px-2.5 py-1 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-amber-300 text-[11px] transition-colors cursor-pointer"
                >
                  {preset}
                </button>
              ))}
            </div>

            {briefing?.generatedAtCet && (
              <div className="text-[11px] text-slate-400 font-mono">
                Briefing Generated: <span className="text-slate-200 font-bold">{briefing.generatedAtCet} CET</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 space-y-6">
        {errorMessage && (
          <div className="p-4 rounded-xl bg-red-950/60 border border-red-500/60 text-red-200 text-xs font-mono flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Interactive TradingView Chart Widget for Selected Pair */}
        <TradingViewWidget symbol={selectedPair} />

        {/* View Filter Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3 font-mono text-xs">
          <div className="flex items-center gap-1.5 bg-[#080d16] p-1.5 rounded-xl border border-slate-800">
            {[
              { id: 'ALL', label: 'ALL 4 PARTS' },
              { id: 'DANGER', label: '1. RED FOLDER DANGER ZONES' },
              { id: 'STRENGTH', label: '2. G8 CURRENCY STRENGTH' },
              { id: 'GAMEPLAN', label: '3. SESSION GAMEPLAN' },
              { id: 'RISK', label: '4. RISK MODIFIER & SIZER' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 text-slate-400 text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>REAL-TIME G8 ER-API FEED ACTIVE</span>
          </div>
        </div>

        {/* Loading Skeleton */}
        {isLoading && !briefing && (
          <div className="p-16 text-center font-mono space-y-4">
            <RefreshCw className="w-8 h-8 text-amber-400 animate-spin mx-auto" />
            <div className="text-sm font-bold text-slate-200">FETCHING LIVE G8 ER-API RATES & RUNNING MACRO ENGINE...</div>
          </div>
        )}

        {/* 4 Briefing Parts */}
        {briefing && (
          <div className="space-y-6">
            {(activeTab === 'ALL' || activeTab === 'DANGER') && (
              <Part1DangerZones
                events={briefing.dangerZones.events}
                summary={briefing.dangerZones.summary}
                currentCetTime={currentCetTime}
              />
            )}

            {(activeTab === 'ALL' || activeTab === 'STRENGTH') && (
              <Part2CurrencyStrength
                currencies={briefing.currencies}
                rateDifferentialNotes={briefing.rateDifferentialNotes}
              />
            )}

            {(activeTab === 'ALL' || activeTab === 'GAMEPLAN') && (
              <Part3PairGameplans
                pairGameplans={briefing.pairGameplans}
                primaryStrategy={briefing.sessionGameplan.primaryStrategy}
                onSelectPairForChart={(pair) => {
                  setSelectedPair(pair);
                  window.scrollTo({ top: 150, behavior: 'smooth' });
                }}
              />
            )}

            {(activeTab === 'ALL' || activeTab === 'RISK') && (
              <Part4RiskModifier
                recommendation={briefing.riskModifier.recommendation}
                isBombDay={briefing.riskModifier.isBombDay}
                bombEventsFound={briefing.riskModifier.bombEventsFound}
                riskRuleExplanation={briefing.riskModifier.riskRuleExplanation}
                recommendedRiskPerTradePct={briefing.riskModifier.recommendedRiskPerTradePct}
                rates={rates}
                selectedPair={selectedPair}
              />
            )}

            {briefing.keyHeadlines && briefing.keyHeadlines.length > 0 && (
              <HeadlinesBar headlines={briefing.keyHeadlines} />
            )}
          </div>
        )}
      </main>

      {/* Paste Calendar Modal */}
      <MacroInputModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmitPrompt={(promptText) => {
          setCommandInput(promptText);
          runPreMarket(promptText, true);
        }}
      />

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-[#04060b] py-4 text-center font-mono text-[11px] text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>G10 FOREX MACRO & RISK DESK • LIVE ER-API G8 SPOT FEED • TRADINGVIEW EMBEDDED</div>
          <div className="text-slate-400">Institutional Execution & Risk Discipline • EUR/USD, GBP/USD, USD/JPY & G10</div>
        </div>
      </footer>
    </div>
  );
}
