'use client';

import { useId, useState } from 'react';
import {
  HiComputerDesktop,
  HiDevicePhoneMobile,
  HiDeviceTablet,
  HiOutlineExclamationCircle,
  HiXMark,
} from 'react-icons/hi2';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

export type EmailPreviewViewport = 'desktop' | 'tablet' | 'mobile';

const VIEWPORTS: Array<{
  id: EmailPreviewViewport;
  label: string;
  width: number;
  icon: typeof HiComputerDesktop;
}> = [
  { id: 'desktop', label: 'เดสก์ท็อป', width: 920, icon: HiComputerDesktop },
  { id: 'tablet', label: 'แท็บเล็ต', width: 768, icon: HiDeviceTablet },
  { id: 'mobile', label: 'มือถือ', width: 390, icon: HiDevicePhoneMobile },
];

/**
 * Modal visualization of merged transactional email HTML with responsive
 * viewport toggles (desktop / tablet / mobile). Sandboxed iframe — no scripts.
 */
export function EmailPreviewModal({
  open,
  onOpenChange,
  subject,
  html,
  isLoading,
  error,
  isDirty,
  missingPlaceholders = [],
  onRefresh,
  isRefreshing,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subject?: string | null;
  html: string | null;
  isLoading?: boolean;
  error?: string | null;
  isDirty?: boolean;
  missingPlaceholders?: string[];
  onRefresh?: () => void;
  isRefreshing?: boolean;
}) {
  const titleId = useId();
  const [viewport, setViewport] = useState<EmailPreviewViewport>('desktop');
  const active = VIEWPORTS.find((item) => item.id === viewport) ?? VIEWPORTS[0];

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          setViewport('desktop');
        }
        onOpenChange(next);
      }}
    >
      <DialogContent
        aria-labelledby={titleId}
        className={cn(
          'flex max-h-[min(920px,92vh)] w-[min(1100px,96vw)] max-w-none flex-col gap-0 overflow-hidden p-0',
        )}
      >
        <DialogHeader className="mb-0 border-b border-border px-5 py-4 sm:px-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0 space-y-1">
              <DialogTitle id={titleId}>ตัวอย่างอีเมล</DialogTitle>
              <DialogDescription>
                ดูผลลัพธ์หลังรวมคอนเทนเนอร์กับเนื้อหา — สลับขนาดหน้าจอเพื่อตรวจ responsive
              </DialogDescription>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div
                role="group"
                aria-label="ขนาดหน้าจอตัวอย่าง"
                className="inline-flex rounded-lg border border-border bg-surface/70 p-0.5"
              >
                {VIEWPORTS.map((item) => {
                  const Icon = item.icon;
                  const selected = item.id === viewport;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      aria-pressed={selected}
                      title={`${item.label} (${item.width}px)`}
                      onClick={() => setViewport(item.id)}
                      className={cn(
                        'inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors',
                        selected
                          ? 'bg-white text-ink shadow-sm'
                          : 'text-muted-foreground hover:text-ink',
                      )}
                    >
                      <Icon className="size-4 shrink-0" aria-hidden="true" />
                      <span className="hidden sm:inline">{item.label}</span>
                    </button>
                  );
                })}
              </div>
              {onRefresh ? (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={onRefresh}
                  disabled={isRefreshing || isLoading}
                  aria-busy={isRefreshing || isLoading}
                >
                  {isRefreshing || isLoading ? 'กำลังสร้างตัวอย่าง...' : 'รีเฟรชตัวอย่าง'}
                </Button>
              ) : null}
              <DialogClose asChild>
                <Button type="button" size="sm" variant="ghost" aria-label="ปิดตัวอย่าง">
                  <HiXMark className="size-5" aria-hidden="true" />
                </Button>
              </DialogClose>
            </div>
          </div>
        </DialogHeader>

        <div className="min-h-0 flex-1 space-y-3 overflow-auto bg-[#F4F1F8] px-4 py-4 sm:px-6 sm:py-5">
          {subject ? (
            <div className="rounded-lg border border-border bg-white px-4 py-2.5 text-sm">
              <span className="text-muted-foreground">หัวข้อ: </span>
              <span className="font-medium text-ink">{subject}</span>
            </div>
          ) : null}

          {isDirty && html ? (
            <p role="status" className="text-xs text-warning-text">
              กำลังแสดงค่าที่ยังไม่บันทึก — ตัวอย่างอาจไม่ตรงกับฉบับที่บันทึกแล้ว
            </p>
          ) : null}

          {missingPlaceholders.length > 0 ? (
            <p role="status" className="text-xs text-warning-text">
              ค่าตัวอย่างหายไป: {missingPlaceholders.map((name) => `{{${name}}}`).join(', ')}
            </p>
          ) : null}

          {error ? (
            <div
              role="alert"
              className="flex items-center gap-2 rounded-lg border border-danger/20 bg-danger-bg px-4 py-3 text-sm text-danger"
            >
              <HiOutlineExclamationCircle className="size-5 shrink-0" aria-hidden="true" />
              {error}
            </div>
          ) : null}

          <div className="flex justify-center pb-2">
            <div
              className={cn(
                'relative w-full overflow-hidden rounded-2xl border border-border bg-white shadow-[var(--shadow-card)] transition-[max-width] duration-200',
                isLoading && 'opacity-70',
              )}
              style={{ maxWidth: active.width }}
            >
              <div className="flex items-center justify-between border-b border-border bg-surface/80 px-3 py-2 text-[11px] text-muted-foreground">
                <span>
                  {active.label} · {active.width}px
                </span>
                <span className="font-mono">sandbox</span>
              </div>

              {isLoading ? (
                <div
                  role="status"
                  className="absolute inset-x-0 top-9 z-10 flex items-center gap-2 bg-white/90 px-4 py-2 text-xs text-muted-foreground"
                >
                  <span
                    className="size-3 animate-spin rounded-full border-2 border-brand border-t-transparent"
                    aria-hidden="true"
                  />
                  กำลังสร้างตัวอย่าง...
                </div>
              ) : null}

              {!html && !isLoading && !error ? (
                <p className="flex min-h-[420px] items-center justify-center px-6 text-center text-sm text-muted-foreground">
                  ยังไม่มีเนื้อหาสำหรับแสดงตัวอย่าง
                </p>
              ) : null}

              {html ? (
                <iframe
                  title="ตัวอย่างอีเมล"
                  srcDoc={html}
                  // allow-same-origin: load absolute logo/images from API/CDN in srcDoc.
                  // Scripts stay blocked (no allow-scripts).
                  sandbox="allow-same-origin"
                  referrerPolicy="no-referrer"
                  className="block w-full bg-white"
                  style={{ height: 'min(70vh, 720px)', minHeight: 420 }}
                />
              ) : null}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
