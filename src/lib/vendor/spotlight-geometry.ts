/**
 * Shared geometry helpers for product-tour / feature spotlights.
 */

export type SpotlightTargetRect = {
  top: number;
  left: number;
  width: number;
  height: number;
};

const VIEWPORT_MARGIN = 16;

/** Keep the cutout inside the visible viewport (avoids ring/mask overflow). */
export function clampRectToViewport(
  rect: SpotlightTargetRect,
  viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1024,
  viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 768,
): SpotlightTargetRect {
  const left = Math.min(Math.max(0, rect.left), viewportWidth);
  const top = Math.min(Math.max(0, rect.top), viewportHeight);
  const right = Math.min(viewportWidth, Math.max(left, rect.left + rect.width));
  const bottom = Math.min(viewportHeight, Math.max(top, rect.top + rect.height));
  return {
    left,
    top,
    width: Math.max(0, right - left),
    height: Math.max(0, bottom - top),
  };
}

/** Place tooltip near target; always keep fully inside the viewport. */
export function clampTooltipPosition(
  target: SpotlightTargetRect | null,
  tooltipWidth: number,
  tooltipHeight: number,
  gap = 12,
  viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1024,
  viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 768,
  margin = VIEWPORT_MARGIN,
): { top: number; left: number } {
  const maxLeft = Math.max(margin, viewportWidth - tooltipWidth - margin);
  const maxTop = Math.max(margin, viewportHeight - tooltipHeight - margin);

  if (!target) {
    return {
      top: Math.min(maxTop, Math.max(margin, (viewportHeight - tooltipHeight) / 2)),
      left: Math.min(maxLeft, Math.max(margin, (viewportWidth - tooltipWidth) / 2)),
    };
  }

  let top = target.top + target.height + gap;
  let left = target.left;

  // Prefer below; flip above if it would overflow the bottom.
  if (top + tooltipHeight > viewportHeight - margin) {
    top = target.top - tooltipHeight - gap;
  }

  // Final clamp so the card never leaves the viewport (tall tooltips / edge targets).
  top = Math.min(maxTop, Math.max(margin, top));
  left = Math.min(maxLeft, Math.max(margin, left));

  return { top, left };
}
