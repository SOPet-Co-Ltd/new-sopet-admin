'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { HiArrowLeft } from 'react-icons/hi2';
import { Controller, useForm } from 'react-hook-form';
import { ProductPublishChecklistPanel } from '@/components/vendor/product-publish-checklist';
import { CategoryField, TagsField } from '@/components/vendor/taxonomy-fields';
import { ProductImagesManager } from '@/components/vendor/product-images-manager';
import { Button } from '@/components/ui/button';
import { Card, CardBody, CardHeader, PageHeader } from '@/components/ui/card';
import { DateTimePicker } from '@/components/ui/date-time-picker';
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
import { useProduct } from '@/hooks/useProduct';
import { useDeleteProduct, usePublishProduct, useUpdateProduct } from '@/hooks/useProductMutations';
import { useProductPublishChecklist } from '@/hooks/useProductPublishChecklist';
import { labelProductStatus } from '@/lib/i18n/th';
import { productFormSchema, type ProductFormValues } from '@/lib/validations';
import type { ProductStatus } from '@/types';

function toDateInputValue(value?: string | null): string {
  if (!value) return '';
  return value.slice(0, 10);
}

function statusOptionsFor(current: ProductStatus): ProductStatus[] {
  if (current === 'published') {
    return ['published', 'draft', 'archived'];
  }
  if (current === 'archived') {
    return ['archived', 'draft'];
  }
  return ['draft', 'archived'];
}

