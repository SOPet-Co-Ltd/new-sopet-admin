'use client';

import { useRouter } from 'next/navigation';
import {
  EmailContainerForm,
  type EmailContainerFormValues,
} from '@/components/admin/email/email-container-form';
import { useCreateEmailContainer } from '@/hooks/useEmailCms';

export default function AdminEmailContainerCreatePage() {
  const router = useRouter();
  const createMutation = useCreateEmailContainer();

  async function handleSubmit(values: EmailContainerFormValues) {
    const container = await createMutation.mutateAsync(values);
    router.push(`/admin/email/containers/${container.id}`);
  }

  return (
    <EmailContainerForm
      title="สร้างคอนเทนเนอร์"
      isPending={createMutation.isPending}
      onSubmit={handleSubmit}
    />
  );
}
