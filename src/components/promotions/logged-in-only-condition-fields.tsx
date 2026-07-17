'use client';

import { Controller, useWatch, type Control } from 'react-hook-form';
import type { PromotionFormValues } from '@/lib/validations/promotions';
import { cn } from '@/lib/utils';

export function LoggedInOnlyConditionFields({
  control,
  idPrefix = 'promo',
}: {
  control: Control<PromotionFormValues>;
  idPrefix?: string;
}) {
  const loggedInOnlyEnabled = useWatch({ control, name: 'loggedInOnlyEnabled' });
  const sectionId = `${idPrefix}-section-logged-in-only`;
  const independenceNoteId = `${idPrefix}-logged-in-only-independence-note`;
  const guestNoteId = `${idPrefix}-logged-in-only-guest-note`;

  return (
    <section aria-labelledby={sectionId} className={cn('space-y-4 p-5 md:p-6')}>
      <div>
        <h3 id={sectionId} className="font-display text-sm font-medium text-balance text-ink">
          สมาชิกเท่านั้น
        </h3>
        <p className="mt-1 max-w-prose text-pretty text-sm text-muted-foreground">
          จำกัดเฉพาะลูกค้าที่เข้าสู่ระบบแล้ว ลูกค้าทั่วไป (ยังไม่เข้าสู่ระบบ) ใช้โปรโมชันนี้ไม่ได้
          สมาชิกที่เคยสั่งซื้อหรือบัญชีเก่ากว่าเกณฑ์ลูกค้าใหม่ยังใช้ได้
          เว้นแต่เปิดเงื่อนไขลูกค้าใหม่ด้วย
        </p>
      </div>

      <Controller
        control={control}
        name="loggedInOnlyEnabled"
        render={({ field }) => (
          <label
            htmlFor={`${idPrefix}-logged-in-only`}
            className="flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-surface/60 px-4 py-3 transition-colors hover:bg-surface"
          >
            <input
              id={`${idPrefix}-logged-in-only`}
              type="checkbox"
              className="mt-0.5 h-4 w-4 rounded border-border accent-brand"
              checked={field.value ?? false}
              onChange={(e) => field.onChange(e.target.checked)}
              onBlur={field.onBlur}
              ref={field.ref}
              name={field.name}
              aria-describedby={
                field.value ? `${independenceNoteId} ${guestNoteId}` : independenceNoteId
              }
            />
            <span>
              <span className="block text-sm font-medium text-ink">
                ใช้ได้เฉพาะสมาชิกที่เข้าสู่ระบบแล้ว
              </span>
              {!field.value ? (
                <span className="mt-0.5 block text-xs text-muted-foreground">
                  ปิดอยู่ = ไม่บังคับเข้าสู่ระบบสำหรับโปรโมชันนี้
                </span>
              ) : null}
            </span>
          </label>
        )}
      />

      {loggedInOnlyEnabled ? (
        <p id={guestNoteId} className="text-xs text-muted-foreground">
          ลูกค้าที่ยังไม่เข้าสู่ระบบจะใช้โปรโมชันนี้ไม่ได้
        </p>
      ) : null}

      <p id={independenceNoteId} className="text-xs text-muted-foreground">
        แยกจากเงื่อนไข「ลูกค้าใหม่」ด้านล่าง — ไม่ต้องเปิดทั้งสองอันหากต้องการแค่สมาชิก
      </p>
    </section>
  );
}
