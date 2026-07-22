'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useQueries } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardBody, CardHeader, PageHeader } from '@/components/ui/card';
import { useToast } from '@/components/ui/toast';
import {
  useAcceptStoreInvitation,
  useDeclineStoreInvitation,
  useMyPendingStoreInvitations,
} from '@/hooks/useTeam';
import { useMyStoreRequests } from '@/hooks/useStoreRequests';
import { useMyStores } from '@/hooks/useMyStores';
import { getStoreReactivationRequests } from '@/lib/api/store-reactivation-requests';
import { getErrorMessage } from '@/lib/api/errors';
import {
  labelMembershipRole,
  labelStoreReactivationRequestStatus,
  labelStoreRequestStatus,
} from '@/lib/i18n/th';
import { queryKeys } from '@/lib/react-query/keys';
import type { MyPendingStoreInvitation, StoreReactivationRequest } from '@/types';

function formatExpiry(iso: string): string {
  return new Intl.DateTimeFormat('th-TH', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(iso));
}

function ListSkeleton({ rows = 2 }: { rows?: number }) {
  return (
    <div className="space-y-3" aria-hidden="true">
      {Array.from({ length: rows }).map((_, index) => (
        <div
          key={index}
          className="h-20 animate-pulse rounded-lg bg-surface motion-reduce:animate-none"
        />
      ))}
    </div>
  );
}

function InvitationRow({
  invitation,
  busyToken,
  onAccept,
  onDecline,
}: {
  invitation: MyPendingStoreInvitation;
  busyToken: string | null;
  onAccept: (token: string) => void;
  onDecline: (token: string) => void;
}) {
  const isBusy = busyToken === invitation.token;

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-canvas p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0 space-y-1">
        <p className="font-medium text-ink">{invitation.storeName}</p>
        <p className="text-sm text-muted">
          บทบาท: {labelMembershipRole(String(invitation.role))} · หมดอายุ{' '}
          {formatExpiry(invitation.expiresAt)}
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          disabled={isBusy}
          onClick={() => onAccept(invitation.token)}
        >
          {isBusy ? 'กำลังดำเนินการ...' : 'ตอบรับ'}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={isBusy}
          onClick={() => onDecline(invitation.token)}
        >
          ปฏิเสธ
        </Button>
      </div>
    </div>
  );
}

