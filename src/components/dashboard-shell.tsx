'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useState, type ComponentType } from 'react';
import { HiArrowRightOnRectangle, HiBars3, HiUserCircle } from 'react-icons/hi2';
import { ThemeToggle } from '@/components/theme-toggle';
import { useCurrentUser, useLogout } from '@/hooks/useAuth';
import { createDashboardNavPrefetchHandlers } from '@/lib/react-query/prefetch-dashboard-nav';
import { cn } from '@/lib/utils';

export type DashboardNavItem = {
  href: string;
  label: string;
  exact?: boolean;
  disabled?: boolean;
  icon?: ComponentType<{ className?: string }>;
};

export type DashboardNavSection = {
  title?: string;
  items: DashboardNavItem[];
};

export function DashboardShell({
  brandHref,
  brandLabel,
  header,
  navSections,
  children,
}: {
  brandHref: string;
  brandLabel: string;
  header?: React.ReactNode;
  navSections: DashboardNavSection[];
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const { user } = useCurrentUser();
  const logout = useLogout();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="border-b border-border px-5 py-6">
        <Link href={brandHref} className="inline-flex items-baseline gap-1">
          <span className="font-display text-xl font-semibold text-ink">SOPet</span>
          <span className="text-xs font-medium text-brand">{brandLabel}</span>
        </Link>
        {header}
      </div>

      <nav className="flex-1 overflow-y-auto p-4">
        {navSections.map((section, sectionIndex) => (
          <div
            key={section.title ?? `section-${sectionIndex}`}
            className={cn(sectionIndex > 0 && 'mt-3')}
          >
            {section.title ? (
              <p className="px-3 pb-1 pt-1 text-xs font-semibold uppercase tracking-wide text-muted">
                {section.title}
              </p>
            ) : null}
            <div className="space-y-1">
              {section.items.map((item) => {
                const active = item.exact
                  ? pathname === item.href
                  : pathname === item.href || pathname.startsWith(`${item.href}/`);
                const Icon = item.icon;
                const prefetchHandlers = createDashboardNavPrefetchHandlers(queryClient, item.href);
                const className = cn(
                  'flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                  item.disabled
                    ? 'cursor-not-allowed border-l-[3px] border-transparent text-muted/60'
                    : active
                      ? 'border-l-[3px] border-brand bg-brand-tint pl-[9px] text-brand'
                      : 'border-l-[3px] border-transparent text-muted hover:bg-surface hover:text-ink',
                );

                if (item.disabled) {
                  return (
                    <span key={item.href} className={className} aria-disabled="true">
                      {Icon ? <Icon className="size-4 shrink-0" aria-hidden="true" /> : null}
                      <span>{item.label}</span>
                    </span>
                  );
                }

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={className}
                    onMouseEnter={prefetchHandlers.onMouseEnter}
                    onFocus={prefetchHandlers.onFocus}
                  >
                    {Icon ? <Icon className="size-4 shrink-0" aria-hidden="true" /> : null}
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-border p-4">
        <div className="space-y-3 rounded-xl bg-surface p-3">
          {user ? (
            <>
              <div className="flex items-center gap-3 px-1">
                <div
                  className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-tint text-brand"
                  aria-hidden="true"
                >
                  <HiUserCircle className="size-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink">{user.fullName}</p>
                  <p className="truncate text-xs text-muted">{user.email}</p>
                </div>
              </div>
              <div className="h-px bg-border" aria-hidden="true" />
            </>
          ) : null}
          <div className="space-y-1">
            <ThemeToggle variant="labeled" />
            <button
              type="button"
              onClick={logout}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-muted transition-all hover:bg-danger/10 hover:text-danger"
            >
              <HiArrowRightOnRectangle className="size-4 shrink-0" aria-hidden="true" />
              <span>ออกจากระบบ</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-dvh overflow-hidden bg-cream">
      <aside className="hidden w-64 shrink-0 border-r border-border bg-white md:block">
        {sidebar}
      </aside>

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            aria-label="ปิดเมนู"
            className="absolute inset-0 bg-ink/40 backdrop-blur-[2px]"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 w-64 border-r border-border bg-white shadow-[var(--shadow-elevated)]">
            {sidebar}
          </aside>
        </div>
      ) : null}

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <div className="flex items-center gap-3 border-b border-border bg-white px-4 py-3 md:hidden">
          <button
            type="button"
            aria-label="เปิดเมนู"
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen(true)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border text-ink transition-colors hover:bg-surface"
          >
            <HiBars3 className="size-[18px]" aria-hidden="true" />
          </button>
          <Link href={brandHref} className="inline-flex items-baseline gap-1">
            <span className="font-display text-lg font-semibold text-ink">SOPet</span>
            <span className="text-xs font-medium text-brand">{brandLabel}</span>
          </Link>
          <div className="ml-auto">
            <ThemeToggle />
          </div>
        </div>

        <main className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 md:px-8 md:py-10">{children}</div>
        </main>
      </div>
    </div>
  );
}
