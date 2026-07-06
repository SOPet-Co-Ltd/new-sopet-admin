'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { useEffect, useState } from 'react';
import { VendorShippingPanel } from '@/components/vendor/shipping-settings-panel';
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
import { THAI_BANKS } from '@/lib/constants/thai-banks';
import { useCurrentUser } from '@/hooks/useAuth';
import { useIsStoreOwner } from '@/hooks/useMembershipRole';
import {
  useChangePassword,
  useMyStore,
  useUpdateStore,
  useUpdateStorePayout,
  useUpdateUserProfile,
} from '@/hooks/useStoreSettings';
import { settingsTabLabels } from '@/lib/i18n/th';
import {
  payoutFormSchema,
  profileFormSchema,
  storeInfoFormSchema,
  type PayoutFormValues,
  type ProfileFormValues,
  type StoreInfoFormValues,
} from '@/lib/validations';

type SettingsTab = keyof typeof settingsTabLabels;

const OMISE_STATUS_INFO: Record<string, { label: string; className: string }> = {
  not_connected: {
    label: 'ยังไม่ได้เชื่อมต่อ Omise',
    className: 'bg-muted/10 text-muted',
  },
  pending: {
    label: 'รอการยืนยันจาก Omise',
    className: 'bg-amber-100 text-amber-700',
  },
  active: {
    label: 'เชื่อมต่อกับ Omise แล้ว',
    className: 'bg-emerald-100 text-emerald-700',
  },
  failed: {
    label: 'เชื่อมต่อ Omise ไม่สำเร็จ',
    className: 'bg-danger/10 text-danger',
  },
};

