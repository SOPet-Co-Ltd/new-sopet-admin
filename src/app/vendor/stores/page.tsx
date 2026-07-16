'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { HiArrowRight, HiBuildingStorefront, HiPlus } from 'react-icons/hi2';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardBody, PageHeader } from '@/components/ui/card';
import { StoreRequestSection } from '@/components/vendor/store-request-section';
import { TaxonomyProposalsSection } from '@/components/vendor/taxonomy-proposals-section';
import { useMyStores } from '@/hooks/useMyStores';
import { useSwitchStore } from '@/hooks/useSwitchStore';
import { useVendorStoreId } from '@/hooks/useVendorStoreId';
import { getErrorMessage } from '@/lib/api/errors';
import { labelMembershipRole, labelStoreStatus } from '@/lib/i18n/th';
import { vendorHasStores } from '@/lib/vendor/vendor-store-access';
import { cn } from '@/lib/utils';
import type { VendorStore } from '@/types';

type StoreFilter = 'all' | 'owned' | 'joined';

function StoreAvatar({ name, logoUrl }: { name: string; logoUrl?: string }) {
  const initial = name.trim().charAt(0).toUpperCase() || 'ร';

  if (logoUrl) {
    return (
      <div className="relative size-12 shrink-0 overflow-hidden rounded-xl border border-border bg-surface">
        <Image src={logoUrl} alt="" fill className="object-cover" sizes="48px" />
      </div>
    );
  }

  return (
    <div
      aria-hidden="true"
      className="flex size-12 shrink-0 items-center justify-center rounded-xl border border-border bg-surface font-display text-lg font-semibold text-ink"
    >
      {initial}
    </div>
  );
}

function StoreCardSkeleton() {
  return (
    <Card className="overflow-hidden" aria-hidden="true">
      <CardBody className="space-y-4 p-5">
        <div className="flex items-start gap-4">
          <div className="size-12 animate-pulse rounded-xl bg-brand-tint motion-reduce:animate-none" />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="h-5 w-2/3 animate-pulse rounded bg-brand-tint motion-reduce:animate-none" />
            <div className="h-4 w-1/2 animate-pulse rounded bg-surface motion-reduce:animate-none" />
          </div>
        </div>
        <div className="h-9 animate-pulse rounded-lg bg-surface motion-reduce:animate-none" />
      </CardBody>
    </Card>
  );
}

function StorePickerCard({
  entry,
  isActive,
  onSelect,
  isPending,
}: {
  entry: VendorStore;
  isActive: boolean;
  onSelect: () => void;
  isPending: boolean;
}) {
  const { store, membershipRole } = entry;
  const isSuspended = store.status === 'suspended';
  const canManage = membershipRole === 'owner' || membershipRole === 'manager';
  const isOwner = membershipRole === 'owner';

  const primaryLabel = isSuspended
    ? 'ถูกระงับ'
    : isPending
      ? 'กำลังสลับ...'
      : isActive
        ? 'เข้าแดชบอร์ด'
        : 'เลือกร้านนี้';

  return (
    <Card
      className={cn(
        'group overflow-hidden transition-[border-color,box-shadow] duration-150 ease-out',
        isActive && !isSuspended && 'border-brand/40 ring-1 ring-brand/25',
        !isSuspended && 'hover:border-brand/25',
        isSuspended && 'opacity-90',
      )}
    >
      <CardBody className="flex h-full flex-col gap-4 p-5">
        <div className="flex items-start gap-4">
          <StoreAvatar name={store.name} logoUrl={store.logoUrl} />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="truncate text-balance font-medium text-ink">{store.name}</h3>
              {isActive && !isSuspended ? (
                <Badge className="bg-brand-tint text-brand">ใช้งานอยู่</Badge>
              ) : null}
            </div>
            <p className="mt-0.5 truncate text-sm text-muted-foreground">{store.slug}</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <Badge className="border border-border bg-white text-muted-foreground">
                {labelMembershipRole(membershipRole)}
              </Badge>
              {isSuspended ? (
                <Badge className="bg-danger-bg text-danger">{labelStoreStatus('suspended')}</Badge>
              ) : store.status !== 'approved' ? (
                <Badge className="bg-warning-bg text-warning-text">
                  {labelStoreStatus(store.status)}
                </Badge>
              ) : null}
            </div>
          </div>
        </div>

        {store.description ? (
          <p className="line-clamp-2 text-sm text-muted-foreground text-pretty">
            {store.description}
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">
            {isOwner
              ? 'ร้านของคุณ — จัดการสินค้า คำสั่งซื้อ และทีมได้เต็มรูปแบบ'
              : 'ร้านที่คุณเข้าร่วมเป็นสมาชิกทีม'}
          </p>
        )}

        {isSuspended ? (
          <p className="text-sm leading-relaxed text-danger" role="status">
            {canManage
              ? 'ร้านถูกระงับชั่วคราว — ส่งคำขอเปิดใช้งานเพื่อให้ทีมงานตรวจสอบ'
              : 'ร้านถูกระงับ — ติดต่อเจ้าของร้านหรือผู้จัดการ'}
          </p>
        ) : null}

        <div className="mt-auto flex flex-wrap gap-2 pt-1">
          {isSuspended && canManage ? (
            <Button type="button" size="sm" variant="outline" asChild className="min-h-9 flex-1">
              <Link href={`/vendor/reactivation?storeId=${store.id}`}>ส่งคำขอเปิดใช้งาน</Link>
            </Button>
          ) : null}
          <Button
            type="button"
            size="sm"
            variant={isActive && !isSuspended ? 'outline' : 'default'}
            className={cn('min-h-9 gap-1.5', !isSuspended && 'flex-1')}
            disabled={isPending || isSuspended}
            aria-busy={isPending}
            onClick={onSelect}
          >
            {primaryLabel}
            {!isSuspended && !isPending ? (
              <HiArrowRight className="size-4" aria-hidden="true" />
            ) : null}
          </Button>
        </div>
      </CardBody>
    </Card>
  );
}

