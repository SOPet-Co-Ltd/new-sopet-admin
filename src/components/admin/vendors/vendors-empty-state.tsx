import { HiMagnifyingGlass, HiUserGroup } from 'react-icons/hi2';
import { Button } from '@/components/ui/button';

type VendorsEmptyStateProps = {
  hasFilters: boolean;
  onClearFilters: () => void;
};

export function VendorsEmptyState({ hasFilters, onClearFilters }: VendorsEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card px-6 py-14 text-center shadow-[var(--shadow-card)]">
      <div
        className="flex size-12 items-center justify-center rounded-full bg-surface text-muted-foreground"
        aria-hidden="true"
      >
        {hasFilters ? <HiMagnifyingGlass className="size-6" /> : <HiUserGroup className="size-6" />}
      </div>
      <p className="mt-4 font-medium text-ink">
        {hasFilters ? 'ไม่พบผู้ขายที่ตรงกับเงื่อนไข' : 'ยังไม่มีผู้ขายในระบบ'}
      </p>
      <p className="mt-1.5 max-w-sm text-pretty text-sm text-muted-foreground">
        {hasFilters
          ? 'ลองค้นหาด้วยชื่อหรืออีเมลอื่น หรือเปลี่ยนตัวกรองสถานะ'
          : 'ผู้ขายจะปรากฏที่นี่หลังสมัครหรือตอบรับคำเชิญ — ส่งคำเชิญได้ที่ศูนย์คำขอ'}
      </p>
      {hasFilters ? (
        <Button type="button" variant="outline" size="sm" className="mt-5" onClick={onClearFilters}>
          ล้างตัวกรอง
        </Button>
      ) : null}
    </div>
  );
}
