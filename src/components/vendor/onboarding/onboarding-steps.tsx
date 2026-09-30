'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { HiArrowRight, HiBuildingStorefront, HiUserGroup } from 'react-icons/hi2';
import { EmailVerificationNotice } from '@/components/vendor/email-verification-notice';
import { StoreRequestForm } from '@/components/vendor/store-request-form';
import { VendorOmiseLinkPanel } from '@/components/vendor/vendor-omise-link-panel';
import { VendorPayoutAccountPanel } from '@/components/vendor/vendor-payout-account-panel';
import { VendorShippingPanel } from '@/components/vendor/shipping-settings-panel';
import { VendorStoreSettingsPanel } from '@/components/vendor/vendor-store-settings-panel';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { useToast } from '@/components/ui/toast';
import { useSyncEmailVerificationStatus } from '@/hooks/useEmailVerification';
import { useMyStores } from '@/hooks/useMyStores';
import { useMyStore, useUpdateStore, useUpdateStorePayout } from '@/hooks/useStoreSettings';
import { useMyStoreRequests } from '@/hooks/useStoreRequests';
import {
  useAcceptStoreInvitation,
  useDeclineStoreInvitation,
  useMyPendingStoreInvitations,
} from '@/hooks/useTeam';
import { getErrorMessage } from '@/lib/api/errors';
import { THAI_BANKS } from '@/lib/constants/thai-banks';
import {
  formatThaiBankAccountNumber,
  sanitizeBankAccountDigits,
} from '@/lib/banks/formatThaiBankAccountNumber';
import { labelMembershipRole, labelStoreRequestStatus } from '@/lib/i18n/th';
import type { OnboardingPath } from '@/lib/vendor/onboarding';
import {
  payoutFormSchema,
  storeInfoFormSchema,
  type PayoutFormValues,
  type StoreInfoFormValues,
} from '@/lib/validations';
import type { MyPendingStoreInvitation } from '@/types';

export function OnboardingVerifyStep({ email }: { email: string }) {
  useSyncEmailVerificationStatus();
  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-display text-lg font-medium text-ink">ยืนยันอีเมลของคุณ</h2>
        <p className="mt-1 text-sm text-muted">
          ต้องยืนยันอีเมลก่อนขอเปิดร้านหรือจัดการคำเชิญเข้าร้าน
        </p>
      </div>
      <EmailVerificationNotice email={email} />
      <p className="text-sm text-muted">
        เมื่อยืนยันแล้ว หน้านี้จะไปขั้นถัดไปอัตโนมัติ — หากยืนยันในแท็บอื่น ให้รีเฟรชหน้านี้
      </p>
    </div>
  );
}

export function OnboardingChooseStep({ onSelect }: { onSelect: (path: OnboardingPath) => void }) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display text-lg font-medium text-ink">คุณต้องการเริ่มต้นแบบไหน?</h2>
        <p className="mt-1 text-sm text-muted">เลือกเส้นทางที่ตรงกับสถานการณ์ของคุณ</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => onSelect('create')}
          className="group flex flex-col items-start gap-3 rounded-xl border border-border bg-canvas p-5 text-left transition-colors duration-150 hover:border-brand/60 hover:bg-brand-tint/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
        >
          <HiBuildingStorefront
            className="size-7 text-brand transition-transform duration-150 group-hover:scale-105"
            aria-hidden="true"
          />
          <div>
            <p className="font-medium text-ink">ขอเปิดร้านใหม่</p>
            <p className="mt-1.5 text-sm leading-relaxed text-muted text-pretty">
              ส่งคำขอเป็นเจ้าของร้าน รอ Admin อนุมัติ แล้วตั้งค่าการขายให้ครบในที่เดียว
            </p>
          </div>
        </button>
        <button
          type="button"
          onClick={() => onSelect('join')}
          className="group flex flex-col items-start gap-3 rounded-xl border border-border bg-canvas p-5 text-left transition-colors duration-150 hover:border-brand/60 hover:bg-brand-tint/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
        >
          <HiUserGroup
            className="size-7 text-brand transition-transform duration-150 group-hover:scale-105"
            aria-hidden="true"
          />
          <div>
            <p className="font-medium text-ink">เข้าร่วมร้านที่มีอยู่</p>
            <p className="mt-1.5 text-sm leading-relaxed text-muted text-pretty">
              ตอบรับคำเชิญจากเจ้าของร้าน หรือเปิดลิงก์เชิญจากอีเมล
            </p>
          </div>
        </button>
      </div>
    </div>
  );
}

