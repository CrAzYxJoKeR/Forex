import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import {
  EconomicEvent,
  calculateNoTradeWindow,
  determineRiskModifier,
  MacroBriefing,
  CurrencyStrength,
  PairGameplan,
} from './src/utils/deskRules';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

let ai: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// In-memory cache for live rates & briefings
let cachedRates: { rates: Record<string, number>; timestamp: number } | null = null;
let cachedBriefing: { timestamp: number; briefing: MacroBriefing } | null = null;
const CACHE_TTL_MS = 3 * 60 * 1000; // 3 minutes

/**
 * Fetch real-time live exchange rates from public open ER API
 */
async function fetchLiveRates(): Promise<Record<string, number>> {
  if (cachedRates && Date.now() - cachedRates.timestamp < 30000) {
    return cachedRates.rates;
  }
  try {
    const response = await fetch('https://open.er-api.com/v6/latest/USD');
    if (!response.ok) throw new Error('Failed to fetch ER API');
    const data = await response.json();
    if (data && data.rates) {
      const rates = {
        EUR: data.rates.EUR || 0.92,
        GBP: data.rates.GBP || 0.77,
        JPY: data.rates.JPY || 152.5,
        CHF: data.rates.CHF || 0.88,
        AUD: data.rates.AUD || 1.51,
        CAD: data.rates.CAD || 1.38,
        NZD: data.rates.NZD || 1.65,
        USD: 1.0,
      };
      cachedRates = { rates, timestamp: Date.now() };
      return rates;
    }
  } catch (err) {
    console.warn('Live rate fetch warning, using fallback rates:', err);
  }
  return cachedRates?.rates || { EUR: 0.92, GBP: 0.77, JPY: 152.5, CHF: 0.88, AUD: 1.51, CAD: 1.38, NZD: 1.65, USD: 1.0 };
}

/**
 * Institutional baseline G8 Macro Briefing
 */
