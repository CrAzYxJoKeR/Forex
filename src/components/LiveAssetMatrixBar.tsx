import React, { useState, useEffect } from 'react';
import { ArrowUpRight, ArrowDownRight, Radio } from 'lucide-react';

interface LiveAssetMatrixBarProps {
  fxRates: Record<string, number>;
  selectedSymbol: string;
  onSelectSymbol: (symbol: string, tvSymbol: string, assetClass: 'CRYPTO' | 'FOREX' | 'COMMODITIES') => void;
}

interface CryptoTickerData {
  symbol: string;
  price: number;
  changePct: number;
}

export const LiveAssetMatrixBar: React.FC<LiveAssetMatrixBarProps> = ({
  fxRates,
  selectedSymbol,
  onSelectSymbol,
}) => {
  const [cryptoPrices, setCryptoPrices] = useState<Record<string, CryptoTickerData>>({
    BTCUSDT: { symbol: 'BTCUSDT', price: 67800, changePct: 1.25 },
    ETHUSDT: { symbol: 'ETHUSDT', price: 2540, changePct: -0.45 },
    SOLUSDT: { symbol: 'SOLUSDT', price: 178.5, changePct: 3.10 },
    BNBUSDT: { symbol: 'BNBUSDT', price: 595.2, changePct: 0.85 },
    XRPUSDT: { symbol: 'XRPUSDT', price: 0.524, changePct: -1.15 },
    PAXGUSDT: { symbol: 'PAXGUSDT', price: 2745, changePct: 0.42 }, // Tokenized Gold
  });
  const [wsConnected, setWsConnected] = useState<boolean>(false);

  // Connect to Binance live WebSocket stream
  useEffect(() => {
    const streams = [
      'btcusdt@miniTicker',
      'ethusdt@miniTicker',
      'solusdt@miniTicker',
      'bnbusdt@miniTicker',
      'xrpusdt@miniTicker',
      'paxgusdt@miniTicker',
    ].join('/');

    const wsUrl = `wss://stream.binance.com:9443/ws/${streams}`;
    let ws: WebSocket | null = null;
    let reconnectTimeout: any = null;

    const connect = () => {
      try {
        ws = new WebSocket(wsUrl);

        ws.onopen = () => {
          setWsConnected(true);
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data && data.s && data.c) {
              const current = parseFloat(data.c);
              const open = parseFloat(data.o);
              const changePct = open > 0 ? ((current - open) / open) * 100 : 0;

              setCryptoPrices((prev) => ({
                ...prev,
                [data.s]: {
                  symbol: data.s,
                  price: current,
                  changePct: Math.round(changePct * 100) / 100,
                },
              }));
            }
          } catch (e) {
            // Ignore parse errors
          }
        };

        ws.onclose = () => {
          setWsConnected(false);
          reconnectTimeout = setTimeout(connect, 3000);
        };

        ws.onerror = () => {
          ws?.close();
        };
      } catch (err) {
        console.warn('Binance WebSocket connect notice:', err);
      }
    };

    connect();

    return () => {
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      ws?.close();
    };
  }, []);

  const items = [
    // Binance Crypto Live Stream
    {
      label: 'BTC/USDT',
      rawSymbol: 'BTCUSDT',
      tvSymbol: 'BINANCE:BTCUSDT',
      price: cryptoPrices.BTCUSDT?.price ? `$${cryptoPrices.BTCUSDT.price.toLocaleString()}` : '$67,800',
      change: `${cryptoPrices.BTCUSDT?.changePct >= 0 ? '+' : ''}${cryptoPrices.BTCUSDT?.changePct?.toFixed(2) || '0.00'}%`,
      isPos: (cryptoPrices.BTCUSDT?.changePct || 0) >= 0,
      assetClass: 'CRYPTO' as const,
      isLiveWs: true,
    },
    {
      label: 'ETH/USDT',
      rawSymbol: 'ETHUSDT',
      tvSymbol: 'BINANCE:ETHUSDT',
      price: cryptoPrices.ETHUSDT?.price ? `$${cryptoPrices.ETHUSDT.price.toLocaleString()}` : '$2,540',
      change: `${cryptoPrices.ETHUSDT?.changePct >= 0 ? '+' : ''}${cryptoPrices.ETHUSDT?.changePct?.toFixed(2) || '0.00'}%`,
      isPos: (cryptoPrices.ETHUSDT?.changePct || 0) >= 0,
      assetClass: 'CRYPTO' as const,
      isLiveWs: true,
    },
    {
      label: 'SOL/USDT',
      rawSymbol: 'SOLUSDT',
      tvSymbol: 'BINANCE:SOLUSDT',
      price: cryptoPrices.SOLUSDT?.price ? `$${cryptoPrices.SOLUSDT.price.toFixed(2)}` : '$178.50',
      change: `${cryptoPrices.SOLUSDT?.changePct >= 0 ? '+' : ''}${cryptoPrices.SOLUSDT?.changePct?.toFixed(2) || '0.00'}%`,
      isPos: (cryptoPrices.SOLUSDT?.changePct || 0) >= 0,
      assetClass: 'CRYPTO' as const,
      isLiveWs: true,
    },
    {
      label: 'XAU (Gold)',
      rawSymbol: 'XAUUSD',
      tvSymbol: 'OANDA:XAUUSD',
      price: cryptoPrices.PAXGUSDT?.price ? `$${cryptoPrices.PAXGUSDT.price.toFixed(1)}` : '$2,745.0',
      change: `${cryptoPrices.PAXGUSDT?.changePct >= 0 ? '+' : ''}${cryptoPrices.PAXGUSDT?.changePct?.toFixed(2) || '+0.42'}%`,
      isPos: (cryptoPrices.PAXGUSDT?.changePct || 0) >= 0,
      assetClass: 'COMMODITIES' as const,
      isLiveWs: true,
    },
    // Live Inverted FX Spot
    {
      label: 'EUR/USD',
      rawSymbol: 'EUR/USD',
      tvSymbol: 'FX:EURUSD',
      price: fxRates['EUR/USD'] ? fxRates['EUR/USD'].toFixed(4) : '1.0852',
      change: '+0.12%',
      isPos: true,
      assetClass: 'FOREX' as const,
      isLiveWs: false,
    },
    {
      label: 'GBP/USD',
      rawSymbol: 'GBP/USD',
      tvSymbol: 'FX:GBPUSD',
      price: fxRates['GBP/USD'] ? fxRates['GBP/USD'].toFixed(4) : '1.2945',
      change: '+0.08%',
      isPos: true,
      assetClass: 'FOREX' as const,
      isLiveWs: false,
    },
    {
      label: 'USD/JPY',
      rawSymbol: 'USD/JPY',
      tvSymbol: 'FX:USDJPY',
      price: fxRates['USD/JPY'] ? fxRates['USD/JPY'].toFixed(2) : '153.25',
      change: '-0.24%',
      isPos: false,
      assetClass: 'FOREX' as const,
      isLiveWs: false,
    },
  ];

  return (
    <div className="bg-[#070b14]/90 backdrop-blur-md border-b border-slate-800/80 px-3 py-1.5 overflow-x-auto select-none scrollbar-none">
      <div className="max-w-7xl mx-auto flex items-center gap-2 min-w-max">
        <div className="flex items-center gap-1.5 text-[10px] font-mono pr-2 border-r border-slate-800">
          <Radio className={`w-3 h-3 ${wsConnected ? 'text-emerald-400 animate-pulse' : 'text-amber-400'}`} />
          <span className="text-slate-400 uppercase font-bold">
            {wsConnected ? 'BINANCE SUB-SEC WS' : 'CONNECTING...'}
          </span>
        </div>

        {items.map((item) => {
          const isSelected = selectedSymbol === item.label || selectedSymbol === item.rawSymbol;
          return (
            <button
              key={item.label}
              type="button"
              onClick={() => onSelectSymbol(item.label, item.tvSymbol, item.assetClass)}
              className={`flex items-center gap-2.5 px-2.5 py-1 rounded-lg border font-mono text-xs transition-all cursor-pointer ${
                isSelected
                  ? 'bg-amber-500/20 border-amber-500 text-amber-200 ring-1 ring-amber-500/50 shadow-sm'
                  : 'bg-slate-900/60 border-slate-800/90 text-slate-300 hover:border-slate-700 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-1">
                <span className="font-bold text-slate-100 text-[11px]">{item.label}</span>
                {item.isLiveWs && (
                  <span className="w-1 h-1 rounded-full bg-emerald-400 inline-block" />
                )}
              </div>

              <div className="flex items-center gap-1 text-[11px]">
                <span className="font-bold text-slate-200">{item.price}</span>
                <span
                  className={`text-[9px] flex items-center ${
                    item.isPos ? 'text-emerald-400' : 'text-red-400'
                  }`}
                >
                  {item.isPos ? <ArrowUpRight className="w-2.5 h-2.5" /> : <ArrowDownRight className="w-2.5 h-2.5" />}
                  {item.change}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
