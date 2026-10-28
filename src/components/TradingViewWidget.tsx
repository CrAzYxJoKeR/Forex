import React, { useEffect, useRef } from 'react';
import { BarChart2, Maximize2 } from 'lucide-react';

interface TradingViewWidgetProps {
  symbol?: string; // e.g. "EURUSD", "GBPUSD", "USDJPY"
}

export const TradingViewWidget: React.FC<TradingViewWidgetProps> = ({ symbol = 'EURUSD' }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Clean symbol for TradingView (e.g. "EUR/USD" -> "FX:EURUSD")
  const tvSymbol = `FX:${symbol.replace('/', '')}`;

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
      symbol: tvSymbol,
      interval: '15',
      timezone: 'Europe/Paris',
      theme: 'dark',
      style: '1',
      locale: 'en',
      allow_symbol_change: true,
      calendar: false,
      support_host: 'https://www.tradingview.com',
    });

    containerRef.current.appendChild(script);
  }, [tvSymbol]);

  return (
    <div className="bg-[#090e18] border border-slate-800 rounded-xl overflow-hidden shadow-2xl flex flex-col h-[480px]">
      {/* Widget Header */}
      <div className="px-4 py-3 bg-[#0d1320] border-b border-slate-800 flex items-center justify-between font-mono text-xs">
        <div className="flex items-center gap-2 text-slate-200 font-bold">
          <BarChart2 className="w-4 h-4 text-amber-400" />
          <span>INSTITUTIONAL ORDER FLOW & CHART:</span>
          <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
            {symbol}
          </span>
        </div>
        <div className="flex items-center gap-3 text-slate-400 text-[11px]">
          <span>TradingView Advanced Feed</span>
          <Maximize2 className="w-3.5 h-3.5 cursor-pointer hover:text-slate-200" />
        </div>
      </div>

      {/* TradingView Container */}
      <div className="flex-1 w-full relative tradingview-widget-container" ref={containerRef} />
    </div>
  );
};
