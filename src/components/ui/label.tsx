'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}

export function Label({ className, required, children, ...props }: LabelProps) {
  return (
    <label className={cn('text-sm font-medium text-ink', className)} {...props}>
      {children}
      {required ? <span className="text-danger"> *</span> : null}
    </label>
  );
}
