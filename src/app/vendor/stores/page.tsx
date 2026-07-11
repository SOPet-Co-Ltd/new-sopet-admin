'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  HiArrowRight,
  HiBuildingStorefront,
  HiPlus,
  HiSparkles,
  HiUserGroup,
} from 'react-icons/hi2';
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
      className="flex size-12 shrink-0 items-center justify-center rounded-xl border border-brand/15 bg-brand-tint font-display text-lg font-semibold text-brand"
    >
      {initial}
    </div>
  );
}

function StoreCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <CardBody className="space-y-4 p-5">
        <div className="flex items-start gap-4">
          <div className="size-12 animate-pulse rounded-xl bg-surface" />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="h-5 w-2/3 animate-pulse rounded bg-surface" />
            <div className="h-4 w-1/2 animate-pulse rounded bg-surface" />
          </div>
        </div>
        <div className="h-9 animate-pulse rounded-lg bg-surface" />
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

  const primaryLabel = isSuspended ? 'ถูกระงับ' : isActive ? 'เข้าแดชบอร์ด' : 'เลือกร้านนี้';

  return (
    <Card
      className={cn(
        'group overflow-hidden transition-all duration-200',
        isActive && !isSuspended && 'ring-2 ring-brand/35 shadow-[var(--shadow-elevated)]',
        !isSuspended && 'hover:-translate-y-0.5 hover:shadow-[var(--shadow-elevated)]',
        isSuspended && 'opacity-90',
      )}
    >
      <CardBody className="flex h-full flex-col gap-4 p-5">
        <div className="flex items-start gap-4">
          <StoreAvatar name={store.name} logoUrl={store.logoUrl} />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="truncate font-medium text-ink">{store.name}</h3>
              {isActive && !isSuspended ? (
                <Badge className="bg-brand-tint text-brand">ใช้งานอยู่</Badge>
              ) : null}
            </div>
            <p className="mt-0.5 truncate text-sm text-muted">{store.slug}</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <Badge className="border border-border bg-white text-muted">
                {labelMembershipRole(membershipRole)}
              </Badge>
              {isSuspended ? (
                <Badge className="bg-danger/10 text-danger">{labelStoreStatus('suspended')}</Badge>
              ) : store.status !== 'approved' ? (
                <Badge className="bg-warning-bg text-warning-text">
                  {labelStoreStatus(store.status)}
                </Badge>
              ) : null}
            </div>
          </div>
        </div>

        {store.description ? (
          <p className="line-clamp-2 text-sm text-muted">{store.description}</p>
        ) : (
          <p className="text-sm text-muted/80">
            {isOwner
              ? 'ร้านของคุณ — จัดการสินค้า คำสั่งซื้อ และทีมได้เต็มรูปแบบ'
              : 'ร้านที่คุณเข้าร่วมเป็นสมาชิกทีม'}
          </p>
        )}

        {isSuspended ? (
          <p className="text-xs leading-relaxed text-danger">
            {canManage
              ? 'ร้านถูกระงับชั่วคราว — ส่งคำขอเปิดใช้งานเพื่อให้ทีมงานตรวจสอบ'
              : 'ร้านถูกระงับ — ติดต่อเจ้าของร้านหรือผู้จัดการ'}
          </p>
        ) : null}

        <div className="mt-auto flex flex-wrap gap-2 pt-1">
          {isSuspended && canManage ? (
            <Button type="button" size="sm" variant="outline" asChild className="flex-1">
              <Link href={`/vendor/reactivation?storeId=${store.id}`}>ส่งคำขอเปิดใช้งาน</Link>
            </Button>
          ) : null}
          <Button
            type="button"
            size="sm"
            className={cn('gap-1.5', !isSuspended && 'flex-1')}
            disabled={isPending || isSuspended}
            aria-busy={isPending}
            onClick={onSelect}
          >
            {primaryLabel}
            {!isSuspended ? <HiArrowRight className="size-4" aria-hidden="true" /> : null}
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
      className={cn(
        'inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors',
        active
          ? 'border-brand bg-brand text-white'
          : 'border-border bg-white text-muted hover:border-brand/30 hover:text-ink',
      )}
    >
      {label}
      <span
        className={cn(
          'rounded-full px-1.5 py-0.5 text-xs',
          active ? 'bg-white/20 text-white' : 'bg-surface text-muted',
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
    <Card className="overflow-hidden border-brand/20 bg-gradient-to-br from-brand-tint/80 via-white to-white">
      <CardBody className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <StoreAvatar name={store.name} logoUrl={store.logoUrl} />
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-brand">
              ร้านที่เลือกอยู่
            </p>
            <h2 className="font-display text-xl font-semibold text-ink">{store.name}</h2>
            <p className="mt-0.5 text-sm text-muted">
              {labelMembershipRole(membershipRole)} · {store.slug}
            </p>
          </div>
        </div>
        <Button
          type="button"
          className="gap-2 self-start sm:self-center"
          onClick={onEnter}
          disabled={isPending}
        >
          เข้าแดชบอร์ด
          <HiArrowRight className="size-4" aria-hidden="true" />
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
    <div className="space-y-8">
      <PageHeader
        title="ร้านค้าของฉัน"
        description="เลือกร้านเพื่อจัดการ หรือขอเปิดร้านใหม่บนแพลตฟอร์ม"
        action={
          <Button type="button" className="gap-2" onClick={handleOpenStoreRequest}>
            <HiPlus className="size-4" aria-hidden="true" />
            ขอเปิดร้านใหม่
          </Button>
        }
      />

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <StoreCardSkeleton key={index} />
          ))}
        </div>
      ) : null}

      {error ? (
        <Card className="border-danger/20 bg-danger-bg/40">
          <CardBody>
            <p className="text-sm text-danger">
              {error instanceof Error ? error.message : 'โหลดร้านค้าไม่สำเร็จ'}
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
        <Card className="border-dashed">
          <CardBody className="flex flex-col items-center gap-4 px-6 py-12 text-center">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-brand-tint text-brand">
              <HiBuildingStorefront className="size-7" aria-hidden="true" />
            </div>
            <div className="max-w-md space-y-1">
              <h2 className="font-display text-lg font-semibold text-ink">ยังไม่มีร้านค้า</h2>
              <p className="text-sm text-muted">
                เริ่มต้นด้วยการส่งคำขอเปิดร้าน — เมื่อได้รับการอนุมัติ
                คุณจะจัดการสินค้าและคำสั่งซื้อได้ที่นี่
              </p>
            </div>
            <Button type="button" onClick={handleOpenStoreRequest}>
              ขอเปิดร้านแรกของคุณ
            </Button>
          </CardBody>
        </Card>
      ) : null}

      {!isLoading && myStores.length > 0 ? (
        <section className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-display text-lg font-medium text-ink">ร้านทั้งหมด</h2>
              <p className="text-sm text-muted">
                {myStores.length} ร้าน · เลือกร้านเพื่อสลับบริบทการทำงาน
              </p>
            </div>
            {showFilters ? (
              <div className="flex flex-wrap gap-2">
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

          {switchMutation.error ? (
            <p className="text-sm text-danger">{getErrorMessage(switchMutation.error)}</p>
          ) : null}
        </section>
      ) : null}

      <section className="space-y-6 border-t border-border pt-8">
        <div className="flex items-center gap-2">
          <HiSparkles className="size-5 text-brand" aria-hidden="true" />
          <h2 className="font-display text-lg font-medium text-ink">เครื่องมือเพิ่มเติม</h2>
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted">
              <HiBuildingStorefront className="size-4" aria-hidden="true" />
              <span>คำขอเปิดร้าน</span>
            </div>
            <StoreRequestSection
              open={requestOpen}
              onOpenChange={setRequestOpen}
              showTrigger={false}
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted">
              <HiUserGroup className="size-4" aria-hidden="true" />
              <span>เสนอหมวดหมู่และแท็ก</span>
            </div>
            <TaxonomyProposalsSection />
          </div>
        </div>
      </section>
    </div>
  );
}
