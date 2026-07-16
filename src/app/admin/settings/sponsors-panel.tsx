'use client';

import { HiSparkles } from 'react-icons/hi2';
import { Badge } from '@/components/ui/badge';
import { ConfirmDeleteButton } from '@/components/ui/confirm-delete-button';
import { Button } from '@/components/ui/button';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import type { PlatformSponsor } from '@/types';
import {
  ListRowSkeleton,
  PlatformListRow,
  PlatformMediaThumbnail,
  PlatformSettingsEmptyState,
  PlatformSettingsLoadError,
  PlatformSettingsMutationError,
  ReorderButtons,
} from './platform-settings-primitives';

type SponsorsPanelProps = {
  sponsors: PlatformSponsor[];
  loading: boolean;
  error: unknown;
  pending: boolean;
  deletePending: boolean;
  reorderError: boolean;
  deleteError: unknown;
  onRetry: () => void;
  onMove: (index: number, direction: -1 | 1) => void;
  onEdit: (sponsor: PlatformSponsor) => void;
  onDelete: (id: string) => Promise<void>;
};

export function SponsorsPanel({
  sponsors,
  loading,
  error,
  pending,
  deletePending,
  reorderError,
  deleteError,
  onRetry,
  onMove,
  onEdit,
  onDelete,
}: SponsorsPanelProps) {
  return (
    <Card>
      <CardHeader className="space-y-1">
        <h2 className="font-display font-medium text-balance text-ink">
          สปอนเซอร์{loading ? '' : ` (${sponsors.length})`}
        </h2>
        <p className="text-sm text-pretty text-muted-foreground">
          โลโก้พาร์ทเนอร์บนหน้าแรก — ลำดับด้านบนจะแสดงก่อน
        </p>
      </CardHeader>
      <CardBody className="space-y-3">
        {loading ? (
          <ListRowSkeleton rows={3} label="กำลังโหลดสปอนเซอร์" />
        ) : error ? (
          <PlatformSettingsLoadError
            message="โหลดสปอนเซอร์ไม่สำเร็จ"
            detail={error}
            onRetry={onRetry}
          />
        ) : sponsors.length === 0 ? (
          <PlatformSettingsEmptyState
            icon={<HiSparkles className="mx-auto size-10" />}
            title="ยังไม่มีสปอนเซอร์"
            description="กดปุ่ม เพิ่มสปอนเซอร์ ด้านบนเพื่อแสดงโลโก้พาร์ทเนอร์บนหน้าแรก"
          />
        ) : (
          <ul className="space-y-3">
            {sponsors.map((sponsor, index) => (
              <PlatformListRow key={sponsor.id}>
                <div className="flex min-w-0 flex-1 items-center gap-4">
                  <PlatformMediaThumbnail src={sponsor.imageUrl} alt={sponsor.name} />
                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate font-medium text-ink">{sponsor.name}</p>
                      <Badge status={sponsor.isActive ? 'published' : 'draft'}>
                        {sponsor.isActive ? 'เปิดใช้งาน' : 'ปิด'}
                      </Badge>
                    </div>
                    <p className="truncate text-sm text-muted-foreground">
                      ลำดับ {sponsor.sortOrder + 1}
                      {sponsor.linkUrl ? ` · ${sponsor.linkUrl}` : ''}
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 flex-wrap items-center gap-2">
                  <ReorderButtons
                    index={index}
                    total={sponsors.length}
                    disabled={pending}
                    busy={pending}
                    onMove={onMove}
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={pending}
                    aria-busy={pending}
                    onClick={() => onEdit(sponsor)}
                  >
                    แก้ไข
                  </Button>
                  <ConfirmDeleteButton
                    confirmLabel={sponsor.name}
                    title="ลบสปอนเซอร์"
                    variant="destructive"
                    disabled={pending}
                    isDeleting={deletePending}
                    onConfirm={async () => {
                      await onDelete(sponsor.id);
                    }}
                  />
                </div>
              </PlatformListRow>
            ))}
          </ul>
        )}
        {reorderError ? (
          <PlatformSettingsMutationError message="จัดลำดับสปอนเซอร์ไม่สำเร็จ — ลองอีกครั้ง" />
        ) : null}
        {deleteError ? (
          <PlatformSettingsMutationError message="ลบสปอนเซอร์ไม่สำเร็จ" detail={deleteError} />
        ) : null}
      </CardBody>
    </Card>
  );
}
