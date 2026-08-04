'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { TaxonomyDeleteButton } from '@/components/admin/taxonomy/taxonomy-delete-button';
import type { TaxonomyDeleteKind } from '@/components/admin/taxonomy/taxonomy-delete-dialog';
import { TableSkeleton } from '@/components/admin/taxonomy/taxonomy-hub-primitives';
import { Button } from '@/components/ui/button';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { DataTable, SortableHeader } from '@/components/ui/data-table';
import type { TaxonomyItem } from '@/types';

function taxonomyEditHref(kind: TaxonomyDeleteKind, id: string): string | null {
  if (kind === 'category') return `/admin/taxonomy/categories/${id}/edit`;
  if (kind === 'tag') return `/admin/taxonomy/tags/${id}/edit`;
  if (kind === 'petType') return `/admin/taxonomy/pet-types/${id}/edit`;
  if (kind === 'brand') return `/admin/taxonomy/brands/${id}/edit`;
  return null;
}

export interface ApprovedTaxonomyTableProps {
  title: string;
  items: TaxonomyItem[];
  kind: TaxonomyDeleteKind;
  showImage?: boolean;
  disabled?: boolean;
  isLoading?: boolean;
}

export function ApprovedTaxonomyTable({
  title,
  items,
  kind,
  showImage = false,
  disabled = false,
  isLoading = false,
}: ApprovedTaxonomyTableProps) {
  const columns = useMemo<ColumnDef<TaxonomyItem>[]>(() => {
    const cols: ColumnDef<TaxonomyItem>[] = [];

    if (showImage) {
      cols.push({
        id: 'image',
        header: 'รูปภาพ',
        cell: ({ row }) => {
          const url = row.original.imageUrl;
          return url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={url}
              alt={row.original.name}
              className="h-10 w-10 rounded-md border border-border object-cover"
            />
          ) : (
            <span className="text-xs text-muted">—</span>
          );
        },
        meta: { className: 'w-16' },
      });
    }

    cols.push(
      {
        accessorKey: 'name',
        header: ({ column }) => <SortableHeader column={column}>ชื่อ</SortableHeader>,
        cell: ({ row }) => <span className="font-medium text-ink">{row.original.name}</span>,
      },
      {
        accessorKey: 'slug',
        header: ({ column }) => <SortableHeader column={column}>Slug</SortableHeader>,
        cell: ({ row }) => <span className="text-sm text-muted">{row.original.slug}</span>,
        meta: { className: 'hidden md:table-cell' },
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => {
          const editHref = taxonomyEditHref(kind, row.original.id);
          return (
            <div className="flex justify-end gap-2">
              {editHref ? (
                <Button variant="outline" size="sm" asChild disabled={disabled}>
                  <Link href={editHref}>แก้ไข</Link>
                </Button>
              ) : null}
              <TaxonomyDeleteButton item={row.original} kind={kind} disabled={disabled} />
            </div>
          );
        },
      },
    );

    return cols;
  }, [disabled, kind, showImage]);

  return (
    <Card>
      <CardHeader>
        <h2 className="font-display font-medium text-balance text-ink">
          {title}
          {!isLoading ? (
            <span
              aria-hidden="true"
              className="ml-1.5 text-base font-normal text-muted-foreground tabular-nums"
            >
              ({items.length.toLocaleString('th-TH')})
            </span>
          ) : null}
        </h2>
      </CardHeader>
      <CardBody className="space-y-3">
        {isLoading ? (
          <TableSkeleton rows={showImage ? 5 : 4} />
        ) : (
          <DataTable columns={columns} data={items} emptyMessage="ยังไม่มีรายการที่อนุมัติ" />
        )}
      </CardBody>
    </Card>
  );
}
