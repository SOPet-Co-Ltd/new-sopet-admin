'use client';

import { useEffect, useState } from 'react';
import {
  HiOutlineBuildingOffice2,
  HiOutlineCheckCircle,
  HiOutlinePlus,
  HiOutlineTruck,
} from 'react-icons/hi2';
import { Badge } from '@/components/ui/badge';
import { ConfirmDeleteButton } from '@/components/ui/confirm-delete-button';
import { Button } from '@/components/ui/button';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  useCreateShippingProvider,
  useDeleteShippingProvider,
  useShippingProviders,
  useUpdateShippingProvider,
} from '@/hooks/useShipping';
import { cn } from '@/lib/utils';
import type { ShippingProvider } from '@/types';
import { activeStatusBadgeClass } from './shipping-helpers';

function ProvidersSkeleton() {
  return (
    <ul className="divide-y divide-border" aria-busy="true" aria-live="polite">
      {[0, 1, 2].map((i) => (
        <li key={i} className="flex items-center gap-4 px-5 py-4 md:px-6" aria-hidden>
          <div className="h-10 w-10 shrink-0 animate-pulse rounded-xl bg-surface motion-reduce:animate-none" />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="h-4 w-36 animate-pulse rounded bg-surface motion-reduce:animate-none" />
            <div className="h-3 w-20 animate-pulse rounded bg-surface motion-reduce:animate-none" />
          </div>
          <div className="h-8 w-24 animate-pulse rounded-md bg-surface motion-reduce:animate-none" />
        </li>
      ))}
      <li className="sr-only">กำลังโหลดผู้ให้บริการจัดส่ง...</li>
    </ul>
  );
}

