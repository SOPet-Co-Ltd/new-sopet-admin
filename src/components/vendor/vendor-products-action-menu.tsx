'use client';

import Link from 'next/link';
import { useState, type HTMLAttributes } from 'react';
import { HiEllipsisHorizontal } from 'react-icons/hi2';
import { Button } from '@/components/ui/button';
import { ConfirmDeleteDialog } from '@/components/ui/confirm-delete-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export interface VendorProductsActionMenuProps {
  productId: string;
  productName: string;
  isDeleting?: boolean;
  onDelete: () => Promise<void>;
  editPrefetchHandlers?: Pick<HTMLAttributes<HTMLAnchorElement>, 'onMouseEnter' | 'onFocus'>;
}

export function VendorProductsActionMenu({
  productId,
  productName,
  isDeleting = false,
  onDelete,
  editPrefetchHandlers,
}: VendorProductsActionMenuProps) {
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <>
      <div
        className="flex justify-end"
        onClick={(event) => event.stopPropagation()}
        onKeyDown={(event) => event.stopPropagation()}
      >
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={`การดำเนินการ ${productName}`}
            >
              <HiEllipsisHorizontal className="size-5" aria-hidden="true" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/vendor/products/${productId}/edit`} {...editPrefetchHandlers}>
                แก้ไข
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/vendor/products/${productId}/stock`}>แก้ไขสต็อก</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/vendor/products/${productId}/variants`}>แก้ไขตัวเลือก</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-danger focus:text-danger"
              disabled={isDeleting}
              onSelect={() => setDeleteOpen(true)}
            >
              ลบ
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <ConfirmDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="ลบสินค้า"
        confirmLabel={productName}
        isDeleting={isDeleting}
        onConfirm={onDelete}
      />
    </>
  );
}
