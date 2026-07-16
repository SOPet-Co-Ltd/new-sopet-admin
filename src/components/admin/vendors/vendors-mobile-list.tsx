import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { labelUserRole } from '@/lib/i18n/th';
import { cn, formatDate } from '@/lib/utils';
import type { AdminVendor } from '@/types';

type VendorsMobileListProps = {
  vendors: AdminVendor[];
  onVendorClick: (vendor: AdminVendor) => void;
  getStatusBadge: (vendor: AdminVendor) => { label: string; className: string };
};

export function VendorsMobileList({
  vendors,
  onVendorClick,
  getStatusBadge,
}: VendorsMobileListProps) {
  return (
    <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card shadow-[var(--shadow-card)] md:hidden">
      {vendors.map((vendor) => {
        const statusBadge = getStatusBadge(vendor);
        const storeCount = vendor.storeCount ?? 0;

        return (
          <li key={vendor.id}>
            <div
              role="button"
              tabIndex={0}
              aria-label={`ดูรายละเอียด ${vendor.fullName}`}
              className="flex cursor-pointer items-start gap-3 px-4 py-3.5 transition-colors duration-200 ease-out hover:bg-surface/80 focus-visible:bg-surface/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand/40 motion-reduce:transition-none"
              onClick={() => onVendorClick(vendor)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  onVendorClick(vendor);
                }
              }}
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-ink">{vendor.fullName}</p>
                    <p className="truncate text-sm text-muted-foreground">{vendor.email}</p>
                  </div>
                  <Badge className={cn('mt-0.5', statusBadge.className)}>{statusBadge.label}</Badge>
                </div>
                <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
                  <div className="min-w-0">
                    <dt className="text-muted-foreground">บทบาท</dt>
                    <dd className="truncate text-ink">{labelUserRole(vendor.role)}</dd>
                  </div>
                  <div className="min-w-0">
                    <dt className="text-muted-foreground">ร้านค้า</dt>
                    <dd className="tabular-nums text-ink">{storeCount.toLocaleString('th-TH')}</dd>
                  </div>
                  <div className="col-span-2 min-w-0">
                    <dt className="text-muted-foreground">สมัครเมื่อ</dt>
                    <dd className="text-ink">
                      {vendor.createdAt ? formatDate(vendor.createdAt) : '—'}
                    </dd>
                  </div>
                </dl>
                <div
                  className="mt-3 flex justify-end"
                  onClick={(event) => event.stopPropagation()}
                  onKeyDown={(event) => event.stopPropagation()}
                >
                  <Button size="sm" variant="outline" asChild className="h-8">
                    <Link href={`/admin/vendors/${vendor.id}`}>แก้ไข</Link>
                  </Button>
                </div>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
