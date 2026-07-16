'use client';

import { HiMegaphone } from 'react-icons/hi2';
import { Badge } from '@/components/ui/badge';
import { ConfirmDeleteButton } from '@/components/ui/confirm-delete-button';
import { Button } from '@/components/ui/button';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import type { PlatformAd } from '@/types';
import {
  ListRowSkeleton,
  PlatformListRow,
  PlatformMediaThumbnail,
  PlatformSettingsEmptyState,
  PlatformSettingsLoadError,
  PlatformSettingsMutationError,
} from './platform-settings-primitives';

type AdsPanelProps = {
  ads: PlatformAd[];
  loading: boolean;
  error: unknown;
  pending: boolean;
  deletePending: boolean;
  deleteError: unknown;
  onRetry: () => void;
  onEdit: (ad: PlatformAd) => void;
  onDelete: (id: string) => Promise<void>;
};

export function AdsPanel({
  ads,
  loading,
  error,
  pending,
  deletePending,
  deleteError,
  onRetry,
  onEdit,
  onDelete,
}: AdsPanelProps) {
  return (
    <Card>
      <CardHeader className="space-y-1">
        <h2 className="font-display font-medium text-balance text-ink">
          โฆษณาป๊อปอัพ{loading ? '' : ` (${ads.length})`}
        </h2>
        <p className="text-sm text-pretty text-muted-foreground">
          เปิดใช้งานได้ครั้งละ 1 โฆษณา — เมื่อเปิดโฆษณาใหม่ โฆษณาอื่นจะถูกปิดอัตโนมัติ
        </p>
      </CardHeader>
      <CardBody className="space-y-3">
        {loading ? (
          <ListRowSkeleton rows={2} label="กำลังโหลดโฆษณา" />
        ) : error ? (
          <PlatformSettingsLoadError
            message="โหลดโฆษณาไม่สำเร็จ"
            detail={error}
            onRetry={onRetry}
          />
        ) : ads.length === 0 ? (
          <PlatformSettingsEmptyState
            icon={<HiMegaphone className="mx-auto size-10" />}
            title="ยังไม่มีโฆษณา"
            description="กดปุ่ม เพิ่มโฆษณา ด้านบนเพื่อสร้างป๊อปอัพบนหน้าแรก"
          />
        ) : (
          <ul className="space-y-3">
            {ads.map((ad) => (
              <PlatformListRow key={ad.id}>
                <div className="flex min-w-0 flex-1 items-center gap-4">
                  <PlatformMediaThumbnail src={ad.imageUrl} alt={ad.title} />
                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate font-medium text-ink">{ad.title}</p>
                      <Badge status={ad.isActive ? 'published' : 'draft'}>
                        {ad.isActive ? 'เปิดใช้งาน' : 'ปิด'}
                      </Badge>
                    </div>
                    <p className="truncate text-sm text-muted-foreground">
                      {ad.linkUrl ? ad.linkUrl : 'ไม่มีลิงก์'}
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={pending}
                    aria-busy={pending}
                    onClick={() => onEdit(ad)}
                  >
                    แก้ไข
                  </Button>
                  <ConfirmDeleteButton
                    confirmLabel={ad.title}
                    title="ลบโฆษณา"
                    variant="destructive"
                    disabled={pending}
                    isDeleting={deletePending}
                    onConfirm={async () => {
                      await onDelete(ad.id);
                    }}
                  />
                </div>
              </PlatformListRow>
            ))}
          </ul>
        )}
        {deleteError ? (
          <PlatformSettingsMutationError message="ลบโฆษณาไม่สำเร็จ" detail={deleteError} />
        ) : null}
      </CardBody>
    </Card>
  );
}
