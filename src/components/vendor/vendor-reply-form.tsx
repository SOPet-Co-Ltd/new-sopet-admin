'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useCreateReviewReply, useUpdateReviewReply } from '@/hooks/useReviews';
import { isApiError } from '@/lib/api/errors-core';
import type { ReviewReply } from '@/types';

export const REVIEW_REPLY_MAX_LENGTH = 1000;
const MAX_LENGTH_ERROR = 'ข้อความยาวเกิน 1,000 ตัวอักษร';
const SUCCESS_MESSAGE = 'บันทึกแล้ว';

export function mapVendorReplyError(error: unknown): string {
  if (isApiError(error)) {
    if (error.code === 'STORE_ACCESS_DENIED') {
      return 'ไม่มีสิทธิ์ตอบรีวิวนี้';
    }
    if (error.code === 'REVIEW_REPLY_ALREADY_EXISTS') {
      return 'มีคำตอบอยู่แล้ว';
    }
    if (error.code === 'REVIEW_REPLY_BODY_TOO_LONG') {
      return MAX_LENGTH_ERROR;
    }
  }

  return error instanceof Error ? error.message : 'บันทึกไม่สำเร็จ';
}

type VendorReplyFormProps = {
  reviewId: string;
  reply?: ReviewReply | null;
  storeId: string;
  onSaveSuccess?: (savedReply: ReviewReply) => void;
};

export function VendorReplyForm({ reviewId, reply, storeId, onSaveSuccess }: VendorReplyFormProps) {
  const [draftBody, setDraftBody] = useState(reply?.body ?? '');
  const [inlineError, setInlineError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loadedKey, setLoadedKey] = useState(`${reviewId}:${reply?.body ?? ''}`);
  const createMutation = useCreateReviewReply(storeId);
  const updateMutation = useUpdateReviewReply(storeId);
  const isPending = createMutation.isPending || updateMutation.isPending;

  const currentKey = `${reviewId}:${reply?.body ?? ''}`;
  if (currentKey !== loadedKey) {
    setLoadedKey(currentKey);
    setDraftBody(reply?.body ?? '');
    setInlineError(null);
    setSuccessMessage(null);
  }

  useEffect(() => {
    if (!successMessage) {
      return undefined;
    }

    const timerId = window.setTimeout(() => setSuccessMessage(null), 3000);
    return () => window.clearTimeout(timerId);
  }, [successMessage]);

  const trimmed = draftBody.trim();
  const isTooLong = draftBody.length > REVIEW_REPLY_MAX_LENGTH;
  const savedBody = reply?.body ?? '';
  const isDirty = reply?.id ? draftBody !== savedBody : trimmed.length > 0;
  const canSubmit = isDirty && trimmed.length > 0 && !isTooLong && !isPending;

  async function handleSubmit() {
    if (!canSubmit) {
      return;
    }

    setInlineError(null);
    setSuccessMessage(null);

    try {
      const savedReply = reply?.id
        ? await updateMutation.mutateAsync({ replyId: reply.id, body: draftBody })
        : await createMutation.mutateAsync({ reviewId, body: draftBody });
      setSuccessMessage(SUCCESS_MESSAGE);
      onSaveSuccess?.(savedReply);
    } catch (error) {
      setInlineError(mapVendorReplyError(error));
    }
  }

  const labelId = `vendor-reply-label-${reviewId}`;

  return (
    <div className="mt-4 space-y-2">
      <p id={labelId} className="text-sm font-medium text-ink">
        ตอบกลับรีวิว
      </p>
      <Textarea
        value={draftBody}
        onChange={(event) => {
          setDraftBody(event.target.value);
          if (inlineError) {
            setInlineError(null);
          }
          if (successMessage) {
            setSuccessMessage(null);
          }
        }}
        aria-labelledby={labelId}
        aria-invalid={isTooLong || Boolean(inlineError)}
        aria-busy={isPending}
        aria-describedby={`reply-counter-${reviewId}`}
        maxLength={REVIEW_REPLY_MAX_LENGTH}
      />
      <div className="flex items-center justify-between gap-2">
        <p
          id={`reply-counter-${reviewId}`}
          className={`text-xs ${isTooLong ? 'text-danger' : 'text-muted'}`}
        >
          {isTooLong ? MAX_LENGTH_ERROR : `${draftBody.length}/${REVIEW_REPLY_MAX_LENGTH}`}
        </p>
        <Button type="button" disabled={!canSubmit} onClick={handleSubmit}>
          {reply?.id ? 'อัปเดตคำตอบ' : 'บันทึกคำตอบ'}
        </Button>
      </div>
      {inlineError ? (
        <p className="text-sm text-danger" aria-live="polite">
          {inlineError}
        </p>
      ) : null}
      {successMessage ? (
        <p className="text-sm text-muted" aria-live="polite">
          {successMessage}
        </p>
      ) : null}
    </div>
  );
}
