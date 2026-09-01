'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
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
import { useBankTransferSettings, useUpdateBankTransferDetails } from '@/hooks/usePlatformSettings';
import { getErrorMessage } from '@/lib/api/errors';
import { formatThaiBankAccountNumber } from '@/lib/banks/formatThaiBankAccountNumber';
import { THAI_BANKS } from '@/lib/constants/thai-banks';
import { bankTransferFormSchema, type BankTransferFormValues } from '@/lib/validations';
import {
  ListRowSkeleton,
  PlatformSettingsLoadError,
  PlatformSettingsMutationError,
} from './platform-settings-primitives';

const EMPTY_FORM: BankTransferFormValues = {
  enabled: false,
  bankName: '',
  accountName: '',
  accountNumber: '',
};

/** Map legacy free-text bank names onto the canonical THAI_BANKS list. */
function resolveThaiBankName(saved: string | null | undefined): string {
  const trimmed = saved?.trim() ?? '';
  if (!trimmed) return '';

  const exact = THAI_BANKS.find((bank) => bank.name === trimmed);
  if (exact) return exact.name;

  const withoutPrefix = trimmed.replace(/^ธนาคาร/, '').trim();
  const fuzzy = THAI_BANKS.find((bank) => {
    const bankShort = bank.name.replace(/^ธนาคาร/, '').trim();
    return (
      bank.name.includes(trimmed) ||
      trimmed.includes(bankShort) ||
      bankShort.includes(withoutPrefix) ||
      withoutPrefix.includes(bankShort)
    );
  });
  return fuzzy?.name ?? trimmed;
}

export function BankTransferSettingsPanel() {
  const { data, isLoading, error: loadError, refetch } = useBankTransferSettings();
  const updateMutation = useUpdateBankTransferDetails();
  const [savedMessage, setSavedMessage] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const form = useForm<BankTransferFormValues>({
    resolver: zodResolver(bankTransferFormSchema),
    defaultValues: EMPTY_FORM,
  });

  const enabled = useWatch({ control: form.control, name: 'enabled' });
  const bankName = useWatch({ control: form.control, name: 'bankName' });
  const bankOptions =
    bankName && !THAI_BANKS.some((bank) => bank.name === bankName)
      ? [{ code: 'custom', name: bankName }, ...THAI_BANKS]
      : THAI_BANKS;

  useEffect(() => {
    if (!data) return;
    form.reset({
      enabled: data.enabled === true,
      bankName: resolveThaiBankName(data.bankName),
      accountName: data.accountName ?? '',
      accountNumber: formatThaiBankAccountNumber(data.accountNumber ?? ''),
    });
  }, [data, form]);

  const onSubmit = form.handleSubmit(async (values) => {
    setSavedMessage(null);
    setActionError(null);
    try {
      await updateMutation.mutateAsync({
        ...values,
        accountNumber: formatThaiBankAccountNumber(values.accountNumber),
      });
      setSavedMessage(
        values.enabled
          ? 'บันทึกแล้ว — แสดงโอนเงินเข้าบัญชีบน Checkout'
          : 'บันทึกแล้ว — ซ่อนโอนเงินเข้าบัญชีจาก Checkout',
      );
    } catch (error) {
      setActionError(getErrorMessage(error, 'บันทึกไม่สำเร็จ'));
    }
  });

  return (
    <Card>
      <CardHeader>
        <h2 className="font-display font-medium text-ink">บัญชีรับโอนเงิน</h2>
        <p className="text-sm text-muted">
          เมื่อปิดใช้งาน ตัวเลือกโอนเงินจะถูกซ่อนจากหน้า Checkout ของลูกค้า
        </p>
      </CardHeader>
      <CardBody className="space-y-4">
        {isLoading ? (
          <ListRowSkeleton />
        ) : loadError ? (
          <PlatformSettingsLoadError
            message="โหลดข้อมูลบัญชีไม่สำเร็จ"
            detail={loadError}
            onRetry={() => void refetch()}
          />
        ) : (
          <form className="space-y-4" onSubmit={onSubmit}>
            <label className="flex items-start gap-3 rounded-lg border border-border bg-surface/40 px-4 py-3">
              <input
                type="checkbox"
                className="mt-1 size-4 accent-primary"
                {...form.register('enabled')}
              />
              <span>
                <span className="block text-sm font-medium text-ink">
                  เปิดใช้งานโอนเงินเข้าบัญชีบน Checkout
                </span>
                <span className="mt-0.5 block text-sm text-muted">
                  {enabled
                    ? 'ลูกค้าจะเห็นตัวเลือกนี้เมื่อกรอกบัญชีครบ'
                    : 'ซ่อนจาก Checkout (ค่าเริ่มต้น)'}
                </span>
              </span>
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="bankName">ธนาคาร</Label>
                <Controller
                  control={form.control}
                  name="bankName"
                  render={({ field }) => (
                    <Select
                      key={field.value || 'empty'}
                      value={field.value || undefined}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger
                        id="bankName"
                        aria-invalid={!!form.formState.errors.bankName}
                        aria-describedby={
                          form.formState.errors.bankName ? 'bankName-error' : undefined
                        }
                      >
                        <SelectValue placeholder="เลือกธนาคาร" />
                      </SelectTrigger>
                      <SelectContent>
                        {bankOptions.map((bank) => (
                          <SelectItem key={bank.code} value={bank.name}>
                            {bank.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {form.formState.errors.bankName ? (
                  <p id="bankName-error" className="text-sm text-destructive" role="alert">
                    {form.formState.errors.bankName.message}
                  </p>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="accountName">ชื่อบัญชี</Label>
                <Input
                  id="accountName"
                  {...form.register('accountName')}
                  placeholder="ชื่อบัญชี SOPET"
                />
                {form.formState.errors.accountName ? (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.accountName.message}
                  </p>
                ) : null}
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="accountNumber">เลขบัญชี</Label>
                <Controller
                  control={form.control}
                  name="accountNumber"
                  render={({ field }) => (
                    <Input
                      id="accountNumber"
                      inputMode="numeric"
                      autoComplete="off"
                      placeholder="xxx-x-xxxxx-x"
                      aria-invalid={!!form.formState.errors.accountNumber}
                      aria-describedby={
                        form.formState.errors.accountNumber ? 'accountNumber-error' : undefined
                      }
                      value={field.value}
                      onBlur={field.onBlur}
                      name={field.name}
                      ref={field.ref}
                      onChange={(event) => {
                        field.onChange(formatThaiBankAccountNumber(event.target.value));
                      }}
                    />
                  )}
                />
                {form.formState.errors.accountNumber ? (
                  <p id="accountNumber-error" className="text-sm text-destructive" role="alert">
                    {form.formState.errors.accountNumber.message}
                  </p>
                ) : null}
              </div>
            </div>

            {actionError ? <PlatformSettingsMutationError message={actionError} /> : null}
            {savedMessage ? <p className="text-sm text-success">{savedMessage}</p> : null}

            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? 'กำลังบันทึก...' : 'บันทึกบัญชีรับโอน'}
            </Button>
          </form>
        )}
      </CardBody>
    </Card>
  );
}
