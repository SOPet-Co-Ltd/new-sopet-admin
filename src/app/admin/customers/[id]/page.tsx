'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { HiArrowLeft } from 'react-icons/hi2';
import { AdminCustomerOrderHistory } from '@/components/admin/admin-customer-order-history';
import { StatCard } from '@/components/vendor/stat-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardBody, CardHeader, PageHeader } from '@/components/ui/card';
import { DatePicker } from '@/components/ui/date-picker';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getMaxBirthday, MIN_BIRTHDAY } from '@/lib/datetime/calendarUtils';
import {
  useAdminCustomerDetail,
  useSetCustomerActive,
  useUpdateCustomerAsAdmin,
} from '@/hooks/useAdminCustomers';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import { adminCustomerFormSchema, type AdminCustomerFormValues } from '@/lib/validations';

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

  if (isLoading) return <p className="text-muted">กำลังโหลด...</p>;
  if (error || !customer) {
    return (
      <p className="text-danger" role="alert">
        {error instanceof Error ? error.message : 'ไม่พบลูกค้า'}
      </p>
    );
  }

  const { insights } = customer;
  const mutationPending = updateMutation.isPending || setActiveMutation.isPending;

  return (
    <div className="space-y-6">
      <PageHeader
        title={customer.fullName || customer.phone}
        description={customer.phone}
        back={
          <Link
            href="/admin/customers"
            className="inline-flex items-center gap-1 text-sm text-muted hover:text-brand"
          >
            <HiArrowLeft className="size-3.5" aria-hidden="true" />
            กลับรายการลูกค้า
          </Link>
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        <Badge status={customer.isActive ? 'published' : 'draft'}>
          {customer.isActive ? 'ใช้งานอยู่' : 'ระงับ'}
        </Badge>
        {customer.isVerified ? (
          <Badge status="published">ยืนยันแล้ว</Badge>
        ) : (
          <Badge status="draft">ยังไม่ยืนยัน</Badge>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="ยอดใช้จ่ายรวม" value={formatCurrency(insights.totalSpent)} />
        <StatCard
          label="จำนวนคำสั่งซื้อ"
          value={insights.orderCount}
          hint="ไม่รวมคำสั่งซื้อที่ยกเลิก คืนเงิน หรือรอชำระ"
        />
        <StatCard
          label="ยอดเฉลี่ยต่อคำสั่งซื้อ"
          value={formatCurrency(insights.averageOrderValue)}
        />
        <StatCard
          label="สั่งซื้อล่าสุด"
          value={insights.lastOrderAt ? formatDateTime(insights.lastOrderAt) : 'ยังไม่เคยสั่งซื้อ'}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
        <Card>
          <CardHeader>
            <h2 className="font-display text-lg font-semibold text-ink">แก้ไขข้อมูลลูกค้า</h2>
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
                  {...form.register('phone')}
                  className="mt-1.5"
                />
                {form.formState.errors.phone ? (
                  <p className="mt-1 text-xs text-danger" role="alert">
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
                  {...form.register('email')}
                  className="mt-1.5"
                />
                {form.formState.errors.email ? (
                  <p className="mt-1 text-xs text-danger" role="alert">
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
            <h2 className="font-display text-lg font-semibold text-ink">ข้อมูลบัญชี</h2>
          </CardHeader>
          <CardBody className="space-y-3 text-sm">
            <div className="flex items-start justify-between gap-4 border-b border-border pb-3">
              <span className="text-muted">สมัครเมื่อ</span>
              <span className="text-right text-ink">
                {customer.createdAt ? formatDateTime(customer.createdAt) : '—'}
              </span>
            </div>
            <div className="flex items-start justify-between gap-4 border-b border-border pb-3">
              <span className="text-muted">เข้าสู่ระบบล่าสุด</span>
              <span className="text-right text-ink">
                {customer.lastLoginAt
                  ? formatDateTime(customer.lastLoginAt)
                  : 'ยังไม่เคยเข้าสู่ระบบ'}
              </span>
            </div>
            <div className="flex items-start justify-between gap-4 border-b border-border pb-3">
              <span className="text-muted">ที่อยู่ที่บันทึก</span>
              <span className="text-right text-ink">{insights.addressCount} รายการ</span>
            </div>
            <div className="flex items-start justify-between gap-4">
              <span className="text-muted">สินค้าที่ชอบ</span>
              <span className="text-right text-ink">{insights.favoriteCount} รายการ</span>
            </div>
          </CardBody>
        </Card>
      </div>

      <AdminCustomerOrderHistory orders={insights.recentOrders} />
    </div>
  );
}
