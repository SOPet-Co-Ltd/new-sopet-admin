import { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AutoApplyFields } from './auto-apply-fields';
import { PromotionFormFields } from './promotion-form-fields';
import { getPromotionTypeMeta, type PromotionTypeSlug } from '@/lib/promotions/metadata';
import {
  getPromotionFormDefaults,
  promotionFormSchema,
  type PromotionFormValues,
} from '@/lib/validations/promotions';

const SECTION_DESCRIPTION =
  'เมื่อเปิด ระบบจะเลือกโปรโมชันอัตโนมัติที่ดีที่สุดให้ลูกค้าครั้งแรกที่เข้าหน้าชำระเงินในเซสชันนั้น ลูกค้าเปลี่ยนหรือลบส่วนลดได้เอง';

const OFF_HINT = 'ปิดอยู่ = ลูกค้าต้องเลือกหรือกรอกโค้ดเอง';

function AutoApplyHarness({
  defaultValues,
  onValuesChange,
}: {
  defaultValues?: Partial<PromotionFormValues>;
  onValuesChange?: (values: PromotionFormValues) => void;
}) {
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
  const [autoApplyValue, setAutoApplyValue] = useState(() => form.getValues('autoApply') ?? false);

  const syncAutoApplyValue = () => {
    const values = form.getValues();
    setAutoApplyValue(values.autoApply ?? false);
    onValuesChange?.(values);
  };

  return (
    <FormProvider {...form}>
      <form
        onSubmit={form.handleSubmit((values) => onValuesChange?.(values))}
        onChange={syncAutoApplyValue}
        noValidate
      >
        <AutoApplyFields control={form.control} />
        <button type="submit">บันทึก</button>
        <output data-testid="auto-apply-value">{String(autoApplyValue)}</output>
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

describe('AutoApplyFields', () => {
  /**
   * AC: AC-001 / AC-024 / UI-AA-001 / UI-AA-003 — Default off + normative Thai copy.
   * Behavior: Create defaults → unchecked checkbox; section title/description/off-hint; no Switch
   * @category: core-functionality
   * @lane: integration
   * @dependency: AutoApplyFields
   * @complexity: low
   * ROI: 94
   */
  it('shows default-off checkbox with normative Thai help and no Switch', () => {
    render(<AutoApplyHarness />);

    expect(screen.getByRole('heading', { name: 'ใช้อัตโนมัติ' })).toBeInTheDocument();
    expect(screen.getByText(SECTION_DESCRIPTION)).toBeInTheDocument();
    expect(screen.getByText(OFF_HINT)).toBeInTheDocument();

    const checkbox = screen.getByLabelText(/ใช้อัตโนมัติที่หน้าชำระเงิน/);
    expect(checkbox).toHaveAttribute('type', 'checkbox');
    expect(checkbox.tagName).toBe('INPUT');
    expect(checkbox).not.toBeChecked();
    expect(checkbox).toHaveAttribute('aria-describedby');
    expect(screen.queryByRole('switch')).not.toBeInTheDocument();
    expect(screen.getByTestId('auto-apply-value')).toHaveTextContent('false');
  });

  /**
   * AC: AC-002 — Edit partial state when autoApply true.
   * Behavior: Prefill autoApply true → checked; off-hint hidden
   * @category: core-functionality
   * @lane: integration
   * @dependency: AutoApplyFields
   * @complexity: low
   * ROI: 92
   */
  it('prefills checked when autoApply is true and hides off hint', () => {
    render(<AutoApplyHarness defaultValues={{ autoApply: true }} />);

    const checkbox = screen.getByLabelText(/ใช้อัตโนมัติที่หน้าชำระเงิน/);
    expect(checkbox).toBeChecked();
    expect(screen.queryByText(OFF_HINT)).not.toBeInTheDocument();
    expect(screen.getByText(SECTION_DESCRIPTION)).toBeInTheDocument();
    expect(screen.getByTestId('auto-apply-value')).toHaveTextContent('true');
  });

  /**
   * AC: AC-003 — Toggle updates RHF autoApply (roundtrip to submit boundary).
   * Behavior: Click checkbox → RHF value true
   * @category: core-functionality
   * @lane: integration
   * @dependency: AutoApplyFields, RHF Controller
   * @complexity: low
   * ROI: 93
   */
  it('toggles RHF autoApply to true when checked', async () => {
    const user = userEvent.setup();
    render(<AutoApplyHarness />);

    const checkbox = screen.getByLabelText(/ใช้อัตโนมัติที่หน้าชำระเงิน/);
    await user.click(checkbox);

    expect(checkbox).toBeChecked();
    expect(screen.queryByText(OFF_HINT)).not.toBeInTheDocument();
    expect(screen.getByTestId('auto-apply-value')).toHaveTextContent('true');
  });
});

describe('PromotionFormFields AutoApplyFields placement (UI-AA-002)', () => {
  /**
   * AC: UI-AA-002 — Section order after จำกัดการใช้, before สมาชิกเท่านั้น.
   * Behavior: Heading indices: usage + 1 = ใช้อัตโนมัติ; then สมาชิกเท่านั้น; ลูกค้าใหม่; ระยะเวลา
   * @category: core-functionality
   * @lane: integration
   * @dependency: PromotionFormFields, AutoApplyFields
   * @complexity: low
   * ROI: 95
   */
  it('places ใช้อัตโนมัติ after จำกัดการใช้ and before สมาชิกเท่านั้น', () => {
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
   * AC: AC-001 — Auto-apply section on shared platform form path.
   * Behavior: Heading + checkbox present for platform scope
   * @category: core-functionality
   * @lane: integration
   * @dependency: PromotionFormFields, AutoApplyFields
   * @complexity: low
   * ROI: 90
   */
  it('shows auto-apply section on platform form path', () => {
    render(<FormFieldsHarness scope="platform" />);
    expect(screen.getByRole('heading', { name: 'ใช้อัตโนมัติ' })).toBeInTheDocument();
    expect(screen.getByLabelText(/ใช้อัตโนมัติที่หน้าชำระเงิน/)).not.toBeChecked();
  });

  /**
   * AC: AC-001 — Auto-apply section on shared vendor form path.
   * Behavior: Heading + checkbox present for store scope
   * @category: core-functionality
   * @lane: integration
   * @dependency: PromotionFormFields, AutoApplyFields
   * @complexity: low
   * ROI: 90
   */
  it('shows auto-apply section on vendor form path', () => {
    render(<FormFieldsHarness scope="store" />);
    expect(screen.getByRole('heading', { name: 'ใช้อัตโนมัติ' })).toBeInTheDocument();
    expect(screen.getByLabelText(/ใช้อัตโนมัติที่หน้าชำระเงิน/)).not.toBeChecked();
  });
});
