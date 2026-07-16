'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  BackToCustomersLink,
  CustomerDetailSkeleton,
  DetailRow,
  formatCustomerOrderDate,
  InsightFact,
} from '@/components/customers/customer-detail-primitives';
import { AdminCustomerOrderHistory } from '@/components/admin/admin-customer-order-history';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardBody, CardHeader, PageHeader } from '@/components/ui/card';
import { DatePicker } from '@/components/ui/date-picker';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  useAdminCustomerDetail,
  useSetCustomerActive,
  useUpdateCustomerAsAdmin,
} from '@/hooks/useAdminCustomers';
import { getMaxBirthday, MIN_BIRTHDAY } from '@/lib/datetime/calendarUtils';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import { adminCustomerFormSchema, type AdminCustomerFormValues } from '@/lib/validations';

function CustomerStatusBadges({
  isActive,
  isVerified,
}: {
  isActive: boolean;
  isVerified: boolean;
}) {
  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      <Badge status={isActive ? 'published' : 'draft'}>{isActive ? 'ใช้งานอยู่' : 'ระงับ'}</Badge>
      <Badge status={isVerified ? 'published' : 'draft'}>
        {isVerified ? 'ยืนยันแล้ว' : 'ยังไม่ยืนยัน'}
      </Badge>
    </div>
  );
}

