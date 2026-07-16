'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { formatDateTime } from '@/lib/utils';
import type { ReviewReply } from '@/types';
import { VendorReplyForm } from './vendor-reply-form';

type VendorReplySectionProps = {
  reviewId: string;
  reply?: ReviewReply | null;
  storeId: string;
};

export function VendorReplySection({ reviewId, reply, storeId }: VendorReplySectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [optimisticReply, setOptimisticReply] = useState<ReviewReply | null>(null);
  const panelId = `vendor-reply-panel-${reviewId}`;
  // Once the real reply catches up to the optimistic one, prefer the server value
  // instead of clearing optimisticReply via a setState-in-effect.
  const effectiveReply =
    reply?.id && optimisticReply?.id === reply.id ? reply : (optimisticReply ?? reply ?? null);
  const hasReply = Boolean(effectiveReply?.id);

  function collapse() {
    setIsExpanded(false);
  }

  function handleSaveSuccess(savedReply: ReviewReply) {
    setOptimisticReply(savedReply);
    collapse();
  }

  if (!isExpanded) {
    if (!hasReply) {
      return (
        <div className="mt-1">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="min-h-9 transition-colors duration-150 motion-reduce:transition-none"
            aria-expanded={false}
            aria-controls={panelId}
            onClick={() => setIsExpanded(true)}
          >
            ตอบกลับ
          </Button>
        </div>
      );
    }

    return (
      <div className="mt-1 rounded-lg border border-border bg-surface/60 px-3 py-3">
        <p className="text-xs font-medium text-muted-foreground">คำตอบของร้าน</p>
        <p className="mt-1.5 line-clamp-2 text-pretty text-sm text-ink">{effectiveReply?.body}</p>
        {effectiveReply?.updatedAt ? (
          <p className="mt-1 text-xs text-muted-foreground">
            {formatDateTime(effectiveReply.updatedAt)}
          </p>
        ) : null}
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-2.5 min-h-9 transition-colors duration-150 motion-reduce:transition-none"
          aria-expanded={false}
          aria-controls={panelId}
          onClick={() => setIsExpanded(true)}
        >
          แก้ไข
        </Button>
      </div>
    );
  }

  return (
    <div
      className="mt-1 rounded-lg border border-border bg-surface/40 px-3 py-3 transition-opacity duration-200 ease-out motion-reduce:transition-none"
      id={panelId}
    >
      <VendorReplyForm
        reviewId={reviewId}
        reply={effectiveReply}
        storeId={storeId}
        onSaveSuccess={handleSaveSuccess}
      />
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="mt-1 min-h-9 transition-colors duration-150 motion-reduce:transition-none"
        aria-expanded
        aria-controls={panelId}
        onClick={collapse}
      >
        {hasReply ? 'ซ่อน' : 'ยกเลิก'}
      </Button>
    </div>
  );
}
