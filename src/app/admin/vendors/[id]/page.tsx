'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { HiArrowLeft } from 'react-icons/hi2';
import { Button } from '@/components/ui/button';
import { Card, CardBody, PageHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAdminVendor, useUpdateVendorAsAdmin } from '@/hooks/useAdminVendors';
import { ADMIN_TRIGGER_VENDOR_PASSWORD_RESET } from '@/lib/graphql/documents';
import { executeMutation } from '@/lib/graphql/client';
import { adminVendorFormSchema, type AdminVendorFormValues } from '@/lib/validations';

export default function AdminVendorEditPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { data: vendor, isLoading, error } = useAdminVendor(params.id);
  const updateMutation = useUpdateVendorAsAdmin();
  const [resetMessage, setResetMessage] = useState<string | null>(null);

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

  if (isLoading) return <p className="text-muted">กำลังโหลด...</p>;
  if (error || !vendor) {
    return (
      <p className="text-danger" role="alert">
        {error instanceof Error ? error.message : 'ไม่พบผู้ขาย'}
      </p>
    );
  }

  return (
    <div>
      <PageHeader
        title={`แก้ไขผู้ขาย: ${vendor.fullName}`}
        back={
          <Link
            href="/admin/vendors"
            className="inline-flex items-center gap-1 text-sm text-muted hover:text-brand"
          >
            <HiArrowLeft className="size-3.5" aria-hidden="true" />
            กลับรายการผู้ขาย
          </Link>
        }
      />

      <Card>
        <CardBody>
          <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-md space-y-4" noValidate>
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
            <div className="flex flex-wrap gap-3">
              <Button
                type="submit"
                disabled={updateMutation.isPending}
                aria-busy={updateMutation.isPending}
              >
                {updateMutation.isPending ? 'กำลังบันทึก...' : 'บันทึก'}
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link href="/admin/vendors">ยกเลิก</Link>
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={passwordResetMutation.isPending}
                aria-busy={passwordResetMutation.isPending}
                aria-label={`ส่งอีเมลรีเซ็ตรหัสผ่านให้ ${vendor.email}`}
                onClick={() => void handlePasswordReset()}
              >
                {passwordResetMutation.isPending ? 'กำลังส่ง...' : 'ส่งอีเมลรีเซ็ตรหัสผ่าน'}
              </Button>
            </div>
            {resetMessage ? (
              <p className="text-sm text-muted" role="status">
                {resetMessage}
              </p>
            ) : null}
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
