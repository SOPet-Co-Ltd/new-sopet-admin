'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
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

  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        <Label>แท็ก</Label>
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
      <div
        className={cn(
          'mt-1.5 max-h-40 space-y-2 overflow-y-auto rounded-lg border border-border p-3',
          isLoading && 'opacity-60',
        )}
      >
        {tags.length === 0 && !isLoading ? (
          <p className="text-sm text-muted">ยังไม่มีแท็กที่อนุมัติ</p>
        ) : null}
        {tags.map((tag) => {
          const checked = value.includes(tag.id);
          return (
            <label key={tag.id} className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={checked}
                onChange={() => toggleTag(tag.id)}
                className="rounded border-border text-brand focus:ring-brand/20"
              />
              <span className={checked ? 'font-medium text-ink' : 'text-muted'}>{tag.name}</span>
            </label>
          );
        })}
      </div>
      {value.length > 0 ? (
        <p className="mt-1.5 text-xs text-muted">เลือกแล้ว {value.length} แท็ก</p>
      ) : null}
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
