import React from 'react';
import { Compass, TrendingUp, TrendingDown, Minus, Scale } from 'lucide-react';
import { CurrencyStrength } from '../utils/deskRules';

interface Part2CurrencyStrengthProps {
  currencies: Record<'USD' | 'EUR' | 'GBP' | 'JPY' | 'CHF' | 'AUD' | 'CAD' | 'NZD', CurrencyStrength>;
  rateDifferentialNotes: string;
}

export const Part2CurrencyStrength: React.FC<Part2CurrencyStrengthProps> = ({ currencies, rateDifferentialNotes }) => {
  const currencyList = Object.values(currencies || {});

  // Sort by score descending (-5 to +5)
  const sorted = [...currencyList].sort((a, b) => b.score - a.score);

  return (
    <section className="bg-[#0b1019] border border-slate-800 rounded-2xl p-6 shadow-2xl backdrop-blur-xl">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="px-2.5 py-1 rounded-lg bg-blue-500/20 border border-blue-500/40 text-blue-400 font-mono text-xs font-bold">
            PART 2
          </div>
          <div>
            <h2 className="text-base font-bold font-mono text-slate-100 flex items-center gap-2">
              <Compass className="w-4 h-4 text-blue-400" />
              G8 CURRENCY STRENGTH & DIRECTIONAL BIAS MATRIX
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              Quantitative strength score (-5 to +5) based on central bank policy divergence & rate differentials
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300">
          <Scale className="w-3.5 h-3.5 text-amber-400" />
          <span>G10 POLICY ANCHOR</span>
        </div>
      </div>

      {/* Grid of 8 G8 Currencies */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 my-6">
        {sorted.map((c) => {
          const isBull = c.rating === 'Bullish';
          const isBear = c.rating === 'Bearish';
          const badgeColor = isBull
            ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300'
            : isBear
            ? 'bg-red-950/80 border-red-500/50 text-red-300'
            : 'bg-slate-800/80 border-slate-600/50 text-slate-300';

          // Score bar width (-5 to +5 normalized to 0..100%)
          const scoreNormalized = ((c.score + 5) / 10) * 100;

          return (
            <div key={c.currency} className="p-4 rounded-xl bg-[#070b13] border border-slate-800 flex flex-col justify-between shadow-lg">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-extrabold text-sm text-slate-100">{c.currency}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                      Rate: {c.rate}
                    </span>
                  </div>
                  <span className={`font-mono text-xs font-bold px-2 py-0.5 rounded border flex items-center gap-1 ${badgeColor}`}>
                    {isBull ? <TrendingUp className="w-3 h-3 text-emerald-400" /> : isBear ? <TrendingDown className="w-3 h-3 text-red-400" /> : <Minus className="w-3 h-3 text-slate-400" />}
                    {c.rating}
                  </span>
                </div>

                {/* Score meter (-5 to +5) */}
                <div className="mb-3 space-y-1">
                  <div className="flex justify-between text-[10px] font-mono text-slate-400">
                    <span>Strength Score</span>
                    <span className={c.score > 0 ? 'text-emerald-400 font-bold' : c.score < 0 ? 'text-red-400 font-bold' : 'text-slate-300'}>
                      {c.score > 0 ? `+${c.score}` : c.score}/5
                    </span>
                  </div>
                  <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className={`h-full transition-all duration-500 ${c.score > 0 ? 'bg-emerald-500' : c.score < 0 ? 'bg-red-500' : 'bg-slate-500'}`}
                      style={{ width: `${scoreNormalized}%` }}
                    />
                  </div>
                </div>

                <p className="font-mono text-xs text-slate-300 leading-relaxed line-clamp-3">
                  {c.rationale}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-3.5 rounded-xl bg-blue-950/30 border border-blue-900/50 text-xs font-mono text-blue-200">
        <span className="font-bold text-blue-300">INTERBANK CARRY & DIFFERENTIAL NOTES:</span> {rateDifferentialNotes}
      </div>
    </section>
  );
};
