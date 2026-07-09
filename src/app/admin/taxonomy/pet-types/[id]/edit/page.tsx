'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { HiArrowLeft } from 'react-icons/hi2';
import { useForm } from 'react-hook-form';
import { ConfirmDeleteButton } from '@/components/ui/confirm-delete-button';
import { Button } from '@/components/ui/button';
import { Card, CardBody, PageHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useApprovedPetTypes, useDeletePetType, useUpdatePetType } from '@/hooks/useTaxonomy';
import { isApiError } from '@/lib/api/errors';
import { labelTaxonomyStatus } from '@/lib/i18n/th';
import { proposeTaxonomySchema, type ProposeTaxonomyFormValues } from '@/lib/validations';

export default function EditPetTypePage() {
  const params = useParams<{ id: string }>();
  const petTypeId = params.id;
  const router = useRouter();
  const { data: petTypes = [], isLoading, error } = useApprovedPetTypes();
  const petType = petTypes.find((item) => item.id === petTypeId);
  const updatePetType = useUpdatePetType();
  const deletePetType = useDeletePetType();

  const form = useForm<ProposeTaxonomyFormValues>({
    resolver: zodResolver(proposeTaxonomySchema),
    defaultValues: { name: '' },
  });

  useEffect(() => {
    if (petType) {
      form.reset({ name: petType.name });
    }
  }, [petType, form]);

  const isPending = updatePetType.isPending || deletePetType.isPending;

  async function onSubmit(values: ProposeTaxonomyFormValues) {
    if (!petType) return;
    try {
      await updatePetType.mutateAsync({ petTypeId: petType.id, name: values.name.trim() });
      router.push('/admin/taxonomy');
    } catch (err) {
      form.setError('name', {
        message: isApiError(err) ? err.message : 'บันทึกไม่สำเร็จ',
      });
    }
  }

  if (isLoading) {
    return <p className="text-muted">กำลังโหลด...</p>;
  }

  if (error || !petType) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-danger">
          {error instanceof Error ? error.message : 'ไม่พบประเภทสัตว์เลี้ยง'}
        </p>
        <Button variant="outline" asChild>
          <Link href="/admin/taxonomy">กลับ</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        title="แก้ไขประเภทสัตว์เลี้ยง"
        description={`${petType.slug} · ${labelTaxonomyStatus(petType.status)}`}
        back={
          <Link
            href="/admin/taxonomy"
            className="inline-flex items-center gap-1 text-sm text-muted transition-colors hover:text-brand"
          >
            <HiArrowLeft className="size-4" aria-hidden="true" />
            กลับ
          </Link>
        }
      />

      <Card>
        <CardBody>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <Label htmlFor="pet-type-name" required>
                ชื่อประเภทสัตว์เลี้ยง
              </Label>
              <Input
                id="pet-type-name"
                placeholder="เช่น สุนัข"
                aria-invalid={!!form.formState.errors.name}
                aria-describedby={form.formState.errors.name ? 'pet-type-name-error' : undefined}
                {...form.register('name')}
                className="mt-1.5"
                disabled={isPending}
              />
              {form.formState.errors.name ? (
                <p id="pet-type-name-error" role="alert" className="mt-1 text-xs text-danger">
                  {form.formState.errors.name.message}
                </p>
              ) : null}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
              <div className="flex gap-3">
                <Button type="button" variant="outline" asChild disabled={isPending}>
                  <Link href="/admin/taxonomy">ยกเลิก</Link>
                </Button>
                <Button type="submit" disabled={isPending} aria-busy={isPending}>
                  {updatePetType.isPending ? 'กำลังบันทึก...' : 'บันทึก'}
                </Button>
              </div>
              <ConfirmDeleteButton
                confirmLabel={petType.name}
                title="ลบประเภทสัตว์เลี้ยง"
                variant="destructive"
                size="default"
                disabled={isPending}
                isDeleting={deletePetType.isPending}
                onConfirm={async () => {
                  await deletePetType.mutateAsync({ id: petType.id });
                  router.push('/admin/taxonomy');
                }}
              />
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