export function OnboardingCreateRequestStep() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-display text-lg font-medium text-ink">กรอกข้อมูลขอเปิดร้าน</h2>
        <p className="mt-1 text-sm text-muted">
          กรอกชื่อร้านค้าเพื่อส่งคำขอ — ข้อมูลอื่นไม่บังคับ แต่ช่วยให้ทีมงานตรวจสอบได้เร็วขึ้น
          หลังอนุมัติคุณจะตั้งค่าร้านต่อในขั้นตอนถัดไป
        </p>
      </div>
      <Card>
        <CardBody>
          <StoreRequestForm idPrefix="onboarding-req" />
        </CardBody>
      </Card>
    </div>
  );
}

export function OnboardingWaitingStep() {
  const { data: requests = [], isLoading } = useMyStoreRequests();
  const pending = requests.filter((r) => r.status === 'pending');
  const rejected = requests.filter((r) => r.status === 'rejected');

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display text-lg font-medium text-ink">รอการอนุมัติจากทีม SOPet</h2>
        <p className="mt-1 text-sm text-muted">
          คำขอของคุณอยู่ระหว่างตรวจสอบ หน้านี้จะไปขั้นตั้งค่าร้านอัตโนมัติเมื่ออนุมัติแล้ว
        </p>
      </div>
      <div className="space-y-3">
        {isLoading ? <p className="text-sm text-muted">กำลังโหลดสถานะ...</p> : null}
        {pending.map((req) => (
          <div
            key={req.id}
            className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-canvas px-4 py-3.5"
          >
            <p className="font-medium text-ink">{req.name}</p>
            <Badge className="bg-warning-bg text-warning-text">
              {labelStoreRequestStatus(req.status)}
            </Badge>
          </div>
        ))}
        {rejected.map((req) => (
          <div
            key={req.id}
            className="rounded-xl border border-danger/25 bg-danger-bg/30 px-4 py-3.5"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-medium text-ink">{req.name}</p>
              <Badge className="bg-danger-bg text-danger">
                {labelStoreRequestStatus(req.status)}
              </Badge>
            </div>
            {req.rejectionReason ? (
              <p className="mt-2 text-sm text-danger">เหตุผล: {req.rejectionReason}</p>
            ) : null}
            <p className="mt-2 text-sm text-muted">
              สามารถส่งคำขอใหม่ได้จาก{' '}
              <Link href="/vendor/stores" className="text-brand hover:underline">
                ร้านค้าของฉัน
              </Link>
            </p>
          </div>
        ))}
        {!isLoading && pending.length === 0 && rejected.length === 0 ? (
          <p className="text-sm text-muted">ไม่พบคำขอที่รออนุมัติ</p>
        ) : null}
      </div>
    </div>
  );
}

function InvitationRow({
  invitation,
  busyToken,
  onAccept,
  onDecline,
}: {
  invitation: MyPendingStoreInvitation;
  busyToken: string | null;
  onAccept: (token: string) => void;
  onDecline: (token: string) => void;
}) {
  const isBusy = busyToken === invitation.token;
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-canvas p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0 space-y-1">
        <p className="font-medium text-ink">{invitation.storeName}</p>
        <p className="text-sm text-muted">บทบาท: {labelMembershipRole(String(invitation.role))}</p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          disabled={isBusy}
          onClick={() => onAccept(invitation.token)}
        >
          {isBusy ? 'กำลังดำเนินการ...' : 'ตอบรับ'}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={isBusy}
          onClick={() => onDecline(invitation.token)}
        >
          ปฏิเสธ
        </Button>
      </div>
    </div>
  );
}

