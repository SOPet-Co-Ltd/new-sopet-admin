'use client';

import { useId, useMemo, useState, type KeyboardEvent, type ReactNode } from 'react';
import { HiOutlineFunnel, HiXMark } from 'react-icons/hi2';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ORDER_STATUSES } from '@/lib/config';
import { labelOrderStatus, labelPaymentMethod } from '@/lib/i18n/th';
import { cn } from '@/lib/utils';

const ALL = 'all';

export const ORDER_PAYMENT_METHODS = ['promptpay', 'credit_card', 'cod', 'bank_transfer'] as const;

export type OrderQueueView = 'action' | 'all';
export type OrderStatusFilter = (typeof ORDER_STATUSES)[number] | typeof ALL;
export type OrderPaymentFilter = (typeof ORDER_PAYMENT_METHODS)[number] | typeof ALL;

type ActiveChip = {
  key: string;
  label: string;
  valueLabel: string;
  onClear: () => void;
};

const STATUS_OPTIONS: ReadonlyArray<{ value: OrderStatusFilter; label: string }> = [
  { value: ALL, label: 'ทุกสถานะ' },
  ...ORDER_STATUSES.map((status) => ({
    value: status,
    label: labelOrderStatus(status),
  })),
];

const PAYMENT_OPTIONS: ReadonlyArray<{ value: OrderPaymentFilter; label: string }> = [
  { value: ALL, label: 'ทุกวิธีชำระ' },
  ...ORDER_PAYMENT_METHODS.map((method) => ({
    value: method,
    label: labelPaymentMethod(method),
  })),
];

type VendorOrderFiltersProps = {
  queue: OrderQueueView;
  actionableCount: number;
  status: OrderStatusFilter;
  paymentMethod: OrderPaymentFilter;
  onQueueChange: (queue: OrderQueueView) => void;
  onStatusChange: (status: OrderStatusFilter) => void;
  onPaymentMethodChange: (paymentMethod: OrderPaymentFilter) => void;
  onClearAll: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  /** Optional leading slot (e.g. search) rendered on the same toolbar row. */
  leading?: ReactNode;
};

