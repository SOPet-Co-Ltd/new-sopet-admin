import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';
import type { AdminCustomer } from '@/types';

type CustomersMobileListProps = {
  customers: AdminCustomer[];
  onCustomerClick: (customer: AdminCustomer) => void;
  getDetailPrefetchHandlers: (customerId: string) => {
    onMouseEnter: () => void;
    onFocus: () => void;
  };
};

export function CustomersMobileList({
  customers,
  onCustomerClick,
  getDetailPrefetchHandlers,
}: CustomersMobileListProps) {
  return (
    <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card shadow-[var(--shadow-card)] md:hidden">
      {customers.map((customer) => {
        const displayName = customer.fullName?.trim() || customer.phone;
        const prefetchHandlers = getDetailPrefetchHandlers(customer.id);

        return (
          <li key={customer.id}>
            <div
              role="button"
              tabIndex={0}
              aria-label={`แก้ไข ${displayName}`}
              className="flex cursor-pointer items-start gap-3 px-4 py-3.5 transition-colors duration-200 ease-out hover:bg-surface/80 focus-visible:bg-surface/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand/40 motion-reduce:transition-none"
              onClick={() => onCustomerClick(customer)}
              onMouseEnter={prefetchHandlers.onMouseEnter}
              onFocus={prefetchHandlers.onFocus}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  onCustomerClick(customer);
                }
              }}
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-ink">{displayName}</p>
                    {customer.fullName?.trim() ? (
                      <p className="truncate text-sm text-muted-foreground">{customer.phone}</p>
                    ) : null}
                  </div>
                  <Badge
                    status={customer.isActive ? 'published' : 'draft'}
                    className="mt-0.5 shrink-0"
                  >
                    {customer.isActive ? 'ใช้งานอยู่' : 'ระงับ'}
                  </Badge>
                </div>
                <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
                  <div className="min-w-0">
                    <dt className="text-muted-foreground">อีเมล</dt>
                    <dd className="truncate text-ink">{customer.email || '—'}</dd>
                  </div>
                  <div className="min-w-0">
                    <dt className="text-muted-foreground">ยืนยัน</dt>
                    <dd className="text-ink">
                      {customer.isVerified ? 'ยืนยันแล้ว' : 'ยังไม่ยืนยัน'}
                    </dd>
                  </div>
                  <div className="min-w-0 col-span-2">
                    <dt className="text-muted-foreground">สมัครเมื่อ</dt>
                    <dd className="text-ink">
                      {customer.createdAt ? formatDate(customer.createdAt) : '—'}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
