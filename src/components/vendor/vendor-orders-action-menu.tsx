'use client';

import { type RefObject, useRef } from 'react';
import { HiEllipsisHorizontal, HiDocumentText, HiLink } from 'react-icons/hi2';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export interface VendorOrdersActionMenuProps {
  orderId: string;
  orderNumber: string;
  onViewDetails: (orderId: string) => void;
  onCopyTrackingLink: (orderNumber: string) => void;
  menuTriggerRef: RefObject<HTMLElement | null>;
}

export function VendorOrdersActionMenu({
  orderId,
  orderNumber,
  onViewDetails,
  onCopyTrackingLink,
  menuTriggerRef,
}: VendorOrdersActionMenuProps) {
  const triggerRef = useRef<HTMLButtonElement>(null);

  function handleCopyTrackingLink() {
    if (menuTriggerRef && triggerRef.current) {
      menuTriggerRef.current = triggerRef.current;
    }
    onCopyTrackingLink(orderNumber);
  }

  return (
    <div
      className="flex justify-end"
      onClick={(event) => event.stopPropagation()}
      onKeyDown={(event) => event.stopPropagation()}
    >
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button
            ref={triggerRef}
            type="button"
            variant="ghost"
            size="icon"
            className="size-11 shrink-0 rounded-full text-muted-foreground hover:bg-surface hover:text-ink"
            aria-label={`การดำเนินการ ${orderNumber}`}
          >
            <HiEllipsisHorizontal className="size-5" aria-hidden="true" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-44">
          <DropdownMenuItem onSelect={() => onViewDetails(orderId)} className="gap-2">
            <HiDocumentText className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            ดูรายละเอียด
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={handleCopyTrackingLink} className="gap-2">
            <HiLink className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            คัดลอกลิงก์ติดตาม
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
