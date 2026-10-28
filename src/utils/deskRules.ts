import {
  EconomicEvent,
  RiskModifierType,
  AssetClass,
  MultiAssetPositionResult,
} from '../types/terminal';

/**
 * Parses "HH:MM" into total minutes from midnight (0..1439).
 */
export function parseCetMinutes(timeStr: string): number {
  if (!timeStr) return 0;
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
 * Computes deterministic ±30 min No-Trade Window for any given release time in CET.
 */
export function computeNoTradeWindow(timeCet: string, bufferMinutes = 30): { windowStart: string; windowEnd: string } {
  const eventMinutes = parseCetMinutes(timeCet);
  const startMinutes = eventMinutes - bufferMinutes;
  const endMinutes = eventMinutes + bufferMinutes;
  return {
    windowStart: formatMinutesToCet(startMinutes),
    windowEnd: formatMinutesToCet(endMinutes),
  };
}

/**
 * Checks whether current CET time is inside the blackout window.
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
 * Institutional Multi-Asset Risk Modifier Engine
 * Rules:
 * - CPI, NFP, or FOMC Rate Decisions: '0% SIT ON HANDS' or 'Quarter 0.25% Risk'
 * - High-Impact Red Folders (GDP, Retail Sales, Flash PMIs): 'Half 0.5% Risk'
 * - Clean Docket: 'Standard 1.0% Risk'
 */
export function determineRiskModifier(events: EconomicEvent[]): {
  recommendation: RiskModifierType;
  riskPct: number;
  isBombDay: boolean;
  bombEventsFound: string[];
  explanation: string;
} {
  const bombKeywords = ['CPI', 'NFP', 'NON-FARM', 'FOMC', 'FED RATE', 'ECB RATE', 'INTEREST RATE', 'POWELL'];
  const bombEvents: string[] = [];
  const highImpactEvents: string[] = [];

  for (const ev of events) {
    if (ev.impact === 'HIGH') {
      const upper = (ev.event || '').toUpperCase();
      const match = bombKeywords.some((kw) => upper.includes(kw));
      if (match) {
        bombEvents.push(`${ev.currency} ${ev.event} (${ev.timeCet} CET)`);
      } else {
        highImpactEvents.push(`${ev.currency} ${ev.event} (${ev.timeCet} CET)`);
      }
    }
  }

  if (bombEvents.length > 0) {
    const isMajorRateOrCPI = bombEvents.some((b) => b.includes('CPI') || b.includes('FOMC') || b.includes('NFP') || b.includes('RATE'));
    if (isMajorRateOrCPI) {
      return {
        recommendation: '0% SIT ON HANDS',
        riskPct: 0.0,
        isBombDay: true,
        bombEventsFound: bombEvents,
        explanation: `Institutional Volatility Bomb Detected: ${bombEvents.join(', ')}. Strict desk protocol mandates a flat book (0% risk) during the release window and press conferences due to severe slippage and spread widening.`,
      };
    }
    return {
      recommendation: 'Quarter 0.25% Risk',
      riskPct: 0.25,
      isBombDay: true,
      bombEventsFound: bombEvents,
      explanation: `Tier-1 event cluster (${bombEvents.join(', ')}). Capital preservation protocol restricts maximum position risk to 0.25% equity.`,
    };
  }

  if (highImpactEvents.length >= 2) {
    return {
      recommendation: 'Half 0.5% Risk',
      riskPct: 0.5,
      isBombDay: true,
      bombEventsFound: highImpactEvents,
      explanation: `Multiple High-Impact red folders scheduled today (${highImpactEvents.length} releases). Risk ceiling capped at 0.5% per trade.`,
    };
  }

  return {
    recommendation: 'Standard 1.0% Risk',
    riskPct: 1.0,
    isBombDay: false,
    bombEventsFound: [],
    explanation: 'Clean economic docket today with no Tier-1 rate shocks or CPI bombs. Standard institutional 1.0% equity allocation authorized for qualified setups.',
  };
}

/**
 * Multi-Asset Position Sizer
 * Accurately sizes Crypto (Binance leverage), Forex (pips & lots), Commodities (Gold Oz), Indices, and Stocks.
 */
export function calculateMultiAssetPositionSize(params: {
  assetClass: AssetClass;
  accountBalance: number;
  riskPct: number;
  entryPrice: number;
  stopLossPrice: number;
  maxLeverage?: number;
}): MultiAssetPositionResult {
  const { assetClass, accountBalance, riskPct, entryPrice, stopLossPrice, maxLeverage = 10 } = params;

  if (accountBalance <= 0 || riskPct <= 0 || entryPrice <= 0 || stopLossPrice <= 0 || entryPrice === stopLossPrice) {
    return {
      assetClass,
      riskAmountUsd: 0,
      entryPrice,
      stopLossPrice,
      stopLossDistance: 0,
      stopLossPct: 0,
      positionSizeBase: 0,
      positionSizeNotionalUsd: 0,
      effectiveLeverage: 0,
    };
  }

  const riskAmountUsd = accountBalance * (riskPct / 100);
  const stopLossDistance = Math.abs(entryPrice - stopLossPrice);
  const stopLossPct = (stopLossDistance / entryPrice) * 100;
  const isLong = entryPrice > stopLossPrice;

  // Base position sizing: Risk / SL%
  const notionalPositionUsd = riskAmountUsd / (stopLossDistance / entryPrice);
  const positionSizeBase = notionalPositionUsd / entryPrice;
  const effectiveLeverage = Math.min(125, Math.round((notionalPositionUsd / accountBalance) * 10) / 10);

  // Liquidation estimate for Crypto
  const liqBufferPct = (1 / Math.max(1, effectiveLeverage)) * 0.9;
  const liquidationPriceEst = isLong
    ? Math.max(0, entryPrice * (1 - liqBufferPct))
    : entryPrice * (1 + liqBufferPct);

  // Forex standard lot conversion (assuming standard 100,000 unit contract, 1 pip = 0.0001 or 0.01 for JPY)
  const isJpy = entryPrice > 50 && entryPrice < 300;
  const pipScale = isJpy ? 0.01 : 0.0001;
  const stopLossPips = stopLossDistance / pipScale;
  const standardLots = Math.max(0.01, Math.round((riskAmountUsd / (Math.max(1, stopLossPips) * 10)) * 100) / 100);
  const pipValueUsd = standardLots * 10;

  // Indices / Commodities contracts
  const contracts = Math.max(0.01, Math.round((riskAmountUsd / Math.max(0.01, stopLossDistance)) * 100) / 100);

  return {
    assetClass,
    riskAmountUsd: Math.round(riskAmountUsd * 100) / 100,
    entryPrice,
    stopLossPrice,
    stopLossDistance: Math.round(stopLossDistance * 10000) / 10000,
    stopLossPct: Math.round(stopLossPct * 100) / 100,
    positionSizeBase: Math.round(positionSizeBase * 10000) / 10000,
    positionSizeNotionalUsd: Math.round(notionalPositionUsd * 100) / 100,
    effectiveLeverage,
    liquidationPriceEst: Math.round(liquidationPriceEst * 100) / 100,
    standardLots,
    contracts,
    pipValueUsd,
  };
}
