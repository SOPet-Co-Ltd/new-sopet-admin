'use client';

type LoadingFallbackProps = {
  title?: string;
  message?: string;
};

export function LoadingFallback({ title = 'กำลังโหลด...', message }: LoadingFallbackProps) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-6 text-center">
      <div>
        <h2 className="font-display text-2xl text-ink">{title}</h2>
        {message ? <p className="mt-2 max-w-md text-muted">{message}</p> : null}
      </div>
    </div>
  );
}
