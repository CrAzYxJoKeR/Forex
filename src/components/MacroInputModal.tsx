import React, { useState } from 'react';
import { FileText, Sparkles, X } from 'lucide-react';

interface MacroInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitPrompt: (promptText: string) => void;
}

export const MacroInputModal: React.FC<MacroInputModalProps> = ({ isOpen, onClose, onSubmitPrompt }) => {
  const [rawText, setRawText] = useState<string>('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rawText.trim()) return;
    onSubmitPrompt(`Analyze this raw calendar / macro text and generate the G10 Forex briefing: "${rawText.trim()}"`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0b1019] border border-slate-700 rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative font-mono text-slate-100">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-100 p-1 rounded-lg bg-slate-900 border border-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-amber-400 font-bold text-sm mb-2">
          <FileText className="w-5 h-5" />
          <span>PASTE RAW ECONOMIC CALENDAR / MACRO RSS FEED</span>
        </div>
        <p className="text-xs text-slate-400 mb-4 leading-relaxed">
          Paste today's raw ForexFactory / Investing.com economic calendar or central bank press release text below. The AI Macro Engine will parse release times, impact levels, and compute the 4-part desk briefing.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea
            rows={8}
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            placeholder="e.g. 14:30 USD Core PCE Price Index m/m (Forecast 0.3%, Previous 0.2%). 10:00 EUR ECB Lagarde Speech..."
            className="w-full bg-[#070b13] border border-slate-700 rounded-xl p-4 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-500 font-mono resize-none"
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
