import { describe, expect, it } from 'vitest';
import {
  getCalendarDays,
  getThaiMonthLabels,
  getYearRange,
  isDateInRange,
  parseDateInputValue,
  toDateInputValue,
} from './calendarUtils';

describe('calendarUtils', () => {
  it('parses and serializes YYYY-MM-DD values', () => {
    expect(parseDateInputValue('1990-05-15')).toEqual({ year: 1990, month: 5, day: 15 });
    expect(toDateInputValue(1990, 5, 15)).toBe('1990-05-15');
  });

  it('rejects invalid date strings', () => {
    expect(parseDateInputValue('1990-02-30')).toBeNull();
    expect(parseDateInputValue('not-a-date')).toBeNull();
  });

  it('checks date range boundaries', () => {
    expect(isDateInRange('1990-05-15', '1990-01-01', '1990-12-31')).toBe(true);
    expect(isDateInRange('1989-12-31', '1990-01-01', '1990-12-31')).toBe(false);
    expect(isDateInRange('1991-01-01', '1990-01-01', '1990-12-31')).toBe(false);
  });

  it('builds Thai month labels and year range', () => {
    expect(getThaiMonthLabels(1990)[4]).toBe('พฤษภาคม');
    expect(getYearRange('1990-01-01', '1992-12-31')).toEqual([1992, 1991, 1990]);
  });

  it('pads calendar cells to full weeks', () => {
    const cells = getCalendarDays(1990, 5);
    expect(cells.length % 7).toBe(0);
    expect(cells.some((cell) => cell.date === '1990-05-15')).toBe(true);
  });
});
