'use client';

import { Button } from '@/components/ui/button';
import { ERROR_MESSAGES } from '@/lib/api/error-messages';

type ErrorFallbackProps = {
  title?: string;
  message?: string;
  onRetry?: () => void;
};

export function ErrorFallback({
  title = 'เกิดข้อผิดพลาด',
  message = ERROR_MESSAGES.RENDER_ERROR,
  onRetry,
}: ErrorFallbackProps) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-6 text-center">
      <div>
        <h2 className="font-display text-2xl text-ink">{title}</h2>
        <p className="mt-2 max-w-md text-muted">{message}</p>
      </div>
      {onRetry ? (
        <Button type="button" onClick={onRetry}>
          ลองใหม่อีกครั้ง
        </Button>
      ) : null}
    </div>
  );
}
