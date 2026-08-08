import Link from 'next/link';
import { Button } from '@/components/ui/button';

/** Primary "บันทึก" CTA + live-on-save helper copy. No draft/publish control. */
export function EmailLiveSaveBar({
  isPending,
  disabled,
  onCancelHref,
}: {
  isPending: boolean;
  disabled?: boolean;
  onCancelHref?: string;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <p className="text-xs text-muted-foreground">
        บันทึกแล้วมีผลทันที — ไม่มีสถานะแบบร่าง/เผยแพร่
      </p>
      <div className="flex items-center gap-3">
        {onCancelHref ? (
          <Button type="button" variant="outline" asChild disabled={isPending}>
            <Link href={onCancelHref}>ยกเลิก</Link>
          </Button>
        ) : null}
        <Button type="submit" disabled={disabled || isPending} aria-busy={isPending}>
          {isPending ? 'กำลังบันทึก...' : 'บันทึก'}
        </Button>
      </div>
    </div>
  );
}
