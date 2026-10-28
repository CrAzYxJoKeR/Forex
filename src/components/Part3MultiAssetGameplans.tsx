import React from 'react';
import { Target, ArrowRight, ShieldAlert, Sparkles } from 'lucide-react';
import { AssetGameplan, AssetClass } from '../types/terminal';

interface Part3MultiAssetGameplansProps {
  gameplans: AssetGameplan[];
  activeFilter: string;
  onSelectAsset: (symbol: string, tvSymbol: string, assetClass: AssetClass) => void;
  primaryRegime: string;
}

export const Part3MultiAssetGameplans: React.FC<Part3MultiAssetGameplansProps> = ({
  gameplans,
  activeFilter,
  onSelectAsset,
  primaryRegime,
}) => {
  const filteredPlans = gameplans.filter((gp) => {
    if (activeFilter === 'ALL') return true;
    if (activeFilter === 'CRYPTO') return gp.assetClass === 'CRYPTO';
    if (activeFilter === 'FOREX') return gp.assetClass === 'FOREX';
    if (activeFilter === 'COMMODITIES') return gp.assetClass === 'COMMODITIES';
    if (activeFilter === 'INDICES') return gp.assetClass === 'INDICES';
    if (activeFilter === 'STOCKS') return gp.assetClass === 'STOCKS';
    return true;
  });

  return (
    <section className="bg-[#080c16] border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-2xl backdrop-blur-xl font-mono">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="px-2 py-0.5 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-400 text-xs font-bold">
            PART 3
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Target className="w-4 h-4 text-amber-400" />
              MULTI-ASSET SESSION GAMEPLANS & EXECUTION PLAYBOOKS
            </h2>
            <p className="text-[11px] text-slate-400">
              Institutional order flow models: Trend Breakouts, Mean-Reversion Sweeps, Stop-Hunts & Order Blocks
            </p>
          </div>
        </div>

        <div className="px-3 py-1 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300 font-bold">
          PRIMARY REGIME: {primaryRegime.toUpperCase()}
        </div>
      </div>

      {/* Grid of Multi-Asset Gameplans */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 my-4">
        {filteredPlans.map((gp) => {
          const isLong = gp.bias === 'Long';
          const isShort = gp.bias === 'Short';

          return (
            <div
              key={gp.symbol}
              className="p-4 rounded-xl bg-[#05080f] border border-slate-800/90 flex flex-col justify-between shadow-md hover:border-slate-700 transition-all group"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-sm text-slate-100">{gp.symbol}</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-900 border border-slate-800 text-slate-400 font-bold uppercase">
                      {gp.assetClass}
                    </span>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                      isLong
                        ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300'
                        : isShort
                        ? 'bg-red-950/80 border-red-500/50 text-red-300'
                        : 'bg-slate-800/80 border-slate-600 text-slate-300'
                    }`}
                  >
                    {gp.bias}
                  </span>
                </div>

                <div className="text-[10px] text-amber-400/90 font-bold mb-2">
                  TACTIC: {gp.strategy}
                </div>

                <div className="grid grid-cols-2 gap-2 my-2 text-[10px]">
                  <div className="p-1.5 rounded bg-slate-900 border border-slate-800">
                    <span className="text-slate-500 block uppercase font-bold text-[9px]">Key Support</span>
                    <span className="font-bold text-emerald-400 truncate block">{gp.keySupport}</span>
                  </div>
                  <div className="p-1.5 rounded bg-slate-900 border border-slate-800">
                    <span className="text-slate-500 block uppercase font-bold text-[9px]">Key Resistance</span>
                    <span className="font-bold text-red-400 truncate block">{gp.keyResistance}</span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-300 leading-normal mb-3">
                  {gp.playbook}
                </p>

                {gp.invalidation && (
                  <div className="text-[10px] text-red-300/80 mb-3 flex items-start gap-1">
                    <ShieldAlert className="w-3 h-3 text-red-400 flex-shrink-0 mt-0.5" />
                    <span>Invalidation: {gp.invalidation}</span>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => onSelectAsset(gp.symbol, gp.tvSymbol, gp.assetClass)}
                className="w-full py-1.5 px-3 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer group-hover:border-amber-500/60"
              >
                <span>LOAD {gp.symbol} TO CHART & SIZER</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
};
