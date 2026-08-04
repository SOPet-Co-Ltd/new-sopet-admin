'use client';

import { Controller, type Control } from 'react-hook-form';
import type { PromotionFormValues } from '@/lib/validations/promotions';
import { cn } from '@/lib/utils';

const SECTION_DESCRIPTION =
  'เมื่อเปิด ระบบจะเลือกโปรโมชันอัตโนมัติที่ดีที่สุดให้ลูกค้าครั้งแรกที่เข้าหน้าชำระเงินในเซสชันนั้น ลูกค้าเปลี่ยนหรือลบส่วนลดได้เอง';

export function AutoApplyFields({
  control,
  idPrefix = 'promo',
}: {
  control: Control<PromotionFormValues>;
  idPrefix?: string;
}) {
  const sectionId = `${idPrefix}-section-auto-apply`;
  const descriptionId = `${idPrefix}-auto-apply-description`;
  const offHintId = `${idPrefix}-auto-apply-off-hint`;

  return (
    <section aria-labelledby={sectionId} className={cn('space-y-4 p-5 md:p-6')}>
      <div>
        <h3 id={sectionId} className="font-display text-sm font-medium text-balance text-ink">
          ใช้อัตโนมัติ
        </h3>
        <p
          id={descriptionId}
          className="mt-1 max-w-prose text-pretty text-sm text-muted-foreground"
        >
          {SECTION_DESCRIPTION}
        </p>
      </div>

      <Controller
        control={control}
        name="autoApply"
        render={({ field }) => (
          <label
            htmlFor={`${idPrefix}-auto-apply`}
            className="flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-surface/60 px-4 py-3 transition-colors hover:bg-surface"
          >
            <input
              id={`${idPrefix}-auto-apply`}
              type="checkbox"
              className="mt-0.5 h-4 w-4 rounded border-border accent-brand"
              checked={field.value ?? false}
              onChange={(e) => field.onChange(e.target.checked)}
              onBlur={field.onBlur}
              ref={field.ref}
              name={field.name}
              aria-describedby={field.value ? descriptionId : `${descriptionId} ${offHintId}`}
            />
            <span>
              <span className="block text-sm font-medium text-ink">
                ใช้อัตโนมัติที่หน้าชำระเงิน
              </span>
              {!field.value ? (
                <span id={offHintId} className="mt-0.5 block text-xs text-muted-foreground">
                  ปิดอยู่ = ลูกค้าต้องเลือกหรือกรอกโค้ดเอง
                </span>
              ) : null}
            </span>
          </label>
        )}
      />
    </section>
  );
}