export function OnboardingJoinAcceptStep({ onResetPath }: { onResetPath: () => void }) {
  const { show } = useToast();
  const [busyToken, setBusyToken] = useState<string | null>(null);
  const { data: invitations = [], isLoading, error } = useMyPendingStoreInvitations();
  const acceptMutation = useAcceptStoreInvitation();
  const declineMutation = useDeclineStoreInvitation();

  async function handleAccept(token: string) {
    setBusyToken(token);
    try {
      await acceptMutation.mutateAsync(token);
      show('ตอบรับคำเชิญแล้ว', 'success');
    } catch (err) {
      show(getErrorMessage(err, 'ตอบรับคำเชิญไม่สำเร็จ'), 'error');
    } finally {
      setBusyToken(null);
    }
  }

  async function handleDecline(token: string) {
    setBusyToken(token);
    try {
      await declineMutation.mutateAsync(token);
      show('ปฏิเสธคำเชิญแล้ว', 'success');
    } catch (err) {
      show(getErrorMessage(err, 'ปฏิเสธคำเชิญไม่สำเร็จ'), 'error');
    } finally {
      setBusyToken(null);
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-display text-lg font-medium text-ink">ตอบรับคำเชิญเข้าร้าน</h2>
        <p className="mt-1 text-sm text-muted">เลือกรายการด้านล่าง หรือเปิดลิงก์จากอีเมลเชิญ</p>
      </div>
      <Card>
        <CardBody className="space-y-3">
          {isLoading ? <p className="text-sm text-muted">กำลังโหลดคำเชิญ...</p> : null}
          {error ? (
            <p className="text-sm text-danger" role="alert">
              {getErrorMessage(error, 'โหลดคำเชิญไม่สำเร็จ')}
            </p>
          ) : null}
          {!isLoading && !error && invitations.length === 0 ? (
            <div className="space-y-3">
              <p className="text-sm text-muted">ยังไม่มีคำเชิญที่รอตอบรับในบัญชีนี้</p>
              <Button type="button" variant="outline" asChild>
                <Link href="/invite/store">เปิดหน้ารับคำเชิญจากลิงก์</Link>
              </Button>
            </div>
          ) : null}
          {invitations.map((invitation) => (
            <InvitationRow
              key={invitation.token}
              invitation={invitation}
              busyToken={busyToken}
              onAccept={handleAccept}
              onDecline={handleDecline}
            />
          ))}
        </CardBody>
      </Card>
      <p className="text-sm text-muted">
        เลือกผิดทาง?{' '}
        <button
          type="button"
          className="font-medium text-brand hover:underline"
          onClick={onResetPath}
        >
          กลับไปเลือกเส้นทางใหม่
        </button>
      </p>
    </div>
  );
}

export function OnboardingJoinDoneStep({ onFinish }: { onFinish: () => void }) {
  const { data: stores = [] } = useMyStores();
  const first = stores[0];

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display text-lg font-medium text-ink">คุณเข้าร้านแล้ว</h2>
        <p className="mt-1 text-sm text-muted">
          {first
            ? `ร้าน ${first.store.name} · บทบาท ${labelMembershipRole(first.membershipRole)}`
            : 'บัญชีของคุณเชื่อมกับร้านแล้ว'}
        </p>
      </div>
      <div className="space-y-3 rounded-xl border border-border bg-canvas px-4 py-4 text-sm text-muted">
        <p className="font-medium text-ink">สิ่งที่คุณทำได้ตามบทบาท</p>
        <ul className="list-disc space-y-1.5 pl-5">
          <li>ดูและจัดการคำสั่งซื้อ / สินค้า (ตามสิทธิ์)</li>
          <li>สลับร้านได้ที่ “ร้านค้าของฉัน” หากมีหลายร้าน</li>
          <li>เจ้าของร้านเท่านั้นที่ตั้งรับเงินและเชิญทีม</li>
        </ul>
      </div>
      <Button type="button" onClick={onFinish}>
        ไปแดชบอร์ด
        <HiArrowRight className="size-4" aria-hidden="true" />
      </Button>
    </div>
  );
}

