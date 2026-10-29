'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { useState, useSyncExternalStore, type ComponentType } from 'react';
import {
  HiArrowRightOnRectangle,
  HiBars3,
  HiChevronLeft,
  HiChevronRight,
  HiUserCircle,
} from 'react-icons/hi2';
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
  badge?: number;
  /** Spotlight product-tour target id (`data-tour-id`). */
  tourId?: string;
  /** When set, render a button instead of a link (e.g. replay tour). */
  onClick?: () => void;
};

export type DashboardNavSection = {
  title?: string;
  items: DashboardNavItem[];
};

const SIDEBAR_COLLAPSED_KEY = 'sopet-admin-sidebar-collapsed';
const SIDEBAR_COLLAPSED_EVENT = 'sopet-admin-sidebar-collapsed';

function subscribeSidebarCollapsed(onStoreChange: () => void) {
  window.addEventListener('storage', onStoreChange);
  window.addEventListener(SIDEBAR_COLLAPSED_EVENT, onStoreChange);
  return () => {
    window.removeEventListener('storage', onStoreChange);
    window.removeEventListener(SIDEBAR_COLLAPSED_EVENT, onStoreChange);
  };
}

function getSidebarCollapsedSnapshot() {
  try {
    return window.localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === '1';
  } catch {
    return false;
  }
}

function getSidebarCollapsedServerSnapshot() {
  return false;
}

function setSidebarCollapsedPreference(next: boolean) {
  try {
    window.localStorage.setItem(SIDEBAR_COLLAPSED_KEY, next ? '1' : '0');
  } catch {
    // ignore quota / private-mode write failures
  }
  window.dispatchEvent(new Event(SIDEBAR_COLLAPSED_EVENT));
}