export default function VendorRequestsPage() {
  const { show } = useToast();
  const [busyToken, setBusyToken] = useState<string | null>(null);

  const {
    data: invitations = [],
    isLoading: loadingInvitations,
    error: invitationsError,
  } = useMyPendingStoreInvitations();
  const acceptMutation = useAcceptStoreInvitation();
  const declineMutation = useDeclineStoreInvitation();

  const {
    data: storeRequests = [],
    isLoading: loadingStoreRequests,
    error: storeRequestsError,
  } = useMyStoreRequests();
  const pendingStoreRequests = useMemo(
    () => storeRequests.filter((request) => request.status === 'pending'),
    [storeRequests],
  );

  const { data: myStores = [], isLoading: loadingStores } = useMyStores();
  const manageableSuspendedStores = useMemo(
    () =>
      myStores.filter(
        (entry) =>
          entry.store.status === 'suspended' &&
          (entry.membershipRole === 'owner' || entry.membershipRole === 'manager'),
      ),
    [myStores],
  );

  const reactivationQueries = useQueries({
    queries: manageableSuspendedStores.map((entry) => ({
      queryKey: queryKeys.storeReactivationRequests.byStore(entry.store.id),
      queryFn: () => getStoreReactivationRequests(entry.store.id),
    })),
  });

  const pendingReactivations = useMemo(() => {
    const rows: Array<StoreReactivationRequest & { storeHref: string }> = [];
    reactivationQueries.forEach((query, index) => {
      const store = manageableSuspendedStores[index]?.store;
      if (!store || !query.data) return;
      for (const request of query.data) {
        if (request.status !== 'pending') continue;
        rows.push({
          ...request,
          storeHref: `/vendor/reactivation?storeId=${store.id}`,
        });
      }
    });
    return rows;
  }, [manageableSuspendedStores, reactivationQueries]);

  const loadingReactivations =
    loadingStores || reactivationQueries.some((query) => query.isLoading);

  async function handleAccept(token: string) {
    setBusyToken(token);
    try {
      await acceptMutation.mutateAsync(token);
      show('ตอบรับคำเชิญแล้ว', 'success');
    } catch (err) {
      show(getErrorMessage(err, 'ตอบรับคำเชิญไม่สำเร็จ'), 'error');
    } finally {
      setBusyToken(null);
    }
  }

  async function handleDecline(token: string) {
    setBusyToken(token);
    try {
      await declineMutation.mutateAsync(token);
      show('ปฏิเสธคำเชิญแล้ว', 'success');
    } catch (err) {
      show(getErrorMessage(err, 'ปฏิเสธคำเชิญไม่สำเร็จ'), 'error');
    } finally {
      setBusyToken(null);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="คำเชิญ / คำขอ"
        description="ตอบรับคำเชิญเข้าร้านและติดตามคำขอที่คุณส่งไว้"
      />

      <Card>
        <CardHeader>
          <h2 className="font-display font-medium text-ink">คำเชิญเข้าร้าน</h2>
        </CardHeader>
        <CardBody className="space-y-3">
          {loadingInvitations ? <ListSkeleton /> : null}
          {invitationsError ? (
            <p className="text-sm text-danger">
              {invitationsError instanceof Error ? invitationsError.message : 'โหลดคำเชิญไม่สำเร็จ'}
            </p>
          ) : null}
          {!loadingInvitations && !invitationsError && invitations.length === 0 ? (
            <p className="text-sm text-muted">ไม่มีคำเชิญเข้าร้านที่รอการตอบรับ</p>
          ) : null}
          {invitations.map((invitation) => (
            <InvitationRow
              key={invitation.id}
              invitation={invitation}
              busyToken={busyToken}
              onAccept={handleAccept}
              onDecline={handleDecline}
            />
          ))}
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="font-display font-medium text-ink">คำขอของฉัน</h2>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-sm font-medium text-ink">คำขอเปิดร้าน</h3>
              <Link href="/vendor/stores" className="text-sm text-brand hover:underline">
                ไปที่ร้านค้าของฉัน
              </Link>
            </div>
            {loadingStoreRequests ? <ListSkeleton rows={1} /> : null}
            {storeRequestsError ? (
              <p className="text-sm text-danger">
                {storeRequestsError instanceof Error
                  ? storeRequestsError.message
                  : 'โหลดคำขอเปิดร้านไม่สำเร็จ'}
              </p>
            ) : null}
            {!loadingStoreRequests && pendingStoreRequests.length === 0 ? (
              <p className="text-sm text-muted">ไม่มีคำขอเปิดร้านที่รออนุมัติ</p>
            ) : null}
            {pendingStoreRequests.map((request) => (
              <div
                key={request.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-canvas p-4"
              >
                <div className="min-w-0 space-y-1">
                  <p className="font-medium text-ink">{request.name}</p>
                  {request.createdAt ? (
                    <p className="text-sm text-muted">ส่งเมื่อ {formatExpiry(request.createdAt)}</p>
                  ) : null}
                </div>
                <Badge className="bg-warning-bg text-warning-text">
                  {labelStoreRequestStatus(String(request.status))}
                </Badge>
              </div>
            ))}
          </div>

          <div className="space-y-3 border-t border-border pt-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-sm font-medium text-ink">คำขอเปิดใช้งานร้าน</h3>
              <Link href="/vendor/reactivation" className="text-sm text-brand hover:underline">
                ไปที่คำขอเปิดใช้งาน
              </Link>
            </div>
            {loadingReactivations ? <ListSkeleton rows={1} /> : null}
            {!loadingReactivations && pendingReactivations.length === 0 ? (
              <p className="text-sm text-muted">ไม่มีคำขอเปิดใช้งานร้านที่รออนุมัติ</p>
            ) : null}
            {pendingReactivations.map((request) => (
              <div
                key={request.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-canvas p-4"
              >
                <div className="min-w-0 space-y-1">
                  <p className="font-medium text-ink">{request.storeName}</p>
                  <p className="text-sm text-muted">{request.title}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className="bg-warning-bg text-warning-text">
                    {labelStoreReactivationRequestStatus(String(request.status))}
                  </Badge>
                  <Link href={request.storeHref} className="text-sm text-brand hover:underline">
                    ดูรายละเอียด
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
