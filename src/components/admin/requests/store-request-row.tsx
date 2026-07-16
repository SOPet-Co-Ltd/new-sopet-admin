'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { labelStoreRequestStatus } from '@/lib/i18n/th';
import { cn, formatDateTime } from '@/lib/utils';
import type { StoreRequest } from '@/types';

export interface StoreRequestRowProps {
  request: StoreRequest;
  highlighted?: boolean;
  isNextUp?: boolean;
  approvePending?: boolean;
  rejectPending?: boolean;
  onApprove: (id: string) => void;
  onReject: (id: string, reason?: string) => void;
}

export function StoreRequestRow({
  request,
  highlighted = false,
  isNextUp = false,
  approvePending = false,
  rejectPending = false,
  onApprove,
  onReject,
}: StoreRequestRowProps) {
  const [rejecting, setRejecting] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const contactParts = [request.contactEmail, request.contactPhone].filter(Boolean);
  const showNextUp = isNextUp && !highlighted;

  function handleCancelReject() {
    setRejecting(false);
    setRejectReason('');
  }

  async function handleConfirmReject() {
    await onReject(request.id, rejectReason || undefined);
    handleCancelReject();
  }

  return (
    <article
      id={`store-request-${request.id}`}
      className={cn(
        'rounded-lg border px-4 py-3 transition-colors',
        highlighted || showNextUp
          ? 'border-brand/40 bg-brand-tint/50 ring-1 ring-brand/20'
          : 'border-border bg-card',
      )}
      aria-labelledby={`store-request-name-${request.id}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 id={`store-request-name-${request.id}`} className="font-medium text-ink">
              {request.name}
            </h3>
            {showNextUp ? (
              <Badge className="border border-brand/20 bg-brand-tint text-brand">ถัดไป</Badge>
            ) : null}
          </div>
          {contactParts.length > 0 ? (
            <p className="mt-0.5 text-sm text-muted-foreground">{contactParts.join(' · ')}</p>
          ) : null}
          {request.createdAt ? (
            <p className="mt-0.5 text-xs text-muted-foreground">
              ส่งเมื่อ {formatDateTime(request.createdAt)}
            </p>
          ) : null}
        </div>
        <Badge status="processing">{labelStoreRequestStatus(request.status)}</Badge>
      </div>

      {request.description ? (
        <p className="mt-2 text-sm text-pretty text-muted-foreground">{request.description}</p>
      ) : null}

      {rejecting ? (
        <div className="mt-3 flex flex-wrap items-end gap-2 border-t border-border pt-3">
          <div className="min-w-[200px] flex-1">
            <Label htmlFor={`reason-${request.id}`}>เหตุผลการปฏิเสธ</Label>
            <Input
              id={`reason-${request.id}`}
              value={rejectReason}
              placeholder="ระบุเหตุผล (ไม่บังคับ)"
              autoComplete="off"
              onChange={(event) => setRejectReason(event.target.value)}
              className="mt-1.5"
            />
          </div>
          <Button
            type="button"
            size="sm"
            variant="destructive"
            disabled={rejectPending}
            aria-busy={rejectPending}
            onClick={() => void handleConfirmReject()}
          >
            ยืนยันปฏิเสธ
          </Button>
          <Button type="button" size="sm" variant="outline" onClick={handleCancelReject}>
            ยกเลิก
          </Button>
        </div>
      ) : (
        <div className="mt-3 flex flex-wrap gap-2 border-t border-border pt-3">
          <Button
            type="button"
            size="sm"
            disabled={approvePending}
            aria-busy={approvePending}
            className={cn(showNextUp && 'shadow-sm')}
            onClick={() => onApprove(request.id)}
          >
            อนุมัติ
          </Button>
          <Button type="button" size="sm" variant="destructive" onClick={() => setRejecting(true)}>
            ปฏิเสธ
          </Button>
        </div>
      )}
    </article>
  );
}
