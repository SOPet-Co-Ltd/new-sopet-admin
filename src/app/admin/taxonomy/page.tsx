'use client';

import { type KeyboardEvent, type ReactNode, useState } from 'react';
import { ApprovedTaxonomyTable } from '@/components/admin/taxonomy/approved-taxonomy-table';
import { CategoryCreateCard } from '@/components/admin/taxonomy/category-create-card';
import { PendingCategoryRow } from '@/components/admin/taxonomy/pending-category-row';
import { PendingPetTypeRow } from '@/components/admin/taxonomy/pending-pet-type-row';
import { PendingSimpleTaxonomyList } from '@/components/admin/taxonomy/pending-simple-taxonomy-list';
import { PetTypeCreateCard } from '@/components/admin/taxonomy/pet-type-create-card';
import { RejectedTaxonomySection } from '@/components/admin/taxonomy/rejected-taxonomy-section';
import { SimpleTaxonomyCreateCard } from '@/components/admin/taxonomy/simple-taxonomy-create-card';
import {
  ListRowSkeleton,
  TaxonomyTabCount,
} from '@/components/admin/taxonomy/taxonomy-hub-primitives';
import { Button } from '@/components/ui/button';
import { Card, CardBody, CardHeader, PageHeader } from '@/components/ui/card';
import {
  useApproveCategory,
  useApproveTag,
  useApprovePetType,
  useApproveBrand,
  useApprovedCategories,
  useApprovedTags,
  useApprovedPetTypes,
  useApprovedBrands,
  usePendingCategories,
  usePendingTags,
  usePendingPetTypes,
  usePendingBrands,
  useRejectCategory,
  useRejectTag,
  useRejectPetType,
  useRejectBrand,
  useRejectedCategories,
  useRejectedTags,
  useRejectedPetTypes,
  useRejectedBrands,
} from '@/hooks/useTaxonomy';
import { cn } from '@/lib/utils';

type TaxonomyTab = 'categories' | 'tags' | 'petTypes' | 'brands';

const TABS: { id: TaxonomyTab; label: string; tabId: string }[] = [
  { id: 'categories', label: 'หมวดหมู่', tabId: 'taxonomy-tab-categories' },
  { id: 'tags', label: 'แท็ก', tabId: 'taxonomy-tab-tags' },
  { id: 'petTypes', label: 'ประเภทสัตว์เลี้ยง', tabId: 'taxonomy-tab-pet-types' },
  { id: 'brands', label: 'แบรนด์', tabId: 'taxonomy-tab-brands' },
];

function PendingMediaTaxonomyCard({
  title,
  count,
  isLoading,
  children,
}: {
  title: string;
  count: number;
  isLoading: boolean;
  children: ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <h2 className="font-display font-medium text-balance text-ink">
          {title}
          {!isLoading ? (
            <span
              aria-hidden="true"
              className="ml-1.5 text-base font-normal text-muted-foreground tabular-nums"
            >
              ({count.toLocaleString('th-TH')})
            </span>
          ) : null}
        </h2>
      </CardHeader>
      <CardBody className="space-y-3">
        {isLoading ? <ListRowSkeleton rows={3} /> : children}
      </CardBody>
    </Card>
  );
}

