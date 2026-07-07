'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { ApprovedCategoryRow } from '@/components/admin/taxonomy/approved-category-row';
import { CategoryCreateCard } from '@/components/admin/taxonomy/category-create-card';
import { PendingCategoryRow } from '@/components/admin/taxonomy/pending-category-row';
import { Button } from '@/components/ui/button';
import { Card, CardBody, PageHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  useApproveCategory,
  useApproveTag,
  useApprovedCategories,
  useApprovedTags,
  useCreateTag,
  usePendingCategories,
  usePendingTags,
  useRejectCategory,
  useRejectTag,
} from '@/hooks/useTaxonomy';
import { labelTaxonomyStatus } from '@/lib/i18n/th';
import { proposeTaxonomySchema, type ProposeTaxonomyFormValues } from '@/lib/validations';
import type { TaxonomyItem } from '@/types';

function ApprovedCategoryList({
  title,
  items,
  disabled,
}: {
  title: string;
  items: TaxonomyItem[];
  disabled?: boolean;
}) {
  return (
    <Card>
      <CardBody className="space-y-3">
        <h2 className="font-display font-medium text-ink">{title}</h2>
        {items.length === 0 ? (
          <p className="text-sm text-muted">ไม่มีรายการ</p>
        ) : (
          <ul className="space-y-2">
            {items.map((item) => (
              <ApprovedCategoryRow key={item.id} item={item} disabled={disabled} />
            ))}
          </ul>
        )}
      </CardBody>
    </Card>
  );
}

function ApprovedList({ title, items }: { title: string; items: TaxonomyItem[] }) {
  return (
    <Card>
      <CardBody className="space-y-3">
        <h2 className="font-display font-medium text-ink">{title}</h2>
        {items.length === 0 ? (
          <p className="text-sm text-muted">ไม่มีรายการ</p>
        ) : (
          <ul className="space-y-2">
            {items.map((item) => (
              <li key={item.id} className="rounded-lg border border-border bg-surface/50 px-4 py-3">
                <p className="font-medium text-ink">{item.name}</p>
                <p className="text-xs text-muted">
                  {item.slug} · {labelTaxonomyStatus(item.status)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </CardBody>
    </Card>
  );
}

function PendingTagList({
  title,
  items,
  onApprove,
  onReject,
  isPending,
}: {
  title: string;
  items: TaxonomyItem[];
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
  const [tab, setTab] = useState<'categories' | 'tags'>('categories');
  const [tagSuccess, setTagSuccess] = useState(false);
  const {
    data: categories = [],
    isLoading: loadingCategories,
    error: categoriesError,
  } = usePendingCategories();
  const { data: tags = [], isLoading: loadingTags } = usePendingTags();
  const {
    data: approvedCategories = [],
    isLoading: loadingApprovedCategories,
    error: approvedCategoriesError,
  } = useApprovedCategories();
  const { data: approvedTags = [], isLoading: loadingApprovedTags } = useApprovedTags();
  const approveCategory = useApproveCategory();
  const rejectCategory = useRejectCategory();
  const approveTag = useApproveTag();
  const rejectTag = useRejectTag();
  const createTag = useCreateTag();

  const tagForm = useForm<ProposeTaxonomyFormValues>({
    resolver: zodResolver(proposeTaxonomySchema),
    defaultValues: { name: '' },
  });

  const mutationPending =
    approveCategory.isPending ||
    rejectCategory.isPending ||
    approveTag.isPending ||
    rejectTag.isPending;

  function handleDeleteCategory(_item: TaxonomyItem) {
    // CategoryDeleteDialog wired in Phase 6
  }

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

  return (
    <div>
      <PageHeader title="หมวดหมู่และแท็ก" description="สร้าง อนุมัติ หรือปฏิเสธหมวดหมู่และแท็ก" />

      <div className="mb-6 flex gap-2">
        <Button
          type="button"
          variant={tab === 'categories' ? 'default' : 'outline'}
          onClick={() => setTab('categories')}
        >
          หมวดหมู่ ({categories.length})
        </Button>
        <Button
          type="button"
          variant={tab === 'tags' ? 'default' : 'outline'}
          onClick={() => setTab('tags')}
        >
          แท็ก ({tags.length})
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
            <ApprovedCategoryList
              title="หมวดหมู่ที่อนุมัติแล้ว"
              items={approvedCategories}
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
                        onDelete={handleDeleteCategory}
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
            <ApprovedList title="แท็กที่อนุมัติแล้ว" items={approvedTags} />
          )}
          {loadingTags ? (
            <p className="text-muted">กำลังโหลด...</p>
          ) : (
            <PendingTagList
              title="แท็กรออนุมัติ"
              items={tags}
              isPending={mutationPending}
              onApprove={(id) => approveTag.mutate(id)}
              onReject={(id) => rejectTag.mutate(id)}
            />
          )}
        </div>
      )}
    </div>
  );
}