export function OnboardingStoreProfileStep({ onContinue }: { onContinue: () => void }) {
  const { data: store, isLoading } = useMyStore();
  const updateStore = useUpdateStore();
  const form = useForm<StoreInfoFormValues>({
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

  useEffect(() => {
    if (!store) return;
    form.reset({
      name: store.name,
      description: store.description ?? '',
      contactPhone: store.contactPhone ?? '',
      contactEmail: store.contactEmail ?? '',
      address: store.address ?? '',
      logoUrl: store.logoUrl ?? '',
      bannerUrl: store.bannerUrl ?? '',
    });
  }, [store, form]);

  async function onSubmit(values: StoreInfoFormValues) {
    await updateStore.mutateAsync({
      name: values.name,
      description: values.description || undefined,
      contactPhone: values.contactPhone || undefined,
      contactEmail: values.contactEmail || undefined,
      address: values.address || undefined,
      logoUrl: values.logoUrl?.trim() ? values.logoUrl.trim() : null,
      bannerUrl: values.bannerUrl?.trim() ? values.bannerUrl.trim() : null,
    });
    onContinue();
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-display text-lg font-medium text-ink">ตรวจข้อมูลร้านค้า</h2>
        <p className="mt-1 text-sm text-muted">
          ปรับชื่อ โลโก้ และข้อมูลติดต่อให้พร้อมก่อนเปิดขาย — หรือกดดำเนินการต่อหากข้อมูลครบแล้ว
        </p>
      </div>
      <VendorStoreSettingsPanel
        form={form}
        loading={isLoading}
        saving={updateStore.isPending}
        onSubmit={onSubmit}
      />
      <div className="flex flex-wrap gap-3">
        <Button type="button" variant="outline" onClick={onContinue}>
          ดำเนินการต่อโดยไม่บันทึก
        </Button>
      </div>
    </div>
  );
}

export function OnboardingShippingStep({
  complete,
  onSkip,
}: {
  complete: boolean;
  onSkip: () => void;
}) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-display text-lg font-medium text-ink">ตั้งค่าการจัดส่ง</h2>
        <p className="mt-1 text-sm text-muted">
          เพิ่มตัวเลือกการจัดส่งอย่างน้อย 1 รายการ ขั้นนี้จะผ่านอัตโนมัติเมื่อบันทึกสำเร็จ
        </p>
      </div>
      {complete ? (
        <p className="rounded-lg border border-success/25 bg-success-bg px-3 py-2 text-sm text-success">
          มีตัวเลือกการจัดส่งแล้ว — กำลังไปขั้นถัดไป
        </p>
      ) : null}
      <VendorShippingPanel />
      <Button type="button" variant="outline" onClick={onSkip}>
        ทำภายหลัง
      </Button>
    </div>
  );
}

