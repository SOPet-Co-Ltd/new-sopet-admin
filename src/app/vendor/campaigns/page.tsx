'use client';

import Link from 'next/link';
import { HiOutlineMegaphone } from 'react-icons/hi2';
import { Button } from '@/components/ui/button';
import { Card, CardBody, PageHeader } from '@/components/ui/card';
import { SaleCampaignListItem } from '@/components/vendor/sale-campaign-list-item';
import {
  useDeleteSaleCampaign,
  useStoreSaleCampaigns,
  useToggleSaleCampaign,
} from '@/hooks/useSaleCampaigns';
import { useVendorStoreId } from '@/hooks/useVendorStoreId';
import type { SaleCampaign } from '@/types';

function mutationErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

function CampaignsListSkeleton() {
  return (
    <ul
      className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-white"
      aria-busy="true"
      aria-label="กำลังโหลดแคมเปญ"
    >
      {Array.from({ length: 4 }).map((_, index) => (
        <li
          key={index}
          className="flex flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <div className="h-4 w-40 max-w-full animate-pulse rounded-md bg-surface motion-reduce:animate-none" />
              <div className="h-5 w-16 animate-pulse rounded-full bg-surface motion-reduce:animate-none" />
            </div>
            <div className="h-3 w-56 max-w-full animate-pulse rounded-md bg-surface motion-reduce:animate-none" />
          </div>
          <div className="flex shrink-0 gap-2">
            <div className="h-8 w-20 animate-pulse rounded-md bg-surface motion-reduce:animate-none" />
            <div className="h-8 w-14 animate-pulse rounded-md bg-surface motion-reduce:animate-none" />
            <div className="h-8 w-12 animate-pulse rounded-md bg-surface motion-reduce:animate-none" />
          </div>
        </li>
      ))}
    </ul>
  );
}

function CampaignsEmptyState() {
  return (
    <div
      className="flex flex-col items-center justify-center rounded-xl border border-border bg-white px-6 py-14 text-center"
      role="status"
    >
      <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-surface text-muted-foreground">
        <HiOutlineMegaphone className="size-6" aria-hidden="true" />
      </div>
      <h2 className="text-balance text-base font-medium text-ink">ยังไม่มีแคมเปญ</h2>
      <p className="mt-1.5 max-w-sm text-pretty text-sm text-muted-foreground">
        สร้างแคมเปญเพื่อลดราคาขายตาม % และแสดงราคาเดิมขีดฆ่าอย่างซื่อสัตย์ โปรโมชัน (โค้ด/ใช้ทันที)
        ยังใช้ลดเพิ่มตอนเช็คเอาต์ได้
      </p>
      <div className="mt-5">
        <Button variant="secondary" asChild>
          <Link href="/vendor/campaigns/new">สร้างแคมเปญ</Link>
        </Button>
      </div>
    </div>
  );
}

export default function VendorSaleCampaignsPage() {
  const storeId = useVendorStoreId();
  const { data: campaigns = [], isLoading, error } = useStoreSaleCampaigns(storeId);
  const deleteMutation = useDeleteSaleCampaign();
  const toggleMutation = useToggleSaleCampaign();

  function handleToggle(campaign: SaleCampaign) {
    toggleMutation.mutate({ id: campaign.id, isActive: !campaign.isActive });
  }

  async function handleDelete(campaign: SaleCampaign) {
    await deleteMutation.mutateAsync(campaign.id);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="แคมเปญ"
        description="ลดราคาจริงตาม % บนสินค้าที่เลือก — ราคาหลังลดคือราคาที่ลูกค้าชำระ (โปรโมชันตอนเช็คเอาต์ยังใช้ต่อท้ายได้)"
        action={
          storeId ? (
            <Button asChild>
              <Link href="/vendor/campaigns/new">สร้างแคมเปญ</Link>
            </Button>
          ) : undefined
        }
      />

      {!storeId ? (
        <Card className="border-dashed">
          <CardBody className="flex flex-col items-start gap-3 px-6 py-10 sm:items-center sm:text-center">
            <div className="max-w-md space-y-1.5">
              <h2 className="text-balance text-base font-medium text-ink">ยังไม่ได้เลือกร้านค้า</h2>
              <p className="text-pretty text-sm text-muted-foreground">
                เลือกร้านจากร้านค้าของฉันก่อน จึงจะดูและจัดการแคมเปญได้
              </p>
            </div>
            <Button variant="secondary" asChild>
              <Link href="/vendor/stores">ไปที่ร้านค้าของฉัน</Link>
            </Button>
          </CardBody>
        </Card>
      ) : null}

      {storeId && isLoading ? <CampaignsListSkeleton /> : null}

      {storeId && error ? (
        <p className="text-sm text-danger" role="alert">
          {mutationErrorMessage(error, 'โหลดแคมเปญไม่สำเร็จ')}
        </p>
      ) : null}

      {storeId && toggleMutation.error ? (
        <p className="text-sm text-danger" role="alert">
          {mutationErrorMessage(toggleMutation.error, 'เปลี่ยนสถานะแคมเปญไม่สำเร็จ')}
        </p>
      ) : null}

      {storeId && deleteMutation.error ? (
        <p className="text-sm text-danger" role="alert">
          {mutationErrorMessage(deleteMutation.error, 'ลบแคมเปญไม่สำเร็จ')}
        </p>
      ) : null}

      {storeId && !isLoading && !error && campaigns.length === 0 ? <CampaignsEmptyState /> : null}

      {storeId && !isLoading && !error && campaigns.length > 0 ? (
        <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-white">
          {campaigns.map((campaign) => {
            const isToggling =
              toggleMutation.isPending && toggleMutation.variables?.id === campaign.id;
            const isDeleting = deleteMutation.isPending && deleteMutation.variables === campaign.id;

            return (
              <SaleCampaignListItem
                key={campaign.id}
                campaign={campaign}
                isToggling={isToggling}
                isDeleting={isDeleting}
                onToggle={handleToggle}
                onDelete={handleDelete}
              />
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
