'use client';

import { HiCheck } from 'react-icons/hi2';
import { cn } from '@/lib/utils';
import type { OnboardingPhaseRailItem } from '@/lib/vendor/onboarding';

type OnboardingPhaseRailProps = {
  phases: OnboardingPhaseRailItem[];
  className?: string;
};

export function OnboardingPhaseRail({ phases, className }: OnboardingPhaseRailProps) {
  const currentIndex = phases.findIndex((phase) => phase.status === 'current');
  const currentLabel = currentIndex >= 0 ? phases[currentIndex]!.label : phases[0]?.label;

  return (
    <ol
      aria-label={`ขั้นตอน ${currentLabel ?? ''} — ระยะที่ ${currentIndex + 1} จาก ${phases.length}`}
      className={cn('grid grid-cols-3 gap-2 sm:gap-4', className)}
    >
      {phases.map((phase, index) => {
        const prevComplete = index > 0 && phases[index - 1]!.status === 'complete';
        const showLeftLine = index > 0;
        const showRightLine = index < phases.length - 1;

        return (
          <li key={phase.id} className="relative flex flex-col items-center gap-2">
            {showLeftLine ? (
              <span
                className={cn(
                  'absolute top-[1.125rem] right-1/2 left-0 h-px -translate-y-1/2',
                  prevComplete || phase.status === 'complete' || phase.status === 'current'
                    ? 'bg-brand'
                    : 'bg-border',
                )}
                aria-hidden="true"
              />
            ) : null}
            {showRightLine ? (
              <span
                className={cn(
                  'absolute top-[1.125rem] right-0 left-1/2 h-px -translate-y-1/2',
                  phase.status === 'complete' ? 'bg-brand' : 'bg-border',
                )}
                aria-hidden="true"
              />
            ) : null}

            <span
              className={cn(
                'relative z-10 flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition-colors duration-150 ease-out',
                phase.status === 'complete' && 'bg-brand text-white',
                phase.status === 'current' && 'border-2 border-brand bg-brand-tint text-brand',
                phase.status === 'upcoming' && 'border border-border bg-card text-muted-foreground',
              )}
              aria-hidden="true"
            >
              {phase.status === 'complete' ? (
                <HiCheck className="size-4" />
              ) : (
                <span>{phase.id}</span>
              )}
            </span>
            <span
              aria-current={phase.status === 'current' ? 'step' : undefined}
              className={cn(
                'relative z-10 text-center text-sm font-medium leading-tight text-pretty',
                phase.status === 'upcoming' && 'text-muted-foreground',
                phase.status === 'complete' && 'text-ink',
                phase.status === 'current' && 'font-semibold text-ink',
              )}
            >
              {phase.label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
