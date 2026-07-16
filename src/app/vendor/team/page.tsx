'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { Badge } from '@/components/ui/badge';
import { ConfirmDeleteButton } from '@/components/ui/confirm-delete-button';
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
import { isApiError } from '@/lib/api/errors';
import {
  labelInvitationStatus,
  labelMembershipRole,
  membershipRoleDescriptions,
} from '@/lib/i18n/th';
import { inviteMemberSchema, type InviteMemberFormValues } from '@/lib/validations';

function TeamPageSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-live="polite">
      <div className="space-y-2">
        <div className="h-8 w-40 animate-pulse rounded-md bg-surface motion-reduce:animate-none" />
        <div className="h-4 w-64 max-w-full animate-pulse rounded-md bg-surface motion-reduce:animate-none" />
      </div>
      <div className="h-40 animate-pulse rounded-xl border border-border bg-card motion-reduce:animate-none" />
      <div className="h-48 animate-pulse rounded-xl border border-border bg-card motion-reduce:animate-none" />
      <div className="h-32 animate-pulse rounded-xl border border-border bg-card motion-reduce:animate-none" />
      <span className="sr-only">กำลังโหลด...</span>
    </div>
  );
}

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

function roleBadgeClass(role: string): string {
  if (role === 'owner') return 'bg-brand-tint text-brand';
  if (role === 'manager') return 'bg-tertiary-tint text-tertiary-deep border-0';
  return 'border border-border bg-surface text-muted-foreground';
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

  const invitePending = inviteMutation.isPending;

  if (ownerLoading) {
    return <TeamPageSkeleton />;
  }

  if (!isOwner) {
    return (
      <div>
        <PageHeader title="ทีมร้านค้า" description="จัดการสมาชิกและคำเชิญ" />
        <Card>
          <CardBody className="space-y-2">
            <p className="text-sm font-medium text-ink">เฉพาะเจ้าของร้านที่จัดการทีมได้</p>
            <p className="text-sm text-pretty text-muted-foreground">
              ผู้จัดการและพนักงานสามารถทำงานขายได้ตามบทบาท แต่ไม่สามารถเชิญ เปลี่ยนบทบาท
              หรือลบสมาชิกได้
            </p>
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

  const pendingInvites = invitations.filter((invitation) => invitation.status === 'pending');

  return (
    <div className="space-y-6">
      <PageHeader
        title="ทีมร้านค้า"
        description="เชิญสมาชิก กำหนดบทบาท และเพิกถอนสิทธิ์เมื่อไม่ต้องการแล้ว"
      />

      <Card>
        <CardHeader className="space-y-1">
          <h2 className="font-display font-medium text-balance text-ink">เชิญสมาชิกใหม่</h2>
          <p className="text-sm text-pretty text-muted-foreground">
            ส่งคำเชิญทางอีเมล — ผู้รับต้องตอบรับก่อนจึงจะเข้าร่วมทีม
          </p>
        </CardHeader>
        <CardBody className="space-y-5">
          <form
            onSubmit={form.handleSubmit(onInvite)}
            className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_11rem_auto] sm:items-start"
            noValidate
          >
            <div>
              <Label htmlFor="invite-email" required>
                อีเมล
              </Label>
              <Input
                id="invite-email"
                type="email"
                autoComplete="email"
                placeholder="member@example.com"
                disabled={invitePending}
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
              <Controller
                control={form.control}
                name="role"
                render={({ field }) => (
                  <>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={invitePending}
                    >
                      <SelectTrigger
                        id="invite-role"
                        className="mt-1.5"
                        aria-describedby="invite-role-help"
                      >
                        <SelectValue placeholder="เลือกบทบาท" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="manager">ผู้จัดการ</SelectItem>
                        <SelectItem value="staff">พนักงาน</SelectItem>
                      </SelectContent>
                    </Select>
                    <p
                      id="invite-role-help"
                      className="mt-1.5 text-xs text-pretty text-muted-foreground"
                    >
                      {membershipRoleDescriptions[field.value]}
                    </p>
                  </>
                )}
              />
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

          <dl className="grid gap-3 rounded-lg bg-surface px-4 py-3 sm:grid-cols-3">
            {(['owner', 'manager', 'staff'] as const).map((role) => (
              <div key={role} className="min-w-0 space-y-1">
                <dt>
                  <Badge className={roleBadgeClass(role)}>{labelMembershipRole(role)}</Badge>
                </dt>
                <dd className="text-xs text-pretty text-muted-foreground">
                  {membershipRoleDescriptions[role]}
                </dd>
              </div>
            ))}
          </dl>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="font-display font-medium text-balance text-ink">
            สมาชิก ({membersLoading ? '…' : members.length})
          </h2>
        </CardHeader>
        <CardBody className="space-y-3">
          {membersLoading ? (
            <ListRowSkeleton rows={2} />
          ) : members.length === 0 ? (
            <p className="text-sm text-pretty text-muted-foreground">
              ยังไม่มีสมาชิกในร้าน — ส่งคำเชิญด้านบนเพื่อเพิ่มทีม
            </p>
          ) : (
            <ul className="space-y-3">
              {members.map((member) => {
                const isOwnerMember = member.role === 'owner';
                const displayName = member.fullName ?? member.email ?? member.id;
                const roleUpdating =
                  updateRoleMutation.isPending &&
                  updateRoleMutation.variables?.memberId === member.id;
                const removing = removeMutation.isPending && removeMutation.variables === member.id;

                return (
                  <li
                    key={member.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-card px-4 py-3 transition-colors duration-200 motion-reduce:transition-none"
                  >
                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate font-medium text-ink">{displayName}</p>
                        {isOwnerMember ? (
                          <Badge className={roleBadgeClass('owner')}>
                            {labelMembershipRole('owner')}
                          </Badge>
                        ) : null}
                      </div>
                      {member.email && member.fullName ? (
                        <p className="truncate text-sm text-muted-foreground">{member.email}</p>
                      ) : null}
                      {!isOwnerMember ? (
                        <p className="text-xs text-muted-foreground">
                          {membershipRoleDescriptions[member.role] ??
                            labelMembershipRole(member.role)}
                        </p>
                      ) : (
                        <p className="text-xs text-muted-foreground">
                          {membershipRoleDescriptions.owner}
                        </p>
                      )}
                    </div>

                    {!isOwnerMember ? (
                      <div className="flex flex-wrap items-center gap-2">
                        <Select
                          value={member.role}
                          disabled={roleUpdating || removing}
                          onValueChange={(role) =>
                            updateRoleMutation.mutate({ memberId: member.id, role })
                          }
                        >
                          <SelectTrigger
                            className="w-36 transition-opacity duration-200 motion-reduce:transition-none"
                            aria-label={`เปลี่ยนบทบาทของ ${displayName}`}
                            aria-busy={roleUpdating}
                          >
                            <SelectValue placeholder="เลือกบทบาท" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="manager">ผู้จัดการ</SelectItem>
                            <SelectItem value="staff">พนักงาน</SelectItem>
                          </SelectContent>
                        </Select>
                        <ConfirmDeleteButton
                          confirmLabel={member.email ?? member.fullName ?? member.id}
                          title="ลบสมาชิก"
                          description={`จะลบ ${displayName} ออกจากทีมร้านค้า — สมาชิกจะเข้าถึงร้านนี้ไม่ได้ทันที`}
                          disabled={roleUpdating || removeMutation.isPending}
                          isDeleting={removing}
                          onConfirm={async () => {
                            await removeMutation.mutateAsync(member.id);
                          }}
                        >
                          ลบออก
                        </ConfirmDeleteButton>
                      </div>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          )}
          {updateRoleMutation.isError ? (
            <p role="alert" className="text-sm text-danger">
              {mutationErrorMessage(updateRoleMutation.error, 'เปลี่ยนบทบาทไม่สำเร็จ')}
            </p>
          ) : null}
          {removeMutation.isError ? (
            <p role="alert" className="text-sm text-danger">
              {mutationErrorMessage(removeMutation.error, 'ลบสมาชิกไม่สำเร็จ')}
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
              ยังไม่มีคำเชิญค้างอยู่ — ส่งคำเชิญด้านบนเพื่อเพิ่มสมาชิก
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
                        <Badge className={roleBadgeClass(invitation.role)}>
                          {labelMembershipRole(invitation.role)}
                        </Badge>
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
