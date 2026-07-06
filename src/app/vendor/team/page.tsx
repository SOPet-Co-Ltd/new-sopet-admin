'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardBody, CardHeader, PageHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useIsStoreOwner } from '@/hooks/useMembershipRole';
import {
  useInviteStoreMember,
  useRemoveStoreMember,
  useRevokeStoreInvitation,
  useStoreInvitations,
  useStoreMembers,
  useUpdateStoreMemberRole,
} from '@/hooks/useTeam';
import { labelInvitationStatus, labelMembershipRole } from '@/lib/i18n/th';
import { inviteMemberSchema, type InviteMemberFormValues } from '@/lib/validations';

export default function VendorTeamPage() {
  const { isOwner, isLoading: ownerLoading } = useIsStoreOwner();
  const { data: members = [], isLoading: membersLoading } = useStoreMembers();
  const { data: invitations = [], isLoading: invitationsLoading } = useStoreInvitations(isOwner);
  const inviteMutation = useInviteStoreMember();
  const updateRoleMutation = useUpdateStoreMemberRole();
  const removeMutation = useRemoveStoreMember();
  const revokeMutation = useRevokeStoreInvitation();

  const form = useForm<InviteMemberFormValues>({
    resolver: zodResolver(inviteMemberSchema),
    defaultValues: { email: '', role: 'staff' },
  });

  if (ownerLoading) {
    return <p className="text-muted">กำลังโหลด...</p>;
  }

  if (!isOwner) {
    return (
      <div>
        <PageHeader title="ทีมร้านค้า" description="จัดการสมาชิกและคำเชิญ" />
        <Card>
          <CardBody>
            <p className="text-sm text-muted">เฉพาะเจ้าของร้านเท่านั้นที่จัดการทีมได้</p>
          </CardBody>
        </Card>
      </div>
    );
  }

  async function onInvite(values: InviteMemberFormValues) {
    try {
      await inviteMutation.mutateAsync(values);
      form.reset({ email: '', role: 'staff' });
    } catch {
      // surfaced via mutation state
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title="ทีมร้านค้า" description="เชิญสมาชิกและจัดการบทบาท" />

      <Card>
        <CardHeader>
          <h2 className="font-display font-medium text-ink">เชิญสมาชิกใหม่</h2>
        </CardHeader>
        <CardBody>
          <form
            onSubmit={form.handleSubmit(onInvite)}
            className="grid gap-4 sm:grid-cols-[1fr_auto_auto]"
          >
            <div>
              <Label htmlFor="invite-email" required>
                อีเมล
              </Label>
              <Input
                id="invite-email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                aria-invalid={!!form.formState.errors.email}
                aria-describedby={form.formState.errors.email ? 'invite-email-error' : undefined}
                {...form.register('email')}
                className="mt-1.5"
              />
              {form.formState.errors.email ? (
                <p id="invite-email-error" role="alert" className="mt-1 text-xs text-danger">
                  {form.formState.errors.email.message}
                </p>
              ) : null}
            </div>
            <div>
              <Label htmlFor="invite-role" required>
                บทบาท
              </Label>
              <Select
                value={form.watch('role')}
                onValueChange={(role) =>
                  form.setValue('role', role as InviteMemberFormValues['role'])
                }
              >
                <SelectTrigger id="invite-role" className="mt-1.5 w-40">
                  <SelectValue placeholder="เลือกบทบาท" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manager">ผู้จัดการ</SelectItem>
                  <SelectItem value="staff">พนักงาน</SelectItem>
                </SelectContent>
              </Select>
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
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="font-display font-medium text-ink">สมาชิก ({members.length})</h2>
        </CardHeader>
        <CardBody className="space-y-3">
          {membersLoading ? (
            <p className="text-sm text-muted">กำลังโหลด...</p>
          ) : (
            members.map((member) => (
              <div
                key={member.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border px-4 py-3"
              >
                <div>
                  <p className="font-medium text-ink">{member.fullName ?? member.email}</p>
                  <p className="text-sm text-muted">{member.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge>{labelMembershipRole(member.role)}</Badge>
                  {member.role !== 'owner' ? (
                    <>
                      <Select
                        value={member.role}
                        onValueChange={(role) =>
                          updateRoleMutation.mutate({ memberId: member.id, role })
                        }
                      >
                        <SelectTrigger className="w-36" aria-label="เปลี่ยนบทบาทสมาชิก">
                          <SelectValue placeholder="เลือกบทบาท" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="manager">ผู้จัดการ</SelectItem>
                          <SelectItem value="staff">พนักงาน</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={removeMutation.isPending}
                        aria-busy={removeMutation.isPending}
                        onClick={() => removeMutation.mutate(member.id)}
                      >
                        ลบ
                      </Button>
                    </>
                  ) : null}
                </div>
              </div>
            ))
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
                    {labelMembershipRole(invitation.role)} ·{' '}
                    {labelInvitationStatus(invitation.status)}
                  </p>
                </div>
                {invitation.status === 'pending' ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={revokeMutation.isPending}
                    aria-busy={revokeMutation.isPending}
                    onClick={() => revokeMutation.mutate(invitation.id)}
                  >
                    ยกเลิกคำเชิญ
                  </Button>
                ) : null}
              </div>
            ))
          )}
        </CardBody>
      </Card>
    </div>
  );
}
