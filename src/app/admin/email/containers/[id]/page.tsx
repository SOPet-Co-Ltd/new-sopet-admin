'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { HiArrowLeft } from 'react-icons/hi2';
import { PageHeader } from '@/components/ui/card';
import {
  EmailContainerForm,
  type EmailContainerFormValues,
} from '@/components/admin/email/email-container-form';
import { useEmailContainer, useUpdateEmailContainer } from '@/hooks/useEmailCms';
import { getErrorMessage } from '@/lib/api/errors';

export default function AdminEmailContainerEditPage() {
  const params = useParams<{ id: string }>();
  const { data: container, isLoading, error } = useEmailContainer(params.id);
  const updateMutation = useUpdateEmailContainer();

  async function handleSubmit(values: EmailContainerFormValues) {
    await updateMutation.mutateAsync({ id: params.id, input: values });
  }

  if (isLoading) {
    return (
      <div className="py-20 text-center text-sm text-muted-foreground" aria-busy="true">
        กำลังโหลด...
      </div>
    );
  }

  if (error || !container) {
    return (
      <div className="mx-auto max-w-3xl">
        <PageHeader title="ไม่พบคอนเทนเนอร์" />
        <p role="alert" className="text-sm text-danger">
          {getErrorMessage(error, 'ไม่พบคอนเทนเนอร์นี้')}
        </p>
        <Link
          href="/admin/email/containers"
          className="mt-4 inline-flex items-center gap-1 text-sm text-brand hover:underline"
        >
          <HiArrowLeft className="size-3.5" aria-hidden="true" />
          กลับไปรายการคอนเทนเนอร์
        </Link>
      </div>
    );
  }

  return (
    <EmailContainerForm
      container={container}
      title={`แก้ไขคอนเทนเนอร์ · ${container.name}`}
      isPending={updateMutation.isPending}
      onSubmit={handleSubmit}
    />
  );
}
