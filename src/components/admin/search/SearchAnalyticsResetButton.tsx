'use client';

import { ConfirmDeleteButton } from '@/components/ui/confirm-delete-button';

const CONFIRM_LABEL = 'ล้างข้อมูล';

type SearchAnalyticsResetButtonProps = {
  disabled?: boolean;
  loading?: boolean;
  onReset: () => Promise<void>;
};

export function SearchAnalyticsResetButton({
  disabled = false,
  loading = false,
  onReset,
}: SearchAnalyticsResetButtonProps) {
  return (
    <ConfirmDeleteButton
      confirmLabel={CONFIRM_LABEL}
      title="ล้างข้อมูลวิเคราะห์การค้นหา"
      description="จะลบประวัติการค้นหาและสถิติคำแนะนำทั้งหมดอย่างถาวร ไม่สามารถย้อนกลับได้"
      confirmButtonLabel="ล้างทั้งหมด"
      confirmPendingLabel="กำลังล้าง..."
      size="default"
      variant="destructive"
      disabled={disabled}
      isDeleting={loading}
      onConfirm={onReset}
    >
      ล้างข้อมูล
    </ConfirmDeleteButton>
  );
}
