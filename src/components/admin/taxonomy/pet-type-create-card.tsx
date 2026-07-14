'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { ImageUploadField } from '@/components/ui/image-upload-field';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCreatePetType } from '@/hooks/useTaxonomy';
import { proposeTaxonomySchema, type ProposeTaxonomyFormValues } from '@/lib/validations';

export function PetTypeCreateCard() {
  const [success, setSuccess] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const createPetType = useCreatePetType();

  const form = useForm<ProposeTaxonomyFormValues>({
    resolver: zodResolver(proposeTaxonomySchema),
    defaultValues: { name: '' },
  });

  async function onSubmit(values: ProposeTaxonomyFormValues) {
    try {
      await createPetType.mutateAsync({
        name: values.name,
        ...(imageUrl.trim() ? { imageUrl: imageUrl.trim() } : {}),
      });
      form.reset();
      setImageUrl('');
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      // surfaced via mutation state
    }
  }

  return (
    <Card>
      <CardHeader>
        <h2 className="font-display font-medium text-ink">สร้างประเภทสัตว์เลี้ยง</h2>
        <p className="mt-1 text-sm text-muted">
          ประเภทสัตว์เลี้ยงที่สร้างโดยผู้ดูแลจะได้รับการอนุมัติทันที
          รูปภาพจำเป็นสำหรับการแสดงบนหน้าร้าน
        </p>
      </CardHeader>
      <CardBody>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="pet-type-name" required>
              ชื่อประเภทสัตว์เลี้ยง
            </Label>
            <Input
              id="pet-type-name"
              placeholder="เช่น สุนัข, แมว"
              aria-invalid={!!form.formState.errors.name}
              aria-describedby={form.formState.errors.name ? 'pet-type-name-error' : undefined}
              {...form.register('name')}
              className="mt-1.5"
            />
            {form.formState.errors.name ? (
              <p id="pet-type-name-error" role="alert" className="mt-1 text-xs text-danger">
                {form.formState.errors.name.message}
              </p>
            ) : null}
          </div>
          <ImageUploadField
            label="รูปภาพประเภทสัตว์เลี้ยง (ไม่บังคับ)"
            value={imageUrl}
            onChange={(url) => setImageUrl(url)}
            folder="pet-types"
            showUrl={false}
            disabled={createPetType.isPending}
          />
          <Button
            type="submit"
            disabled={createPetType.isPending}
            aria-busy={createPetType.isPending}
          >
            {createPetType.isPending ? 'กำลังสร้าง...' : 'สร้าง'}
          </Button>
        </form>
        {createPetType.error ? (
          <p role="alert" className="mt-2 text-sm text-danger">
            {createPetType.error instanceof Error ? createPetType.error.message : 'สร้างไม่สำเร็จ'}
          </p>
        ) : null}
        {success ? <p className="mt-2 text-sm text-brand">สร้างแล้ว</p> : null}
      </CardBody>
    </Card>
  );
}
