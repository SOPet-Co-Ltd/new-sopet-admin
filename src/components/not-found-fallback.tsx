'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';

type NotFoundFallbackProps = {
  title?: string;
  message?: string;
};

export function NotFoundFallback({
  title = 'ไม่พบหน้า',
  message = 'หน้าที่คุณต้องการไม่มีอยู่ในระบบ',
}: NotFoundFallbackProps) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-6 text-center">
      <div>
        <h2 className="font-display text-2xl text-ink">{title}</h2>
        <p className="mt-2 max-w-md text-muted">{message}</p>
      </div>
      <Button asChild>
        <Link href="/">กลับหน้าหลัก</Link>
      </Button>
    </div>
  );
}
