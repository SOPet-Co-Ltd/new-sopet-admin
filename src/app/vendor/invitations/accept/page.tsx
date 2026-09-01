'use client';

import { useRouter } from 'next/navigation';
import { Suspense, useEffect } from 'react';
import { useSecretTokenParam } from '@/lib/auth/useSecretTokenParam';

function AcceptInvitationRedirectContent() {
  const router = useRouter();
  const token = useSecretTokenParam();

  useEffect(() => {
    if (token) {
      router.replace(`/invite/store#token=${encodeURIComponent(token)}`);
    }
  }, [router, token]);

  return <p className="text-muted">กำลังเปลี่ยนเส้นทาง...</p>;
}

export default function AcceptInvitationPage() {
  return (
    <Suspense fallback={<p className="text-muted">กำลังโหลด...</p>}>
      <AcceptInvitationRedirectContent />
    </Suspense>
  );
}
