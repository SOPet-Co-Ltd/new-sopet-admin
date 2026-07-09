'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { ApprovedTaxonomyTable } from '@/components/admin/taxonomy/approved-taxonomy-table';
import { CategoryCreateCard } from '@/components/admin/taxonomy/category-create-card';
import { PendingCategoryRow } from '@/components/admin/taxonomy/pending-category-row';
import { PetTypeCreateCard } from '@/components/admin/taxonomy/pet-type-create-card';
import { PendingPetTypeRow } from '@/components/admin/taxonomy/pending-pet-type-row';
import { Button } from '@/components/ui/button';
import { Card, CardBody, PageHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  useApproveCategory,
  useApproveTag,
  useApprovePetType,
  useApproveBrand,
  useApprovedCategories,
  useApprovedTags,
  useApprovedPetTypes,
  useApprovedBrands,
  useCreateTag,
  useCreateBrand,
  usePendingCategories,
  usePendingTags,
  usePendingPetTypes,
  usePendingBrands,
  useRejectCategory,
  useRejectTag,
  useRejectPetType,
  useRejectBrand,
} from '@/hooks/useTaxonomy';
import { labelTaxonomyStatus } from '@/lib/i18n/th';
import { proposeTaxonomySchema, type ProposeTaxonomyFormValues } from '@/lib/validations';
import { TaxonomyDeleteButton } from '@/components/admin/taxonomy/taxonomy-delete-button';
import type { TaxonomyDeleteKind } from '@/components/admin/taxonomy/taxonomy-delete-dialog';
import type { TaxonomyItem } from '@/types';

