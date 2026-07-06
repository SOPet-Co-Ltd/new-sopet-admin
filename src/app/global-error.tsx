'use client';

import { useEffect } from 'react';
import { ErrorFallback } from '@/components/error-fallback';

export default function GlobalError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="th">
      <body className="bg-cream text-ink antialiased">
        <ErrorFallback onRetry={unstable_retry} />
      </body>
    </html>
  );
}
