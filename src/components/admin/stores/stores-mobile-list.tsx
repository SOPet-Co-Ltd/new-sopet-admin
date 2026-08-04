import Link from 'next/link';
import { useQueryClient } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  createDetailPrefetchHandlers,
  prefetchAdminStoreDetail,
} from '@/lib/react-query/prefetch-dashboard-nav';
import { cn, formatDate } from '@/lib/utils';
import type { AdminStore } from '@/types';

type StoresMobileListProps = {
  stores: AdminStore[];
  onStoreClick: (store: AdminStore) => void;
  getStatusBadge: (store: AdminStore) => { label: string; className: string };
};

export function StoresMobileList({ stores, onStoreClick, getStatusBadge }: StoresMobileListProps) {
  const queryClient = useQueryClient();

  return (
    <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card shadow-[var(--shadow-card)] md:hidden">
      {stores.map((store) => {
        const statusBadge = getStatusBadge(store);
        const ownerName = store.ownerFullName;
        const ownerEmail = store.ownerEmail;

        return (
          <li key={store.id}>
            <div
              role="button"
              tabIndex={0}
              aria-label={`ดูรายละเอียด ${store.name}`}
              className="flex cursor-pointer items-start gap-3 px-4 py-3.5 transition-colors duration-200 ease-out hover:bg-surface/80 focus-visible:bg-surface/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand/40 motion-reduce:transition-none"
              onClick={() => onStoreClick(store)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  onStoreClick(store);
                }
              }}
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-ink">{store.name}</p>
                    <p className="truncate text-sm text-muted-foreground">{store.slug}</p>
                  </div>
                  <Badge className={cn('mt-0.5 shrink-0', statusBadge.className)}>
                    {statusBadge.label}
                  </Badge>
                </div>
                <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
                  <div className="col-span-2 min-w-0">
                    <dt className="text-muted-foreground">เจ้าของ</dt>
                    <dd className="truncate text-ink">
                      {ownerName || ownerEmail || '—'}
                      {ownerName && ownerEmail ? (
                        <span className="block truncate text-muted-foreground">{ownerEmail}</span>
                      ) : null}
                    </dd>
                  </div>
                  <div className="col-span-2 min-w-0">
                    <dt className="text-muted-foreground">สร้างเมื่อ</dt>
                    <dd className="text-ink">
                      {store.createdAt ? formatDate(store.createdAt) : '—'}
                    </dd>
                  </div>
                </dl>
                <div
                  className="mt-3 flex justify-end"
                  onClick={(event) => event.stopPropagation()}
                  onKeyDown={(event) => event.stopPropagation()}
                >
                  <Button size="sm" variant="outline" asChild className="h-8">
                    <Link
                      href={`/admin/stores/${store.id}`}
                      {...createDetailPrefetchHandlers(() =>
                        prefetchAdminStoreDetail(queryClient, store.id),
                      )}
                    >
                      แก้ไข
                    </Link>
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
