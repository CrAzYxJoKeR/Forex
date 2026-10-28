import React from 'react';
import { Target, Layers, Zap, ArrowRight } from 'lucide-react';
import { PairGameplan } from '../utils/deskRules';

interface Part3PairGameplansProps {
  pairGameplans: Record<string, PairGameplan>;
  primaryStrategy: string;
  onSelectPairForChart: (pair: string) => void;
}

export const Part3PairGameplans: React.FC<Part3PairGameplansProps> = ({
  pairGameplans,
  primaryStrategy,
  onSelectPairForChart,
}) => {
  const plans = Object.values(pairGameplans || {});

  return (
    <section className="bg-[#0b1019] border border-slate-800 rounded-2xl p-6 shadow-2xl backdrop-blur-xl">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="px-2.5 py-1 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-400 font-mono text-xs font-bold">
            PART 3
          </div>
          <div>
            <h2 className="text-base font-bold font-mono text-slate-100 flex items-center gap-2">
              <Target className="w-4 h-4 text-amber-400" />
              G8 SESSION GAMEPLAN & PAIR-BY-PAIR EXECUTION PLAYBOOK
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              Tactical market models: Trend Breakouts, Mean-Reversion Range Sweeps, or Stop-Hunt Reversals
            </p>
          </div>
        </div>

        <div className="px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 font-mono text-xs text-amber-300 font-bold">
          REGIME: {primaryStrategy.toUpperCase()}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 my-6">
        {plans.map((gp) => {
          const isBreakout = gp.strategy === 'Trend Breakouts';
          const isRange = gp.strategy === 'Mean-Reversion Range Sweeps';
          const isLong = gp.bias === 'Long';
          const isShort = gp.bias === 'Short';

          return (
            <div
              key={gp.pair}
              className="p-5 rounded-xl bg-[#070b13] border border-slate-800 flex flex-col justify-between shadow-xl hover:border-slate-700 transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-extrabold text-sm text-slate-100">{gp.pair}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                      {gp.strategy}
                    </span>
                  </div>
                  <span
                    className={`font-mono text-xs font-bold px-2.5 py-0.5 rounded border ${
                      isLong
                        ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300'
                        : isShort
                        ? 'bg-red-950/80 border-red-500/50 text-red-300'
                        : 'bg-slate-800/80 text-slate-300 border-slate-600'
                    }`}
                  >
                    {gp.bias}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 my-3 font-mono text-[11px]">
                  <div className="p-2 rounded bg-slate-900/80 border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">KEY SUPPORT</span>
                    <span className="font-bold text-emerald-400">{gp.keySupport}</span>
                  </div>
                  <div className="p-2 rounded bg-slate-900/80 border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">KEY RESISTANCE</span>
                    <span className="font-bold text-red-400">{gp.keyResistance}</span>
                  </div>
                </div>

                <p className="font-mono text-xs text-slate-300 leading-relaxed mb-4">
                  {gp.playbook}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => onSelectPairForChart(gp.pair)}
                  className="w-full py-2 px-3 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 font-mono text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <span>LOAD {gp.pair} CHART</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
