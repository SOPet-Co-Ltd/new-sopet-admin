import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LoggedInOnlyConditionFields } from './logged-in-only-condition-fields';
import { PromotionFormFields } from './promotion-form-fields';
import { getPromotionTypeMeta, type PromotionTypeSlug } from '@/lib/promotions/metadata';
import {
  getPromotionFormDefaults,
  getPromotionFormValuesFromPromotion,
  promotionFormSchema,
  type PromotionFormValues,
} from '@/lib/validations/promotions';

const INDEPENDENCE_NOTE =
  'แยกจากเงื่อนไข「ลูกค้าใหม่」ด้านล่าง — ไม่ต้องเปิดทั้งสองอันหากต้องการแค่สมาชิก';

function LoggedInOnlyHarness({ defaultValues }: { defaultValues?: Partial<PromotionFormValues> }) {
  const form = useForm<PromotionFormValues>({
    resolver: zodResolver(promotionFormSchema),
    defaultValues: {
      ...getPromotionFormDefaults('percentage'),
      code: 'SAVE10',
      name: '10% Off',
      discountValue: 10,
      ...defaultValues,
    },
  });

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(() => undefined)} noValidate>
        <LoggedInOnlyConditionFields control={form.control} />
        <button type="submit">บันทึก</button>
      </form>
    </FormProvider>
  );
}

function FormFieldsHarness({
  type = 'percentage',
  scope = 'platform',
}: {
  type?: PromotionTypeSlug;
  scope?: 'platform' | 'store';
}) {
  const meta = getPromotionTypeMeta(type)!;
  const form = useForm<PromotionFormValues>({
    resolver: zodResolver(promotionFormSchema),
    defaultValues: {
      ...getPromotionFormDefaults(type),
      code: 'SAVE10',
      name: 'Promo',
      ...(meta.discountRequired ? { discountValue: 10 } : {}),
    },
  });

  return (
    <FormProvider {...form}>
      <PromotionFormFields
        register={form.register}
        control={form.control}
        errors={form.formState.errors}
        meta={meta}
        scope={scope}
        setValue={form.setValue}
        getValues={form.getValues}
      />
    </FormProvider>
  );
}

const SELECTABLE_TYPES: PromotionTypeSlug[] = [
  'percentage',
  'fixed_amount',
  'buy_x_get_y',
  'free_shipping',
  'fixed_shipping_discount',
  'percentage_shipping_discount',
];

describe('LoggedInOnlyConditionFields', () => {
  /**
   * AC: AC-015 / UI Spec — Independence note always visible (default off).
   * Behavior: Render default → independence note present; guest note absent
   * @category: core-functionality
   * @lane: integration
   * @dependency: LoggedInOnlyConditionFields
   * @complexity: low
   * ROI: 90
   */
  it('shows independence note when checkbox is off and hides guest note', () => {
    render(<LoggedInOnlyHarness />);

    expect(screen.getByRole('heading', { name: 'สมาชิกเท่านั้น' })).toBeInTheDocument();
    expect(screen.getByText(INDEPENDENCE_NOTE)).toBeInTheDocument();
    expect(
      screen.queryByText('ลูกค้าที่ยังไม่เข้าสู่ระบบจะใช้โปรโมชันนี้ไม่ได้'),
    ).not.toBeInTheDocument();
    expect(screen.getByText('ปิดอยู่ = ไม่บังคับเข้าสู่ระบบสำหรับโปรโมชันนี้')).toBeInTheDocument();
  });

  /**
   * AC: AC-016 / UI Spec partial — Guest note when on; independence note remains.
   * Behavior: Toggle checkbox on → guest note + independence note both visible
   * @category: core-functionality
   * @lane: integration
   * @dependency: LoggedInOnlyConditionFields
   * @complexity: low
   * ROI: 92
   */
  it('shows guest note when on and keeps independence note visible', async () => {
    const user = userEvent.setup();
    render(<LoggedInOnlyHarness />);

    const checkbox = screen.getByLabelText(/ใช้ได้เฉพาะสมาชิกที่เข้าสู่ระบบแล้ว/);
    expect(checkbox).toHaveAttribute('type', 'checkbox');
    expect(checkbox.tagName).toBe('INPUT');

    await user.click(checkbox);

    expect(checkbox).toBeChecked();
    expect(
      screen.getByText('ลูกค้าที่ยังไม่เข้าสู่ระบบจะใช้โปรโมชันนี้ไม่ได้'),
    ).toBeInTheDocument();
    expect(screen.getByText(INDEPENDENCE_NOTE)).toBeInTheDocument();
    expect(
      screen.queryByText('ปิดอยู่ = ไม่บังคับเข้าสู่ระบบสำหรับโปรโมชันนี้'),
    ).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/อายุบัญชีสูงสุด/)).not.toBeInTheDocument();
    expect(screen.queryByRole('switch')).not.toBeInTheDocument();
  });

  /**
   * AC: AC-017 / soft-off — Invalid conditions JSON prefills unchecked.
   * Behavior: getPromotionFormValuesFromPromotion with bad JSON → loggedInOnlyEnabled false
   * @category: core-functionality
   * @lane: integration
   * @dependency: getPromotionFormValuesFromPromotion, LoggedInOnlyConditionFields
   * @complexity: low
   * ROI: 88
   */
  it('prefills unchecked when conditions JSON parse fails (soft-off)', () => {
    const values = getPromotionFormValuesFromPromotion({
      code: 'SAVE10',
      name: '10%',
      type: 'percentage',
      discountValue: 10,
      usagePerCustomer: 1,
      autoApply: false,
      priority: 0,
      conditions: '{not-json',
    });

    render(<LoggedInOnlyHarness defaultValues={values} />);

    expect(screen.getByLabelText(/ใช้ได้เฉพาะสมาชิกที่เข้าสู่ระบบแล้ว/)).not.toBeChecked();
    expect(screen.getByText(INDEPENDENCE_NOTE)).toBeInTheDocument();
  });

  /**
   * AC: AC-017 — Edit parse enabled true prefills checked.
   * Behavior: conditions loggedInOnly.enabled true → checkbox checked
   * @category: core-functionality
   * @lane: integration
   * @dependency: getPromotionFormValuesFromPromotion
   * @complexity: low
   * ROI: 87
   */
  it('prefills checked when conditions has loggedInOnly.enabled true', () => {
    const values = getPromotionFormValuesFromPromotion({
      code: 'SAVE10',
      name: '10%',
      type: 'percentage',
      discountValue: 10,
      usagePerCustomer: 1,
      autoApply: false,
      priority: 0,
      conditions: JSON.stringify({ loggedInOnly: { enabled: true } }),
    });

    render(<LoggedInOnlyHarness defaultValues={values} />);

    expect(screen.getByLabelText(/ใช้ได้เฉพาะสมาชิกที่เข้าสู่ระบบแล้ว/)).toBeChecked();
    expect(screen.getByText(INDEPENDENCE_NOTE)).toBeInTheDocument();
    expect(
      screen.getByText('ลูกค้าที่ยังไม่เข้าสู่ระบบจะใช้โปรโมชันนี้ไม่ได้'),
    ).toBeInTheDocument();
  });
});

