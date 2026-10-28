import React, { useEffect, useRef, useState } from 'react';
import { BarChart2, Maximize2, Layers } from 'lucide-react';
import { AssetClass } from '../types/terminal';

interface TradingViewChartProps {
  currentSymbol: string;
  currentTvSymbol: string;
  currentAssetClass: AssetClass;
  onSelectPair: (symbol: string, tvSymbol: string, assetClass: AssetClass) => void;
}

const ASSET_CATALOG: Record<
  AssetClass,
  { label: string; tvSymbol: string; sub: string }[]
> = {
  CRYPTO: [
    { label: 'BTC/USDT', tvSymbol: 'BINANCE:BTCUSDT', sub: 'Bitcoin' },
    { label: 'ETH/USDT', tvSymbol: 'BINANCE:ETHUSDT', sub: 'Ethereum' },
    { label: 'SOL/USDT', tvSymbol: 'BINANCE:SOLUSDT', sub: 'Solana' },
    { label: 'BNB/USDT', tvSymbol: 'BINANCE:BNBUSDT', sub: 'BNB' },
  ],
  FOREX: [
    { label: 'EUR/USD', tvSymbol: 'FX:EURUSD', sub: 'Euro / Dollar' },
    { label: 'GBP/USD', tvSymbol: 'FX:GBPUSD', sub: 'Cable' },
    { label: 'USD/JPY', tvSymbol: 'FX:USDJPY', sub: 'Dollar / Yen' },
    { label: 'USD/CHF', tvSymbol: 'FX:USDCHF', sub: 'Dollar / Swiss' },
    { label: 'AUD/USD', tvSymbol: 'FX:AUDUSD', sub: 'Aussie / Dollar' },
  ],
  COMMODITIES: [
    { label: 'XAU/USD', tvSymbol: 'OANDA:XAUUSD', sub: 'Gold Spot' },
    { label: 'XAG/USD', tvSymbol: 'OANDA:XAGUSD', sub: 'Silver Spot' },
    { label: 'USOIL', tvSymbol: 'TVC:USOIL', sub: 'WTI Crude' },
  ],
  INDICES: [
    { label: 'NAS100', tvSymbol: 'NASDAQ:NDX', sub: 'Nasdaq 100' },
    { label: 'S&P 500', tvSymbol: 'SP:SPX', sub: 'S&P 500' },
    { label: 'US30', tvSymbol: 'DJ:DJI', sub: 'Dow Jones' },
    { label: 'GER40', tvSymbol: 'XETR:DAX', sub: 'Dax Index' },
  ],
  STOCKS: [
    { label: 'NVDA', tvSymbol: 'NASDAQ:NVDA', sub: 'Nvidia' },
    { label: 'AAPL', tvSymbol: 'NASDAQ:AAPL', sub: 'Apple' },
    { label: 'TSLA', tvSymbol: 'NASDAQ:TSLA', sub: 'Tesla' },
    { label: 'MSFT', tvSymbol: 'NASDAQ:MSFT', sub: 'Microsoft' },
  ],
};

export const TradingViewChart: React.FC<TradingViewChartProps> = ({
  currentSymbol,
  currentTvSymbol,
  currentAssetClass,
  onSelectPair,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeAssetTab, setActiveAssetTab] = useState<AssetClass>(currentAssetClass);

  useEffect(() => {
    setActiveAssetTab(currentAssetClass);
  }, [currentAssetClass]);

  // Load official TradingView Advanced Chart widget script
  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.innerHTML = '';

    const widgetDiv = document.createElement('div');
    widgetDiv.className = 'tradingview-widget-container__widget';
    widgetDiv.style.height = '100%';
    widgetDiv.style.width = '100%';
    containerRef.current.appendChild(widgetDiv);

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
    script.type = 'text/javascript';
    script.async = true;
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol: currentTvSymbol,
      interval: '15',
      timezone: 'Europe/Paris',
      theme: 'dark',
      style: '1',
      locale: 'en',
      allow_symbol_change: true,
      calendar: false,
      hide_top_toolbar: false,
      hide_legend: false,
      save_image: false,
      support_host: 'https://www.tradingview.com',
    });

    containerRef.current.appendChild(script);
  }, [currentTvSymbol]);

  const assetClasses: AssetClass[] = ['CRYPTO', 'FOREX', 'COMMODITIES', 'INDICES', 'STOCKS'];

  return (
    <div className="bg-[#080c16] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col h-[480px]">
      {/* Top Bar: Asset Class Tabs & Pair Quick Switchers */}
      <div className="px-3 py-2 bg-[#0a0f1c] border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 font-mono text-xs">
        {/* Asset Class Category Tabs */}
        <div className="flex items-center gap-1 bg-[#060912] p-1 rounded-xl border border-slate-800">
          {assetClasses.map((ac) => (
            <button
              key={ac}
              type="button"
              onClick={() => {
                setActiveAssetTab(ac);
                const first = ASSET_CATALOG[ac][0];
                if (first) onSelectPair(first.label, first.tvSymbol, ac);
              }}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-wider transition-all cursor-pointer ${
                activeAssetTab === ac
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {ac}
            </button>
          ))}
        </div>

        {/* Individual Symbol Selectors for Active Asset Class */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          {ASSET_CATALOG[activeAssetTab]?.map((item) => {
            const isSelected = currentTvSymbol === item.tvSymbol || currentSymbol === item.label;
            return (
              <button
                key={item.tvSymbol}
                type="button"
                onClick={() => onSelectPair(item.label, item.tvSymbol, activeAssetTab)}
                className={`px-2 py-0.5 rounded-lg border text-[10px] font-bold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-amber-500/20 border-amber-500 text-amber-200 ring-1 ring-amber-500/40'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        {/* Live Active Feed Indicator */}
        <div className="hidden sm:flex items-center gap-2 text-slate-400 text-[11px]">
          <BarChart2 className="w-3.5 h-3.5 text-amber-400" />
          <span className="font-bold text-slate-200">{currentTvSymbol}</span>
        </div>
      </div>

      {/* TradingView Chart Frame */}
      <div className="flex-1 w-full relative tradingview-widget-container" ref={containerRef} />
    </div>
  );
};
