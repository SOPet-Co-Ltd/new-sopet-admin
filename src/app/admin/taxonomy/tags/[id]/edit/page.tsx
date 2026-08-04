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
import { useApprovedTags, useDeleteTag, useUpdateTag } from '@/hooks/useTaxonomy';
import { isApiError } from '@/lib/api/errors';
import { labelTaxonomyStatus } from '@/lib/i18n/th';
import { editTaxonomySchema, type EditTaxonomyFormValues } from '@/lib/validations';

export default function EditTagPage() {
  const params = useParams<{ id: string }>();
  const tagId = params.id;
  const router = useRouter();
  const { data: tags = [], isLoading, error } = useApprovedTags();
  const tag = tags.find((item) => item.id === tagId);
  const updateTag = useUpdateTag();
  const deleteTag = useDeleteTag();

  const form = useForm<EditTaxonomyFormValues>({
    resolver: zodResolver(editTaxonomySchema),
    defaultValues: { name: '', slug: '' },
  });

  useEffect(() => {
    if (tag) {
      form.reset({ name: tag.name, slug: tag.slug });
    }
  }, [tag, form]);

  const isPending = updateTag.isPending || deleteTag.isPending;

  async function onSubmit(values: EditTaxonomyFormValues) {
    if (!tag) return;
    const name = values.name.trim();
    const slug = values.slug.trim();
    const nameChanged = name !== tag.name;
    const slugChanged = slug !== tag.slug;
    if (!nameChanged && !slugChanged) {
      router.push('/admin/taxonomy');
      return;
    }
    try {
      await updateTag.mutateAsync({ tagId: tag.id, name, slug });
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

  if (error || !tag) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-danger">
          {error instanceof Error ? error.message : 'ไม่พบแท็ก'}
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
        title="แก้ไขแท็ก"
        description={labelTaxonomyStatus(tag.status)}
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
              <Label htmlFor="tag-name" required>
                ชื่อแท็ก
              </Label>
              <Input
                id="tag-name"
                placeholder="เช่น ออร์แกนิก"
                aria-invalid={!!form.formState.errors.name}
                aria-describedby={form.formState.errors.name ? 'tag-name-error' : undefined}
                {...form.register('name')}
                className="mt-1.5"
                disabled={isPending}
              />
              {form.formState.errors.name ? (
                <p id="tag-name-error" role="alert" className="mt-1 text-xs text-danger">
                  {form.formState.errors.name.message}
                </p>
              ) : null}
            </div>

            <div>
              <Label htmlFor="tag-slug" required>
                Slug
              </Label>
              <Input
                id="tag-slug"
                autoComplete="off"
                placeholder="เช่น organic"
                aria-invalid={!!form.formState.errors.slug}
                aria-describedby={form.formState.errors.slug ? 'tag-slug-error' : 'tag-slug-hint'}
                {...form.register('slug')}
                className="mt-1.5"
                disabled={isPending}
              />
              {form.formState.errors.slug ? (
                <p id="tag-slug-error" role="alert" className="mt-1 text-xs text-danger">
                  {form.formState.errors.slug.message}
                </p>
              ) : (
                <p id="tag-slug-hint" className="mt-1 text-xs text-muted">
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
                  {updateTag.isPending ? 'กำลังบันทึก...' : 'บันทึก'}
                </Button>
              </div>
              <ConfirmDeleteButton
                confirmLabel={tag.name}
                title="ลบแท็ก"
                variant="destructive"
                size="default"
                disabled={isPending}
                isDeleting={deleteTag.isPending}
                onConfirm={async () => {
                  await deleteTag.mutateAsync(tag.id);
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
