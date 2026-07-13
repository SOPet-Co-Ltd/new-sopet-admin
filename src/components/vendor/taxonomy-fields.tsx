'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { HiChevronDown } from 'react-icons/hi2';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  useApprovedCategories,
  useApprovedTags,
  useCreateCategory,
  useCreateTag,
} from '@/hooks/useTaxonomy';
import { labelTaxonomyStatus } from '@/lib/i18n/th';
import { proposeTaxonomySchema, type ProposeTaxonomyFormValues } from '@/lib/validations';
import { cn } from '@/lib/utils';

interface CategoryFieldProps {
  value?: string;
  onChange: (categoryId: string) => void;
  error?: string;
}

export function CategoryField({ value, onChange, error }: CategoryFieldProps) {
  const { data: categories = [], isLoading, error: loadError } = useApprovedCategories();
  const createMutation = useCreateCategory();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const form = useForm<ProposeTaxonomyFormValues>({
    resolver: zodResolver(proposeTaxonomySchema),
    defaultValues: { name: '' },
  });

  async function onPropose(values: ProposeTaxonomyFormValues) {
    try {
      const created = await createMutation.mutateAsync({ name: values.name });
      if (created.status === 'approved') {
        onChange(created.id);
      }
      setNotice(
        created.status === 'approved'
          ? `เพิ่มหมวดหมู่ "${created.name}" แล้ว`
          : `ส่งคำขอ "${created.name}" แล้ว (${labelTaxonomyStatus(created.status)})`,
      );
      setDialogOpen(false);
      form.reset();
    } catch {
      // surfaced via mutation state
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        <Label htmlFor="category">หมวดหมู่</Label>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-auto px-2 py-1 text-xs"
          onClick={() => setDialogOpen(true)}
        >
          เสนอหมวดหมู่ใหม่
        </Button>
      </div>
      <Select value={value ?? ''} onValueChange={onChange} disabled={isLoading}>
        <SelectTrigger
          id="category"
          className="mt-1.5"
          aria-invalid={!!error}
          aria-describedby={error ? 'category-error' : undefined}
        >
          <SelectValue placeholder={isLoading ? 'กำลังโหลด...' : 'เลือกหมวดหมู่'} />
        </SelectTrigger>
        <SelectContent>
          {categories.map((category) => (
            <SelectItem key={category.id} value={category.id}>
              {category.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {notice ? <p className="mt-1 text-xs text-muted">{notice}</p> : null}
      {loadError ? (
        <p className="mt-1 text-xs text-muted">ยังโหลดหมวดหมู่ไม่ได้ — ลองใหม่เมื่อ API พร้อม</p>
      ) : null}
      {error ? (
        <p id="category-error" className="mt-1 text-xs text-danger" role="alert">
          {error}
        </p>
      ) : null}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>เสนอหมวดหมู่ใหม่</DialogTitle>
            <DialogDescription>
              หมวดหมู่จะถูกส่งให้ผู้ดูแลอนุมัติก่อนแสดงในรายการทั้งหมด
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onPropose)} className="space-y-4">
            <div>
              <Label htmlFor="propose-category" required>
                ชื่อหมวดหมู่
              </Label>
              <Input
                id="propose-category"
                placeholder="ชื่อหมวดหมู่"
                aria-invalid={!!form.formState.errors.name}
                aria-describedby={form.formState.errors.name ? 'propose-category-error' : undefined}
                {...form.register('name')}
                className="mt-1"
              />
              {form.formState.errors.name ? (
                <p id="propose-category-error" className="mt-1 text-xs text-danger" role="alert">
                  {form.formState.errors.name.message}
                </p>
              ) : null}
            </div>
            {createMutation.error ? (
              <p className="text-sm text-danger" role="alert">
                {createMutation.error instanceof Error
                  ? createMutation.error.message
                  : 'ส่งคำขอไม่สำเร็จ'}
              </p>
            ) : null}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                ยกเลิก
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending}
                aria-busy={createMutation.isPending}
              >
                {createMutation.isPending ? 'กำลังส่ง...' : 'ส่งคำขอ'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface TagsFieldProps {
  value: string[];
  onChange: (tagIds: string[]) => void;
}

export function TagsField({ value, onChange }: TagsFieldProps) {
  const { data: tags = [], isLoading, error: loadError } = useApprovedTags();
  const createMutation = useCreateTag();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const form = useForm<ProposeTaxonomyFormValues>({
    resolver: zodResolver(proposeTaxonomySchema),
    defaultValues: { name: '' },
  });

  function toggleTag(tagId: string) {
    if (value.includes(tagId)) {
      onChange(value.filter((id) => id !== tagId));
    } else {
      onChange([...value, tagId]);
    }
  }

  async function onPropose(values: ProposeTaxonomyFormValues) {
    try {
      const created = await createMutation.mutateAsync(values.name);
      if (created.status === 'approved' && !value.includes(created.id)) {
        onChange([...value, created.id]);
      }
      setNotice(
        created.status === 'approved'
          ? `เพิ่มแท็ก "${created.name}" แล้ว`
          : `ส่งคำขอ "${created.name}" แล้ว (${labelTaxonomyStatus(created.status)})`,
      );
      setDialogOpen(false);
      form.reset();
    } catch {
      // surfaced via mutation state
    }
  }

  const selectedTagNames = tags.filter((tag) => value.includes(tag.id)).map((tag) => tag.name);
  const triggerLabel = isLoading
    ? 'กำลังโหลด...'
    : selectedTagNames.length > 0
      ? selectedTagNames.join(', ')
      : 'เลือกแท็ก';

  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        <Label htmlFor="tags">แท็ก</Label>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-auto px-2 py-1 text-xs"
          onClick={() => setDialogOpen(true)}
        >
          เสนอแท็กใหม่
        </Button>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild disabled={isLoading}>
          <button
            id="tags"
            type="button"
            className={cn(
              'mt-1.5 flex h-10 w-full items-center justify-between rounded-lg border border-border bg-white px-3 py-2 text-sm shadow-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 disabled:cursor-not-allowed disabled:opacity-50',
              selectedTagNames.length === 0 ? 'text-muted' : 'text-ink',
            )}
            aria-label="เลือกแท็ก"
          >
            <span className="truncate">{triggerLabel}</span>
            <HiChevronDown className="ml-2 size-4 shrink-0 text-muted" aria-hidden="true" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          className="max-h-60 w-[var(--radix-dropdown-menu-trigger-width)] overflow-y-auto"
        >
          {tags.length === 0 && !isLoading ? (
            <p className="px-2 py-1.5 text-sm text-muted">ยังไม่มีแท็กที่อนุมัติ</p>
          ) : null}
          {tags.map((tag) => (
            <DropdownMenuCheckboxItem
              key={tag.id}
              checked={value.includes(tag.id)}
              onCheckedChange={() => toggleTag(tag.id)}
              onSelect={(event) => event.preventDefault()}
            >
              {tag.name}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      {notice ? <p className="mt-1 text-xs text-muted">{notice}</p> : null}
      {loadError ? (
        <p className="mt-1 text-xs text-muted">ยังโหลดแท็กไม่ได้ — ลองใหม่เมื่อ API พร้อม</p>
      ) : null}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>เสนอแท็กใหม่</DialogTitle>
            <DialogDescription>
              แท็กจะถูกส่งให้ผู้ดูแลอนุมัติก่อนแสดงในรายการทั้งหมด
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onPropose)} className="space-y-4">
            <div>
              <Label htmlFor="propose-tag" required>
                ชื่อแท็ก
              </Label>
              <Input
                id="propose-tag"
                placeholder="ชื่อแท็ก"
                aria-invalid={!!form.formState.errors.name}
                aria-describedby={form.formState.errors.name ? 'propose-tag-error' : undefined}
                {...form.register('name')}
                className="mt-1"
              />
              {form.formState.errors.name ? (
                <p id="propose-tag-error" className="mt-1 text-xs text-danger" role="alert">
                  {form.formState.errors.name.message}
                </p>
              ) : null}
            </div>
            {createMutation.error ? (
              <p className="text-sm text-danger" role="alert">
                {createMutation.error instanceof Error
                  ? createMutation.error.message
                  : 'ส่งคำขอไม่สำเร็จ'}
              </p>
            ) : null}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                ยกเลิก
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending}
                aria-busy={createMutation.isPending}
              >
                {createMutation.isPending ? 'กำลังส่ง...' : 'ส่งคำขอ'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
