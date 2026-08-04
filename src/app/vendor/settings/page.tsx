'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { Suspense, useEffect, useState } from 'react';
import { HiOutlineCheckCircle } from 'react-icons/hi2';
import { VendorShippingPanel } from '@/components/vendor/shipping-settings-panel';
import { VendorPayoutAccountPanel } from '@/components/vendor/vendor-payout-account-panel';
import { VendorPayoutBalancePanel } from '@/components/vendor/vendor-payout-balance-panel';
import { VendorPayoutHistoryPanel } from '@/components/vendor/vendor-payout-history-panel';
import { VendorStoreSettingsPanel } from '@/components/vendor/vendor-store-settings-panel';
import { Button } from '@/components/ui/button';
import { Card, CardBody, CardHeader, PageHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { cn } from '@/lib/utils';

type SettingsTab = keyof typeof settingsTabLabels;

const OWNER_ONLY_TABS: SettingsTab[] = ['store', 'payout', 'shipping'];

const TAB_PANEL_IDS: Record<SettingsTab, string> = {
  profile: 'settings-panel-profile',
  store: 'settings-panel-store',
  payout: 'settings-panel-payout',
  shipping: 'settings-panel-shipping',
};

function parseSettingsTab(value: string | null): SettingsTab {
  if (value && value in settingsTabLabels) {
    return value as SettingsTab;
  }
  return 'profile';
}

function SettingsPageSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-live="polite">
      <div className="space-y-2">
        <div className="h-8 w-32 animate-pulse rounded-md bg-surface motion-reduce:animate-none" />
        <div className="h-4 w-56 animate-pulse rounded-md bg-surface motion-reduce:animate-none" />
      </div>
      <div className="flex flex-wrap gap-2">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-10 w-24 animate-pulse rounded-lg bg-surface motion-reduce:animate-none"
          />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="h-64 animate-pulse rounded-xl border border-border bg-card motion-reduce:animate-none" />
        <div className="h-40 animate-pulse rounded-xl border border-border bg-card motion-reduce:animate-none" />
      </div>
      <span className="sr-only">กำลังโหลด...</span>
    </div>
  );
}

function VendorSettingsPageContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user } = useCurrentUser();
  const { isOwner } = useIsStoreOwner();
  const requestedTab = parseSettingsTab(searchParams.get('tab'));
  const tab = !isOwner && OWNER_ONLY_TABS.includes(requestedTab) ? 'profile' : requestedTab;
  const { data: store, isLoading: storeLoading } = useMyStore();
  const updateProfile = useUpdateUserProfile();
  const changePassword = useChangePassword();
  const updateStore = useUpdateStore();
  const updatePayout = useUpdateStorePayout();

  function selectTab(next: SettingsTab) {
    const params = new URLSearchParams(searchParams.toString());
    if (next === 'profile') {
      params.delete('tab');
    } else {
      params.set('tab', next);
    }
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

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
      logoUrl: '',
      bannerUrl: '',
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
  const [passwordFeedback, setPasswordFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [profileFeedback, setProfileFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

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
        logoUrl: store.logoUrl ?? '',
        bannerUrl: store.bannerUrl ?? '',
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

  useEffect(() => {
    if (!profileFeedback || profileFeedback.type !== 'success') return;
    const timer = window.setTimeout(() => setProfileFeedback(null), 4000);
    return () => window.clearTimeout(timer);
  }, [profileFeedback]);

  useEffect(() => {
    if (!passwordFeedback || passwordFeedback.type !== 'success') return;
    const timer = window.setTimeout(() => setPasswordFeedback(null), 4000);
    return () => window.clearTimeout(timer);
  }, [passwordFeedback]);

  async function onProfileSubmit(values: ProfileFormValues) {
    setProfileFeedback(null);
    try {
      await updateProfile.mutateAsync({ fullName: values.fullName });
      setProfileFeedback({ type: 'success', message: 'บันทึกข้อมูลส่วนตัวแล้ว' });
    } catch (err) {
      setProfileFeedback({
        type: 'error',
        message: err instanceof Error ? err.message : 'บันทึกไม่สำเร็จ',
      });
    }
  }

  async function onStoreSubmit(values: StoreInfoFormValues) {
    await updateStore.mutateAsync({
      name: values.name,
      description: values.description || undefined,
      contactPhone: values.contactPhone || undefined,
      contactEmail: values.contactEmail || undefined,
      address: values.address || undefined,
      logoUrl: values.logoUrl?.trim() ? values.logoUrl.trim() : null,
      bannerUrl: values.bannerUrl?.trim() ? values.bannerUrl.trim() : null,
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
    setPasswordFeedback(null);
    if (passwordForm.newPassword.length < 8) {
      setPasswordFeedback({ type: 'error', message: 'รหัสผ่านใหม่ต้องมีอย่างน้อย 8 ตัวอักษร' });
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordFeedback({ type: 'error', message: 'รหัสผ่านใหม่ไม่ตรงกัน' });
      return;
    }
    try {
      const message = await changePassword.mutateAsync({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordFeedback({ type: 'success', message });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setPasswordFeedback({
        type: 'error',
        message: err instanceof Error ? err.message : 'เปลี่ยนรหัสผ่านไม่สำเร็จ',
      });
    }
  }

  const visibleTabs = (Object.keys(settingsTabLabels) as SettingsTab[]).filter((key) => {
    if ((key === 'store' || key === 'payout' || key === 'shipping') && !isOwner) return false;
    return true;
  });

  return (
    <div>
      <PageHeader title="ตั้งค่า" description="ข้อมูลบัญชีและร้านค้า" />

      <div className="mb-6 flex flex-wrap gap-2" role="tablist" aria-label="หมวดตั้งค่า">
        {visibleTabs.map((key) => (
          <Button
            key={key}
            type="button"
            role="tab"
            id={`settings-tab-${key}`}
            aria-selected={tab === key}
            aria-controls={TAB_PANEL_IDS[key]}
            variant={tab === key ? 'default' : 'outline'}
            onClick={() => selectTab(key)}
          >
            {settingsTabLabels[key]}
          </Button>
        ))}
      </div>

      {tab === 'profile' ? (
        <div
          id={TAB_PANEL_IDS.profile}
          role="tabpanel"
          aria-labelledby="settings-tab-profile"
          className="grid gap-6 lg:grid-cols-2"
        >
          <Card>
            <CardHeader>
              <h2 className="font-display text-lg font-medium text-ink text-balance">
                ข้อมูลส่วนตัว
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                ชื่อที่แสดงในระบบผู้ขาย — อีเมลใช้สำหรับเข้าสู่ระบบ
              </p>
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
                  <p className="mt-1 text-xs text-muted-foreground">
                    ไม่สามารถเปลี่ยนอีเมลได้ในขณะนี้
                  </p>
                </div>
                {profileFeedback ? (
                  <div
                    className={cn(
                      'flex items-start gap-2 rounded-lg border px-3 py-2.5 text-sm',
                      profileFeedback.type === 'success'
                        ? 'border-success/25 bg-success-bg text-success'
                        : 'border-danger/25 bg-danger-bg text-danger',
                    )}
                    role={profileFeedback.type === 'error' ? 'alert' : 'status'}
                    aria-live="polite"
                  >
                    {profileFeedback.type === 'success' ? (
                      <HiOutlineCheckCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
                    ) : null}
                    <p className="font-medium">{profileFeedback.message}</p>
                  </div>
                ) : null}
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
            <CardHeader className={cn(!showPasswordSection && 'border-b-0')}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="font-display text-lg font-medium text-ink text-balance">
                    เปลี่ยนรหัสผ่าน
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    ใช้รหัสผ่านที่แข็งแรงและไม่ใช้ร่วมกับบัญชีอื่น
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  aria-expanded={showPasswordSection}
                  aria-controls="password-change-section"
                  onClick={() => {
                    setShowPasswordSection((prev) => !prev);
                    if (showPasswordSection) {
                      setPasswordFeedback(null);
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
                        minLength={8}
                        aria-describedby="newPassword-hint"
                      />
                      <p id="newPassword-hint" className="mt-1 text-xs text-muted-foreground">
                        อย่างน้อย 8 ตัวอักษร
                      </p>
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
                    {passwordFeedback ? (
                      <div
                        className={cn(
                          'flex items-start gap-2 rounded-lg border px-3 py-2.5 text-sm',
                          passwordFeedback.type === 'success'
                            ? 'border-success/25 bg-success-bg text-success'
                            : 'border-danger/25 bg-danger-bg text-danger',
                        )}
                        role={passwordFeedback.type === 'error' ? 'alert' : 'status'}
                        aria-live="polite"
                      >
                        {passwordFeedback.type === 'success' ? (
                          <HiOutlineCheckCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
                        ) : null}
                        <p className="font-medium">{passwordFeedback.message}</p>
                      </div>
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
        <div id={TAB_PANEL_IDS.store} role="tabpanel" aria-labelledby="settings-tab-store">
          <VendorStoreSettingsPanel
            form={storeForm}
            loading={storeLoading}
            saving={updateStore.isPending}
            onSubmit={onStoreSubmit}
          />
        </div>
      ) : null}

      {tab === 'payout' && isOwner ? (
        <div
          id={TAB_PANEL_IDS.payout}
          role="tabpanel"
          aria-labelledby="settings-tab-payout"
          className="space-y-6"
        >
          <VendorPayoutBalancePanel />
          <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
            <VendorPayoutAccountPanel
              form={payoutForm}
              store={store}
              loading={storeLoading}
              saving={updatePayout.isPending}
              onSubmit={onPayoutSubmit}
            />
            <VendorPayoutHistoryPanel />
          </div>
        </div>
      ) : null}

      {tab === 'shipping' && isOwner ? (
        <div id={TAB_PANEL_IDS.shipping} role="tabpanel" aria-labelledby="settings-tab-shipping">
          <VendorShippingPanel />
        </div>
      ) : null}
    </div>
  );
}

export default function VendorSettingsPage() {
  return (
    <Suspense fallback={<SettingsPageSkeleton />}>
      <VendorSettingsPageContent />
    </Suspense>
  );
}
