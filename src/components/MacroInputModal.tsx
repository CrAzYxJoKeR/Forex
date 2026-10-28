import React, { useState } from 'react';
import { FileText, Sparkles, X } from 'lucide-react';

interface MacroInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitPrompt: (rawCalendarText: string) => void;
}

export const MacroInputModal: React.FC<MacroInputModalProps> = ({ isOpen, onClose, onSubmitPrompt }) => {
  const [rawText, setRawText] = useState<string>('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rawText.trim()) return;
    onSubmitPrompt(rawText.trim());
    onClose();
  };

  const handleLoadPreset = (presetText: string) => {
    setRawText(presetText);
  };

  const presets = [
    {
      title: 'Tier-1 Volatility Bomb (FOMC & CPI -> 0% Sit on Hands)',
      text: `14:30 USD US Core CPI m/m (Forecast 0.3%, Previous 0.3%)\n14:30 USD US Consumer Price Index y/y (Forecast 2.9%)\n20:00 USD FOMC Statement & Fed Rate Decision (Target Rate 5.25%)\n20:30 USD Fed Chair Powell Press Conference`,
    },
    {
      title: 'High-Impact European Docket (ECB & PMIs -> 0.5% Half Risk)',
      text: `08:00 EUR German Flash Manufacturing PMI (Forecast 43.1, Previous 42.6)\n10:30 GBP UK Services PMI (Forecast 52.5, Previous 52.4)\n14:15 EUR ECB Monetary Policy Statement & Rate Decision\n14:45 EUR ECB President Lagarde Press Conference\n16:00 USD ISM Manufacturing PMI`,
    },
    {
      title: 'Clean Calendar Docket (1.0% Standard Risk)',
      text: `08:45 EUR French Consumer Spending m/m (Impact LOW)\n10:00 EUR Italian Trade Balance (Impact LOW)\n11:00 EUR Eurozone Industrial Production (Impact LOW)\n15:00 USD Final Wholesale Inventories m/m (Impact LOW)`,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0b1019] border border-slate-700 rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative font-mono text-slate-100">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-100 p-1 rounded-lg bg-slate-900 border border-slate-800 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-amber-400 font-bold text-sm mb-2">
          <FileText className="w-5 h-5" />
          <span>PASTE RAW ECONOMIC CALENDAR / MACRO RSS FEED</span>
        </div>
        <p className="text-xs text-slate-400 mb-3 leading-relaxed">
          Paste today's raw ForexFactory / Investing.com economic calendar text or pick a preset scenario below. The desk engine parses release times, currencies, and computes deterministic ±30m No-Trade Windows and Risk Modifiers.
        </p>

        {/* Quick Presets */}
        <div className="mb-4 space-y-1.5">
          <div className="text-[10px] text-slate-500 uppercase font-bold">1-Click Presets:</div>
          <div className="flex flex-wrap gap-2">
            {presets.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleLoadPreset(p.text)}
                className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-amber-500/50 text-[10px] text-slate-300 font-bold transition-all cursor-pointer text-left"
              >
                {p.title}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea
            rows={7}
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            placeholder="e.g. 14:30 USD Core PCE Price Index m/m (Forecast 0.3%, Previous 0.2%). 10:00 EUR ECB Lagarde Speech..."
            className="w-full bg-[#070b13] border border-slate-700 rounded-xl p-3.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-500 font-mono resize-none leading-relaxed"
          />

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-bold border border-slate-700 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>PARSE & COMPUTE BRIEFING</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