export default function EditProductPage() {
  const params = useParams<{ id: string }>();
  const productId = params.id;
  const router = useRouter();
  const { data: product, isLoading, error } = useProduct(productId);
  const { data: checklist, isLoading: checklistLoading } = useProductPublishChecklist(productId);
  const updateMutation = useUpdateProduct();
  const publishMutation = usePublishProduct();
  const deleteMutation = useDeleteProduct();

  const hasVariants = (product?.variants?.length ?? 0) > 0;

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: '',
      description: '',
      basePrice: 0,
      warning: '',
      expiryDate: '',
      categoryId: '',
      tagIds: [],
      status: 'draft',
      newImageUrl: '',
    },
  });

  useEffect(() => {
    if (!product) return;
    form.reset({
      name: product.name,
      description: product.description ?? '',
      basePrice: product.basePrice,
      warning: product.warning ?? '',
      expiryDate: toDateInputValue(product.expiryDate),
      categoryId: product.categoryId ?? '',
      tagIds: product.tagIds ?? [],
      status: (product.status as ProductFormValues['status']) ?? 'draft',
      newImageUrl: '',
    });
  }, [form, product]);

  async function onSubmit(values: ProductFormValues) {
    if (!product) return;
    const nextStatus = values.status;
    const status =
      !nextStatus || nextStatus === product.status
        ? undefined
        : nextStatus === 'published'
          ? undefined
          : nextStatus;
    try {
      await updateMutation.mutateAsync({
        id: product.id,
        input: {
          name: values.name,
          description: values.description || undefined,
          basePrice: values.basePrice ?? 0,
          warning: values.warning || undefined,
          expiryDate: values.expiryDate || undefined,
          categoryId: values.categoryId || undefined,
          tagIds: values.tagIds?.length ? values.tagIds : undefined,
          status,
        },
      });
      router.push('/vendor/products');
    } catch {
      // surfaced via mutation state
    }
  }

  async function handlePublish() {
    if (!product) return;
    try {
      await publishMutation.mutateAsync(product.id);
      form.setValue('status', 'published');
    } catch {
      // surfaced via mutation state
    }
  }

  async function handleDelete() {
    if (!product) return;
    if (!window.confirm(`ลบ "${product.name}" ใช่หรือไม่?`)) return;
    try {
      await deleteMutation.mutateAsync(product.id);
      router.push('/vendor/products');
    } catch {
      // surfaced via mutation state
    }
  }

  if (isLoading) {
    return <p className="text-muted">กำลังโหลดสินค้า...</p>;
  }

  if (error || !product) {
    return (
      <p className="text-sm text-danger">
        {error instanceof Error ? error.message : 'ไม่พบสินค้า'}
      </p>
    );
  }

  const isPending =
    updateMutation.isPending || publishMutation.isPending || deleteMutation.isPending;
  const currentStatus = (product.status as ProductStatus) ?? 'draft';
  const selectableStatuses = statusOptionsFor(currentStatus);
  const canPublish =
    currentStatus === 'draft' && checklist?.canPublish && !publishMutation.isPending;

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        title="แก้ไขสินค้า"
        description="แก้ไขข้อมูลสินค้าและรูปภาพ · จัดการตัวเลือกได้ที่หน้ารายการตัวเลือก"
        back={
          <Link
            href="/vendor/products"
            className="inline-flex items-center gap-1 text-sm text-muted transition-colors hover:text-brand"
          >
            <HiArrowLeft className="size-3.5" aria-hidden="true" />
            กลับไปรายการสินค้า
          </Link>
        }
      />

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" noValidate>
        <ProductPublishChecklistPanel
          status={currentStatus}
          checklist={checklist}
          isLoading={checklistLoading}
        />

        <Card>
          <CardHeader>
            <h2 className="font-display font-medium text-ink">ข้อมูลสินค้า</h2>
          </CardHeader>
          <CardBody className="space-y-4">
            <div>
              <Label htmlFor="name" required>
                ชื่อสินค้า
              </Label>
              <Input
                id="name"
                placeholder="อาหารสุนัขออร์แกนิก 5 กก."
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
              <Label htmlFor="description">รายละเอียด</Label>
              <Textarea
                id="description"
                placeholder="อธิบายสินค้า..."
                {...form.register('description')}
                className="mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor="warning">คำเตือน</Label>
              <Textarea
                id="warning"
                placeholder="ข้อความเตือนสำหรับลูกค้า (ถ้ามี)"
                {...form.register('warning')}
                className="mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor="expiryDate">วันหมดอายุ</Label>
              <Controller
                name="expiryDate"
                control={form.control}
                render={({ field }) => (
                  <DateTimePicker
                    id="expiryDate"
                    mode="date"
                    value={field.value ?? ''}
                    onChange={field.onChange}
                    placeholder="เลือกวันหมดอายุ"
                    className="mt-1.5"
                  />
                )}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <CategoryField
                value={form.watch('categoryId')}
                onChange={(categoryId) => {
                  // Radix Select can emit a spurious empty value while its items
                  // register after the form is hydrated; ignore it so the loaded
                  // value is not wiped (there is no "no category" option).
                  if (!categoryId) return;
                  form.setValue('categoryId', categoryId);
                }}
              />
              {!hasVariants ? (
                <div>
                  <Label htmlFor="basePrice">ราคาฐาน</Label>
                  <Input
                    id="basePrice"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    aria-invalid={!!form.formState.errors.basePrice}
                    aria-describedby={
                      form.formState.errors.basePrice ? 'basePrice-error' : undefined
                    }
                    {...form.register('basePrice', {
                      setValueAs: (value: unknown) => {
                        if (value === '' || value === null || value === undefined) return undefined;
                        const parsed = Number(value);
                        return Number.isNaN(parsed) ? undefined : parsed;
                      },
                    })}
                    className="mt-1.5"
                  />
                  {form.formState.errors.basePrice ? (
                    <p id="basePrice-error" className="mt-1 text-xs text-danger" role="alert">
                      {form.formState.errors.basePrice.message}
                    </p>
                  ) : null}
                </div>
              ) : null}
            </div>

            <TagsField
              value={form.watch('tagIds') ?? []}
              onChange={(tagIds) => form.setValue('tagIds', tagIds)}
            />

            <div>
              <Label htmlFor="status">สถานะ</Label>
              <Select
                value={form.watch('status') ?? 'draft'}
                onValueChange={(value) => {
                  // Ignore the spurious empty callback Radix Select can emit while
                  // its items register after hydration, which would otherwise wipe
                  // the loaded status and fail enum validation on save.
                  if (!value) return;
                  form.setValue('status', value as ProductFormValues['status']);
                }}
              >
                <SelectTrigger id="status" className="mt-1.5">
                  <SelectValue placeholder="เลือกสถานะ" />
                </SelectTrigger>
                <SelectContent>
                  {selectableStatuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {labelProductStatus(status)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {currentStatus === 'draft' ? (
                <div className="mt-3">
                  <Button
                    type="button"
                    onClick={handlePublish}
                    disabled={!canPublish}
                    aria-busy={publishMutation.isPending}
                  >
                    {publishMutation.isPending ? 'กำลังเผยแพร่...' : 'เผยแพร่'}
                  </Button>
                  {!checklist?.canPublish && !checklistLoading ? (
                    <p className="mt-2 text-xs text-muted">
                      เติมรายการตรวจสอบด้านบนให้ครบก่อนเผยแพร่
                    </p>
                  ) : null}
                </div>
              ) : null}
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-display font-medium text-ink">รูปภาพสินค้า</h2>
              <Button variant="outline" size="sm" asChild>
                <Link href={`/vendor/products/${product.id}/variants`}>จัดการตัวเลือก</Link>
              </Button>
            </div>
          </CardHeader>
          <CardBody>
            <ProductImagesManager product={product} />
          </CardBody>
        </Card>

        {updateMutation.error || publishMutation.error || deleteMutation.error ? (
          <p className="text-sm text-danger" role="alert">
            {deleteMutation.error instanceof Error
              ? deleteMutation.error.message
              : (updateMutation.error ?? publishMutation.error) instanceof Error
                ? (updateMutation.error ?? publishMutation.error)?.message
                : 'ดำเนินการไม่สำเร็จ'}
          </p>
        ) : null}

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-3">
            <Button type="button" variant="outline" asChild>
              <Link href="/vendor/products">ยกเลิก</Link>
            </Button>
            <Button type="submit" disabled={isPending} aria-busy={isPending}>
              {updateMutation.isPending ? 'กำลังบันทึก...' : 'บันทึก'}
            </Button>
          </div>
          <Button
            type="button"
            variant="destructive"
            disabled={isPending}
            aria-busy={deleteMutation.isPending}
            onClick={handleDelete}
          >
            {deleteMutation.isPending ? 'กำลังลบ...' : 'ลบสินค้า'}
          </Button>
        </div>
      </form>
    </div>
  );
}
