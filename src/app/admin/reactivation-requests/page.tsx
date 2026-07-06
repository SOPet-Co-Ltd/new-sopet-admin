'use client';

import Image from 'next/image';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardBody, CardHeader, PageHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  useAdminStoreReactivationRequests,
  useApproveStoreReactivationRequest,
  useRejectStoreReactivationRequest,
} from '@/hooks/useStoreReactivationRequests';
import { labelStoreReactivationRequestStatus } from '@/lib/i18n/th';

type StatusFilter = 'all' | 'pending' | 'approved' | 'rejected';

export default function AdminReactivationRequestsPage() {
  const [filter, setFilter] = useState<StatusFilter>('pending');
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [reviewNote, setReviewNote] = useState('');

  const statusArg = filter === 'all' ? undefined : filter;
  const { data: requests = [], isLoading } = useAdminStoreReactivationRequests(statusArg);
  const approveMutation = useApproveStoreReactivationRequest();
  const rejectMutation = useRejectStoreReactivationRequest();

  async function handleReject(id: string) {
    await rejectMutation.mutateAsync({ id, reviewNote: reviewNote || undefined });
    setRejectingId(null);
    setReviewNote('');
  }

  return (
    <div className="space-y-6">
      <PageHeader title="คำขอเปิดใช้งานร้าน" description="ตรวจสอบคำขอจากผู้ขายเมื่อร้านถูกระงับ" />

      <div className="flex flex-wrap gap-2">
        {(['pending', 'approved', 'rejected', 'all'] as const).map((value) => (
          <Button
            key={value}
            type="button"
            size="sm"
            variant={filter === value ? 'default' : 'outline'}
            onClick={() => setFilter(value)}
          >
            {value === 'all' ? 'ทั้งหมด' : labelStoreReactivationRequestStatus(value)}
          </Button>
        ))}
      </div>

      <Card>
        <CardHeader>
          <h2 className="font-display font-medium text-ink">รายการคำขอ ({requests.length})</h2>
        </CardHeader>
        <CardBody className="space-y-3">
          {isLoading ? (
            <p className="text-sm text-muted">กำลังโหลด...</p>
          ) : requests.length === 0 ? (
            <p className="text-sm text-muted">ไม่มีคำขอ</p>
          ) : (
            requests.map((req) => (
              <div key={req.id} className="rounded-lg border border-border px-4 py-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-medium text-ink">{req.title}</p>
                    <p className="text-sm text-muted">
                      ร้าน: {req.storeName} · ผู้ส่ง:{' '}
                      {req.submittedByFullName ?? req.submittedByEmail ?? req.submittedByUserId}
                    </p>
                  </div>
                  <Badge>{labelStoreReactivationRequestStatus(req.status)}</Badge>
                </div>
                <p className="mt-2 whitespace-pre-wrap text-sm text-ink">{req.content}</p>
                {req.images.length > 0 ? (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {req.images.map((image) => (
                      <a
                        key={image.id}
                        href={image.imageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Image
                          src={image.imageUrl}
                          alt=""
                          width={80}
                          height={80}
                          className="h-20 w-20 rounded border border-border object-cover"
                        />
                      </a>
                    ))}
                  </div>
                ) : null}
                {req.reviewNote ? (
                  <p className="mt-2 text-sm text-muted">คำตอบ: {req.reviewNote}</p>
                ) : null}

                {req.status === 'pending' ? (
                  rejectingId === req.id ? (
                    <div className="mt-3 flex flex-wrap items-end gap-2">
                      <div className="min-w-[240px] flex-1">
                        <Label htmlFor={`note-${req.id}`}>เหตุผลการปฏิเสธ</Label>
                        <Input
                          id={`note-${req.id}`}
                          value={reviewNote}
                          placeholder="ระบุเหตุผล (ไม่บังคับ)"
                          onChange={(e) => setReviewNote(e.target.value)}
                          className="mt-1.5"
                        />
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant="destructive"
                        disabled={rejectMutation.isPending}
                        onClick={() => handleReject(req.id)}
                      >
                        ยืนยันปฏิเสธ
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => setRejectingId(null)}
                      >
                        ยกเลิก
                      </Button>
                    </div>
                  ) : (
                    <div className="mt-3 flex gap-2">
                      <Button
                        type="button"
                        size="sm"
                        disabled={approveMutation.isPending}
                        onClick={() => approveMutation.mutate(req.id)}
                      >
                        เปิดใช้งานร้าน (อนุมัติ)
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="destructive"
                        onClick={() => setRejectingId(req.id)}
                      >
                        ปฏิเสธ
                      </Button>
                    </div>
                  )
                ) : null}
              </div>
            ))
          )}
        </CardBody>
      </Card>
    </div>
  );
}
