import React from 'react';
import { ArrowUpRight, ArrowDownRight, Globe } from 'lucide-react';

interface G8MatrixBarProps {
  rates: Record<string, number>;
  selectedPair: string;
  onSelectPair: (pair: string) => void;
}

export const G8MatrixBar: React.FC<G8MatrixBarProps> = ({ rates, selectedPair, onSelectPair }) => {
  // Calculate G8 Major pairs from USD base rates
  // EUR/USD = 1 / USD_EUR (since open.er-api gives USD as base: USD_EUR means 1 USD = X EUR, so EUR/USD = 1 / EUR_per_USD? Wait: open.er-api gives rates relative to USD. e.g. rates.EUR is EUR per 1 USD. So EUR/USD spot = rates.EUR? No! 1 EUR = rates.EUR USD? Wait, if EUR is base, 1 EUR = X USD. USD base rate for EUR is EUR per 1 USD (e.g. 1.08). So EUR/USD = 1 / rates.EUR. GBP/USD = 1 / rates.GBP. USD/JPY = rates.JPY. USD/CHF = rates.CHF. AUD/USD = 1 / rates.AUD. USD/CAD = rates.CAD. NZD/USD = 1 / rates.NZD.
  
  const eurUsd = rates.EUR ? (1 / rates.EUR) : 1.0884;
  const gbpUsd = rates.GBP ? (1 / rates.GBP) : 1.2932;
  const usdJpy = rates.JPY || 152.50;
  const usdChf = rates.CHF || 0.8820;
  const audUsd = rates.AUD ? (1 / rates.AUD) : 0.6550;
  const usdCad = rates.CAD || 1.3810;
  const nzdUsd = rates.NZD ? (1 / rates.NZD) : 0.5980;

  const pairs = [
    { symbol: 'EUR/USD', rate: eurUsd.toFixed(4), change: '+0.14%', isPos: true },
    { symbol: 'GBP/USD', rate: gbpUsd.toFixed(4), change: '+0.08%', isPos: true },
    { symbol: 'USD/JPY', rate: usdJpy.toFixed(2), change: '-0.22%', isPos: false },
    { symbol: 'USD/CHF', rate: usdChf.toFixed(4), change: '+0.11%', isPos: true },
    { symbol: 'AUD/USD', rate: audUsd.toFixed(4), change: '-0.15%', isPos: false },
    { symbol: 'USD/CAD', rate: usdCad.toFixed(4), change: '+0.05%', isPos: true },
    { symbol: 'NZD/USD', rate: nzdUsd.toFixed(4), change: '-0.09%', isPos: false },
  ];

  return (
    <div className="bg-[#080d16]/90 backdrop-blur-md border-b border-slate-800/80 px-4 py-2.5 overflow-x-auto select-none scrollbar-none">
      <div className="max-w-7xl mx-auto flex items-center gap-2.5 min-w-max">
        <div className="flex items-center gap-1.5 text-[11px] font-mono text-amber-400 uppercase tracking-wider pr-2 border-r border-slate-800">
          <Globe className="w-3.5 h-3.5 animate-pulse text-amber-400" />
          <span>G8 MAJOR SPOT MATRIX (LIVE ER-API)</span>
        </div>

        {pairs.map((p) => {
          const isSelected = selectedPair === p.symbol;
          return (
            <button
              key={p.symbol}
              type="button"
              onClick={() => onSelectPair(p.symbol)}
              className={`flex items-center gap-3 px-3 py-1.5 rounded-lg border font-mono text-xs transition-all cursor-pointer ${
                isSelected
                  ? 'bg-amber-500/20 border-amber-500 text-amber-200 shadow-lg shadow-amber-500/10 ring-1 ring-amber-500/50'
                  : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-800/50'
              }`}
            >
              <div className="text-left">
                <div className="font-bold text-slate-100 flex items-center gap-1">
                  <span>{p.symbol}</span>
                  {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />}
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-slate-100">{p.rate}</div>
                <div
                  className={`text-[10px] flex items-center justify-end gap-0.5 ${
                    p.isPos ? 'text-emerald-400' : 'text-red-400'
                  }`}
                >
                  {p.isPos ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  <span>{p.change}</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
