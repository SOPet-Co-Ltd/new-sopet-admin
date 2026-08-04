import Link from 'next/link';
import { HiOutlineTicket } from 'react-icons/hi2';
import { Button } from '@/components/ui/button';

type PlatformPromotionsEmptyStateProps = {
  createHref?: string;
};

export function PlatformPromotionsEmptyState({
  createHref = '/admin/promotions/new',
}: PlatformPromotionsEmptyStateProps) {
  return (
    <div
      className="flex flex-col items-center justify-center rounded-xl border border-border bg-white px-6 py-14 text-center"
      role="status"
    >
      <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-surface text-muted-foreground">
        <HiOutlineTicket className="size-6" aria-hidden="true" />
      </div>
      <h2 className="text-balance text-base font-medium text-ink">ยังไม่มีโปรโมชันแพลตฟอร์ม</h2>
      <p className="mt-1.5 max-w-sm text-pretty text-sm text-muted-foreground">
        สร้างโค้ดส่วนลดหรือโปรโมชันระดับแพลตฟอร์ม เพื่อใช้กับลูกค้าทั้งหมดบน SOPet
        และควบคุมการใช้งานได้อย่างชัดเจน
      </p>
      <div className="mt-5">
        <Button variant="secondary" asChild>
          <Link href={createHref}>สร้างโปรโมชัน</Link>
        </Button>
      </div>
    </div>
  );
}
