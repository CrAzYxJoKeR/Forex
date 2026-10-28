import React, { useState } from 'react';
import { KeyRound, ShieldCheck, X, AlertTriangle, ExternalLink, RefreshCw, Trash2 } from 'lucide-react';
import { BinancePortfolio } from '../types/terminal';

interface BinanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  portfolio: BinancePortfolio | null;
  onSaveCredentials: (key: string, secret: string) => Promise<void>;
  onDisconnect: () => void;
  isLoading: boolean;
  onLoadDemoPortfolio?: () => void;
}

export const BinanceModal: React.FC<BinanceModalProps> = ({
  isOpen,
  onClose,
  portfolio,
  onSaveCredentials,
  onDisconnect,
  isLoading,
  onLoadDemoPortfolio,
}) => {
  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim() || !apiSecret.trim()) {
      setErrorMsg('Both API Key and Secret are required.');
      return;
    }
    setErrorMsg(null);
    try {
      await onSaveCredentials(apiKey.trim(), apiSecret.trim());
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to authenticate Binance API');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 font-mono text-slate-100">
      <div className="bg-[#090d16] border border-amber-500/30 rounded-2xl max-w-xl w-full p-6 shadow-2xl relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-100 p-1 rounded-lg bg-slate-900 border border-slate-800 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5 text-amber-400 font-bold text-sm mb-2">
          <KeyRound className="w-5 h-5" />
          <span>CONNECT BINANCE READ-ONLY API</span>
        </div>

        <p className="text-xs text-slate-300 mb-4 leading-relaxed">
          Securely link your Binance Spot & USD-M Futures balances into the institutional Risk & Position Sizer.
        </p>

        {/* Security Notice Callout */}
        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-start gap-2.5 mb-5">
          <ShieldCheck className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-bold uppercase tracking-wider text-amber-300">
              100% READ-ONLY SECURITY PROTOCOL
            </div>
            <p className="text-[11px] text-slate-300 leading-normal">
              Only enable <span className="text-amber-300 font-bold">"Can Read"</span> permission on your Binance API Key management page. Never enable "Enable Spot & Margin Trading" or "Enable Withdrawals". Keys are stored solely in your local browser storage.
            </p>
          </div>
        </div>

        {portfolio?.connected ? (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  API STATUS: CONNECTED & VERIFIED
                </span>
                <span className="text-slate-400 text-[11px]">Key: {portfolio.keyMasked}</span>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-slate-800 text-xs">
                <div>
                  <div className="text-[10px] text-slate-500 uppercase">Live Total Equity</div>
                  <div className="text-base font-bold text-slate-100 mt-0.5">
                    ${portfolio.totalEquityUsd.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 uppercase">Unrealized PnL</div>
                  <div className={`text-base font-bold mt-0.5 ${portfolio.unrealizedPnlUsd >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    ${portfolio.unrealizedPnlUsd >= 0 ? `+${portfolio.unrealizedPnlUsd}` : portfolio.unrealizedPnlUsd}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <button
                type="button"
                onClick={onDisconnect}
                className="px-4 py-2 rounded-xl bg-red-950/80 hover:bg-red-900 border border-red-700/60 text-red-200 text-xs font-bold flex items-center gap-2 cursor-pointer transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>Disconnect API</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMsg && (
              <div className="p-3 rounded-lg bg-red-950/60 border border-red-500 text-red-200 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div>
              <label className="text-[11px] text-slate-400 uppercase block mb-1.5 font-bold">
                Binance Read-Only API Key
              </label>
              <input
                type="text"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Paste your 64-character Binance API Key"
                className="w-full bg-[#05080f] border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="text-[11px] text-slate-400 uppercase block mb-1.5 font-bold">
                Binance API Secret
              </label>
              <input
                type="password"
                value={apiSecret}
                onChange={(e) => setApiSecret(e.target.value)}
                placeholder="Paste your Binance API Secret"
                className="w-full bg-[#05080f] border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="pt-2 flex items-center justify-between">
              <a
                href="https://www.binance.com/en/my/settings/api-management"
                target="_blank"
                rel="noreferrer"
                className="text-amber-400 hover:text-amber-300 text-[11px] flex items-center gap-1 underline underline-offset-2"
              >
                <span>Create Read-Only Key on Binance</span>
                <ExternalLink className="w-3 h-3" />
              </a>

              <div className="flex gap-2.5">
                {onLoadDemoPortfolio && (
                  <button
                    type="button"
                    onClick={() => {
                      onLoadDemoPortfolio();
                      onClose();
                    }}
                    className="px-3 py-2 rounded-xl bg-emerald-950/70 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-300 text-xs font-bold cursor-pointer"
                  >
                    Load Demo ($75k)
                  </button>
                )}
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-bold border border-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-2 cursor-pointer shadow-lg shadow-amber-500/20"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <span>Authenticate & Bind</span>
                  )}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