function PendingTagList({
  title,
  items,
  kind,
  onApprove,
  onReject,
  isPending,
}: {
  title: string;
  items: TaxonomyItem[];
  kind: TaxonomyDeleteKind;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  isPending: boolean;
}) {
  return (
    <Card>
      <CardBody className="space-y-3">
        <h2 className="font-display font-medium text-ink">{title}</h2>
        {items.length === 0 ? (
          <p className="text-sm text-muted">ไม่มีรายการรออนุมัติ</p>
        ) : (
          <ul className="space-y-2">
            {items.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between gap-4 rounded-lg border border-border bg-surface/50 px-4 py-3"
              >
                <div>
                  <p className="font-medium text-ink">{item.name}</p>
                  <p className="text-xs text-muted">
                    {item.slug} · {labelTaxonomyStatus(item.status)}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <Button
                    type="button"
                    size="sm"
                    disabled={isPending}
                    aria-busy={isPending}
                    onClick={() => onApprove(item.id)}
                  >
                    อนุมัติ
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    disabled={isPending}
                    aria-busy={isPending}
                    onClick={() => onReject(item.id)}
                  >
                    ปฏิเสธ
                  </Button>
                  <TaxonomyDeleteButton item={item} kind={kind} disabled={isPending} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardBody>
    </Card>
  );
}

export default function AdminTaxonomyPage() {
  const [tab, setTab] = useState<'categories' | 'tags' | 'petTypes' | 'brands'>('categories');
  const [tagSuccess, setTagSuccess] = useState(false);
  const [brandSuccess, setBrandSuccess] = useState(false);
  const {
    data: categories = [],
    isLoading: loadingCategories,
    error: categoriesError,
  } = usePendingCategories();
  const { data: tags = [], isLoading: loadingTags } = usePendingTags();
  const { data: petTypes = [], isLoading: loadingPetTypes } = usePendingPetTypes();
  const { data: brands = [], isLoading: loadingBrands } = usePendingBrands();
  const {
    data: approvedCategories = [],
    isLoading: loadingApprovedCategories,
    error: approvedCategoriesError,
  } = useApprovedCategories();
  const { data: approvedTags = [], isLoading: loadingApprovedTags } = useApprovedTags();
  const { data: approvedPetTypes = [], isLoading: loadingApprovedPetTypes } = useApprovedPetTypes();
  const { data: approvedBrands = [], isLoading: loadingApprovedBrands } = useApprovedBrands();
  const approveCategory = useApproveCategory();
  const rejectCategory = useRejectCategory();
  const approveTag = useApproveTag();
  const rejectTag = useRejectTag();
  const approvePetType = useApprovePetType();
  const rejectPetType = useRejectPetType();
  const approveBrand = useApproveBrand();
  const rejectBrand = useRejectBrand();
  const createTag = useCreateTag();
  const createBrand = useCreateBrand();

  const tagForm = useForm<ProposeTaxonomyFormValues>({
    resolver: zodResolver(proposeTaxonomySchema),
    defaultValues: { name: '' },
  });

  const brandForm = useForm<ProposeTaxonomyFormValues>({
    resolver: zodResolver(proposeTaxonomySchema),
    defaultValues: { name: '' },
  });

  const mutationPending =
    approveCategory.isPending ||
    rejectCategory.isPending ||
    approveTag.isPending ||
    rejectTag.isPending ||
    approvePetType.isPending ||
    rejectPetType.isPending ||
    approveBrand.isPending ||
    rejectBrand.isPending;

  async function onCreateTag(values: ProposeTaxonomyFormValues) {
    try {
      await createTag.mutateAsync(values.name);
      tagForm.reset();
      setTagSuccess(true);
      setTimeout(() => setTagSuccess(false), 3000);
    } catch {
      // surfaced via mutation state
    }
  }

  async function onCreateBrand(values: ProposeTaxonomyFormValues) {
    try {
      await createBrand.mutateAsync(values.name);
      brandForm.reset();
      setBrandSuccess(true);
      setTimeout(() => setBrandSuccess(false), 3000);
    } catch {
      // surfaced via mutation state
    }
  }

  return (
    <div>
      <PageHeader
        title="หมวดหมู่ แท็ก ประเภทสัตว์เลี้ยง และแบรนด์"
        description="สร้าง อนุมัติ หรือปฏิเสธรายการ taxonomy"
      />

      <div className="mb-6 flex flex-wrap gap-2">
        <Button
          type="button"
          variant={tab === 'categories' ? 'default' : 'outline'}
          onClick={() => setTab('categories')}
        >
          หมวดหมู่ · รออนุมัติ ({categories.length})
        </Button>
        <Button
          type="button"
          variant={tab === 'tags' ? 'default' : 'outline'}
          onClick={() => setTab('tags')}
        >
          แท็ก · รออนุมัติ ({tags.length})
        </Button>
        <Button
          type="button"
          variant={tab === 'petTypes' ? 'default' : 'outline'}
          onClick={() => setTab('petTypes')}
        >
          ประเภทสัตว์เลี้ยง · รออนุมัติ ({petTypes.length})
        </Button>
        <Button
          type="button"
          variant={tab === 'brands' ? 'default' : 'outline'}
          onClick={() => setTab('brands')}
        >
          แบรนด์ · รออนุมัติ ({brands.length})
        </Button>
      </div>

      {tab === 'categories' ? (
        <div className="space-y-4">
          <CategoryCreateCard />
          {approvedCategoriesError ? (
            <p role="alert" className="text-sm text-danger">
              โหลดหมวดหมู่ที่อนุมัติแล้วไม่สำเร็จ:{' '}
              {approvedCategoriesError instanceof Error
                ? approvedCategoriesError.message
                : 'เกิดข้อผิดพลาด'}
            </p>
          ) : null}
          {loadingApprovedCategories ? (
            <p className="text-muted">กำลังโหลด...</p>
          ) : (
            <ApprovedTaxonomyTable
              title="หมวดหมู่ที่อนุมัติแล้ว"
              items={approvedCategories}
              kind="category"
              showImage
              disabled={mutationPending}
            />
          )}
          {categoriesError ? (
            <p role="alert" className="text-sm text-danger">
              โหลดหมวดหมู่รออนุมัติไม่สำเร็จ:{' '}
              {categoriesError instanceof Error ? categoriesError.message : 'เกิดข้อผิดพลาด'}
            </p>
          ) : null}
          {loadingCategories ? (
            <p className="text-muted">กำลังโหลด...</p>
          ) : (
            <Card>
              <CardBody className="space-y-3">
                <h2 className="font-display font-medium text-ink">หมวดหมู่รออนุมัติ</h2>
                {categories.length === 0 ? (
                  <p className="text-sm text-muted">ไม่มีรายการรออนุมัติ</p>
                ) : (
                  <ul className="space-y-2">
                    {categories.map((item) => (
                      <PendingCategoryRow
                        key={item.id}
                        item={item}
                        disabled={mutationPending}
                        onApprove={(id) => approveCategory.mutate(id)}
                        onReject={(id) => rejectCategory.mutate(id)}
                      />
                    ))}
                  </ul>
                )}
              </CardBody>
            </Card>
          )}
        </div>
      ) : tab === 'tags' ? (
        <div className="space-y-4">
          <Card>
            <CardBody className="space-y-3">
              <h2 className="font-display font-medium text-ink">สร้างแท็ก (อนุมัติอัตโนมัติ)</h2>
              <form
                onSubmit={tagForm.handleSubmit(onCreateTag)}
                className="flex flex-wrap items-end gap-3"
              >
                <div className="min-w-[200px] flex-1">
                  <Label htmlFor="tag-name" required>
                    ชื่อแท็ก
                  </Label>
                  <Input
                    id="tag-name"
                    placeholder="เช่น ลดราคา"
                    aria-invalid={!!tagForm.formState.errors.name}
                    aria-describedby={tagForm.formState.errors.name ? 'tag-name-error' : undefined}
                    {...tagForm.register('name')}
                    className="mt-1.5"
                  />
                  {tagForm.formState.errors.name ? (
                    <p id="tag-name-error" role="alert" className="mt-1 text-xs text-danger">
                      {tagForm.formState.errors.name.message}
                    </p>
                  ) : null}
                </div>
                <Button
                  type="submit"
                  disabled={createTag.isPending}
                  aria-busy={createTag.isPending}
                >
                  {createTag.isPending ? 'กำลังสร้าง...' : 'สร้าง'}
                </Button>
              </form>
              {createTag.error ? (
                <p role="alert" className="mt-2 text-sm text-danger">
                  {createTag.error instanceof Error ? createTag.error.message : 'สร้างไม่สำเร็จ'}
                </p>
              ) : null}
              {tagSuccess ? <p className="mt-2 text-sm text-brand">สร้างแล้ว</p> : null}
            </CardBody>
          </Card>
          {loadingApprovedTags ? (
            <p className="text-muted">กำลังโหลด...</p>
          ) : (
            <ApprovedTaxonomyTable
              title="แท็กที่อนุมัติแล้ว"
              items={approvedTags}
              kind="tag"
              disabled={mutationPending}
            />
          )}
          {loadingTags ? (
            <p className="text-muted">กำลังโหลด...</p>
          ) : (
            <PendingTagList
              title="แท็กรออนุมัติ"
              items={tags}
              kind="tag"
              isPending={mutationPending}
              onApprove={(id) => approveTag.mutate(id)}
              onReject={(id) => rejectTag.mutate(id)}
            />
          )}
        </div>
      ) : tab === 'petTypes' ? (
        <div className="space-y-4">
          <PetTypeCreateCard />
          {loadingApprovedPetTypes ? (
            <p className="text-muted">กำลังโหลด...</p>
          ) : (
            <ApprovedTaxonomyTable
              title="ประเภทสัตว์เลี้ยงที่อนุมัติแล้ว"
              items={approvedPetTypes}
              kind="petType"
              disabled={mutationPending}
            />
          )}
          {loadingPetTypes ? (
            <p className="text-muted">กำลังโหลด...</p>
          ) : (
            <Card>
              <CardBody className="space-y-3">
                <h2 className="font-display font-medium text-ink">ประเภทสัตว์เลี้ยงรออนุมัติ</h2>
                {petTypes.length === 0 ? (
                  <p className="text-sm text-muted">ไม่มีรายการรออนุมัติ</p>
                ) : (
                  <ul className="space-y-2">
                    {petTypes.map((item) => (
                      <PendingPetTypeRow
                        key={item.id}
                        item={item}
                        disabled={mutationPending}
                        onApprove={(id) => approvePetType.mutate(id)}
                        onReject={(id) => rejectPetType.mutate(id)}
                      />
                    ))}
                  </ul>
                )}
              </CardBody>
            </Card>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <Card>
            <CardBody className="space-y-3">
              <h2 className="font-display font-medium text-ink">สร้างแบรนด์ (อนุมัติอัตโนมัติ)</h2>
              <form
                onSubmit={brandForm.handleSubmit(onCreateBrand)}
                className="flex flex-wrap items-end gap-3"
              >
                <div className="min-w-[200px] flex-1">
                  <Label htmlFor="brand-name" required>
                    ชื่อแบรนด์
                  </Label>
                  <Input
                    id="brand-name"
                    placeholder="เช่น Royal Canin"
                    aria-invalid={!!brandForm.formState.errors.name}
                    aria-describedby={
                      brandForm.formState.errors.name ? 'brand-name-error' : undefined
                    }
                    {...brandForm.register('name')}
                    className="mt-1.5"
                  />
                  {brandForm.formState.errors.name ? (
                    <p id="brand-name-error" role="alert" className="mt-1 text-xs text-danger">
                      {brandForm.formState.errors.name.message}
                    </p>
                  ) : null}
                </div>
                <Button
                  type="submit"
                  disabled={createBrand.isPending}
                  aria-busy={createBrand.isPending}
                >
                  {createBrand.isPending ? 'กำลังสร้าง...' : 'สร้าง'}
                </Button>
              </form>
              {createBrand.error ? (
                <p role="alert" className="mt-2 text-sm text-danger">
                  {createBrand.error instanceof Error
                    ? createBrand.error.message
                    : 'สร้างไม่สำเร็จ'}
                </p>
              ) : null}
              {brandSuccess ? <p className="mt-2 text-sm text-brand">สร้างแล้ว</p> : null}
            </CardBody>
          </Card>
          {loadingApprovedBrands ? (
            <p className="text-muted">กำลังโหลด...</p>
          ) : (
            <ApprovedTaxonomyTable
              title="แบรนด์ที่อนุมัติแล้ว"
              items={approvedBrands}
              kind="brand"
              disabled={mutationPending}
            />
          )}
          {loadingBrands ? (
            <p className="text-muted">กำลังโหลด...</p>
          ) : (
            <PendingTagList
              title="แบรนด์รออนุมัติ"
              items={brands}
              kind="brand"
              isPending={mutationPending}
              onApprove={(id) => approveBrand.mutate(id)}
              onReject={(id) => rejectBrand.mutate(id)}
            />
          )}
        </div>
      )}
    </div>
  );
}
