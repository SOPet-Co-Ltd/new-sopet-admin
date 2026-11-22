'use client';

import { useLayoutEffect, useRef, useState, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  clampRectToViewport,
  clampTooltipPosition,
  type SpotlightTargetRect,
} from '@/lib/vendor/spotlight-geometry';

const PADDING = 8;

function useIsClient(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

function readPrefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Single-step spotlight for page-level guides (any vendor route).
 * Portaled to document.body so CSS transforms on dialogs / sheets cannot clip it.
 */
export function FeatureSpotlightOverlay({
  targetId,
  title,
  body,
  eyebrow = 'คำแนะนำ',
  primaryLabel = 'เข้าใจแล้ว',
  skipLabel = 'ข้าม',
  onPrimary,
  onSkip,
}: {
  targetId: string;
  title: string;
  body: string;
  eyebrow?: string;
  primaryLabel?: string;
  skipLabel?: string;
  onPrimary: () => void;
  onSkip: () => void;
}) {
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [targetRect, setTargetRect] = useState<SpotlightTargetRect | null>(null);
  const [tooltipSize, setTooltipSize] = useState({ width: 320, height: 180 });
  const [reducedMotion] = useState(readPrefersReducedMotion);
  const mounted = useIsClient();
  const maskId = `feature-spotlight-mask-${targetId.replace(/[^a-zA-Z0-9_-]/g, '-')}`;

  useLayoutEffect(() => {
    function measureTarget() {
      const el = document.querySelector<HTMLElement>(`[data-tour-id="${targetId}"]`);
      if (!el) {
        setTargetRect(null);
        return;
      }
      const rect = el.getBoundingClientRect();
      setTargetRect(
        clampRectToViewport({
          top: rect.top - PADDING,
          left: rect.left - PADDING,
          width: rect.width + PADDING * 2,
          height: rect.height + PADDING * 2,
        }),
      );
      el.scrollIntoView({
        block: 'nearest',
        inline: 'nearest',
        behavior: reducedMotion ? 'auto' : 'smooth',
      });
    }

    function measureTooltip() {
      const node = tooltipRef.current;
      if (!node) return;
      const rect = node.getBoundingClientRect();
      setTooltipSize((prev) =>
        prev.width === rect.width && prev.height === rect.height
          ? prev
          : { width: rect.width, height: rect.height },
      );
    }

    measureTarget();
    measureTooltip();
    window.addEventListener('resize', measureTarget);
    window.addEventListener('scroll', measureTarget, true);
    return () => {
      window.removeEventListener('resize', measureTarget);
      window.removeEventListener('scroll', measureTarget, true);
    };
  }, [targetId, reducedMotion]);

  useLayoutEffect(() => {
    const node = tooltipRef.current;
    if (!node) return;
    const rect = node.getBoundingClientRect();
    setTooltipSize((prev) =>
      prev.width === rect.width && prev.height === rect.height
        ? prev
        : { width: rect.width, height: rect.height },
    );
  }, [title, body, primaryLabel, targetRect]);

  const tooltipPos = clampTooltipPosition(targetRect, tooltipSize.width, tooltipSize.height);

  if (!mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] overflow-hidden"
      role="dialog"
      aria-modal="true"
      aria-labelledby="feature-spotlight-title"
    >
      <svg className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true">
        <defs>
          <mask id={maskId}>
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            {targetRect && targetRect.width > 0 && targetRect.height > 0 ? (
              <rect
                x={targetRect.left}
                y={targetRect.top}
                width={targetRect.width}
                height={targetRect.height}
                rx="10"
                fill="black"
                className={cn(!reducedMotion && 'transition-all duration-200')}
              />
            ) : null}
          </mask>
        </defs>
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="rgba(15, 23, 42, 0.55)"
          mask={`url(#${maskId})`}
        />
      </svg>

      {targetRect && targetRect.width > 0 && targetRect.height > 0 ? (
        <div
          className="pointer-events-none absolute rounded-[10px] ring-2 ring-brand"
          style={{
            top: targetRect.top,
            left: targetRect.left,
            width: targetRect.width,
            height: targetRect.height,
            transition: reducedMotion ? undefined : 'all 200ms ease',
          }}
          aria-hidden="true"
        />
      ) : null}

      <div
        ref={tooltipRef}
        className="absolute z-[101] max-h-[min(70vh,28rem)] w-[min(100vw-2rem,22rem)] overflow-y-auto rounded-xl border border-border bg-white p-4 shadow-[var(--shadow-elevated)]"
        style={{ top: tooltipPos.top, left: tooltipPos.left }}
      >
        <p className="text-xs font-medium text-muted">{eyebrow}</p>
        <h2 id="feature-spotlight-title" className="mt-1 font-display text-lg font-medium text-ink">
          {title}
        </h2>
        <p className="mt-1.5 text-sm leading-relaxed text-muted text-pretty">{body}</p>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Button type="button" variant="ghost" size="sm" onClick={onSkip}>
            {skipLabel}
          </Button>
          <div className="ml-auto">
            <Button type="button" size="sm" onClick={onPrimary}>
              {primaryLabel}
            </Button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
