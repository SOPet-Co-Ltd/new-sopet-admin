'use client';

import { Card, CardBody } from '@/components/ui/card';
import { TaxonomyDeleteButton } from '@/components/admin/taxonomy/taxonomy-delete-button';
import { labelTaxonomyStatus } from '@/lib/i18n/th';
import type { TaxonomyItem } from '@/types';

export type RejectedTaxonomyKind = 'category' | 'tag';

const SECTION_COPY: Record<RejectedTaxonomyKind, { title: string; empty: string; error: string }> =
  {
    category: {
      title: 'หมวดหมู่ที่ปฏิเสธแล้ว',
      empty: 'ไม่มีหมวดหมู่ที่ปฏิเสธ',
      error: 'โหลดหมวดหมู่ที่ปฏิเสธไม่สำเร็จ',
    },
    tag: {
      title: 'แท็กที่ปฏิเสธแล้ว',
      empty: 'ไม่มีแท็กที่ปฏิเสธ',
      error: 'โหลดแท็กที่ปฏิเสธไม่สำเร็จ',
    },
  };

export interface RejectedTaxonomySectionProps {
  kind: RejectedTaxonomyKind;
  items: TaxonomyItem[];
  isLoading?: boolean;
  error?: Error | null;
  disabled?: boolean;
}

export function RejectedTaxonomySection({
  kind,
  items,
  isLoading = false,
  error = null,
  disabled = false,
}: RejectedTaxonomySectionProps) {
  const copy = SECTION_COPY[kind];

  if (isLoading) {
    return <p className="text-muted">กำลังโหลด...</p>;
  }

  if (error) {
    return (
      <p role="alert" className="text-sm text-danger">
        {copy.error}: {error.message}
      </p>
    );
  }

  return (
    <Card>
      <CardBody className="space-y-3">
        <h2 className="font-display font-medium text-ink">{copy.title}</h2>
        {items.length === 0 ? (
          <p className="text-sm text-muted">{copy.empty}</p>
        ) : (
          <ul className="space-y-2">
            {items.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between gap-4 rounded-lg border border-border bg-surface/50 px-4 py-3"
              >
                <div>
                  <p className="font-medium text-ink">{item.name}</p>
                  <p className="text-xs text-muted">
                    {item.slug} · {labelTaxonomyStatus(item.status)}
                  </p>
                </div>
                <TaxonomyDeleteButton item={item} kind={kind} disabled={disabled} />
              </li>
            ))}
          </ul>
        )}
      </CardBody>
    </Card>
  );
}
