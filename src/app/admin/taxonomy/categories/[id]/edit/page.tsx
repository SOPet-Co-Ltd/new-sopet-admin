'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { HiArrowLeft } from 'react-icons/hi2';
import { useForm } from 'react-hook-form';
import { ConfirmDeleteButton } from '@/components/ui/confirm-delete-button';
import { Button } from '@/components/ui/button';
import { Card, CardBody, PageHeader } from '@/components/ui/card';
import { ImageUploadField } from '@/components/ui/image-upload-field';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  useApprovedCategories,
  useDeleteCategory,
  useSetCategoryImage,
  useUpdateCategory,
} from '@/hooks/useTaxonomy';
import { isApiError } from '@/lib/api/errors';
import { labelTaxonomyStatus } from '@/lib/i18n/th';
import { editTaxonomySchema, type EditTaxonomyFormValues } from '@/lib/validations';

export default function EditCategoryPage() {
  const params = useParams<{ id: string }>();
  const categoryId = params.id;
  const router = useRouter();
  const { data: categories = [], isLoading, error } = useApprovedCategories();
  const category = categories.find((item) => item.id === categoryId);
  const updateCategory = useUpdateCategory();
  const setCategoryImage = useSetCategoryImage();
  const deleteCategory = useDeleteCategory();
  const [uploadError, setUploadError] = useState<string | null>(null);

  const form = useForm<EditTaxonomyFormValues>({
    resolver: zodResolver(editTaxonomySchema),
    defaultValues: { name: '', slug: '' },
  });

  useEffect(() => {
    if (category) {
      form.reset({ name: category.name, slug: category.slug });
    }
  }, [category, form]);

  const isPending =
    updateCategory.isPending || setCategoryImage.isPending || deleteCategory.isPending;

  async function onSubmit(values: EditTaxonomyFormValues) {
    if (!category) return;
    const name = values.name.trim();
    const slug = values.slug.trim();
    const nameChanged = name !== category.name;
    const slugChanged = slug !== category.slug;
    if (!nameChanged && !slugChanged) {
      router.push('/admin/taxonomy');
      return;
    }
    try {
      await updateCategory.mutateAsync({
        categoryId: category.id,
        name,
        slug,
      });
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

  async function handleImageChange(url: string) {
    if (!category) return;
    setUploadError(null);
    try {
      await setCategoryImage.mutateAsync({ categoryId: category.id, imageUrl: url });
    } catch (err) {
      setUploadError(isApiError(err) ? err.message : 'อัปโหลดรูปภาพไม่สำเร็จ');
    }
  }

  if (isLoading) {
    return <p className="text-muted">กำลังโหลด...</p>;
  }

  if (error || !category) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-danger">
          {error instanceof Error ? error.message : 'ไม่พบหมวดหมู่'}
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
        title="แก้ไขหมวดหมู่"
        description={labelTaxonomyStatus(category.status)}
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
              <Label htmlFor="category-name" required>
                ชื่อหมวดหมู่
              </Label>
              <Input
                id="category-name"
                placeholder="เช่น อาหารสัตว์"
                aria-invalid={!!form.formState.errors.name}
                aria-describedby={form.formState.errors.name ? 'category-name-error' : undefined}
                {...form.register('name')}
                className="mt-1.5"
                disabled={isPending}
              />
              {form.formState.errors.name ? (
                <p id="category-name-error" role="alert" className="mt-1 text-xs text-danger">
                  {form.formState.errors.name.message}
                </p>
              ) : null}
            </div>

            <div>
              <Label htmlFor="category-slug" required>
                Slug
              </Label>
              <Input
                id="category-slug"
                autoComplete="off"
                placeholder="เช่น pet-food"
                aria-invalid={!!form.formState.errors.slug}
                aria-describedby={
                  form.formState.errors.slug ? 'category-slug-error' : 'category-slug-hint'
                }
                {...form.register('slug')}
                className="mt-1.5"
                disabled={isPending}
              />
              {form.formState.errors.slug ? (
                <p id="category-slug-error" role="alert" className="mt-1 text-xs text-danger">
                  {form.formState.errors.slug.message}
                </p>
              ) : (
                <p id="category-slug-hint" className="mt-1 text-xs text-muted">
                  ใช้ใน URL และตัวกรอง — เปลี่ยนแล้วลิงก์เดิมอาจใช้ไม่ได้
                </p>
              )}
            </div>

            <ImageUploadField
              label="รูปภาพหมวดหมู่"
              value={category.imageUrl ?? ''}
              onChange={(url) => void handleImageChange(url)}
              folder="categories"
              showUrl={false}
              disabled={isPending}
              error={uploadError ?? undefined}
            />

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
              <div className="flex gap-3">
                <Button type="button" variant="outline" asChild disabled={isPending}>
                  <Link href="/admin/taxonomy">ยกเลิก</Link>
                </Button>
                <Button type="submit" disabled={isPending} aria-busy={isPending}>
                  {updateCategory.isPending ? 'กำลังบันทึก...' : 'บันทึก'}
                </Button>
              </div>
              <ConfirmDeleteButton
                confirmLabel={category.name}
                title="ลบหมวดหมู่"
                variant="destructive"
                size="default"
                disabled={isPending}
                isDeleting={deleteCategory.isPending}
                onConfirm={async () => {
                  await deleteCategory.mutateAsync({ id: category.id });
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
