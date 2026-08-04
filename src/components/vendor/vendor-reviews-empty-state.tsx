import { HiOutlineChatBubbleBottomCenterText, HiOutlineMagnifyingGlass } from 'react-icons/hi2';
import { Button } from '@/components/ui/button';

type VendorReviewsEmptyStateProps = {
  mode: 'catalog' | 'filtered';
  onClearFilters?: () => void;
};

export function VendorReviewsEmptyState({ mode, onClearFilters }: VendorReviewsEmptyStateProps) {
  const isFiltered = mode === 'filtered';

  return (
    <div
      className="flex flex-col items-center justify-center rounded-xl border border-border bg-card px-6 py-14 text-center"
      role="status"
    >
      <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-surface text-muted-foreground">
        {isFiltered ? (
          <HiOutlineMagnifyingGlass className="size-6" aria-hidden="true" />
        ) : (
          <HiOutlineChatBubbleBottomCenterText className="size-6" aria-hidden="true" />
        )}
      </div>
      <h3 className="text-balance text-base font-medium text-ink">
        {isFiltered ? 'ไม่พบรีวิวที่ตรงกับตัวกรอง' : 'ยังไม่มีรีวิว'}
      </h3>
      <p className="mt-1.5 max-w-sm text-pretty text-sm text-muted-foreground">
        {isFiltered
          ? 'ลองเปลี่ยนสถานะการตอบกลับหรือคะแนน หรือล้างตัวกรองเพื่อดูรีวิวทั้งหมด'
          : 'เมื่อลูกค้าที่ซื้อสินค้าให้คะแนน รีวิวจะแสดงที่นี่เพื่อให้คุณตอบกลับได้'}
      </p>
      {isFiltered && onClearFilters ? (
        <div className="mt-5">
          <Button type="button" variant="outline" onClick={onClearFilters}>
            ล้างตัวกรอง
          </Button>
        </div>
      ) : null}
    </div>
  );
}
