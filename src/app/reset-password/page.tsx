'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Card, CardBody } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useResetPassword } from '@/hooks/usePasswordReset';
import { resetPasswordSchema, type ResetPasswordFormValues } from '@/lib/validations';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const resetMutation = useResetPassword();

  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  async function onSubmit(values: ResetPasswordFormValues) {
    if (!token) {
      form.setError('root', { message: 'ลิงก์รีเซ็ตรหัสผ่านไม่ถูกต้อง' });
      return;
    }
    try {
      await resetMutation.mutateAsync({ token, newPassword: values.password });
      router.replace('/login');
    } catch (err) {
      form.setError('root', {
        message: err instanceof Error ? err.message : 'รีเซ็ตรหัสผ่านไม่สำเร็จ',
      });
    }
  }

  if (!token) {
    return (
      <Card className="w-full max-w-md">
        <CardBody className="space-y-4 text-center">
          <p className="text-danger">ลิงก์รีเซ็ตรหัสผ่านไม่ถูกต้องหรือหมดอายุ</p>
          <Button asChild variant="outline">
            <Link href="/login">กลับไปเข้าสู่ระบบ</Link>
          </Button>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardBody>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <h1 className="font-display text-xl font-semibold text-ink">ตั้งรหัสผ่านใหม่</h1>
            <p className="mt-1 text-sm text-muted">กรอกรหัสผ่านใหม่สำหรับบัญชีของคุณ</p>
          </div>
          <div>
            <Label htmlFor="password" required>
              รหัสผ่านใหม่
            </Label>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              placeholder="อย่างน้อย 8 ตัวอักษร"
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
          <div>
            <Label htmlFor="confirmPassword" required>
              ยืนยันรหัสผ่านใหม่
            </Label>
            <Input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              placeholder="กรอกรหัสผ่านอีกครั้ง"
              aria-invalid={!!form.formState.errors.confirmPassword}
              aria-describedby={
                form.formState.errors.confirmPassword ? 'confirmPassword-error' : undefined
              }
              {...form.register('confirmPassword')}
              className="mt-1.5"
            />
            {form.formState.errors.confirmPassword ? (
              <p id="confirmPassword-error" role="alert" className="mt-1 text-xs text-danger">
                {form.formState.errors.confirmPassword.message}
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
            disabled={resetMutation.isPending}
            aria-busy={resetMutation.isPending}
          >
            {resetMutation.isPending ? 'กำลังบันทึก...' : 'บันทึกรหัสผ่านใหม่'}
          </Button>
        </form>
      </CardBody>
    </Card>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-4 py-12">
      <Suspense fallback={<p className="text-muted">กำลังโหลด...</p>}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
