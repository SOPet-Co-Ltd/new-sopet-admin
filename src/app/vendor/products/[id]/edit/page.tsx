'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { HiArrowLeft } from 'react-icons/hi2';
import { Controller, useForm } from 'react-hook-form';
import { ProductPublishPanel } from '@/components/vendor/product-publish-panel';
import { BrandField, PetTypeField } from '@/components/vendor/pet-type-brand-fields';
import { CategoryField, TagsField } from '@/components/vendor/taxonomy-fields';
import { ProductImagesManager } from '@/components/vendor/product-images-manager';
import { ConfirmDeleteButton } from '@/components/ui/confirm-delete-button';
import { Button } from '@/components/ui/button';
import { Card, CardBody, CardHeader, PageHeader } from '@/components/ui/card';
import { DateTimePicker } from '@/components/ui/date-time-picker';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ProductDescriptionEditor } from '@/components/vendor/product-description-editor';
import { Textarea } from '@/components/ui/textarea';
import { useProduct } from '@/hooks/useProduct';
import { useDeleteProduct, usePublishProduct, useUpdateProduct } from '@/hooks/useProductMutations';
import { buildLivePublishChecklist } from '@/lib/products/publish-checklist';
import { productFormSchema, type ProductFormValues } from '@/lib/validations';
import type { ProductStatus } from '@/types';

const TAXONOMY_DEBOUNCE_MS = 500;

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

function serializeTaxonomy(values: {
  categoryId?: string;
  petTypeId?: string;
  brandId?: string;
  tagIds?: string[];
}): string {
  return JSON.stringify({
    categoryId: values.categoryId ?? '',
    petTypeId: values.petTypeId ?? '',
    brandId: values.brandId ?? '',
    tagIds: values.tagIds ?? [],
  });
}

type TaxonomySaveState = 'idle' | 'saving' | 'saved' | 'error';