export default function AdminCustomerEditPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { data: customer, isLoading, error } = useAdminCustomerDetail(params.id);
  const updateMutation = useUpdateCustomerAsAdmin();
  const setActiveMutation = useSetCustomerActive();

  const form = useForm<AdminCustomerFormValues>({
    resolver: zodResolver(adminCustomerFormSchema),
    defaultValues: { fullName: '', email: '', phone: '', dateOfBirth: '' },
  });

  useEffect(() => {
    if (!customer) return;
    form.reset({
      fullName: customer.fullName ?? '',
      email: customer.email ?? '',
      phone: customer.phone,
      dateOfBirth: customer.dateOfBirth ?? '',
    });
  }, [customer, form]);

  async function onSubmit(values: AdminCustomerFormValues) {
    try {
      await updateMutation.mutateAsync({
        id: params.id,
        input: {
          fullName: values.fullName || undefined,
          email: values.email || undefined,
          phone: values.phone,
          dateOfBirth: values.dateOfBirth || undefined,
        },
      });
      router.push('/admin/customers');
    } catch {
      // surfaced via mutation state
    }
  }

  if (isLoading) return <CustomerDetailSkeleton variant="admin" />;

  if (error || !customer) {
    return (
      <div className="space-y-4">
        <BackToCustomersLink href="/admin/customers" />
        <p className="text-sm text-danger" role="alert">
          {error instanceof Error ? error.message : 'ไม่พบลูกค้า'}
        </p>
      </div>
    );
  }

  const { insights } = customer;
  const mutationPending = updateMutation.isPending || setActiveMutation.isPending;
  const displayName = customer.fullName?.trim() || customer.phone;
  const headerDescription =
    customer.fullName?.trim() && customer.phone !== displayName ? customer.phone : undefined;

  return (
    <div className="space-y-8">
      <PageHeader
        title={displayName}
        description={headerDescription ?? 'แก้ไขข้อมูลและสถานะบัญชีลูกค้า'}
        back={<BackToCustomersLink href="/admin/customers" />}
        action={
          <CustomerStatusBadges isActive={customer.isActive} isVerified={customer.isVerified} />
        }
      />

      <section aria-labelledby="customer-platform-insights">
        <h2 id="customer-platform-insights" className="sr-only">
          สรุปการซื้อทั้งแพลตฟอร์ม
        </h2>
        <Card>
          <CardBody>
            <dl className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
              <InsightFact label="ยอดใช้จ่ายรวม">{formatCurrency(insights.totalSpent)}</InsightFact>
              <InsightFact
                label="จำนวนคำสั่งซื้อ"
                hint="ไม่รวมคำสั่งซื้อที่ยกเลิก คืนเงิน หรือรอชำระ"
              >
                {insights.orderCount.toLocaleString('th-TH')}
              </InsightFact>
              <InsightFact label="ยอดเฉลี่ยต่อคำสั่งซื้อ">
                {formatCurrency(insights.averageOrderValue)}
              </InsightFact>
              <InsightFact label="สั่งซื้อล่าสุด">
                {insights.lastOrderAt
                  ? formatCustomerOrderDate(insights.lastOrderAt)
                  : 'ยังไม่เคยสั่งซื้อ'}
              </InsightFact>
            </dl>
          </CardBody>
        </Card>
      </section>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
        <Card>
          <CardHeader>
            <h2 className="font-display text-lg font-semibold text-ink text-balance">
              แก้ไขข้อมูลลูกค้า
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              อัปเดตข้อมูลติดต่อและจัดการสถานะบัญชี
            </p>
          </CardHeader>
          <CardBody>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
              <div>
                <Label htmlFor="customer-fullName">ชื่อ-นามสกุล</Label>
                <Input
                  id="customer-fullName"
                  placeholder="ชื่อ-นามสกุล"
                  autoComplete="name"
                  {...form.register('fullName')}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="customer-phone" required>
                  เบอร์โทรศัพท์
                </Label>
                <Input
                  id="customer-phone"
                  placeholder="0812345678"
                  autoComplete="tel"
                  aria-invalid={!!form.formState.errors.phone}
                  aria-describedby={
                    form.formState.errors.phone ? 'customer-phone-error' : undefined
                  }
                  {...form.register('phone')}
                  className="mt-1.5"
                />
                {form.formState.errors.phone ? (
                  <p id="customer-phone-error" className="mt-1 text-xs text-danger" role="alert">
                    {form.formState.errors.phone.message}
                  </p>
                ) : null}
              </div>
              <div>
                <Label htmlFor="customer-email">อีเมล</Label>
                <Input
                  id="customer-email"
                  type="email"
                  placeholder="email@example.com"
                  autoComplete="email"
                  aria-invalid={!!form.formState.errors.email}
                  aria-describedby={
                    form.formState.errors.email ? 'customer-email-error' : undefined
                  }
                  {...form.register('email')}
                  className="mt-1.5"
                />
                {form.formState.errors.email ? (
                  <p id="customer-email-error" className="mt-1 text-xs text-danger" role="alert">
                    {form.formState.errors.email.message}
                  </p>
                ) : null}
              </div>
              <div>
                <Label htmlFor="customer-dob">วันเกิด</Label>
                <Controller
                  name="dateOfBirth"
                  control={form.control}
                  render={({ field }) => (
                    <DatePicker
                      id="customer-dob"
                      value={field.value ?? ''}
                      onChange={field.onChange}
                      min={MIN_BIRTHDAY}
                      max={getMaxBirthday()}
                      placeholder="เลือกวันเกิด"
                      className="mt-1.5"
                      data-testid="customer-dob-picker"
                    />
                  )}
                />
              </div>
              {updateMutation.isError ? (
                <p className="text-sm text-danger" role="alert">
                  {updateMutation.error instanceof Error
                    ? updateMutation.error.message
                    : 'บันทึกไม่สำเร็จ'}
                </p>
              ) : null}
              {setActiveMutation.isError ? (
                <p className="text-sm text-danger" role="alert">
                  {setActiveMutation.error instanceof Error
                    ? setActiveMutation.error.message
                    : 'เปลี่ยนสถานะบัญชีไม่สำเร็จ'}
                </p>
              ) : null}
              <div className="flex flex-wrap gap-3">
                <Button
                  type="submit"
                  disabled={mutationPending}
                  aria-busy={updateMutation.isPending}
                >
                  {updateMutation.isPending ? 'กำลังบันทึก...' : 'บันทึก'}
                </Button>
                <Button type="button" variant="outline" asChild>
                  <Link href="/admin/customers">ยกเลิก</Link>
                </Button>
                <Button
                  type="button"
                  variant={customer.isActive ? 'destructive' : 'outline'}
                  disabled={mutationPending}
                  aria-busy={setActiveMutation.isPending}
                  onClick={() =>
                    setActiveMutation.mutate({ id: params.id, isActive: !customer.isActive })
                  }
                >
                  {customer.isActive ? 'ระงับบัญชี' : 'เปิดใช้งานบัญชี'}
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="font-display text-lg font-semibold text-ink text-balance">
              ข้อมูลบัญชี
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">กิจกรรมและข้อมูลที่บันทึกในระบบ</p>
          </CardHeader>
          <CardBody className="space-y-3 text-sm">
            <DetailRow label="สมัครเมื่อ">
              {customer.createdAt ? formatDateTime(customer.createdAt) : '—'}
            </DetailRow>
            <DetailRow label="เข้าสู่ระบบล่าสุด">
              {customer.lastLoginAt ? formatDateTime(customer.lastLoginAt) : 'ยังไม่เคยเข้าสู่ระบบ'}
            </DetailRow>
            <DetailRow label="ที่อยู่ที่บันทึก">
              {insights.addressCount.toLocaleString('th-TH')} รายการ
            </DetailRow>
            <DetailRow label="สินค้าที่ชอบ">
              {insights.favoriteCount.toLocaleString('th-TH')} รายการ
            </DetailRow>
          </CardBody>
        </Card>
      </div>

      <AdminCustomerOrderHistory orders={insights.recentOrders} />
    </div>
  );
}