export function DashboardShell({
  brandHref,
  brandLabel,
  header,
  navSections,
  children,
  forceMobileNavOpen = false,
}: {
  brandHref: string;
  brandLabel: string;
  header?: React.ReactNode;
  navSections: DashboardNavSection[];
  children: React.ReactNode;
  /** Keeps the mobile drawer open (e.g. while a product tour highlights nav). */
  forceMobileNavOpen?: boolean;
}) {
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const { user } = useCurrentUser();
  const logout = useLogout();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [prevPathname, setPrevPathname] = useState(pathname);
  const collapsed = useSyncExternalStore(
    subscribeSidebarCollapsed,
    getSidebarCollapsedSnapshot,
    getSidebarCollapsedServerSnapshot,
  );

  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    if (!forceMobileNavOpen) {
      setMobileOpen(false);
    }
  }

  const navOpen = mobileOpen || forceMobileNavOpen;

  function renderSidebar(options: { collapsed: boolean; showCollapseToggle: boolean }) {
    const { collapsed: isCollapsed, showCollapseToggle } = options;

    return (
      <div className="flex h-full flex-col">
        <div
          className={cn(
            'border-b border-border',
            isCollapsed
              ? 'flex flex-col items-center gap-2 px-2 py-4'
              : 'flex items-center gap-2 px-5 py-6',
          )}
        >
          <Link
            href={brandHref}
            className={cn(
              'inline-flex min-w-0 items-baseline gap-1',
              isCollapsed && 'justify-center',
              !isCollapsed && showCollapseToggle && 'flex-1',
            )}
            title={`SOPet ${brandLabel}`}
          >
            <span className="font-display text-xl font-semibold text-ink">
              {isCollapsed ? 'S' : 'SOPet'}
            </span>
            {!isCollapsed ? (
              <span className="text-xs font-medium text-brand">{brandLabel}</span>
            ) : null}
          </Link>
          {showCollapseToggle ? (
            <button
              type="button"
              aria-label={isCollapsed ? 'ขยายเมนู' : 'ย่อเมนู'}
              aria-expanded={!isCollapsed}
              onClick={() => setSidebarCollapsedPreference(!isCollapsed)}
              className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg border border-border text-muted transition-colors hover:bg-surface hover:text-ink"
            >
              {isCollapsed ? (
                <HiChevronRight className="size-4" aria-hidden="true" />
              ) : (
                <HiChevronLeft className="size-4" aria-hidden="true" />
              )}
            </button>
          ) : null}
          {!isCollapsed ? header : null}
        </div>

        <nav className={cn('flex-1 overflow-y-auto', isCollapsed ? 'p-2' : 'p-4')}>
          {navSections.map((section, sectionIndex) => (
            <div
              key={section.title ?? `section-${sectionIndex}`}
              className={cn(sectionIndex > 0 && (isCollapsed ? 'mt-2' : 'mt-3'))}
            >
              {section.title && !isCollapsed ? (
                <p className="px-3 pb-1 pt-1 text-sm font-medium text-muted">{section.title}</p>
              ) : null}
              <div className="space-y-1">
                {section.items.map((item) => {
                  const active = item.onClick
                    ? false
                    : item.exact
                      ? pathname === item.href
                      : pathname === item.href || pathname.startsWith(`${item.href}/`);
                  const Icon = item.icon;
                  const prefetchHandlers = item.onClick
                    ? null
                    : createDashboardNavPrefetchHandlers(queryClient, item.href);
                  const className = cn(
                    'flex items-center rounded-lg text-sm font-medium transition-all',
                    isCollapsed ? 'justify-center px-2 py-2.5' : 'gap-2.5 px-3 py-2.5',
                    item.disabled
                      ? 'cursor-not-allowed text-muted/60'
                      : active
                        ? 'bg-brand-tint font-semibold text-brand'
                        : 'text-muted hover:bg-surface hover:text-ink',
                  );
                  const itemKey = item.onClick ? `action:${item.label}` : item.href;
                  const badge =
                    item.badge && item.badge > 0 ? (
                      <span
                        className={cn(
                          'inline-flex min-w-5 items-center justify-center rounded-full bg-primary px-1.5 py-0.5 text-xs font-semibold text-primary-foreground',
                          isCollapsed && 'absolute -right-1 -top-1 min-w-4 px-1 py-0 text-[10px]',
                        )}
                      >
                        {item.badge > 99 ? '99+' : item.badge}
                      </span>
                    ) : null;

                  const content = (
                    <>
                      <span className={cn('relative shrink-0', isCollapsed && 'inline-flex')}>
                        {Icon ? <Icon className="size-4 shrink-0" aria-hidden="true" /> : null}
                        {isCollapsed ? badge : null}
                      </span>
                      <span className={cn('flex-1', isCollapsed && 'sr-only')}>{item.label}</span>
                      {!isCollapsed ? badge : null}
                    </>
                  );

                  if (item.disabled) {
                    return (
                      <span
                        key={itemKey}
                        className={className}
                        aria-disabled="true"
                        title={item.label}
                        data-tour-id={item.tourId}
                      >
                        {content}
                      </span>
                    );
                  }

                  if (item.onClick) {
                    return (
                      <button
                        key={itemKey}
                        type="button"
                        className={cn(className, !isCollapsed && 'w-full text-left')}
                        title={item.label}
                        aria-label={item.label}
                        data-tour-id={item.tourId}
                        onClick={item.onClick}
                      >
                        {content}
                      </button>
                    );
                  }

                  return (
                    <Link
                      key={itemKey}
                      href={item.href}
                      className={className}
                      title={item.label}
                      data-tour-id={item.tourId}
                      onMouseEnter={prefetchHandlers?.onMouseEnter}
                      onFocus={prefetchHandlers?.onFocus}
                    >
                      {content}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className={cn('border-t border-border', isCollapsed ? 'p-2' : 'p-4')}>
          <div className={cn('space-y-3 rounded-xl bg-surface', isCollapsed ? 'p-2' : 'p-3')}>
            {user ? (
              <>
                <div
                  className={cn(
                    'flex items-center gap-3',
                    isCollapsed ? 'justify-center px-0' : 'px-1',
                  )}
                >
                  <div
                    className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-tint text-brand"
                    aria-hidden="true"
                    title={user.fullName}
                  >
                    <HiUserCircle className="size-5" />
                  </div>
                  {!isCollapsed ? (
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-ink">{user.fullName}</p>
                      <p className="truncate text-xs text-muted">{user.email}</p>
                    </div>
                  ) : null}
                </div>
                {!isCollapsed ? <div className="h-px bg-border" aria-hidden="true" /> : null}
              </>
            ) : null}
            <div className={cn('space-y-1', isCollapsed && 'flex flex-col items-center gap-1')}>
              <ThemeToggle variant={isCollapsed ? 'icon' : 'labeled'} />
              <button
                type="button"
                onClick={logout}
                aria-label="ออกจากระบบ"
                title="ออกจากระบบ"
                className={cn(
                  'flex items-center rounded-lg text-sm font-medium text-muted transition-all hover:bg-danger/10 hover:text-danger',
                  isCollapsed ? 'size-9 justify-center' : 'w-full gap-2.5 px-3 py-2.5',
                )}
              >
                <HiArrowRightOnRectangle className="size-4 shrink-0" aria-hidden="true" />
                {!isCollapsed ? <span>ออกจากระบบ</span> : null}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-dvh overflow-hidden bg-background">
      <aside
        data-collapsed={collapsed ? 'true' : 'false'}
        className={cn(
          'hidden shrink-0 border-r border-border bg-white transition-[width] duration-200 ease-out md:block',
          collapsed ? 'w-16' : 'w-64',
        )}
      >
        {renderSidebar({ collapsed, showCollapseToggle: true })}
      </aside>

      {navOpen ? (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            aria-label="ปิดเมนู"
            className="absolute inset-0 bg-ink/40 backdrop-blur-[2px]"
            onClick={() => {
              if (!forceMobileNavOpen) setMobileOpen(false);
            }}
          />
          <aside className="absolute inset-y-0 left-0 w-64 border-r border-border bg-white shadow-[var(--shadow-elevated)]">
            {renderSidebar({ collapsed: false, showCollapseToggle: false })}
          </aside>
        </div>
      ) : null}

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <div className="flex items-center gap-3 border-b border-border bg-white px-4 py-3 md:hidden">
          <button
            type="button"
            aria-label="เปิดเมนู"
            aria-expanded={navOpen}
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
          <div className="mx-auto min-w-0 max-w-6xl px-4 py-6 sm:px-6 md:px-8 md:py-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
