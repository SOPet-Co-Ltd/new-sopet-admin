'use client';

import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type RowData,
  type SortingState,
} from '@tanstack/react-table';
import { useState, type ReactNode } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';

declare module '@tanstack/react-table' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> {
    /** Applied to both the header and body cells (e.g. `hidden md:table-cell`). */
    className?: string;
    /** Applied to the header cell only, in addition to `className`. */
    headerClassName?: string;
  }
}

interface DataTableProps<TData> {
  columns: ColumnDef<TData, unknown>[];
  data: TData[];
  emptyMessage?: string;
  className?: string;
}

export function DataTable<TData>({
  columns,
  data,
  emptyMessage = 'ไม่พบข้อมูล',
  className,
}: DataTableProps<TData>) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <div
      className={cn(
        'overflow-hidden rounded-xl border border-border bg-white shadow-[var(--shadow-card)]',
        className,
      )}
    >
      <Table className="min-w-[640px]">
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className="bg-surface/60 hover:bg-surface/60">
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  className={cn(
                    header.column.columnDef.meta?.className,
                    header.column.columnDef.meta?.headerClassName,
                  )}
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className={cell.column.columnDef.meta?.className}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-28 text-center text-muted">
                {emptyMessage}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

export function SortableHeader({
  column,
  children,
}: {
  column: { getToggleSortingHandler: () => unknown; getIsSorted: () => false | 'asc' | 'desc' };
  children: ReactNode;
}) {
  const sorted = column.getIsSorted();
  return (
    <button
      type="button"
      className="inline-flex items-center gap-1 transition-colors hover:text-brand"
      onClick={column.getToggleSortingHandler() as () => void}
    >
      {children}
      <span className="text-muted/70">
        {sorted === 'asc' ? '↑' : sorted === 'desc' ? '↓' : '↕'}
      </span>
    </button>
  );
}
