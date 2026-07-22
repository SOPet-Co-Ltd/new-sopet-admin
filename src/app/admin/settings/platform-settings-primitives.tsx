import type { ReactNode } from 'react';
import { HiChevronDown, HiChevronUp, HiPhoto } from 'react-icons/hi2';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export const PLATFORM_SETTINGS_TAB_PANEL_IDS = {
  banners: 'platform-settings-panel-banners',
  sponsors: 'platform-settings-panel-sponsors',
  ads: 'platform-settings-panel-ads',
  loginImages: 'platform-settings-panel-loginImages',
} as const;

function queryErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback;
}

type PlatformSettingsLoadErrorProps = {
  message: string;
  detail?: unknown;
  onRetry: () => void;
};

export function PlatformSettingsLoadError({
  message,
  detail,
  onRetry,
}: PlatformSettingsLoadErrorProps) {
  return (
    <div className="rounded-lg border border-danger/20 bg-danger-bg/40 px-4 py-6 text-center">
      <p className="text-sm font-medium text-ink" role="alert">
        {message}
      </p>
      {detail ? (
        <p className="mt-1 text-sm text-muted-foreground">{queryErrorMessage(detail, message)}</p>
      ) : null}
      <Button type="button" variant="outline" size="sm" className="mt-4" onClick={onRetry}>
        ลองอีกครั้ง
      </Button>
    </div>
  );
}

export function PlatformSettingsMutationError({
  message,
  detail,
}: {
  message: string;
  detail?: unknown;
}) {
  return (
    <p role="alert" className="text-sm text-danger">
      {detail ? queryErrorMessage(detail, message) : message}
    </p>
  );
}

export function ListRowSkeleton({
  rows = 3,
  label = 'กำลังโหลดตั้งค่าแพลตฟอร์ม',
}: {
  rows?: number;
  label?: string;
}) {
  return (
    <div className="space-y-3" aria-busy="true" aria-label={label}>
      {Array.from({ length: rows }, (_, index) => (
        <div
          key={index}
          className="flex animate-pulse items-center gap-4 rounded-lg border border-border bg-card px-4 py-3 motion-reduce:animate-none"
        >
          <div className="h-12 w-20 shrink-0 rounded-md bg-surface" />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="h-4 w-40 max-w-full rounded bg-surface" />
            <div className="h-3 w-56 max-w-full rounded bg-surface" />
          </div>
          <div className="hidden h-8 w-48 shrink-0 rounded-md bg-surface sm:block" />
        </div>
      ))}
      <span className="sr-only">กำลังโหลด...</span>
    </div>
  );
}

type PlatformSettingsEmptyStateProps = {
  icon: ReactNode;
  title: string;
  description: string;
};

export function PlatformSettingsEmptyState({
  icon,
  title,
  description,
}: PlatformSettingsEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-surface/60 px-6 py-10 text-center">
      <div className="text-muted-foreground" aria-hidden>
        {icon}
      </div>
      <p className="mt-3 font-medium text-balance text-ink">{title}</p>
      <p className="mt-1 max-w-md text-sm text-pretty text-muted-foreground">{description}</p>
    </div>
  );
}

export function PlatformMediaThumbnail({ src, alt }: { src?: string | null; alt: string }) {
  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt}
        className="h-12 w-20 shrink-0 rounded-md border border-border bg-surface object-cover"
      />
    );
  }

  return (
    <div
      className="flex h-12 w-20 shrink-0 items-center justify-center rounded-md border border-border bg-surface text-muted-foreground"
      aria-hidden
    >
      <HiPhoto className="size-5" />
    </div>
  );
}

export function PlatformListRow({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <li
      className={cn(
        'flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-card px-4 py-3 transition-colors duration-200 motion-reduce:transition-none',
        className,
      )}
    >
      {children}
    </li>
  );
}

type ReorderButtonsProps = {
  index: number;
  total: number;
  disabled: boolean;
  busy: boolean;
  onMove: (index: number, direction: -1 | 1) => void;
};

export function ReorderButtons({ index, total, disabled, busy, onMove }: ReorderButtonsProps) {
  return (
    <div className="flex shrink-0 gap-1.5">
      <Button
        type="button"
        size="sm"
        variant="outline"
        disabled={disabled || index === 0}
        aria-busy={busy}
        aria-label="เลื่อนขึ้น"
        onClick={() => onMove(index, -1)}
      >
        <HiChevronUp className="size-4" aria-hidden />
      </Button>
      <Button
        type="button"
        size="sm"
        variant="outline"
        disabled={disabled || index === total - 1}
        aria-busy={busy}
        aria-label="เลื่อนลง"
        onClick={() => onMove(index, 1)}
      >
        <HiChevronDown className="size-4" aria-hidden />
      </Button>
    </div>
  );
}

export function ActiveToggleField({
  id,
  label,
  hint,
  ...inputProps
}: React.ComponentProps<'input'> & {
  label: string;
  hint?: string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2.5">
        <input
          id={id}
          type="checkbox"
          className="size-4 rounded border-border text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          {...inputProps}
        />
        <label htmlFor={id} className="text-sm font-medium text-ink">
          {label}
        </label>
      </div>
      {hint ? <p className="text-xs text-pretty text-muted-foreground">{hint}</p> : null}
    </div>
  );
}
