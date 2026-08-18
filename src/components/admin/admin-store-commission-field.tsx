'use client';

import * as React from 'react';
import type { UseFormRegisterReturn } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { commissionCopy } from '@/lib/i18n/th';
import { cn } from '@/lib/utils';

export const numberRegisterOptions = {
  setValueAs: (value: unknown) => {
    if (value === '' || value === null || value === undefined) return undefined;
    const parsed = Number(value);
    return Number.isNaN(parsed) ? undefined : parsed;
  },
};

const AdornedNumberInput = React.forwardRef<
  HTMLInputElement,
  React.ComponentProps<typeof Input> & {
    prefix?: string;
    suffix?: string;
    wrapperClassName?: string;
  }
>(function AdornedNumberInput({ id, prefix, suffix, wrapperClassName, className, ...props }, ref) {
  return (
    <div className={cn('relative mt-1.5', wrapperClassName)}>
      {prefix ? (
        <span
          className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm font-medium text-muted-foreground"
          aria-hidden="true"
        >
          {prefix}
        </span>
      ) : null}
      <Input
        id={id}
        ref={ref}
        className={cn(prefix && 'pl-8', suffix && 'pr-8', className)}
        {...props}
      />
      {suffix ? (
        <span
          className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm font-medium text-muted-foreground"
          aria-hidden="true"
        >
          {suffix}
        </span>
      ) : null}
    </div>
  );
});

export type AdminStoreCommissionFieldProps = {
  id?: string;
  registration: UseFormRegisterReturn;
  error?: string;
  hintMode: 'default' | 'custom';
  describedByIds?: string;
};

export function AdminStoreCommissionField({
  id = 'commissionRate',
  registration,
  error,
  hintMode,
  describedByIds,
}: AdminStoreCommissionFieldProps) {
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const hint =
    hintMode === 'custom' ? commissionCopy.rate.hint.custom : commissionCopy.rate.hint.default;
  const describedBy =
    [describedByIds, hintId, error ? errorId : undefined].filter(Boolean).join(' ') || undefined;

  return (
    <div>
      <Label htmlFor={id} required>
        {commissionCopy.rate.label}
      </Label>
      <AdornedNumberInput
        id={id}
        type="number"
        inputMode="numeric"
        step={1}
        min={0}
        max={100}
        suffix={commissionCopy.rate.suffix}
        aria-invalid={!!error}
        aria-describedby={describedBy}
        {...registration}
      />
      <p id={hintId} className="mt-1 text-xs text-muted-foreground">
        {hint}
      </p>
      {error ? (
        <p id={errorId} className="mt-1 text-xs text-danger" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
