'use client';

import Link from 'next/link';
import { useLayoutEffect, useRef, useState, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  STORE_READINESS_ACTIONS,
  STORE_READINESS_LABELS,
  type StoreReadinessChecklist,
} from '@/lib/stores/store-readiness';
import {
  clampRectToViewport,
  clampTooltipPosition,
  type SpotlightTargetRect,
} from '@/lib/vendor/spotlight-geometry';
import type { ProductTourStep } from '@/lib/vendor/product-tour';

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

export function SpotlightOverlay({
  step,
  stepIndex,
  stepCount,
  readiness,
  onNext,
  onBack,
  onSkip,
  onFinish,
}: {
  step: ProductTourStep;
  stepIndex: number;
  stepCount: number;
  readiness?: StoreReadinessChecklist | null;
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
  onFinish: () => void;
}) {
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [targetRect, setTargetRect] = useState<SpotlightTargetRect | null>(null);
  const [tooltipSize, setTooltipSize] = useState({ width: 320, height: 200 });
  const [reducedMotion] = useState(readPrefersReducedMotion);
  const mounted = useIsClient();
  const isLast = stepIndex >= stepCount - 1;
  const isNextActions = step.kind === 'next-actions';

  useLayoutEffect(() => {
    function measureTarget() {
      if (!step.targetId) {
        setTargetRect(null);
        return;
      }
      const el = document.querySelector<HTMLElement>(`[data-tour-id="${step.targetId}"]`);
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
  }, [step.targetId, step.id, reducedMotion, stepIndex]);

  useLayoutEffect(() => {
    const node = tooltipRef.current;
    if (!node) return;
    const rect = node.getBoundingClientRect();
    setTooltipSize((prev) =>
      prev.width === rect.width && prev.height === rect.height
        ? prev
        : { width: rect.width, height: rect.height },
    );
  }, [step.title, step.body, targetRect, stepIndex]);

  const tooltipPos = clampTooltipPosition(targetRect, tooltipSize.width, tooltipSize.height);
  const incomplete = readiness?.items.filter((item) => !item.complete) ?? [];

  if (!mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] overflow-hidden"
      role="dialog"
      aria-modal="true"
      aria-labelledby="product-tour-title"
    >
      <svg className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true">
        <defs>
          <mask id="product-tour-mask">
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
          mask="url(#product-tour-mask)"
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
        <p className="text-xs font-medium text-muted">
          ทัวร์แนะนำ · {stepIndex + 1}/{stepCount}
        </p>
        <h2 id="product-tour-title" className="mt-1 font-display text-lg font-medium text-ink">
          {step.title}
        </h2>
        <p className="mt-1.5 text-sm leading-relaxed text-muted text-pretty">{step.body}</p>

        {isNextActions ? (
          <ul className="mt-3 space-y-2 text-sm">
            {incomplete.length > 0 ? (
              incomplete.map((item) => (
                <li key={item.key}>
                  <Link
                    href={item.href}
                    className="font-medium text-brand hover:underline"
                    onClick={onFinish}
                  >
                    {STORE_READINESS_ACTIONS[item.key]}
                  </Link>
                  <span className="text-muted"> — {STORE_READINESS_LABELS[item.key]}</span>
                </li>
              ))
            ) : (
              <li className="text-muted">
                ตั้งค่าพร้อมขายครบแล้ว — เฝ้าดูคิวคำสั่งซื้อและเชิญทีมได้ตามต้องการ
              </li>
            )}
            <li>
              <Link
                href="/vendor/team"
                className="font-medium text-brand hover:underline"
                onClick={onFinish}
              >
                ไปทีมงาน
              </Link>
              <span className="text-muted"> — เชิญสมาชิกช่วยดูแลร้าน</span>
            </li>
            <li>
              <Link
                href="/vendor/orders?queue=action"
                className="font-medium text-brand hover:underline"
                onClick={onFinish}
              >
                ไปคิวคำสั่งซื้อ
              </Link>
            </li>
          </ul>
        ) : null}

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Button type="button" variant="ghost" size="sm" onClick={onSkip}>
            ข้าม
          </Button>
          <div className="ml-auto flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onBack}
              disabled={stepIndex === 0}
            >
              ย้อนกลับ
            </Button>
            {isLast ? (
              <Button type="button" size="sm" onClick={onFinish}>
                เสร็จสิ้น
              </Button>
            ) : (
              <Button type="button" size="sm" onClick={onNext}>
                ถัดไป
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