export default function EditProductPage() {
  const params = useParams<{ id: string }>();
  const productId = params.id;
  const router = useRouter();
  const { data: product, isLoading, error } = useProduct(productId);
  const updateBasicMutation = useUpdateProduct();
  const updateExtrasMutation = useUpdateProduct();
  const updateTaxonomyMutation = useUpdateProduct();
  const updateStatusMutation = useUpdateProduct();
  const publishMutation = usePublishProduct();
  const deleteMutation = useDeleteProduct();
  const saveTaxonomy = updateTaxonomyMutation.mutateAsync;

  const [taxonomySaveState, setTaxonomySaveState] = useState<TaxonomySaveState>('idle');
  const initializedProductIdRef = useRef<string | null>(null);
  const taxonomyBaselineRef = useRef<string | null>(null);
  const taxonomyAutosaveReadyRef = useRef(false);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: '',
      description: '',
      basePrice: 0,
      warning: '',
      expiryDate: '',
      categoryId: '',
      petTypeId: '',
      brandId: '',
      tagIds: [],
      status: 'draft',
      newImageUrl: '',
    },
  });

  useEffect(() => {
    if (!product) return;
    if (initializedProductIdRef.current === product.id) return;

    form.reset({
      name: product.name,
      description: product.description ?? '',
      basePrice: product.basePrice,
      warning: product.warning ?? '',
      expiryDate: toDateInputValue(product.expiryDate),
      categoryId: product.categoryId ?? '',
      petTypeId: product.petTypeId ?? '',
      brandId: product.brandId ?? '',
      tagIds: product.tagIds ?? [],
      status: (product.status as ProductFormValues['status']) ?? 'draft',
      newImageUrl: '',
    });
    initializedProductIdRef.current = product.id;
    taxonomyBaselineRef.current = serializeTaxonomy({
      categoryId: product.categoryId ?? '',
      petTypeId: product.petTypeId ?? '',
      brandId: product.brandId ?? '',
      tagIds: product.tagIds ?? [],
    });
    taxonomyAutosaveReadyRef.current = false;
    const readyTimer = window.setTimeout(() => {
      taxonomyAutosaveReadyRef.current = true;
    }, 0);
    return () => window.clearTimeout(readyTimer);
  }, [form, product]);

  const watchedName = form.watch('name');
  const watchedCategoryId = form.watch('categoryId');
  const watchedPetTypeId = form.watch('petTypeId');
  const watchedBrandId = form.watch('brandId');
  const watchedTagIds = form.watch('tagIds');
  const watchedStatus = form.watch('status');

  useEffect(() => {
    if (!product || !taxonomyAutosaveReadyRef.current) return;

    const snapshot = serializeTaxonomy({
      categoryId: watchedCategoryId,
      petTypeId: watchedPetTypeId,
      brandId: watchedBrandId,
      tagIds: watchedTagIds,
    });
    if (snapshot === taxonomyBaselineRef.current) return;

    const timer = window.setTimeout(() => {
      setTaxonomySaveState('saving');
      void (async () => {
        try {
          await saveTaxonomy({
            id: product.id,
            input: {
              categoryId: watchedCategoryId || undefined,
              petTypeId: watchedPetTypeId || undefined,
              brandId: watchedBrandId || undefined,
              tagIds: watchedTagIds ?? [],
            },
          });
          taxonomyBaselineRef.current = snapshot;
          setTaxonomySaveState('saved');
        } catch {
          setTaxonomySaveState('error');
        }
      })();
    }, TAXONOMY_DEBOUNCE_MS);

    return () => window.clearTimeout(timer);
  }, [product, watchedCategoryId, watchedPetTypeId, watchedBrandId, watchedTagIds, saveTaxonomy]);

  async function saveBasicInfo() {
    if (!product) return;
    const valid = await form.trigger(['name', 'description']);
    if (!valid) return;
    const values = form.getValues();
    try {
      await updateBasicMutation.mutateAsync({
        id: product.id,
        input: {
          name: values.name,
          description: values.description || undefined,
        },
      });
    } catch {
      // surfaced via mutation state
    }
  }

  async function saveExtras() {
    if (!product) return;
    const valid = await form.trigger(['warning', 'expiryDate']);
    if (!valid) return;
    const values = form.getValues();
    try {
      await updateExtrasMutation.mutateAsync({
        id: product.id,
        input: {
          warning: values.warning || undefined,
          expiryDate: values.expiryDate || undefined,
        },
      });
    } catch {
      // surfaced via mutation state
    }
  }

  async function handleStatusChange(status: ProductStatus) {
    form.setValue('status', status);
    if (!product || status === product.status || status === 'published') return;
    try {
      await updateStatusMutation.mutateAsync({
        id: product.id,
        input: { status },
      });
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

  const liveChecklist = useMemo(() => {
    if (!product) return null;
    return buildLivePublishChecklist(product, {
      name: watchedName,
      categoryId: watchedCategoryId,
      petTypeId: watchedPetTypeId,
    });
  }, [product, watchedName, watchedCategoryId, watchedPetTypeId]);

  if (isLoading) {
    return <p className="text-muted">กำลังโหลดสินค้า...</p>;
  }

  if (error || !product) {
    return (
      <p className="text-sm text-danger" role="alert">
        {error instanceof Error ? error.message : 'ไม่พบสินค้า'}
      </p>
    );
  }

  const anyPending =
    updateBasicMutation.isPending ||
    updateExtrasMutation.isPending ||
    updateTaxonomyMutation.isPending ||
    updateStatusMutation.isPending ||
    publishMutation.isPending ||
    deleteMutation.isPending;
  const productStatus = (product.status as ProductStatus) ?? 'draft';
  const formStatus = (watchedStatus as ProductStatus | undefined) ?? productStatus;
  const selectableStatuses = statusOptionsFor(productStatus);
  const canPublish =
    formStatus === 'draft' && !!liveChecklist?.canPublish && !publishMutation.isPending;
  const pageError = updateStatusMutation.error ?? publishMutation.error ?? deleteMutation.error;

  return (
    <div>
      <PageHeader
        title={product.name}
        description="แก้ไขข้อมูลสินค้าและรูปภาพ"
        back={
          <Link
            href={`/vendor/products/${productId}`}
            className="inline-flex items-center gap-1 text-sm text-muted transition-colors hover:text-brand"
          >
            <HiArrowLeft className="size-3.5" aria-hidden="true" />
            กลับไปรายละเอียดสินค้า
          </Link>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
        <div className="space-y-6 lg:order-1">
          <Card>
            <CardHeader>
              <h2 className="font-display font-medium text-ink">ข้อมูลพื้นฐาน</h2>
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

              <Controller
                name="description"
                control={form.control}
                render={({ field }) => (
                  <ProductDescriptionEditor
                    id="description"
                    value={field.value ?? ''}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    placeholder="อธิบายสินค้า..."
                    disabled={anyPending}
                  />
                )}
              />

              <div className="flex flex-wrap items-center justify-end gap-3 border-t border-border pt-4">
                {updateBasicMutation.error ? (
                  <p className="mr-auto text-xs text-danger" role="alert">
                    {updateBasicMutation.error instanceof Error
                      ? updateBasicMutation.error.message
                      : 'บันทึกไม่สำเร็จ'}
                  </p>
                ) : null}
                <Button
                  type="button"
                  onClick={() => void saveBasicInfo()}
                  disabled={updateBasicMutation.isPending}
                  aria-busy={updateBasicMutation.isPending}
                >
                  {updateBasicMutation.isPending ? 'กำลังบันทึก...' : 'บันทึกส่วนนี้'}
                </Button>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="font-display font-medium text-ink">รูปภาพสินค้า</h2>
              <p className="text-sm text-muted">
                รูปแรก (หรือรูปที่ตั้งเป็นหน้าปก) จะแสดงเป็นภาพหลัก
              </p>
            </CardHeader>
            <CardBody>
              <ProductImagesManager product={product} />
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="font-display font-medium text-ink">การจัดหมวดหมู่</h2>
                {taxonomySaveState === 'saving' ? (
                  <p className="text-xs text-muted" aria-live="polite">
                    กำลังบันทึก...
                  </p>
                ) : null}
                {taxonomySaveState === 'saved' ? (
                  <p className="text-xs text-success" aria-live="polite">
                    บันทึกแล้ว
                  </p>
                ) : null}
                {taxonomySaveState === 'error' ? (
                  <p className="text-xs text-danger" role="alert">
                    บันทึกหมวดหมู่ไม่สำเร็จ
                  </p>
                ) : null}
              </div>
            </CardHeader>
            <CardBody>
              <div className="grid gap-4 sm:grid-cols-2">
                <CategoryField
                  value={watchedCategoryId}
                  onChange={(categoryId) => {
                    // Radix Select can emit a spurious empty value while its items
                    // register after the form is hydrated; ignore it so the loaded
                    // value is not wiped (there is no "no category" option).
                    if (!categoryId) return;
                    form.setValue('categoryId', categoryId, { shouldDirty: true });
                  }}
                />
                <PetTypeField
                  value={watchedPetTypeId}
                  onChange={(petTypeId) => {
                    if (!petTypeId) return;
                    form.setValue('petTypeId', petTypeId, { shouldDirty: true });
                  }}
                />
                <BrandField
                  value={watchedBrandId}
                  onChange={(brandId) => {
                    if (!brandId) return;
                    form.setValue('brandId', brandId, { shouldDirty: true });
                  }}
                />
                <TagsField
                  value={watchedTagIds ?? []}
                  onChange={(tagIds) => form.setValue('tagIds', tagIds, { shouldDirty: true })}
                />
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="font-display font-medium text-ink">รายละเอียดเพิ่มเติม</h2>
            </CardHeader>
            <CardBody className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
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
              </div>

              <div className="flex flex-wrap items-center justify-end gap-3 border-t border-border pt-4">
                {updateExtrasMutation.error ? (
                  <p className="mr-auto text-xs text-danger" role="alert">
                    {updateExtrasMutation.error instanceof Error
                      ? updateExtrasMutation.error.message
                      : 'บันทึกไม่สำเร็จ'}
                  </p>
                ) : null}
                <Button
                  type="button"
                  onClick={() => void saveExtras()}
                  disabled={updateExtrasMutation.isPending}
                  aria-busy={updateExtrasMutation.isPending}
                >
                  {updateExtrasMutation.isPending ? 'กำลังบันทึก...' : 'บันทึกส่วนนี้'}
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>

        <div className="space-y-6 lg:order-2">
          <ProductPublishPanel
            status={formStatus}
            selectableStatuses={selectableStatuses}
            onStatusChange={(status) => void handleStatusChange(status)}
            checklist={liveChecklist}
            checklistLoading={false}
            canPublish={canPublish}
            onPublish={() => void handlePublish()}
            publishPending={publishMutation.isPending}
          />

          <Card className="border-danger/30">
            <CardHeader>
              <h2 className="font-display font-medium text-danger">โซนอันตราย</h2>
            </CardHeader>
            <CardBody className="space-y-3">
              <p className="text-sm text-muted">
                การลบสินค้าไม่สามารถย้อนกลับได้ ตัวเลือก รูปภาพ และข้อมูลที่เกี่ยวข้องจะถูกลบไปด้วย
              </p>
              <ConfirmDeleteButton
                confirmLabel={product.name}
                title="ลบสินค้า"
                confirmButtonLabel="ลบสินค้า"
                variant="destructive"
                size="default"
                disabled={anyPending}
                isDeleting={deleteMutation.isPending}
                onConfirm={async () => {
                  await deleteMutation.mutateAsync(product.id);
                  router.push('/vendor/products');
                }}
              >
                ลบสินค้า
              </ConfirmDeleteButton>
            </CardBody>
          </Card>
        </div>
      </div>

      {pageError ? (
        <p className="mt-6 text-sm text-danger" role="alert">
          {pageError instanceof Error ? pageError.message : 'ดำเนินการไม่สำเร็จ'}
        </p>
      ) : null}
    </div>
  );
}
