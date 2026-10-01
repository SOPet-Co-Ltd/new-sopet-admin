import { describe, expect, it } from 'vitest';
import { clampRectToViewport, clampTooltipPosition } from './spotlight-geometry';

describe('spotlight-geometry', () => {
  it('clamps target rect that overflows the viewport', () => {
    expect(clampRectToViewport({ top: -20, left: -10, width: 400, height: 100 }, 300, 200)).toEqual(
      { top: 0, left: 0, width: 300, height: 80 },
    );
  });

  it('keeps tooltip fully inside the viewport when target is near the bottom', () => {
    const pos = clampTooltipPosition(
      { top: 700, left: 40, width: 200, height: 40 },
      320,
      200,
      12,
      800,
      800,
      16,
    );
    expect(pos.top + 200).toBeLessThanOrEqual(800 - 16);
    expect(pos.top).toBeGreaterThanOrEqual(16);
    expect(pos.left).toBeGreaterThanOrEqual(16);
    expect(pos.left + 320).toBeLessThanOrEqual(800 - 16);
  });

  it('keeps centered fallback inside the viewport', () => {
    const pos = clampTooltipPosition(null, 320, 180, 12, 400, 300, 16);
    expect(pos.top).toBeGreaterThanOrEqual(16);
    expect(pos.top + 180).toBeLessThanOrEqual(300 - 16);
  });
});
