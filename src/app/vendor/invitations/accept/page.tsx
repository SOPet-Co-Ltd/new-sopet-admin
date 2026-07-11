'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect } from 'react';

function AcceptInvitationRedirectContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token') ?? '';

  useEffect(() => {
    if (token) {
      router.replace(`/invite/store?token=${encodeURIComponent(token)}`);
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
