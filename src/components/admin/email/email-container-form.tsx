'use client';

import { useState } from 'react';
import Link from 'next/link';
import { HiArrowLeft } from 'react-icons/hi2';
import { Card, CardBody, PageHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { EmailContentSlotHint } from '@/components/admin/email/email-content-slot-hint';
import { EmailHtmlDeveloperEditor } from '@/components/admin/email/email-html-developer-editor';
import { EmailLiveSaveBar } from '@/components/admin/email/email-live-save-bar';
import { EmailSafeHtmlGuidance } from '@/components/admin/email/email-safe-html-guidance';
import { EmailValidationAlert } from '@/components/admin/email/email-validation-alert';
import type { EmailContainer } from '@/lib/api/email-cms';
import { validateContainerShell } from '@/lib/email-cms/validation';
import { getErrorMessage } from '@/lib/api/errors';

export type EmailContainerFormValues = {
  name: string;
  htmlShell: string;
  isDefault: boolean;
};

export function EmailContainerForm({
  container,
  title,
  isPending,
  onSubmit,
}: {
  container?: EmailContainer;
  title: string;
  isPending: boolean;
  onSubmit: (values: EmailContainerFormValues) => Promise<void>;
}) {
  const [name, setName] = useState(container?.name ?? '');
  const [htmlShell, setHtmlShell] = useState(container?.htmlShell ?? '');
  const [isDefault, setIsDefault] = useState(container?.isDefault ?? false);
  const [errors, setErrors] = useState<string[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [isDirty, setIsDirty] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setErrors([]);

    const clientErrors: string[] = [];
    if (!name.trim()) {
      clientErrors.push('กรุณากรอกชื่อคอนเทนเนอร์');
    }
    const shellValidation = validateContainerShell(htmlShell);
    clientErrors.push(...shellValidation.errors);

    if (clientErrors.length > 0) {
      setErrors(clientErrors);
      return;
    }

    try {
      await onSubmit({ name: name.trim(), htmlShell, isDefault });
      setIsDirty(false);
      setWarnings(container?.warnings ?? []);
    } catch (error) {
      setErrors([getErrorMessage(error, 'บันทึกคอนเทนเนอร์ไม่สำเร็จ')]);
    }
  }

  const contentSlotErrorFocused = errors.some((message) => message.includes('{{{content}}}'));

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title={title}
        back={
          <Link
            href="/admin/email/containers"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-brand"
          >
            <HiArrowLeft className="size-3.5" aria-hidden="true" />
            กลับไปรายการคอนเทนเนอร์
          </Link>
        }
      />

      <Card>
        <CardBody>
          <form
            onSubmit={(event) => {
              void handleSubmit(event);
            }}
            noValidate
            aria-busy={isPending}
            className="space-y-6"
          >
            <div>
              <Label htmlFor="email-container-name" required>
                ชื่อคอนเทนเนอร์
              </Label>
              <Input
                id="email-container-name"
                value={name}
                onChange={(event) => {
                  setName(event.target.value);
                  setIsDirty(true);
                }}
                placeholder="เช่น Sopet Default"
                className="mt-1.5"
              />
            </div>

            <label
              htmlFor="email-container-is-default"
              className="flex w-fit cursor-pointer items-center gap-3 rounded-xl border border-border bg-surface/60 px-4 py-3 transition-colors hover:bg-surface"
            >
              <input
                id="email-container-is-default"
                type="checkbox"
                className="h-4 w-4 rounded border-border accent-brand"
                checked={isDefault}
                onChange={(event) => {
                  setIsDefault(event.target.checked);
                  setIsDirty(true);
                }}
              />
              <span className="text-sm font-medium text-ink">ตั้งเป็นคอนเทนเนอร์ค่าเริ่มต้น</span>
            </label>

            <EmailSafeHtmlGuidance />
            <EmailContentSlotHint error={contentSlotErrorFocused} />

            <EmailHtmlDeveloperEditor
              id="email-container-html-shell"
              label="HTML โครงคอนเทนเนอร์"
              value={htmlShell}
              onChange={(value) => {
                setHtmlShell(value);
                setIsDirty(true);
              }}
              minHeight={320}
              required
              invalid={errors.length > 0}
              describedById="email-container-form-errors"
            />

            <div id="email-container-form-errors">
              <EmailValidationAlert errors={errors} warnings={warnings} />
            </div>

            <EmailLiveSaveBar
              isPending={isPending}
              disabled={!isDirty && !!container}
              onCancelHref="/admin/email/containers"
            />
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
