import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { NewCustomerConditionFields } from './new-customer-condition-fields';
import { PromotionFormFields } from './promotion-form-fields';
import { PromotionCreateForm } from './promotion-create-form';
import { PromotionEditForm } from './promotion-edit-form';
import { getPromotionTypeMeta, type PromotionTypeSlug } from '@/lib/promotions/metadata';
import {
  getPromotionFormDefaults,
  promotionFormSchema,
  type PromotionFormValues,
} from '@/lib/validations/promotions';
import type { Promotion } from '@/types';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), back: vi.fn() }),
}));

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

function NewCustomerHarness({ defaultValues }: { defaultValues?: Partial<PromotionFormValues> }) {
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
        <NewCustomerConditionFields
          register={form.register}
          control={form.control}
          errors={form.formState.errors}
          setValue={form.setValue}
          getValues={form.getValues}
        />
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

const SELECTABLE_TYPES_FOR_AC030: PromotionTypeSlug[] = [
  'percentage',
  'fixed_amount',
  'buy_x_get_y',
  'free_shipping',
  'fixed_shipping_discount',
  'percentage_shipping_discount',
];

describe('NewCustomerConditionFields', () => {
  /**
   * AC: AC-030 — Toggle off hides N; toggle on shows N.
   * Behavior: Default toggle off → N absent; click toggle → N input visible
   * @category: core-functionality
   * @lane: integration
   * @dependency: NewCustomerConditionFields, react-hook-form harness
   * @complexity: low
   * ROI: 86
   */
  it('hides N when toggle is off and shows N when on', async () => {
    const user = userEvent.setup();
    render(<NewCustomerHarness />);

    expect(screen.queryByLabelText(/อายุบัญชีสูงสุด/)).not.toBeInTheDocument();

    await user.click(screen.getByLabelText(/ใช้ได้เฉพาะลูกค้าใหม่ที่ลงทะเบียนแล้ว/));

    expect(screen.getByLabelText(/อายุบัญชีสูงสุด/)).toBeInTheDocument();
  });

  /**
   * AC: UI-D-001 — When toggle switches off→on and N is empty, seed N=30.
   * Behavior: Arrange newCustomerOnly false + newCustomerMaxAccountAgeDays undefined → assert N
   * hidden → toggle on → N input value is 30
   * @category: core-functionality
   * @lane: integration
   * @dependency: NewCustomerConditionFields, setValue seed 30
   * @complexity: medium
   * ROI: 92
   */
  it('seeds N to 30 when toggle turns off→on and N is empty (UI-D-001)', async () => {
    const user = userEvent.setup();
    render(
      <NewCustomerHarness
        defaultValues={{
          newCustomerOnly: false,
          newCustomerMaxAccountAgeDays: undefined,
        }}
      />,
    );

    expect(screen.queryByLabelText(/อายุบัญชีสูงสุด/)).not.toBeInTheDocument();

    await user.click(screen.getByLabelText(/ใช้ได้เฉพาะลูกค้าใหม่ที่ลงทะเบียนแล้ว/));

    expect(screen.getByLabelText(/อายุบัญชีสูงสุด/)).toHaveValue(30);
  });

  /**
   * AC: AC-031 — Invalid N on submit shows FieldError with role=alert.
   * Behavior: Enable toggle → clear N → submit → alert with Thai empty N message
   * @category: core-functionality
   * @lane: integration
   * @dependency: NewCustomerConditionFields, promotionFormSchema
   * @complexity: medium
   * ROI: 90
   */
  it('shows FieldError with role=alert when N is invalid on submit', async () => {
    const user = userEvent.setup();
    render(<NewCustomerHarness />);

    await user.click(screen.getByLabelText(/ใช้ได้เฉพาะลูกค้าใหม่ที่ลงทะเบียนแล้ว/));
    const nInput = screen.getByLabelText(/อายุบัญชีสูงสุด/);
    await user.clear(nInput);
    await user.click(screen.getByRole('button', { name: 'บันทึก' }));

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('กรุณาระบุจำนวนวันเป็นจำนวนเต็มที่มากกว่า 0');
  });
});

describe('PromotionFormFields new-customer placement (UI-D-002 / UI-L-001)', () => {
  /**
   * AC: UI-D-002 / UI-L-001 — New-customer section after สมาชิกเท่านั้น and before ระยะเวลา.
   * Behavior: Heading order: จำกัดการใช้ → สมาชิกเท่านั้น → ลูกค้าใหม่ → ระยะเวลา
   * @category: core-functionality
   * @lane: integration
   * @dependency: PromotionFormFields, NewCustomerConditionFields, LoggedInOnlyConditionFields
   * @complexity: low
   * ROI: 88
   */
  it('places ลูกค้าใหม่ after สมาชิกเท่านั้น and before ระยะเวลา', () => {
    render(<FormFieldsHarness />);

    const headings = screen.getAllByRole('heading', { level: 3 }).map((el) => el.textContent);
    const usageIdx = headings.indexOf('จำกัดการใช้');
    const membersIdx = headings.indexOf('สมาชิกเท่านั้น');
    const newCustomerIdx = headings.indexOf('ลูกค้าใหม่');
    const scheduleIdx = headings.indexOf('ระยะเวลา');

    expect(usageIdx).toBeGreaterThanOrEqual(0);
    expect(membersIdx).toBe(usageIdx + 1);
    expect(newCustomerIdx).toBe(membersIdx + 1);
    expect(scheduleIdx).toBe(newCustomerIdx + 1);
  });

  /**
   * AC: AC-030 — New-customer section (toggle) is visible for every selectable promotion type,
   * including free_shipping.
   * Behavior: For each type in SELECTABLE_TYPES_FOR_AC030 → heading ลูกค้าใหม่ + toggle present
   * @category: core-functionality
   * @lane: integration
   * @dependency: PromotionFormFields, NewCustomerConditionFields, getPromotionTypeMeta
   * @complexity: medium
   * ROI: 91
   */
  it.each(SELECTABLE_TYPES_FOR_AC030)(
    'shows new-customer section for selectable type %s',
    (type) => {
      render(<FormFieldsHarness type={type} />);
      expect(screen.getByRole('heading', { name: 'ลูกค้าใหม่' })).toBeInTheDocument();
      expect(screen.getByLabelText(/ใช้ได้เฉพาะลูกค้าใหม่ที่ลงทะเบียนแล้ว/)).toBeInTheDocument();
    },
  );
});

describe('PromotionCreateForm scope derivation from listHref', () => {
  /**
   * AC: AC-017 / Design Doc scope — Without scope prop, listHref `/admin/...` derives platform
   * (ส่วนลดทั้งออเดอร์ label on fixed_amount).
   * Behavior: Omit scope; listHref=/admin/promotions; type fixed_amount → label ส่วนลดทั้งออเดอร์
   * @category: core-functionality
   * @lane: integration
   * @dependency: PromotionCreateForm, PromotionFormFields fixedAmountDiscountLabel
   * @complexity: medium
   * ROI: 89
   */
  it('derives platform scope from /admin listHref (fixed_amount label)', () => {
    render(
      <PromotionCreateForm
        type="fixed_amount"
        title="สร้างส่วนลดคงที่"
        backHref="/admin/promotions/new"
        listHref="/admin/promotions"
        isPending={false}
        onSubmit={vi.fn().mockResolvedValue(undefined)}
      />,
    );

    expect(screen.getByLabelText(/ส่วนลดทั้งออเดอร์/)).toBeInTheDocument();
    expect(screen.queryByLabelText(/ส่วนลดยอดร้าน/)).not.toBeInTheDocument();
  });

  /**
   * AC: AC-017 / Design Doc scope — Without scope prop, listHref `/vendor/...` derives store
   * (ส่วนลดยอดร้าน label on fixed_amount).
   * Behavior: Omit scope; listHref=/vendor/promotions; type fixed_amount → label ส่วนลดยอดร้าน
   * @category: core-functionality
   * @lane: integration
   * @dependency: PromotionCreateForm, PromotionFormFields fixedAmountDiscountLabel
   * @complexity: medium
   * ROI: 89
   */
  it('derives store scope from /vendor listHref (fixed_amount label)', () => {
    render(
      <PromotionCreateForm
        type="fixed_amount"
        title="สร้างส่วนลดคงที่"
        backHref="/vendor/promotions/new"
        listHref="/vendor/promotions"
        isPending={false}
        onSubmit={vi.fn().mockResolvedValue(undefined)}
      />,
    );

    expect(screen.getByLabelText(/ส่วนลดยอดร้าน/)).toBeInTheDocument();
    expect(screen.queryByLabelText(/ส่วนลดทั้งออเดอร์/)).not.toBeInTheDocument();
  });
});

describe('PromotionCreateForm new-customer validation', () => {
  /**
   * AC: AC-031 — Create form blocks submit when new-customer is on and N is invalid.
   * Behavior: Fill required fields → enable toggle → clear N → submit → alert; onSubmit not called
   * @category: core-functionality
   * @lane: integration
   * @dependency: PromotionCreateForm, promotionFormSchema
   * @complexity: medium
   * ROI: 90
   */
  it('blocks submit on invalid N with role=alert', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined);

    render(
      <PromotionCreateForm
        type="percentage"
        title="สร้างส่วนลดเปอร์เซ็นต์"
        backHref="/admin/promotions/new"
        listHref="/admin/promotions"
        isPending={false}
        onSubmit={onSubmit}
        scope="platform"
      />,
    );

    expect(screen.getByRole('heading', { name: 'ลูกค้าใหม่' })).toBeInTheDocument();

    await user.type(screen.getByLabelText(/รหัสโปรโมชัน/), 'NEW10');
    await user.type(screen.getByLabelText(/ชื่อโปรโมชัน/), 'New 10%');
    await user.type(screen.getByLabelText(/เปอร์เซ็นต์ส่วนลด/), '10');
    await user.click(screen.getByLabelText(/ใช้ได้เฉพาะลูกค้าใหม่ที่ลงทะเบียนแล้ว/));
    await user.clear(screen.getByLabelText(/อายุบัญชีสูงสุด/));
    await user.click(screen.getByRole('button', { name: 'สร้างโปรโมชัน' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'กรุณาระบุจำนวนวันเป็นจำนวนเต็มที่มากกว่า 0',
    );
    expect(onSubmit).not.toHaveBeenCalled();
  });
});

describe('PromotionEditForm partial prefill', () => {
  /**
   * AC: AC-034 / edit prefill — Edit form prefills new-customer toggle and N from conditions.
   * Behavior: conditions newCustomer enabled nDays 14 → checkbox checked + N=14
   * @category: core-functionality
   * @lane: integration
   * @dependency: PromotionEditForm, getPromotionFormValuesFromPromotion
   * @complexity: medium
   * ROI: 87
   */
  it('prefills new-customer toggle and N from conditions', async () => {
    const promotion: Promotion = {
      id: 'promo-1',
      code: 'NEW10',
      name: 'New 10%',
      type: 'percentage',
      discountValue: 10,
      usageCount: 0,
      usagePerCustomer: 1,
      autoApply: false,
      priority: 0,
      scope: 'platform',
      isActive: true,
      conditions: JSON.stringify({ newCustomer: { enabled: true, nDays: 14 } }),
      createdAt: '2026-01-01T00:00:00.000Z',
    };

    render(
      <PromotionEditForm
        promotion={promotion}
        listHref="/admin/promotions"
        isPending={false}
        onSubmit={vi.fn().mockResolvedValue(undefined)}
        scope="platform"
      />,
    );

    const section = screen.getByRole('heading', { name: 'ลูกค้าใหม่' }).closest('section');
    expect(section).toBeTruthy();
    expect(within(section!).getByLabelText(/ใช้ได้เฉพาะลูกค้าใหม่ที่ลงทะเบียนแล้ว/)).toBeChecked();
    expect(within(section!).getByLabelText(/อายุบัญชีสูงสุด/)).toHaveValue(14);
  });
});
