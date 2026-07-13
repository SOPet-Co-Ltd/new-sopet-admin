'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  HiArrowLeft,
  HiBanknotes,
  HiBuildingStorefront,
  HiEnvelope,
  HiShoppingBag,
} from 'react-icons/hi2';
import { AdminCustomerOrderHistory } from '@/components/admin/admin-customer-order-history';
import { AdminVendorActivityLog } from '@/components/admin/admin-vendor-activity-log';
import { AdminVendorMembershipsTable } from '@/components/admin/admin-vendor-memberships-table';
import { AdminVendorStoresTable } from '@/components/admin/admin-vendor-stores-table';
import { StatCard } from '@/components/vendor/stat-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  useAdminResendVendorEmailVerification,
  useAdminVendorDetail,
  useAdminVerifyVendorEmail,
  useUpdateVendorAsAdmin,
} from '@/hooks/useAdminVendors';
import { ADMIN_TRIGGER_VENDOR_PASSWORD_RESET } from '@/lib/graphql/documents';
import { executeMutation } from '@/lib/graphql/client';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import { adminVendorFormSchema, type AdminVendorFormValues } from '@/lib/validations';

function getVendorInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'ผ';
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

function VendorAvatar({ name }: { name: string }) {
  return (
    <div
      aria-hidden="true"
      className="flex size-16 shrink-0 items-center justify-center rounded-2xl border border-brand/15 bg-brand-tint font-display text-xl font-semibold text-brand sm:size-20 sm:text-2xl"
    >
      {getVendorInitials(name)}
    </div>
  );
}

function AccountInfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border pb-3 last:border-b-0 last:pb-0">
      <span className="text-muted">{label}</span>
      <span className="text-right text-ink">{value}</span>
    </div>
  );
}

