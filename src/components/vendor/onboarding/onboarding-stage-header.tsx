'use client';

import { HiCheck } from 'react-icons/hi2';
import { cn } from '@/lib/utils';
import type { OnboardingChecklistItem, OnboardingPhaseDefinition } from '@/lib/vendor/onboarding';

type OnboardingStageHeaderProps = {
  phase: OnboardingPhaseDefinition;
  currentTaskLabel: string;
  checklist: OnboardingChecklistItem[];
  className?: string;
};

export function OnboardingStageHeader({
  phase,
  currentTaskLabel,
  checklist,
  className,
}: OnboardingStageHeaderProps) {
  return (
    <section
      className={cn('rounded-xl border border-border bg-card px-4 py-4 sm:px-5 sm:py-5', className)}
      aria-labelledby="onboarding-stage-title"
    >
      <div className="space-y-1">
        <p className="text-xs font-medium tracking-wide text-muted uppercase">
          ระยะ {phase.id} จาก 3 · {phase.label}
        </p>
        <h2 id="onboarding-stage-title" className="font-display text-lg font-medium text-ink">
          {currentTaskLabel}
        </h2>
        <p className="text-sm text-muted text-pretty">{phase.reassurance}</p>
      </div>

      {checklist.length > 1 ? (
        <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-2" aria-label="งานในระยะนี้">
          {checklist.map((item) => (
            <li
              key={item.stepId}
              className={cn(
                'inline-flex items-center gap-1.5 text-sm',
                item.status === 'upcoming' && 'text-muted-foreground',
                item.status === 'complete' && 'text-ink',
                item.status === 'current' && 'font-medium text-ink',
              )}
            >
              <span
                className={cn(
                  'flex size-4 shrink-0 items-center justify-center rounded-full',
                  item.status === 'complete' && 'bg-brand text-white',
                  item.status === 'current' && 'border border-brand bg-brand-tint',
                  item.status === 'upcoming' && 'border border-border bg-canvas',
                )}
                aria-hidden="true"
              >
                {item.status === 'complete' ? <HiCheck className="size-2.5" /> : null}
                {item.status === 'current' ? (
                  <span className="size-1.5 rounded-full bg-brand" />
                ) : null}
              </span>
              <span aria-current={item.status === 'current' ? 'step' : undefined}>
                {item.label}
              </span>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
