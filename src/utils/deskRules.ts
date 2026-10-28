/**
 * Institutional G10 Forex Macro & Risk Desk Rules & Calculators
 */

export interface EconomicEvent {
  id: string;
  timeCet: string; // "HH:MM", e.g. "14:30"
  currency: 'USD' | 'EUR' | 'GBP' | 'JPY' | 'CHF' | 'AUD' | 'CAD' | 'NZD';
  event: string;
  impact: 'HIGH' | 'MEDIUM' | 'LOW';
  forecast?: string;
  previous?: string;
  actual?: string;
  noTradeWindowStart: string; // "HH:MM" (30 min before)
  noTradeWindowEnd: string;   // "HH:MM" (30 min after)
}

export type DirectionRating = 'Bullish' | 'Bearish' | 'Neutral';
export type GameplanStrategy = 'Trend Breakouts' | 'Mean-Reversion Range Sweeps' | 'Stop-Hunt Reversals';
export type RiskModifierType = 'Standard 1.0% Risk' | 'Half 0.5% Risk' | '0% SIT ON HANDS';

export interface CurrencyStrength {
  currency: 'USD' | 'EUR' | 'GBP' | 'JPY' | 'CHF' | 'AUD' | 'CAD' | 'NZD';
  score: number; // -5 to +5
  rating: DirectionRating;
  rate: string;
  rationale: string;
}

export interface PairGameplan {
  pair: string; // e.g. EUR/USD
  strategy: GameplanStrategy;
  bias: 'Long' | 'Short' | 'Neutral / Stand Aside';
  keySupport: string;
  keyResistance: string;
  playbook: string;
}

export interface MacroBriefing {
  timestamp: string;
  generatedAtCet: string;
  source: 'live_web' | 'live_api' | 'desk_model';
  // 1. RED FOLDER DANGER ZONES
  dangerZones: {
    events: EconomicEvent[];
    activeBlackout: boolean;
    activeEventTitle?: string;
    summary: string;
  };
  // 2. G8 DIRECTIONAL BIAS & STRENGTH
  currencies: Record<'USD' | 'EUR' | 'GBP' | 'JPY' | 'CHF' | 'AUD' | 'CAD' | 'NZD', CurrencyStrength>;
  pairGameplans: Record<string, PairGameplan>;
  rateDifferentialNotes: string;
  // 3. SESSION GAMEPLAN OVERVIEW
  sessionGameplan: {
    primaryStrategy: GameplanStrategy;
    confidence: 'HIGH' | 'MODERATE' | 'LOW';
    executionPlaybook: string;
    londonKillzoneFocus: string;
    nyOverlapFocus: string;
    invalidationTrigger: string;
  };
  // 4. RISK MODIFIER
  riskModifier: {
    recommendation: RiskModifierType;
    isBombDay: boolean;
    bombEventsFound: string[];
    riskRuleExplanation: string;
    recommendedMaxPositions: number;
    recommendedRiskPerTradePct: number;
  };
  marketSnapshot: {
    rates: Record<string, number>; // Live rates fetched from ER-API
    timestamp: string;
  };
  keyHeadlines: {
    headline: string;
    source: string;
    impact: string;
  }[];
}

/**
 * Parses "HH:MM" into total minutes from midnight (0..1439).
 */
export function parseCetMinutes(timeStr: string): number {
  const parts = timeStr.trim().split(':');
  if (parts.length < 2) return 0;
  const hours = parseInt(parts[0], 10) || 0;
  const minutes = parseInt(parts[1], 10) || 0;
  return hours * 60 + minutes;
}

/**
 * Formats minutes from midnight into "HH:MM".
 */
