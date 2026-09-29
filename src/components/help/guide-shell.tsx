'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { HiArrowRightOnRectangle, HiBookOpen } from 'react-icons/hi2';
import { ThemeToggle } from '@/components/theme-toggle';
import { cn } from '@/lib/utils';
import { helpBasePath } from '@/lib/help/registry';
import type { HelpRole } from '@/lib/help/types';

function roleFromPath(pathname: string): HelpRole | null {
  if (pathname.startsWith('/guide/admin')) return 'admin';
  if (pathname.startsWith('/guide/vendor')) return 'vendor';
  return null;
}

export function GuideShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const activeRole = roleFromPath(pathname);

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
        <div className="mx-auto flex min-w-0 max-w-6xl items-center gap-3 px-4 py-3 sm:px-6 md:px-8">
          <Link href="/guide" className="inline-flex min-w-0 items-baseline gap-1.5">
            <span className="font-display text-lg font-semibold text-ink sm:text-xl">SOPet</span>
            <span className="hidden text-xs font-medium text-brand sm:inline">
              คู่มืออย่างเป็นทางการ
            </span>
          </Link>

          <nav
            aria-label="เลือกคู่มือ"
            className="ml-auto flex items-center gap-1 rounded-full border border-border bg-surface p-1 sm:ml-6"
          >
            <Link
              href={helpBasePath('admin')}
              className={cn(
                'rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
                activeRole === 'admin'
                  ? 'bg-brand/10 text-brand'
                  : 'text-muted-foreground hover:text-ink',
              )}
              aria-current={activeRole === 'admin' ? 'page' : undefined}
            >
              ผู้ดูแล
            </Link>
            <Link
              href={helpBasePath('vendor')}
              className={cn(
                'rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
                activeRole === 'vendor'
                  ? 'bg-brand/10 text-brand'
                  : 'text-muted-foreground hover:text-ink',
              )}
              aria-current={activeRole === 'vendor' ? 'page' : undefined}
            >
              ผู้ขาย
            </Link>
          </nav>

          <div className="flex items-center gap-1 sm:gap-2">
            <ThemeToggle />
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1.5 text-sm font-medium text-ink shadow-sm transition-colors hover:border-brand/30 hover:bg-brand/5"
            >
              <HiArrowRightOnRectangle className="size-4 shrink-0 opacity-70" aria-hidden />
              <span className="hidden sm:inline">เข้าสู่ระบบ</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="min-h-0 flex-1">
        <div className="mx-auto min-w-0 max-w-6xl px-4 py-6 sm:px-6 md:px-8 md:py-10">
          {children}
        </div>
      </main>

      <footer className="border-t border-border bg-card">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4 text-xs text-muted-foreground sm:px-6 md:px-8">
          <p className="inline-flex items-center gap-1.5">
            <HiBookOpen className="size-3.5 text-brand" aria-hidden />
            คู่มืออย่างเป็นทางการ SOPet — อ่านได้โดยไม่ต้องเข้าสู่ระบบ
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/guide" className="hover:text-brand">
              หน้าแรกคู่มือ
            </Link>
            <Link href="/login" className="hover:text-brand">
              เข้าสู่พอร์ทัล
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
