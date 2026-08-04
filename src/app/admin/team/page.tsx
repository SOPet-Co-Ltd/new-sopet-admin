'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Badge } from '@/components/ui/badge';
import { ConfirmDeleteButton } from '@/components/ui/confirm-delete-button';
import { Button } from '@/components/ui/button';
import { Card, CardBody, CardHeader, PageHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCurrentUser } from '@/hooks/useAuth';
import {
  useAdminTeamMembers,
  useInviteAdmin,
  usePendingAdminInvitations,
  useRevokeAdminInvitation,
  useSetAdminActive,
} from '@/hooks/useAdminTeam';
import { isApiError } from '@/lib/api/errors';
import { adminAccessDescription, labelInvitationStatus } from '@/lib/i18n/th';
import { inviteAdminSchema, type InviteAdminFormValues } from '@/lib/validations';

function ListRowSkeleton({ rows = 2 }: { rows?: number }) {
  return (
    <div className="space-y-3" aria-busy="true">
      {Array.from({ length: rows }, (_, i) => (
        <div
          key={i}
          className="h-18 animate-pulse rounded-lg border border-border bg-surface motion-reduce:animate-none"
        />
      ))}
      <span className="sr-only">กำลังโหลด...</span>
    </div>
  );
}

function invitationStatusBadge(status: string): { label: string; className: string } {
  const label = labelInvitationStatus(status);
  if (status === 'pending') {
    return { label, className: 'bg-warning-bg text-warning-text' };
  }
  if (status === 'accepted') {
    return { label, className: 'bg-success-bg text-success' };
  }
  return { label, className: 'border border-border bg-surface text-muted-foreground' };
}

function memberStatusBadge(isActive: boolean): { label: string; className: string } {
  if (isActive) {
    return { label: 'ใช้งานอยู่', className: 'bg-success-bg text-success' };
  }
  return { label: 'ปิดใช้งาน', className: 'border border-border bg-surface text-muted-foreground' };
}

