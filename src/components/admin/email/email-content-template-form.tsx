'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { HiArrowLeft, HiEye, HiOutlineInformationCircle, HiPaperAirplane } from 'react-icons/hi2';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/toast';
import { EmailAllowedPlaceholdersPanel } from '@/components/admin/email/email-allowed-placeholders-panel';
import { EmailContainerPicker } from '@/components/admin/email/email-container-picker';
import { EmailHtmlDeveloperEditor } from '@/components/admin/email/email-html-developer-editor';
import { EmailPreviewModal } from '@/components/admin/email/email-preview-modal';
import { EmailSampleVarsForm } from '@/components/admin/email/email-sample-vars-form';
import { EmailValidationAlert } from '@/components/admin/email/email-validation-alert';
import type {
  EmailContainer,
  EmailContentTemplate,
  EmailPreviewResult,
  UpdateEmailContentTemplateInput,
} from '@/lib/api/email-cms';
import { validateContentTemplateField } from '@/lib/email-cms/validation';
import { cn } from '@/lib/utils';

function AsideSection({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        'rounded-xl border border-border bg-card px-4 py-4 shadow-[var(--shadow-card)]',
        className,
      )}
    >
      <header className="mb-3">
        <h2 className="text-sm font-semibold text-ink">{title}</h2>
        {description ? (
          <p className="mt-0.5 text-xs text-muted-foreground text-pretty">{description}</p>
        ) : null}
      </header>
      {children}
    </section>
  );
}

