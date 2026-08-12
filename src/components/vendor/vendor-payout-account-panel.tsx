'use client';

import { useEffect, useState } from 'react';
import { Controller, type UseFormReturn } from 'react-hook-form';
import { HiOutlineCheckCircle } from 'react-icons/hi2';
import { Button } from '@/components/ui/button';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { THAI_BANKS } from '@/lib/constants/thai-banks';
import type { PayoutFormValues } from '@/lib/validations';
import type { StoreDetail } from '@/types';
import { cn } from '@/lib/utils';
import { formatThaiBankAccountNumber } from '@/lib/banks/formatThaiBankAccountNumber';

type VendorPayoutAccountPanelProps = {
  form: UseFormReturn<PayoutFormValues>;
  store?: StoreDetail;
  loading: boolean;
  saving: boolean;
  onSubmit: (values: PayoutFormValues) => Promise<void>;
};

function AccountSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true" aria-live="polite">
      <div className="h-10 animate-pulse rounded-md bg-surface motion-reduce:animate-none" />
      <div className="h-10 animate-pulse rounded-md bg-surface motion-reduce:animate-none" />
      <div className="h-10 animate-pulse rounded-md bg-surface motion-reduce:animate-none" />
      <span className="sr-only">กำลังโหลด...</span>
    </div>
  );
}

export function VendorPayoutAccountPanel({
  form,
  store,
  loading,
  saving,
  onSubmit,
}: VendorPayoutAccountPanelProps) {
  const [saveFeedback, setSaveFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  useEffect(() => {
    if (!saveFeedback || saveFeedback.type !== 'success') return;
    const timer = window.setTimeout(() => setSaveFeedback(null), 4000);
    return () => window.clearTimeout(timer);
  }, [saveFeedback]);

  async function handleSubmit(values: PayoutFormValues) {
    setSaveFeedback(null);
    try {
      await onSubmit(values);
      setSaveFeedback({
        type: 'success',
        message:
          'บันทึกบัญชีธนาคารในระบบแล้ว — ขั้นถัดไปกดยืนยันกับ Omise (ถ้าต้องการรับเงิน Omise)',
      });
    } catch (err) {
      setSaveFeedback({
        type: 'error',
        message: err instanceof Error ? err.message : 'บันทึกไม่สำเร็จ',
      });
    }
  }

  return (
    <Card>
      <CardHeader className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          ขั้นตอน 1
        </p>
        <h2 className="font-display text-lg font-medium text-ink text-balance">
          บัญชีธนาคารรับเงิน
        </h2>
        <p className="text-sm text-muted-foreground">
          บันทึกลงฐานข้อมูล SOPET เท่านั้น — ยังไม่ส่งไป Omise จนกว่าจะกดยืนยันในขั้นตอนถัดไป
        </p>
      </CardHeader>
      <CardBody>
        {loading ? (
          <AccountSkeleton />
        ) : (
          <form
            onSubmit={form.handleSubmit((values) => void handleSubmit(values))}
            className="space-y-5"
          >
            {store?.bankName && store.bankAccountNumber ? (
              <p className="text-sm text-muted-foreground">
                บัญชีที่บันทึกไว้:{' '}
                <span className="font-medium text-ink">
                  {store.bankName} · •••• {store.bankAccountNumber.slice(-4)}
                  {store.bankAccountName ? ` · ${store.bankAccountName}` : ''}
                </span>
              </p>
            ) : null}

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label htmlFor="bankCode" required>
                  ธนาคาร
                </Label>
                <Controller
                  control={form.control}
                  name="bankCode"
                  render={({ field }) => (
                    <Select
                      key={field.value ?? 'empty'}
                      value={field.value ?? ''}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger
                        id="bankCode"
                        aria-invalid={!!form.formState.errors.bankCode}
                        aria-describedby={
                          form.formState.errors.bankCode ? 'bankCode-error' : undefined
                        }
                        className="mt-1.5"
                      >
                        <SelectValue placeholder="เลือกธนาคาร" />
                      </SelectTrigger>
                      <SelectContent>
                        {THAI_BANKS.map((bank) => (
                          <SelectItem key={bank.code} value={bank.code}>
                            {bank.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {form.formState.errors.bankCode ? (
                  <p id="bankCode-error" className="mt-1 text-xs text-danger" role="alert">
                    {form.formState.errors.bankCode.message}
                  </p>
                ) : null}
              </div>

              <div>
                <Label htmlFor="bankAccountName" required>
                  ชื่อบัญชี
                </Label>
                <Input
                  id="bankAccountName"
                  autoComplete="name"
                  placeholder="ชื่อบัญชีตามหน้าสมุดธนาคาร"
                  aria-invalid={!!form.formState.errors.bankAccountName}
                  aria-describedby={
                    form.formState.errors.bankAccountName ? 'bankAccountName-error' : undefined
                  }
                  {...form.register('bankAccountName')}
                  className="mt-1.5"
                />
                {form.formState.errors.bankAccountName ? (
                  <p id="bankAccountName-error" className="mt-1 text-xs text-danger" role="alert">
                    {form.formState.errors.bankAccountName.message}
                  </p>
                ) : null}
              </div>

              <div>
                <Label htmlFor="bankAccountNumber" required>
                  เลขที่บัญชี
                </Label>
                <Controller
                  control={form.control}
                  name="bankAccountNumber"
                  render={({ field }) => (
                    <Input
                      id="bankAccountNumber"
                      inputMode="numeric"
                      autoComplete="off"
                      placeholder="xxx-x-xxxxx-x"
                      aria-invalid={!!form.formState.errors.bankAccountNumber}
                      aria-describedby={
                        form.formState.errors.bankAccountNumber
                          ? 'bankAccountNumber-error'
                          : 'bankAccountNumber-hint'
                      }
                      value={field.value}
                      onBlur={field.onBlur}
                      name={field.name}
                      ref={field.ref}
                      onChange={(event) => {
                        field.onChange(formatThaiBankAccountNumber(event.target.value));
                      }}
                      className="mt-1.5 tabular-nums tracking-wide"
                    />
                  )}
                />
                <p id="bankAccountNumber-hint" className="mt-1 text-xs text-muted-foreground">
                  รูปแบบทั่วไป xxx-x-xxxxx-x (10–15 หลัก)
                </p>
                {form.formState.errors.bankAccountNumber ? (
                  <p id="bankAccountNumber-error" className="mt-1 text-xs text-danger" role="alert">
                    {form.formState.errors.bankAccountNumber.message}
                  </p>
                ) : null}
              </div>
            </div>

            {saveFeedback ? (
              <div
                className={cn(
                  'flex items-start gap-2 rounded-lg border px-3 py-2.5 text-sm',
                  saveFeedback.type === 'success'
                    ? 'border-success/25 bg-success-bg text-success'
                    : 'border-danger/25 bg-danger-bg text-danger',
                )}
                role={saveFeedback.type === 'error' ? 'alert' : 'status'}
                aria-live="polite"
              >
                {saveFeedback.type === 'success' ? (
                  <HiOutlineCheckCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
                ) : null}
                <p className="font-medium">{saveFeedback.message}</p>
              </div>
            ) : null}

            <Button type="submit" disabled={saving} aria-busy={saving} className="w-full sm:w-auto">
              {saving ? 'กำลังบันทึก...' : 'บันทึกบัญชีธนาคาร'}
            </Button>
          </form>
        )}
      </CardBody>
    </Card>
  );
}
