'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { HiArrowLeft, HiArrowRight } from 'react-icons/hi2';
import { VariantOptionGroupsEditor } from '@/components/vendor/variant-option-groups-editor';
import { BrandField, PetTypeField } from '@/components/vendor/pet-type-brand-fields';
import { CategoryField, TagsField } from '@/components/vendor/taxonomy-fields';
import { Button } from '@/components/ui/button';
import { Card, CardBody, CardHeader, PageHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ProductDescriptionEditor } from '@/components/vendor/product-description-editor';
import { useCreateProduct } from '@/hooks/useProductMutations';
import { useSyncProductVariants } from '@/hooks/useSyncProductVariants';
import {
  buildCombinationsFromGroups,
  countVariantItems,
  type VariantOptionGroup,
} from '@/lib/variants';
import { productCreateSchema, type ProductCreateFormValues } from '@/lib/validations';

function emptyGroup(): VariantOptionGroup {
  return { name: '', values: [''] };
}

export default function NewProductPage() {
  const router = useRouter();
  const createMutation = useCreateProduct();
  const syncMutation = useSyncProductVariants();
  const [groups, setGroups] = useState<VariantOptionGroup[]>([emptyGroup()]);
  const [variantError, setVariantError] = useState<string | null>(null);

  function handleGroupsChange(next: VariantOptionGroup[]) {
    setGroups(next);
    if (variantError) setVariantError(null);
  }

  const form = useForm<ProductCreateFormValues>({
    resolver: zodResolver(productCreateSchema),
    defaultValues: {
      name: '',
      description: '',
      categoryId: '',
      petTypeId: '',
      brandId: '',
      tagIds: [],
    },
  });

  const selectedTagIds = form.watch('tagIds') ?? [];

  const itemCount = useMemo(() => countVariantItems(groups), [groups]);
  const isPending = createMutation.isPending || syncMutation.isPending;
  const error = createMutation.error ?? syncMutation.error;

  async function onSubmit(values: ProductCreateFormValues) {
    const normalizedGroups = groups
      .map((g) => ({
        name: g.name.trim(),
        values: g.values.map((v) => v.trim()).filter(Boolean),
      }))
      .filter((g) => g.name && g.values.length > 0);

    if (normalizedGroups.length === 0) {
      setVariantError('ต้องมีอย่างน้อย 1 ตัวเลือก');
      return;
    }
    setVariantError(null);

    try {
      const product = await createMutation.mutateAsync({
        name: values.name,
        description: values.description || undefined,
        basePrice: 0,
        categoryId: values.categoryId || undefined,
        petTypeId: values.petTypeId || undefined,
        brandId: values.brandId || undefined,
        tagIds: values.tagIds?.length ? values.tagIds : undefined,
      });

      const items = buildCombinationsFromGroups(normalizedGroups, [], product.slug);
      await syncMutation.mutateAsync({
        productId: product.id,
        variants: items,
        productBasePrice: 0,
      });

      router.push(`/vendor/products/${product.id}/variants`);
    } catch {
      // surfaced via mutation state
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        title="สร้างสินค้า"
        description="ขั้นที่ 1 — รายละเอียดสินค้าและตัวเลือก · ขั้นถัดไปกำหนด SKU สต็อก และราคาแต่ละรายการ"
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

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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

            <div className="grid gap-4 sm:grid-cols-2">
              <CategoryField
                value={form.watch('categoryId')}
                onChange={(categoryId) => form.setValue('categoryId', categoryId)}
              />
              <PetTypeField
                value={form.watch('petTypeId')}
                onChange={(petTypeId) => form.setValue('petTypeId', petTypeId)}
              />
              <BrandField
                value={form.watch('brandId')}
                onChange={(brandId) => form.setValue('brandId', brandId)}
              />
              <TagsField
                value={selectedTagIds}
                onChange={(tagIds) => form.setValue('tagIds', tagIds)}
              />
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
                  disabled={isPending}
                />
              )}
            />
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="font-display font-medium text-ink">
              ตัวเลือกสินค้า <span className="text-danger">*</span>
            </h2>
          </CardHeader>
          <CardBody className="space-y-4">
            <VariantOptionGroupsEditor groups={groups} onChange={handleGroupsChange} />
            {itemCount > 0 ? (
              <p className="text-sm text-muted">จะสร้าง {itemCount} รายการตัวเลือก</p>
            ) : (
              <p className="text-sm text-muted">ต้องมีอย่างน้อย 1 ตัวเลือก</p>
            )}
            {variantError ? (
              <p className="text-xs text-danger" role="alert">
                {variantError}
              </p>
            ) : null}
          </CardBody>
        </Card>

        {error ? (
          <p className="text-sm text-danger">
            {error instanceof Error ? error.message : 'สร้างสินค้าไม่สำเร็จ'}
          </p>
        ) : null}

        <div className="flex gap-3">
          <Button type="button" variant="outline" asChild>
            <Link href="/vendor/products">ยกเลิก</Link>
          </Button>
          <Button type="submit" disabled={isPending} aria-busy={isPending}>
            {isPending ? (
              'กำลังสร้าง...'
            ) : (
              <span className="inline-flex items-center gap-1">
                ไปกำหนดตัวเลือก
                <HiArrowRight className="size-4" aria-hidden="true" />
              </span>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
