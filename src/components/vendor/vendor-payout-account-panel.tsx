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
import type { OmiseRecipientStatus, StoreDetail } from '@/types';
import { cn } from '@/lib/utils';

const OMISE_STATUS_INFO: Record<
  OmiseRecipientStatus,
  { label: string; description: string; className: string; dotClassName: string }
> = {
  not_connected: {
    label: 'ยังไม่ได้เชื่อมต่อ',
    description: 'บันทึกบัญชีธนาคารเพื่อเริ่มรับเงินจากยอดขาย',
    className: 'border-border bg-surface text-ink',
    dotClassName: 'bg-muted',
  },
  pending: {
    label: 'รอการยืนยันบัญชี',
    description: 'ระบบกำลังตรวจสอบบัญชี คุณสามารถขอรับเงินได้เมื่อสถานะเป็น “พร้อมรับเงิน”',
    className: 'border-warning-text/20 bg-warning-bg text-warning-text',
    dotClassName: 'bg-warning-text',
  },
  active: {
    label: 'พร้อมรับเงิน',
    description: 'บัญชีพร้อมรับเงินแล้ว ระบบสามารถโอนเงินเข้าบัญชีนี้ได้',
    className: 'border-success/25 bg-success-bg text-success',
    dotClassName: 'bg-success',
  },
  failed: {
    label: 'เชื่อมต่อไม่สำเร็จ',
    description: 'ตรวจสอบข้อมูลบัญชีแล้วบันทึกใหม่ หรือติดต่อทีมสนับสนุน',
    className: 'border-danger/30 bg-danger-bg text-danger',
    dotClassName: 'bg-danger',
  },
};

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
      <div className="h-20 animate-pulse rounded-xl bg-surface motion-reduce:animate-none" />
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
  const status = (store?.omiseRecipientStatus ?? 'not_connected') as OmiseRecipientStatus;
  const info = OMISE_STATUS_INFO[status] ?? OMISE_STATUS_INFO.not_connected;
  const maskedAccount =
    store?.bankAccountNumber && store.bankAccountNumber.length > 4
      ? `•••• ${store.bankAccountNumber.slice(-4)}`
      : store?.bankAccountNumber;
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
      setSaveFeedback({ type: 'success', message: 'บันทึกบัญชีรับเงินแล้ว' });
    } catch (err) {
      setSaveFeedback({
        type: 'error',
        message: err instanceof Error ? err.message : 'บันทึกไม่สำเร็จ',
      });
    }
  }

  return (
    <Card className="h-full">
      <CardHeader className="space-y-1 bg-surface/60">
        <h2 className="font-display text-lg font-medium text-ink text-balance">บัญชีรับเงิน</h2>
        <p className="text-sm text-muted-foreground">
          บัญชีธนาคารที่ระบบจะโอนเงินรายได้เข้าให้ร้าน
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
            <div
              className={cn('rounded-xl border px-4 py-3', info.className)}
              role="status"
              aria-live="polite"
            >
              <div className="flex items-start gap-3">
                <span
                  className={cn('mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full', info.dotClassName)}
                  aria-hidden
                />
                <div className="min-w-0">
                  <p className="text-sm font-medium">{info.label}</p>
                  <p className="mt-0.5 text-xs leading-relaxed opacity-90">{info.description}</p>
                  {status === 'failed' && store?.omiseRecipientFailureMessage ? (
                    <p className="mt-2 text-xs font-medium">{store.omiseRecipientFailureMessage}</p>
                  ) : null}
                  {status === 'active' && store?.bankName && maskedAccount ? (
                    <p className="mt-2 text-xs opacity-80">
                      {store.bankName} · {maskedAccount}
                      {store.bankAccountName ? ` · ${store.bankAccountName}` : ''}
                    </p>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="bankCode" required>
                  ธนาคาร
                </Label>
                <Controller
                  control={form.control}
                  name="bankCode"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
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
                <Input
                  id="bankAccountNumber"
                  inputMode="numeric"
                  autoComplete="off"
                  placeholder="เลขที่บัญชีธนาคาร"
                  aria-invalid={!!form.formState.errors.bankAccountNumber}
                  aria-describedby={
                    form.formState.errors.bankAccountNumber ? 'bankAccountNumber-error' : undefined
                  }
                  {...form.register('bankAccountNumber')}
                  className="mt-1.5"
                />
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
              {saving ? 'กำลังบันทึก...' : 'บันทึกบัญชีรับเงิน'}
            </Button>
          </form>
        )}
      </CardBody>
    </Card>
  );
}
