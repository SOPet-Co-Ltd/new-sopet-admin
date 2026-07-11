'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { useForm } from 'react-hook-form';
import { PendingCategoryRow } from '@/components/admin/taxonomy/pending-category-row';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardBody, CardHeader, PageHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import {
  useApproveStoreRequest,
  usePendingStoreRequests,
  useRejectStoreRequest,
} from '@/hooks/useStoreRequests';
import { useInviteVendor, usePendingVendorInvitations } from '@/hooks/useVendorInvitations';
import {
  useApproveCategory,
  useApproveTag,
  usePendingCategories,
  usePendingTags,
  useRejectCategory,
  useRejectTag,
} from '@/hooks/useTaxonomy';
import { labelInvitationStatus, labelStoreRequestStatus, labelTaxonomyStatus } from '@/lib/i18n/th';
import { inviteVendorSchema, type InviteVendorFormValues } from '@/lib/validations';

type Tab = 'stores' | 'taxonomy' | 'invitations';

function parseTab(value: string | null): Tab {
  if (value === 'taxonomy' || value === 'invitations') return value;
  return 'stores';
}

function AdminRequestsPageContent() {
  const searchParams = useSearchParams();
  const highlightRequestId = searchParams.get('requestId');
  const [tab, setTab] = useState<Tab>(() => parseTab(searchParams.get('tab')));
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const { data: storeRequests = [], isLoading: loadingStores } = usePendingStoreRequests();
  const approveStore = useApproveStoreRequest();
  const rejectStore = useRejectStoreRequest();

  useEffect(() => {
    if (!highlightRequestId || loadingStores) return;
    const element = document.getElementById(`store-request-${highlightRequestId}`);
    element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [highlightRequestId, loadingStores, storeRequests]);

  const { data: categories = [] } = usePendingCategories();
  const { data: tags = [] } = usePendingTags();
  const approveCategory = useApproveCategory();
  const rejectCategory = useRejectCategory();
  const approveTag = useApproveTag();
  const rejectTag = useRejectTag();

  const { data: invitations = [], isLoading: loadingInvitations } = usePendingVendorInvitations();
  const inviteMutation = useInviteVendor();

  const inviteForm = useForm<InviteVendorFormValues>({
    resolver: zodResolver(inviteVendorSchema),
    defaultValues: { email: '' },
  });

  async function onInvite(values: InviteVendorFormValues) {
    try {
      await inviteMutation.mutateAsync(values);
      inviteForm.reset();
    } catch {
      // surfaced via mutation state
    }
  }

  async function handleRejectStore(id: string) {
    await rejectStore.mutateAsync({ id, reason: rejectReason || undefined });
    setRejectingId(null);
    setRejectReason('');
  }

  const taxonomyPending = categories.length + tags.length;

  return (
    <div className="space-y-6">
      <PageHeader title="ศูนย์คำขอ" description="อนุมัติคำขอเปิดร้าน หมวดหมู่ และเชิญผู้ขาย" />

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant={tab === 'stores' ? 'default' : 'outline'}
          onClick={() => setTab('stores')}
        >
          คำขอเปิดร้าน ({storeRequests.length})
        </Button>
        <Button
          type="button"
          variant={tab === 'taxonomy' ? 'default' : 'outline'}
          onClick={() => setTab('taxonomy')}
        >
          หมวดหมู่/แท็ก ({taxonomyPending})
        </Button>
        <Button
          type="button"
          variant={tab === 'invitations' ? 'default' : 'outline'}
          onClick={() => setTab('invitations')}
        >
          เชิญผู้ขาย ({invitations.length})
        </Button>
      </div>

      {tab === 'stores' ? (
        <Card>
          <CardHeader>
            <h2 className="font-display font-medium text-ink">คำขอเปิดร้านรออนุมัติ</h2>
          </CardHeader>
          <CardBody className="space-y-3">
            {loadingStores ? (
              <p className="text-sm text-muted">กำลังโหลด...</p>
            ) : storeRequests.length === 0 ? (
              <p className="text-sm text-muted">ไม่มีคำขอรออนุมัติ</p>
            ) : (
              storeRequests.map((req) => (
                <div
                  key={req.id}
                  id={`store-request-${req.id}`}
                  className={cn(
                    'rounded-lg border px-4 py-3 transition-colors',
                    highlightRequestId === req.id
                      ? 'border-brand bg-brand-tint/30'
                      : 'border-border',
                  )}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-medium text-ink">{req.name}</p>
                      <p className="text-sm text-muted">
                        {req.contactEmail ?? ''} {req.contactPhone ?? ''}
                      </p>
                    </div>
                    <Badge>{labelStoreRequestStatus(req.status)}</Badge>
                  </div>
                  {req.description ? (
                    <p className="mt-1 text-sm text-muted">{req.description}</p>
                  ) : null}
                  {rejectingId === req.id ? (
                    <div className="mt-3 flex flex-wrap items-end gap-2">
                      <div className="flex-1">
                        <Label htmlFor={`reason-${req.id}`}>เหตุผลการปฏิเสธ</Label>
                        <Input
                          id={`reason-${req.id}`}
                          value={rejectReason}
                          placeholder="ระบุเหตุผล (ไม่บังคับ)"
                          autoComplete="off"
                          onChange={(e) => setRejectReason(e.target.value)}
                          className="mt-1.5"
                        />
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant="destructive"
                        disabled={rejectStore.isPending}
                        aria-busy={rejectStore.isPending}
                        onClick={() => handleRejectStore(req.id)}
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
                        disabled={approveStore.isPending}
                        aria-busy={approveStore.isPending}
                        onClick={() => approveStore.mutate(req.id)}
                      >
                        อนุมัติ
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
                  )}
                </div>
              ))
            )}
          </CardBody>
        </Card>
      ) : null}

      {tab === 'taxonomy' ? (
        <div className="space-y-4">
          <Card>
            <CardBody className="space-y-4">
              <div>
                <h3 className="font-medium text-ink">หมวดหมู่ ({categories.length})</h3>
                <ul className="mt-2 space-y-2">
                  {categories.length === 0 ? (
                    <li className="text-sm text-muted">ไม่มีรายการรออนุมัติ</li>
                  ) : (
                    categories.map((item) => (
                      <PendingCategoryRow
                        key={item.id}
                        item={item}
                        disabled={
                          approveCategory.isPending ||
                          rejectCategory.isPending ||
                          rejectTag.isPending
                        }
                        onApprove={(id) => approveCategory.mutate(id)}
                        onReject={(id) => rejectCategory.mutate(id)}
                      />
                    ))
                  )}
                </ul>
              </div>
              <div>
                <h3 className="font-medium text-ink">แท็ก ({tags.length})</h3>
                <ul className="mt-2 space-y-2">
                  {tags.map((item) => (
                    <li
                      key={item.id}
                      className="flex items-center justify-between gap-4 rounded-lg border border-border px-3 py-2"
                    >
                      <span className="text-sm">
                        {item.name} · {labelTaxonomyStatus(item.status)}
                      </span>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          size="sm"
                          disabled={approveTag.isPending}
                          aria-busy={approveTag.isPending}
                          onClick={() => approveTag.mutate(item.id)}
                        >
                          อนุมัติ
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="destructive"
                          disabled={rejectTag.isPending}
                          aria-busy={rejectTag.isPending}
                          onClick={() => rejectTag.mutate(item.id)}
                        >
                          ปฏิเสธ
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </CardBody>
          </Card>
        </div>
      ) : null}

      {tab === 'invitations' ? (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <h2 className="font-display font-medium text-ink">เชิญผู้ขายใหม่</h2>
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
              <h2 className="font-display font-medium text-ink">คำเชิญที่รอตอบรับ</h2>
            </CardHeader>
            <CardBody className="space-y-3">
              {loadingInvitations ? (
                <p className="text-sm text-muted">กำลังโหลด...</p>
              ) : invitations.length === 0 ? (
                <p className="text-sm text-muted">ไม่มีคำเชิญ</p>
              ) : (
                invitations.map((inv) => (
                  <div
                    key={inv.id}
                    className="flex items-center justify-between gap-4 rounded-lg border border-border px-4 py-3"
                  >
                    <p className="font-medium text-ink">{inv.email}</p>
                    <Badge>{labelInvitationStatus(inv.status)}</Badge>
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
    <Suspense fallback={<p className="text-muted">กำลังโหลด...</p>}>
      <AdminRequestsPageContent />
    </Suspense>
  );
}
