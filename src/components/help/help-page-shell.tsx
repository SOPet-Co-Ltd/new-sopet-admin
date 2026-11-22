import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type HelpPageShellProps = {
  children: ReactNode;
  /** For tests: help-index | help-center */
  testId?: string;
  className?: string;
};

/**
 * Help pages use the dashboard shell width (max-w-6xl) only — no extra inner max-width.
 */
export function HelpPageShell({ children, testId, className }: HelpPageShellProps) {
  return (
    <div data-testid={testId} className={cn('w-full min-w-0 pb-8', className)}>
      {children}
    </div>
  );
}
