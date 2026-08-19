'use client';

import Link from 'next/link';
import { HiRectangleGroup } from 'react-icons/hi2';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/ui/card';
import { EmailContainersTable } from '@/components/admin/email/email-containers-table';
import { useEmailContainers } from '@/hooks/useEmailCms';
import { getErrorMessage } from '@/lib/api/errors';

function ContainersListSkeleton() {
  return (
    <div
      className="space-y-2 rounded-xl border border-border bg-white p-4"
      aria-busy="true"
      aria-label="กำลังโหลดคอนเทนเนอร์"
    >
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className="h-10 animate-pulse rounded bg-surface motion-reduce:animate-none"
        />
      ))}
      <span className="sr-only">กำลังโหลดคอนเทนเนอร์...</span>
    </div>
  );
}

function ContainersEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-white px-6 py-14 text-center">
      <div
        className="flex size-12 items-center justify-center rounded-full bg-surface text-muted-foreground"
        aria-hidden="true"
      >
        <HiRectangleGroup className="size-6" />
      </div>
      <p className="mt-4 font-medium text-ink">ยังไม่มีคอนเทนเนอร์</p>
      <Button type="button" asChild className="mt-4">
        <Link href="/admin/email/containers/new">สร้างคอนเทนเนอร์</Link>
      </Button>
    </div>
  );
}

export default function AdminEmailContainersPage() {
  const { data: containers = [], isLoading, error, refetch } = useEmailContainers();

  return (
    <div>
      <PageHeader
        title="คอนเทนเนอร์อีเมล"
        description="จัดการโครงหัว–ท้าย (brand chrome) ที่ใช้ร่วมกับเทมเพลตธุรกรรม"
        action={
          <Button type="button" asChild>
            <Link href="/admin/email/containers/new">สร้างคอนเทนเนอร์</Link>
          </Button>
        }
      />

      {error ? (
        <div className="mb-4 flex items-center justify-between gap-4 rounded-lg border border-danger/20 bg-danger-bg px-4 py-3 text-sm text-danger">
          <span role="alert">{getErrorMessage(error, 'โหลดรายการไม่สำเร็จ')}</span>
          <Button type="button" size="sm" variant="outline" onClick={() => void refetch()}>
            ลองอีกครั้ง
          </Button>
        </div>
      ) : null}

      {!error ? (
        <p className="mb-3 text-sm text-muted-foreground" aria-live="polite">
          {isLoading ? 'กำลังโหลดรายการ...' : `${containers.length.toLocaleString('th-TH')} รายการ`}
        </p>
      ) : null}

      {isLoading ? <ContainersListSkeleton /> : null}

      {!isLoading && !error && containers.length === 0 ? <ContainersEmptyState /> : null}

      {!isLoading && !error && containers.length > 0 ? (
        <EmailContainersTable containers={containers} />
      ) : null}
    </div>
  );
}
