'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Card, CardBody } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCurrentUser } from '@/hooks/useAuth';
import {
  useAcceptStoreInvitation,
  useAcceptStoreMemberInvitation,
  useStoreInvitationPreview,
} from '@/hooks/useTeam';
import { getErrorMessage } from '@/lib/api/errors';
import { membershipRoleLabels } from '@/lib/i18n/th';
import {
  acceptStoreMemberInviteSchema,
  type AcceptStoreMemberInviteFormValues,
} from '@/lib/validations';

function formatExpiry(iso: string): string {
  return new Intl.DateTimeFormat('th-TH', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(iso));
}

function StoreInvitePageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token') ?? '';
  const { user, isAuthenticated } = useCurrentUser();
  const previewQuery = useStoreInvitationPreview(token);
  const acceptNewUserMutation = useAcceptStoreMemberInvitation();
  const acceptExistingMutation = useAcceptStoreInvitation();

  const loginHref = useMemo(() => {
    const redirect = `/invite/store?token=${encodeURIComponent(token)}`;
    return `/login?redirect=${encodeURIComponent(redirect)}`;
  }, [token]);

  const form = useForm<AcceptStoreMemberInviteFormValues>({
    resolver: zodResolver(acceptStoreMemberInviteSchema),
    defaultValues: { fullName: '', password: '' },
  });

  const preview = previewQuery.data;
  const emailMatches =
    isAuthenticated && preview ? user?.email?.toLowerCase() === preview.email.toLowerCase() : false;

  async function onRegisterAndAccept(values: AcceptStoreMemberInviteFormValues) {
    if (!token) return;
    try {
      await acceptNewUserMutation.mutateAsync({
        token,
        password: values.password,
        fullName: values.fullName,
      });
      router.replace('/vendor/stores');
    } catch (err) {
      form.setError('root', {
        message: getErrorMessage(err, 'ตอบรับคำเชิญไม่สำเร็จ'),
      });
    }
  }

  async function onAcceptExisting() {
    if (!token) return;
    try {
      await acceptExistingMutation.mutateAsync(token);
      router.replace('/vendor/stores');
    } catch (err) {
      form.setError('root', {
        message: getErrorMessage(err, 'ตอบรับคำเชิญไม่สำเร็จ'),
      });
    }
  }

  if (!token) {
    return (
      <Card className="w-full max-w-lg">
        <CardBody>
          <p role="alert" className="text-sm text-danger">
            ลิงก์คำเชิญไม่ถูกต้อง
          </p>
        </CardBody>
      </Card>
    );
  }

  if (previewQuery.isLoading) {
    return <p className="text-muted">กำลังโหลดคำเชิญ...</p>;
  }

  if (previewQuery.isError || !preview) {
    return (
      <Card className="w-full max-w-lg">
        <CardBody className="space-y-4">
          <div>
            <h1 className="font-display text-xl font-semibold text-ink">
              คำเชิญไม่สามารถใช้งานได้
            </h1>
            <p role="alert" className="mt-2 text-sm text-danger">
              {getErrorMessage(previewQuery.error, 'ลิงก์คำเชิญไม่ถูกต้องหรือหมดอายุแล้ว')}
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/login">เข้าสู่ระบบ</Link>
          </Button>
        </CardBody>
      </Card>
    );
  }

  const roleLabel =
    membershipRoleLabels[preview.role as keyof typeof membershipRoleLabels] ?? preview.role;

  return (
    <Card className="w-full max-w-lg">
      <CardBody className="space-y-5">
        <div>
          <h1 className="font-display text-xl font-semibold text-ink">คำเชิญเข้าร่วมทีมร้าน</h1>
          <p className="mt-1 text-sm text-muted">
            คุณได้รับเชิญให้เข้าร่วมทีมร้าน <strong>{preview.storeName}</strong>
          </p>
        </div>

        <dl className="space-y-2 rounded-lg border border-border bg-surface px-4 py-3 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-muted">อีเมล</dt>
            <dd className="text-ink">{preview.email}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted">บทบาท</dt>
            <dd className="text-ink">{roleLabel}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted">หมดอายุ</dt>
            <dd className="text-ink">{formatExpiry(preview.expiresAt)}</dd>
          </div>
        </dl>

        {isAuthenticated && !emailMatches ? (
          <p role="alert" className="text-sm text-danger">
            บัญชีที่เข้าสู่ระบบ ({user?.email}) ไม่ตรงกับอีเมลคำเชิญ กรุณาเข้าสู่ระบบด้วย{' '}
            {preview.email}
          </p>
        ) : null}

        {form.formState.errors.root ? (
          <p role="alert" className="text-sm text-danger">
            {form.formState.errors.root.message}
          </p>
        ) : null}

        {isAuthenticated && emailMatches ? (
          <div className="flex gap-3">
            <Button
              type="button"
              disabled={acceptExistingMutation.isPending}
              aria-busy={acceptExistingMutation.isPending}
              onClick={onAcceptExisting}
            >
              {acceptExistingMutation.isPending ? 'กำลังตอบรับ...' : 'ตอบรับคำเชิญ'}
            </Button>
            <Button variant="outline" asChild>
              <Link href="/vendor">กลับแดชบอร์ด</Link>
            </Button>
          </div>
        ) : preview.userExists ? (
          <div className="space-y-3">
            <p className="text-sm text-muted">
              อีเมลนี้มีบัญชีอยู่แล้ว กรุณาเข้าสู่ระบบเพื่อตอบรับคำเชิญ
            </p>
            <Button asChild>
              <Link href={loginHref}>เข้าสู่ระบบเพื่อตอบรับคำเชิญ</Link>
            </Button>
          </div>
        ) : (
          <form onSubmit={form.handleSubmit(onRegisterAndAccept)} className="space-y-4">
            <p className="text-sm text-muted">สร้างบัญชีผู้ขายเพื่อเข้าร่วมทีมร้านนี้</p>

            <div>
              <Label htmlFor="email">อีเมล</Label>
              <Input id="email" type="email" value={preview.email} disabled className="mt-1.5" />
            </div>

            <div>
              <Label htmlFor="fullName" required>
                ชื่อ-นามสกุล
              </Label>
              <Input
                id="fullName"
                autoComplete="name"
                placeholder="ชื่อ-นามสกุล"
                aria-invalid={!!form.formState.errors.fullName}
                aria-describedby={form.formState.errors.fullName ? 'fullName-error' : undefined}
                className="mt-1.5"
                {...form.register('fullName')}
              />
              {form.formState.errors.fullName ? (
                <p id="fullName-error" role="alert" className="mt-1 text-xs text-danger">
                  {form.formState.errors.fullName.message}
                </p>
              ) : null}
            </div>

            <div>
              <Label htmlFor="password" required>
                รหัสผ่าน
              </Label>
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                placeholder="อย่างน้อย 8 ตัวอักษร"
                aria-invalid={!!form.formState.errors.password}
                aria-describedby={form.formState.errors.password ? 'password-error' : undefined}
                className="mt-1.5"
                {...form.register('password')}
              />
              {form.formState.errors.password ? (
                <p id="password-error" role="alert" className="mt-1 text-xs text-danger">
                  {form.formState.errors.password.message}
                </p>
              ) : null}
            </div>

            <div className="flex gap-3">
              <Button
                type="submit"
                disabled={acceptNewUserMutation.isPending}
                aria-busy={acceptNewUserMutation.isPending}
              >
                {acceptNewUserMutation.isPending
                  ? 'กำลังสร้างบัญชี...'
                  : 'สร้างบัญชีและตอบรับคำเชิญ'}
              </Button>
              <Button variant="outline" asChild>
                <Link href={loginHref}>มีบัญชีแล้ว</Link>
              </Button>
            </div>
          </form>
        )}
      </CardBody>
    </Card>
  );
}

export default function StoreInvitePage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-4 py-12">
      <Suspense fallback={<p className="text-muted">กำลังโหลด...</p>}>
        <StoreInvitePageContent />
      </Suspense>
    </div>
  );
}