export default function AdminVendorEditPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { data: vendor, isLoading, error } = useAdminVendorDetail(params.id);
  const updateMutation = useUpdateVendorAsAdmin();
  const resendVerificationMutation = useAdminResendVendorEmailVerification();
  const verifyEmailMutation = useAdminVerifyVendorEmail();
  const [resetMessage, setResetMessage] = useState<string | null>(null);
  const [verificationMessage, setVerificationMessage] = useState<string | null>(null);
  const [confirmVerifyOpen, setConfirmVerifyOpen] = useState(false);

  const passwordResetMutation = useMutation({
    mutationFn: ({ vendorId }: { vendorId: string }) =>
      executeMutation<{ adminTriggerVendorPasswordReset: { message: string } }>(
        ADMIN_TRIGGER_VENDOR_PASSWORD_RESET,
        { vendorId },
      ).then((data) => data.adminTriggerVendorPasswordReset.message),
  });

  const form = useForm<AdminVendorFormValues>({
    resolver: zodResolver(adminVendorFormSchema),
    defaultValues: { fullName: '', email: '' },
  });

  useEffect(() => {
    if (!vendor) return;
    form.reset({ fullName: vendor.fullName, email: vendor.email });
  }, [vendor, form]);

  async function onSubmit(values: AdminVendorFormValues) {
    try {
      await updateMutation.mutateAsync({ id: params.id, input: values });
      router.push('/admin/vendors');
    } catch {
      // surfaced via mutation state
    }
  }

  async function handlePasswordReset() {
    setResetMessage(null);
    try {
      const message = await passwordResetMutation.mutateAsync({ vendorId: params.id });
      setResetMessage(message);
    } catch (err) {
      setResetMessage(err instanceof Error ? err.message : 'ส่งอีเมลรีเซ็ตรหัสผ่านไม่สำเร็จ');
    }
  }

  async function handleResendVerification() {
    setVerificationMessage(null);
    try {
      const message = await resendVerificationMutation.mutateAsync(params.id);
      setVerificationMessage(message);
    } catch (err) {
      setVerificationMessage(
        err instanceof Error ? err.message : 'ส่งอีเมลยืนยันอีกครั้งไม่สำเร็จ',
      );
    }
  }

  async function handleManualVerify() {
    setVerificationMessage(null);
    try {
      const message = await verifyEmailMutation.mutateAsync(params.id);
      setVerificationMessage(message);
      setConfirmVerifyOpen(false);
    } catch (err) {
      setVerificationMessage(err instanceof Error ? err.message : 'ยืนยันอีเมลด้วยตนเองไม่สำเร็จ');
      setConfirmVerifyOpen(false);
    }
  }

  if (isLoading) return <p className="text-muted">กำลังโหลด...</p>;
  if (error || !vendor) {
    return (
      <p className="text-danger" role="alert">
        {error instanceof Error ? error.message : 'ไม่พบผู้ขาย'}
      </p>
    );
  }

  const { insights } = vendor;
  const mutationPending = updateMutation.isPending;
  const verificationPending = resendVerificationMutation.isPending || verifyEmailMutation.isPending;

  return (
    <div className="space-y-8">
      <Link
        href="/admin/vendors"
        className="inline-flex items-center gap-1 text-sm text-muted hover:text-brand"
      >
        <HiArrowLeft className="size-3.5" aria-hidden="true" />
        กลับรายการผู้ขาย
      </Link>

      <Card>
        <CardBody>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-5">
            <VendorAvatar name={vendor.fullName} />
            <div className="min-w-0 flex-1">
              <h1 className="font-display text-2xl font-semibold text-ink">{vendor.fullName}</h1>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-muted">
                <HiEnvelope className="size-4 shrink-0" aria-hidden="true" />
                <span className="truncate">{vendor.email}</span>
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Badge status={vendor.isActive !== false ? 'published' : 'draft'}>
                  {vendor.isActive !== false ? 'ใช้งานอยู่' : 'ระงับ'}
                </Badge>
                {vendor.emailVerified ? (
                  <Badge status="published">ยืนยันอีเมลแล้ว</Badge>
                ) : (
                  <Badge status="draft">ยังไม่ยืนยันอีเมล</Badge>
                )}
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {!vendor.emailVerified ? (
        <Card className="border-warning-bg bg-warning-bg/40">
          <CardBody className="space-y-4">
            <div>
              <h2 className="font-display text-base font-semibold text-warning-text">
                ยังไม่ยืนยันอีเมล
              </h2>
              <p className="mt-1 text-sm text-muted">
                ผู้ขายยังไม่ได้ยืนยันอีเมล{' '}
                <span className="font-medium text-ink">{vendor.email}</span>{' '}
                ส่งลิงก์ยืนยันอีกครั้งหรือยืนยันด้วยตนเองได้จากที่นี่
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="bg-card"
                disabled={
                  resendVerificationMutation.isResendDisabled || verifyEmailMutation.isPending
                }
                aria-busy={resendVerificationMutation.isPending}
                onClick={() => void handleResendVerification()}
              >
                {resendVerificationMutation.resendButtonLabel}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="bg-card"
                disabled={verificationPending}
                onClick={() => setConfirmVerifyOpen(true)}
              >
                ยืนยันอีเมลด้วยตนเอง
              </Button>
            </div>
            {verificationMessage ? (
              <p className="text-sm text-muted" role="status">
                {verificationMessage}
              </p>
            ) : null}
          </CardBody>
        </Card>
      ) : null}

      <Dialog open={confirmVerifyOpen} onOpenChange={setConfirmVerifyOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ยืนยันอีเมลด้วยตนเอง</DialogTitle>
            <DialogDescription>
              คุณต้องการยืนยันอีเมล {vendor.email} แทนผู้ขายหรือไม่?
              การดำเนินการนี้จะข้ามขั้นตอนการยืนยันผ่านลิงก์ในอีเมล
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setConfirmVerifyOpen(false)}>
              ยกเลิก
            </Button>
            <Button
              type="button"
              disabled={verifyEmailMutation.isPending}
              aria-busy={verifyEmailMutation.isPending}
              onClick={() => void handleManualVerify()}
            >
              {verifyEmailMutation.isPending ? 'กำลังยืนยัน...' : 'ยืนยันอีเมล'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <section className="space-y-4" aria-labelledby="vendor-overview-heading">
        <h2 id="vendor-overview-heading" className="font-display text-lg font-semibold text-ink">
          ภาพรวม
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <StatCard
            label="จำนวนร้านค้า"
            value={insights.storeCount}
            icon={<HiBuildingStorefront className="size-5 text-brand" aria-hidden="true" />}
          />
          <StatCard
            label="รายได้รวม"
            value={formatCurrency(insights.totalRevenue)}
            icon={<HiBanknotes className="size-5 text-brand" aria-hidden="true" />}
          />
          <StatCard
            label="จำนวนคำสั่งซื้อ"
            value={insights.orderCount}
            hint="ไม่รวมคำสั่งซื้อที่ยกเลิก คืนเงิน หรือรอชำระ"
            icon={<HiShoppingBag className="size-5 text-brand" aria-hidden="true" />}
          />
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
        <Card>
          <CardHeader>
            <h2 className="font-display text-lg font-semibold text-ink">แก้ไขข้อมูลผู้ขาย</h2>
            <p className="text-sm text-muted">อัปเดตชื่อและอีเมลสำหรับเข้าสู่ระบบ</p>
          </CardHeader>
          <CardBody className="pt-0">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
              <div>
                <Label htmlFor="vendor-fullName" required>
                  ชื่อ-นามสกุล
                </Label>
                <Input
                  id="vendor-fullName"
                  placeholder="ชื่อ-นามสกุล"
                  autoComplete="name"
                  aria-invalid={!!form.formState.errors.fullName}
                  {...form.register('fullName')}
                  className="mt-1.5"
                />
                {form.formState.errors.fullName ? (
                  <p className="mt-1 text-xs text-danger" role="alert">
                    {form.formState.errors.fullName.message}
                  </p>
                ) : null}
              </div>
              <div>
                <Label htmlFor="vendor-email" required>
                  อีเมล
                </Label>
                <Input
                  id="vendor-email"
                  type="email"
                  placeholder="email@example.com"
                  autoComplete="email"
                  aria-invalid={!!form.formState.errors.email}
                  {...form.register('email')}
                  className="mt-1.5"
                />
                {form.formState.errors.email ? (
                  <p className="mt-1 text-xs text-danger" role="alert">
                    {form.formState.errors.email.message}
                  </p>
                ) : null}
              </div>
              <div className="flex flex-wrap gap-3 pt-1">
                <Button
                  type="submit"
                  disabled={mutationPending}
                  aria-busy={updateMutation.isPending}
                >
                  {updateMutation.isPending ? 'กำลังบันทึก...' : 'บันทึก'}
                </Button>
                <Button type="button" variant="outline" asChild>
                  <Link href="/admin/vendors">ยกเลิก</Link>
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <h2 className="font-display text-lg font-semibold text-ink">ข้อมูลบัญชี</h2>
            </CardHeader>
            <CardBody className="space-y-3 pt-0 text-sm">
              <AccountInfoRow
                label="สมัครเมื่อ"
                value={vendor.createdAt ? formatDateTime(vendor.createdAt) : '—'}
              />
              <AccountInfoRow
                label="เข้าสู่ระบบล่าสุด"
                value={
                  vendor.lastLoginAt ? formatDateTime(vendor.lastLoginAt) : 'ยังไม่เคยเข้าสู่ระบบ'
                }
              />
              <AccountInfoRow
                label="กิจกรรมล่าสุด"
                value={
                  insights.lastActivityAt
                    ? formatDateTime(insights.lastActivityAt)
                    : 'ยังไม่มีกิจกรรม'
                }
              />
              <AccountInfoRow
                label="ยอดเฉลี่ยต่อคำสั่งซื้อ"
                value={formatCurrency(insights.averageOrderValue)}
              />
              <AccountInfoRow
                label="คำสั่งซื้อล่าสุด"
                value={
                  insights.lastOrderAt ? formatDateTime(insights.lastOrderAt) : 'ยังไม่มีคำสั่งซื้อ'
                }
              />
              <AccountInfoRow label="สมาชิกร้านอื่น" value={`${insights.membershipCount} ร้าน`} />
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="font-display text-lg font-semibold text-ink">การดำเนินการบัญชี</h2>
              <p className="text-sm text-muted">จัดการสถานะบัญชีและการเข้าสู่ระบบ</p>
            </CardHeader>
            <CardBody className="space-y-3 pt-0">
              <Button
                type="button"
                variant={vendor.isActive !== false ? 'destructive' : 'outline'}
                className="w-full"
                disabled={mutationPending}
                onClick={() =>
                  updateMutation.mutate({
                    id: params.id,
                    input: { isActive: vendor.isActive === false },
                  })
                }
              >
                {vendor.isActive !== false ? 'ระงับบัญชี' : 'เปิดใช้งานบัญชี'}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                disabled={passwordResetMutation.isPending}
                aria-busy={passwordResetMutation.isPending}
                aria-label={`ส่งอีเมลรีเซ็ตรหัสผ่านให้ ${vendor.email}`}
                onClick={() => void handlePasswordReset()}
              >
                {passwordResetMutation.isPending ? 'กำลังส่ง...' : 'ส่งอีเมลรีเซ็ตรหัสผ่าน'}
              </Button>
              {resetMessage ? (
                <p className="text-sm text-muted" role="status">
                  {resetMessage}
                </p>
              ) : null}
            </CardBody>
          </Card>
        </div>
      </div>

      <section className="space-y-6" aria-labelledby="vendor-stores-heading">
        <h2 id="vendor-stores-heading" className="font-display text-lg font-semibold text-ink">
          ร้านค้าและกิจกรรม
        </h2>
        <div className="space-y-6">
          <AdminVendorStoresTable stores={vendor.stores} />
          <AdminVendorMembershipsTable memberships={insights.memberships} />
          <AdminVendorActivityLog activities={insights.activities} />
          <AdminCustomerOrderHistory
            orders={insights.recentOrders}
            title="คำสั่งซื้อล่าสุดของร้าน"
            description="แสดงคำสั่งซื้อ 10 รายการล่าสุดจากร้านที่เป็นเจ้าของ"
            emptyMessage="ยังไม่มีคำสั่งซื้อจากร้านของผู้ขาย"
          />
        </div>
      </section>
    </div>
  );
}
