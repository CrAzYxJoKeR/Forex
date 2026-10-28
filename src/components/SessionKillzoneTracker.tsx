import React, { useState, useEffect } from 'react';
import { Clock, Sun, Moon, Shield, Globe, Activity } from 'lucide-react';

interface SessionKillzoneTrackerProps {
  activeBlackout: boolean;
  blackoutEventTitle?: string;
}

export const SessionKillzoneTracker: React.FC<SessionKillzoneTrackerProps> = ({
  activeBlackout,
  blackoutEventTitle,
}) => {
  const [time, setTime] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (timeZone: string) => {
    return new Intl.DateTimeFormat('en-GB', {
      timeZone,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }).format(time);
  };

  const cetHour = parseInt(
    new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Europe/Paris',
      hour: '2-digit',
      hour12: false,
    }).format(time),
    10
  );

  const cetMinute = parseInt(
    new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Europe/Paris',
      minute: '2-digit',
      hour12: false,
    }).format(time),
    10
  );

  const totalMinutes = cetHour * 60 + cetMinute;

  // Killzones in CET minutes
  // Asia Range: 00:00 - 08:00 (0..480)
  // London Open Killzone: 08:00 - 11:00 (480..660)
  // New York Overlap: 14:00 - 17:00 (840..1020)
  // London Close: 16:00 - 18:00 (960..1080)
  const isAsia = totalMinutes >= 0 && totalMinutes < 480;
  const isLondonKillzone = totalMinutes >= 480 && totalMinutes < 660;
  const isNyOverlap = totalMinutes >= 840 && totalMinutes < 1020;
  const isLondonClose = totalMinutes >= 960 && totalMinutes < 1080;

  // Calculate day progress percentage (0..1440 mins)
  const dayProgressPct = Math.min(100, Math.max(0, (totalMinutes / 1440) * 100));

  return (
    <header className="border-b border-slate-800 bg-[#070b13] text-slate-200 select-none shadow-xl">
      {/* Red Folder Danger Window Banner */}
      {activeBlackout && (
        <div className="bg-red-950/90 border-b border-red-500/80 px-4 py-2 text-center text-xs text-red-100 flex items-center justify-center gap-2 font-mono font-bold animate-pulse">
          <Shield className="w-4 h-4 text-red-400" />
          <span>MANDATORY NO-TRADE BLACKOUT ACTIVE:</span>
          <span className="text-white bg-red-600/80 px-2 py-0.5 rounded">
            {blackoutEventTitle || 'HIGH-IMPACT RED FOLDER NEWS RELEASE'}
          </span>
          <span className="text-red-300">| SPREAD WIDENING & SLIPPAGE HAZARD</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Title & Desk Identification */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-600/5 border border-amber-500/40 flex items-center justify-center shadow-lg shadow-amber-500/10">
            <Activity className="w-5 h-5 text-amber-400 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-mono text-base font-extrabold tracking-wider text-slate-100 uppercase">
                G10 Forex Macro & Risk Desk
              </h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 font-bold">
                INSTITUTIONAL
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono flex items-center gap-2 mt-0.5">
              <span>LIVE G8 ORDER FLOW & RISK MANAGEMENT</span>
              <span className="text-slate-600">•</span>
              <span className="text-emerald-400 flex items-center gap-1 font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
                DESK ONLINE
              </span>
            </p>
          </div>
        </div>

        {/* Global Multi-Market Clocks (CET, London, NY, Tokyo) */}
        <div className="flex items-center gap-2 bg-[#0b1019] border border-slate-800 rounded-xl p-1.5 font-mono text-xs">
          <div className="px-3 py-1 rounded-lg bg-amber-500/15 border border-amber-500/40 text-amber-300">
            <div className="text-[10px] uppercase font-bold text-amber-400 flex items-center gap-1">
              <Clock className="w-3 h-3" /> CET (Desk)
            </div>
            <div className="text-sm font-extrabold tracking-tight text-amber-200">
              {formatTime('Europe/Paris')}
            </div>
          </div>

          <div className="px-2.5 py-1 rounded bg-slate-900/80 border border-slate-800 text-slate-300">
            <div className="text-[10px] uppercase text-slate-400">London (GMT)</div>
            <div className="text-xs font-semibold text-slate-200">{formatTime('Europe/London')}</div>
          </div>

          <div className="px-2.5 py-1 rounded bg-slate-900/80 border border-slate-800 text-slate-300">
            <div className="text-[10px] uppercase text-slate-400">New York (EST)</div>
            <div className="text-xs font-semibold text-slate-200">{formatTime('America/New_York')}</div>
          </div>

          <div className="px-2.5 py-1 rounded bg-slate-900/80 border border-slate-800 text-slate-300 hidden sm:block">
            <div className="text-[10px] uppercase text-slate-400">Tokyo (JST)</div>
            <div className="text-xs font-semibold text-slate-200">{formatTime('Asia/Tokyo')}</div>
          </div>
        </div>

        {/* Killzone Status Badges */}
        <div className="flex items-center gap-2 font-mono text-[11px]">
          <div
            className={`px-2.5 py-1.5 rounded-lg border flex items-center gap-1.5 transition-all ${
              isAsia ? 'bg-blue-950/60 border-blue-500 text-blue-200 font-bold' : 'bg-slate-900/50 border-slate-800 text-slate-500'
            }`}
          >
            <Moon className="w-3 h-3" />
            <span>ASIA RANGE</span>
          </div>

          <div
            className={`px-2.5 py-1.5 rounded-lg border flex items-center gap-1.5 transition-all ${
              isLondonKillzone ? 'bg-amber-950/70 border-amber-500 text-amber-200 font-bold animate-pulse' : 'bg-slate-900/50 border-slate-800 text-slate-500'
            }`}
          >
            <Sun className="w-3 h-3" />
            <span>LONDON KILLZONE</span>
          </div>

          <div
            className={`px-2.5 py-1.5 rounded-lg border flex items-center gap-1.5 transition-all ${
              isNyOverlap ? 'bg-emerald-950/70 border-emerald-500 text-emerald-200 font-bold animate-pulse' : 'bg-slate-900/50 border-slate-800 text-slate-500'
            }`}
          >
            <Globe className="w-3 h-3" />
            <span>NY OVERLAP</span>
          </div>
        </div>
      </div>

      {/* Visual Day Progress Bar */}
      <div className="w-full bg-slate-900 h-1.5 relative overflow-hidden">
        <div
          className="bg-gradient-to-r from-amber-500 via-emerald-500 to-blue-500 h-full transition-all duration-1000"
          style={{ width: `${dayProgressPct}%` }}
        />
      </div>
    </header>
  );
};