export function OnboardingPayoutStep({
  complete,
  onSkip,
}: {
  complete: boolean;
  onSkip: () => void;
}) {
  const { data: store, isLoading } = useMyStore();
  const updatePayout = useUpdateStorePayout();
  const form = useForm<PayoutFormValues>({
    resolver: zodResolver(payoutFormSchema),
    defaultValues: { bankCode: '', bankAccountName: '', bankAccountNumber: '' },
  });

  useEffect(() => {
    if (!store) return;
    const resolvedBankCode =
      store.bankCode ?? THAI_BANKS.find((bank) => bank.name === store.bankName)?.code ?? '';
    form.reset({
      bankCode: resolvedBankCode,
      bankAccountName: store.bankAccountName ?? '',
      bankAccountNumber: formatThaiBankAccountNumber(store.bankAccountNumber ?? ''),
    });
  }, [store, form]);

  async function onSubmit(values: PayoutFormValues) {
    const bankName = THAI_BANKS.find((bank) => bank.code === values.bankCode)?.name ?? '';
    await updatePayout.mutateAsync({
      bankCode: values.bankCode,
      bankName,
      bankAccountName: values.bankAccountName,
      bankAccountNumber: sanitizeBankAccountDigits(values.bankAccountNumber),
    });
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-display text-lg font-medium text-ink">ตั้งบัญชีรับเงิน</h2>
        <p className="mt-1 text-sm text-muted">
          บันทึกบัญชีธนาคารและเชื่อม Omise เพื่อรับเงินจากคำสั่งซื้อ
        </p>
      </div>
      {complete ? (
        <p className="rounded-lg border border-success/25 bg-success-bg px-3 py-2 text-sm text-success">
          ตั้งรับเงินครบแล้ว — กำลังไปขั้นถัดไป
        </p>
      ) : null}
      <div className="space-y-6">
        <VendorPayoutAccountPanel
          form={form}
          store={store}
          loading={isLoading}
          saving={updatePayout.isPending}
          onSubmit={onSubmit}
        />
        <VendorOmiseLinkPanel store={store} loading={isLoading} />
      </div>
      <Button type="button" variant="outline" onClick={onSkip}>
        ทำภายหลัง
      </Button>
    </div>
  );
}

export function OnboardingFirstProductStep({
  complete,
  onAcknowledge,
  onSkip,
}: {
  complete: boolean;
  onAcknowledge: () => void;
  onSkip: () => void;
}) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-display text-lg font-medium text-ink">เพิ่มสินค้าแรก</h2>
        <p className="mt-1 text-sm text-muted">
          สร้างและเผยแพร่สินค้าอย่างน้อย 1 รายการ เพื่อให้ลูกค้าสั่งซื้อได้
        </p>
      </div>
      <Card>
        <CardHeader>
          <h3 className="font-medium text-ink">ตัวช่วยสร้างสินค้า</h3>
        </CardHeader>
        <CardBody className="space-y-4">
          {complete ? (
            <p className="text-sm text-success">มีสินค้าที่เผยแพร่แล้ว</p>
          ) : (
            <p className="text-sm text-muted">
              เปิดตัวช่วยสร้างสินค้า แล้วกลับมาที่นี่เมื่อพร้อม หรือข้ามไปตั้งค่าทีหลัง
            </p>
          )}
          <div className="flex flex-wrap gap-3">
            <Button type="button" asChild>
              <Link href="/vendor/products/new?from=onboarding">
                ไปสร้างสินค้า
                <HiArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </Button>
            <Button type="button" variant="outline" onClick={onAcknowledge}>
              ทำแล้ว / ดำเนินการต่อ
            </Button>
            <Button type="button" variant="ghost" onClick={onSkip}>
              ทำภายหลัง
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

export function OnboardingDoneStep({ onFinish }: { onFinish: () => void }) {
  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-border bg-canvas px-4 py-5 sm:px-5">
        <h2 className="font-display text-lg font-medium text-ink">พร้อมเริ่มขายแล้ว</h2>
        <p className="mt-1.5 text-sm leading-relaxed text-muted text-pretty">
          คุณตั้งค่าร้านเบื้องต้นครบแล้ว หรือจะกลับมาทำต่อได้จากแดชบอร์ด
        </p>
      </div>
      <Button type="button" onClick={onFinish}>
        ไปแดชบอร์ด
        <HiArrowRight className="size-4" aria-hidden="true" />
      </Button>
    </div>
  );
}