export default function AdminTaxonomyPage() {
  const [tab, setTab] = useState<TaxonomyTab>('categories');

  const {
    data: categories = [],
    isLoading: loadingCategories,
    error: categoriesError,
  } = usePendingCategories();
  const { data: tags = [], isLoading: loadingTags } = usePendingTags();
  const { data: petTypes = [], isLoading: loadingPetTypes } = usePendingPetTypes();
  const { data: brands = [], isLoading: loadingBrands } = usePendingBrands();

  const {
    data: rejectedCategories = [],
    isLoading: loadingRejectedCategories,
    error: rejectedCategoriesError,
  } = useRejectedCategories();
  const {
    data: rejectedTags = [],
    isLoading: loadingRejectedTags,
    error: rejectedTagsError,
  } = useRejectedTags();
  const {
    data: rejectedPetTypes = [],
    isLoading: loadingRejectedPetTypes,
    error: rejectedPetTypesError,
  } = useRejectedPetTypes();
  const {
    data: rejectedBrands = [],
    isLoading: loadingRejectedBrands,
    error: rejectedBrandsError,
  } = useRejectedBrands();

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

  const mutationPending =
    approveCategory.isPending ||
    rejectCategory.isPending ||
    approveTag.isPending ||
    rejectTag.isPending ||
    approvePetType.isPending ||
    rejectPetType.isPending ||
    approveBrand.isPending ||
    rejectBrand.isPending;

  const pendingCounts: Record<TaxonomyTab, number> = {
    categories: categories.length,
    tags: tags.length,
    petTypes: petTypes.length,
    brands: brands.length,
  };

  function onTabKeyDown(event: KeyboardEvent<HTMLButtonElement>, currentIndex: number) {
    if (
      event.key !== 'ArrowLeft' &&
      event.key !== 'ArrowRight' &&
      event.key !== 'Home' &&
      event.key !== 'End'
    ) {
      return;
    }

    event.preventDefault();

    let nextIndex = currentIndex;
    if (event.key === 'Home') nextIndex = 0;
    else if (event.key === 'End') nextIndex = TABS.length - 1;
    else if (event.key === 'ArrowLeft') nextIndex = (currentIndex - 1 + TABS.length) % TABS.length;
    else nextIndex = (currentIndex + 1) % TABS.length;

    const nextTab = TABS[nextIndex];
    setTab(nextTab.id);
    requestAnimationFrame(() => {
      document.getElementById(nextTab.tabId)?.focus();
    });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="จัดการหมวดหมู่และแท็กสินค้า"
        description="สร้าง อนุมัติ ปฏิเสธ และลบหมวดหมู่ แท็ก ประเภทสัตว์เลี้ยง และแบรนด์"
      />

      <div className="flex flex-wrap gap-2" role="tablist" aria-label="มุมมองหมวดหมู่และแท็ก">
        {TABS.map((item, index) => {
          const selected = tab === item.id;
          return (
            <Button
              key={item.id}
              type="button"
              id={item.tabId}
              role="tab"
              aria-selected={selected}
              aria-controls="taxonomy-panel"
              tabIndex={selected ? 0 : -1}
              variant={selected ? 'default' : 'outline'}
              className={cn(
                'rounded-full',
                selected ? 'shadow-none' : 'bg-card text-ink hover:bg-surface',
              )}
              onClick={() => setTab(item.id)}
              onKeyDown={(event) => onTabKeyDown(event, index)}
            >
              {item.label}
              <TaxonomyTabCount count={pendingCounts[item.id]} selected={selected} />
            </Button>
          );
        })}
      </div>

      <div
        id="taxonomy-panel"
        role="tabpanel"
        aria-labelledby={TABS.find((item) => item.id === tab)?.tabId}
      >
        {tab === 'categories' ? (
          <div className="space-y-6">
            <CategoryCreateCard />
            {approvedCategoriesError ? (
              <p role="alert" className="text-sm text-danger">
                โหลดหมวดหมู่ที่อนุมัติแล้วไม่สำเร็จ:{' '}
                {approvedCategoriesError instanceof Error
                  ? approvedCategoriesError.message
                  : 'เกิดข้อผิดพลาด'}
              </p>
            ) : null}
            <ApprovedTaxonomyTable
              title="หมวดหมู่ที่อนุมัติแล้ว"
              items={approvedCategories}
              kind="category"
              showImage
              disabled={mutationPending}
              isLoading={loadingApprovedCategories}
            />
            {categoriesError ? (
              <p role="alert" className="text-sm text-danger">
                โหลดหมวดหมู่รออนุมัติไม่สำเร็จ:{' '}
                {categoriesError instanceof Error ? categoriesError.message : 'เกิดข้อผิดพลาด'}
              </p>
            ) : null}
            <PendingMediaTaxonomyCard
              title="หมวดหมู่รออนุมัติ"
              count={categories.length}
              isLoading={loadingCategories}
            >
              {categories.length === 0 ? (
                <p className="text-sm text-pretty text-muted-foreground">ไม่มีรายการรออนุมัติ</p>
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
            </PendingMediaTaxonomyCard>
            <RejectedTaxonomySection
              kind="category"
              items={rejectedCategories}
              isLoading={loadingRejectedCategories}
              error={rejectedCategoriesError}
              disabled={mutationPending}
            />
          </div>
        ) : tab === 'tags' ? (
          <div className="space-y-6">
            <SimpleTaxonomyCreateCard kind="tag" />
            <ApprovedTaxonomyTable
              title="แท็กที่อนุมัติแล้ว"
              items={approvedTags}
              kind="tag"
              disabled={mutationPending}
              isLoading={loadingApprovedTags}
            />
            <PendingSimpleTaxonomyList
              title="แท็กรออนุมัติ"
              items={tags}
              kind="tag"
              disabled={mutationPending}
              isLoading={loadingTags}
              onApprove={(id) => approveTag.mutate(id)}
              onReject={(id) => rejectTag.mutate(id)}
            />
            <RejectedTaxonomySection
              kind="tag"
              items={rejectedTags}
              isLoading={loadingRejectedTags}
              error={rejectedTagsError}
              disabled={mutationPending}
            />
          </div>
        ) : tab === 'petTypes' ? (
          <div className="space-y-6">
            <PetTypeCreateCard />
            <ApprovedTaxonomyTable
              title="ประเภทสัตว์เลี้ยงที่อนุมัติแล้ว"
              items={approvedPetTypes}
              kind="petType"
              showImage
              disabled={mutationPending}
              isLoading={loadingApprovedPetTypes}
            />
            <PendingMediaTaxonomyCard
              title="ประเภทสัตว์เลี้ยงรออนุมัติ"
              count={petTypes.length}
              isLoading={loadingPetTypes}
            >
              {petTypes.length === 0 ? (
                <p className="text-sm text-pretty text-muted-foreground">ไม่มีรายการรออนุมัติ</p>
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
            </PendingMediaTaxonomyCard>
            <RejectedTaxonomySection
              kind="petType"
              items={rejectedPetTypes}
              isLoading={loadingRejectedPetTypes}
              error={rejectedPetTypesError}
              disabled={mutationPending}
            />
          </div>
        ) : (
          <div className="space-y-6">
            <SimpleTaxonomyCreateCard kind="brand" />
            <ApprovedTaxonomyTable
              title="แบรนด์ที่อนุมัติแล้ว"
              items={approvedBrands}
              kind="brand"
              disabled={mutationPending}
              isLoading={loadingApprovedBrands}
            />
            <PendingSimpleTaxonomyList
              title="แบรนด์รออนุมัติ"
              items={brands}
              kind="brand"
              disabled={mutationPending}
              isLoading={loadingBrands}
              onApprove={(id) => approveBrand.mutate(id)}
              onReject={(id) => rejectBrand.mutate(id)}
            />
            <RejectedTaxonomySection
              kind="brand"
              items={rejectedBrands}
              isLoading={loadingRejectedBrands}
              error={rejectedBrandsError}
              disabled={mutationPending}
            />
          </div>
        )}
      </div>
    </div>
  );
}
