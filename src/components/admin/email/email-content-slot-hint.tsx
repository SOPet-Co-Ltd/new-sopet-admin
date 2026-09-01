import { cn } from '@/lib/utils';

/** Callout emphasizing the required `{{{content}}}` slot in a container shell. */
export function EmailContentSlotHint({ error }: { error?: boolean }) {
  return (
    <p className={cn('text-sm', error ? 'font-medium text-danger' : 'text-muted-foreground')}>
      คอนเทนเนอร์ต้องมี <code className="font-mono">{'{{{content}}}'}</code>{' '}
      สำหรับแทรกเนื้อหาเทมเพลต
    </p>
  );
}