export function ShippingProvidersPanel() {
  const { data: providers = [], isLoading, error } = useShippingProviders(true);
  const createProvider = useCreateShippingProvider();
  const updateProvider = useUpdateShippingProvider();
  const deleteProvider = useDeleteShippingProvider();

  const [providerNameInput, setProviderNameInput] = useState('');
  const [editingProvider, setEditingProvider] = useState<ShippingProvider | null>(null);
  const [editProviderName, setEditProviderName] = useState('');
  const [editProviderActive, setEditProviderActive] = useState(true);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const activeCount = providers.filter((p) => p.isActive).length;
  const inactiveCount = providers.length - activeCount;
  const mutationPending =
    createProvider.isPending || updateProvider.isPending || deleteProvider.isPending;

  useEffect(() => {
    if (!successMessage) return;
    const timer = window.setTimeout(() => setSuccessMessage(null), 4000);
    return () => window.clearTimeout(timer);
  }, [successMessage]);

  async function handleCreateProvider(e: React.FormEvent) {
    e.preventDefault();
    const name = providerNameInput.trim();
    if (!name) return;
    try {
      await createProvider.mutateAsync({ name });
      setProviderNameInput('');
      setSuccessMessage(`เพิ่มผู้ให้บริการ “${name}” แล้ว`);
    } catch {
      // surfaced via mutation state
    }
  }

  async function handleUpdateProvider(e: React.FormEvent) {
    e.preventDefault();
    if (!editingProvider) return;
    try {
      await updateProvider.mutateAsync({
        id: editingProvider.id,
        input: { name: editProviderName.trim(), isActive: editProviderActive },
      });
      setSuccessMessage('อัปเดตผู้ให้บริการแล้ว');
      setEditingProvider(null);
    } catch {
      // surfaced via mutation state
    }
  }

  return (
    <section aria-labelledby="admin-shipping-providers-heading" className="space-y-4">
      {successMessage ? (
        <div
          className="flex items-start gap-3 rounded-xl border border-success/25 bg-success-bg px-4 py-3 text-success"
          role="status"
          aria-live="polite"
        >
          <HiOutlineCheckCircle className="mt-0.5 size-5 shrink-0" aria-hidden />
          <p className="text-sm font-medium">{successMessage}</p>
        </div>
      ) : null}

      <Card className="overflow-hidden">
        <CardHeader className="border-b border-border bg-surface/60 px-5 py-5 md:px-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <h2
                id="admin-shipping-providers-heading"
                className="font-display text-lg font-medium text-ink text-balance"
              >
                ผู้ให้บริการจัดส่ง
              </h2>
              <p className="mt-1 max-w-2xl text-sm text-muted-foreground text-pretty">
                รายชื่อขนส่งระดับแพลตฟอร์มที่ร้านค้าเลือกผูกกับตัวเลือกจัดส่ง
                ผู้ให้บริการที่ปิดใช้งานจะไม่แสดงในรายการเลือกของร้านใหม่
              </p>
            </div>
          </div>

          <form
            onSubmit={handleCreateProvider}
            className="mt-5 flex flex-wrap items-end gap-3 border-t border-border pt-5"
          >
            <div className="min-w-[200px] flex-1">
              <Label htmlFor="new-provider" required>
                เพิ่มผู้ให้บริการ
              </Label>
              <Input
                id="new-provider"
                value={providerNameInput}
                onChange={(e) => setProviderNameInput(e.target.value)}
                placeholder="เช่น Kerry, Flash Express"
                className="mt-1.5"
                disabled={mutationPending}
              />
            </div>
            <Button
              type="submit"
              disabled={createProvider.isPending || !providerNameInput.trim()}
              aria-busy={createProvider.isPending}
            >
              <HiOutlinePlus className="size-4" aria-hidden />
              {createProvider.isPending ? 'กำลังสร้าง...' : 'เพิ่ม'}
            </Button>
          </form>

          {createProvider.error ? (
            <p className="mt-3 text-sm text-danger" role="alert">
              {createProvider.error instanceof Error
                ? createProvider.error.message
                : 'สร้างผู้ให้บริการไม่สำเร็จ'}
            </p>
          ) : null}

          {!isLoading && providers.length > 0 ? (
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="inline-flex items-center rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-ink">
                ทั้งหมด {providers.length}
              </span>
              <span className="inline-flex items-center rounded-full border border-success/25 bg-success-bg px-3 py-1 text-xs font-medium text-success">
                ใช้งาน {activeCount}
              </span>
              {inactiveCount > 0 ? (
                <span className="inline-flex items-center rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-muted-foreground">
                  ปิดใช้งาน {inactiveCount}
                </span>
              ) : null}
            </div>
          ) : null}
        </CardHeader>

        <CardBody className="p-0">
          {isLoading ? <ProvidersSkeleton /> : null}

          {error ? (
            <div className="px-5 py-8 text-center md:px-6">
              <p className="text-sm text-danger">
                {error instanceof Error ? error.message : 'โหลดผู้ให้บริการไม่สำเร็จ'}
              </p>
            </div>
          ) : null}

          {!isLoading && !error && providers.length === 0 ? (
            <div className="flex flex-col items-center px-5 py-12 text-center md:px-6">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-tint text-brand">
                <HiOutlineBuildingOffice2 className="size-7" aria-hidden />
              </div>
              <h3 className="font-display text-base font-medium text-ink">
                ยังไม่มีผู้ให้บริการจัดส่ง
              </h3>
              <p className="mt-1.5 max-w-md text-sm text-muted-foreground text-pretty">
                เพิ่มชื่อขนส่งที่ร้านค้าใช้บ่อย เช่น Kerry หรือ Flash Express
                ก่อนให้ร้านตั้งราคาจัดส่ง
              </p>
            </div>
          ) : null}

          {!isLoading && providers.length > 0 ? (
            <ul className="divide-y divide-border">
              {providers.map((provider) => (
                <li
                  key={provider.id}
                  className={cn(
                    'px-5 py-4 md:px-6',
                    !provider.isActive && !editingProvider && 'bg-surface/50',
                  )}
                >
                  {editingProvider?.id === provider.id ? (
                    <form
                      onSubmit={handleUpdateProvider}
                      className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end"
                    >
                      <div className="min-w-[160px] flex-1">
                        <Label htmlFor={`edit-provider-name-${provider.id}`} required>
                          ชื่อผู้ให้บริการ
                        </Label>
                        <Input
                          id={`edit-provider-name-${provider.id}`}
                          value={editProviderName}
                          onChange={(e) => setEditProviderName(e.target.value)}
                          placeholder="ชื่อผู้ให้บริการ"
                          className="mt-1.5"
                          disabled={updateProvider.isPending}
                        />
                      </div>
                      <label
                        htmlFor={`active-${provider.id}`}
                        className="flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-surface/60 px-4 py-3 sm:min-w-[200px]"
                      >
                        <input
                          id={`active-${provider.id}`}
                          type="checkbox"
                          className="mt-0.5 h-4 w-4 rounded border-border accent-brand"
                          checked={editProviderActive}
                          onChange={(e) => setEditProviderActive(e.target.checked)}
                          disabled={updateProvider.isPending}
                        />
                        <span>
                          <span className="block text-sm font-medium text-ink">ใช้งาน</span>
                          <span className="mt-0.5 block text-xs text-muted-foreground">
                            แสดงในรายการเลือกของร้านค้า
                          </span>
                        </span>
                      </label>
                      <div className="flex gap-2">
                        <Button
                          type="submit"
                          size="sm"
                          disabled={updateProvider.isPending || !editProviderName.trim()}
                          aria-busy={updateProvider.isPending}
                        >
                          {updateProvider.isPending ? 'กำลังบันทึก...' : 'บันทึก'}
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingProvider(null)}
                          disabled={updateProvider.isPending}
                        >
                          ยกเลิก
                        </Button>
                      </div>
                    </form>
                  ) : (
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex min-w-0 items-start gap-3.5">
                        <div
                          className={cn(
                            'mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
                            provider.isActive
                              ? 'bg-brand-tint text-brand'
                              : 'bg-surface text-muted-foreground',
                          )}
                          aria-hidden
                        >
                          <HiOutlineTruck className="size-5" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="truncate font-medium text-ink">{provider.name}</p>
                            <Badge className={activeStatusBadgeClass(provider.isActive)}>
                              {provider.isActive ? 'ใช้งาน' : 'ปิดใช้งาน'}
                            </Badge>
                          </div>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {provider.isActive
                              ? 'ร้านค้าสามารถผูกตัวเลือกจัดส่งกับผู้ให้บริการนี้ได้'
                              : 'ไม่แสดงในรายการเลือกของร้าน — ตัวเลือกเดิมยังคงอยู่'}
                          </p>
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-2 self-end sm:self-center">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          disabled={mutationPending}
                          onClick={() => {
                            setEditingProvider(provider);
                            setEditProviderName(provider.name);
                            setEditProviderActive(provider.isActive);
                          }}
                        >
                          แก้ไข
                        </Button>
                        <ConfirmDeleteButton
                          confirmLabel={provider.name}
                          title="ลบผู้ให้บริการจัดส่ง"
                          description={`ลบ “${provider.name}” ออกจากระบบ — ตรวจสอบว่าไม่มีร้านผูกอยู่ก่อนลบ`}
                          variant="outline"
                          disabled={deleteProvider.isPending}
                          isDeleting={deleteProvider.isPending}
                          onConfirm={async () => {
                            await deleteProvider.mutateAsync(provider.id);
                            setSuccessMessage('ลบผู้ให้บริการแล้ว');
                          }}
                        />
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          ) : null}
        </CardBody>
      </Card>
    </section>
  );
}
