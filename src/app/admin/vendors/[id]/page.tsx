'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { AdminCustomerOrderHistory } from '@/components/admin/admin-customer-order-history';
import { AdminVendorActivityLog } from '@/components/admin/admin-vendor-activity-log';
import {
  BackToVendorsLink,
  VendorDetailRow,
  VendorDetailSkeleton,
  VendorInsightFact,
  VendorStatusBadges,
} from '@/components/admin/admin-vendor-detail-primitives';
import { AdminVendorMembershipsTable } from '@/components/admin/admin-vendor-memberships-table';
import { AdminVendorStoresTable } from '@/components/admin/admin-vendor-stores-table';
import { Button } from '@/components/ui/button';
import { Card, CardBody, CardHeader, PageHeader } from '@/components/ui/card';
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
import { executeMutation } from '@/lib/graphql/client';
import { ADMIN_TRIGGER_VENDOR_PASSWORD_RESET } from '@/lib/graphql/documents';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import { adminVendorFormSchema, type AdminVendorFormValues } from '@/lib/validations';

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

  if (isLoading) return <VendorDetailSkeleton />;

  if (error || !vendor) {
    return (
      <div className="space-y-4">
        <BackToVendorsLink />
        <p className="text-sm text-danger" role="alert">
          {error instanceof Error ? error.message : 'ไม่พบผู้ขาย'}
        </p>
      </div>
    );
  }

  const { insights } = vendor;
  const mutationPending = updateMutation.isPending;
  const verificationPending = resendVerificationMutation.isPending || verifyEmailMutation.isPending;
  const isActive = vendor.isActive !== false;

  return (
    <div className="space-y-8">
      <PageHeader
        title={vendor.fullName}
        description={vendor.email}
        back={<BackToVendorsLink />}
        action={<VendorStatusBadges isActive={isActive} emailVerified={vendor.emailVerified} />}
      />

      {!vendor.emailVerified ? (
        <Card className="border-warning-bg bg-warning-bg/40">
          <CardBody className="space-y-4">
            <div>
              <h2 className="font-display text-base font-semibold text-balance text-warning-text">
                ยังไม่ยืนยันอีเมล
              </h2>
              <p className="mt-1 text-sm text-muted-foreground text-pretty">
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
              <p className="text-sm text-muted-foreground" role="status">
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

      <section aria-labelledby="vendor-platform-insights">
        <h2 id="vendor-platform-insights" className="sr-only">
          ภาพรวมผู้ขาย
        </h2>
        <Card>
          <CardBody>
            <dl className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              <VendorInsightFact label="จำนวนร้านค้า">
                {insights.storeCount.toLocaleString('th-TH')}
              </VendorInsightFact>
              <VendorInsightFact label="รายได้รวม">
                {formatCurrency(insights.totalRevenue)}
              </VendorInsightFact>
              <VendorInsightFact
                label="จำนวนคำสั่งซื้อ"
                hint="ไม่รวมคำสั่งซื้อที่ยกเลิก คืนเงิน หรือรอชำระ"
              >
                {insights.orderCount.toLocaleString('th-TH')}
              </VendorInsightFact>
            </dl>
          </CardBody>
        </Card>
      </section>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
        <Card>
          <CardHeader>
            <h2 className="font-display text-lg font-semibold text-balance text-ink">
              แก้ไขข้อมูลผู้ขาย
            </h2>
            <p className="mt-1 text-sm text-muted-foreground text-pretty">
              อัปเดตชื่อและอีเมลสำหรับเข้าสู่ระบบ
            </p>
          </CardHeader>
          <CardBody>
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
                  aria-describedby={
                    form.formState.errors.fullName ? 'vendor-fullName-error' : undefined
                  }
                  {...form.register('fullName')}
                  className="mt-1.5"
                />
                {form.formState.errors.fullName ? (
                  <p id="vendor-fullName-error" className="mt-1 text-xs text-danger" role="alert">
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
                  aria-describedby={form.formState.errors.email ? 'vendor-email-error' : undefined}
                  {...form.register('email')}
                  className="mt-1.5"
                />
                {form.formState.errors.email ? (
                  <p id="vendor-email-error" className="mt-1 text-xs text-danger" role="alert">
                    {form.formState.errors.email.message}
                  </p>
                ) : null}
              </div>
              {updateMutation.isError ? (
                <p className="text-sm text-danger" role="alert">
                  {updateMutation.error instanceof Error
                    ? updateMutation.error.message
                    : 'บันทึกไม่สำเร็จ'}
                </p>
              ) : null}
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
              <h2 className="font-display text-lg font-semibold text-balance text-ink">
                ข้อมูลบัญชี
              </h2>
              <p className="mt-1 text-sm text-muted-foreground text-pretty">
                กิจกรรมและข้อมูลที่บันทึกในระบบ
              </p>
            </CardHeader>
            <CardBody className="space-y-3 text-sm">
              <VendorDetailRow label="สมัครเมื่อ">
                {vendor.createdAt ? formatDateTime(vendor.createdAt) : '—'}
              </VendorDetailRow>
              <VendorDetailRow label="เข้าสู่ระบบล่าสุด">
                {vendor.lastLoginAt ? formatDateTime(vendor.lastLoginAt) : 'ยังไม่เคยเข้าสู่ระบบ'}
              </VendorDetailRow>
              <VendorDetailRow label="กิจกรรมล่าสุด">
                {insights.lastActivityAt
                  ? formatDateTime(insights.lastActivityAt)
                  : 'ยังไม่มีกิจกรรม'}
              </VendorDetailRow>
              <VendorDetailRow label="ยอดเฉลี่ยต่อคำสั่งซื้อ">
                {formatCurrency(insights.averageOrderValue)}
              </VendorDetailRow>
              <VendorDetailRow label="คำสั่งซื้อล่าสุด">
                {insights.lastOrderAt ? formatDateTime(insights.lastOrderAt) : 'ยังไม่มีคำสั่งซื้อ'}
              </VendorDetailRow>
              <VendorDetailRow label="สมาชิกร้านอื่น">
                {insights.membershipCount.toLocaleString('th-TH')} ร้าน
              </VendorDetailRow>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="font-display text-lg font-semibold text-balance text-ink">
                การดำเนินการบัญชี
              </h2>
              <p className="mt-1 text-sm text-muted-foreground text-pretty">
                จัดการสถานะบัญชีและการเข้าสู่ระบบ
              </p>
            </CardHeader>
            <CardBody className="space-y-3">
              <Button
                type="button"
                variant={isActive ? 'destructive' : 'outline'}
                className="w-full"
                disabled={mutationPending}
                aria-busy={updateMutation.isPending}
                onClick={() =>
                  updateMutation.mutate({
                    id: params.id,
                    input: { isActive: !isActive },
                  })
                }
              >
                {isActive ? 'ระงับบัญชี' : 'เปิดใช้งานบัญชี'}
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
                <p className="text-sm text-muted-foreground" role="status">
                  {resetMessage}
                </p>
              ) : null}
            </CardBody>
          </Card>
        </div>
      </div>

      <section className="space-y-6" aria-labelledby="vendor-stores-heading">
        <h2 id="vendor-stores-heading" className="sr-only">
          ร้านค้าและกิจกรรม
        </h2>
        <AdminVendorStoresTable stores={vendor.stores} />
        <AdminVendorMembershipsTable memberships={insights.memberships} />
        <AdminVendorActivityLog activities={insights.activities} />
        <AdminCustomerOrderHistory
          orders={insights.recentOrders}
          title="คำสั่งซื้อล่าสุดของร้าน"
          description="แสดงคำสั่งซื้อ 10 รายการล่าสุดจากร้านที่เป็นเจ้าของ"
          emptyMessage="ยังไม่มีคำสั่งซื้อจากร้านของผู้ขาย"
        />
      </section>
    </div>
  );
}