function formatInviteExpiry(value: string): string {
  return new Date(value).toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function mutationErrorMessage(error: unknown, fallback: string): string {
  if (isApiError(error)) return error.message;
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

export default function AdminTeamPage() {
  const { user: currentUser } = useCurrentUser();
  const { data: members = [], isLoading: membersLoading } = useAdminTeamMembers();
  const { data: invitations = [], isLoading: invitationsLoading } = usePendingAdminInvitations();
  const inviteMutation = useInviteAdmin();
  const revokeMutation = useRevokeAdminInvitation();
  const setActiveMutation = useSetAdminActive();

  const form = useForm<InviteAdminFormValues>({
    resolver: zodResolver(inviteAdminSchema),
    defaultValues: { email: '' },
  });

  const invitePending = inviteMutation.isPending;

  async function onInvite(values: InviteAdminFormValues) {
    try {
      await inviteMutation.mutateAsync(values);
      form.reset();
    } catch {
      // surfaced via mutation state
    }
  }

  const pendingInvites = invitations.filter((invitation) => invitation.status === 'pending');

  return (
    <div className="space-y-6">
      <PageHeader
        title="ทีมผู้ดูแล"
        description="เชิญผู้ดูแล เปิด/ปิดการใช้งาน และยกเลิกคำเชิญที่ยังไม่ตอบรับ"
      />

      <Card>
        <CardHeader className="space-y-1">
          <h2 className="font-display font-medium text-balance text-ink">เชิญผู้ดูแลใหม่</h2>
          <p className="text-sm text-pretty text-muted-foreground">
            ส่งคำเชิญทางอีเมล — ผู้รับต้องตั้งรหัสผ่านและเข้าสู่ระบบก่อนจึงจะเป็นผู้ดูแล
          </p>
        </CardHeader>
        <CardBody className="space-y-5">
          <form
            onSubmit={form.handleSubmit(onInvite)}
            className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start"
            noValidate
          >
            <div>
              <Label htmlFor="invite-admin-email" required>
                อีเมล
              </Label>
              <Input
                id="invite-admin-email"
                type="email"
                autoComplete="email"
                placeholder="admin@example.com"
                disabled={invitePending}
                aria-invalid={!!form.formState.errors.email}
                aria-describedby={
                  form.formState.errors.email ? 'invite-admin-email-error' : undefined
                }
                {...form.register('email')}
                className="mt-1.5"
              />
              {form.formState.errors.email ? (
                <p id="invite-admin-email-error" role="alert" className="mt-1 text-xs text-danger">
                  {form.formState.errors.email.message}
                </p>
              ) : null}
            </div>
            <div className="flex sm:pt-6.5">
              <Button
                type="submit"
                className="w-full sm:w-auto"
                disabled={invitePending}
                aria-busy={invitePending}
              >
                {invitePending ? 'กำลังส่ง...' : 'ส่งคำเชิญ'}
              </Button>
            </div>
          </form>

          {inviteMutation.isError ? (
            <p role="alert" className="text-sm text-danger">
              {mutationErrorMessage(inviteMutation.error, 'ส่งคำเชิญไม่สำเร็จ')}
            </p>
          ) : null}

          <div className="space-y-2 rounded-lg bg-surface px-4 py-3">
            <Badge className="border-0 bg-brand-tint text-brand">ผู้ดูแลระบบ</Badge>
            <p className="text-xs text-pretty text-muted-foreground">{adminAccessDescription}</p>
            <p className="text-xs text-pretty text-muted-foreground">
              ปิดใช้งานจะทำให้ผู้ดูแลเข้าสู่ระบบไม่ได้ — ไม่ลบบัญชี
            </p>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="font-display font-medium text-balance text-ink">
            ผู้ดูแลระบบ ({membersLoading ? '…' : members.length})
          </h2>
        </CardHeader>
        <CardBody className="space-y-3">
          {membersLoading ? (
            <ListRowSkeleton rows={2} />
          ) : members.length === 0 ? (
            <p className="text-sm text-pretty text-muted-foreground">
              ยังไม่มีผู้ดูแลระบบ — ส่งคำเชิญด้านบนเพื่อเพิ่มทีม
            </p>
          ) : (
            <ul className="space-y-3">
              {members.map((member) => {
                const isSelf = member.id === currentUser?.id;
                const displayName = member.fullName || member.email;
                const statusBadge = memberStatusBadge(member.isActive);
                const togglingActive =
                  setActiveMutation.isPending && setActiveMutation.variables?.userId === member.id;

                return (
                  <li
                    key={member.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-card px-4 py-3 transition-colors duration-200 motion-reduce:transition-none"
                  >
                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate font-medium text-ink">{displayName}</p>
                        <Badge className={statusBadge.className}>{statusBadge.label}</Badge>
                        {isSelf ? (
                          <Badge className="border-0 bg-brand-tint text-brand">คุณ</Badge>
                        ) : null}
                      </div>
                      {member.fullName ? (
                        <p className="truncate text-sm text-muted-foreground">{member.email}</p>
                      ) : null}
                    </div>
                    {!isSelf ? (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={togglingActive || setActiveMutation.isPending}
                        aria-busy={togglingActive}
                        onClick={() =>
                          setActiveMutation.mutate({
                            userId: member.id,
                            isActive: !member.isActive,
                          })
                        }
                      >
                        {member.isActive ? 'ปิดใช้งาน' : 'เปิดใช้งาน'}
                      </Button>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          )}
          {setActiveMutation.isError ? (
            <p role="alert" className="text-sm text-danger">
              {mutationErrorMessage(setActiveMutation.error, 'เปลี่ยนสถานะผู้ดูแลไม่สำเร็จ')}
            </p>
          ) : null}
        </CardBody>
      </Card>

      <Card>
        <CardHeader className="space-y-1">
          <h2 className="font-display font-medium text-balance text-ink">
            คำเชิญที่รอตอบรับ
            {!invitationsLoading && pendingInvites.length > 0
              ? ` (${pendingInvites.length})`
              : null}
          </h2>
          <p className="text-sm text-pretty text-muted-foreground">
            ยกเลิกได้ก่อนที่ผู้รับจะตอบรับคำเชิญ
          </p>
        </CardHeader>
        <CardBody className="space-y-3">
          {invitationsLoading ? (
            <ListRowSkeleton rows={1} />
          ) : invitations.length === 0 ? (
            <p className="text-sm text-pretty text-muted-foreground">
              ยังไม่มีคำเชิญค้างอยู่ — ส่งคำเชิญด้านบนเพื่อเชิญผู้ดูแล
            </p>
          ) : (
            <ul className="space-y-3">
              {invitations.map((invitation) => {
                const statusBadge = invitationStatusBadge(invitation.status);
                const revoking =
                  revokeMutation.isPending && revokeMutation.variables === invitation.id;

                return (
                  <li
                    key={invitation.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-card px-4 py-3 transition-colors duration-200 motion-reduce:transition-none"
                  >
                    <div className="min-w-0 space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate font-medium text-ink">{invitation.email}</p>
                        <Badge className={statusBadge.className}>{statusBadge.label}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        หมดอายุ {formatInviteExpiry(invitation.expiresAt)}
                      </p>
                    </div>
                    {invitation.status === 'pending' ? (
                      <ConfirmDeleteButton
                        confirmLabel={invitation.email}
                        title="ยกเลิกคำเชิญ"
                        confirmButtonLabel="ยกเลิก"
                        description={`จะยกเลิกคำเชิญไปยัง ${invitation.email} — ลิงก์เชิญจะใช้ไม่ได้ทันที`}
                        disabled={revokeMutation.isPending}
                        isDeleting={revoking}
                        onConfirm={async () => {
                          await revokeMutation.mutateAsync(invitation.id);
                        }}
                      >
                        ยกเลิกคำเชิญ
                      </ConfirmDeleteButton>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          )}
          {revokeMutation.isError ? (
            <p role="alert" className="text-sm text-danger">
              {mutationErrorMessage(revokeMutation.error, 'ยกเลิกคำเชิญไม่สำเร็จ')}
            </p>
          ) : null}
        </CardBody>
      </Card>
    </div>
  );
}
