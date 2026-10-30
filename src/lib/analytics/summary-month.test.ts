import { describe, expect, it } from 'vitest';
import {
  bangkokYearMonthFromDate,
  clampYearMonth,
  compareYearMonth,
  formatTimeSinceLastOrder,
  toMonthInputValue,
} from './summary-month';

describe('summary-month', () => {
  it('parses Bangkok year/month from an ISO timestamp', () => {
    // 2025-12-31 20:00 UTC = 2026-01-01 03:00 Bangkok
    expect(bangkokYearMonthFromDate('2025-12-31T20:00:00.000Z')).toEqual({
      year: 2026,
      month: 1,
    });
  });

  it('clamps below the account-creation month up to min', () => {
    expect(
      clampYearMonth({ year: 2025, month: 1 }, { year: 2025, month: 7 }, { year: 2026, month: 10 }),
    ).toEqual({ year: 2025, month: 7 });
  });

  it('compares year-months chronologically', () => {
    expect(compareYearMonth({ year: 2025, month: 12 }, { year: 2026, month: 1 })).toBeLessThan(0);
  });

  it('formats month input values', () => {
    expect(toMonthInputValue(2026, 7)).toBe('2026-07');
  });

  it('formats time since last order', () => {
    expect(formatTimeSinceLastOrder(2, 16)).toBe('2 เดือน 16 วันมาแล้ว');
    expect(formatTimeSinceLastOrder(0, 5)).toBe('5 วันมาแล้ว');
    expect(formatTimeSinceLastOrder(0, 0)).toBe('เพิ่งสั่งซื้อ');
    expect(formatTimeSinceLastOrder(null, null)).toBe('—');
  });
});
