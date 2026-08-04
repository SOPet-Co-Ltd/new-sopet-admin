import Link from 'next/link';
import { HiOutlineTicket } from 'react-icons/hi2';
import { Button } from '@/components/ui/button';

type VendorPromotionsEmptyStateProps = {
  createHref?: string;
  title?: string;
  description?: string;
  ctaLabel?: string;
};

export function VendorPromotionsEmptyState({
  createHref = '/vendor/promotions/new',
  title = 'ยังไม่มีโปรโมชัน',
  description = 'สร้างโค้ดส่วนลดหรือโปรโมชันร้าน เพื่อดึงลูกค้าและควบคุมการใช้งานได้อย่างชัดเจน',
  ctaLabel = 'สร้างโปรโมชัน',
}: VendorPromotionsEmptyStateProps) {
  return (
    <div
      className="flex flex-col items-center justify-center rounded-xl border border-border bg-white px-6 py-14 text-center"
      role="status"
    >
      <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-surface text-muted-foreground">
        <HiOutlineTicket className="size-6" aria-hidden="true" />
      </div>
      <h2 className="text-balance text-base font-medium text-ink">{title}</h2>
      <p className="mt-1.5 max-w-sm text-pretty text-sm text-muted-foreground">{description}</p>
      <div className="mt-5">
        <Button variant="secondary" asChild>
          <Link href={createHref}>{ctaLabel}</Link>
        </Button>
      </div>
    </div>
  );
}
