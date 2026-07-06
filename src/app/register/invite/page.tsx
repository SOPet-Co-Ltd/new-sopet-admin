'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardBody } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAcceptVendorInvitation } from '@/hooks/useVendorInvitations';

const schema = z.object({
  fullName: z.string().min(1, 'กรุณากรอกชื่อ'),
  password: z.string().min(8, 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร'),
});

type FormValues = z.infer<typeof schema>;

function AcceptVendorInviteForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token') ?? '';
  const acceptMutation = useAcceptVendorInvitation();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { fullName: '', password: '' },
  });

  useEffect(() => {
    if (!token) {
      form.setError('root', { message: 'ลิงก์คำเชิญไม่ถูกต้อง' });
    }
  }, [form, token]);

  async function onSubmit(values: FormValues) {
    if (!token) return;
    try {
      await acceptMutation.mutateAsync({
        token,
        password: values.password,
        fullName: values.fullName,
      });
      router.push('/vendor');
    } catch (err) {
      form.setError('root', {
        message: err instanceof Error ? err.message : 'ตอบรับคำเชิญไม่สำเร็จ',
      });
    }
  }

  return (
    <Card className="w-full max-w-lg">
      <CardBody>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <h1 className="font-display text-xl font-semibold text-ink">คำเชิญเข้าร่วมแพลตฟอร์ม</h1>
            <p className="mt-1 text-sm text-muted">ตั้งรหัสผ่านและชื่อเพื่อสร้างบัญชีผู้ขาย</p>
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
              placeholder="อย่างน้อย 6 ตัวอักษร"
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

          {form.formState.errors.root ? (
            <p role="alert" className="text-sm text-danger">
              {form.formState.errors.root.message}
            </p>
          ) : null}

          <div className="flex gap-3">
            <Button
              type="submit"
              disabled={!token || acceptMutation.isPending}
              aria-busy={acceptMutation.isPending}
            >
              {acceptMutation.isPending ? 'กำลังสร้างบัญชี...' : 'สร้างบัญชีและเข้าใช้งาน'}
            </Button>
            <Button variant="outline" asChild>
              <Link href="/login">เข้าสู่ระบบ</Link>
            </Button>
          </div>
        </form>
      </CardBody>
    </Card>
  );
}

export default function AcceptVendorInvitePage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-4 py-12">
      <Suspense fallback={<p className="text-muted">กำลังโหลด...</p>}>
        <AcceptVendorInviteForm />
      </Suspense>
    </div>
  );
}
