import React from 'react';
import { AlertTriangle, Clock, ShieldX, CheckCircle, Info, Globe, ExternalLink, ShieldCheck } from 'lucide-react';
import { isInsideNoTradeWindow, parseCetMinutes } from '../utils/deskRules';
import { EconomicEvent } from '../types/terminal';

interface Part1DangerZonesProps {
  events: EconomicEvent[];
  summary: string;
  currentCetTime: string;
  groundingSources?: Array<{ title: string; url: string }>;
}

export const Part1DangerZones: React.FC<Part1DangerZonesProps> = ({
  events,
  summary,
  currentCetTime,
  groundingSources,
}) => {
  const sortedEvents = [...events].sort(
    (a, b) => parseCetMinutes(a.timeCet) - parseCetMinutes(b.timeCet)
  );

  const activeBlackoutEvent = sortedEvents.find((e) =>
    isInsideNoTradeWindow(currentCetTime, e.noTradeWindowStart, e.noTradeWindowEnd)
  );

  return (
    <section className="bg-[#0b1019] border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-2xl backdrop-blur-xl">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="px-2.5 py-1 rounded-lg bg-red-500/20 border border-red-500/40 text-red-400 font-mono text-xs font-bold">
            PART 1
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold font-mono text-slate-100 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <span>RED FOLDER DANGER ZONES & NO-TRADE WINDOWS</span>
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-400 font-mono">
              High-Impact G8 economic releases with mandatory ±30 minute liquidity blackout windows
            </p>
          </div>
        </div>

        <div className="w-full sm:w-auto">
          {activeBlackoutEvent ? (
            <div className="px-3 py-1.5 rounded-xl bg-red-950/90 border border-red-500 text-red-200 font-mono text-xs font-bold flex items-center gap-2 animate-pulse shadow-lg shadow-red-500/20">
              <ShieldX className="w-4 h-4 text-red-400 flex-shrink-0" />
              <span className="truncate">BLACKOUT ACTIVE: {activeBlackoutEvent.event}</span>
            </div>
          ) : (
            <div className="px-3 py-1.5 rounded-xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 font-mono text-xs font-semibold flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>NO BLACKOUT ACTIVE ({currentCetTime} CET)</span>
            </div>
          )}
        </div>
      </div>

      <div className="my-4 p-3 sm:p-3.5 rounded-xl bg-red-950/30 border border-red-800/50 text-xs font-mono text-red-200 flex items-start gap-3">
        <Info className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <span className="font-bold text-red-300 uppercase">MANDATORY DESK PROTOCOL:</span> Zero new positions permitted during the 60-minute window (30 mins before to 30 mins after release). Institutional spreads widen and liquidity thins dramatically.
        </div>
      </div>

      {summary && (
        <p className="text-xs text-slate-300 font-mono mb-4 italic bg-slate-900/60 p-3 rounded-xl border border-slate-800 break-words">
          Executive Desk Summary: {summary}
        </p>
      )}

      {/* Responsive Horizontal Scroll Container for Table */}
      <div className="overflow-x-auto -mx-1 sm:mx-0">
        <table className="w-full text-left font-mono text-xs border-collapse min-w-[560px]">
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
                <td colSpan={6} className="py-6 text-center text-slate-400 font-mono">
                  <div className="flex flex-col items-center justify-center gap-1.5">
                    <ShieldCheck className="w-5 h-5 text-emerald-400" />
                    <span className="text-emerald-300 font-bold">CLEAN CALENDAR TODAY</span>
                    <span className="text-xs text-slate-500">Zero High-Impact Tier-1 red folder events scheduled. Standard liquidity parameters apply.</span>
                  </div>
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
                    <td className="py-3.5 px-3 font-bold text-amber-300">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                        <span>{ev.timeCet} CET</span>
                      </div>
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
                        <ShieldX className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
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

      {/* Live Grounding Sources Box at Bottom of Part 1 */}
      {groundingSources && groundingSources.length > 0 && (
        <div className="mt-5 pt-4 border-t border-slate-800">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>LIVE GROUNDING SOURCES & AUDIT TRAIL</span>
            </div>
            <span className="text-[10px] text-emerald-400 bg-emerald-950/70 border border-emerald-800/60 px-2 py-0.5 rounded font-mono">
              VERIFIED GOOGLE SEARCH CHUNKS
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-mono mb-3">
            Real URLs retrieved directly from live Google Search grounding queries for today's economic docket. Click to audit live release calendar at source.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {groundingSources.map((source, i) => (
              <a
                key={i}
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-amber-300 text-[11px] font-mono transition-colors group cursor-pointer"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Globe className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-400 flex-shrink-0" />
                  <span className="truncate">{source.title || source.url}</span>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-200 flex-shrink-0 ml-1.5" />
              </a>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};