export function VendorOrderFilters({
  queue,
  actionableCount,
  status,
  paymentMethod,
  onQueueChange,
  onStatusChange,
  onPaymentMethodChange,
  onClearAll,
  isLoading = false,
  disabled = false,
  leading,
}: VendorOrderFiltersProps) {
  const panelId = useId();
  const [open, setOpen] = useState(false);
  const queueFilter = queue === 'action';

  const activeFilters = useMemo(() => {
    const chips: ActiveChip[] = [];

    if (status !== ALL) {
      chips.push({
        key: 'status',
        label: 'สถานะ',
        valueLabel: labelOrderStatus(status),
        onClear: () => onStatusChange(ALL),
      });
    }

    if (paymentMethod !== ALL) {
      chips.push({
        key: 'payment',
        label: 'ชำระเงิน',
        valueLabel: labelPaymentMethod(paymentMethod),
        onClear: () => onPaymentMethodChange(ALL),
      });
    }

    return chips;
  }, [onPaymentMethodChange, onStatusChange, paymentMethod, status]);

  const advancedActiveCount = paymentMethod !== ALL ? 1 : 0;
  const activeCount = activeFilters.length;

  function onQueueTabKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (
      event.key !== 'ArrowLeft' &&
      event.key !== 'ArrowRight' &&
      event.key !== 'Home' &&
      event.key !== 'End'
    ) {
      return;
    }
    event.preventDefault();
    const next: OrderQueueView =
      event.key === 'Home' || event.key === 'ArrowLeft' ? 'action' : 'all';
    onQueueChange(next);
    requestAnimationFrame(() => {
      document.getElementById(next === 'action' ? 'orders-tab-action' : 'orders-tab-all')?.focus();
    });
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {leading ? <div className="min-w-0 flex-1 sm:max-w-sm">{leading}</div> : null}
        <div className={cn('flex shrink-0 items-center gap-2', !leading && 'w-full justify-end')}>
          {activeCount > 0 ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onClearAll}
              disabled={disabled}
              className="text-muted"
            >
              ล้างทั้งหมด
            </Button>
          ) : null}
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen((prev) => !prev)}
            disabled={disabled}
            aria-expanded={open}
            aria-controls={panelId}
            aria-label={
              advancedActiveCount > 0
                ? `ตัวกรองเพิ่มเติม ${advancedActiveCount} รายการ`
                : 'ตัวกรองเพิ่มเติม'
            }
          >
            <HiOutlineFunnel className="size-4" aria-hidden="true" />
            <span aria-hidden="true">ตัวกรอง</span>
            {advancedActiveCount > 0 ? (
              <span
                className="inline-flex min-w-5 items-center justify-center rounded-full bg-brand px-1.5 text-xs font-semibold text-primary-foreground"
                aria-hidden="true"
              >
                {advancedActiveCount}
              </span>
            ) : null}
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <p className="mb-1.5 text-xs font-medium text-muted-foreground">มุมมอง</p>
          <div className="flex flex-wrap gap-2" role="tablist" aria-label="มุมมองคำสั่งซื้อ">
            <Button
              type="button"
              id="orders-tab-action"
              role="tab"
              aria-selected={queueFilter}
              aria-controls="orders-panel"
              tabIndex={queueFilter ? 0 : -1}
              variant={queueFilter ? 'default' : 'outline'}
              disabled={disabled}
              className={cn(
                'rounded-full transition-[background-color,border-color,color,box-shadow] duration-150 ease-out motion-reduce:transition-none',
                queueFilter ? 'shadow-none' : 'bg-card text-ink hover:bg-surface',
              )}
              onClick={() => onQueueChange('action')}
              onKeyDown={onQueueTabKeyDown}
            >
              ต้องทำ
              {!isLoading && actionableCount > 0 ? (
                <span
                  className={cn(
                    'ml-0.5 inline-flex min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-medium tabular-nums',
                    queueFilter ? 'bg-white/20 text-white' : 'bg-secondary-tint text-secondary',
                  )}
                >
                  {actionableCount.toLocaleString('th-TH')}
                </span>
              ) : null}
            </Button>
            <Button
              type="button"
              id="orders-tab-all"
              role="tab"
              aria-selected={!queueFilter}
              aria-controls="orders-panel"
              tabIndex={!queueFilter ? 0 : -1}
              variant={!queueFilter ? 'default' : 'outline'}
              disabled={disabled}
              className={cn(
                'rounded-full transition-[background-color,border-color,color,box-shadow] duration-150 ease-out motion-reduce:transition-none',
                !queueFilter ? 'shadow-none' : 'bg-card text-ink hover:bg-surface',
              )}
              onClick={() => onQueueChange('all')}
              onKeyDown={onQueueTabKeyDown}
            >
              ทั้งหมด
            </Button>
          </div>
        </div>

        <fieldset className="min-w-0" disabled={disabled}>
          <legend className="mb-1.5 block text-xs font-medium text-muted-foreground">
            สถานะคำสั่งซื้อ
          </legend>
          <div className="flex flex-wrap gap-2">
            {STATUS_OPTIONS.map((option) => {
              const isSelected = status === option.value;
              return (
                <Button
                  key={option.value}
                  type="button"
                  size="sm"
                  variant={isSelected ? 'default' : 'outline'}
                  aria-pressed={isSelected}
                  disabled={disabled}
                  onClick={() => onStatusChange(option.value)}
                  className="transition-[background-color,border-color,color,box-shadow] duration-150 ease-out motion-reduce:transition-none"
                >
                  {option.label}
                </Button>
              );
            })}
          </div>
        </fieldset>
      </div>

      {activeCount > 0 ? (
        <div className="flex flex-wrap items-center gap-2" aria-label="ตัวกรองที่เลือก">
          {activeFilters.map((filter) => (
            <button
              key={filter.key}
              type="button"
              onClick={filter.onClear}
              disabled={disabled}
              aria-label={`ลบตัวกรอง ${filter.label}: ${filter.valueLabel}`}
              className="inline-flex max-w-full items-center gap-1.5 rounded-lg border border-border bg-white px-2.5 py-1.5 text-xs font-medium text-ink transition-colors duration-150 ease-out hover:bg-surface focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 motion-reduce:transition-none"
            >
              <span className="truncate" aria-hidden="true">
                <span className="text-muted-foreground">{filter.label}: </span>
                {filter.valueLabel}
              </span>
              <HiXMark className="size-3.5 shrink-0 text-muted" aria-hidden="true" />
            </button>
          ))}
        </div>
      ) : null}

      {open ? (
        <div
          id={panelId}
          className="rounded-xl border border-border bg-white p-4 sm:p-5"
          role="region"
          aria-label="ตัวเลือกตัวกรอง"
        >
          <section className="space-y-3">
            <div>
              <h3 className="text-sm font-medium text-ink">การชำระเงิน</h3>
              <p className="mt-0.5 text-xs text-muted-foreground">
                กรองออเดอร์ตามวิธีชำระเงินของลูกค้า
              </p>
            </div>
            <div className="max-w-xs">
              <label
                htmlFor="orders-payment-filter"
                className="mb-1.5 block text-xs font-medium text-muted-foreground"
              >
                วิธีชำระเงิน
              </label>
              <Select
                value={paymentMethod}
                onValueChange={(value) => onPaymentMethodChange(value as OrderPaymentFilter)}
                disabled={disabled}
              >
                <SelectTrigger id="orders-payment-filter" className="w-full">
                  <SelectValue placeholder="ทุกวิธีชำระ" />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}
