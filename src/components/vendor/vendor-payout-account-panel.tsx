'use client';

import { useEffect, useId, useState } from 'react';
import { Controller, type UseFormReturn } from 'react-hook-form';
import { HiOutlineCheckCircle, HiOutlinePencilSquare } from 'react-icons/hi2';
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
import { getBankAccountTheme } from '@/lib/banks/bank-account-theme';
import {
  formatThaiBankAccountNumber,
  sanitizeBankAccountDigits,
} from '@/lib/banks/formatThaiBankAccountNumber';
import { THAI_BANKS } from '@/lib/constants/thai-banks';
import type { PayoutFormValues } from '@/lib/validations';
import type { StoreDetail } from '@/types';
import { cn } from '@/lib/utils';
import { getErrorMessage } from '@/lib/api/errors';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

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
      <div className="h-28 animate-pulse rounded-lg border border-border bg-surface motion-reduce:animate-none" />
      <span className="sr-only">กำลังโหลด...</span>
    </div>
  );
}

type SavedBankAccountProps = {
  bankName: string;
  bankCode?: string | null;
  accountName?: string;
  accountNumber: string;
  onEdit: () => void;
};

function SavedBankAccount({
  bankName,
  bankCode,
  accountName,
  accountNumber,
  onEdit,
}: SavedBankAccountProps) {
  const theme = getBankAccountTheme(bankCode);
  const titleId = useId();
  const formattedNumber = formatThaiBankAccountNumber(accountNumber);
  const holder = accountName?.trim() || '—';

  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-5">
        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex items-center gap-2.5">
            <span
              aria-hidden
              className="inline-flex h-8 w-14 shrink-0 items-center justify-center rounded-md text-[11px] font-bold tracking-wider"
              style={{ backgroundColor: theme.brand, color: theme.onBrand }}
            >
              {theme.shortCode}
            </span>
            <p id={titleId} className="truncate font-display text-base font-medium text-ink">
              {bankName}
            </p>
          </div>

          <dl className="grid gap-3 border-t border-border/80 pt-3 sm:grid-cols-2 sm:gap-8">
            <div className="min-w-0">
              <dt className="text-xs text-muted-foreground">เลขที่บัญชี</dt>
              <dd className="mt-0.5 font-display text-lg font-semibold tabular-nums tracking-wide text-ink">
                {formattedNumber}
              </dd>
            </div>
            <div className="min-w-0">
              <dt className="text-xs text-muted-foreground">ชื่อบัญชี</dt>
              <dd className="mt-0.5 truncate text-sm font-medium text-ink">{holder}</dd>
            </div>
          </dl>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onEdit}
          aria-labelledby={titleId}
          className="w-full shrink-0 sm:w-auto"
        >
          <HiOutlinePencilSquare className="size-3.5 shrink-0" aria-hidden />
          แก้ไข
        </Button>
      </div>
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
  const hasSavedAccount = Boolean(store?.bankName && store.bankAccountNumber);
  const [userEditing, setUserEditing] = useState(false);
  const showForm = !hasSavedAccount || userEditing;
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingValues, setPendingValues] = useState<PayoutFormValues | null>(null);
  const [saveFeedback, setSaveFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const omiseWasLinked =
    store?.omiseRecipientStatus === 'active' ||
    store?.omiseRecipientStatus === 'pending' ||
    Boolean(store?.omiseRecipientId);

  useEffect(() => {
    if (!saveFeedback || saveFeedback.type !== 'success') return;
    const timer = window.setTimeout(() => setSaveFeedback(null), 4000);
    return () => window.clearTimeout(timer);
  }, [saveFeedback]);

  function bankDetailsChanged(values: PayoutFormValues): boolean {
    if (!store?.bankAccountNumber) return false;
    const nextDigits = sanitizeBankAccountDigits(values.bankAccountNumber);
    const prevDigits = sanitizeBankAccountDigits(store.bankAccountNumber ?? '');
    const prevCode =
      store.bankCode ?? THAI_BANKS.find((bank) => bank.name === store.bankName)?.code ?? '';
    return (
      values.bankCode !== prevCode ||
      nextDigits !== prevDigits ||
      values.bankAccountName.trim() !== (store.bankAccountName ?? '').trim()
    );
  }

  async function persistPayout(values: PayoutFormValues) {
    setSaveFeedback(null);
    try {
      await onSubmit(values);
      setUserEditing(false);
      setConfirmOpen(false);
      setPendingValues(null);
      setSaveFeedback({
        type: 'success',
        message: omiseWasLinked
          ? 'บันทึกบัญชีแล้ว — สถานะ Omise ถูกยกเลิกการยืนยันแล้ว กรุณายืนยันกับ Omise อีกครั้งในขั้นตอน 2'
          : 'บันทึกบัญชีธนาคารในระบบแล้ว — ขั้นถัดไปกดยืนยันกับ Omise (ถ้าต้องการรับเงิน Omise)',
      });
    } catch (err) {
      setSaveFeedback({
        type: 'error',
        message: getErrorMessage(err, 'บันทึกไม่สำเร็จ'),
      });
      setConfirmOpen(false);
    }
  }

  function handleValidatedSubmit(values: PayoutFormValues) {
    if (hasSavedAccount && bankDetailsChanged(values)) {
      setPendingValues(values);
      setConfirmOpen(true);
      return;
    }
    void persistPayout(values);
  }

  function handleCancelEdit() {
    if (store) {
      const resolvedCode =
        store.bankCode ?? THAI_BANKS.find((bank) => bank.name === store.bankName)?.code ?? '';
      form.reset({
        bankCode: resolvedCode,
        bankAccountName: store.bankAccountName ?? '',
        bankAccountNumber: formatThaiBankAccountNumber(store.bankAccountNumber ?? ''),
      });
    }
    setSaveFeedback(null);
    setConfirmOpen(false);
    setPendingValues(null);
    setUserEditing(false);
  }

  const resolvedBankCode =
    store?.bankCode ?? THAI_BANKS.find((bank) => bank.name === store?.bankName)?.code ?? null;

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
        ) : !showForm && hasSavedAccount ? (
          <div className="space-y-4">
            <SavedBankAccount
              bankName={store!.bankName!}
              bankCode={resolvedBankCode}
              accountName={store!.bankAccountName}
              accountNumber={store!.bankAccountNumber!}
              onEdit={() => setUserEditing(true)}
            />
            {saveFeedback?.type === 'success' ? (
              <div
                className="flex items-start gap-2 rounded-lg border border-success-text/30 bg-success-bg px-3 py-2.5 text-sm text-success-text"
                role="status"
                aria-live="polite"
              >
                <HiOutlineCheckCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
                <p className="font-medium">{saveFeedback.message}</p>
              </div>
            ) : null}
          </div>
        ) : (
          <form
            onSubmit={form.handleSubmit((values) => handleValidatedSubmit(values))}
            className="space-y-5"
          >
            {hasSavedAccount ? (
              <p className="text-sm text-muted-foreground">แก้ไขบัญชีธนาคารที่บันทึกไว้</p>
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
                    ? 'border-success-text/30 bg-success-bg text-success-text'
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

            <div className="flex flex-wrap gap-2">
              <Button
                type="submit"
                disabled={saving}
                aria-busy={saving}
                className="w-full sm:w-auto"
              >
                {saving ? 'กำลังบันทึก...' : 'บันทึกบัญชีธนาคาร'}
              </Button>
              {hasSavedAccount ? (
                <Button
                  type="button"
                  variant="outline"
                  disabled={saving}
                  onClick={handleCancelEdit}
                  className="w-full sm:w-auto"
                >
                  ยกเลิก
                </Button>
              ) : null}
            </div>
          </form>
        )}

        <Dialog
          open={confirmOpen}
          onOpenChange={(open) => {
            if (saving) return;
            setConfirmOpen(open);
            if (!open) setPendingValues(null);
          }}
        >
          <DialogContent className="bg-card">
            <DialogHeader>
              <DialogTitle>ยืนยันการเปลี่ยนบัญชีรับเงิน</DialogTitle>
              <DialogDescription>
                การเปลี่ยนบัญชีธนาคารจะบันทึกข้อมูลใหม่ใน SOPET
                {omiseWasLinked
                  ? ' และยกเลิกสถานะยืนยัน Omise ของบัญชีเดิม — ต้องส่งยืนยันกับ Omise อีกครั้งก่อนรับเงินผ่าน PromptPay / บัตร'
                  : ' — ยอดโอน Manual ยังใช้บัญชีใหม่ได้ทันทีหลังบันทึก'}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                disabled={saving}
                onClick={() => {
                  setConfirmOpen(false);
                  setPendingValues(null);
                }}
              >
                ยกเลิก
              </Button>
              <Button
                type="button"
                disabled={saving || !pendingValues}
                aria-busy={saving}
                onClick={() => {
                  if (pendingValues) void persistPayout(pendingValues);
                }}
              >
                {saving ? 'กำลังบันทึก...' : 'ยืนยันและบันทึก'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardBody>
    </Card>
  );
}
