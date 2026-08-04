'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardBody } from '@/components/ui/card';
import { verifyEmail } from '@/lib/api/emailVerification';
import { syncEmailVerificationStatus } from '@/lib/auth-session';

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>(
    token ? 'loading' : 'idle',
  );
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;

    let cancelled = false;

    verifyEmail(token)
      .then(async (result) => {
        if (cancelled) return;
        await syncEmailVerificationStatus();
        setMessage(result);
        setStatus('success');
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'ยืนยันอีเมลไม่สำเร็จ');
        setStatus('error');
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  if (!token) {
    return (
      <Card className="w-full max-w-md">
        <CardBody className="space-y-4 text-center">
          <p className="text-danger">ลิงก์ยืนยันอีเมลไม่ถูกต้องหรือหมดอายุ</p>
          <Button asChild variant="outline">
            <Link href="/login">กลับไปเข้าสู่ระบบ</Link>
          </Button>
        </CardBody>
      </Card>
    );
  }

  if (status === 'loading') {
    return (
      <Card className="w-full max-w-md">
        <CardBody className="text-center">
          <p className="text-muted">กำลังยืนยันอีเมล...</p>
        </CardBody>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full max-w-md">
        <CardBody className="space-y-4 text-center">
          <p className="text-danger" role="alert">
            {error}
          </p>
          <Button asChild variant="outline">
            <Link href="/login">กลับไปเข้าสู่ระบบ</Link>
          </Button>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardBody className="space-y-4 text-center">
        <h1 className="font-display text-xl font-semibold text-ink">ยืนยันอีเมลสำเร็จ</h1>
        <p className="text-sm text-muted" role="status">
          {message ?? 'อีเมลของคุณได้รับการยืนยันแล้ว'}
        </p>
        <Button className="w-full" onClick={() => router.replace('/login')}>
          เข้าสู่ระบบ
        </Button>
      </CardBody>
    </Card>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-4 py-12">
      <Suspense fallback={<p className="text-muted">กำลังโหลด...</p>}>
        <VerifyEmailContent />
      </Suspense>
    </div>
  );
}