export function formatMinutesToCet(totalMinutes: number): string {
  const normalized = ((totalMinutes % 1440) + 1440) % 1440;
  const hours = Math.floor(normalized / 60);
  const minutes = normalized % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

/**
 * Calculates the mandatory "No-Trade Window" (30 mins before to 30 mins after).
 */
export function calculateNoTradeWindow(eventTimeCet: string): { windowStart: string; windowEnd: string } {
  const eventMinutes = parseCetMinutes(eventTimeCet);
  const startMinutes = eventMinutes - 30;
  const endMinutes = eventMinutes + 30;
  return {
    windowStart: formatMinutesToCet(startMinutes),
    windowEnd: formatMinutesToCet(endMinutes),
  };
}

/**
 * Checks whether current CET time is inside blackout window.
 */
export function isInsideNoTradeWindow(currentCet: string, windowStart: string, windowEnd: string): boolean {
  const cur = parseCetMinutes(currentCet);
  const start = parseCetMinutes(windowStart);
  const end = parseCetMinutes(windowEnd);

  if (start <= end) {
    return cur >= start && cur <= end;
  }
  return cur >= start || cur <= end;
}

/**
 * Strict Risk Modifier Evaluator for G8 Desk
 * CPI, NFP, or Central Bank Rate Decisions mandate "0% SIT ON HANDS" or "Half 0.5% Risk".
 */
export function determineRiskModifier(events: EconomicEvent[]): {
  recommendation: RiskModifierType;
  isBombDay: boolean;
  bombEventsFound: string[];
  explanation: string;
  riskPct: number;
} {
  const bombKeywords = ['CPI', 'NFP', 'NON-FARM', 'FOMC', 'RATE DECISION', 'RATE STATEMENT', 'ECB RATE', 'BOE RATE', 'BOJ RATE', 'RBA RATE'];
  const bombEvents: string[] = [];

  for (const ev of events) {
    if (ev.impact === 'HIGH') {
      const upper = ev.event.toUpperCase();
      const match = bombKeywords.some(kw => upper.includes(kw));
      if (match) {
        bombEvents.push(`${ev.currency} ${ev.event} (${ev.timeCet} CET)`);
      }
    }
  }

  if (bombEvents.length > 0) {
    const isRateDecision = bombEvents.some(b => b.includes('RATE') || b.includes('FOMC'));
    if (isRateDecision) {
      return {
        recommendation: '0% SIT ON HANDS',
        isBombDay: true,
        bombEventsFound: bombEvents,
        explanation: `Institutional Red Alert: Central Bank Rate Decision / Tier-1 Volatility Bomb detected (${bombEvents.join(', ')}). Desk protocol mandates flat book (0% risk) during rate announcement and press conference.`,
        riskPct: 0.0,
      };
    }
    return {
      recommendation: 'Half 0.5% Risk',
      isBombDay: true,
      bombEventsFound: bombEvents,
      explanation: `Tier-1 economic release detected (${bombEvents.join(', ')}). Capital preservation protocol engaged: risk restricted to 0.5% max per setup.`,
      riskPct: 0.5,
    };
  }

  const highImpactCount = events.filter(e => e.impact === 'HIGH').length;
  if (highImpactCount >= 3) {
    return {
      recommendation: 'Half 0.5% Risk',
      isBombDay: true,
      bombEventsFound: events.filter(e => e.impact === 'HIGH').map(e => `${e.currency} ${e.event}`),
      explanation: `Multiple High-Impact red folders scheduled today (${highImpactCount} releases). Desk mandates defense: Half 0.5% Risk per trade.`,
      riskPct: 0.5,
    };
  }

  return {
    recommendation: 'Standard 1.0% Risk',
    isBombDay: false,
    bombEventsFound: [],
    explanation: 'Clean economic docket today with no Tier-1 rate decisions or CPI bombs. Standard G10 desk parameters of 1.0% equity allocation per setup apply outside scheduled No-Trade Windows.',
    riskPct: 1.0,
  };
}

/**
 * G8 Position Size Calculator
 */
export function calculatePositionSize(params: {
  accountBalance: number;
  riskPct: number;
  stopLossPips: number;
  pair: string;
  currentRate: number;
}): {
  riskAmountUsd: number;
  lotSize: number;
  units: number;
  pipValueUsd: number;
} {
  const { accountBalance, riskPct, stopLossPips, pair, currentRate } = params;
  if (accountBalance <= 0 || riskPct <= 0 || stopLossPips <= 0 || currentRate <= 0) {
    return { riskAmountUsd: 0, lotSize: 0, units: 0, pipValueUsd: 0 };
  }

  const riskAmountUsd = accountBalance * (riskPct / 100);
  
  // Standard pip value calculation for G8 pairs with USD quote vs USD base
  let pipValuePerStandardLot = 10; // $10 per pip for EURUSD, GBPUSD, AUDUSD, NZDUSD
  if (pair.includes('JPY')) {
    pipValuePerStandardLot = (100000 * 0.01) / currentRate; // approx $6.5 to $7 depending on USDJPY rate
  } else if (pair.startsWith('USD') && !pair.endsWith('USD')) {
    pipValuePerStandardLot = 10 / currentRate;
  }

  const rawLots = riskAmountUsd / (stopLossPips * pipValuePerStandardLot);
  const lotSize = Math.max(0.01, Math.floor(rawLots * 100) / 100);
  const units = Math.round(lotSize * 100000);
  const pipValueUsd = Math.round(lotSize * pipValuePerStandardLot * 100) / 100;

  return {
    riskAmountUsd: Math.round(riskAmountUsd * 100) / 100,
    lotSize,
    units,
    pipValueUsd,
  };
}
