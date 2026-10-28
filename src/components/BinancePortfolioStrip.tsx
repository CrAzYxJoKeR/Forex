import React from 'react';
import { Wallet, TrendingUp, TrendingDown, Layers, ShieldCheck } from 'lucide-react';
import { BinancePortfolio } from '../types/terminal';

interface BinancePortfolioStripProps {
  portfolio: BinancePortfolio;
  onOpenModal: () => void;
  allowedRiskPct: number;
}

export const BinancePortfolioStrip: React.FC<BinancePortfolioStripProps> = ({
  portfolio,
  onOpenModal,
  allowedRiskPct,
}) => {
  if (!portfolio.connected) return null;

  const topBalances = portfolio.spotBalances.slice(0, 4);
  const openPositions = portfolio.futuresPositions;
  const isPnlPos = portfolio.unrealizedPnlUsd >= 0;
  const maxRiskDollar = (portfolio.totalEquityUsd * (allowedRiskPct / 100)).toFixed(0);

  return (
    <div className="bg-[#080c16]/95 border-b border-slate-800/80 px-4 py-2 font-mono text-xs select-none">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Equity & PnL Overview */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] uppercase text-slate-500 font-bold">BINANCE PORTFOLIO</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 text-[11px]">Total Equity:</span>
            <span className="font-extrabold text-slate-100">
              ${portfolio.totalEquityUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 text-[11px]">Unrealized PnL:</span>
            <span className={`font-bold flex items-center ${isPnlPos ? 'text-emerald-400' : 'text-red-400'}`}>
              {isPnlPos ? <TrendingUp className="w-3 h-3 mr-0.5 inline" /> : <TrendingDown className="w-3 h-3 mr-0.5 inline" />}
              {isPnlPos ? `+$${portfolio.unrealizedPnlUsd.toFixed(2)}` : `-$${Math.abs(portfolio.unrealizedPnlUsd).toFixed(2)}`}
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px]">
            <span>Allowed Risk / Trade:</span>
            <span className="font-bold">${maxRiskDollar} ({allowedRiskPct}%)</span>
          </div>
        </div>

        {/* Top Holdings Pills & Open Positions */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
          <div className="flex items-center gap-1.5">
            {topBalances.map((b) => (
              <span
                key={b.asset}
                className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] text-slate-300 flex items-center gap-1"
              >
                <span className="font-bold text-amber-400">{b.asset}:</span>
                <span>${b.usdValue.toFixed(0)}</span>
              </span>
            ))}
          </div>

          {openPositions.length > 0 && (
            <div className="flex items-center gap-1.5 pl-2 border-l border-slate-800">
              <span className="text-[10px] text-purple-400 font-bold flex items-center gap-1">
                <Layers className="w-3 h-3" />
                POSITIONS ({openPositions.length}):
              </span>
              {openPositions.slice(0, 2).map((pos) => (
                <span
                  key={pos.symbol}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                    pos.side === 'LONG'
                      ? 'bg-emerald-950/70 border-emerald-500/50 text-emerald-300'
                      : 'bg-red-950/70 border-red-500/50 text-red-300'
                  }`}
                >
                  {pos.symbol} {pos.leverage}x {pos.side} ({pos.unRealizedProfit >= 0 ? `+$${pos.unRealizedProfit}` : `-$${Math.abs(pos.unRealizedProfit)}`})
                </span>
              ))}
            </div>
          )}

          <button
            type="button"
            onClick={onOpenModal}
            className="text-[10px] text-slate-400 hover:text-slate-200 underline cursor-pointer ml-1"
          >
            Manage
          </button>
        </div>
      </div>
    </div>
  );
};
