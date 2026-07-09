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
import { labelInvitationStatus } from '@/lib/i18n/th';
import { inviteAdminSchema, type InviteAdminFormValues } from '@/lib/validations';

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

  async function onInvite(values: InviteAdminFormValues) {
    try {
      await inviteMutation.mutateAsync(values);
      form.reset();
    } catch {
      // surfaced via mutation state
    }
  }

  const mutationPending =
    inviteMutation.isPending || revokeMutation.isPending || setActiveMutation.isPending;

  return (
    <div className="space-y-6">
      <PageHeader title="ทีมผู้ดูแล" description="จัดการผู้ดูแลระบบและคำเชิญ" />

      <Card>
        <CardHeader>
          <h2 className="font-display font-medium text-ink">เชิญผู้ดูแลใหม่</h2>
        </CardHeader>
        <CardBody>
          <form
            onSubmit={form.handleSubmit(onInvite)}
            className="grid gap-4 sm:grid-cols-[1fr_auto]"
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
            <div className="flex items-end">
              <Button
                type="submit"
                disabled={inviteMutation.isPending}
                aria-busy={inviteMutation.isPending}
              >
                {inviteMutation.isPending ? 'กำลังส่ง...' : 'ส่งคำเชิญ'}
              </Button>
            </div>
          </form>
          {inviteMutation.isError ? (
            <p role="alert" className="mt-2 text-sm text-danger">
              {inviteMutation.error instanceof Error
                ? inviteMutation.error.message
                : 'ส่งคำเชิญไม่สำเร็จ'}
            </p>
          ) : null}
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="font-display font-medium text-ink">ผู้ดูแลระบบ ({members.length})</h2>
        </CardHeader>
        <CardBody className="space-y-3">
          {membersLoading ? (
            <p className="text-sm text-muted">กำลังโหลด...</p>
          ) : members.length === 0 ? (
            <p className="text-sm text-muted">ยังไม่มีผู้ดูแลระบบ</p>
          ) : (
            members.map((member) => {
              const isSelf = member.id === currentUser?.id;
              return (
                <div
                  key={member.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border px-4 py-3"
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium text-ink">{member.fullName || member.email}</p>
                      <Badge status={member.isActive ? 'published' : 'draft'}>
                        {member.isActive ? 'ใช้งานอยู่' : 'ปิดใช้งาน'}
                      </Badge>
                      {isSelf ? <Badge status="published">คุณ</Badge> : null}
                    </div>
                    <p className="text-sm text-muted">{member.email}</p>
                  </div>
                  {!isSelf ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={mutationPending}
                      aria-busy={setActiveMutation.isPending}
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
                </div>
              );
            })
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="font-display font-medium text-ink">คำเชิญที่รอตอบรับ</h2>
        </CardHeader>
        <CardBody className="space-y-3">
          {invitationsLoading ? (
            <p className="text-sm text-muted">กำลังโหลด...</p>
          ) : invitations.length === 0 ? (
            <p className="text-sm text-muted">ไม่มีคำเชิญที่รอตอบรับ</p>
          ) : (
            invitations.map((invitation) => (
              <div
                key={invitation.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border px-4 py-3"
              >
                <div>
                  <p className="font-medium text-ink">{invitation.email}</p>
                  <p className="text-sm text-muted">
                    {labelInvitationStatus(invitation.status)} · หมดอายุ{' '}
                    {new Date(invitation.expiresAt).toLocaleDateString('th-TH')}
                  </p>
                </div>
                {invitation.status === 'pending' ? (
                  <ConfirmDeleteButton
                    confirmLabel={invitation.email}
                    title="ยกเลิกคำเชิญ"
                    confirmButtonLabel="ยกเลิก"
                    description={`จะยกเลิกคำเชิญไปยัง ${invitation.email}`}
                    disabled={mutationPending}
                    isDeleting={revokeMutation.isPending}
                    onConfirm={async () => {
                      await revokeMutation.mutateAsync(invitation.id);
                    }}
                  >
                    ยกเลิกคำเชิญ
                  </ConfirmDeleteButton>
                ) : null}
              </div>
            ))
          )}
        </CardBody>
      </Card>
    </div>
  );
}