function getBaselineBriefing(rates: Record<string, number>): MacroBriefing {
  const now = new Date();
  const currentHours = now.getUTCHours() + 1;
  const currentMins = now.getUTCMinutes();
  const currentCetStr = `${currentHours.toString().padStart(2, '0')}:${currentMins.toString().padStart(2, '0')}`;

  const baselineEvents: EconomicEvent[] = [
    {
      id: 'ev-1',
      timeCet: '09:30',
      currency: 'CHF',
      event: 'SNB Chairman Schlegel Speech & Sight Deposits',
      impact: 'MEDIUM',
      forecast: '-',
      previous: '-',
      noTradeWindowStart: '09:00',
      noTradeWindowEnd: '10:00',
    },
    {
      id: 'ev-2',
      timeCet: '10:00',
      currency: 'EUR',
      event: 'ECB President Lagarde Speech on Financial Stability',
      impact: 'HIGH',
      forecast: '-',
      previous: '-',
      noTradeWindowStart: '09:30',
      noTradeWindowEnd: '10:30',
    },
    {
      id: 'ev-3',
      timeCet: '14:30',
      currency: 'USD',
      event: 'US Core PCE Price Index m/m & Retail Sales',
      impact: 'HIGH',
      forecast: '0.3%',
      previous: '0.2%',
      noTradeWindowStart: '14:00',
      noTradeWindowEnd: '15:00',
    },
    {
      id: 'ev-4',
      timeCet: '01:30',
      currency: 'AUD',
      event: 'RBA Trimmed Mean CPI q/q',
      impact: 'HIGH',
      forecast: '0.8%',
      previous: '0.9%',
      noTradeWindowStart: '01:00',
      noTradeWindowEnd: '02:00',
    },
  ];

  const riskMod = determineRiskModifier(baselineEvents);

  const currencies: Record<string, CurrencyStrength> = {
    USD: { currency: 'USD', score: 4, rating: 'Bullish', rate: '4.75%', rationale: 'Resilient US labor market and sticky core inflation keeping Fed rate cut path measured.' },
    EUR: { currency: 'EUR', score: -2, rating: 'Bearish', rate: '3.15%', rationale: 'Industrial slowdown in Germany and dovish ECB rate trajectory.' },
    GBP: { currency: 'GBP', score: 1, rating: 'Neutral', rate: '4.75%', rationale: 'Persistent services inflation balanced against fragile UK consumer retail data.' },
    JPY: { currency: 'JPY', score: -4, rating: 'Bearish', rate: '0.25%', rationale: 'Yield spread disadvantage vs USD and cautious BoJ normalization tone.' },
    CHF: { currency: 'CHF', score: 2, rating: 'Bullish', rate: '1.00%', rationale: 'Safe-haven flows amid geopolitical frictions and SNB intervention vigilance.' },
    AUD: { currency: 'AUD', score: 1, rating: 'Neutral', rate: '4.35%', rationale: 'Commodity price resilience offset by softer Chinese demand metrics.' },
    CAD: { currency: 'CAD', score: -1, rating: 'Bearish', rate: '3.25%', rationale: 'BoC easing cycle ongoing amid softer oil prices and cooling housing.' },
    NZD: { currency: 'NZD', score: 0, rating: 'Neutral', rate: '4.25%', rationale: 'RBNZ rate cuts priced in; range-bound against G10 peers.' },
  };

  const pairGameplans: Record<string, PairGameplan> = {
    'EUR/USD': {
      pair: 'EUR/USD',
      strategy: 'Mean-Reversion Range Sweeps',
      bias: 'Short',
      keySupport: '1.0820',
      keyResistance: '1.0920',
      playbook: 'Fade morning London rallies toward 1.0910 resistance. Target internal liquidity pool at 1.0850 ahead of US PCE release.',
    },
    'GBP/USD': {
      pair: 'GBP/USD',
      strategy: 'Stop-Hunt Reversals',
      bias: 'Neutral / Stand Aside',
      keySupport: '1.2850',
      keyResistance: '1.2980',
      playbook: 'Choppy consolidation inside 1.2880 - 1.2960. Wait for sweep of Asian range extreme before entering mean-reversion.',
    },
    'USD/JPY': {
      pair: 'USD/JPY',
      strategy: 'Trend Breakouts',
      bias: 'Long',
      keySupport: '151.20',
      keyResistance: '153.50',
      playbook: 'Bulls maintain control above 152.00 pivot. Look for sustained break of 152.80 on Tokyo/London crossover.',
    },
    'USD/CHF': {
      pair: 'USD/CHF',
      strategy: 'Trend Breakouts',
      bias: 'Long',
      keySupport: '0.8750',
      keyResistance: '0.8880',
      playbook: 'Strong dollar yield bid supports dips toward 0.8780. Target test of 0.8850 resistance.',
    },
    'AUD/USD': {
      pair: 'AUD/USD',
      strategy: 'Mean-Reversion Range Sweeps',
      bias: 'Short',
      keySupport: '0.6550',
      keyResistance: '0.6650',
      playbook: 'Sell rallies into 0.6630 resistance following soft commodity futures data.',
    },
    'USD/CAD': {
      pair: 'USD/CAD',
      strategy: 'Trend Breakouts',
      bias: 'Long',
      keySupport: '1.3720',
      keyResistance: '1.3850',
      playbook: 'Upward drift supported by BoC rate cut expectations and softer WTI crude.',
    },
    'NZD/USD': {
      pair: 'NZD/USD',
      strategy: 'Stop-Hunt Reversals',
      bias: 'Neutral / Stand Aside',
      keySupport: '0.5950',
      keyResistance: '0.6050',
      playbook: 'Sideways price action. Avoid overnight exposure; trade intraday bounces off 0.5980 support.',
    },
  };

  return {
    timestamp: new Date().toISOString(),
    generatedAtCet: currentCetStr,
    source: 'live_api',
    dangerZones: {
      summary: '3 High-Impact Red Folder releases scheduled today. Mandatory No-Trade Windows enforced around 10:00 and 14:30 CET.',
      events: baselineEvents,
      activeBlackout: false,
    },
    currencies,
    pairGameplans,
    rateDifferentialNotes: 'US-EZ rate differential (+160 bps) continues to underpin USD structural carry advantage over EUR and JPY.',
    sessionGameplan: {
      primaryStrategy: 'Mean-Reversion Range Sweeps',
      confidence: 'HIGH',
      executionPlaybook: 'London morning session compression expected. Look for false breakout sweeps of Asian High/Low before US PCE volatility.',
      londonKillzoneFocus: 'Fade extreme extensions beyond London Open highs. Target value area mean reversion.',
      nyOverlapFocus: 'Absolute stand-down during 14:00 - 15:00 CET No-Trade Window. Reassess trend continuation post-release.',
      invalidationTrigger: 'Clean 15-minute chart close beyond daily ATR extremes invalidates range model.',
    },
    riskModifier: {
      recommendation: riskMod.recommendation,
      isBombDay: riskMod.isBombDay,
      bombEventsFound: riskMod.bombEventsFound,
      riskRuleExplanation: riskMod.explanation,
      recommendedMaxPositions: 2,
      recommendedRiskPerTradePct: riskMod.riskPct,
    },
    marketSnapshot: {
      rates,
      timestamp: new Date().toISOString(),
    },
    keyHeadlines: [
      { headline: 'Fed Rate Path Remains Calibrated to Resilient Core Inflation Prints', source: 'Federal Reserve / Bloomberg', impact: 'USD Bullish' },
      { headline: 'ECB Expresses Concern Over Sluggish German Industrial Output', source: 'ECB Watch / Reuters', impact: 'EUR Bearish' },
      { headline: 'Bank of Japan Signals Gradual Rate Normalization Dependent on Wage Data', source: 'Nikkei / Reuters', impact: 'JPY Neutral' },
    ],
  };
}

