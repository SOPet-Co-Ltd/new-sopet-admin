'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { HiArrowLeft } from 'react-icons/hi2';
import { PageHeader } from '@/components/ui/card';
import { EmailContentTemplateForm } from '@/components/admin/email/email-content-template-form';
import {
  useEmailContainers,
  useEmailContentTemplateByKey,
  usePreviewEmailContentTemplate,
  useSendTestEmailContentTemplate,
  useUpdateEmailContentTemplate,
} from '@/hooks/useEmailCms';
import { EmailTemplateKey } from '@/lib/graphql/generated/graphql';
import { getErrorMessage } from '@/lib/api/errors';

const VALID_KEYS = new Set<string>(Object.values(EmailTemplateKey));

function NotFound({ message }: { message: string }) {
  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="ไม่พบเทมเพลต" />
      <p role="alert" className="text-sm text-danger">
        {message}
      </p>
      <Link
        href="/admin/email/templates"
        className="mt-4 inline-flex items-center gap-1 text-sm text-brand hover:underline"
      >
        <HiArrowLeft className="size-3.5" aria-hidden="true" />
        กลับไปรายการเทมเพลต
      </Link>
    </div>
  );
}

export default function AdminEmailTemplateEditPage() {
  const params = useParams<{ key: string }>();
  const isValidKey = VALID_KEYS.has(params.key);
  const key = isValidKey ? (params.key as EmailTemplateKey) : undefined;

  const { data: template, isLoading, error } = useEmailContentTemplateByKey(key);
  const { data: containers = [], isLoading: containersLoading } = useEmailContainers();
  const updateMutation = useUpdateEmailContentTemplate();
  const previewMutation = usePreviewEmailContentTemplate();
  const sendTestMutation = useSendTestEmailContentTemplate();

  if (!isValidKey) {
    return <NotFound message={`ไม่รู้จักคีย์เทมเพลต "${params.key}"`} />;
  }

  if (isLoading) {
    return (
      <div className="py-20 text-center text-sm text-muted-foreground" aria-busy="true">
        กำลังโหลดเทมเพลต...
      </div>
    );
  }

  if (error || !template) {
    return (
      <NotFound message={getErrorMessage(error, 'ไม่พบเทมเพลตสำหรับคีย์นี้')} />
    );
  }

  return (
    <EmailContentTemplateForm
      template={template}
      containers={containers}
      containersLoading={containersLoading}
      isSaving={updateMutation.isPending}
      onSave={(input) => updateMutation.mutateAsync({ id: template.id, input }).then(() => {})}
      isPreviewing={previewMutation.isPending}
      onPreview={(buffers) =>
        previewMutation.mutateAsync({
          key: template.key,
          subjectTemplate: buffers.subjectTemplate,
          bodyHtml: buffers.bodyHtml,
          containerId: buffers.containerId,
          variablesJson: buffers.variablesJson,
        })
      }
      isSendingTest={sendTestMutation.isPending}
      onSendTest={(input) =>
        sendTestMutation.mutateAsync({
          key: template.key,
          toEmail: input.toEmail,
          subjectTemplate: input.subjectTemplate,
          bodyHtml: input.bodyHtml,
          containerId: input.containerId,
          variablesJson: input.variablesJson,
        })
      }
    />
  );
}
