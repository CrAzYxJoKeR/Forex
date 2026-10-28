import React, { useState, useEffect } from 'react';
import { Shield, ShieldAlert, Calculator, DollarSign, Percent, AlertOctagon } from 'lucide-react';
import { RiskModifierType, calculatePositionSize } from '../utils/deskRules';

interface Part4RiskModifierProps {
  recommendation: RiskModifierType;
  isBombDay: boolean;
  bombEventsFound: string[];
  riskRuleExplanation: string;
  recommendedRiskPerTradePct: number;
  rates: Record<string, number>;
  selectedPair: string;
}

export const Part4RiskModifier: React.FC<Part4RiskModifierProps> = ({
  recommendation,
  isBombDay,
  bombEventsFound,
  riskRuleExplanation,
  recommendedRiskPerTradePct,
  rates,
  selectedPair,
}) => {
  const isSitOnHands = recommendation === '0% SIT ON HANDS';
  const isHalfRisk = recommendation === 'Half 0.5% Risk';

  const [balance, setBalance] = useState<number>(100000);
  const [riskPct, setRiskPct] = useState<number>(recommendedRiskPerTradePct);
  const [stopLossPips, setStopLossPips] = useState<number>(25);

  useEffect(() => {
    setRiskPct(recommendedRiskPerTradePct);
  }, [recommendedRiskPerTradePct]);

  // Determine current rate for selected pair from rates
  let currentRate = 1.0884;
  if (selectedPair === 'EUR/USD') currentRate = rates.EUR ? 1 / rates.EUR : 1.0884;
  else if (selectedPair === 'GBP/USD') currentRate = rates.GBP ? 1 / rates.GBP : 1.2932;
  else if (selectedPair === 'USD/JPY') currentRate = rates.JPY || 152.50;
  else if (selectedPair === 'USD/CHF') currentRate = rates.CHF || 0.8820;
  else if (selectedPair === 'AUD/USD') currentRate = rates.AUD ? 1 / rates.AUD : 0.6550;
  else if (selectedPair === 'USD/CAD') currentRate = rates.CAD || 1.3810;
  else if (selectedPair === 'NZD/USD') currentRate = rates.NZD ? 1 / rates.NZD : 0.5980;

  const calc = calculatePositionSize({
    accountBalance: balance,
    riskPct: isSitOnHands ? 0 : riskPct,
    stopLossPips,
    pair: selectedPair,
    currentRate,
  });

  return (
    <section className="bg-[#0b1019] border border-slate-800 rounded-2xl p-6 shadow-2xl backdrop-blur-xl">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="px-2.5 py-1 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-mono text-xs font-bold">
            PART 4
          </div>
          <div>
            <h2 className="text-base font-bold font-mono text-slate-100 flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-400" />
              DYNAMIC RISK MODIFIER & G8 POSITION SIZE CALCULATOR
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              Institutional risk allocation mandated by central bank rate decisions and Tier-1 volatility
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="text-slate-400">DESK RISK LIMIT:</span>
          <span
            className={`px-3 py-1 rounded-xl font-bold border ${
              isSitOnHands
                ? 'bg-red-950 border-red-500 text-red-200 animate-pulse'
                : isHalfRisk
                ? 'bg-amber-950 border-amber-500 text-amber-200'
                : 'bg-emerald-950 border-emerald-500 text-emerald-200'
            }`}
          >
            {recommendation.toUpperCase()}
          </span>
        </div>
      </div>

      <div
        className={`my-6 p-5 rounded-2xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
          isSitOnHands
            ? 'bg-gradient-to-r from-red-950/80 via-red-900/30 to-[#070b13] border-red-500'
            : isHalfRisk
            ? 'bg-gradient-to-r from-amber-950/80 via-amber-900/30 to-[#070b13] border-amber-500/60'
            : 'bg-gradient-to-r from-emerald-950/80 via-emerald-900/30 to-[#070b13] border-emerald-500/60'
        }`}
      >
        <div className="flex items-center gap-4">
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center border shadow-xl ${
              isSitOnHands
                ? 'bg-red-500/20 border-red-500 text-red-400 animate-bounce'
                : isHalfRisk
                ? 'bg-amber-500/20 border-amber-500 text-amber-400'
                : 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
            }`}
          >
            {isSitOnHands ? <ShieldAlert className="w-7 h-7" /> : <Shield className="w-7 h-7" />}
          </div>
          <div>
            <div className="text-[11px] font-mono text-slate-300 uppercase tracking-wider">
              MANDATORY DESK RISK PROTOCOL
            </div>
            <div
              className={`text-2xl font-extrabold font-mono uppercase tracking-tight ${
                isSitOnHands ? 'text-red-200' : isHalfRisk ? 'text-amber-200' : 'text-emerald-200'
              }`}
            >
              {recommendation}
            </div>
          </div>
        </div>

        <div className="text-xs font-mono max-w-md text-slate-300 md:text-right leading-relaxed">
          {riskRuleExplanation}
        </div>
      </div>

      {isBombDay && bombEventsFound.length > 0 && (
        <div className="mb-6 p-4 rounded-xl bg-red-950/40 border border-red-700/60 font-mono text-xs text-red-200 flex items-start gap-3">
          <AlertOctagon className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <div className="font-bold text-red-300 uppercase">TIER-1 VOLATILITY CATALYSTS TODAY:</div>
            <ul className="list-disc list-inside mt-1 space-y-1 text-slate-200">
              {bombEventsFound.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Position Sizer */}
      <div className="p-6 rounded-2xl bg-[#070b13] border border-slate-800 font-mono shadow-xl">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
          <div className="flex items-center gap-2 text-slate-200 text-xs font-bold">
            <Calculator className="w-4 h-4 text-amber-400" />
            <span>G8 POSITION SIZER & RISK CALCULATOR ({selectedPair})</span>
          </div>
          <span className="text-xs text-slate-400">
            Current Rate: <span className="text-amber-300 font-bold">{currentRate.toFixed(4)}</span>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs mb-6">
          <div>
            <label className="text-[11px] text-slate-400 uppercase block mb-1.5">
              Account Equity ($ USD)
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                <DollarSign className="w-4 h-4" />
              </span>
              <input
                type="number"
                min={1000}
                step={1000}
                value={balance}
                onChange={(e) => setBalance(parseFloat(e.target.value) || 0)}
                className="w-full bg-[#0b1019] border border-slate-700 rounded-xl pl-8 pr-4 py-2.5 text-slate-100 font-bold focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] text-slate-400 uppercase">Risk Per Trade (%)</label>
              <div className="flex items-center gap-1.5">
                {[0.25, 0.5, 1.0].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setRiskPct(val)}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer ${
                      riskPct === val ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {val}%
                  </button>
                ))}
              </div>
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 pointer-events-none">
                <Percent className="w-4 h-4" />
              </span>
              <input
                type="number"
                min={0.1}
                max={3.0}
                step={0.1}
                value={isSitOnHands ? 0 : riskPct}
                disabled={isSitOnHands}
                onChange={(e) => setRiskPct(parseFloat(e.target.value) || 0)}
                className="w-full bg-[#0b1019] border border-slate-700 rounded-xl px-4 py-2.5 text-slate-100 font-bold focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] text-slate-400 uppercase block mb-1.5">
              Stop Loss (Pips)
            </label>
            <input
              type="number"
              min={5}
              max={200}
              step={1}
              value={stopLossPips}
              onChange={(e) => setStopLossPips(parseFloat(e.target.value) || 0)}
              className="w-full bg-[#0b1019] border border-slate-700 rounded-xl px-4 py-2.5 text-slate-100 font-bold focus:border-amber-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-800">
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase">Capital at Risk</div>
            <div className="text-lg font-bold text-red-400 mt-0.5">
              ${calc.riskAmountUsd.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-500/40">
            <div className="text-[10px] text-amber-400 uppercase font-bold">Standard Lots</div>
            <div className="text-xl font-extrabold text-amber-300 mt-0.5">
              {isSitOnHands ? '0.00' : calc.lotSize.toFixed(2)} <span className="text-xs font-normal text-amber-400">lots</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase">Units</div>
            <div className="text-lg font-bold text-slate-200 mt-0.5">
              {isSitOnHands ? '0' : calc.units.toLocaleString()}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase">Pip Value ($/Pip)</div>
            <div className="text-lg font-bold text-emerald-400 mt-0.5">
              ${isSitOnHands ? '0.00' : calc.pipValueUsd.toFixed(2)}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
