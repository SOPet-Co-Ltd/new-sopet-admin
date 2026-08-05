'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardBody, CardHeader, PageHeader } from '@/components/ui/card';
import {
  useApproveReview,
  usePendingImportedReviews,
  useRejectReview,
} from '@/hooks/useAdminReviews';

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function AdminReviewsPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError } = usePendingImportedReviews(page);
  const approveMutation = useApproveReview();
  const rejectMutation = useRejectReview();

  const items = data?.items ?? [];
  const pagination = data?.pagination;
  const busyId =
    approveMutation.isPending || rejectMutation.isPending
      ? (approveMutation.variables ?? rejectMutation.variables)
      : null;

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
            <ul className="divide-y divide-border">
              {items.map((review) => (
                <li
                  key={review.id}
                  className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-start sm:justify-between"
                >
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
                  <div className="flex shrink-0 gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      disabled={busyId === review.id}
                      onClick={() => rejectMutation.mutate(review.id)}
                    >
                      ปฏิเสธ
                    </Button>
                    <Button
                      type="button"
                      disabled={busyId === review.id}
                      onClick={() => approveMutation.mutate(review.id)}
                    >
                      อนุมัติ
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {pagination && pagination.totalPages > 1 ? (
            <div className="flex items-center justify-between gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                ก่อนหน้า
              </Button>
              <span className="text-sm text-muted tabular-nums">
                หน้า {pagination.page} / {pagination.totalPages}
              </span>
              <Button
                type="button"
                variant="outline"
                disabled={page >= pagination.totalPages}
                onClick={() => setPage((p) => p + 1)}
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
