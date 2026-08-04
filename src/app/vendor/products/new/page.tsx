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
import { Stepper } from '@/components/ui/stepper';
import { ProductDescriptionEditor } from '@/components/vendor/product-description-editor';
import { useCreateProduct } from '@/hooks/useProductMutations';
import { useSyncProductVariants } from '@/hooks/useSyncProductVariants';
import {
  buildCombinationsFromGroups,
  countVariantItems,
  type VariantOptionGroup,
} from '@/lib/variants';
import { productCreateSchema, type ProductCreateFormValues } from '@/lib/validations';
import { PRODUCT_WIZARD_STEPS } from '@/lib/product-wizard';

const LAST_FORM_STEP = 3;

function emptyGroup(): VariantOptionGroup {
  return { name: '', values: [''] };
}

export default function NewProductPage() {
  const router = useRouter();
  const createMutation = useCreateProduct();
  const syncMutation = useSyncProductVariants();
  const [step, setStep] = useState(1);
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
  const currentStepMeta = PRODUCT_WIZARD_STEPS[step - 1];

  async function handleNext() {
    if (step === 1) {
      const valid = await form.trigger('name');
      if (!valid) return;
    }
    setStep((current) => Math.min(current + 1, LAST_FORM_STEP));
  }

  function handleBack() {
    setStep((current) => Math.max(current - 1, 1));
  }

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

      router.push(`/vendor/products/${product.id}/variants?fromWizard=1`);
    } catch {
      // surfaced via mutation state
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        title="สร้างสินค้า"
        description={`ขั้นที่ ${step} จาก ${PRODUCT_WIZARD_STEPS.length} — ${currentStepMeta.label}`}
        back={
          <Link
            href="/vendor/products"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-brand focus-visible:rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
          >
            <HiArrowLeft className="size-3.5" aria-hidden="true" />
            กลับไปรายการสินค้า
          </Link>
        }
      />

      <Stepper steps={PRODUCT_WIZARD_STEPS} currentStep={step} className="mb-8" />

      <p className="sr-only" aria-live="polite">
        ขั้นที่ {step} จาก {PRODUCT_WIZARD_STEPS.length}: {currentStepMeta.label}
      </p>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {step === 1 ? (
          <Card>
            <CardHeader>
              <h2 className="text-balance font-display font-medium text-ink">ข้อมูลพื้นฐาน</h2>
              <p className="mt-1 text-sm text-muted-foreground text-pretty">
                ชื่อและรายละเอียดสินค้าที่ลูกค้าจะเห็น
              </p>
            </CardHeader>
            <CardBody className="space-y-5">
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
                  <p id="name-error" className="mt-1.5 text-xs text-danger" role="alert">
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
                    disabled={isPending}
                  />
                )}
              />
            </CardBody>
          </Card>
        ) : null}

        {step === 2 ? (
          <Card>
            <CardHeader>
              <h2 className="text-balance font-display font-medium text-ink">การจัดหมวดหมู่</h2>
              <p className="mt-1 text-sm text-muted-foreground text-pretty">
                ช่วยให้ลูกค้าค้นหาสินค้านี้เจอง่ายขึ้น (ไม่จำเป็น)
              </p>
            </CardHeader>
            <CardBody>
              <div className="grid gap-5 sm:grid-cols-2">
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
            </CardBody>
          </Card>
        ) : null}

        {step === 3 ? (
          <Card>
            <CardHeader>
              <h2 className="text-balance font-display font-medium text-ink">
                ตัวเลือกสินค้า <span className="text-danger">*</span>
              </h2>
              <p className="mt-1 text-sm text-muted-foreground text-pretty">
                กำหนดกลุ่มตัวเลือก เช่น สี หรือไซส์ — ขั้นถัดไปจะให้กำหนด SKU สต็อก
                และราคาของแต่ละรายการ
              </p>
            </CardHeader>
            <CardBody className="space-y-4">
              <VariantOptionGroupsEditor
                groups={groups}
                onChange={handleGroupsChange}
                showIntro={false}
              />
              {itemCount > 0 ? (
                <p className="rounded-lg bg-surface px-3 py-2 text-sm text-muted-foreground">
                  จะสร้าง <span className="font-medium tabular-nums text-ink">{itemCount}</span>{' '}
                  รายการตัวเลือก
                </p>
              ) : (
                <p className="rounded-lg bg-surface px-3 py-2 text-sm text-muted-foreground">
                  ต้องมีอย่างน้อย 1 ตัวเลือกที่มีชื่อและค่า
                </p>
              )}
              {variantError ? (
                <p
                  className="rounded-lg border border-danger/20 bg-danger-bg px-3 py-2 text-sm text-danger"
                  role="alert"
                >
                  {variantError}
                </p>
              ) : null}
            </CardBody>
          </Card>
        ) : null}

        {error ? (
          <p
            className="rounded-lg border border-danger/20 bg-danger-bg px-3 py-2 text-sm text-danger"
            role="alert"
          >
            {error instanceof Error ? error.message : 'สร้างสินค้าไม่สำเร็จ'}
          </p>
        ) : null}

        <div className="flex flex-col gap-3 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-3">
            <Button type="button" variant="outline" asChild className="min-w-24">
              <Link href="/vendor/products">ยกเลิก</Link>
            </Button>
            {step > 1 ? (
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                disabled={isPending}
                className="min-w-24"
              >
                <span className="inline-flex items-center gap-1.5">
                  <HiArrowLeft className="size-4" aria-hidden="true" />
                  ก่อนหน้า
                </span>
              </Button>
            ) : null}
          </div>

          {step < LAST_FORM_STEP ? (
            <Button type="button" onClick={handleNext} className="w-full sm:w-auto">
              <span className="inline-flex items-center gap-1.5">
                ถัดไป
                <HiArrowRight className="size-4" aria-hidden="true" />
              </span>
            </Button>
          ) : (
            <Button
              type="submit"
              disabled={isPending}
              aria-busy={isPending}
              className="h-auto min-h-10 w-full whitespace-normal py-2.5 text-center sm:w-auto sm:max-w-xs"
            >
              {isPending ? (
                'กำลังสร้าง...'
              ) : (
                <span className="inline-flex items-center justify-center gap-1.5">
                  สร้างสินค้าและไปกำหนดตัวเลือก
                  <HiArrowRight className="size-4 shrink-0" aria-hidden="true" />
                </span>
              )}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
