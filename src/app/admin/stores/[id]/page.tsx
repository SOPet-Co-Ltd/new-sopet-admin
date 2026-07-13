'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { HiArrowLeft } from 'react-icons/hi2';
import { Button } from '@/components/ui/button';
import { Card, CardBody, PageHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { VendorCombobox } from '@/components/admin/vendor-combobox';
import { AdminStorePayoutPanel } from '@/components/admin/admin-store-payout-panel';
import { useAdminStore, useUpdateStoreAsAdmin } from '@/hooks/useAdminStores';
import { useAdminVendor } from '@/hooks/useAdminVendors';
import { buildUpdateStoreAsAdminInput } from '@/lib/api/admin-stores';
import { adminStoreFormSchema, type AdminStoreFormValues } from '@/lib/validations';

export default function AdminStoreEditPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { data: store, isLoading, error } = useAdminStore(params.id);
  const updateMutation = useUpdateStoreAsAdmin();

  const form = useForm<AdminStoreFormValues>({
    resolver: zodResolver(adminStoreFormSchema),
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      status: 'approved',
      contactPhone: '',
      contactEmail: '',
      address: '',
      ownerId: '',
      ownerEmail: '',
    },
  });

  const ownerId = form.watch('ownerId') ?? '';
  const { data: ownerVendor } = useAdminVendor(ownerId);

  useEffect(() => {
    if (!store) return;
    form.reset(
      {
        name: store.name,
        slug: store.slug,
        description: store.description ?? '',
        status: store.status as AdminStoreFormValues['status'],
        contactPhone: store.contactPhone ?? '',
        contactEmail: store.contactEmail ?? '',
        address: store.address ?? '',
        ownerId: store.ownerId ?? '',
        ownerEmail: store.ownerEmail ?? '',
      },
      { keepDirtyValues: true },
    );
  }, [store, form]);

  async function onSubmit(values: AdminStoreFormValues) {
    try {
      await updateMutation.mutateAsync({
        id: params.id,
        input: buildUpdateStoreAsAdminInput(values),
      });
      router.push('/admin/stores');
    } catch {
      // surfaced via mutation state
    }
  }

  if (isLoading) return <p className="text-muted">กำลังโหลด...</p>;
  if (error || !store) {
    return <p className="text-danger">{error instanceof Error ? error.message : 'ไม่พบร้านค้า'}</p>;
  }

  return (
    <div>
      <PageHeader
        title={`แก้ไขร้าน: ${store.name}`}
        back={
          <Link
            href="/admin/stores"
            className="inline-flex items-center gap-1 text-sm text-muted hover:text-brand"
          >
            <HiArrowLeft className="size-3.5" aria-hidden="true" />
            กลับรายการร้านค้า
          </Link>
        }
      />

      <Card>
        <CardBody>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="name" required>
                ชื่อร้านค้า
              </Label>
              <Input
                id="name"
                placeholder="ชื่อร้านค้า"
                autoComplete="off"
                aria-invalid={!!form.formState.errors.name}
                aria-describedby={form.formState.errors.name ? 'name-error' : undefined}
                {...form.register('name')}
                className="mt-1.5"
              />
              {form.formState.errors.name ? (
                <p id="name-error" className="mt-1 text-xs text-danger" role="alert">
                  {form.formState.errors.name.message}
                </p>
              ) : null}
            </div>
            <div>
              <Label htmlFor="slug">Slug</Label>
              <Input id="slug" autoComplete="off" {...form.register('slug')} className="mt-1.5" />
              <p className="mt-1 text-xs text-muted">
                slug ที่ระบบสร้างอัตโนมัติจะแสดงหลังบันทึก (ชื่อไทยล้วนได้ slug สั้นแบบสุ่ม)
              </p>
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="description">รายละเอียด</Label>
              <Textarea
                id="description"
                autoComplete="off"
                {...form.register('description')}
                className="mt-1.5"
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="status">สถานะ</Label>
              <Select
                value={form.watch('status')}
                onValueChange={(v) => form.setValue('status', v as AdminStoreFormValues['status'])}
              >
                <SelectTrigger id="status" className="mt-1.5">
                  <SelectValue placeholder="เลือกสถานะ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">รออนุมัติ</SelectItem>
                  <SelectItem value="approved">อนุมัติแล้ว</SelectItem>
                  <SelectItem value="rejected">ปฏิเสธ</SelectItem>
                  <SelectItem value="suspended">ระงับ</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="ownerId" required>
                เจ้าของร้านค้า
              </Label>
              <Controller
                name="ownerId"
                control={form.control}
                render={({ field, fieldState }) => (
                  <VendorCombobox
                    value={field.value ?? ''}
                    onChange={(id) => field.onChange(id)}
                    initialLabel={
                      ownerId && ownerVendor?.id === ownerId
                        ? `${ownerVendor.fullName} — ${ownerVendor.email}`
                        : undefined
                    }
                    fieldError={fieldState.error?.message}
                    aria-invalid={!!fieldState.error}
                    aria-describedby={fieldState.error ? 'ownerId-error' : undefined}
                  />
                )}
              />
            </div>
            <div>
              <Label htmlFor="ownerEmail">อีเมลเจ้าของ</Label>
              <Input
                id="ownerEmail"
                type="email"
                placeholder="email@example.com"
                autoComplete="email"
                aria-invalid={!!form.formState.errors.ownerEmail}
                aria-describedby={form.formState.errors.ownerEmail ? 'ownerEmail-error' : undefined}
                {...form.register('ownerEmail')}
                className="mt-1.5"
              />
              {form.formState.errors.ownerEmail ? (
                <p id="ownerEmail-error" className="mt-1 text-xs text-danger" role="alert">
                  {form.formState.errors.ownerEmail.message}
                </p>
              ) : null}
            </div>
            <div>
              <Label htmlFor="contactPhone">เบอร์โทร</Label>
              <Input
                id="contactPhone"
                type="tel"
                placeholder="0812345678"
                autoComplete="tel"
                {...form.register('contactPhone')}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="contactEmail">อีเมลติดต่อ</Label>
              <Input
                id="contactEmail"
                type="email"
                placeholder="email@example.com"
                autoComplete="email"
                aria-invalid={!!form.formState.errors.contactEmail}
                aria-describedby={
                  form.formState.errors.contactEmail ? 'contactEmail-error' : undefined
                }
                {...form.register('contactEmail')}
                className="mt-1.5"
              />
              {form.formState.errors.contactEmail ? (
                <p id="contactEmail-error" className="mt-1 text-xs text-danger" role="alert">
                  {form.formState.errors.contactEmail.message}
                </p>
              ) : null}
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="address">ที่อยู่</Label>
              <Textarea
                id="address"
                autoComplete="off"
                {...form.register('address')}
                className="mt-1.5"
                rows={2}
              />
            </div>
            {updateMutation.isError ? (
              <p className="sm:col-span-2 text-sm text-danger" role="alert">
                {updateMutation.error instanceof Error
                  ? updateMutation.error.message
                  : 'บันทึกไม่สำเร็จ'}
              </p>
            ) : null}
            <div className="sm:col-span-2 flex gap-3">
              <Button
                type="submit"
                disabled={updateMutation.isPending}
                aria-busy={updateMutation.isPending}
              >
                {updateMutation.isPending ? 'กำลังบันทึก...' : 'บันทึก'}
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link href="/admin/stores">ยกเลิก</Link>
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>

      <AdminStorePayoutPanel storeId={params.id} />
    </div>
  );
}