function FilterChip({
  active,
  label,
  count,
  onClick,
}: {
  active: boolean;
  label: string;
  count: number;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'inline-flex min-h-9 items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40',
        active
          ? 'border-brand bg-brand-tint text-brand'
          : 'border-border bg-white text-muted-foreground hover:border-brand/30 hover:text-ink',
      )}
    >
      {label}
      <span
        className={cn(
          'rounded-full px-1.5 py-0.5 text-xs tabular-nums',
          active ? 'bg-brand/15 text-brand' : 'bg-surface text-muted-foreground',
        )}
      >
        {count}
      </span>
    </button>
  );
}

function ActiveStoreSpotlight({
  entry,
  onEnter,
  isPending,
}: {
  entry: VendorStore;
  onEnter: () => void;
  isPending: boolean;
}) {
  const { store, membershipRole } = entry;

  return (
    <Card className="overflow-hidden border-border bg-card">
      <CardBody className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <StoreAvatar name={store.name} logoUrl={store.logoUrl} />
          <div>
            <p className="text-sm font-medium text-muted-foreground">ร้านที่เลือกอยู่</p>
            <h2 className="text-balance font-display text-xl font-medium text-ink">{store.name}</h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {labelMembershipRole(membershipRole)} · {store.slug}
            </p>
          </div>
        </div>
        <Button
          type="button"
          className="min-h-9 gap-2 self-start sm:self-center"
          onClick={onEnter}
          disabled={isPending}
          aria-busy={isPending}
        >
          {isPending ? 'กำลังเปิด...' : 'เข้าแดชบอร์ด'}
          {!isPending ? <HiArrowRight className="size-4" aria-hidden="true" /> : null}
        </Button>
      </CardBody>
    </Card>
  );
}

