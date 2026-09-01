'use client';

import { useRouter } from 'next/navigation';
import type { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import type { EmailContainer } from '@/lib/api/email-cms';
import { formatDateTime } from '@/lib/utils';

export function EmailContainersTable({ containers }: { containers: EmailContainer[] }) {
  const router = useRouter();

  const columns: ColumnDef<EmailContainer, unknown>[] = [
    {
      accessorKey: 'name',
      header: 'ชื่อคอนเทนเนอร์',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <span className="font-medium text-ink">{row.original.name}</span>
          {row.original.isDefault ? <Badge status="published">ค่าเริ่มต้น</Badge> : null}
        </div>
      ),
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
              router.push(`/admin/email/containers/${row.original.id}`);
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
      data={containers}
      emptyMessage="ยังไม่มีคอนเทนเนอร์"
      onRowClick={(row) => router.push(`/admin/email/containers/${row.id}`)}
    />
  );
}
