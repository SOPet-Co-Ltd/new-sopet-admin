'use client';

import { HiRectangleGroup } from 'react-icons/hi2';
import { Badge } from '@/components/ui/badge';
import { ConfirmDeleteButton } from '@/components/ui/confirm-delete-button';
import { Button } from '@/components/ui/button';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import type { PlatformBanner } from '@/types';
import {
  ListRowSkeleton,
  PlatformListRow,
  PlatformMediaThumbnail,
  PlatformSettingsEmptyState,
  PlatformSettingsLoadError,
  PlatformSettingsMutationError,
  ReorderButtons,
} from './platform-settings-primitives';

type BannersPanelProps = {
  banners: PlatformBanner[];
  loading: boolean;
  error: unknown;
  pending: boolean;
  deletePending: boolean;
  reorderError: boolean;
  deleteError: unknown;
  onRetry: () => void;
  onMove: (index: number, direction: -1 | 1) => void;
  onEdit: (banner: PlatformBanner) => void;
  onDelete: (id: string) => Promise<void>;
};

export function BannersPanel({
  banners,
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
}: BannersPanelProps) {
  return (
    <Card>
      <CardHeader className="space-y-1">
        <h2 className="font-display font-medium text-balance text-ink">
          แบนเนอร์{loading ? '' : ` (${banners.length})`}
        </h2>
        <p className="text-sm text-pretty text-muted-foreground">
          แสดงบนหน้าแรกร้านค้า — ลำดับด้านบนจะแสดงก่อน
        </p>
      </CardHeader>
      <CardBody className="space-y-3">
        {loading ? (
          <ListRowSkeleton rows={3} label="กำลังโหลดแบนเนอร์" />
        ) : error ? (
          <PlatformSettingsLoadError
            message="โหลดแบนเนอร์ไม่สำเร็จ"
            detail={error}
            onRetry={onRetry}
          />
        ) : banners.length === 0 ? (
          <PlatformSettingsEmptyState
            icon={<HiRectangleGroup className="mx-auto size-10" />}
            title="ยังไม่มีแบนเนอร์"
            description="กดปุ่ม เพิ่มแบนเนอร์ ด้านบนเพื่อเพิ่มสไลด์แรกบนหน้าแรก"
          />
        ) : (
          <ul className="space-y-3">
            {banners.map((banner, index) => (
              <PlatformListRow key={banner.id}>
                <div className="flex min-w-0 flex-1 items-center gap-4">
                  <PlatformMediaThumbnail src={banner.imageUrl} alt={banner.title} />
                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate font-medium text-ink">{banner.title}</p>
                      <Badge status={banner.isActive ? 'published' : 'draft'}>
                        {banner.isActive ? 'เปิดใช้งาน' : 'ปิด'}
                      </Badge>
                    </div>
                    <p className="truncate text-sm text-muted-foreground">
                      ลำดับ {banner.sortOrder + 1}
                      {banner.linkUrl ? ` · ${banner.linkUrl}` : ''}
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 flex-wrap items-center gap-2">
                  <ReorderButtons
                    index={index}
                    total={banners.length}
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
                    onClick={() => onEdit(banner)}
                  >
                    แก้ไข
                  </Button>
                  <ConfirmDeleteButton
                    confirmLabel={banner.title}
                    title="ลบแบนเนอร์"
                    variant="destructive"
                    disabled={pending}
                    isDeleting={deletePending}
                    onConfirm={async () => {
                      await onDelete(banner.id);
                    }}
                  />
                </div>
              </PlatformListRow>
            ))}
          </ul>
        )}
        {reorderError ? (
          <PlatformSettingsMutationError message="จัดลำดับแบนเนอร์ไม่สำเร็จ — ลองอีกครั้ง" />
        ) : null}
        {deleteError ? (
          <PlatformSettingsMutationError message="ลบแบนเนอร์ไม่สำเร็จ" detail={deleteError} />
        ) : null}
      </CardBody>
    </Card>
  );
}
