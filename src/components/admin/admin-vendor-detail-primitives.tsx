'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { HiArrowLeft } from 'react-icons/hi2';
import { Badge } from '@/components/ui/badge';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export function getVendorInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'ผ';
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

export function VendorAvatar({ name }: { name: string }) {
  return (
    <div
      aria-hidden="true"
      className="flex size-16 shrink-0 items-center justify-center rounded-2xl border border-brand/15 bg-brand-tint font-display text-xl font-semibold text-brand sm:size-20 sm:text-2xl"
    >
      {getVendorInitials(name)}
    </div>
  );
}

export function VendorStatusBadges({
  isActive,
  emailVerified,
}: {
  isActive: boolean;
  emailVerified: boolean;
}) {
  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      <Badge status={isActive ? 'published' : 'draft'}>{isActive ? 'ใช้งานอยู่' : 'ระงับ'}</Badge>
      <Badge status={emailVerified ? 'published' : 'draft'}>
        {emailVerified ? 'ยืนยันอีเมลแล้ว' : 'ยังไม่ยืนยันอีเมล'}
      </Badge>
    </div>
  );
}

export function VendorDetailRow({ label, children }: { label: ReactNode; children: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border pb-3 last:border-b-0 last:pb-0">
      <span className="shrink-0 text-muted-foreground">{label}</span>
      <span className="min-w-0 text-right font-medium break-words text-ink">{children}</span>
    </div>
  );
}

export function VendorInsightFact({
  label,
  children,
  hint,
}: {
  label: string;
  children: ReactNode;
  hint?: string;
}) {
  return (
    <div className="min-w-0">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-lg font-semibold tabular-nums text-ink text-pretty break-words">
        {children}
      </dd>
      {hint ? <p className="mt-1 text-xs text-muted-foreground text-pretty">{hint}</p> : null}
    </div>
  );
}

export function BackToVendorsLink({ href = '/admin/vendors' }: { href?: string }) {
  return (
    <Link
      href={href}
      className="inline-flex min-h-11 items-center gap-1.5 text-sm text-muted-foreground transition-colors duration-200 ease-out hover:text-brand focus-visible:text-brand motion-reduce:transition-none"
    >
      <HiArrowLeft className="size-3.5 shrink-0" aria-hidden="true" />
      กลับรายการผู้ขาย
    </Link>
  );
}

function SkeletonBlock({ className }: { className?: string }) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-surface motion-reduce:animate-none', className)}
    />
  );
}

export function VendorDetailSkeleton() {
  return (
    <div className="space-y-8" aria-busy="true" aria-label="กำลังโหลดรายละเอียดผู้ขาย">
      <div className="space-y-3">
        <SkeletonBlock className="h-4 w-36" />
        <SkeletonBlock className="h-8 w-56 max-w-full" />
        <SkeletonBlock className="h-4 w-48 max-w-full" />
      </div>
      <Card>
        <CardBody>
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="space-y-2">
                <SkeletonBlock className="h-3.5 w-24" />
                <SkeletonBlock className="h-6 w-20" />
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
        <Card>
          <CardHeader>
            <SkeletonBlock className="h-5 w-40" />
          </CardHeader>
          <CardBody className="space-y-4">
            {Array.from({ length: 2 }).map((_, index) => (
              <div key={index} className="space-y-2">
                <SkeletonBlock className="h-3.5 w-24" />
                <SkeletonBlock className="h-10 w-full" />
              </div>
            ))}
          </CardBody>
        </Card>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <SkeletonBlock className="h-5 w-32" />
            </CardHeader>
            <CardBody className="space-y-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <SkeletonBlock key={index} className="h-4 w-full" />
              ))}
            </CardBody>
          </Card>
          <Card>
            <CardHeader>
              <SkeletonBlock className="h-5 w-36" />
            </CardHeader>
            <CardBody className="space-y-3">
              <SkeletonBlock className="h-10 w-full" />
              <SkeletonBlock className="h-10 w-full" />
            </CardBody>
          </Card>
        </div>
      </div>
      {Array.from({ length: 3 }).map((_, index) => (
        <Card key={index}>
          <CardHeader>
            <SkeletonBlock className="h-5 w-40" />
          </CardHeader>
          <CardBody>
            <SkeletonBlock className="h-32 w-full" />
          </CardBody>
        </Card>
      ))}
      <span className="sr-only">กำลังโหลด...</span>
    </div>
  );
}
