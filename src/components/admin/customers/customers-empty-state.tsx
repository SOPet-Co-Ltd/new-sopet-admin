import { HiMagnifyingGlass, HiUsers } from 'react-icons/hi2';
import { Button } from '@/components/ui/button';

type CustomersEmptyStateProps = {
  hasSearch: boolean;
  onClearSearch: () => void;
};

export function CustomersEmptyState({ hasSearch, onClearSearch }: CustomersEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card px-6 py-14 text-center shadow-[var(--shadow-card)]">
      <div
        className="flex size-12 items-center justify-center rounded-full bg-surface text-muted-foreground"
        aria-hidden="true"
      >
        {hasSearch ? <HiMagnifyingGlass className="size-6" /> : <HiUsers className="size-6" />}
      </div>
      <p className="mt-4 font-medium text-ink">
        {hasSearch ? 'ไม่พบลูกค้าที่ตรงกับคำค้นหา' : 'ยังไม่มีลูกค้าในแพลตฟอร์ม'}
      </p>
      <p className="mt-1.5 max-w-sm text-pretty text-sm text-muted-foreground">
        {hasSearch
          ? 'ลองค้นหาด้วยชื่อ เบอร์โทร หรืออีเมลอื่น'
          : 'ลูกค้าจะปรากฏที่นี่หลังสมัครหรือสั่งซื้อผ่าน SOPet'}
      </p>
      {hasSearch ? (
        <Button type="button" variant="outline" size="sm" className="mt-5" onClick={onClearSearch}>
          ล้างคำค้นหา
        </Button>
      ) : null}
    </div>
  );
}
