'use client';

import { useState, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { isApiError } from '@/lib/api/errors';

export interface ConfirmDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  confirmLabel: string;
  description?: ReactNode;
  confirmButtonLabel?: string;
  isDeleting?: boolean;
  onConfirm: () => Promise<void>;
}

export function ConfirmDeleteDialog({
  open,
  onOpenChange,
  title,
  confirmLabel,
  description,
  confirmButtonLabel = 'ลบ',
  isDeleting = false,
  onConfirm,
}: ConfirmDeleteDialogProps) {
  const [error, setError] = useState<string | null>(null);
  const [confirmText, setConfirmText] = useState('');
  const [prevOpen, setPrevOpen] = useState(open);

  if (open !== prevOpen) {
    setPrevOpen(open);
    if (!open) {
      setError(null);
      setConfirmText('');
    }
  }

  const textConfirmed = confirmText.trim() === confirmLabel.trim();

  async function handleConfirm() {
    if (!textConfirmed) {
      return;
    }

    setError(null);
    try {
      await onConfirm();
      onOpenChange(false);
    } catch (err) {
      setError(isApiError(err) ? err.message : 'ลบไม่สำเร็จ');
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            การลบ &quot;{confirmLabel}&quot; ไม่สามารถย้อนกลับได้
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {description ? <div className="text-sm text-muted">{description}</div> : null}

          <div className="space-y-2">
            <Label htmlFor="confirm-delete-text" required>
              พิมพ์ &quot;{confirmLabel}&quot; เพื่อยืนยัน
            </Label>
            <Input
              id="confirm-delete-text"
              value={confirmText}
              onChange={(event) => setConfirmText(event.target.value)}
              placeholder={confirmLabel}
              disabled={isDeleting}
              autoComplete="off"
              aria-invalid={confirmText.length > 0 && !textConfirmed}
            />
            {confirmText.length > 0 && !textConfirmed ? (
              <p role="alert" className="text-xs text-danger">
                ข้อความไม่ตรงกับรายการที่จะลบ
              </p>
            ) : null}
          </div>
        </div>

        {error ? (
          <p role="alert" className="text-sm text-danger">
            {error}
          </p>
        ) : null}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            disabled={isDeleting}
            onClick={() => onOpenChange(false)}
          >
            ยกเลิก
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={isDeleting || !textConfirmed}
            aria-busy={isDeleting}
            onClick={() => void handleConfirm()}
          >
            {isDeleting ? 'กำลังลบ...' : confirmButtonLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