export default function VendorSettingsPage() {
  const { user } = useCurrentUser();
  const { isOwner } = useIsStoreOwner();
  const [tab, setTab] = useState<SettingsTab>('profile');
  const { data: store, isLoading: storeLoading } = useMyStore();
  const updateProfile = useUpdateUserProfile();
  const changePassword = useChangePassword();
  const updateStore = useUpdateStore();
  const updatePayout = useUpdateStorePayout();

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: { fullName: '', email: '' },
  });

  const storeForm = useForm<StoreInfoFormValues>({
    resolver: zodResolver(storeInfoFormSchema),
    defaultValues: {
      name: '',
      description: '',
      contactPhone: '',
      contactEmail: '',
      address: '',
    },
  });

  const payoutForm = useForm<PayoutFormValues>({
    resolver: zodResolver(payoutFormSchema),
    defaultValues: { bankCode: '', bankAccountName: '', bankAccountNumber: '' },
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);
  const [showPasswordSection, setShowPasswordSection] = useState(false);

  useEffect(() => {
    if (user) {
      profileForm.reset({ fullName: user.fullName, email: user.email });
    }
  }, [user, profileForm]);

  useEffect(() => {
    if (store) {
      storeForm.reset({
        name: store.name,
        description: store.description ?? '',
        contactPhone: store.contactPhone ?? '',
        contactEmail: store.contactEmail ?? '',
        address: store.address ?? '',
      });
      const resolvedBankCode =
        store.bankCode ?? THAI_BANKS.find((bank) => bank.name === store.bankName)?.code ?? '';
      payoutForm.reset({
        bankCode: resolvedBankCode,
        bankAccountName: store.bankAccountName ?? '',
        bankAccountNumber: store.bankAccountNumber ?? '',
      });
    }
  }, [store, storeForm, payoutForm]);

  async function onProfileSubmit(values: ProfileFormValues) {
    await updateProfile.mutateAsync({ fullName: values.fullName });
  }

  async function onStoreSubmit(values: StoreInfoFormValues) {
    await updateStore.mutateAsync({
      name: values.name,
      description: values.description || undefined,
      contactPhone: values.contactPhone || undefined,
      contactEmail: values.contactEmail || undefined,
      address: values.address || undefined,
    });
  }

  async function onPayoutSubmit(values: PayoutFormValues) {
    const bankName = THAI_BANKS.find((bank) => bank.code === values.bankCode)?.name ?? '';
    await updatePayout.mutateAsync({
      bankCode: values.bankCode,
      bankName,
      bankAccountName: values.bankAccountName,
      bankAccountNumber: values.bankAccountNumber,
    });
  }

  async function onPasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPasswordMessage(null);
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordMessage('รหัสผ่านใหม่ไม่ตรงกัน');
      return;
    }
    try {
      const message = await changePassword.mutateAsync({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordMessage(message);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setPasswordMessage(err instanceof Error ? err.message : 'เปลี่ยนรหัสผ่านไม่สำเร็จ');
    }
  }

  return (
    <div>
      <PageHeader title="ตั้งค่า" description="ข้อมูลบัญชีและร้านค้า" />

      <div className="mb-6 flex flex-wrap gap-2">
        {(Object.keys(settingsTabLabels) as SettingsTab[]).map((key) => {
          if ((key === 'store' || key === 'payout' || key === 'shipping') && !isOwner) return null;
          return (
            <Button
              key={key}
              type="button"
              variant={tab === key ? 'default' : 'outline'}
              onClick={() => setTab(key)}
            >
              {settingsTabLabels[key]}
            </Button>
          );
        })}
      </div>

      {tab === 'profile' ? (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <h2 className="font-display font-medium text-ink">ข้อมูลส่วนตัว</h2>
            </CardHeader>
            <CardBody>
              <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                <div>
                  <Label htmlFor="fullName" required>
                    ชื่อ-นามสกุล
                  </Label>
                  <Input
                    id="fullName"
                    autoComplete="name"
                    placeholder="ชื่อ-นามสกุล"
                    aria-invalid={!!profileForm.formState.errors.fullName}
                    aria-describedby={
                      profileForm.formState.errors.fullName ? 'fullName-error' : undefined
                    }
                    {...profileForm.register('fullName')}
                    className="mt-1.5"
                  />
                  {profileForm.formState.errors.fullName ? (
                    <p id="fullName-error" className="mt-1 text-xs text-danger" role="alert">
                      {profileForm.formState.errors.fullName.message}
                    </p>
                  ) : null}
                </div>
                <div>
                  <Label htmlFor="email">อีเมล</Label>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    {...profileForm.register('email')}
                    disabled
                    className="mt-1.5"
                  />
                  <p className="mt-1 text-xs text-muted">ไม่สามารถเปลี่ยนอีเมลได้ในขณะนี้</p>
                </div>
                <Button
                  type="submit"
                  disabled={updateProfile.isPending}
                  aria-busy={updateProfile.isPending}
                >
                  {updateProfile.isPending ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
                </Button>
              </form>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="font-display font-medium text-ink">เปลี่ยนรหัสผ่าน</h2>
                <Button
                  type="button"
                  variant="outline"
                  aria-expanded={showPasswordSection}
                  aria-controls="password-change-section"
                  onClick={() => {
                    setShowPasswordSection((prev) => !prev);
                    if (showPasswordSection) {
                      setPasswordMessage(null);
                    }
                  }}
                >
                  {showPasswordSection ? 'ซ่อน' : 'เปลี่ยนรหัสผ่าน'}
                </Button>
              </div>
            </CardHeader>
            {showPasswordSection ? (
              <CardBody>
                <div id="password-change-section">
                  <form onSubmit={onPasswordSubmit} className="space-y-4" noValidate>
                    <div>
                      <Label htmlFor="currentPassword" required>
                        รหัสผ่านปัจจุบัน
                      </Label>
                      <Input
                        id="currentPassword"
                        type="password"
                        autoComplete="current-password"
                        placeholder="กรอกรหัสผ่าน"
                        value={passwordForm.currentPassword}
                        onChange={(e) =>
                          setPasswordForm((prev) => ({ ...prev, currentPassword: e.target.value }))
                        }
                        className="mt-1.5"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="newPassword" required>
                        รหัสผ่านใหม่
                      </Label>
                      <Input
                        id="newPassword"
                        type="password"
                        autoComplete="new-password"
                        placeholder="อย่างน้อย 8 ตัวอักษร"
                        value={passwordForm.newPassword}
                        onChange={(e) =>
                          setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }))
                        }
                        className="mt-1.5"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="confirmPassword" required>
                        ยืนยันรหัสผ่านใหม่
                      </Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        autoComplete="new-password"
                        placeholder="กรอกรหัสผ่านอีกครั้ง"
                        value={passwordForm.confirmPassword}
                        onChange={(e) =>
                          setPasswordForm((prev) => ({ ...prev, confirmPassword: e.target.value }))
                        }
                        className="mt-1.5"
                        required
                      />
                    </div>
                    {passwordMessage ? (
                      <p className="text-sm text-muted" role="alert">
                        {passwordMessage}
                      </p>
                    ) : null}
                    <Button
                      type="submit"
                      disabled={changePassword.isPending}
                      aria-busy={changePassword.isPending}
                    >
                      {changePassword.isPending ? 'กำลังบันทึก...' : 'บันทึกรหัสผ่านใหม่'}
                    </Button>
                  </form>
                </div>
              </CardBody>
            ) : null}
          </Card>
        </div>
      ) : null}

      {tab === 'store' && isOwner ? (
        <Card className="max-w-2xl">
          <CardHeader>
            <h2 className="font-display font-medium text-ink">ข้อมูลร้านค้า</h2>
          </CardHeader>
          <CardBody>
            {storeLoading ? (
              <p className="text-muted">กำลังโหลด...</p>
            ) : (
              <form onSubmit={storeForm.handleSubmit(onStoreSubmit)} className="space-y-4">
                <div>
                  <Label htmlFor="store-name" required>
                    ชื่อร้านค้า
                  </Label>
                  <Input
                    id="store-name"
                    placeholder="ชื่อร้านของคุณ"
                    aria-invalid={!!storeForm.formState.errors.name}
                    aria-describedby={
                      storeForm.formState.errors.name ? 'store-name-error' : undefined
                    }
                    {...storeForm.register('name')}
                    className="mt-1.5"
                  />
                  {storeForm.formState.errors.name ? (
                    <p id="store-name-error" className="mt-1 text-xs text-danger" role="alert">
                      {storeForm.formState.errors.name.message}
                    </p>
                  ) : null}
                </div>
                <div>
                  <Label htmlFor="store-description">คำอธิบาย</Label>
                  <Textarea
                    id="store-description"
                    placeholder="อธิบายร้านค้า..."
                    {...storeForm.register('description')}
                    className="mt-1.5"
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="contactPhone">เบอร์โทร</Label>
                    <Input
                      id="contactPhone"
                      type="tel"
                      autoComplete="tel"
                      placeholder="0812345678"
                      {...storeForm.register('contactPhone')}
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label htmlFor="contactEmail">อีเมลติดต่อ</Label>
                    <Input
                      id="contactEmail"
                      type="email"
                      autoComplete="email"
                      placeholder="contact@example.com"
                      aria-invalid={!!storeForm.formState.errors.contactEmail}
                      aria-describedby={
                        storeForm.formState.errors.contactEmail ? 'contactEmail-error' : undefined
                      }
                      {...storeForm.register('contactEmail')}
                      className="mt-1.5"
                    />
                    {storeForm.formState.errors.contactEmail ? (
                      <p id="contactEmail-error" className="mt-1 text-xs text-danger" role="alert">
                        {storeForm.formState.errors.contactEmail.message}
                      </p>
                    ) : null}
                  </div>
                </div>
                <div>
                  <Label htmlFor="address">ที่อยู่</Label>
                  <Textarea id="address" {...storeForm.register('address')} className="mt-1.5" />
                </div>
                <Button
                  type="submit"
                  disabled={updateStore.isPending}
                  aria-busy={updateStore.isPending}
                >
                  {updateStore.isPending ? 'กำลังบันทึก...' : 'บันทึกข้อมูลร้าน'}
                </Button>
              </form>
            )}
          </CardBody>
        </Card>
      ) : null}

      {tab === 'payout' && isOwner ? (
        <Card className="max-w-2xl">
          <CardHeader>
            <h2 className="font-display font-medium text-ink">บัญชีรับเงิน Omise</h2>
          </CardHeader>
          <CardBody>
            {storeLoading ? (
              <p className="text-muted">กำลังโหลด...</p>
            ) : (
              <form onSubmit={payoutForm.handleSubmit(onPayoutSubmit)} className="space-y-4">
                {(() => {
                  const status = store?.omiseRecipientStatus ?? 'not_connected';
                  const info = OMISE_STATUS_INFO[status] ?? OMISE_STATUS_INFO.not_connected;
                  return (
                    <div className={`rounded-lg px-3 py-2 text-sm ${info.className}`} role="status">
                      <span className="font-medium">สถานะ: {info.label}</span>
                      {status === 'failed' && store?.omiseRecipientFailureMessage ? (
                        <p className="mt-1 text-xs">{store.omiseRecipientFailureMessage}</p>
                      ) : null}
                    </div>
                  );
                })()}
                <div>
                  <Label htmlFor="bankCode" required>
                    ธนาคาร
                  </Label>
                  <Controller
                    control={payoutForm.control}
                    name="bankCode"
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger
                          id="bankCode"
                          aria-invalid={!!payoutForm.formState.errors.bankCode}
                          aria-describedby={
                            payoutForm.formState.errors.bankCode ? 'bankCode-error' : undefined
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
                  {payoutForm.formState.errors.bankCode ? (
                    <p id="bankCode-error" className="mt-1 text-xs text-danger" role="alert">
                      {payoutForm.formState.errors.bankCode.message}
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
                    placeholder="ชื่อบัญชี"
                    aria-invalid={!!payoutForm.formState.errors.bankAccountName}
                    aria-describedby={
                      payoutForm.formState.errors.bankAccountName
                        ? 'bankAccountName-error'
                        : undefined
                    }
                    {...payoutForm.register('bankAccountName')}
                    className="mt-1.5"
                  />
                  {payoutForm.formState.errors.bankAccountName ? (
                    <p id="bankAccountName-error" className="mt-1 text-xs text-danger" role="alert">
                      {payoutForm.formState.errors.bankAccountName.message}
                    </p>
                  ) : null}
                </div>
                <div>
                  <Label htmlFor="bankAccountNumber" required>
                    เลขที่บัญชี
                  </Label>
                  <Input
                    id="bankAccountNumber"
                    placeholder="เลขที่บัญชีธนาคาร"
                    aria-invalid={!!payoutForm.formState.errors.bankAccountNumber}
                    aria-describedby={
                      payoutForm.formState.errors.bankAccountNumber
                        ? 'bankAccountNumber-error'
                        : undefined
                    }
                    {...payoutForm.register('bankAccountNumber')}
                    className="mt-1.5"
                  />
                  {payoutForm.formState.errors.bankAccountNumber ? (
                    <p
                      id="bankAccountNumber-error"
                      className="mt-1 text-xs text-danger"
                      role="alert"
                    >
                      {payoutForm.formState.errors.bankAccountNumber.message}
                    </p>
                  ) : null}
                </div>
                <Button
                  type="submit"
                  disabled={updatePayout.isPending}
                  aria-busy={updatePayout.isPending}
                >
                  {updatePayout.isPending ? 'กำลังบันทึก...' : 'บันทึกบัญชีรับเงิน'}
                </Button>
              </form>
            )}
          </CardBody>
        </Card>
      ) : null}

      {tab === 'shipping' && isOwner ? <VendorShippingPanel /> : null}
    </div>
  );
}