export default function VendorStoresPage() {
  const router = useRouter();
  const activeStoreId = useVendorStoreId();
  const { data: myStores = [], isLoading, error } = useMyStores();
  const switchMutation = useSwitchStore();
  const [filter, setFilter] = useState<StoreFilter>('all');
  const [requestOpen, setRequestOpen] = useState(false);

  const ownedStores = useMemo(
    () => myStores.filter((entry) => entry.membershipRole === 'owner'),
    [myStores],
  );
  const joinedStores = useMemo(
    () => myStores.filter((entry) => entry.membershipRole !== 'owner'),
    [myStores],
  );

  const filteredStores = useMemo(() => {
    if (filter === 'owned') return ownedStores;
    if (filter === 'joined') return joinedStores;
    return myStores;
  }, [filter, joinedStores, myStores, ownedStores]);

  const activeStore = useMemo(
    () => myStores.find((entry) => entry.store.id === activeStoreId),
    [activeStoreId, myStores],
  );

  const showFilters = ownedStores.length > 0 && joinedStores.length > 0;
  const hasStores = vendorHasStores(myStores);

  function handleSelectStore(storeId: string) {
    const entry = myStores.find((item) => item.store.id === storeId);
    if (entry?.store.status === 'suspended') return;

    if (storeId === activeStoreId) {
      router.push('/vendor');
      return;
    }

    switchMutation.mutate(storeId, {
      onSuccess: () => router.push('/vendor'),
    });
  }

  function handleOpenStoreRequest() {
    setRequestOpen(true);
  }

  return (
    <div>
      <PageHeader
        title="ร้านค้าของฉัน"
        description="เลือกร้านเพื่อจัดการ หรือขอเปิดร้านใหม่บนแพลตฟอร์ม"
        action={
          <Button type="button" className="min-h-9 gap-2" onClick={handleOpenStoreRequest}>
            <HiPlus className="size-4" aria-hidden="true" />
            ขอเปิดร้านใหม่
          </Button>
        }
      />

      <div className="space-y-8">
        {isLoading ? (
          <div
            className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
            aria-busy="true"
            aria-label="กำลังโหลดร้านค้า"
          >
            {Array.from({ length: 3 }).map((_, index) => (
              <StoreCardSkeleton key={index} />
            ))}
          </div>
        ) : null}

        {error ? (
          <Card className="border-danger/20 bg-danger-bg/40" role="alert">
            <CardBody className="space-y-3">
              <p className="text-sm text-danger">
                {error instanceof Error ? error.message : 'โหลดร้านค้าไม่สำเร็จ'}
              </p>
              <p className="text-sm text-muted-foreground">
                ลองรีเฟรชหน้า หรือตรวจสอบการเชื่อมต่อแล้วลองอีกครั้ง
              </p>
            </CardBody>
          </Card>
        ) : null}

        {!isLoading && activeStore && activeStore.store.status !== 'suspended' ? (
          <ActiveStoreSpotlight
            entry={activeStore}
            onEnter={() => handleSelectStore(activeStore.store.id)}
            isPending={switchMutation.isPending}
          />
        ) : null}

        {!isLoading && myStores.length === 0 ? (
          <Card className="border-dashed border-border bg-surface/60 shadow-none">
            <CardBody className="flex flex-col items-center gap-4 px-6 py-12 text-center">
              <div className="flex size-14 items-center justify-center rounded-2xl border border-border bg-card text-ink">
                <HiBuildingStorefront className="size-7" aria-hidden="true" />
              </div>
              <div className="max-w-md space-y-1">
                <h2 className="text-balance font-display text-lg font-medium text-ink">
                  ยังไม่มีร้านค้า
                </h2>
                <p className="text-sm text-muted-foreground text-pretty">
                  เริ่มต้นด้วยการส่งคำขอเปิดร้าน — เมื่อได้รับการอนุมัติ
                  คุณจะจัดการสินค้าและคำสั่งซื้อได้ที่นี่
                </p>
              </div>
              <Button type="button" className="min-h-9" onClick={handleOpenStoreRequest}>
                ขอเปิดร้านแรกของคุณ
              </Button>
            </CardBody>
          </Card>
        ) : null}

        {!isLoading && myStores.length > 0 ? (
          <section className="space-y-4" aria-labelledby="all-stores-heading">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 id="all-stores-heading" className="font-display text-lg font-medium text-ink">
                  ร้านทั้งหมด
                </h2>
                <p className="text-sm text-muted-foreground">
                  {myStores.length} ร้าน · เลือกร้านเพื่อสลับบริบทการทำงาน
                </p>
              </div>
              {showFilters ? (
                <div className="flex flex-wrap gap-2" role="group" aria-label="กรองร้านตามสิทธิ์">
                  <FilterChip
                    active={filter === 'all'}
                    label="ทั้งหมด"
                    count={myStores.length}
                    onClick={() => setFilter('all')}
                  />
                  <FilterChip
                    active={filter === 'owned'}
                    label="ของฉัน"
                    count={ownedStores.length}
                    onClick={() => setFilter('owned')}
                  />
                  <FilterChip
                    active={filter === 'joined'}
                    label="ที่เข้าร่วม"
                    count={joinedStores.length}
                    onClick={() => setFilter('joined')}
                  />
                </div>
              ) : null}
            </div>

            {filteredStores.length === 0 ? (
              <p className="text-sm text-muted-foreground" role="status">
                ไม่มีร้านในตัวกรองนี้
              </p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {filteredStores.map((entry) => (
                  <StorePickerCard
                    key={entry.store.id}
                    entry={entry}
                    isActive={entry.store.id === activeStoreId}
                    isPending={switchMutation.isPending}
                    onSelect={() => handleSelectStore(entry.store.id)}
                  />
                ))}
              </div>
            )}

            {switchMutation.error ? (
              <p className="text-sm text-danger" role="alert">
                {getErrorMessage(switchMutation.error)}
              </p>
            ) : null}
          </section>
        ) : null}

        <section
          className="space-y-6 border-t border-border pt-8"
          aria-labelledby="requests-heading"
        >
          <div>
            <h2 id="requests-heading" className="font-display text-lg font-medium text-ink">
              คำขอและการเสนอ
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              ติดตามคำขอเปิดร้าน และเสนอหมวดหมู่หรือแท็กใหม่ให้ทีมงานอนุมัติ
            </p>
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <StoreRequestSection
              open={requestOpen}
              onOpenChange={setRequestOpen}
              showTrigger={false}
            />

            {!isLoading && hasStores ? <TaxonomyProposalsSection /> : null}
          </div>
        </section>
      </div>
    </div>
  );
}
