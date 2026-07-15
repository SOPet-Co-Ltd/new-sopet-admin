import { describe, expect, it } from 'vitest';
import { formatCombinationLabel } from '@/lib/variants';

describe('formatCombinationLabel', () => {
  it('sorts option keys before joining with middle-dot separator', () => {
    expect(formatCombinationLabel({ รสชาติ: 'ปลาแซลมอน', ขนาด: '1.5kg' })).toBe(
      'ขนาด: 1.5kg · รสชาติ: ปลาแซลมอน',
    );
  });

  it('returns empty string for empty options', () => {
    expect(formatCombinationLabel({})).toBe('');
  });
});
