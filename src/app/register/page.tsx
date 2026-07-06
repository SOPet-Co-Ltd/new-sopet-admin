'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Card, CardBody } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRegisterVendor } from '@/hooks/useRegisterVendor';
import { registerVendorSchema, type RegisterVendorFormValues } from '@/lib/validations';

export default function RegisterPage() {
  const router = useRouter();
  const register = useRegisterVendor();

  const form = useForm<RegisterVendorFormValues>({
    resolver: zodResolver(registerVendorSchema),
    defaultValues: { email: '', password: '', fullName: '' },
  });

  async function onSubmit(values: RegisterVendorFormValues) {
    try {
      await register.mutateAsync(values);
      router.replace('/vendor/requests');
    } catch (err) {
      form.setError('root', {
        message: err instanceof Error ? err.message : 'ลงทะเบียนไม่สำเร็จ',
      });
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-4 py-12">
      <Card className="w-full max-w-md">
        <CardBody>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <h1 className="font-display text-xl font-semibold text-ink">ลงทะเบียนผู้ขาย</h1>
              <p className="mt-1 text-sm text-muted">สร้างบัญชีเพื่อขอเปิดร้านค้าบน SOPet</p>
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
                {...form.register('fullName')}
                className="mt-1.5"
              />
              {form.formState.errors.fullName ? (
                <p id="fullName-error" role="alert" className="mt-1 text-xs text-danger">
                  {form.formState.errors.fullName.message}
                </p>
              ) : null}
            </div>

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
              disabled={register.isPending}
              aria-busy={register.isPending}
            >
              {register.isPending ? 'กำลังลงทะเบียน...' : 'ลงทะเบียน'}
            </Button>

            <p className="text-center text-sm text-muted">
              มีบัญชีแล้ว?{' '}
              <Link href="/login" className="text-brand hover:underline">
                เข้าสู่ระบบ
              </Link>
            </p>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
