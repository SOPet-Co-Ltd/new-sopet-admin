'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { AdminStorePayoutPanel } from '@/components/admin/admin-store-payout-panel';
import {
  BackToStoresLink,
  StoreDetailRow,
  StoreDetailSkeleton,
  StoreIdentityCard,
  StoreStatusBadge,
} from '@/components/admin/admin-store-detail-primitives';
import {
  AdminStoreStatusActions,
  AdminStoreStatusPanel,
} from '@/components/admin/admin-store-status-panel';
import { VendorCombobox } from '@/components/admin/vendor-combobox';
import { Button } from '@/components/ui/button';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useAdminStore, useUpdateStoreAsAdmin } from '@/hooks/useAdminStores';
import { useAdminVendor } from '@/hooks/useAdminVendors';
import { buildUpdateStoreAsAdminInput } from '@/lib/api/admin-stores';
import { labelStoreStatus } from '@/lib/i18n/th';
import { formatDateTime } from '@/lib/utils';
import { adminStoreFormSchema, type AdminStoreFormValues } from '@/lib/validations';
import type { StoreStatus } from '@/types';

export default function AdminStoreEditPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { data: store, isLoading, error } = useAdminStore(params.id);
  const updateMutation = useUpdateStoreAsAdmin();
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

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
  const currentStatus = (form.watch('status') ?? store?.status ?? 'approved') as StoreStatus;
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

  async function handleStatusChange(newStatus: StoreStatus) {
    setStatusMessage(null);
    try {
      await updateMutation.mutateAsync({
        id: params.id,
        input: { status: newStatus },
      });
      form.setValue('status', newStatus);
      setStatusMessage(`เปลี่ยนสถานะเป็น "${labelStoreStatus(newStatus)}" แล้ว`);
    } catch (err) {
      setStatusMessage(err instanceof Error ? err.message : 'เปลี่ยนสถานะไม่สำเร็จ');
    }
  }

  if (isLoading) return <StoreDetailSkeleton />;

  if (error || !store) {
    return (
      <div className="space-y-4">
        <BackToStoresLink />
        <p className="text-sm text-danger" role="alert">
          {error instanceof Error ? error.message : 'ไม่พบร้านค้า'}
        </p>
      </div>
    );
  }

  const mutationPending = updateMutation.isPending;
  const ownerDisplay =
    store.ownerFullName && store.ownerEmail
      ? `${store.ownerFullName} · ${store.ownerEmail}`
      : (store.ownerFullName ?? store.ownerEmail);

  return (
    <div className="space-y-8">
      <BackToStoresLink />

      <StoreIdentityCard
        name={store.name}
        slug={store.slug}
        status={currentStatus}
        logoUrl={store.logoUrl}
        ownerFullName={store.ownerFullName}
        ownerEmail={store.ownerEmail}
      />

      <AdminStoreStatusPanel
        status={currentStatus}
        isPending={mutationPending}
        onStatusChange={handleStatusChange}
        statusMessage={statusMessage}
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
        <Card>
          <CardHeader>
            <h2 className="font-display text-lg font-semibold text-balance text-ink">
              ข้อมูลร้านค้า
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              แก้ไขชื่อ รายละเอียด และข้อมูลติดต่อของร้าน
            </p>
          </CardHeader>
          <CardBody>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
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
                <Input
                  id="slug"
                  autoComplete="off"
                  {...form.register('slug')}
                  className="mt-1.5 font-mono text-sm"
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  slug ที่ระบบสร้างอัตโนมัติจะแสดงหลังบันทึก (ชื่อไทยล้วนได้ slug สั้นแบบสุ่ม)
                </p>
              </div>

              <div>
                <Label htmlFor="description">รายละเอียด</Label>
                <Textarea
                  id="description"
                  autoComplete="off"
                  {...form.register('description')}
                  className="mt-1.5"
                  rows={3}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
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
              </div>

              <div>
                <Label htmlFor="address">ที่อยู่</Label>
                <Textarea
                  id="address"
                  autoComplete="off"
                  {...form.register('address')}
                  className="mt-1.5"
                  rows={2}
                />
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
                  aria-describedby={
                    form.formState.errors.ownerEmail ? 'ownerEmail-error' : undefined
                  }
                  {...form.register('ownerEmail')}
                  className="mt-1.5"
                />
                {form.formState.errors.ownerEmail ? (
                  <p id="ownerEmail-error" className="mt-1 text-xs text-danger" role="alert">
                    {form.formState.errors.ownerEmail.message}
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
                  {updateMutation.isPending ? 'กำลังบันทึก...' : 'บันทึกข้อมูลร้าน'}
                </Button>
                <Button type="button" variant="outline" asChild>
                  <Link href="/admin/stores">ยกเลิก</Link>
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <h2 className="font-display text-lg font-semibold text-balance text-ink">
                ข้อมูลระบบ
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">ข้อมูลที่บันทึกในแพลตฟอร์ม</p>
            </CardHeader>
            <CardBody className="space-y-3 text-sm">
              <StoreDetailRow label="สร้างเมื่อ">
                {store.createdAt ? formatDateTime(store.createdAt) : '—'}
              </StoreDetailRow>
              <StoreDetailRow label="Slug">
                <span className="font-mono text-xs">{store.slug}</span>
              </StoreDetailRow>
              <StoreDetailRow label="เจ้าของ">
                {store.ownerId ? (
                  <Link
                    href={`/admin/vendors/${store.ownerId}`}
                    className="text-brand transition-colors hover:text-brand-hover focus-visible:text-brand-hover motion-reduce:transition-none"
                  >
                    {ownerDisplay ?? store.ownerId}
                  </Link>
                ) : (
                  '—'
                )}
              </StoreDetailRow>
              <StoreDetailRow label="สถานะ">
                <StoreStatusBadge status={currentStatus} />
              </StoreDetailRow>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="font-display text-lg font-semibold text-balance text-ink">
                การดำเนินการสถานะ
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">เปลี่ยนสถานะร้านหรือระงับการขาย</p>
            </CardHeader>
            <CardBody className="space-y-4">
              <AdminStoreStatusActions
                status={currentStatus}
                isPending={mutationPending}
                onStatusChange={handleStatusChange}
              />

              <div>
                <Label htmlFor="status-manual">เปลี่ยนสถานะด้วยตนเอง</Label>
                <Select
                  value={currentStatus}
                  onValueChange={(v) => void handleStatusChange(v as StoreStatus)}
                >
                  <SelectTrigger id="status-manual" className="mt-1.5">
                    <SelectValue placeholder="เลือกสถานะ" />
                  </SelectTrigger>
                  <SelectContent>
                    {(['pending', 'approved', 'rejected', 'suspended'] as const).map((value) => (
                      <SelectItem key={value} value={value}>
                        {labelStoreStatus(value)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="mt-1 text-xs text-muted-foreground">
                  การเปลี่ยนสถานะมีผลทันที ไม่ต้องกดบันทึกข้อมูลร้าน
                </p>
              </div>

              {statusMessage ? (
                <p className="text-sm text-muted-foreground" role="status">
                  {statusMessage}
                </p>
              ) : null}
            </CardBody>
          </Card>
        </div>
      </div>

      <AdminStorePayoutPanel storeId={params.id} />
    </div>
  );
}
