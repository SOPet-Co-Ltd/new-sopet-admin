'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardBody, CardHeader, PageHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useAdminStores } from '@/hooks/useAdminStores';
import {
  useAdminCreateStoreShippingOption,
  useAdminDeleteStoreShippingOption,
  useAdminStoreShippingOptions,
  useAdminUpdateStoreShippingOption,
  useCreateShippingProvider,
  useDeleteShippingProvider,
  useShippingProviders,
  useUpdateShippingProvider,
} from '@/hooks/useShipping';
import { shippingOptionSchema, type ShippingOptionFormValues } from '@/lib/validations';
import type { ShippingProvider, StoreShippingOption } from '@/types';

function providerName(providers: { id: string; name: string }[], providerId?: string): string {
  if (!providerId) return '—';
  return providers.find((p) => p.id === providerId)?.name ?? '—';
}

export default function AdminShippingPage() {
  const { data: providers = [], isLoading: loadingProviders } = useShippingProviders(true);
  const { data: stores = [] } = useAdminStores();
  const createProvider = useCreateShippingProvider();
  const updateProvider = useUpdateShippingProvider();
  const deleteProvider = useDeleteShippingProvider();

  const [providerNameInput, setProviderNameInput] = useState('');
  const [editingProvider, setEditingProvider] = useState<ShippingProvider | null>(null);
  const [editProviderName, setEditProviderName] = useState('');
  const [editProviderActive, setEditProviderActive] = useState(true);

  const [selectedStoreId, setSelectedStoreId] = useState('');
  const { data: storeOptions = [], isLoading: loadingOptions } =
    useAdminStoreShippingOptions(selectedStoreId);
  const createStoreOption = useAdminCreateStoreShippingOption();
  const updateStoreOption = useAdminUpdateStoreShippingOption();
  const deleteStoreOption = useAdminDeleteStoreShippingOption();
  const [editingOption, setEditingOption] = useState<StoreShippingOption | null>(null);
  const [showOptionForm, setShowOptionForm] = useState(false);

  const optionForm = useForm<ShippingOptionFormValues>({
    resolver: zodResolver(shippingOptionSchema),
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      providerId: '',
      isActive: true,
    },
  });

  useEffect(() => {
    if (!editingOption) {
      optionForm.reset({
        name: '',
        description: '',
        price: 0,
        providerId: '',
        isActive: true,
      });
      return;
    }
    optionForm.reset({
      name: editingOption.name,
      description: editingOption.description ?? '',
      price: editingOption.price,
      providerId: editingOption.providerId ?? '',
      isActive: editingOption.isActive,
    });
  }, [editingOption, optionForm]);

  async function handleCreateProvider(e: React.FormEvent) {
    e.preventDefault();
    if (!providerNameInput.trim()) return;
    await createProvider.mutateAsync({ name: providerNameInput.trim() });
    setProviderNameInput('');
  }

  async function handleUpdateProvider(e: React.FormEvent) {
    e.preventDefault();
    if (!editingProvider) return;
    await updateProvider.mutateAsync({
      id: editingProvider.id,
      input: { name: editProviderName, isActive: editProviderActive },
    });
    setEditingProvider(null);
  }

  function handleDeleteProvider(provider: ShippingProvider) {
    if (!window.confirm(`ลบผู้ให้บริการ "${provider.name}" ใช่หรือไม่?`)) return;
    deleteProvider.mutate(provider.id);
  }

  async function onSubmitOption(values: ShippingOptionFormValues) {
    if (!selectedStoreId) return;
    const input = {
      name: values.name,
      description: values.description || undefined,
      price: values.price,
      providerId: values.providerId || undefined,
      isActive: values.isActive ?? true,
    };
    if (editingOption) {
      await updateStoreOption.mutateAsync({
        id: editingOption.id,
        storeId: selectedStoreId,
        input,
      });
    } else {
      await createStoreOption.mutateAsync({ storeId: selectedStoreId, input });
    }
    setEditingOption(null);
    setShowOptionForm(false);
    optionForm.reset();
  }

  function handleDeleteOption(option: StoreShippingOption) {
    if (!window.confirm(`ลบ "${option.name}" ใช่หรือไม่?`)) return;
    deleteStoreOption.mutate({ id: option.id, storeId: selectedStoreId });
  }

  const activeProviders = providers.filter((p) => p.isActive);
  const optionErrors = optionForm.formState.errors;

  return (
    <div className="space-y-10">
      <PageHeader title="การจัดส่ง" description="จัดการผู้ให้บริการและราคาจัดส่งของร้านค้า" />

      <section className="space-y-4">
        <h2 className="font-display text-lg font-medium text-ink">ผู้ให้บริการจัดส่ง</h2>
        <Card>
          <CardBody className="space-y-4">
            <form onSubmit={handleCreateProvider} className="flex flex-wrap items-end gap-3">
              <div className="min-w-[200px] flex-1">
                <Label htmlFor="new-provider" required>
                  ชื่อผู้ให้บริการ
                </Label>
                <Input
                  id="new-provider"
                  value={providerNameInput}
                  onChange={(e) => setProviderNameInput(e.target.value)}
                  placeholder="เช่น Kerry, Flash Express"
                  className="mt-1.5"
                />
              </div>
              <Button
                type="submit"
                disabled={createProvider.isPending}
                aria-busy={createProvider.isPending}
              >
                {createProvider.isPending ? 'กำลังสร้าง...' : 'เพิ่มผู้ให้บริการ'}
              </Button>
            </form>
            {createProvider.error ? (
              <p className="text-sm text-danger">
                {createProvider.error instanceof Error
                  ? createProvider.error.message
                  : 'สร้างไม่สำเร็จ'}
              </p>
            ) : null}
            {loadingProviders ? (
              <p className="text-sm text-muted">กำลังโหลด...</p>
            ) : providers.length === 0 ? (
              <p className="text-sm text-muted">ยังไม่มีผู้ให้บริการ</p>
            ) : (
              <ul className="space-y-2">
                {providers.map((provider) => (
                  <li
                    key={provider.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border px-4 py-3"
                  >
                    {editingProvider?.id === provider.id ? (
                      <form
                        onSubmit={handleUpdateProvider}
                        className="flex w-full flex-wrap items-end gap-3"
                      >
                        <div className="min-w-[160px] flex-1">
                          <Label htmlFor={`edit-provider-name-${provider.id}`} required>
                            ชื่อ
                          </Label>
                          <Input
                            id={`edit-provider-name-${provider.id}`}
                            value={editProviderName}
                            onChange={(e) => setEditProviderName(e.target.value)}
                            placeholder="ชื่อผู้ให้บริการ"
                            className="mt-1.5"
                          />
                        </div>
                        <div className="flex items-center gap-2 pb-2">
                          <input
                            id={`active-${provider.id}`}
                            type="checkbox"
                            className="h-4 w-4 rounded border-border"
                            checked={editProviderActive}
                            onChange={(e) => setEditProviderActive(e.target.checked)}
                          />
                          <Label htmlFor={`active-${provider.id}`}>ใช้งาน</Label>
                        </div>
                        <Button
                          type="submit"
                          size="sm"
                          disabled={updateProvider.isPending}
                          aria-busy={updateProvider.isPending}
                        >
                          บันทึก
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingProvider(null)}
                        >
                          ยกเลิก
                        </Button>
                      </form>
                    ) : (
                      <>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-ink">{provider.name}</p>
                          <Badge>{provider.isActive ? 'ใช้งาน' : 'ปิดใช้งาน'}</Badge>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingProvider(provider);
                              setEditProviderName(provider.name);
                              setEditProviderActive(provider.isActive);
                            }}
                          >
                            แก้ไข
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="destructive"
                            disabled={deleteProvider.isPending}
                            aria-busy={deleteProvider.isPending}
                            onClick={() => handleDeleteProvider(provider)}
                          >
                            ลบ
                          </Button>
                        </div>
                      </>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-lg font-medium text-ink">ราคาจัดส่งของร้านค้า</h2>
        <Card>
          <CardBody className="space-y-4">
            <div className="max-w-md">
              <Label htmlFor="admin-ship-store">เลือกร้านค้า</Label>
              <Select value={selectedStoreId} onValueChange={setSelectedStoreId}>
                <SelectTrigger id="admin-ship-store" className="mt-1.5">
                  <SelectValue placeholder="เลือกร้านค้า" />
                </SelectTrigger>
                <SelectContent>
                  {stores.map((store) => (
                    <SelectItem key={store.id} value={store.id}>
                      {store.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedStoreId ? (
              <>
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm text-muted">ตัวเลือกการจัดส่งของร้านที่เลือก</p>
                  {!showOptionForm ? (
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => {
                        setEditingOption(null);
                        setShowOptionForm(true);
                      }}
                    >
                      เพิ่มตัวเลือก
                    </Button>
                  ) : null}
                </div>
                {loadingOptions ? (
                  <p className="text-sm text-muted">กำลังโหลด...</p>
                ) : storeOptions.length === 0 && !showOptionForm ? (
                  <p className="text-sm text-muted">ยังไม่มีตัวเลือกการจัดส่ง</p>
                ) : (
                  <ul className="space-y-2">
                    {storeOptions.map((option) => (
                      <li
                        key={option.id}
                        className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border px-4 py-3"
                      >
                        <div>
                          <p className="font-medium text-ink">{option.name}</p>
                          <p className="text-sm text-muted">
                            {providerName(providers, option.providerId)} · ฿
                            {option.price.toLocaleString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge>{option.isActive ? 'ใช้งาน' : 'ปิดใช้งาน'}</Badge>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingOption(option);
                              setShowOptionForm(true);
                            }}
                          >
                            แก้ไข
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="destructive"
                            disabled={deleteStoreOption.isPending}
                            aria-busy={deleteStoreOption.isPending}
                            onClick={() => handleDeleteOption(option)}
                          >
                            ลบ
                          </Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}

                {showOptionForm ? (
                  <Card>
                    <CardHeader>
                      <h3 className="font-medium text-ink">
                        {editingOption ? 'แก้ไขตัวเลือก' : 'เพิ่มตัวเลือก'}
                      </h3>
                    </CardHeader>
                    <CardBody>
                      <form
                        onSubmit={optionForm.handleSubmit(onSubmitOption)}
                        className="space-y-4"
                      >
                        <div>
                          <Label htmlFor="admin-ship-provider">ผู้ให้บริการจัดส่ง</Label>
                          <Select
                            value={optionForm.watch('providerId') || ''}
                            onValueChange={(v) =>
                              optionForm.setValue('providerId', v === '__none__' ? '' : v)
                            }
                          >
                            <SelectTrigger id="admin-ship-provider" className="mt-1.5">
                              <SelectValue placeholder="เลือกผู้ให้บริการ" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="__none__">ไม่ระบุ</SelectItem>
                              {activeProviders.map((p) => (
                                <SelectItem key={p.id} value={p.id}>
                                  {p.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="admin-ship-name" required>
                            ชื่อตัวเลือก
                          </Label>
                          <Input
                            id="admin-ship-name"
                            placeholder="เช่น จัดส่งมาตรฐาน"
                            aria-invalid={!!optionErrors.name}
                            aria-describedby={
                              optionErrors.name ? 'admin-ship-name-error' : undefined
                            }
                            {...optionForm.register('name')}
                            className="mt-1.5"
                          />
                          {optionErrors.name ? (
                            <p
                              id="admin-ship-name-error"
                              role="alert"
                              className="mt-1 text-xs text-danger"
                            >
                              {optionErrors.name.message}
                            </p>
                          ) : null}
                        </div>
                        <div>
                          <Label htmlFor="admin-ship-price" required>
                            ราคา (฿)
                          </Label>
                          <Input
                            id="admin-ship-price"
                            type="number"
                            min={0}
                            step="0.01"
                            placeholder="0"
                            aria-invalid={!!optionErrors.price}
                            aria-describedby={
                              optionErrors.price ? 'admin-ship-price-error' : undefined
                            }
                            className="mt-1.5"
                            {...optionForm.register('price', { valueAsNumber: true })}
                          />
                          {optionErrors.price ? (
                            <p
                              id="admin-ship-price-error"
                              role="alert"
                              className="mt-1 text-xs text-danger"
                            >
                              {optionErrors.price.message}
                            </p>
                          ) : null}
                        </div>
                        <div>
                          <Label htmlFor="admin-ship-desc">รายละเอียด</Label>
                          <Textarea
                            id="admin-ship-desc"
                            placeholder="รายละเอียดเพิ่มเติม (ถ้ามี)"
                            {...optionForm.register('description')}
                            className="mt-1.5"
                            rows={2}
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            id="admin-ship-active"
                            type="checkbox"
                            className="h-4 w-4 rounded border-border"
                            checked={optionForm.watch('isActive') ?? true}
                            onChange={(e) => optionForm.setValue('isActive', e.target.checked)}
                          />
                          <Label htmlFor="admin-ship-active">เปิดใช้งาน</Label>
                        </div>
                        <div className="flex gap-3">
                          <Button
                            type="submit"
                            disabled={createStoreOption.isPending || updateStoreOption.isPending}
                            aria-busy={createStoreOption.isPending || updateStoreOption.isPending}
                          >
                            บันทึก
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              setShowOptionForm(false);
                              setEditingOption(null);
                              optionForm.reset();
                            }}
                          >
                            ยกเลิก
                          </Button>
                        </div>
                      </form>
                    </CardBody>
                  </Card>
                ) : null}
              </>
            ) : (
              <p className="text-sm text-muted">เลือกร้านค้าเพื่อจัดการราคาจัดส่ง</p>
            )}
          </CardBody>
        </Card>
      </section>
    </div>
  );
}
