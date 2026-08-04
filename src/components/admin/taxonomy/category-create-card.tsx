'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { ImageUploadField } from '@/components/ui/image-upload-field';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { isApiError } from '@/lib/api/errors';
import { useCreateCategory } from '@/hooks/useTaxonomy';
import { proposeTaxonomySchema, type ProposeTaxonomyFormValues } from '@/lib/validations';

function mutationErrorMessage(error: unknown, fallback: string): string {
  if (isApiError(error)) return error.message;
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

export function CategoryCreateCard() {
  const [success, setSuccess] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [imageError, setImageError] = useState<string | null>(null);
  const createCategory = useCreateCategory();

  const form = useForm<ProposeTaxonomyFormValues>({
    resolver: zodResolver(proposeTaxonomySchema),
    defaultValues: { name: '' },
  });

  async function onSubmit(values: ProposeTaxonomyFormValues) {
    try {
      await createCategory.mutateAsync({
        name: values.name,
        ...(imageUrl.trim() ? { imageUrl: imageUrl.trim() } : {}),
      });
      form.reset();
      setImageUrl('');
      setImageError(null);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      // surfaced via mutation state
    }
  }

  return (
    <Card>
      <CardHeader className="space-y-1">
        <h2 className="font-display font-medium text-balance text-ink">สร้างหมวดหมู่</h2>
        <p className="text-sm text-pretty text-muted-foreground">
          หมวดหมู่ที่สร้างโดยผู้ดูแลจะได้รับการอนุมัติทันที รูปภาพจำเป็นสำหรับการแสดงบนหน้าร้าน
        </p>
      </CardHeader>
      <CardBody className="space-y-4">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="cat-name" required>
              ชื่อหมวดหมู่
            </Label>
            <Input
              id="cat-name"
              placeholder="เช่น อาหารสัตว์"
              aria-invalid={!!form.formState.errors.name}
              aria-describedby={form.formState.errors.name ? 'cat-name-error' : undefined}
              {...form.register('name')}
              className="mt-1.5"
            />
            {form.formState.errors.name ? (
              <p id="cat-name-error" role="alert" className="mt-1 text-xs text-danger">
                {form.formState.errors.name.message}
              </p>
            ) : null}
          </div>
          <ImageUploadField
            label="รูปภาพหมวดหมู่ (ไม่บังคับ)"
            value={imageUrl}
            onChange={(url) => {
              setImageUrl(url);
              setImageError(null);
            }}
            folder="categories"
            showUrl={false}
            disabled={createCategory.isPending}
            error={imageError ?? undefined}
          />
          <Button
            type="submit"
            disabled={createCategory.isPending}
            aria-busy={createCategory.isPending}
          >
            {createCategory.isPending ? 'กำลังสร้าง...' : 'สร้าง'}
          </Button>
        </form>
        {createCategory.error ? (
          <p role="alert" className="text-sm text-danger">
            {mutationErrorMessage(createCategory.error, 'สร้างไม่สำเร็จ')}
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
