'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { ActionGuideSpotlight } from '@/components/vendor/product-tour/action-guide-spotlight';
import { StoreRequestForm } from '@/components/vendor/store-request-form';
import { useMyStoreRequests } from '@/hooks/useStoreRequests';
import { getErrorMessage } from '@/lib/api/errors';
import { labelStoreRequestStatus } from '@/lib/i18n/th';
import { cn } from '@/lib/utils';

function requestStatusClass(status: string): string {
  if (status === 'approved') return 'bg-success-bg text-success';
  if (status === 'rejected') return 'bg-danger-bg text-danger';
  if (status === 'pending') return 'bg-warning-bg text-warning-text';
  return 'bg-surface text-muted-foreground';
}

function RequestListSkeleton() {
  return (
    <div className="space-y-3" aria-hidden="true">
      {Array.from({ length: 2 }).map((_, index) => (
        <div
          key={index}
          className="h-16 animate-pulse rounded-lg bg-surface motion-reduce:animate-none"
        />
      ))}
    </div>
  );
}

export function StoreRequestSection({
  id = 'new-store-request',
  open: controlledOpen,
  onOpenChange,
  showTrigger = true,
}: {
  id?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  showTrigger?: boolean;
}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;
  const { data: requests = [], isLoading, error } = useMyStoreRequests();

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
  }

  return (
    <div id={id} className="space-y-6">
      {!open && showTrigger ? (
        <Button type="button" className="min-h-9" onClick={() => setOpen(true)}>
          ขอเปิดร้านใหม่
        </Button>
      ) : null}

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          {open ? <ActionGuideSpotlight guideId="request-store" /> : null}
          <DialogHeader>
            <DialogTitle>ขอเปิดร้านใหม่</DialogTitle>
            <DialogDescription>
              กรอกชื่อร้านค้าเพื่อส่งคำขอ — ข้อมูลอื่นไม่บังคับ แต่ช่วยให้ทีมงานตรวจสอบได้เร็วขึ้น
            </DialogDescription>
          </DialogHeader>
          <StoreRequestForm
            showCancel
            onCancel={() => setOpen(false)}
            onSuccess={() => setOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader>
          <div>
            <h2 className="font-display text-lg font-medium text-ink">
              คำขอเปิดร้าน ({requests.length})
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">สถานะคำขอเปิดร้านใหม่ที่คุณส่งไว้</p>
          </div>
        </CardHeader>
        <CardBody className="space-y-3">
          {isLoading ? (
            <div aria-busy="true" aria-label="กำลังโหลดคำขอเปิดร้าน">
              <RequestListSkeleton />
            </div>
          ) : error ? (
            <p className="text-sm text-danger" role="alert">
              {getErrorMessage(error, 'โหลดไม่สำเร็จ')}
            </p>
          ) : requests.length === 0 ? (
            <div className="rounded-lg bg-surface px-4 py-6 text-center" role="status">
              <p className="text-sm font-medium text-ink">ยังไม่มีคำขอ</p>
              <p className="mt-1 text-sm text-muted-foreground text-pretty">
                กด “ขอเปิดร้านใหม่” ด้านบนเมื่อพร้อมส่งข้อมูลร้านให้ทีมงานตรวจสอบ
              </p>
            </div>
          ) : (
            <ul className="space-y-2">
              {requests.map((req) => (
                <li
                  key={req.id}
                  className="rounded-lg border border-border bg-card px-4 py-3 transition-colors duration-150"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-medium text-ink">{req.name}</p>
                    <Badge className={cn(requestStatusClass(req.status))}>
                      {labelStoreRequestStatus(req.status)}
                    </Badge>
                  </div>
                  {req.description ? (
                    <p className="mt-1 text-sm text-muted-foreground text-pretty">
                      {req.description}
                    </p>
                  ) : null}
                  {req.rejectionReason ? (
                    <p className="mt-2 text-sm text-danger" role="status">
                      เหตุผล: {req.rejectionReason}
                    </p>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
