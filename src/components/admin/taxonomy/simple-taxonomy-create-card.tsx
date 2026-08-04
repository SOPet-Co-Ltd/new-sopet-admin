'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCreateBrand, useCreateTag } from '@/hooks/useTaxonomy';
import { isApiError } from '@/lib/api/errors';
import { proposeTaxonomySchema, type ProposeTaxonomyFormValues } from '@/lib/validations';

type SimpleTaxonomyKind = 'tag' | 'brand';

const COPY: Record<
  SimpleTaxonomyKind,
  { title: string; description: string; fieldLabel: string; placeholder: string; fieldId: string }
> = {
  tag: {
    title: 'สร้างแท็ก',
    description: 'แท็กที่สร้างโดยผู้ดูแลจะได้รับการอนุมัติทันที',
    fieldLabel: 'ชื่อแท็ก',
    placeholder: 'เช่น ลดราคา',
    fieldId: 'tag-name',
  },
  brand: {
    title: 'สร้างแบรนด์',
    description: 'แบรนด์ที่สร้างโดยผู้ดูแลจะได้รับการอนุมัติทันที',
    fieldLabel: 'ชื่อแบรนด์',
    placeholder: 'เช่น Royal Canin',
    fieldId: 'brand-name',
  },
};

function mutationErrorMessage(error: unknown, fallback: string): string {
  if (isApiError(error)) return error.message;
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

export function SimpleTaxonomyCreateCard({ kind }: { kind: SimpleTaxonomyKind }) {
  const [success, setSuccess] = useState(false);
  const createTag = useCreateTag();
  const createBrand = useCreateBrand();
  const mutation = kind === 'tag' ? createTag : createBrand;
  const copy = COPY[kind];

  const form = useForm<ProposeTaxonomyFormValues>({
    resolver: zodResolver(proposeTaxonomySchema),
    defaultValues: { name: '' },
  });

  async function onSubmit(values: ProposeTaxonomyFormValues) {
    try {
      await mutation.mutateAsync(values.name);
      form.reset();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      // surfaced via mutation state
    }
  }

  const errorId = `${copy.fieldId}-error`;

  return (
    <Card>
      <CardHeader className="space-y-1">
        <h2 className="font-display font-medium text-balance text-ink">{copy.title}</h2>
        <p className="text-sm text-pretty text-muted-foreground">{copy.description}</p>
      </CardHeader>
      <CardBody className="space-y-4">
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start"
          noValidate
        >
          <div>
            <Label htmlFor={copy.fieldId} required>
              {copy.fieldLabel}
            </Label>
            <Input
              id={copy.fieldId}
              placeholder={copy.placeholder}
              disabled={mutation.isPending}
              aria-invalid={!!form.formState.errors.name}
              aria-describedby={form.formState.errors.name ? errorId : undefined}
              {...form.register('name')}
              className="mt-1.5"
            />
            {form.formState.errors.name ? (
              <p id={errorId} role="alert" className="mt-1 text-xs text-danger">
                {form.formState.errors.name.message}
              </p>
            ) : null}
          </div>
          <div className="flex sm:pt-6.5">
            <Button
              type="submit"
              className="w-full sm:w-auto"
              disabled={mutation.isPending}
              aria-busy={mutation.isPending}
            >
              {mutation.isPending ? 'กำลังสร้าง...' : 'สร้าง'}
            </Button>
          </div>
        </form>

        {mutation.isError ? (
          <p role="alert" className="text-sm text-danger">
            {mutationErrorMessage(mutation.error, 'สร้างไม่สำเร็จ')}
          </p>
        ) : null}

        {success ? (
          <p className="text-sm text-success" role="status">
            สร้างแล้ว
          </p>
        ) : null}
      </CardBody>
    </Card>
  );
}
