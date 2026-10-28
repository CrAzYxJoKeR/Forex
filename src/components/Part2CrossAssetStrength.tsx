import React from 'react';
import { Compass, TrendingUp, TrendingDown, Minus, Zap } from 'lucide-react';
import { CrossAssetStrength } from '../types/terminal';

interface Part2CrossAssetStrengthProps {
  strengths: CrossAssetStrength[];
}

export const Part2CrossAssetStrength: React.FC<Part2CrossAssetStrengthProps> = ({ strengths }) => {
  const list = strengths && strengths.length > 0 ? strengths : [
    { asset: 'USD', category: 'FIAT' as const, score: 3, rating: 'Bullish' as const, driver: 'Resilient US labor prints and sticky core PCE keeping Fed rates restrictive.', keyLevel: 'DXY 104.50' },
    { asset: 'EUR', category: 'FIAT' as const, score: -2, rating: 'Bearish' as const, driver: 'Sluggish German industrial activity and dovish ECB rate cut expectations.', keyLevel: '1.0820' },
    { asset: 'GBP', category: 'FIAT' as const, score: 0, rating: 'Neutral' as const, driver: 'Elevated services CPI balanced by fragile consumer retail data.', keyLevel: '1.2920' },
    { asset: 'JPY', category: 'FIAT' as const, score: -4, rating: 'Bearish' as const, driver: 'Yield spread gap vs US 10Y and cautious BoJ normalization tempo.', keyLevel: '153.50' },
    { asset: 'BTC', category: 'CRYPTO' as const, score: 4, rating: 'Bullish' as const, driver: 'Spot ETF net inflows, institutional accumulation, and supply squeeze.', keyLevel: '$66,500' },
    { asset: 'ETH', category: 'CRYPTO' as const, score: 1, rating: 'Neutral' as const, driver: 'L2 fee compression and ETH/BTC pair testing multi-year support.', keyLevel: '$2,500' },
    { asset: 'XAU (Gold)', category: 'COMMODITY' as const, score: 4, rating: 'Bullish' as const, driver: 'Central bank de-dollarization reserves and geopolitical safe-haven bids.', keyLevel: '$2,730' },
    { asset: 'SPX/NDX', category: 'EQUITY' as const, score: 2, rating: 'Bullish' as const, driver: 'Big tech earnings momentum offsetting elevated 10-year Treasury yields.', keyLevel: 'NDX 20,200' },
  ];

  return (
    <section className="bg-[#080c16] border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-2xl backdrop-blur-xl font-mono">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="px-2 py-0.5 rounded-lg bg-blue-500/20 border border-blue-500/40 text-blue-400 text-xs font-bold">
            PART 2
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Compass className="w-4 h-4 text-blue-400" />
              CROSS-ASSET STRENGTH MATRIX (FOREX, CRYPTO, COMMODITIES, EQUITIES)
            </h2>
            <p className="text-[11px] text-slate-400">
              Macro strength ranking (-5 to +5) driven by interest rate differentials, yield curves, and liquidity flow
            </p>
          </div>
        </div>

        <div className="text-[10px] text-slate-400 flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span>CROSS-MARKET QUANT SCORES</span>
        </div>
      </div>

      {/* Grid of Cross-Asset Strengths */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 my-4">
        {list.map((item) => {
          const isBull = item.rating === 'Bullish';
          const isBear = item.rating === 'Bearish';
          const badgeStyle = isBull
            ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300'
            : isBear
            ? 'bg-red-950/80 border-red-500/50 text-red-300'
            : 'bg-slate-800/80 border-slate-600/50 text-slate-300';

          const pct = Math.min(100, Math.max(0, ((item.score + 5) / 10) * 100));

          return (
            <div
              key={item.asset}
              className="p-3.5 rounded-xl bg-[#05080f] border border-slate-800/90 flex flex-col justify-between shadow-md hover:border-slate-700 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-sm text-slate-100">{item.asset}</span>
                    <span className="text-[9px] px-1 py-0.2 rounded bg-slate-900 border border-slate-800 text-slate-400 uppercase font-bold">
                      {item.category}
                    </span>
                  </div>

                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border flex items-center gap-1 ${badgeStyle}`}>
                    {isBull ? <TrendingUp className="w-2.5 h-2.5 text-emerald-400" /> : isBear ? <TrendingDown className="w-2.5 h-2.5 text-red-400" /> : <Minus className="w-2.5 h-2.5" />}
                    {item.rating}
                  </span>
                </div>

                {/* Score bar */}
                <div className="space-y-1 mb-2">
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>Macro Score</span>
                    <span className={`font-bold ${item.score > 0 ? 'text-emerald-400' : item.score < 0 ? 'text-red-400' : 'text-slate-300'}`}>
                      {item.score > 0 ? `+${item.score}` : item.score}/5
                    </span>
                  </div>
                  <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className={`h-full transition-all duration-500 ${item.score > 0 ? 'bg-emerald-400' : item.score < 0 ? 'bg-red-400' : 'bg-slate-500'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>

                <p className="text-[11px] text-slate-300 leading-snug line-clamp-2 mb-2">
                  {item.driver}
                </p>
              </div>

              {item.keyLevel && (
                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
                  <span className="text-slate-500 uppercase font-bold">Key Level:</span>
                  <span className="font-bold text-amber-300">{item.keyLevel}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
