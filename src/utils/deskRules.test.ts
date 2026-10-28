import test from 'node:test';
import assert from 'node:assert/strict';
import {
  computeNoTradeWindow,
  parseCetMinutes,
  formatMinutesToCet,
  isInsideNoTradeWindow,
  determineRiskModifier,
  calculateMultiAssetPositionSize,
} from './deskRules';
import { EconomicEvent } from '../types/terminal';

test('parseCetMinutes and formatMinutesToCet compute accurately', () => {
  assert.equal(parseCetMinutes('00:00'), 0);
  assert.equal(parseCetMinutes('14:30'), 870);
  assert.equal(parseCetMinutes('23:59'), 1439);
  assert.equal(formatMinutesToCet(870), '14:30');
  assert.equal(formatMinutesToCet(0), '00:00');
});

test('computeNoTradeWindow produces exact ±30 min window', () => {
  const window1 = computeNoTradeWindow('14:30', 30);
  assert.equal(window1.windowStart, '14:00');
  assert.equal(window1.windowEnd, '15:00');

  const window2 = computeNoTradeWindow('08:15', 30);
  assert.equal(window2.windowStart, '07:45');
  assert.equal(window2.windowEnd, '08:45');
});

test('isInsideNoTradeWindow detects blackout periods accurately', () => {
  assert.equal(isInsideNoTradeWindow('13:59', '14:00', '15:00'), false);
  assert.equal(isInsideNoTradeWindow('14:00', '14:00', '15:00'), true);
  assert.equal(isInsideNoTradeWindow('14:30', '14:00', '15:00'), true);
  assert.equal(isInsideNoTradeWindow('15:00', '14:00', '15:00'), true);
  assert.equal(isInsideNoTradeWindow('15:01', '14:00', '15:00'), false);
});

test('determineRiskModifier mandates 0% SIT ON HANDS on FOMC/CPI and 1.0% on clean days', () => {
  const fomcEvents: EconomicEvent[] = [
    {
      id: '1',
      timeCet: '20:00',
      currency: 'USD',
      event: 'FOMC Statement & Fed Rate Decision',
      impact: 'HIGH',
      noTradeWindowStart: '19:30',
      noTradeWindowEnd: '20:30',
    },
  ];
  const resFomc = determineRiskModifier(fomcEvents);
  assert.equal(resFomc.recommendation, '0% SIT ON HANDS');
  assert.equal(resFomc.riskPct, 0.0);
  assert.equal(resFomc.isBombDay, true);

  const cleanEvents: EconomicEvent[] = [
    {
      id: '2',
      timeCet: '10:00',
      currency: 'EUR',
      event: 'Italian Trade Balance',
      impact: 'LOW',
      noTradeWindowStart: '09:30',
      noTradeWindowEnd: '10:30',
    },
  ];
  const resClean = determineRiskModifier(cleanEvents);
  assert.equal(resClean.recommendation, 'Standard 1.0% Risk');
  assert.equal(resClean.riskPct, 1.0);
  assert.equal(resClean.isBombDay, false);
});

test('calculateMultiAssetPositionSize correctly calculates Crypto position & leverage', () => {
  // $10,000 account, 1.0% risk ($100), BTC entry $65,000, stop loss $63,700 (2% SL distance)
  // Position size should be $100 / 0.02 = $5,000 notional (0.0769 BTC) -> effective leverage 0.5x
  const cryptoPos = calculateMultiAssetPositionSize({
    assetClass: 'CRYPTO',
    accountBalance: 10000,
    riskPct: 1.0,
    entryPrice: 65000,
    stopLossPrice: 63700,
  });

  assert.equal(cryptoPos.riskAmountUsd, 100);
  assert.equal(cryptoPos.stopLossDistance, 1300);
  assert.equal(cryptoPos.stopLossPct, 2);
  assert.equal(cryptoPos.positionSizeNotionalUsd, 5000);
  assert.equal(cryptoPos.effectiveLeverage, 0.5);
  assert.ok(cryptoPos.positionSizeBase > 0.07 && cryptoPos.positionSizeBase < 0.08);
});

test('calculateMultiAssetPositionSize correctly calculates Forex Lots', () => {
  // $50,000 account, 1.0% risk ($500), EUR/USD entry 1.0850, stop loss 1.0825 (25 pips)
  // Lots = $500 / (25 * 10) = 2.0 lots
  const fxPos = calculateMultiAssetPositionSize({
    assetClass: 'FOREX',
    accountBalance: 50000,
    riskPct: 1.0,
    entryPrice: 1.0850,
    stopLossPrice: 1.0825,
  });

  assert.equal(fxPos.riskAmountUsd, 500);
  assert.equal(fxPos.standardLots, 2.0);
});
