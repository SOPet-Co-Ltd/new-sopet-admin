'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { DateTimePicker } from '@/components/ui/date-time-picker';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  useStorefrontMaintenance,
  useUpdateStorefrontMaintenance,
} from '@/hooks/usePlatformSettings';
import { getErrorMessage } from '@/lib/api/errors';
import {
  storefrontMaintenanceFormSchema,
  type StorefrontMaintenanceFormValues,
  type StorefrontMaintenanceReason,
} from '@/lib/validations';
import {
  ListRowSkeleton,
  PlatformSettingsLoadError,
  PlatformSettingsMutationError,
} from './platform-settings-primitives';

const REASON_OPTIONS: Array<{ value: StorefrontMaintenanceReason; label: string }> = [
  { value: 'MAINTENANCE', label: 'ปิดปรับปรุง' },
  { value: 'NOT_READY', label: 'ยังไม่เปิดให้ใช้' },
  { value: 'SYSTEM_UPDATE', label: 'อัพเดทระบบ' },
  { value: 'OTHER', label: 'อื่นๆ' },
];

const EMPTY_FORM: StorefrontMaintenanceFormValues = {
  enabled: false,
  reason: null,
  customMessage: '',
  untilAt: '',
};

function pad2(value: number): string {
  return String(value).padStart(2, '0');
}

/** Convert API ISO datetime to DateTimePicker local `YYYY-MM-DDTHH:mm`. */
function isoToPickerValue(iso: string | null | undefined): string {
  if (!iso?.trim()) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}T${pad2(date.getHours())}:${pad2(date.getMinutes())}`;
}

/** Convert picker local value to ISO for the API. */
function pickerValueToIso(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const date = new Date(trimmed);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}

/** Local now as DateTimePicker min (`YYYY-MM-DDTHH:mm`). */
function localNowPickerMin(): string {
  const date = new Date();
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}T${pad2(date.getHours())}:${pad2(date.getMinutes())}`;
}

