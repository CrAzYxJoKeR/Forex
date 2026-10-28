import React from 'react';
import { AlertTriangle, Clock, ShieldX, CheckCircle, Info } from 'lucide-react';
import { EconomicEvent, isInsideNoTradeWindow, parseCetMinutes } from '../utils/deskRules';

interface Part1DangerZonesProps {
  events: EconomicEvent[];
  summary: string;
  currentCetTime: string;
}

export const Part1DangerZones: React.FC<Part1DangerZonesProps> = ({ events, summary, currentCetTime }) => {
  const sortedEvents = [...events].sort(
    (a, b) => parseCetMinutes(a.timeCet) - parseCetMinutes(b.timeCet)
  );

  const activeBlackoutEvent = sortedEvents.find((e) =>
    isInsideNoTradeWindow(currentCetTime, e.noTradeWindowStart, e.noTradeWindowEnd)
  );

  return (
    <section className="bg-[#0b1019] border border-slate-800 rounded-2xl p-6 shadow-2xl backdrop-blur-xl">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="px-2.5 py-1 rounded-lg bg-red-500/20 border border-red-500/40 text-red-400 font-mono text-xs font-bold">
            PART 1
          </div>
          <div>
            <h2 className="text-base font-bold font-mono text-slate-100 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              RED FOLDER DANGER ZONES & NO-TRADE WINDOWS
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              High-Impact G8 economic releases with mandatory ±30 minute liquidity blackout windows
            </p>
          </div>
        </div>

        <div>
          {activeBlackoutEvent ? (
            <div className="px-3.5 py-1.5 rounded-xl bg-red-950/90 border border-red-500 text-red-200 font-mono text-xs font-bold flex items-center gap-2 animate-pulse shadow-lg shadow-red-500/20">
              <ShieldX className="w-4 h-4 text-red-400" />
              <span>BLACKOUT ACTIVE: {activeBlackoutEvent.event.substring(0, 26)}...</span>
            </div>
          ) : (
            <div className="px-3.5 py-1.5 rounded-xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 font-mono text-xs font-semibold flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>NO BLACKOUT ACTIVE ({currentCetTime} CET)</span>
            </div>
          )}
        </div>
      </div>

      <div className="my-4 p-3.5 rounded-xl bg-red-950/30 border border-red-800/50 text-xs font-mono text-red-200 flex items-start gap-3">
        <Info className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-red-300 uppercase">MANDATORY DESK PROTOCOL:</span> Zero new positions permitted during the 60-minute window (30 mins before to 30 mins after release). Institutional spreads widen and liquidity thins dramatically.
        </div>
      </div>

      {summary && (
        <p className="text-xs text-slate-300 font-mono mb-4 italic bg-slate-900/60 p-3 rounded-xl border border-slate-800">
          Executive Desk Summary: {summary}
        </p>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left font-mono text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 uppercase text-[11px] bg-slate-900/40">
              <th className="py-3 px-3">Currency</th>
              <th className="py-3 px-3">Release (CET)</th>
              <th className="py-3 px-3">Economic Event</th>
              <th className="py-3 px-3">No-Trade Window</th>
              <th className="py-3 px-3">Forecast / Prev</th>
              <th className="py-3 px-3 text-right">Window Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {sortedEvents.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-6 text-center text-slate-500 font-mono">
                  Clean economic calendar today. Standard liquidity parameters apply.
                </td>
              </tr>
            ) : (
              sortedEvents.map((ev) => {
                const isBlackout = isInsideNoTradeWindow(currentCetTime, ev.noTradeWindowStart, ev.noTradeWindowEnd);
                const curMin = parseCetMinutes(currentCetTime);
                const startMin = parseCetMinutes(ev.noTradeWindowStart);
                const isPassed = curMin > parseCetMinutes(ev.noTradeWindowEnd);

                return (
                  <tr
                    key={ev.id}
                    className={`transition-colors ${
                      isBlackout ? 'bg-red-950/50 border-l-4 border-l-red-500' : 'hover:bg-slate-900/40'
                    }`}
                  >
                    <td className="py-3.5 px-3">
                      <span className="inline-block px-2.5 py-1 rounded-lg font-bold text-[11px] bg-slate-900 text-amber-300 border border-slate-700">
                        {ev.currency}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 font-bold text-amber-300 flex items-center gap-1.5 pt-4">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      <span>{ev.timeCet} CET</span>
                    </td>
                    <td className="py-3.5 px-3">
                      <div className="font-semibold text-slate-100">{ev.event}</div>
                      <div className="text-[10px] text-red-400 font-bold mt-0.5 uppercase">
                        {ev.impact} IMPACT RED FOLDER
                      </div>
                    </td>
                    <td className="py-3.5 px-3">
                      <div
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-bold ${
                          isBlackout
                            ? 'bg-red-900/80 text-red-100 border border-red-500 animate-pulse'
                            : 'bg-slate-900 text-slate-300 border border-slate-700'
                        }`}
                      >
                        <ShieldX className="w-3.5 h-3.5 text-red-400" />
                        <span>{ev.noTradeWindowStart} - {ev.noTradeWindowEnd} CET</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-3 text-slate-300 text-[11px]">
                      <div>F: <span className="text-slate-100">{ev.forecast || '-'}</span></div>
                      <div className="text-slate-500">P: {ev.previous || '-'}</div>
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      {isBlackout ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-red-600 text-white font-bold text-[10px] uppercase shadow-md shadow-red-600/30 animate-pulse">
                          ● BLACKOUT ACTIVE
                        </span>
                      ) : isPassed ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 text-slate-400 text-[10px] uppercase">
                          PASSED
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-amber-950/40 border border-amber-700/40 text-amber-300 text-[10px] uppercase">
                          IN {Math.max(0, startMin - curMin)}M
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};
