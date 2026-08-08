'use client';

import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/ui/card';
import { EmailContentTemplatesTable } from '@/components/admin/email/email-content-templates-table';
import { useEmailContentTemplates } from '@/hooks/useEmailCms';

function TemplatesListSkeleton() {
  return (
    <div
      className="space-y-2 rounded-xl border border-border bg-white p-4"
      aria-busy="true"
      aria-label="กำลังโหลดเทมเพลตอีเมล"
    >
      {Array.from({ length: 8 }).map((_, index) => (
        <div
          key={index}
          className="h-10 animate-pulse rounded bg-surface motion-reduce:animate-none"
        />
      ))}
      <span className="sr-only">กำลังโหลดเทมเพลตอีเมล...</span>
    </div>
  );
}

export default function AdminEmailTemplatesPage() {
  const { data: templates = [], isLoading, error, refetch } = useEmailContentTemplates();

  return (
    <div>
      <PageHeader
        title="เทมเพลตอีเมลธุรกรรม"
        description="แก้ไขหัวข้อและเนื้อหา HTML ตามเส้นทางส่งอีเมลทั้ง 8 รายการ"
      />

      {error ? (
        <div className="mb-4 flex items-center justify-between gap-4 rounded-lg border border-danger/20 bg-danger-bg px-4 py-3 text-sm text-danger">
          <span role="alert">{error instanceof Error ? error.message : 'โหลดรายการไม่สำเร็จ'}</span>
          <Button type="button" size="sm" variant="outline" onClick={() => void refetch()}>
            ลองอีกครั้ง
          </Button>
        </div>
      ) : null}

      {!error ? (
        <p className="mb-3 text-sm text-muted-foreground" aria-live="polite">
          {isLoading ? 'กำลังโหลดรายการ...' : `${templates.length.toLocaleString('th-TH')} รายการ`}
        </p>
      ) : null}

      {isLoading ? <TemplatesListSkeleton /> : null}

      {!isLoading && !error && templates.length === 0 ? (
        <p className="rounded-xl border border-border bg-white px-6 py-14 text-center text-sm text-muted-foreground">
          ยังไม่มีเทมเพลต — กรุณารันการติดตั้งฐานข้อมูล (migrations) ที่ฝั่งเซิร์ฟเวอร์
        </p>
      ) : null}

      {!isLoading && !error && templates.length > 0 ? (
        <EmailContentTemplatesTable templates={templates} />
      ) : null}
    </div>
  );
}
