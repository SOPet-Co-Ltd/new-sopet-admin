'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardBody, CardHeader, PageHeader } from '@/components/ui/card';
import { useToast } from '@/components/ui/toast';
import {
  useApproveReview,
  useApproveReviews,
  usePendingImportedReviews,
  useRejectReview,
} from '@/hooks/useAdminReviews';
import { getPendingImportedReviewIds } from '@/lib/api/admin-reviews';
import { getErrorMessage } from '@/lib/api/errors';
import { parsePageParam, serializePageParam } from '@/lib/navigation/list-query-params';
import { useListQueryState, type ListQuerySpec } from '@/lib/navigation/use-list-query-state';

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const pageOnlyQuerySpec = {
  page: { parse: parsePageParam, serialize: serializePageParam },
} satisfies ListQuerySpec;

export default function AdminReviewsPage() {
  const [{ page }, setParams] = useListQueryState(pageOnlyQuerySpec);
  const { data, isLoading, isError } = usePendingImportedReviews(page);
  const approveMutation = useApproveReview();
  const rejectMutation = useRejectReview();
  const batchApproveMutation = useApproveReviews();
  const { show } = useToast();

  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
  const [selectAllPending, setSelectAllPending] = useState(false);
  const [failureMessages, setFailureMessages] = useState<string[]>([]);
  const [progressLabel, setProgressLabel] = useState<string | null>(null);

  const items = data?.items ?? [];
  const pagination = data?.pagination;
  const total = pagination?.total ?? 0;
  const selectedCount = selectedIds.size;
  const batchBusy = batchApproveMutation.isPending || selectAllPending;
  const busyId =
    approveMutation.isPending || rejectMutation.isPending
      ? (approveMutation.variables ?? rejectMutation.variables)
      : null;

  const allSelected = total > 0 && selectedCount === total;
  const someSelected = selectedCount > 0 && selectedCount < total;

  function toggleReview(reviewId: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(reviewId)) {
        next.delete(reviewId);
      } else {
        next.add(reviewId);
      }
      return next;
    });
  }

  async function toggleSelectAll() {
    if (allSelected) {
      setSelectedIds(new Set());
      return;
    }

    setSelectAllPending(true);
    setFailureMessages([]);
    try {
      const ids = await getPendingImportedReviewIds();
      setSelectedIds(new Set(ids));
    } catch (err) {
      setFailureMessages([getErrorMessage(err, 'โหลดรายการสำหรับเลือกทั้งหมดไม่สำเร็จ')]);
    } finally {
      setSelectAllPending(false);
    }
  }

  async function handleBatchApprove() {
    if (selectedCount === 0 || batchBusy) return;
    setFailureMessages([]);
    setProgressLabel(null);
    try {
      const result = await batchApproveMutation.mutateAsync({
        ids: [...selectedIds],
        onProgress: ({ chunkStart, chunkEnd, total: progressTotal }) => {
          setProgressLabel(`กำลังอนุมัติ ${chunkStart}–${chunkEnd} จาก ${progressTotal}`);
        },
      });

      if (result.failedCount > 0) {
        setFailureMessages(result.failures.slice(0, 3).map((failure) => failure.message));
        show(
          `อนุมัติแล้ว ${result.approvedCount} รายการ ไม่สำเร็จ ${result.failedCount} รายการ`,
          result.approvedCount > 0 ? 'info' : 'error',
        );
      } else {
        show(`อนุมัติแล้ว ${result.approvedCount} รายการ`, 'success');
      }

      if (result.approvedIds.length > 0) {
        setSelectedIds((prev) => {
          const next = new Set(prev);
          for (const id of result.approvedIds) {
            next.delete(id);
          }
          return next;
        });
      }
    } catch (err) {
      setFailureMessages([getErrorMessage(err, 'อนุมัติรีวิวไม่สำเร็จ')]);
    } finally {
      setProgressLabel(null);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="รีวิวนำเข้า"
        description="อนุมัติรีวิวที่ร้านค้า import ผ่าน API — จะแสดงเป็น “ลูกค้าไม่ระบุชื่อ” หลังอนุมัติ"
      />

      <Card>
        <CardHeader>
          <h2 className="font-display font-medium text-ink">
            รออนุมัติ
            {!isLoading && pagination ? (
              <span className="ml-1.5 text-base font-normal text-muted tabular-nums">
                ({pagination.total.toLocaleString('th-TH')})
              </span>
            ) : null}
          </h2>
        </CardHeader>
        <CardBody className="space-y-4">
          {isLoading ? (
            <p className="text-sm text-muted">กำลังโหลด...</p>
          ) : isError ? (
            <p className="text-sm text-destructive">โหลดรายการไม่สำเร็จ</p>
          ) : items.length === 0 ? (
            <p className="text-sm text-muted">ไม่มีรีวิวรออนุมัติ</p>
          ) : (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <label className="flex cursor-pointer items-center gap-2 text-sm text-ink">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-border accent-brand"
                    checked={allSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = someSelected;
                    }}
                    onChange={() => void toggleSelectAll()}
                    disabled={batchBusy || total === 0}
                    aria-label="เลือกทั้งหมด"
                  />
                  {selectAllPending ? 'กำลังเลือกทั้งหมด...' : 'เลือกทั้งหมด'}
                </label>
                {selectedCount > 0 ? (
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm text-muted tabular-nums">
                      เลือกแล้ว {selectedCount.toLocaleString('th-TH')}
                    </span>
                    <Button
                      type="button"
                      disabled={batchBusy}
                      onClick={() => void handleBatchApprove()}
                    >
                      {progressLabel ?? `อนุมัติที่เลือก`}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      disabled={batchBusy}
                      onClick={() => {
                        setSelectedIds(new Set());
                        setFailureMessages([]);
                      }}
                    >
                      ยกเลิกการเลือก
                    </Button>
                  </div>
                ) : null}
              </div>

              {failureMessages.length > 0 ? (
                <ul className="space-y-1 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                  {failureMessages.map((message) => (
                    <li key={message}>{message}</li>
                  ))}
                </ul>
              ) : null}

              <ul className="divide-y divide-border">
                {items.map((review) => (
                  <li
                    key={review.id}
                    className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-start sm:justify-between"
                  >
                    <div className="flex min-w-0 items-start gap-3">
                      <input
                        type="checkbox"
                        className="mt-1 h-4 w-4 shrink-0 rounded border-border accent-brand"
                        checked={selectedIds.has(review.id)}
                        disabled={batchBusy}
                        onChange={() => toggleReview(review.id)}
                        aria-label={`เลือก ${review.productName}`}
                      />
                      <div className="min-w-0 space-y-1 text-sm">
                        <p className="font-medium text-ink">{review.productName}</p>
                        <p className="text-muted">
                          {review.customerName} · ★ {review.rating} · {formatDate(review.createdAt)}
                        </p>
                        {review.comment ? (
                          <p className="whitespace-pre-wrap text-ink">{review.comment}</p>
                        ) : (
                          <p className="text-muted">(ไม่มีข้อความ)</p>
                        )}
                        {review.images.length > 0 ? (
                          <p className="text-xs text-muted">{review.images.length} รูปแนบ</p>
                        ) : null}
                      </div>
                    </div>
                    <div className="flex shrink-0 gap-2 pl-7 sm:pl-0">
                      <Button
                        type="button"
                        variant="outline"
                        disabled={batchBusy || busyId === review.id}
                        onClick={() => rejectMutation.mutate(review.id)}
                      >
                        ปฏิเสธ
                      </Button>
                      <Button
                        type="button"
                        disabled={batchBusy || busyId === review.id}
                        onClick={() => approveMutation.mutate(review.id)}
                      >
                        อนุมัติ
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {pagination && pagination.totalPages > 1 ? (
            <div className="flex items-center justify-between gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                disabled={page <= 1 || batchBusy}
                onClick={() => setParams((p) => ({ page: Math.max(1, p.page - 1) }))}
              >
                ก่อนหน้า
              </Button>
              <span className="text-sm text-muted tabular-nums">
                หน้า {pagination.page} / {pagination.totalPages}
              </span>
              <Button
                type="button"
                variant="outline"
                disabled={page >= pagination.totalPages || batchBusy}
                onClick={() => setParams((p) => ({ page: p.page + 1 }))}
              >
                ถัดไป
              </Button>
            </div>
          ) : null}
        </CardBody>
      </Card>
    </div>
  );
}
