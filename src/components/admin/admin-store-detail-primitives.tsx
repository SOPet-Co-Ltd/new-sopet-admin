'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { HiArrowLeft, HiBuildingStorefront } from 'react-icons/hi2';
import { Badge } from '@/components/ui/badge';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { labelStoreStatus } from '@/lib/i18n/th';
import { cn } from '@/lib/utils';
import type { StoreStatus } from '@/types';

export function storeStatusBadgeClass(status: string): string | undefined {
  if (status === 'suspended') return 'bg-danger/10 text-danger';
  if (status === 'approved') return 'bg-success-bg text-success';
  if (status === 'pending') return 'bg-warning-bg text-warning-text';
  if (status === 'rejected') return 'bg-danger-bg text-danger';
  return undefined;
}

export function StoreStatusBadge({ status }: { status: StoreStatus | string }) {
  return <Badge className={storeStatusBadgeClass(status)}>{labelStoreStatus(status)}</Badge>;
}

function SkeletonBlock({ className }: { className?: string }) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-surface motion-reduce:animate-none', className)}
    />
  );
}

export function BackToStoresLink({ href = '/admin/stores' }: { href?: string }) {
  return (
    <Link
      href={href}
      className="inline-flex min-h-11 items-center gap-1.5 text-sm text-muted-foreground transition-colors duration-200 ease-out hover:text-brand focus-visible:text-brand motion-reduce:transition-none"
    >
      <HiArrowLeft className="size-3.5 shrink-0" aria-hidden="true" />
      กลับรายการร้านค้า
    </Link>
  );
}

export function StoreAvatar({ name, logoUrl }: { name: string; logoUrl?: string }) {
  if (logoUrl) {
    return (
      <div
        aria-hidden="true"
        className="size-16 shrink-0 overflow-hidden rounded-2xl border border-border bg-surface sm:size-20"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logoUrl} alt="" className="size-full object-cover" />
      </div>
    );
  }

  const initial = name.trim().charAt(0).toUpperCase() || 'ร';

  return (
    <div
      aria-hidden="true"
      className="flex size-16 shrink-0 items-center justify-center rounded-2xl border border-brand/15 bg-brand-tint font-display text-xl font-semibold text-brand sm:size-20 sm:text-2xl"
    >
      {initial}
    </div>
  );
}

export function StoreDetailRow({ label, children }: { label: ReactNode; children: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border pb-3 last:border-b-0 last:pb-0">
      <span className="shrink-0 text-muted-foreground">{label}</span>
      <span className="min-w-0 text-right font-medium break-words text-ink">{children}</span>
    </div>
  );
}

export function StoreDetailSkeleton() {
  return (
    <div className="space-y-8" aria-busy="true" aria-label="กำลังโหลดรายละเอียดร้านค้า">
      <div className="space-y-3">
        <SkeletonBlock className="h-4 w-36" />
        <SkeletonBlock className="h-8 w-64 max-w-full" />
        <SkeletonBlock className="h-4 w-40 max-w-full" />
      </div>
      <Card>
        <CardBody>
          <div className="flex gap-4">
            <SkeletonBlock className="size-16 shrink-0 rounded-2xl sm:size-20" />
            <div className="min-w-0 flex-1 space-y-2">
              <SkeletonBlock className="h-6 w-48 max-w-full" />
              <SkeletonBlock className="h-4 w-32 max-w-full" />
              <SkeletonBlock className="h-6 w-24" />
            </div>
          </div>
        </CardBody>
      </Card>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
        <Card>
          <CardHeader>
            <SkeletonBlock className="h-5 w-40" />
          </CardHeader>
          <CardBody className="space-y-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="space-y-2">
                <SkeletonBlock className="h-3.5 w-24" />
                <SkeletonBlock className="h-10 w-full" />
              </div>
            ))}
          </CardBody>
        </Card>
        <Card>
          <CardHeader>
            <SkeletonBlock className="h-5 w-32" />
          </CardHeader>
          <CardBody className="space-y-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <SkeletonBlock key={index} className="h-4 w-full" />
            ))}
          </CardBody>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <SkeletonBlock className="h-5 w-36" />
        </CardHeader>
        <CardBody>
          <div className="grid gap-4 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <SkeletonBlock key={index} className="h-24 w-full rounded-xl" />
            ))}
          </div>
        </CardBody>
      </Card>
      <span className="sr-only">กำลังโหลด...</span>
    </div>
  );
}

export function StoreIdentityCard({
  name,
  slug,
  status,
  logoUrl,
  ownerFullName,
  ownerEmail,
}: {
  name: string;
  slug: string;
  status: StoreStatus | string;
  logoUrl?: string;
  ownerFullName?: string;
  ownerEmail?: string;
}) {
  return (
    <Card>
      <CardBody>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-5">
          <StoreAvatar name={name} logoUrl={logoUrl} />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <h1 className="font-display text-2xl font-semibold text-balance text-ink">
                  {name}
                </h1>
                <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                  <HiBuildingStorefront className="size-4 shrink-0" aria-hidden="true" />
                  <span className="truncate font-mono text-xs sm:text-sm">{slug}</span>
                </p>
              </div>
              <StoreStatusBadge status={status} />
            </div>
            {ownerFullName || ownerEmail ? (
              <p className="mt-3 text-sm text-muted-foreground">
                เจ้าของ:{' '}
                <span className="font-medium text-ink">
                  {ownerFullName ?? ownerEmail}
                  {ownerFullName && ownerEmail ? ` (${ownerEmail})` : ''}
                </span>
              </p>
            ) : null}
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