export function StorefrontMaintenancePanel() {
  const { data, isLoading, error: loadError, refetch } = useStorefrontMaintenance();
  const updateMutation = useUpdateStorefrontMaintenance();
  const [savedMessage, setSavedMessage] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const form = useForm<StorefrontMaintenanceFormValues>({
    resolver: zodResolver(storefrontMaintenanceFormSchema),
    defaultValues: EMPTY_FORM,
  });

  const enabled = useWatch({ control: form.control, name: 'enabled' });
  const reason = useWatch({ control: form.control, name: 'reason' });

  useEffect(() => {
    if (!data) return;
    form.reset({
      enabled: data.enabled === true,
      reason: data.reason ?? null,
      customMessage: data.customMessage ?? '',
      untilAt: isoToPickerValue(data.untilAt),
    });
  }, [data, form]);

  const onSubmit = form.handleSubmit(async (values) => {
    setSavedMessage(null);
    setActionError(null);
    try {
      await updateMutation.mutateAsync({
        enabled: values.enabled,
        reason: values.enabled ? values.reason : null,
        customMessage:
          values.enabled && values.reason === 'OTHER' ? values.customMessage.trim() : null,
        untilAt: values.enabled ? pickerValueToIso(values.untilAt) : null,
      });
      setSavedMessage(
        values.enabled
          ? 'บันทึกแล้ว — หน้าร้านปิด (แสดงหน้าบำรุงรักษา)'
          : 'บันทึกแล้ว — หน้าร้านเปิดตามปกติ',
      );
    } catch (error) {
      setActionError(getErrorMessage(error, 'บันทึกไม่สำเร็จ'));
    }
  });

  return (
    <Card>
      <CardHeader>
        <h2 className="font-display font-medium text-ink">สถานะหน้าร้าน</h2>
        <p className="text-sm text-muted">
          เมื่อปิดหน้าร้าน ลูกค้าที่เข้าเว็บจะถูกนำไปยังหน้าบำรุงรักษา หากกำหนดเวลาสิ้นสุด
          ระบบจะเปิดหน้าร้านให้อัตโนมัติเมื่อครบเวลา
        </p>
      </CardHeader>
      <CardBody className="space-y-4">
        {isLoading ? (
          <ListRowSkeleton />
        ) : loadError ? (
          <PlatformSettingsLoadError
            message="โหลดสถานะหน้าร้านไม่สำเร็จ"
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
                  ปิดหน้าร้าน (แสดงหน้าบำรุงรักษา)
                </span>
                <span className="mt-0.5 block text-sm text-muted">
                  {enabled
                    ? 'ลูกค้าจะเห็นหน้าบำรุงรักษาแทนหน้าร้านปกติ'
                    : 'หน้าร้านเปิดตามปกติ (ค่าเริ่มต้น)'}
                </span>
              </span>
            </label>

            {enabled ? (
              <div className="space-y-4 rounded-lg border border-border p-4">
                <div className="space-y-2">
                  <Label htmlFor="storefront-maintenance-reason">เหตุผล</Label>
                  <Controller
                    control={form.control}
                    name="reason"
                    render={({ field }) => (
                      <Select
                        key={field.value ?? 'empty'}
                        value={field.value ?? undefined}
                        onValueChange={(value) =>
                          field.onChange(value as StorefrontMaintenanceReason)
                        }
                      >
                        <SelectTrigger
                          id="storefront-maintenance-reason"
                          aria-invalid={!!form.formState.errors.reason}
                        >
                          <SelectValue placeholder="เลือกเหตุผล" />
                        </SelectTrigger>
                        <SelectContent>
                          {REASON_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {form.formState.errors.reason ? (
                    <p className="text-sm text-destructive" role="alert">
                      {form.formState.errors.reason.message}
                    </p>
                  ) : null}
                </div>

                {reason === 'OTHER' ? (
                  <div className="space-y-2">
                    <Label htmlFor="storefront-maintenance-custom">รายละเอียดเพิ่มเติม</Label>
                    <Input
                      id="storefront-maintenance-custom"
                      {...form.register('customMessage')}
                      placeholder="เช่น กำลังย้ายเซิร์ฟเวอร์"
                      aria-invalid={!!form.formState.errors.customMessage}
                    />
                    {form.formState.errors.customMessage ? (
                      <p className="text-sm text-destructive" role="alert">
                        {form.formState.errors.customMessage.message}
                      </p>
                    ) : null}
                  </div>
                ) : null}

                <div className="space-y-2">
                  <Label htmlFor="storefront-maintenance-until">ถึงเมื่อไหร่ (ไม่บังคับ)</Label>
                  <Controller
                    control={form.control}
                    name="untilAt"
                    render={({ field }) => (
                      <DateTimePicker
                        id="storefront-maintenance-until"
                        mode="datetime"
                        placeholder="เว้นว่าง = เปิดเองด้วยมือ"
                        value={field.value}
                        onChange={field.onChange}
                        min={localNowPickerMin()}
                        aria-invalid={!!form.formState.errors.untilAt}
                        className="mt-0"
                      />
                    )}
                  />
                  <p className="text-sm text-muted">
                    หากระบุเวลา ระบบจะเปิดหน้าร้านให้อัตโนมัติเมื่อครบกำหนด
                  </p>
                  {form.formState.errors.untilAt ? (
                    <p className="text-sm text-destructive" role="alert">
                      {form.formState.errors.untilAt.message}
                    </p>
                  ) : null}
                </div>
              </div>
            ) : null}

            {actionError ? <PlatformSettingsMutationError message={actionError} /> : null}
            {savedMessage ? <p className="text-sm text-success">{savedMessage}</p> : null}

            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? 'กำลังบันทึก...' : 'บันทึกสถานะหน้าร้าน'}
            </Button>
          </form>
        )}
      </CardBody>
    </Card>
  );
}
