'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  useCreateCategory,
  useCreateTag,
  useMyCategoryProposals,
  useMyTagProposals,
} from '@/hooks/useTaxonomy';
import { labelTaxonomyStatus } from '@/lib/i18n/th';
import { proposeTaxonomySchema, type ProposeTaxonomyFormValues } from '@/lib/validations';
import type { CreateCategoryInput, TaxonomyItem } from '@/types';
import type { UseMutationResult } from '@tanstack/react-query';
import { cn } from '@/lib/utils';

function taxonomyStatusClass(status: string): string {
  if (status === 'approved') return 'bg-success-bg text-success';
  if (status === 'rejected') return 'bg-danger-bg text-danger';
  if (status === 'pending') return 'bg-warning-bg text-warning-text';
  return 'bg-surface text-muted-foreground';
}

function ProposeDialog<TInput>({
  title,
  description,
  fieldLabel,
  placeholder,
  fieldId,
  mutation,
  buildInput,
}: {
  title: string;
  description: string;
  fieldLabel: string;
  placeholder: string;
  fieldId: string;
  mutation: UseMutationResult<TaxonomyItem, Error, TInput>;
  buildInput: (values: ProposeTaxonomyFormValues) => TInput;
}) {
  const [open, setOpen] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const form = useForm<ProposeTaxonomyFormValues>({
    resolver: zodResolver(proposeTaxonomySchema),
    defaultValues: { name: '' },
  });

  async function onPropose(values: ProposeTaxonomyFormValues) {
    try {
      const created = await mutation.mutateAsync(buildInput(values));
      setNotice(`ส่งคำขอ "${created.name}" แล้ว (${labelTaxonomyStatus(created.status)})`);
      setOpen(false);
      form.reset();
    } catch {
      // surfaced via mutation state
    }
  }

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="min-h-9"
        onClick={() => {
          mutation.reset();
          setOpen(true);
        }}
      >
        {title}
      </Button>
      {notice ? (
        <p className="mt-1 text-xs text-success" role="status">
          {notice}
        </p>
      ) : null}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onPropose)} className="space-y-4">
            <div>
              <Label htmlFor={fieldId} required>
                {fieldLabel}
              </Label>
              <Input
                id={fieldId}
                placeholder={placeholder}
                aria-invalid={!!form.formState.errors.name}
                aria-describedby={form.formState.errors.name ? `${fieldId}-error` : undefined}
                {...form.register('name')}
                className="mt-1"
              />
              {form.formState.errors.name ? (
                <p id={`${fieldId}-error`} className="mt-1 text-xs text-danger" role="alert">
                  {form.formState.errors.name.message}
                </p>
              ) : null}
            </div>
            {mutation.error ? (
              <p className="text-sm text-danger" role="alert">
                {mutation.error instanceof Error ? mutation.error.message : 'ส่งคำขอไม่สำเร็จ'}
              </p>
            ) : null}
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                className="min-h-9"
                onClick={() => setOpen(false)}
              >
                ยกเลิก
              </Button>
              <Button
                type="submit"
                className="min-h-9"
                disabled={mutation.isPending}
                aria-busy={mutation.isPending}
              >
                {mutation.isPending ? 'กำลังส่ง...' : 'ส่งคำขอ'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

function ProposalListSkeleton() {
  return (
    <div className="space-y-2" aria-hidden="true">
      <div className="h-9 animate-pulse rounded-lg bg-surface motion-reduce:animate-none" />
      <div className="h-9 animate-pulse rounded-lg bg-surface motion-reduce:animate-none" />
    </div>
  );
}

function ProposalList({
  title,
  items,
  isLoading,
  emptyMessage,
  emptyHint,
  action,
}: {
  title: string;
  items: TaxonomyItem[];
  isLoading: boolean;
  emptyMessage: string;
  emptyHint: string;
  action: React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-medium text-ink">{title}</h3>
        {action}
      </div>
      {isLoading ? (
        <div aria-busy="true" aria-label={`กำลังโหลด${title}`}>
          <ProposalListSkeleton />
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-lg bg-surface px-3 py-4" role="status">
          <p className="text-sm font-medium text-ink">{emptyMessage}</p>
          <p className="mt-1 text-sm text-muted-foreground text-pretty">{emptyHint}</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2.5"
            >
              <span className="truncate text-sm text-ink">{item.name}</span>
              <Badge status={item.status} className={cn(taxonomyStatusClass(item.status))}>
                {labelTaxonomyStatus(item.status)}
              </Badge>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function TaxonomyProposalsSection() {
  const { data: categories = [], isLoading: categoriesLoading } = useMyCategoryProposals();
  const { data: tags = [], isLoading: tagsLoading } = useMyTagProposals();
  const createCategory = useCreateCategory();
  const createTag = useCreateTag();

  return (
    <Card>
      <CardHeader>
        <div>
          <h2 className="font-display text-lg font-medium text-ink">คำขอหมวดหมู่และแท็ก</h2>
          <p className="mt-1 text-sm text-muted-foreground text-pretty">
            เสนอหมวดหมู่หรือแท็กใหม่ — รออนุมัติก่อนแสดงในรายการสินค้า
          </p>
        </div>
      </CardHeader>
      <CardBody className="grid gap-6 sm:grid-cols-2">
        <ProposalList
          title="หมวดหมู่ที่เสนอ"
          items={categories}
          isLoading={categoriesLoading}
          emptyMessage="ยังไม่มีคำขอหมวดหมู่"
          emptyHint="เสนอเมื่อต้องการหมวดหมู่ที่ยังไม่มีในระบบ"
          action={
            <ProposeDialog
              title="เสนอหมวดหมู่ใหม่"
              description="หมวดหมู่จะถูกส่งให้ผู้ดูแลอนุมัติก่อนแสดงในรายการทั้งหมด"
              fieldLabel="ชื่อหมวดหมู่"
              placeholder="ชื่อหมวดหมู่"
              fieldId="propose-category-request"
              mutation={createCategory}
              buildInput={(values) => ({ name: values.name }) satisfies CreateCategoryInput}
            />
          }
        />
        <ProposalList
          title="แท็กที่เสนอ"
          items={tags}
          isLoading={tagsLoading}
          emptyMessage="ยังไม่มีคำขอแท็ก"
          emptyHint="เสนอเมื่อต้องการแท็กสำหรับจัดกลุ่มสินค้า"
          action={
            <ProposeDialog
              title="เสนอแท็กใหม่"
              description="แท็กจะถูกส่งให้ผู้ดูแลอนุมัติก่อนแสดงในรายการทั้งหมด"
              fieldLabel="ชื่อแท็ก"
              placeholder="ชื่อแท็ก"
              fieldId="propose-tag-request"
              mutation={createTag}
              buildInput={(values) => values.name}
            />
          }
        />
      </CardBody>
    </Card>
  );
}
