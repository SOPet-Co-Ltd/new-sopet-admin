'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { HiArrowLeft } from 'react-icons/hi2';
import { Button } from '@/components/ui/button';
import { Card, CardBody, PageHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { VendorCombobox } from '@/components/admin/vendor-combobox';
import { useCreateStoreAsAdmin } from '@/hooks/useAdminStores';
import { buildCreateStoreAsAdminInput } from '@/lib/api/admin-stores';
import { adminStoreFormSchema, type AdminStoreFormValues } from '@/lib/validations';

export default function AdminStoreNewPage() {
  const router = useRouter();
  const createMutation = useCreateStoreAsAdmin();

  const form = useForm<AdminStoreFormValues>({
    resolver: zodResolver(adminStoreFormSchema),
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      contactPhone: '',
      contactEmail: '',
      address: '',
      ownerId: '',
      ownerEmail: '',
    },
  });

  async function onSubmit(values: AdminStoreFormValues) {
    try {
      const store = await createMutation.mutateAsync(buildCreateStoreAsAdminInput(values));
      router.push(`/admin/stores/${store.id}`);
    } catch {
      // surfaced via mutation state
    }
  }

  return (
    <div>
      <PageHeader
        title="สร้างร้านค้า"
        description="สร้างร้านค้าใหม่และกำหนดเจ้าของ"
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
              <Label htmlFor="slug">Slug (ไม่บังคับ)</Label>
              <Input id="slug" autoComplete="off" {...form.register('slug')} className="mt-1.5" />
              <p className="mt-1 text-xs text-muted">
                เว้นว่างเพื่อให้ระบบสร้าง slug อัตโนมัติ (ชื่อไทยล้วนจะได้ slug สั้นแบบสุ่ม)
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
              <Label htmlFor="ownerId" required>
                เจ้าของร้านค้า
              </Label>
              <Controller
                name="ownerId"
                control={form.control}
                render={({ field, fieldState }) => (
                  <VendorCombobox
                    value={field.value ?? ''}
                    onChange={field.onChange}
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
            <div className="sm:col-span-2 flex gap-3">
              <Button
                type="submit"
                disabled={createMutation.isPending}
                aria-busy={createMutation.isPending}
              >
                {createMutation.isPending ? 'กำลังสร้าง...' : 'สร้างร้านค้า'}
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link href="/admin/stores">ยกเลิก</Link>
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
