import Link from 'next/link';
import { HiBuildingStorefront, HiMagnifyingGlass } from 'react-icons/hi2';
import { Button } from '@/components/ui/button';

type StoresEmptyStateProps = {
  hasFilters: boolean;
  onClearFilters: () => void;
};

export function StoresEmptyState({ hasFilters, onClearFilters }: StoresEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card px-6 py-14 text-center shadow-[var(--shadow-card)]">
      <div
        className="flex size-12 items-center justify-center rounded-full bg-surface text-muted-foreground"
        aria-hidden="true"
      >
        {hasFilters ? (
          <HiMagnifyingGlass className="size-6" />
        ) : (
          <HiBuildingStorefront className="size-6" />
        )}
      </div>
      <p className="mt-4 font-medium text-ink">
        {hasFilters ? 'ไม่พบร้านค้าที่ตรงกับเงื่อนไข' : 'ยังไม่มีร้านค้าในระบบ'}
      </p>
      <p className="mt-1.5 max-w-sm text-pretty text-sm text-muted-foreground">
        {hasFilters
          ? 'ลองค้นหาด้วยชื่อ slug หรือเจ้าของอื่น หรือเปลี่ยนตัวกรองสถานะ'
          : 'ร้านค้าจะปรากฏที่นี่หลังอนุมัติคำขอเปิดร้าน — ตรวจสอบคำขอได้ที่ศูนย์คำขอ'}
      </p>
      {hasFilters ? (
        <Button type="button" variant="outline" size="sm" className="mt-5" onClick={onClearFilters}>
          ล้างตัวกรอง
        </Button>
      ) : (
        <Button type="button" variant="outline" size="sm" className="mt-5" asChild>
          <Link href="/admin/requests">ไปที่ศูนย์คำขอ</Link>
        </Button>
      )}
    </div>
  );
}
