'use client';

import { type RefObject, useRef } from 'react';
import { HiEllipsisHorizontal } from 'react-icons/hi2';
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
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          ref={triggerRef}
          type="button"
          variant="ghost"
          size="icon"
          aria-label={`การดำเนินการ ${orderNumber}`}
        >
          <HiEllipsisHorizontal className="size-5" aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onSelect={() => onViewDetails(orderId)}>ดูรายละเอียด</DropdownMenuItem>
        <DropdownMenuItem onSelect={handleCopyTrackingLink}>คัดลอกลิงก์ติดตาม</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
