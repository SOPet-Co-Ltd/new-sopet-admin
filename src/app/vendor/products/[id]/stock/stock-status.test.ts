import { describe, expect, it } from 'vitest';
import { formatStockDelta, parseStockDraft, stockLevel, stockLevelLabel } from './stock-status';

describe('stock-status', () => {
  it('parses non-negative integers only', () => {
    expect(parseStockDraft('12')).toBe(12);
    expect(parseStockDraft('0')).toBe(0);
    expect(parseStockDraft('')).toBeNull();
    expect(parseStockDraft('1.5')).toBeNull();
    expect(parseStockDraft('-1')).toBeNull();
    expect(parseStockDraft('abc')).toBeNull();
  });

  it('classifies levels with threshold 5', () => {
    expect(stockLevel(0)).toBe('out');
    expect(stockLevel(5)).toBe('low');
    expect(stockLevel(6)).toBe('ok');
    expect(stockLevelLabel('out')).toBe('หมด');
    expect(stockLevelLabel('low')).toBe('ใกล้หมด');
    expect(stockLevelLabel('ok')).toBe('พร้อมขาย');
  });

  it('formats signed deltas', () => {
    expect(formatStockDelta(4)).toBe('+4');
    expect(formatStockDelta(-2)).toBe('-2');
    expect(formatStockDelta(0)).toBe('0');
  });
});
