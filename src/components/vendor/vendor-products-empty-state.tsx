import Link from 'next/link';
import { HiOutlineCube, HiOutlineMagnifyingGlass } from 'react-icons/hi2';
import { Button } from '@/components/ui/button';

type VendorProductsEmptyStateProps = {
  mode: 'catalog' | 'filtered';
  onClearFilters?: () => void;
};

export function VendorProductsEmptyState({ mode, onClearFilters }: VendorProductsEmptyStateProps) {
  const isFiltered = mode === 'filtered';

  return (
    <div
      className="flex flex-col items-center justify-center rounded-xl border border-border bg-white px-6 py-14 text-center"
      role="status"
    >
      <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-surface text-muted-foreground">
        {isFiltered ? (
          <HiOutlineMagnifyingGlass className="size-6" aria-hidden="true" />
        ) : (
          <HiOutlineCube className="size-6" aria-hidden="true" />
        )}
      </div>
      <h2 className="text-balance text-base font-medium text-ink">
        {isFiltered ? 'ไม่พบสินค้าที่ตรงเงื่อนไข' : 'ยังไม่มีสินค้าในร้าน'}
      </h2>
      <p className="mt-1.5 max-w-sm text-pretty text-sm text-muted">
        {isFiltered
          ? 'ลองเปลี่ยนคำค้นหาหรือล้างตัวกรองเพื่อดูรายการทั้งหมด'
          : 'เพิ่มสินค้าชิ้นแรกเพื่อเริ่มขายบน SOPET — ตั้งชื่อ ราคา สต็อก และรูปภาพ'}
      </p>
      <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
        {isFiltered && onClearFilters ? (
          <Button type="button" variant="outline" onClick={onClearFilters}>
            ล้างตัวกรอง
          </Button>
        ) : null}
        {!isFiltered ? (
          <Button asChild>
            <Link href="/vendor/products/new">เพิ่มสินค้า</Link>
          </Button>
        ) : null}
      </div>
    </div>
  );
}
