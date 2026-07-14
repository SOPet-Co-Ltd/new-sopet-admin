'use client';

import { Suspense, useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Card, CardBody } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getDashboardPath, useCurrentUser, useLogin } from '@/hooks/useAuth';
import { useRequestPasswordReset } from '@/hooks/usePasswordReset';
import { getAccessToken } from '@/lib/api/client';
import { getErrorMessage } from '@/lib/api/errors';
import { AUTH_SESSION_MESSAGE_KEY, clearAuthSession } from '@/lib/auth-session';
import { isAccessTokenUsable } from '@/lib/jwt';
import {
  forgotPasswordSchema,
  loginSchema,
  type ForgotPasswordFormValues,
  type LoginFormValues,
} from '@/lib/validations';

function getSafeRedirect(value: string | null): string | null {
  if (!value || !value.startsWith('/') || value.startsWith('//')) {
    return null;
  }
  return value;
}

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const redirectTo = getSafeRedirect(searchParams.get('redirect'));
  const { user, isAuthenticated } = useCurrentUser();
  const login = useLogin();
  const requestReset = useRequestPasswordReset();
  const [showForgot, setShowForgot] = useState(false);
  const [resetMessage, setResetMessage] = useState<string | null>(null);
  const [sessionMessage] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    const stored = sessionStorage.getItem(AUTH_SESSION_MESSAGE_KEY);
    if (stored) {
      sessionStorage.removeItem(AUTH_SESSION_MESSAGE_KEY);
    }
    return stored;
  });

  useEffect(() => {
    const accessToken = getAccessToken();
    if (!isAccessTokenUsable(accessToken)) {
      clearAuthSession(queryClient);
    }
  }, [queryClient]);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const forgotForm = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  useEffect(() => {
    const accessToken = getAccessToken();
    if (isAuthenticated && isAccessTokenUsable(accessToken) && user) {
      router.replace(redirectTo ?? getDashboardPath(user.role));
    }
  }, [isAuthenticated, redirectTo, router, user]);

  async function onSubmit(values: LoginFormValues) {
    try {
      const result = await login.mutateAsync(values);
      router.replace(redirectTo ?? getDashboardPath(result.user.role));
    } catch (err) {
      form.setError('root', {
        message: getErrorMessage(err, 'เข้าสู่ระบบไม่สำเร็จ'),
      });
    }
  }

  async function onForgotSubmit(values: ForgotPasswordFormValues) {
    setResetMessage(null);
    try {
      const message = await requestReset.mutateAsync(values.email);
      setResetMessage(message);
      forgotForm.reset();
    } catch (err) {
      setResetMessage(getErrorMessage(err, 'ส่งคำขอไม่สำเร็จ'));
    }
  }

  return (
    <div className="flex min-h-screen">
      <div className="hidden flex-1 flex-col justify-between bg-brand p-12 text-white lg:flex">
        <div>
          <p className="font-display text-3xl font-semibold">SOPet</p>
          <p className="mt-1 text-sm text-white/80">แพลตฟอร์มสัตว์เลี้ยงครบวงจร</p>
        </div>
        <div>
          <p className="font-display text-2xl leading-snug">
            จัดการร้านค้า สินค้า และคำสั่งซื้อ
            <br />
            ได้ในที่เดียว
          </p>
          <p className="mt-4 max-w-sm text-sm text-white/75">
            พอร์ทัลสำหรับผู้ขายและผู้ดูแลระบบ SOPet
          </p>
        </div>
        <p className="text-xs text-white/50">© SOPet</p>
      </div>

      <div className="flex flex-1 items-center justify-center bg-cream px-4 py-12">
        <Card className="w-full max-w-md">
          <CardBody>
            {showForgot ? (
              <form onSubmit={forgotForm.handleSubmit(onForgotSubmit)} className="space-y-5">
                <div>
                  <h1 className="font-display text-xl font-semibold text-ink">ลืมรหัสผ่าน</h1>
                  <p className="mt-1 text-sm text-muted">
                    กรอกอีเมลที่ใช้สมัคร เราจะส่งลิงก์รีเซ็ตรหัสผ่านให้
                  </p>
                </div>
                <div>
                  <Label htmlFor="forgot-email" required>
                    อีเมล
                  </Label>
                  <Input
                    id="forgot-email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    aria-invalid={!!forgotForm.formState.errors.email}
                    aria-describedby={
                      forgotForm.formState.errors.email ? 'forgot-email-error' : undefined
                    }
                    {...forgotForm.register('email')}
                    className="mt-1.5"
                  />
                  {forgotForm.formState.errors.email ? (
                    <p id="forgot-email-error" role="alert" className="mt-1 text-xs text-danger">
                      {forgotForm.formState.errors.email.message}
                    </p>
                  ) : null}
                </div>
                {resetMessage ? <p className="text-sm text-muted">{resetMessage}</p> : null}
                <Button
                  type="submit"
                  className="w-full"
                  disabled={requestReset.isPending}
                  aria-busy={requestReset.isPending}
                >
                  {requestReset.isPending ? 'กำลังส่ง...' : 'ส่งลิงก์รีเซ็ตรหัสผ่าน'}
                </Button>
                <button
                  type="button"
                  className="w-full text-center text-sm text-brand hover:underline"
                  onClick={() => {
                    setShowForgot(false);
                    setResetMessage(null);
                  }}
                >
                  กลับไปเข้าสู่ระบบ
                </button>
              </form>
            ) : (
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <div className="mb-2 lg:hidden">
                  <p className="font-display text-2xl font-semibold text-ink">SOPet Admin</p>
                </div>
                <div>
                  <h1 className="font-display text-xl font-semibold text-ink">เข้าสู่ระบบ</h1>
                  <p className="mt-1 text-sm text-muted">ใช้บัญชีผู้ดูแลหรือผู้ขายของคุณ</p>
                </div>

                {sessionMessage ? (
                  <p
                    role="alert"
                    className="rounded-lg border border-danger/20 bg-danger-bg px-3 py-2 text-sm text-danger"
                  >
                    {sessionMessage}
                  </p>
                ) : null}

                <div>
                  <Label htmlFor="email" required>
                    อีเมล
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    aria-invalid={!!form.formState.errors.email}
                    aria-describedby={form.formState.errors.email ? 'email-error' : undefined}
                    {...form.register('email')}
                    className="mt-1.5"
                  />
                  {form.formState.errors.email ? (
                    <p id="email-error" role="alert" className="mt-1 text-xs text-danger">
                      {form.formState.errors.email.message}
                    </p>
                  ) : null}
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" required>
                      รหัสผ่าน
                    </Label>
                    <button
                      type="button"
                      className="text-xs text-brand hover:underline"
                      onClick={() => setShowForgot(true)}
                    >
                      ลืมรหัสผ่าน?
                    </button>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    placeholder="กรอกรหัสผ่าน"
                    aria-invalid={!!form.formState.errors.password}
                    aria-describedby={form.formState.errors.password ? 'password-error' : undefined}
                    {...form.register('password')}
                    className="mt-1.5"
                  />
                  {form.formState.errors.password ? (
                    <p id="password-error" role="alert" className="mt-1 text-xs text-danger">
                      {form.formState.errors.password.message}
                    </p>
                  ) : null}
                </div>

                {form.formState.errors.root ? (
                  <p role="alert" className="text-sm text-danger">
                    {form.formState.errors.root.message}
                  </p>
                ) : null}

                <Button
                  type="submit"
                  className="w-full"
                  disabled={login.isPending}
                  aria-busy={login.isPending}
                >
                  {login.isPending ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
                </Button>

                <p className="text-center text-sm text-muted">
                  ยังไม่มีบัญชี?{' '}
                  <Link href="/register" className="font-medium text-brand hover:underline">
                    สมัครเป็นผู้ขาย
                  </Link>
                </p>
              </form>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<p className="p-12 text-center text-muted">กำลังโหลด...</p>}>
      <LoginPageContent />
    </Suspense>
  );
}
