import { HiCheck } from 'react-icons/hi2';
import { cn } from '@/lib/utils';

export interface WizardStep {
  label: string;
}

interface StepperProps {
  steps: WizardStep[];
  currentStep: number;
  className?: string;
}

type StepStatus = 'complete' | 'current' | 'upcoming';

function statusFor(stepNumber: number, currentStep: number): StepStatus {
  if (stepNumber < currentStep) return 'complete';
  if (stepNumber === currentStep) return 'current';
  return 'upcoming';
}

export function Stepper({ steps, currentStep, className }: StepperProps) {
  return (
    <ol
      aria-label={`ขั้นที่ ${currentStep} จาก ${steps.length}`}
      className={cn('flex items-start', className)}
    >
      {steps.map((step, index) => {
        const stepNumber = index + 1;
        const status = statusFor(stepNumber, currentStep);
        const isLast = index === steps.length - 1;

        return (
          <li key={step.label} className={cn('flex items-start', !isLast && 'flex-1')}>
            <div className="flex flex-col items-center gap-1.5">
              <span
                className={cn(
                  'flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition-colors',
                  status === 'complete' && 'bg-brand text-white',
                  status === 'current' && 'border-2 border-brand bg-brand-tint text-brand',
                  status === 'upcoming' && 'border border-border bg-surface text-muted',
                )}
                aria-hidden="true"
              >
                {status === 'complete' ? <HiCheck className="size-4" /> : <span>{stepNumber}</span>}
              </span>
              <span
                aria-current={status === 'current' ? 'step' : undefined}
                className={cn(
                  'max-w-26 text-center text-xs font-medium sm:max-w-32 sm:text-sm',
                  status === 'upcoming' ? 'text-muted' : 'text-ink',
                )}
              >
                {step.label}
              </span>
            </div>
            {!isLast ? (
              <div
                className={cn(
                  'mx-2 mt-4 h-px flex-1 sm:mx-3',
                  status === 'complete' ? 'bg-brand' : 'bg-border',
                )}
                aria-hidden="true"
              />
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
