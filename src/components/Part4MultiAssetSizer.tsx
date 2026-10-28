import React, { useState, useEffect } from 'react';
import { Shield, ShieldAlert, Calculator, DollarSign, Percent, Wallet, AlertOctagon } from 'lucide-react';
import { RiskModifierType, AssetClass, BinancePortfolio } from '../types/terminal';
import { calculateMultiAssetPositionSize } from '../utils/deskRules';

interface Part4MultiAssetSizerProps {
  recommendation: RiskModifierType;
  riskPct: number;
  isBombDay: boolean;
  bombEventsFound: string[];
  riskRuleExplanation: string;
  portfolio: BinancePortfolio | null;
  selectedSymbol: string;
  selectedAssetClass: AssetClass;
  currentEstimatedPrice: number;
}

export const Part4MultiAssetSizer: React.FC<Part4MultiAssetSizerProps> = ({
  recommendation,
  riskPct: initialRiskPct,
  isBombDay,
  bombEventsFound,
  riskRuleExplanation,
  portfolio,
  selectedSymbol,
  selectedAssetClass,
  currentEstimatedPrice,
}) => {
  const isSitOnHands = recommendation === '0% SIT ON HANDS';

  // Account balance: auto-sync with Binance Read-Only equity if connected, else default $50,000
  const [balance, setBalance] = useState<number>(() => {
    if (portfolio?.connected && typeof portfolio.totalEquityUsd === 'number') {
      return portfolio.totalEquityUsd;
    }
    return 50000;
  });
  const [customRiskPct, setCustomRiskPct] = useState<number>(initialRiskPct);
  const [entryPrice, setEntryPrice] = useState<number>(currentEstimatedPrice || 67800);
  const [stopLossPrice, setStopLossPrice] = useState<number>(
    currentEstimatedPrice ? currentEstimatedPrice * 0.98 : 66444
  );

  // Sync balance whenever Binance portfolio updates or connects
  useEffect(() => {
    if (portfolio?.connected && typeof portfolio.totalEquityUsd === 'number') {
      setBalance(portfolio.totalEquityUsd);
    }
  }, [portfolio?.connected, portfolio?.totalEquityUsd]);

  // Sync risk % when macro briefing recommendation changes
  useEffect(() => {
    setCustomRiskPct(initialRiskPct);
  }, [initialRiskPct]);

  // Update entry and default stop loss when user switches pair
  useEffect(() => {
    if (currentEstimatedPrice > 0) {
      setEntryPrice(currentEstimatedPrice);
      // default 2% stop loss for crypto, 25 pips for FX, etc.
      if (selectedAssetClass === 'CRYPTO') {
        setStopLossPrice(Math.round(currentEstimatedPrice * 0.98 * 100) / 100);
      } else if (selectedAssetClass === 'FOREX') {
        const isJpy = currentEstimatedPrice > 50;
        const pips = isJpy ? 0.25 : 0.0025;
        setStopLossPrice(Math.round((currentEstimatedPrice - pips) * 10000) / 10000);
      } else {
        setStopLossPrice(Math.round(currentEstimatedPrice * 0.99 * 100) / 100);
      }
    }
  }, [selectedSymbol, currentEstimatedPrice, selectedAssetClass]);

  const calc = calculateMultiAssetPositionSize({
    assetClass: selectedAssetClass,
    accountBalance: balance,
    riskPct: isSitOnHands ? 0 : customRiskPct,
    entryPrice,
    stopLossPrice,
  });

  return (
    <section className="bg-[#080c16] border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-2xl backdrop-blur-xl font-mono">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="px-2 py-0.5 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-bold">
            PART 4
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-400" />
              DYNAMIC RISK MODIFIER & MULTI-ASSET POSITION SIZER
            </h2>
            <p className="text-[11px] text-slate-400">
              Institutional capital allocation limits synchronized with live portfolio equity & macro events
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {portfolio?.connected && (
            <span className="px-2.5 py-1 rounded-lg bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-[10px] font-bold flex items-center gap-1.5">
              <Wallet className="w-3 h-3 text-emerald-400" />
              <span>LIVE BINANCE EQUITY SYNCED</span>
            </span>
          )}
          <span
            className={`px-3 py-1 rounded-xl text-xs font-bold border ${
              isSitOnHands
                ? 'bg-red-950/90 border-red-500 text-red-200 animate-pulse'
                : 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300'
            }`}
          >
            {recommendation.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Hero Recommendation Banner */}
      <div
        className={`my-4 p-4 rounded-xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-3.5 ${
          isSitOnHands
            ? 'bg-gradient-to-r from-red-950/80 via-red-900/30 to-[#070b13] border-red-500'
            : 'bg-gradient-to-r from-emerald-950/80 via-emerald-900/20 to-[#070b13] border-emerald-500/60'
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center border shadow-lg ${
              isSitOnHands ? 'bg-red-500/20 border-red-500 text-red-400 animate-bounce' : 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
            }`}
          >
            {isSitOnHands ? <ShieldAlert className="w-6 h-6" /> : <Shield className="w-6 h-6" />}
          </div>
          <div>
            <div className="text-[10px] uppercase text-slate-400 font-bold">DESK RISK MANDATE</div>
            <div className={`text-xl font-extrabold uppercase ${isSitOnHands ? 'text-red-200' : 'text-emerald-200'}`}>
              {recommendation}
            </div>
          </div>
        </div>

        <div className="text-xs text-slate-300 max-w-lg md:text-right leading-relaxed">
          {riskRuleExplanation}
        </div>
      </div>

      {isBombDay && bombEventsFound.length > 0 && (
        <div className="mb-4 p-3.5 rounded-xl bg-red-950/40 border border-red-700/60 text-xs text-red-200 flex items-start gap-2.5">
          <AlertOctagon className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold uppercase text-red-300">TIER-1 VOLATILITY CATALYSTS:</span>{' '}
            {bombEventsFound.join(' • ')}
          </div>
        </div>
      )}

      {/* Position Sizer Card */}
      <div className="p-4 rounded-xl bg-[#05080f] border border-slate-800">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
          <div className="flex items-center gap-2 text-slate-200 text-xs font-bold">
            <Calculator className="w-4 h-4 text-amber-400" />
            <span>POSITION SIZER: {selectedSymbol} ({selectedAssetClass})</span>
          </div>
          <span className="text-[11px] text-slate-400">
            SL Distance: <span className="text-amber-300 font-bold">{calc.stopLossPct}%</span>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs mb-4">
          {/* Equity */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[10px] text-slate-400 uppercase font-bold block">
                Account Equity ($ USD)
              </label>
              {portfolio?.connected && (
                <button
                  type="button"
                  onClick={() => setBalance(portfolio.totalEquityUsd)}
                  className="text-[9px] text-emerald-400 hover:text-emerald-300 font-bold transition-colors cursor-pointer"
                  title="Sync to live Binance equity"
                >
                  Sync Binance (${portfolio.totalEquityUsd < 1 ? portfolio.totalEquityUsd.toFixed(2) : portfolio.totalEquityUsd.toLocaleString()})
                </button>
              )}
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-slate-500">
                <DollarSign className="w-3.5 h-3.5" />
              </span>
              <input
                type="number"
                min={0}
                step="any"
                value={balance}
                onChange={(e) => setBalance(parseFloat(e.target.value) || 0)}
                className="w-full bg-[#080d16] border border-slate-700 rounded-lg pl-7 pr-3 py-1.5 text-slate-100 font-bold focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Risk % */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[10px] text-slate-400 uppercase font-bold">Risk Per Trade (%)</label>
              <div className="flex items-center gap-1">
                {[0.25, 0.5, 1.0].map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setCustomRiskPct(v)}
                    className={`px-1.5 py-0.2 rounded text-[9px] font-bold cursor-pointer ${
                      customRiskPct === v ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {v}%
                  </button>
                ))}
              </div>
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-500 pointer-events-none">
                <Percent className="w-3.5 h-3.5" />
              </span>
              <input
                type="number"
                min={0}
                max={5}
                step={0.1}
                value={isSitOnHands ? 0 : customRiskPct}
                disabled={isSitOnHands}
                onChange={(e) => setCustomRiskPct(parseFloat(e.target.value) || 0)}
                className="w-full bg-[#080d16] border border-slate-700 rounded-lg px-3 py-1.5 text-slate-100 font-bold focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Entry Price */}
          <div>
            <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
              Entry Price ($)
            </label>
            <input
              type="number"
              step="any"
              value={entryPrice}
              onChange={(e) => setEntryPrice(parseFloat(e.target.value) || 0)}
              className="w-full bg-[#080d16] border border-slate-700 rounded-lg px-3 py-1.5 text-slate-100 font-bold focus:border-amber-500 focus:outline-none"
            />
          </div>

          {/* Stop Loss Price */}
          <div>
            <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
              Stop Loss Price ($)
            </label>
            <input
              type="number"
              step="any"
              value={stopLossPrice}
              onChange={(e) => setStopLossPrice(parseFloat(e.target.value) || 0)}
              className="w-full bg-[#080d16] border border-slate-700 rounded-lg px-3 py-1.5 text-slate-100 font-bold focus:border-amber-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Calculation Result Outputs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-3 border-t border-slate-800 text-xs">
          <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
            <div className="text-[10px] text-slate-500 uppercase">Capital at Risk</div>
            <div className="text-base font-bold text-red-400 mt-0.5">
              {calc.riskAmountUsd < 0.01 && calc.riskAmountUsd > 0
                ? `$${calc.riskAmountUsd.toFixed(4)}`
                : `$${calc.riskAmountUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            </div>
            <div className="text-[9px] text-slate-500">Fixed risk limit</div>
          </div>

          <div className="p-2.5 rounded-lg bg-amber-950/20 border border-amber-500/30">
            <div className="text-[10px] text-amber-400 uppercase font-bold">
              {selectedAssetClass === 'CRYPTO'
                ? 'Base Position Size'
                : selectedAssetClass === 'FOREX'
                ? 'Standard Lots'
                : 'Contracts / Units'}
            </div>
            <div className="text-base font-extrabold text-amber-300 mt-0.5">
              {isSitOnHands
                ? '0.00'
                : selectedAssetClass === 'FOREX'
                ? `${calc.standardLots} lots`
                : `${calc.positionSizeBase} ${selectedSymbol.split('/')[0]}`}
            </div>
            <div className="text-[9px] text-slate-400">
              Notional: ${calc.positionSizeNotionalUsd.toLocaleString()}
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
            <div className="text-[10px] text-slate-500 uppercase">
              {selectedAssetClass === 'CRYPTO' ? 'Effective Leverage' : 'Pip / Point Value'}
            </div>
            <div className="text-base font-bold text-slate-200 mt-0.5">
              {isSitOnHands
                ? '0x'
                : selectedAssetClass === 'CRYPTO'
                ? `${calc.effectiveLeverage}x`
                : `$${calc.pipValueUsd || 10}/pt`}
            </div>
            <div className="text-[9px] text-slate-500">Margin allocation</div>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
            <div className="text-[10px] text-slate-500 uppercase">
              {selectedAssetClass === 'CRYPTO' ? 'Est. Liquidation' : 'Risk/Reward Target'}
            </div>
            <div className="text-base font-bold text-emerald-400 mt-0.5">
              {isSitOnHands
                ? '-'
                : selectedAssetClass === 'CRYPTO'
                ? `$${calc.liquidationPriceEst?.toLocaleString() || '-'}`
                : '1 : 2.5 RR'}
            </div>
            <div className="text-[9px] text-slate-500">Liquidation buffer</div>
          </div>
        </div>
      </div>
    </section>
  );
};
