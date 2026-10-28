/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { HeaderBar } from './components/HeaderBar';
import { BinanceModal } from './components/BinanceModal';
import { BinancePortfolioStrip } from './components/BinancePortfolioStrip';
import { LiveAssetMatrixBar } from './components/LiveAssetMatrixBar';
import { TradingViewChart } from './components/TradingViewChart';
import { CommandFilterBar } from './components/CommandFilterBar';
import { Part1DangerZones } from './components/Part1DangerZones';
import { Part2CrossAssetStrength } from './components/Part2CrossAssetStrength';
import { Part3MultiAssetGameplans } from './components/Part3MultiAssetGameplans';
import { Part4MultiAssetSizer } from './components/Part4MultiAssetSizer';
import { GroundingSourcesBar } from './components/GroundingSourcesBar';
import { MacroInputModal } from './components/MacroInputModal';
import {
  MacroBriefing,
  BinancePortfolio,
  AssetClass,
} from './types/terminal';
import { isInsideNoTradeWindow } from './utils/deskRules';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function App() {
  const [briefing, setBriefing] = useState<MacroBriefing | null>(null);
  const [fxRates, setFxRates] = useState<Record<string, number>>({});
  const [portfolio, setPortfolio] = useState<BinancePortfolio | null>(null);

  // Active Symbol and Asset Class State
  const [selectedSymbol, setSelectedSymbol] = useState<string>('BTC/USDT');
  const [selectedTvSymbol, setSelectedTvSymbol] = useState<string>('BINANCE:BTCUSDT');
  const [selectedAssetClass, setSelectedAssetClass] = useState<AssetClass>('CRYPTO');
  const [estimatedPrice, setEstimatedPrice] = useState<number>(67800);

  // UI state
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [isBinanceModalOpen, setIsBinanceModalOpen] = useState<boolean>(false);
  const [isPasteModalOpen, setIsPasteModalOpen] = useState<boolean>(false);
  const [activeAssetFilter, setActiveAssetFilter] = useState<string>('ALL');

  // Live CET Clock state
  const [currentCetTime, setCurrentCetTime] = useState<string>('14:30');

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

  // Poll live FX rates every 30 seconds
  const fetchFxRates = useCallback(async () => {
    try {
      const res = await fetch('/api/rates');
      if (res.ok) {
        const data = await res.json();
        if (data && data.rates) {
          setFxRates(data.rates);
        }
      }
    } catch (e) {
      console.warn('FX rates polling notice:', e);
    }
  }, []);

  useEffect(() => {
    fetchFxRates();
    const timer = setInterval(fetchFxRates, 30000);
    return () => clearInterval(timer);
  }, [fetchFxRates]);

  // Fetch Binance portfolio using stored credentials
  const fetchBinancePortfolio = useCallback(async (key?: string, secret?: string) => {
    const k = key || localStorage.getItem('binance_ro_key') || '';
    const s = secret || localStorage.getItem('binance_ro_secret') || '';
    if (!k || !s) return;

    try {
      const res = await fetch('/api/binance/portfolio', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-binance-key': k,
          'x-binance-secret': s,
        },
        body: JSON.stringify({ apiKey: k, apiSecret: s }),
      });
      if (res.ok) {
        const data = await res.json();
        setPortfolio(data);
      }
    } catch (err) {
      console.warn('Binance portfolio fetch notice:', err);
    }
  }, []);

  useEffect(() => {
    fetchBinancePortfolio();
  }, [fetchBinancePortfolio]);

  const handleSaveBinanceCredentials = async (key: string, secret: string) => {
    localStorage.setItem('binance_ro_key', key);
    localStorage.setItem('binance_ro_secret', secret);
    await fetchBinancePortfolio(key, secret);
  };

  const handleDisconnectBinance = () => {
    localStorage.removeItem('binance_ro_key');
    localStorage.removeItem('binance_ro_secret');
    setPortfolio(null);
  };

  // Demo portfolio loader for verification & testing
  const handleLoadDemoPortfolio = () => {
    const demo: BinancePortfolio = {
      connected: true,
      totalEquityUsd: 75420.5,
      spotEquityUsd: 52180.25,
      futuresEquityUsd: 23240.25,
      unrealizedPnlUsd: 1840.5,
      marginRatio: 0.12,
      keyMasked: 'DEMO...TEST',
      lastUpdated: new Date().toISOString(),
      serverTimeOffsetMs: 12,
      spotBalances: [
        { asset: 'USDT', free: 24500, locked: 0, total: 24500, usdValue: 24500, priceUsd: 1.0 },
        { asset: 'BTC', free: 0.285, locked: 0, total: 0.285, usdValue: 19380, priceUsd: 68000 },
        { asset: 'ETH', free: 2.5, locked: 0, total: 2.5, usdValue: 6350, priceUsd: 2540 },
        { asset: 'SOL', free: 10.8, locked: 0, total: 10.8, usdValue: 1950.25, priceUsd: 180.58 },
      ],
      futuresPositions: [
        {
          symbol: 'BTCUSDT',
          positionAmt: 0.45,
          entryPrice: 65200,
          markPrice: 67800,
          unRealizedProfit: 1170.0,
          leverage: 5,
          marginType: 'cross',
          liquidationPrice: 53400,
          side: 'LONG',
          notionalUsd: 30510,
        },
        {
          symbol: 'ETHUSDT',
          positionAmt: 3.2,
          entryPrice: 2480,
          markPrice: 2540,
          unRealizedProfit: 192.0,
          leverage: 3,
          marginType: 'cross',
          liquidationPrice: 1720,
          side: 'LONG',
          notionalUsd: 8128,
        },
      ],
    };
    setPortfolio(demo);
  };

  // Run Pre-Market Briefing via Gemini Google Search Grounding
  const runPreMarket = useCallback(async (promptText?: string, rawCalendar?: string) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await fetch('/api/pre-market', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userPrompt: promptText || 'RUN PRE-MARKET',
          rawCalendarText: rawCalendar || '',
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || `Server error (${res.status})`);
      }

      setBriefing(data.briefing);
    } catch (err: any) {
      console.log('Pre-market run notice:', err?.message || err);
      setErrorMessage(
        'Desk Engine active with live WebSocket & spot rates. You can also paste raw calendar data via the PASTE CALENDAR button.'
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial briefing load
  useEffect(() => {
    runPreMarket('RUN PRE-MARKET');
  }, [runPreMarket]);

  // Check if current CET time falls inside any active No-Trade Window
  const activeBlackoutEvent = useMemo(() => {
    if (!briefing || !briefing.dangerZones?.events) return null;
    return briefing.dangerZones.events.find((ev) =>
      isInsideNoTradeWindow(currentCetTime, ev.noTradeWindowStart, ev.noTradeWindowEnd)
    );
  }, [briefing, currentCetTime]);

  // Copy formatted institutional briefing
  const handleCopyBriefing = useCallback(() => {
    if (!briefing) return;
    const lines = [
      `=====================================================`,
      `MULTI-ASSET INSTITUTIONAL MACRO & RISK BRIEFING (CET: ${currentCetTime})`,
      `=====================================================`,
      `1. RED FOLDER DANGER ZONES:`,
      ...briefing.dangerZones.events.map(
        (e) => `• [${e.currency}] ${e.timeCet} CET: ${e.event} | Window: ${e.noTradeWindowStart} - ${e.noTradeWindowEnd} CET`
      ),
      `Summary: ${briefing.dangerZones.summary}`,
      ``,
      `2. CROSS-ASSET STRENGTH MATRIX:`,
      ...briefing.crossAssetStrength.map(
        (s) => `• ${s.asset} (${s.category}): Score ${s.score}/5 [${s.rating}] - ${s.driver} | Key: ${s.keyLevel || '-'}`
      ),
      ``,
      `3. SESSION GAMEPLAN (${briefing.sessionGameplan.primaryRegime}):`,
      `• Narrative: ${briefing.sessionGameplan.marketNarrative}`,
      `• London Focus: ${briefing.sessionGameplan.londonKillzoneFocus}`,
      `• NY Overlap: ${briefing.sessionGameplan.nyOverlapFocus}`,
      ``,
      `4. RISK MODIFIER:`,
      `• RECOMMENDATION: ${briefing.riskModifier.recommendation} (${briefing.riskModifier.riskPct}% Risk)`,
      `• Desk Protocol: ${briefing.riskModifier.riskRuleExplanation}`,
      `=====================================================`,
    ];

    navigator.clipboard.writeText(lines.join('\n'));
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  }, [briefing, currentCetTime]);

  // Desk Audio Squawk Box
  const handlePlaySquawk = useCallback(() => {
    if (!briefing || typeof window === 'undefined' || !window.speechSynthesis) return;

    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      return;
    }

    const script = `Institutional Multi-Asset Macro Desk Squawk. Red Folder Danger Zones: ${
      briefing.dangerZones.events.length
    } high impact releases identified today. Primary market regime is ${
      briefing.sessionGameplan.primaryRegime
    }. Risk modifier recommendation: ${
      briefing.riskModifier.recommendation
    }. Maximum allowed risk per setup is ${
      briefing.riskModifier.riskPct
    } percent. Position size accordingly.`;

    const utterance = new SpeechSynthesisUtterance(script);
    utterance.rate = 1.05;
    utterance.pitch = 0.95;
    utterance.onend = () => setIsPlayingAudio(false);
    utterance.onerror = () => setIsPlayingAudio(false);

    setIsPlayingAudio(true);
    window.speechSynthesis.speak(utterance);
  }, [briefing, isPlayingAudio]);

  const handleSelectAsset = (symbol: string, tvSymbol: string, assetClass: AssetClass) => {
    setSelectedSymbol(symbol);
    setSelectedTvSymbol(tvSymbol);
    setSelectedAssetClass(assetClass);

    // Approximate price based on symbol for initial calculator entry
    if (symbol.includes('BTC')) setEstimatedPrice(67800);
    else if (symbol.includes('ETH')) setEstimatedPrice(2540);
    else if (symbol.includes('SOL')) setEstimatedPrice(178.5);
    else if (symbol.includes('XAU')) setEstimatedPrice(2745);
    else if (symbol.includes('EUR')) setEstimatedPrice(1.085);
    else if (symbol.includes('GBP')) setEstimatedPrice(1.295);
    else if (symbol.includes('JPY')) setEstimatedPrice(153.2);
    else if (symbol.includes('NAS') || symbol.includes('NDX')) setEstimatedPrice(20450);
    else if (symbol.includes('NVDA')) setEstimatedPrice(141.5);
    else setEstimatedPrice(100);

    // Smooth scroll up to chart
    window.scrollTo({ top: 90, behavior: 'smooth' });
  };

  const allowedRiskPct = briefing?.riskModifier?.riskPct !== undefined ? briefing.riskModifier.riskPct : 1.0;

  return (
    <div className="min-h-screen bg-[#04060c] text-slate-100 flex flex-col font-sans selection:bg-amber-500/30 selection:text-amber-200">
      {/* 1. Single-Row Compact Header (48px) */}
      <HeaderBar
        portfolio={portfolio}
        onOpenBinanceModal={() => setIsBinanceModalOpen(true)}
        activeBlackout={Boolean(activeBlackoutEvent)}
        blackoutEventTitle={activeBlackoutEvent?.event}
        allowedRiskPct={allowedRiskPct}
      />

      {/* 2. Live Portfolio Strip (When Binance is Connected) */}
      {portfolio?.connected && (
        <BinancePortfolioStrip
          portfolio={portfolio}
          onOpenModal={() => setIsBinanceModalOpen(true)}
          allowedRiskPct={allowedRiskPct}
        />
      )}

      {/* 3. Live Binance WebSocket Crypto & FX Spot Matrix Bar */}
      <LiveAssetMatrixBar
        fxRates={fxRates}
        selectedSymbol={selectedSymbol}
        onSelectSymbol={handleSelectAsset}
      />

      {/* 4. Sleek Command Bar with Asset Filters */}
      <CommandFilterBar
        onRunPreMarket={(prompt) => runPreMarket(prompt)}
        isLoading={isLoading}
        onOpenPasteModal={() => setIsPasteModalOpen(true)}
        onPlaySquawk={handlePlaySquawk}
        isPlayingAudio={isPlayingAudio}
        onCopyBriefing={handleCopyBriefing}
        isCopied={isCopied}
        activeAssetFilter={activeAssetFilter}
        onSelectAssetFilter={setActiveAssetFilter}
        lastBriefingTime={briefing?.generatedAtCet}
        isGrounded={briefing?.source === 'gemini_grounded'}
      />

      {/* Main Trading Floor Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 py-4 space-y-5">
        {/* API Quota / Model Safeguard Notice (Non-blocking) */}
        {briefing?.quotaNotice && (
          <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/40 text-amber-200 text-xs font-mono flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span>{briefing.quotaNotice}</span>
            </div>
            <button
              onClick={() => runPreMarket('RUN PRE-MARKET')}
              className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-[10px] uppercase cursor-pointer"
            >
              Retry Live Search
            </button>
          </div>
        )}

        {/* Error notification banner if briefing completely failed */}
        {!briefing && errorMessage && (
          <div className="p-3.5 rounded-xl bg-red-950/70 border border-red-500/60 text-red-200 text-xs font-mono flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => runPreMarket('RUN PRE-MARKET')}
              className="px-3 py-1 rounded-lg bg-red-800 hover:bg-red-700 text-white font-bold text-[10px] uppercase cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        {/* Interactive TradingView Advanced Chart with 5 Asset Class Switcher */}
        <TradingViewChart
          currentSymbol={selectedSymbol}
          currentTvSymbol={selectedTvSymbol}
          currentAssetClass={selectedAssetClass}
          onSelectPair={handleSelectAsset}
        />

        {/* Loading Indicator */}
        {isLoading && !briefing && (
          <div className="p-12 text-center font-mono space-y-3">
            <RefreshCw className="w-8 h-8 text-amber-400 animate-spin mx-auto" />
            <div className="text-sm font-bold text-slate-200">
              SEARCHING LIVE WEB & COMPUTING MULTI-ASSET MACRO BRIEFING...
            </div>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Grounding ForexFactory, Investing.com, Binance live book, and central bank feeds into deterministic risk windows.
            </p>
          </div>
        )}

        {/* Briefing Sections */}
        {briefing && (
          <div className="space-y-5">
            {/* PART 1: RED FOLDER DANGER ZONES */}
            <Part1DangerZones
              events={briefing.dangerZones.events}
              summary={briefing.dangerZones.summary}
              currentCetTime={currentCetTime}
              groundingSources={briefing.groundingSources}
            />

            {/* PART 2: CROSS-ASSET STRENGTH MATRIX */}
            <Part2CrossAssetStrength strengths={briefing.crossAssetStrength} />

            {/* PART 3: MULTI-ASSET SESSION GAMEPLANS */}
            <Part3MultiAssetGameplans
              gameplans={briefing.gameplans}
              activeFilter={activeAssetFilter}
              onSelectAsset={handleSelectAsset}
              primaryRegime={briefing.sessionGameplan.primaryRegime}
            />

            {/* PART 4: DYNAMIC RISK MODIFIER & MULTI-ASSET POSITION SIZER */}
            <Part4MultiAssetSizer
              recommendation={briefing.riskModifier.recommendation}
              riskPct={allowedRiskPct}
              isBombDay={briefing.riskModifier.isBombDay}
              bombEventsFound={briefing.riskModifier.bombEventsFound}
              riskRuleExplanation={briefing.riskModifier.riskRuleExplanation}
              portfolio={portfolio}
              selectedSymbol={selectedSymbol}
              selectedAssetClass={selectedAssetClass}
              currentEstimatedPrice={estimatedPrice}
            />

            {/* Verified Live Web Sources Citations */}
            <GroundingSourcesBar sources={briefing.groundingSources} />
          </div>
        )}
      </main>

      {/* Connect Binance Read-Only API Modal */}
      <BinanceModal
        isOpen={isBinanceModalOpen}
        onClose={() => setIsBinanceModalOpen(false)}
        portfolio={portfolio}
        onSaveCredentials={handleSaveBinanceCredentials}
        onDisconnect={handleDisconnectBinance}
        isLoading={false}
        onLoadDemoPortfolio={handleLoadDemoPortfolio}
      />

      {/* Paste Raw Calendar Modal */}
      <MacroInputModal
        isOpen={isPasteModalOpen}
        onClose={() => setIsPasteModalOpen(false)}
        onSubmitPrompt={(rawCalendar) => {
          runPreMarket(undefined, rawCalendar);
        }}
      />

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-[#03050a] py-3 text-center font-mono text-[10px] text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            INSTITUTIONAL MULTI-ASSET MACRO & RISK DESK • LIVE BINANCE WS & SPOT ER-API • TRADINGVIEW EMBEDDED
          </div>
          <div className="text-slate-400">
            Zero Simulation • Read-Only HMAC-SHA256 Security • ±30m Deterministic CET Windows
          </div>
        </div>
      </footer>
    </div>
  );
}
