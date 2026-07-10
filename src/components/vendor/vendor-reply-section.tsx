'use client';

import { useEffect, useState } from 'react';
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
  const effectiveReply = optimisticReply ?? reply ?? null;
  const hasReply = Boolean(effectiveReply?.id);

  useEffect(() => {
    if (reply?.id && optimisticReply?.id === reply.id) {
      setOptimisticReply(null);
    }
  }, [reply, optimisticReply?.id]);

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
        <div className="mt-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
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
      <div className="mt-3 space-y-2">
        <p className="text-xs font-medium text-muted">คำตอบของร้าน</p>
        <p className="line-clamp-2 text-sm text-ink">{effectiveReply?.body}</p>
        {effectiveReply?.updatedAt ? (
          <p className="text-xs text-muted">{formatDateTime(effectiveReply.updatedAt)}</p>
        ) : null}
        <Button
          type="button"
          variant="outline"
          size="sm"
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
    <div className="mt-3 space-y-2" id={panelId}>
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
        aria-expanded
        aria-controls={panelId}
        onClick={collapse}
      >
        {hasReply ? 'ซ่อน' : 'ยกเลิก'}
      </Button>
    </div>
  );
}
