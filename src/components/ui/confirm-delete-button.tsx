'use client';

import { useState, type ReactNode } from 'react';
import { ConfirmDeleteDialog } from '@/components/ui/confirm-delete-dialog';
import { Button } from '@/components/ui/button';

export interface ConfirmDeleteButtonProps {
  confirmLabel: string;
  title: string;
  description?: ReactNode;
  confirmButtonLabel?: string;
  onConfirm: () => Promise<void>;
  isDeleting?: boolean;
  disabled?: boolean;
  size?: 'sm' | 'default';
  variant?: 'outline' | 'destructive';
  children?: ReactNode;
}

export function ConfirmDeleteButton({
  confirmLabel,
  title,
  description,
  confirmButtonLabel,
  onConfirm,
  isDeleting = false,
  disabled = false,
  size = 'sm',
  variant = 'outline',
  children = 'ลบ',
}: ConfirmDeleteButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        type="button"
        size={size}
        variant={variant}
        disabled={disabled || isDeleting}
        aria-busy={isDeleting}
        onClick={() => setOpen(true)}
      >
        {children}
      </Button>
      <ConfirmDeleteDialog
        open={open}
        onOpenChange={setOpen}
        title={title}
        confirmLabel={confirmLabel}
        description={description}
        confirmButtonLabel={confirmButtonLabel}
        isDeleting={isDeleting}
        onConfirm={onConfirm}
      />
    </>
  );
}
