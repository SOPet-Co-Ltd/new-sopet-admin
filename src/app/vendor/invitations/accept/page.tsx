'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardBody, PageHeader } from '@/components/ui/card';
import { useAcceptStoreInvitation } from '@/hooks/useTeam';

function AcceptInvitationPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token') ?? '';
  const acceptMutation = useAcceptStoreInvitation();
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setMessage('ลิงก์คำเชิญไม่ถูกต้อง');
    } else {
      setMessage(null);
    }
  }, [token]);

  async function handleAccept() {
    if (!token) return;
    try {
      await acceptMutation.mutateAsync(token);
      setMessage('ตอบรับคำเชิญแล้ว — กำลังพาไปหน้าร้านค้า');
      router.push('/vendor/stores');
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'ตอบรับคำเชิญไม่สำเร็จ');
    }
  }

  return (
    <div className="mx-auto max-w-lg pt-16">
      <PageHeader title="คำเชิญเข้าร่วมร้านค้า" description="ตอบรับคำเชิญเพื่อเข้าร่วมทีม" />
      <Card>
        <CardBody className="space-y-4">
          {message ? <p className="text-sm text-muted">{message}</p> : null}
          <div className="flex gap-3">
            <Button
              type="button"
              disabled={!token || acceptMutation.isPending}
              aria-busy={acceptMutation.isPending}
              onClick={handleAccept}
            >
              {acceptMutation.isPending ? 'กำลังตอบรับ...' : 'ตอบรับคำเชิญ'}
            </Button>
            <Button variant="outline" asChild>
              <Link href="/vendor">กลับแดชบอร์ด</Link>
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

export default function AcceptInvitationPage() {
  return (
    <Suspense fallback={<p className="text-muted">กำลังโหลด...</p>}>
      <AcceptInvitationPageContent />
    </Suspense>
  );
}
