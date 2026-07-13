'use client';

import * as React from 'react';
import { HiEye, HiEyeSlash } from 'react-icons/hi2';
import { Input, type InputProps } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export const PasswordInput = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, id, ...props }, ref) => {
    const [visible, setVisible] = React.useState(false);

    return (
      <div className="relative">
        <Input
          id={id}
          ref={ref}
          type={visible ? 'text' : 'password'}
          className={cn('pr-10', className)}
          {...props}
        />
        <button
          type="button"
          className="absolute top-1/2 right-2 -translate-y-1/2 rounded p-1 text-muted hover:text-ink"
          onClick={() => setVisible((current) => !current)}
          aria-label={visible ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
          aria-pressed={visible}
        >
          {visible ? (
            <HiEyeSlash className="size-4" aria-hidden="true" />
          ) : (
            <HiEye className="size-4" aria-hidden="true" />
          )}
        </button>
      </div>
    );
  },
);
PasswordInput.displayName = 'PasswordInput';