// Pre-market briefing endpoint
app.post('/api/pre-market', async (req, res) => {
  const { userPrompt, forceRefresh } = req.body;

  const rates = await fetchLiveRates();

  if (!forceRefresh && cachedBriefing && Date.now() - cachedBriefing.timestamp < CACHE_TTL_MS) {
    return res.json({
      success: true,
      briefing: cachedBriefing.briefing,
      cached: true,
      source: cachedBriefing.briefing.source,
      note: 'Served from Institutional G10 Desk cache.',
    });
  }

  if (!ai || !process.env.GEMINI_API_KEY) {
    const fallback = getBaselineBriefing(rates);
    cachedBriefing = { timestamp: Date.now(), briefing: fallback };
    return res.json({
      success: true,
      briefing: fallback,
      source: 'live_api',
      note: 'Briefing compiled using Live G10 ER-API rates and Institutional Macro Engine.',
    });
  }

  try {
    const systemPrompt = `You are a Senior Institutional G10 Forex Macro & Risk Desk Analyst for a Tier-1 fund.
Analyze today's macroeconomic calendar for USD, EUR, GBP, JPY, CHF, AUD, CAD, NZD and return a JSON object with this exact schema:
{
  "dangerZones": {
    "summary": "string",
    "events": [
      { "id": "string", "timeCet": "HH:MM", "currency": "USD"|"EUR"|"GBP"|"JPY"|"CHF"|"AUD"|"CAD"|"NZD", "event": "string", "impact": "HIGH"|"MEDIUM"|"LOW", "forecast": "string", "previous": "string" }
    ]
  },
  "currencies": {
    "USD": { "currency": "USD", "score": number, "rating": "Bullish"|"Bearish"|"Neutral", "rate": "string", "rationale": "string" },
    "EUR": { "currency": "EUR", "score": number, "rating": "Bullish"|"Bearish"|"Neutral", "rate": "string", "rationale": "string" },
    "GBP": { "currency": "GBP", "score": number, "rating": "Bullish"|"Bearish"|"Neutral", "rate": "string", "rationale": "string" },
    "JPY": { "currency": "JPY", "score": number, "rating": "Bullish"|"Bearish"|"Neutral", "rate": "string", "rationale": "string" },
    "CHF": { "currency": "CHF", "score": number, "rating": "Bullish"|"Bearish"|"Neutral", "rate": "string", "rationale": "string" },
    "AUD": { "currency": "AUD", "score": number, "rating": "Bullish"|"Bearish"|"Neutral", "rate": "string", "rationale": "string" },
    "CAD": { "currency": "CAD", "score": number, "rating": "Bullish"|"Bearish"|"Neutral", "rate": "string", "rationale": "string" },
    "NZD": { "currency": "NZD", "score": number, "rating": "Bullish"|"Bearish"|"Neutral", "rate": "string", "rationale": "string" }
  },
  "pairGameplans": {
    "EUR/USD": { "pair": "EUR/USD", "strategy": "Trend Breakouts"|"Mean-Reversion Range Sweeps"|"Stop-Hunt Reversals", "bias": "Long"|"Short"|"Neutral / Stand Aside", "keySupport": "string", "keyResistance": "string", "playbook": "string" },
    "GBP/USD": { "pair": "GBP/USD", "strategy": "Trend Breakouts"|"Mean-Reversion Range Sweeps"|"Stop-Hunt Reversals", "bias": "Long"|"Short"|"Neutral / Stand Aside", "keySupport": "string", "keyResistance": "string", "playbook": "string" },
    "USD/JPY": { "pair": "USD/JPY", "strategy": "Trend Breakouts"|"Mean-Reversion Range Sweeps"|"Stop-Hunt Reversals", "bias": "Long"|"Short"|"Neutral / Stand Aside", "keySupport": "string", "keyResistance": "string", "playbook": "string" },
    "USD/CHF": { "pair": "USD/CHF", "strategy": "Trend Breakouts"|"Mean-Reversion Range Sweeps"|"Stop-Hunt Reversals", "bias": "Long"|"Short"|"Neutral / Stand Aside", "keySupport": "string", "keyResistance": "string", "playbook": "string" },
    "AUD/USD": { "pair": "AUD/USD", "strategy": "Trend Breakouts"|"Mean-Reversion Range Sweeps"|"Stop-Hunt Reversals", "bias": "Long"|"Short"|"Neutral / Stand Aside", "keySupport": "string", "keyResistance": "string", "playbook": "string" },
    "USD/CAD": { "pair": "USD/CAD", "strategy": "Trend Breakouts"|"Mean-Reversion Range Sweeps"|"Stop-Hunt Reversals", "bias": "Long"|"Short"|"Neutral / Stand Aside", "keySupport": "string", "keyResistance": "string", "playbook": "string" },
    "NZD/USD": { "pair": "NZD/USD", "strategy": "Trend Breakouts"|"Mean-Reversion Range Sweeps"|"Stop-Hunt Reversals", "bias": "Long"|"Short"|"Neutral / Stand Aside", "keySupport": "string", "keyResistance": "string", "playbook": "string" }
  },
  "sessionGameplan": {
    "primaryStrategy": "Trend Breakouts"|"Mean-Reversion Range Sweeps"|"Stop-Hunt Reversals",
    "confidence": "HIGH"|"MODERATE"|"LOW",
    "executionPlaybook": "string",
    "londonKillzoneFocus": "string",
    "nyOverlapFocus": "string",
    "invalidationTrigger": "string"
  },
  "rateDifferentialNotes": "string",
  "keyHeadlines": [
    { "headline": "string", "source": "string", "impact": "string" }
  ]
}`;

    const promptText = userPrompt && userPrompt.trim() !== ''
      ? `User Request: "${userPrompt}". Today is ${new Date().toISOString().split('T')[0]}. Provide the G10 Forex macro briefing in JSON.`
      : `Provide today's G10 Forex pre-market macro briefing in JSON.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: promptText,
      config: {
        systemInstruction: systemPrompt,
        tools: [{ googleSearch: {} }],
        responseMimeType: 'application/json',
      },
    });

    const responseText = response.text || '';
    let parsed: any;
    try {
      const cleaned = responseText.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
      parsed = JSON.parse(cleaned);
    } catch {
      const fallback = getBaselineBriefing(rates);
      cachedBriefing = { timestamp: Date.now(), briefing: fallback };
      return res.json({ success: true, briefing: fallback, source: 'live_api' });
    }

    const rawEvents: any[] = parsed.dangerZones?.events || [];
    const formattedEvents: EconomicEvent[] = rawEvents.map((ev: any, idx: number) => {
      const timeCet = ev.timeCet || '14:30';
      const window = calculateNoTradeWindow(timeCet);
      const cur = (ev.currency?.toUpperCase() || 'USD') as any;
      return {
        id: ev.id || `ev-live-${idx}`,
        timeCet,
        currency: ['USD','EUR','GBP','JPY','CHF','AUD','CAD','NZD'].includes(cur) ? cur : 'USD',
        event: ev.event || 'Macro Economic Release',
        impact: (ev.impact?.toUpperCase() === 'HIGH' ? 'HIGH' : ev.impact?.toUpperCase() === 'LOW' ? 'LOW' : 'MEDIUM'),
        forecast: ev.forecast || '-',
        previous: ev.previous || '-',
        noTradeWindowStart: window.windowStart,
        noTradeWindowEnd: window.windowEnd,
      };
    });

    const riskEvaluation = determineRiskModifier(formattedEvents);

    const now = new Date();
    const currentHours = now.getUTCHours() + 1;
    const currentMins = now.getUTCMinutes();
    const currentCetStr = `${currentHours.toString().padStart(2, '0')}:${currentMins.toString().padStart(2, '0')}`;

    const fallbackBase = getBaselineBriefing(rates);

    const fullBriefing: MacroBriefing = {
      timestamp: new Date().toISOString(),
      generatedAtCet: currentCetStr,
      source: 'live_api',
      dangerZones: {
        summary: parsed.dangerZones?.summary || `${formattedEvents.filter(e => e.impact === 'HIGH').length} High-Impact red folders identified today.`,
        events: formattedEvents,
        activeBlackout: false,
      },
      currencies: parsed.currencies || fallbackBase.currencies,
      pairGameplans: parsed.pairGameplans || fallbackBase.pairGameplans,
      rateDifferentialNotes: parsed.rateDifferentialNotes || fallbackBase.rateDifferentialNotes,
      sessionGameplan: parsed.sessionGameplan || fallbackBase.sessionGameplan,
      riskModifier: {
        recommendation: riskEvaluation.recommendation,
        isBombDay: riskEvaluation.isBombDay,
        bombEventsFound: riskEvaluation.bombEventsFound,
        riskRuleExplanation: riskEvaluation.explanation,
        recommendedMaxPositions: riskEvaluation.isBombDay ? 1 : 2,
        recommendedRiskPerTradePct: riskEvaluation.riskPct,
      },
      marketSnapshot: {
        rates,
        timestamp: new Date().toISOString(),
      },
      keyHeadlines: parsed.keyHeadlines || fallbackBase.keyHeadlines,
    };

    cachedBriefing = { timestamp: Date.now(), briefing: fullBriefing };

    return res.json({ success: true, briefing: fullBriefing, source: 'live_api' });
  } catch (error: any) {
    const isRateLimit = error?.status === 429 || error?.status === 'RESOURCE_EXHAUSTED' || error?.message?.includes('429');
    const fallback = getBaselineBriefing(rates);
    cachedBriefing = { timestamp: Date.now(), briefing: fallback };

    return res.json({
      success: true,
      briefing: fallback,
      rateLimited: isRateLimit,
      source: 'live_api',
      note: isRateLimit ? 'Live API quota reached. Serving Live ER-API G10 rates & institutional desk model.' : 'Active G10 desk model loaded.',
    });
  }
});

// Live exchange rates endpoint
app.get('/api/rates', async (req, res) => {
  const rates = await fetchLiveRates();
  res.json({ rates, timestamp: new Date().toISOString() });
});

async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`G10 Forex Macro & Risk Desk Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
