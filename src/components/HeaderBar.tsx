import React, { useState, useEffect } from 'react';
import { Shield, ShieldAlert, KeyRound, Wallet, Globe, Clock, Zap } from 'lucide-react';
import { BinancePortfolio } from '../types/terminal';

interface HeaderBarProps {
  portfolio: BinancePortfolio | null;
  onOpenBinanceModal: () => void;
  activeBlackout: boolean;
  blackoutEventTitle?: string;
  allowedRiskPct: number;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  portfolio,
  onOpenBinanceModal,
  activeBlackout,
  blackoutEventTitle,
  allowedRiskPct,
}) => {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTz = (timeZone: string) => {
    return new Intl.DateTimeFormat('en-GB', {
      timeZone,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }).format(now);
  };

  const cetHour = parseInt(
    new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Europe/Paris',
      hour: '2-digit',
      hour12: false,
    }).format(now),
    10
  );

  const isAsia = cetHour >= 0 && cetHour < 8;
  const isLondon = cetHour >= 8 && cetHour < 17;
  const isNyOverlap = cetHour >= 14 && cetHour < 17;

  const currentKillzone = isNyOverlap
    ? 'NY OVERLAP'
    : isLondon
    ? 'LONDON OPEN'
    : isAsia
    ? 'ASIA RANGE'
    : 'LATE US';

  const allowedRiskUsd = portfolio?.connected
    ? (portfolio.totalEquityUsd * (allowedRiskPct / 100)) < 1
      ? (portfolio.totalEquityUsd * (allowedRiskPct / 100)).toFixed(2)
      : (portfolio.totalEquityUsd * (allowedRiskPct / 100)).toLocaleString(undefined, { maximumFractionDigits: 2 })
    : null;

  return (
    <header className="min-h-12 py-1.5 sm:py-0 bg-[#060911]/95 backdrop-blur-md border-b border-slate-800 text-slate-200 px-3 sm:px-4 flex flex-wrap items-center justify-between gap-y-1.5 gap-x-2 font-mono text-xs select-none sticky top-0 z-40">
      {/* Left: Branding & Killzone Badge */}
      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2.5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold shadow-md shadow-amber-500/10">
            <Zap className="w-4 h-4 fill-amber-400/40 text-amber-400" />
          </div>
          <div className="hidden sm:block">
            <span className="font-extrabold tracking-wider text-slate-100 text-xs">
              MULTI-ASSET MACRO & RISK DESK
            </span>
            <span className="text-[10px] text-amber-400/80 font-bold ml-1.5 px-1 py-0.2 rounded bg-amber-950/60 border border-amber-800/60">
              BINANCE LIVE
            </span>
          </div>
        </div>

        {/* Active Killzone Pill */}
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-[10px]">
          <span className={`w-1.5 h-1.5 rounded-full ${isNyOverlap ? 'bg-purple-400 animate-ping' : isLondon ? 'bg-amber-400' : 'bg-blue-400'}`} />
          <span className="text-slate-400 font-semibold">{currentKillzone}</span>
        </div>

        {/* Pulsing Blackout Banner if active */}
        {activeBlackout && (
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-950/90 border border-red-500 text-red-200 text-[10px] font-bold animate-pulse shadow-md shadow-red-500/20">
            <ShieldAlert className="w-3 h-3 text-red-400 flex-shrink-0" />
            <span className="truncate max-w-[130px] sm:max-w-[180px]">
              NO-TRADE: {blackoutEventTitle || 'NEWS EVENT'}
            </span>
          </div>
        )}
      </div>

      {/* Center: Clocks Pill (CET, LON, NY) */}
      <div className="hidden lg:flex items-center gap-3 px-3 py-1 rounded-full bg-[#090d16] border border-slate-800 text-[11px] text-slate-400">
        <div className="flex items-center gap-1 text-amber-300 font-bold">
          <Clock className="w-3 h-3 text-amber-400" />
          <span>CET: {formatTz('Europe/Paris')}</span>
        </div>
        <span className="text-slate-700">|</span>
        <div>LON: <span className="text-slate-200 font-medium">{formatTz('Europe/London')}</span></div>
        <span className="text-slate-700">|</span>
        <div>NY: <span className="text-slate-200 font-medium">{formatTz('America/New_York')}</span></div>
      </div>

      {/* Right: Connect Binance API / Live Equity Button */}
      <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0 ml-auto sm:ml-0">
        {portfolio?.connected ? (
          <button
            type="button"
            onClick={onOpenBinanceModal}
            className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-2.5 py-1 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-500/50 text-emerald-300 transition-all cursor-pointer shadow-sm text-right"
          >
            <Wallet className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
            <div className="text-right leading-tight">
              <div className="text-[11px] font-bold text-slate-100">
                ${portfolio.totalEquityUsd < 1
                  ? portfolio.totalEquityUsd.toFixed(2)
                  : portfolio.totalEquityUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="text-[9px] text-emerald-400 whitespace-nowrap">
                Risk Cap: ${allowedRiskUsd} ({allowedRiskPct}%)
              </div>
            </div>
          </button>
        ) : (
          <button
            type="button"
            onClick={onOpenBinanceModal}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition-all cursor-pointer shadow-md shadow-amber-500/20 text-xs"
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Connect Binance API</span>
          </button>
        )}
      </div>
    </header>
  );
};
