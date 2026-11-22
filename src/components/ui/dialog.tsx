'use client';

import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { cn } from '@/lib/utils';

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;
export const DialogPortal = DialogPrimitive.Portal;

export const DialogOverlay = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn('fixed inset-0 z-50 bg-ink/40 backdrop-blur-[2px]', className)}
    {...props}
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

function isSelectLayerEvent(event: { target: EventTarget | null }) {
  const target = event.target as HTMLElement | null;
  // Clicking a portaled Select item, or dismissing an open Select (click-through to overlay).
  return Boolean(
    target?.closest('[data-radix-select-content],[data-radix-popper-content-wrapper]') ||
    document.querySelector('[data-radix-select-content]'),
  );
}

export const DialogContent = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(
  (
    { className, children, onPointerDownOutside, onInteractOutside, onFocusOutside, ...props },
    ref,
  ) => {
    return (
      <DialogPortal>
        <DialogOverlay />
        <DialogPrimitive.Content
          ref={ref}
          onPointerDownOutside={(event) => {
            if (isSelectLayerEvent(event)) {
              event.preventDefault();
            }
            onPointerDownOutside?.(event);
          }}
          onInteractOutside={(event) => {
            if (isSelectLayerEvent(event)) {
              event.preventDefault();
            }
            onInteractOutside?.(event);
          }}
          onFocusOutside={(event) => {
            if (isSelectLayerEvent(event)) {
              event.preventDefault();
            }
            onFocusOutside?.(event);
          }}
          className={cn(
            'fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-white p-6 shadow-[var(--shadow-elevated)] focus:outline-none',
            className,
          )}
          {...props}
        >
          {children}
        </DialogPrimitive.Content>
      </DialogPortal>
    );
  },
);
DialogContent.displayName = DialogPrimitive.Content.displayName;

export function DialogHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('mb-4 space-y-1.5', className)} {...props} />;
}

export function DialogTitle({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      className={cn('font-display text-lg font-semibold text-ink', className)}
      {...props}
    />
  );
}

export function DialogDescription({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>) {
  return <DialogPrimitive.Description className={cn('text-sm text-muted', className)} {...props} />;
}

export function DialogFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('mt-6 flex justify-end gap-2', className)} {...props} />;
}
