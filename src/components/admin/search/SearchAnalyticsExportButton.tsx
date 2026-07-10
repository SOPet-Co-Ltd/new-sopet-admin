'use client';

import { Button } from '@/components/ui/button';

type SearchAnalyticsExportButtonProps = {
  disabled?: boolean;
  loading?: boolean;
  onExport: () => Promise<void>;
};

export function SearchAnalyticsExportButton({
  disabled = false,
  loading = false,
  onExport,
}: SearchAnalyticsExportButtonProps) {
  return (
    <Button
      type="button"
      variant="outline"
      disabled={disabled || loading}
      aria-busy={loading}
      onClick={() => void onExport()}
    >
      {loading ? 'กำลังส่งออก...' : 'ส่งออก CSV'}
    </Button>
  );
}
