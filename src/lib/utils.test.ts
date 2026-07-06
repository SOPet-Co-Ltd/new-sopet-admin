import { describe, expect, it } from 'vitest';
import { cn, formatCurrency } from './utils';

describe('cn', () => {
  it('merges class names and resolves Tailwind conflicts', () => {
    expect(cn('px-2', 'px-4', false && 'hidden', 'text-ink')).toBe('px-4 text-ink');
  });
});

describe('formatCurrency', () => {
  it('formats THB amounts in Thai locale', () => {
    const formatted = formatCurrency(1234.5);
    expect(formatted).toContain('1,234');
    expect(formatted).toMatch(/฿|THB/);
  });
});
