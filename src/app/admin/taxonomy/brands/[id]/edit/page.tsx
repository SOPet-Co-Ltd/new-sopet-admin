'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { HiArrowLeft } from 'react-icons/hi2';
import { useForm } from 'react-hook-form';
import { ConfirmDeleteButton } from '@/components/ui/confirm-delete-button';
import { Button } from '@/components/ui/button';
import { Card, CardBody, PageHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useApprovedBrands, useDeleteBrand, useUpdateBrand } from '@/hooks/useTaxonomy';
import { isApiError } from '@/lib/api/errors';
import { labelTaxonomyStatus } from '@/lib/i18n/th';
import { editTaxonomySchema, type EditTaxonomyFormValues } from '@/lib/validations';

export default function EditBrandPage() {
  const params = useParams<{ id: string }>();
  const brandId = params.id;
  const router = useRouter();
  const { data: brands = [], isLoading, error } = useApprovedBrands();
  const brand = brands.find((item) => item.id === brandId);
  const updateBrand = useUpdateBrand();
  const deleteBrand = useDeleteBrand();

  const form = useForm<EditTaxonomyFormValues>({
    resolver: zodResolver(editTaxonomySchema),
    defaultValues: { name: '', slug: '' },
  });

  useEffect(() => {
    if (brand) {
      form.reset({ name: brand.name, slug: brand.slug });
    }
  }, [brand, form]);

  const isPending = updateBrand.isPending || deleteBrand.isPending;

  async function onSubmit(values: EditTaxonomyFormValues) {
    if (!brand) return;
    const name = values.name.trim();
    const slug = values.slug.trim();
    const nameChanged = name !== brand.name;
    const slugChanged = slug !== brand.slug;
    if (!nameChanged && !slugChanged) {
      router.push('/admin/taxonomy');
      return;
    }
    try {
      await updateBrand.mutateAsync({ brandId: brand.id, name, slug });
      router.push('/admin/taxonomy');
    } catch (err) {
      const message = isApiError(err) ? err.message : 'บันทึกไม่สำเร็จ';
      const code = isApiError(err) ? err.code : undefined;
      if (code === 'SLUG_EXISTS' || code === 'INVALID_SLUG') {
        form.setError('slug', { message });
      } else {
        form.setError('name', { message });
      }
    }
  }

  if (isLoading) {
    return <p className="text-muted">กำลังโหลด...</p>;
  }

  if (error || !brand) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-danger">
          {error instanceof Error ? error.message : 'ไม่พบแบรนด์'}
        </p>
        <Button variant="outline" asChild>
          <Link href="/admin/taxonomy">กลับ</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        title="แก้ไขแบรนด์"
        description={labelTaxonomyStatus(brand.status)}
        back={
          <Link
            href="/admin/taxonomy"
            className="inline-flex items-center gap-1 text-sm text-muted transition-colors hover:text-brand"
          >
            <HiArrowLeft className="size-4" aria-hidden="true" />
            กลับ
          </Link>
        }
      />

      <Card>
        <CardBody>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <Label htmlFor="brand-name" required>
                ชื่อแบรนด์
              </Label>
              <Input
                id="brand-name"
                placeholder="เช่น Royal Canin"
                aria-invalid={!!form.formState.errors.name}
                aria-describedby={form.formState.errors.name ? 'brand-name-error' : undefined}
                {...form.register('name')}
                className="mt-1.5"
                disabled={isPending}
              />
              {form.formState.errors.name ? (
                <p id="brand-name-error" role="alert" className="mt-1 text-xs text-danger">
                  {form.formState.errors.name.message}
                </p>
              ) : null}
            </div>

            <div>
              <Label htmlFor="brand-slug" required>
                Slug
              </Label>
              <Input
                id="brand-slug"
                autoComplete="off"
                placeholder="เช่น royal-canin"
                aria-invalid={!!form.formState.errors.slug}
                aria-describedby={
                  form.formState.errors.slug ? 'brand-slug-error' : 'brand-slug-hint'
                }
                {...form.register('slug')}
                className="mt-1.5"
                disabled={isPending}
              />
              {form.formState.errors.slug ? (
                <p id="brand-slug-error" role="alert" className="mt-1 text-xs text-danger">
                  {form.formState.errors.slug.message}
                </p>
              ) : (
                <p id="brand-slug-hint" className="mt-1 text-xs text-muted">
                  ใช้ใน URL และตัวกรอง — เปลี่ยนแล้วลิงก์เดิมอาจใช้ไม่ได้
                </p>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
              <div className="flex gap-3">
                <Button type="button" variant="outline" asChild disabled={isPending}>
                  <Link href="/admin/taxonomy">ยกเลิก</Link>
                </Button>
                <Button type="submit" disabled={isPending} aria-busy={isPending}>
                  {updateBrand.isPending ? 'กำลังบันทึก...' : 'บันทึก'}
                </Button>
              </div>
              <ConfirmDeleteButton
                confirmLabel={brand.name}
                title="ลบแบรนด์"
                variant="destructive"
                size="default"
                disabled={isPending}
                isDeleting={deleteBrand.isPending}
                onConfirm={async () => {
                  await deleteBrand.mutateAsync({ id: brand.id });
                  router.push('/admin/taxonomy');
                }}
              />
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
