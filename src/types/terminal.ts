/**
 * Multi-Asset Institutional Macro, Risk & Live Binance Portfolio Types
 */

export type AssetClass = 'CRYPTO' | 'FOREX' | 'COMMODITIES' | 'INDICES' | 'STOCKS';

export interface EconomicEvent {
  id: string;
  timeCet: string; // e.g. "14:30"
  currency: string; // "USD", "EUR", "GBP", "JPY", etc.
  event: string;
  impact: 'HIGH' | 'MEDIUM' | 'LOW';
  forecast?: string;
  previous?: string;
  actual?: string;
  noTradeWindowStart: string; // -30m
  noTradeWindowEnd: string;   // +30m
}

export type RiskModifierType = 'Standard 1.0% Risk' | 'Half 0.5% Risk' | 'Quarter 0.25% Risk' | '0% SIT ON HANDS';

export interface GroundingChunk {
  web?: {
    uri?: string;
    title?: string;
  };
}

export interface CrossAssetStrength {
  asset: string; // "USD", "EUR", "GBP", "JPY", "BTC", "ETH", "XAU (Gold)", "SPX/NDX"
  category: 'FIAT' | 'CRYPTO' | 'COMMODITY' | 'EQUITY';
  score: number; // -5 to +5
  rating: 'Bullish' | 'Bearish' | 'Neutral';
  driver: string;
  keyLevel?: string;
}

export interface AssetGameplan {
  symbol: string;
  name: string;
  assetClass: AssetClass;
  tvSymbol: string;
  strategy: 'Trend Breakout' | 'Mean-Reversion Range Sweep' | 'Liquidity Stop-Hunt Reversal' | 'Order Block Mitigation';
  bias: 'Long' | 'Short' | 'Neutral / Stand Aside';
  keySupport: string;
  keyResistance: string;
  playbook: string;
  invalidation: string;
}

export interface MacroBriefing {
  timestamp: string;
  generatedAtCet: string;
  source: 'gemini_grounded' | 'binance_live' | 'er_api' | 'desk_model';
  quotaNotice?: string;
  dangerZones: {
    events: EconomicEvent[];
    activeBlackout: boolean;
    activeEventTitle?: string;
    summary: string;
  };
  crossAssetStrength: CrossAssetStrength[];
  gameplans: AssetGameplan[];
  sessionGameplan: {
    primaryRegime: string;
    marketNarrative: string;
    londonKillzoneFocus: string;
    nyOverlapFocus: string;
    invalidationTrigger: string;
  };
  riskModifier: {
    recommendation: RiskModifierType;
    riskPct: number; // 1.0, 0.5, 0.25, or 0.0
    isBombDay: boolean;
    bombEventsFound: string[];
    riskRuleExplanation: string;
  };
  groundingSources: { title: string; url: string }[];
}

// Binance Portfolio Types
export interface BinanceSpotBalance {
  asset: string;
  free: number;
  locked: number;
  total: number;
  usdValue: number;
  priceUsd: number;
}

export interface BinanceFuturesPosition {
  symbol: string;
  positionAmt: number;
  entryPrice: number;
  markPrice: number;
  unRealizedProfit: number;
  leverage: number;
  marginType: string;
  liquidationPrice: number;
  side: 'LONG' | 'SHORT';
  notionalUsd: number;
}

export interface BinancePortfolio {
  connected: boolean;
  totalEquityUsd: number;
  spotEquityUsd: number;
  futuresEquityUsd: number;
  unrealizedPnlUsd: number;
  marginRatio?: number;
  spotBalances: BinanceSpotBalance[];
  futuresPositions: BinanceFuturesPosition[];
  serverTimeOffsetMs: number;
  lastUpdated: string;
  keyMasked: string;
  error?: string;
}

// Position Sizing Result
export interface MultiAssetPositionResult {
  assetClass: AssetClass;
  riskAmountUsd: number;
  entryPrice: number;
  stopLossPrice: number;
  stopLossDistance: number;
  stopLossPct: number;
  positionSizeBase: number; // e.g. BTC, EUR, Oz, Shares
  positionSizeNotionalUsd: number;
  effectiveLeverage: number;
  liquidationPriceEst?: number;
  standardLots?: number; // for FX
  contracts?: number; // for Indices
  pipValueUsd?: number;
}
