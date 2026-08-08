'use client';

import { useRouter } from 'next/navigation';
import type { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import type { EmailContentTemplate } from '@/lib/api/email-cms';
import { formatDateTime } from '@/lib/utils';

export function EmailContentTemplatesTable({ templates }: { templates: EmailContentTemplate[] }) {
  const router = useRouter();

  const columns: ColumnDef<EmailContentTemplate, unknown>[] = [
    {
      accessorKey: 'name',
      header: 'ชื่อเทมเพลต',
      cell: ({ row }) => (
        <div className="min-w-0">
          <p className="font-medium text-ink">{row.original.name}</p>
          <p className="font-mono text-xs text-muted-foreground">{row.original.key}</p>
        </div>
      ),
    },
    {
      accessorKey: 'enabled',
      header: 'สถานะ',
      cell: ({ row }) =>
        row.original.enabled ? (
          <Badge status="published">ใช้งาน</Badge>
        ) : (
          <Badge status="draft" title="ส่งจริงจะใช้เทมเพลตสำรองในระบบ">
            ปิดใช้งาน (ส่งด้วยเทมเพลตสำรองในระบบ)
          </Badge>
        ),
    },
    {
      id: 'container',
      header: 'คอนเทนเนอร์',
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">{row.original.container.name}</span>
      ),
      meta: { className: 'hidden md:table-cell' },
    },
    {
      accessorKey: 'updatedAt',
      header: 'แก้ไขล่าสุด',
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {formatDateTime(row.original.updatedAt)}
        </span>
      ),
      meta: { className: 'hidden sm:table-cell' },
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <div className="flex justify-end">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={(event) => {
              event.stopPropagation();
              router.push(`/admin/email/templates/${row.original.key}`);
            }}
          >
            แก้ไข
          </Button>
        </div>
      ),
      meta: { className: 'text-right' },
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={templates}
      emptyMessage="ยังไม่มีเทมเพลต"
      onRowClick={(row) => router.push(`/admin/email/templates/${row.key}`)}
    />
  );
}
