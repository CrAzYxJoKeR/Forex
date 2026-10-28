import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateNoTradeWindow,
  parseCetMinutes,
  formatMinutesToCet,
  isInsideNoTradeWindow,
  determineRiskModifier,
  calculatePositionSize,
  EconomicEvent,
} from './deskRules';

test('parseCetMinutes and formatMinutesToCet work accurately', () => {
  assert.equal(parseCetMinutes('00:00'), 0);
  assert.equal(parseCetMinutes('14:30'), 870);
  assert.equal(parseCetMinutes('23:59'), 1439);
  assert.equal(formatMinutesToCet(870), '14:30');
  assert.equal(formatMinutesToCet(0), '00:00');
});

test('calculateNoTradeWindow produces exact 30 min before and 30 min after window', () => {
  const window1 = calculateNoTradeWindow('14:30');
  assert.equal(window1.windowStart, '14:00');
  assert.equal(window1.windowEnd, '15:00');
});

test('isInsideNoTradeWindow detects blackout periods accurately', () => {
  assert.equal(isInsideNoTradeWindow('13:59', '14:00', '15:00'), false);
  assert.equal(isInsideNoTradeWindow('14:00', '14:00', '15:00'), true);
  assert.equal(isInsideNoTradeWindow('14:30', '14:00', '15:00'), true);
  assert.equal(isInsideNoTradeWindow('15:00', '14:00', '15:00'), true);
  assert.equal(isInsideNoTradeWindow('15:01', '14:00', '15:00'), false);
});

test('determineRiskModifier mandates Half 0.5% Risk or Sit on Hands on CPI / Rate Decisions', () => {
  const fomcEvents: EconomicEvent[] = [
    {
      id: '2',
      currency: 'USD',
      event: 'FOMC Rate Decision & Statement',
      impact: 'HIGH',
      timeCet: '20:00',
      noTradeWindowStart: '19:30',
      noTradeWindowEnd: '20:30',
    },
  ];
  const fomcResult = determineRiskModifier(fomcEvents);
  assert.equal(fomcResult.recommendation, '0% SIT ON HANDS');
  assert.equal(fomcResult.isBombDay, true);

  const cleanEvents: EconomicEvent[] = [
    {
      id: '3',
      currency: 'EUR',
      event: 'German Final CPI m/m',
      impact: 'MEDIUM',
      timeCet: '08:00',
      noTradeWindowStart: '07:30',
      noTradeWindowEnd: '08:30',
    },
  ];
  const cleanResult = determineRiskModifier(cleanEvents);
  assert.equal(cleanResult.recommendation, 'Standard 1.0% Risk');
  assert.equal(cleanResult.isBombDay, false);
});

test('calculatePositionSize calculates proper forex lot size', () => {
  const pos1 = calculatePositionSize({
    accountBalance: 100000,
    riskPct: 1.0,
    stopLossPips: 20,
    pair: 'EUR/USD',
    currentRate: 1.0884,
  });
  assert.equal(pos1.riskAmountUsd, 1000);
  assert.equal(pos1.lotSize, 5.0);
  assert.equal(pos1.units, 500000);
});
