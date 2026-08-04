'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { RequestsQueueSummary } from '@/components/admin/requests/requests-queue-summary';
import {
  RequestsEmptyState,
  RequestsListSkeleton,
  RequestsTabSwitchButton,
} from '@/components/admin/requests/requests-states';
import { RequestsTabBar, type RequestsTab } from '@/components/admin/requests/requests-tab-bar';
import { StoreRequestRow } from '@/components/admin/requests/store-request-row';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardBody, CardHeader, PageHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  useAdminStoreRequests,
  useApproveStoreRequest,
  usePendingStoreRequests,
  useRejectStoreRequest,
} from '@/hooks/useStoreRequests';
import { useInviteVendor, usePendingVendorInvitations } from '@/hooks/useVendorInvitations';
import { labelInvitationStatus } from '@/lib/i18n/th';
import { inviteVendorSchema, type InviteVendorFormValues } from '@/lib/validations';

function parseTab(value: string | null): RequestsTab {
  if (value === 'invitations') return value;
  return 'stores';
}

function AdminRequestsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const highlightRequestId = searchParams.get('requestId');
  const tab = parseTab(searchParams.get('tab'));

  const [showHistory, setShowHistory] = useState(false);
  const { data: pendingRequests = [], isLoading: loadingStores } = usePendingStoreRequests();
  const { data: historyRequests = [], isLoading: loadingHistory } =
    useAdminStoreRequests(showHistory);
  const approveStore = useApproveStoreRequest();
  const rejectStore = useRejectStoreRequest();

  const storeRequests = showHistory ? historyRequests : pendingRequests;
  const loadingStoreList = showHistory ? loadingHistory : loadingStores;

  const { data: invitations = [], isLoading: loadingInvitations } = usePendingVendorInvitations();
  const inviteMutation = useInviteVendor();

  const inviteForm = useForm<InviteVendorFormValues>({
    resolver: zodResolver(inviteVendorSchema),
    defaultValues: { email: '' },
  });

  const tabCounts = useMemo(
    () => ({
      stores: pendingRequests.length,
      invitations: invitations.length,
    }),
    [pendingRequests.length, invitations.length],
  );

  const setActiveTab = useCallback(
    (next: RequestsTab) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set('tab', next);
      if (next !== 'stores') {
        params.delete('requestId');
      }
      const query = params.toString();
      router.replace(query ? `/admin/requests?${query}` : '/admin/requests', { scroll: false });
    },
    [router, searchParams],
  );

  useEffect(() => {
    if (!highlightRequestId || loadingStoreList || tab !== 'stores') return;
    const element = document.getElementById(`store-request-${highlightRequestId}`);
    element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [highlightRequestId, loadingStoreList, storeRequests, tab]);

  async function onInvite(values: InviteVendorFormValues) {
    try {
      await inviteMutation.mutateAsync(values);
      inviteForm.reset();
    } catch {
      // surfaced via mutation state
    }
  }

  const nextStoreRequestId =
    highlightRequestId ??
    (!showHistory && pendingRequests.length > 0 && tabCounts.stores > 0
      ? pendingRequests[0]?.id
      : null);

  return (
    <div className="min-w-0 space-y-6">
      <PageHeader
        title="ศูนย์คำขอ"
        description="อนุมัติคำขอเปิดร้านและเชิญผู้ขาย — เริ่มจากรายการที่เน้นไว้"
      />

      <RequestsQueueSummary counts={tabCounts} activeTab={tab} onGoToNext={setActiveTab} />

      <RequestsTabBar tab={tab} counts={tabCounts} onTabChange={setActiveTab} />

      {tab === 'stores' ? (
        <div role="tabpanel" id="requests-panel-stores" aria-labelledby="requests-tab-stores">
          <Card>
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="font-display font-medium text-balance text-ink">
                  {showHistory ? 'คำขอเปิดร้านทั้งหมด' : 'คำขอเปิดร้านรออนุมัติ'}
                </h2>
                <div className="flex flex-wrap items-center gap-3">
                  {!loadingStoreList && storeRequests.length > 0 ? (
                    <p className="text-sm text-muted-foreground">
                      {storeRequests.length.toLocaleString('th-TH')} รายการ
                      {showHistory ? '' : ' — เรียงตามลำดับที่ส่ง'}
                    </p>
                  ) : null}
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => setShowHistory((current) => !current)}
                  >
                    {showHistory ? 'ดูเฉพาะที่รออนุมัติ' : 'ดูประวัติทั้งหมด (รวมที่ปฏิเสธ)'}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardBody className="space-y-3">
              {loadingStoreList ? (
                <RequestsListSkeleton rows={3} />
              ) : storeRequests.length === 0 ? (
                <RequestsEmptyState
                  variant="success"
                  title={showHistory ? 'ยังไม่มีคำขอเปิดร้าน' : 'ไม่มีคำขอเปิดร้านรออนุมัติ'}
                  description={
                    showHistory
                      ? 'คำขอเปิดร้านทุกสถานะจะปรากฏที่นี่'
                      : 'คิวว่างแล้ว — คำขอใหม่จากผู้ขายจะปรากฏที่นี่ทันที'
                  }
                  action={
                    !showHistory && tabCounts.invitations > 0 ? (
                      <RequestsTabSwitchButton
                        label="ไปที่เชิญผู้ขาย"
                        onClick={() => setActiveTab('invitations')}
                      />
                    ) : undefined
                  }
                />
              ) : (
                storeRequests.map((request) => (
                  <StoreRequestRow
                    key={request.id}
                    request={request}
                    highlighted={highlightRequestId === request.id}
                    isNextUp={nextStoreRequestId === request.id}
                    approvePending={approveStore.isPending}
                    rejectPending={rejectStore.isPending}
                    onApprove={(id) => approveStore.mutate(id)}
                    onReject={(id, reason) => rejectStore.mutateAsync({ id, reason })}
                  />
                ))
              )}
            </CardBody>
          </Card>
        </div>
      ) : null}

      {tab === 'invitations' ? (
        <div
          className="space-y-4"
          role="tabpanel"
          id="requests-panel-invitations"
          aria-labelledby="requests-tab-invitations"
        >
          <Card>
            <CardHeader>
              <h2 className="font-display font-medium text-balance text-ink">เชิญผู้ขายใหม่</h2>
              <p className="mt-1 text-sm text-pretty text-muted-foreground">
                ส่งคำเชิญทางอีเมล — ผู้ขายจะตั้งรหัสผ่านเมื่อตอบรับ
              </p>
            </CardHeader>
            <CardBody>
              <form
                onSubmit={inviteForm.handleSubmit(onInvite)}
                className="flex flex-wrap items-end gap-3"
              >
                <div className="min-w-[240px] flex-1">
                  <Label htmlFor="invite-email" required>
                    อีเมล
                  </Label>
                  <Input
                    id="invite-email"
                    type="email"
                    placeholder="email@example.com"
                    autoComplete="email"
                    aria-invalid={!!inviteForm.formState.errors.email}
                    aria-describedby={
                      inviteForm.formState.errors.email ? 'invite-email-error' : undefined
                    }
                    {...inviteForm.register('email')}
                    className="mt-1.5"
                  />
                  {inviteForm.formState.errors.email ? (
                    <p id="invite-email-error" className="mt-1 text-xs text-danger" role="alert">
                      {inviteForm.formState.errors.email.message}
                    </p>
                  ) : null}
                </div>
                <Button
                  type="submit"
                  disabled={inviteMutation.isPending}
                  aria-busy={inviteMutation.isPending}
                >
                  {inviteMutation.isPending ? 'กำลังส่ง...' : 'ส่งคำเชิญ'}
                </Button>
              </form>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="font-display font-medium text-balance text-ink">
                  คำเชิญที่รอตอบรับ
                </h2>
                {!loadingInvitations && invitations.length > 0 ? (
                  <p className="text-sm text-muted-foreground">
                    {invitations.length.toLocaleString('th-TH')} รายการ
                  </p>
                ) : null}
              </div>
            </CardHeader>
            <CardBody className="space-y-3">
              {loadingInvitations ? (
                <RequestsListSkeleton rows={2} />
              ) : invitations.length === 0 ? (
                <RequestsEmptyState
                  title="ไม่มีคำเชิญที่รอตอบรับ"
                  description="ส่งคำเชิญด้านบนเพื่อเพิ่มผู้ขายใหม่"
                />
              ) : (
                invitations.map((invitation) => (
                  <div
                    key={invitation.id}
                    className="flex items-center justify-between gap-4 rounded-lg border border-border bg-card px-4 py-3"
                  >
                    <p className="min-w-0 truncate font-medium text-ink">{invitation.email}</p>
                    <Badge status="processing">{labelInvitationStatus(invitation.status)}</Badge>
                  </div>
                ))
              )}
            </CardBody>
          </Card>
        </div>
      ) : null}
    </div>
  );
}

export default function AdminRequestsPage() {
  return (
    <Suspense fallback={<RequestsListSkeleton rows={2} />}>
      <AdminRequestsPageContent />
    </Suspense>
  );
}