describe('PromotionFormFields members-only placement (UI-L-001 / UI-AA-002)', () => {
  /**
   * AC: UI-L-001 / UI-AA-002 — Section order: จำกัดการใช้ → ใช้อัตโนมัติ → สมาชิกเท่านั้น → ลูกค้าใหม่ → ระยะเวลา.
   * Behavior: Heading indices include AutoApplyFields between usage limits and members-only
   * @category: core-functionality
   * @lane: integration
   * @dependency: PromotionFormFields, AutoApplyFields, LoggedInOnlyConditionFields, NewCustomerConditionFields
   * @complexity: low
   * ROI: 94
   */
  it('places สมาชิกเท่านั้น after ใช้อัตโนมัติ and before ลูกค้าใหม่', () => {
    render(<FormFieldsHarness />);

    const headings = screen.getAllByRole('heading', { level: 3 }).map((el) => el.textContent);
    const usageIdx = headings.indexOf('จำกัดการใช้');
    const autoApplyIdx = headings.indexOf('ใช้อัตโนมัติ');
    const membersIdx = headings.indexOf('สมาชิกเท่านั้น');
    const newCustomerIdx = headings.indexOf('ลูกค้าใหม่');
    const scheduleIdx = headings.indexOf('ระยะเวลา');

    expect(usageIdx).toBeGreaterThanOrEqual(0);
    expect(autoApplyIdx).toBe(usageIdx + 1);
    expect(membersIdx).toBe(autoApplyIdx + 1);
    expect(newCustomerIdx).toBe(membersIdx + 1);
    expect(scheduleIdx).toBe(newCustomerIdx + 1);
  });

  /**
   * AC: AC-015 — Members-only section visible for every selectable promotion type.
   * Behavior: For each selectable type → heading + checkbox present
   * @category: core-functionality
   * @lane: integration
   * @dependency: PromotionFormFields, LoggedInOnlyConditionFields
   * @complexity: medium
   * ROI: 91
   */
  it.each(SELECTABLE_TYPES)('shows members-only section for selectable type %s', (type) => {
    render(<FormFieldsHarness type={type} />);
    expect(screen.getByRole('heading', { name: 'สมาชิกเท่านั้น' })).toBeInTheDocument();
    expect(screen.getByLabelText(/ใช้ได้เฉพาะสมาชิกที่เข้าสู่ระบบแล้ว/)).toBeInTheDocument();
    expect(screen.getByText(INDEPENDENCE_NOTE)).toBeInTheDocument();
  });
});
