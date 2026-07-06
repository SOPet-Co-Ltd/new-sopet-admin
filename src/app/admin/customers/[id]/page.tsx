'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { HiArrowLeft } from 'react-icons/hi2';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardBody, PageHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  useAdminCustomer,
  useSetCustomerActive,
  useUpdateCustomerAsAdmin,
} from '@/hooks/useAdminCustomers';
import { adminCustomerFormSchema, type AdminCustomerFormValues } from '@/lib/validations';

export default function AdminCustomerEditPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { data: customer, isLoading, error } = useAdminCustomer(params.id);
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

  const mutationPending = updateMutation.isPending || setActiveMutation.isPending;

  return (
    <div>
      <PageHeader
        title={`แก้ไขลูกค้า: ${customer.fullName || customer.phone}`}
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

      <div className="mb-4 flex items-center gap-2">
        <Badge status={customer.isActive ? 'published' : 'draft'}>
          {customer.isActive ? 'ใช้งานอยู่' : 'ระงับ'}
        </Badge>
        {customer.isVerified ? (
          <Badge status="published">ยืนยันแล้ว</Badge>
        ) : (
          <Badge status="draft">ยังไม่ยืนยัน</Badge>
        )}
      </div>

      <Card className="mb-6">
        <CardBody>
          <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-md space-y-4" noValidate>
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
              <Input
                id="customer-dob"
                type="date"
                {...form.register('dateOfBirth')}
                className="mt-1.5"
              />
            </div>
            <div className="flex flex-wrap gap-3">
              <Button type="submit" disabled={mutationPending} aria-busy={updateMutation.isPending}>
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
        <CardBody className="text-sm text-muted">
          <p>สมัครเมื่อ: {new Date(customer.createdAt ?? '').toLocaleString('th-TH')}</p>
          {customer.lastLoginAt ? (
            <p>เข้าสู่ระบบล่าสุด: {new Date(customer.lastLoginAt).toLocaleString('th-TH')}</p>
          ) : null}
        </CardBody>
      </Card>
    </div>
  );
}