export function EmailContentTemplateForm({
  template,
  containers,
  containersLoading,
  isSaving,
  onSave,
  onPreview,
  isPreviewing,
  onSendTest,
  isSendingTest,
}: {
  template: EmailContentTemplate;
  containers: EmailContainer[];
  containersLoading?: boolean;
  isSaving: boolean;
  onSave: (input: UpdateEmailContentTemplateInput) => Promise<void>;
  onPreview: (buffers: {
    subjectTemplate: string;
    bodyHtml: string;
    containerId: string;
    variablesJson: string;
  }) => Promise<EmailPreviewResult>;
  isPreviewing: boolean;
  onSendTest: (input: {
    toEmail: string;
    subjectTemplate: string;
    bodyHtml: string;
    containerId: string;
    variablesJson: string;
  }) => Promise<boolean>;
  isSendingTest: boolean;
}) {
  const { show } = useToast();
  const [name, setName] = useState(template.name);
  const [subjectTemplate, setSubjectTemplate] = useState(template.subjectTemplate);
  const [bodyHtml, setBodyHtml] = useState(template.bodyHtml);
  const [containerId, setContainerId] = useState(template.containerId);
  const [enabled, setEnabled] = useState(template.enabled);
  const [sampleVars, setSampleVars] = useState<Record<string, string>>(() =>
    Object.fromEntries(template.allowedPlaceholders.map((p) => [p.name, p.sample])),
  );
  const [testEmail, setTestEmail] = useState('');
  const [isDirty, setIsDirty] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [preview, setPreview] = useState<EmailPreviewResult | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [previewStale, setPreviewStale] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [testSendError, setTestSendError] = useState<string | null>(null);

  const allowedNames = useMemo(
    () => template.allowedPlaceholders.map((p) => p.name),
    [template.allowedPlaceholders],
  );

  function markDirty() {
    setIsDirty(true);
    setPreviewStale(true);
  }

  function insertPlaceholder(placeholderName: string) {
    const token = `{{${placeholderName}}}`;
    setBodyHtml((current) => {
      if (!current) {
        return token;
      }
      const needsSpace = !/\s$/.test(current);
      return `${current}${needsSpace ? '\n' : ''}${token}`;
    });
    markDirty();
  }

  async function handleRefreshPreview() {
    setPreviewError(null);
    try {
      const result = await onPreview({
        subjectTemplate,
        bodyHtml,
        containerId,
        variablesJson: JSON.stringify(sampleVars),
      });
      setPreview(result);
      setPreviewStale(false);
      return result;
    } catch (error) {
      setPreviewError(error instanceof Error ? error.message : 'สร้างตัวอย่างไม่สำเร็จ');
      return null;
    }
  }

  async function handleOpenPreview() {
    setPreviewOpen(true);
    if (!preview || previewStale) {
      await handleRefreshPreview();
    }
  }

  async function handleSendTest() {
    setTestSendError(null);
    const to = testEmail.trim();
    if (!to || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
      setTestSendError('กรุณากรอกอีเมลปลายทางให้ถูกต้อง');
      return;
    }
    if (!containerId) {
      setTestSendError('กรุณาเลือกคอนเทนเนอร์ก่อนส่งทดสอบ');
      return;
    }

    try {
      await onSendTest({
        toEmail: to,
        subjectTemplate,
        bodyHtml,
        containerId,
        variablesJson: JSON.stringify(sampleVars),
      });
      show(`ส่งอีเมลทดสอบไปที่ ${to} แล้ว (หัวข้อขึ้นต้นด้วย [ทดสอบ])`, 'success');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'ส่งอีเมลทดสอบไม่สำเร็จ';
      setTestSendError(message);
      show(message, 'error');
    }
  }

  async function handleSave() {
    setErrors([]);

    const clientErrors: string[] = [];
    if (!name.trim()) {
      clientErrors.push('กรุณากรอกชื่อเทมเพลต');
    }

    const subjectValidation = validateContentTemplateField(subjectTemplate, allowedNames, {
      required: true,
    });
    const bodyValidation = validateContentTemplateField(bodyHtml, allowedNames, {
      required: true,
    });
    clientErrors.push(...subjectValidation.errors, ...bodyValidation.errors);

    if (!containerId) {
      clientErrors.push('กรุณาเลือกคอนเทนเนอร์');
    }

    if (clientErrors.length > 0) {
      setErrors(clientErrors);
      return;
    }

    try {
      await onSave({
        name: name.trim(),
        subjectTemplate,
        bodyHtml,
        containerId,
        enabled,
      });
      setIsDirty(false);
    } catch (error) {
      setErrors([error instanceof Error ? error.message : 'บันทึกเทมเพลตไม่สำเร็จ']);
    }
  }

  const saveDisabled = !isDirty || isSaving;

  return (
    <div className="pb-10">
      <div className="sticky top-0 z-20 -mx-4 mb-6 border-b border-border bg-background/95 px-4 py-3 backdrop-blur-sm sm:-mx-6 sm:px-6">
        <div className="mb-2">
          <Link
            href="/admin/email/templates"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-brand"
          >
            <HiArrowLeft className="size-3.5" aria-hidden="true" />
            กลับไปรายการเทมเพลต
          </Link>
        </div>

        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-display text-xl font-semibold text-ink sm:text-2xl text-balance">
                {name.trim() || template.name}
              </h1>
              <Badge className="font-mono uppercase tracking-wide">{template.key}</Badge>
              <Badge status={enabled ? 'published' : 'draft'}>
                {enabled ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
              </Badge>
              {isDirty ? (
                <Badge status="archived" className="border-warning-text/20">
                  ยังไม่บันทึก
                </Badge>
              ) : null}
            </div>
            <p className="text-xs text-muted-foreground">
              บันทึกแล้วมีผลทันที — ไม่มีสถานะแบบร่าง/เผยแพร่
            </p>
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                void handleOpenPreview();
              }}
              disabled={isPreviewing || !containerId}
              aria-busy={isPreviewing}
            >
              <HiEye className="size-4" aria-hidden="true" />
              {isPreviewing ? 'กำลังสร้าง...' : 'ดูตัวอย่าง'}
            </Button>
            <Button
              type="button"
              disabled={saveDisabled}
              aria-busy={isSaving}
              onClick={() => {
                void handleSave();
              }}
            >
              {isSaving ? 'กำลังบันทึก...' : 'บันทึก'}
            </Button>
          </div>
        </div>
      </div>

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0 space-y-5 rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-card)] sm:p-6">
          <div>
            <Label htmlFor="email-template-subject" required>
              หัวข้ออีเมล
            </Label>
            <Input
              id="email-template-subject"
              value={subjectTemplate}
              onChange={(event) => {
                setSubjectTemplate(event.target.value);
                markDirty();
              }}
              className="mt-1.5 font-mono text-sm"
              placeholder="เช่น ยืนยันอีเมล Sopet"
            />
          </div>

          <details className="group rounded-lg border border-border bg-surface/40 open:bg-surface/60">
            <summary className="flex cursor-pointer list-none items-center gap-2 px-3 py-2.5 text-sm text-muted-foreground marker:content-none [&::-webkit-details-marker]:hidden">
              <HiOutlineInformationCircle
                className="size-4 shrink-0 text-info-text"
                aria-hidden="true"
              />
              <span className="font-medium text-ink">แนวทาง HTML ที่รองรับอีเมล</span>
              <span className="ml-auto text-xs text-muted-foreground group-open:hidden">แสดง</span>
              <span className="ml-auto hidden text-xs text-muted-foreground group-open:inline">
                ซ่อน
              </span>
            </summary>
            <ul className="space-y-1.5 border-t border-border px-3 py-3 pl-9 text-sm text-muted-foreground">
              <li>
                ใช้โครงสร้าง <code className="font-mono text-ink">&lt;table&gt;</code> และ inline
                styles
              </li>
              <li>
                ห้าม <code className="font-mono text-ink">&lt;script&gt;</code> / ฟอร์มรีโมต / event
                handlers
              </li>
              <li>
                คลิกตัวแปรด้านขวาเพื่อแทรก <code className="font-mono text-ink">{'{{…}}'}</code>{' '}
                ลงในเนื้อหา
              </li>
            </ul>
          </details>

          <EmailHtmlDeveloperEditor
            id="email-template-body"
            label="HTML เนื้อหา"
            value={bodyHtml}
            onChange={(value) => {
              setBodyHtml(value);
              markDirty();
            }}
            minHeight={480}
            required
            invalid={errors.length > 0}
            describedById="email-template-form-errors"
          />

          <div id="email-template-form-errors">
            <EmailValidationAlert errors={errors} warnings={template.warnings} />
          </div>
        </div>

        <aside className="space-y-4 xl:sticky xl:top-[7.5rem] xl:self-start">
          <AsideSection title="การตั้งค่า" description="ชื่อ การเปิดใช้ และโครงอีเมล">
            <div className="space-y-4">
              <div>
                <Label htmlFor="email-template-name" required>
                  ชื่อเทมเพลต
                </Label>
                <Input
                  id="email-template-name"
                  value={name}
                  onChange={(event) => {
                    setName(event.target.value);
                    markDirty();
                  }}
                  className="mt-1.5"
                />
              </div>

              <label
                htmlFor="email-template-enabled"
                className="flex cursor-pointer items-start gap-3 rounded-lg border border-border bg-surface/50 px-3 py-3 transition-colors hover:bg-surface"
              >
                <input
                  id="email-template-enabled"
                  type="checkbox"
                  role="switch"
                  aria-checked={enabled}
                  className="mt-0.5 h-4 w-4 rounded border-border accent-brand"
                  checked={enabled}
                  onChange={(event) => {
                    setEnabled(event.target.checked);
                    markDirty();
                  }}
                />
                <span className="min-w-0">
                  <span className="block text-sm font-medium text-ink">เปิดใช้เทมเพลตนี้</span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">
                    {enabled
                      ? 'ส่งจริงใช้เนื้อหานี้จากฐานข้อมูล'
                      : 'ส่งจริงจะใช้เทมเพลตสำรองในระบบ (ไม่ลบข้อมูล)'}
                  </span>
                </span>
              </label>

              <EmailContainerPicker
                id="email-template-container"
                containers={containers}
                value={containerId}
                onChange={(value) => {
                  setContainerId(value);
                  markDirty();
                }}
                isLoading={containersLoading}
                disabled={isSaving}
              />
            </div>
          </AsideSection>

          <AsideSection title="ตัวแปร" description="คลิกเพื่อแทรกเข้าเนื้อหา HTML">
            <EmailAllowedPlaceholdersPanel
              placeholders={template.allowedPlaceholders}
              onInsert={insertPlaceholder}
              hideTitle
            />
          </AsideSection>

          <AsideSection
            title="ตัวอย่างและส่งทดสอบ"
            description="ใส่ค่าตัวอย่าง ดูผลลัพธ์ หรือส่งอีเมลจริงไปยังที่อยู่อีเมล"
          >
            <div className="space-y-4">
              <EmailSampleVarsForm
                placeholders={template.allowedPlaceholders}
                values={sampleVars}
                dense
                onChange={(varName, value) => {
                  setSampleVars((current) => ({ ...current, [varName]: value }));
                  setPreviewStale(true);
                }}
              />
              {previewError && !previewOpen ? (
                <p role="alert" className="text-sm text-danger">
                  {previewError}
                </p>
              ) : null}
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => {
                  void handleOpenPreview();
                }}
                disabled={isPreviewing || !containerId}
                aria-busy={isPreviewing}
              >
                <HiEye className="size-4" aria-hidden="true" />
                {isPreviewing ? 'กำลังสร้างตัวอย่าง...' : 'ดูตัวอย่างอีเมล'}
              </Button>

              <div className="space-y-2 border-t border-border pt-4">
                <Label htmlFor="email-template-test-to" required>
                  ส่งทดสอบไปที่อีเมล
                </Label>
                <Input
                  id="email-template-test-to"
                  type="email"
                  autoComplete="email"
                  value={testEmail}
                  onChange={(event) => {
                    setTestEmail(event.target.value);
                    setTestSendError(null);
                  }}
                  placeholder="you@example.com"
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  ส่งอีเมลจริงผ่าน Resend โดยใช้เนื้อหาที่กำลังแก้ไขและค่าตัวอย่างด้านบน
                  (หัวข้อขึ้นต้นด้วย [ทดสอบ])
                </p>
                {testSendError ? (
                  <p role="alert" className="text-sm text-danger">
                    {testSendError}
                  </p>
                ) : null}
                <Button
                  type="button"
                  className="w-full"
                  onClick={() => {
                    void handleSendTest();
                  }}
                  disabled={isSendingTest || !containerId || !testEmail.trim()}
                  aria-busy={isSendingTest}
                >
                  <HiPaperAirplane className="size-4" aria-hidden="true" />
                  {isSendingTest ? 'กำลังส่ง...' : 'ส่งอีเมลทดสอบ'}
                </Button>
              </div>
            </div>
          </AsideSection>
        </aside>
      </div>

      <EmailPreviewModal
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        subject={preview?.subject ?? subjectTemplate}
        html={preview?.html ?? null}
        isLoading={isPreviewing}
        error={previewError}
        isDirty={previewStale}
        missingPlaceholders={preview?.missingPlaceholders}
        isRefreshing={isPreviewing}
        onRefresh={() => {
          void handleRefreshPreview();
        }}
      />
    </div>
  );
}
