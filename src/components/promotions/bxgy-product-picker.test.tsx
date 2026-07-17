import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { BxGyProductPicker, filterPublishedProducts } from './bxgy-product-picker';
import { PromotionFormFields } from './promotion-form-fields';
import { getPromotionTypeMeta } from '@/lib/promotions/metadata';
import {
  buildPromotionConditions,
  getPromotionFormDefaults,
  promotionFormSchema,
  type PromotionFormValues,
} from '@/lib/validations/promotions';
import type { Product } from '@/types';

const mockUseVendorProducts = vi.fn();
const mockUsePlatformProducts = vi.fn();

vi.mock('@/hooks/useVendorProducts', () => ({
  useVendorProducts: (...args: unknown[]) => mockUseVendorProducts(...args),
  usePlatformProducts: (...args: unknown[]) => mockUsePlatformProducts(...args),
}));

function productFixture(overrides: Partial<Product> & Pick<Product, 'id' | 'name'>): Product {
  return {
    storeId: 'store-1',
    slug: overrides.id,
    description: '',
    basePrice: 100,
    status: 'published',
    tags: [],
    ...overrides,
  };
}

const published = productFixture({ id: 'p-pub', name: 'อาหารแมว', status: 'published' });
const draft = productFixture({ id: 'p-draft', name: 'ร่างสินค้า', status: 'draft' });
const archived = productFixture({ id: 'p-arch', name: 'เก็บถาวร', status: 'archived' });

function idleQuery(items: Product[] = [published, draft, archived]) {
  return {
    data: { items, pagination: { page: 1, limit: 20, total: items.length, totalPages: 1 } },
    isLoading: false,
    isFetching: false,
    error: null,
    refetch: vi.fn(),
  };
}

beforeEach(() => {
  mockUseVendorProducts.mockReturnValue(idleQuery());
  mockUsePlatformProducts.mockReturnValue(idleQuery());
});

describe('filterPublishedProducts', () => {
  it('excludes draft and archived when status is present', () => {
    expect(filterPublishedProducts([published, draft, archived]).map((p) => p.id)).toEqual([
      'p-pub',
    ]);
  });

  it('keeps products without status', () => {
    const noStatus = productFixture({ id: 'p-legacy', name: 'Legacy' });
    delete (noStatus as { status?: string }).status;
    expect(filterPublishedProducts([noStatus])).toHaveLength(1);
  });
});

describe('BxGyProductPicker', () => {
  it('shows only published products in the dropdown', async () => {
    const user = userEvent.setup();
    render(<BxGyProductPicker scope="store" value="" onChange={vi.fn()} />);

    await user.click(screen.getByRole('combobox'));

    const list = screen.getByRole('listbox');
    expect(within(list).getByRole('option', { name: 'อาหารแมว' })).toBeInTheDocument();
    expect(within(list).queryByRole('option', { name: 'ร่างสินค้า' })).not.toBeInTheDocument();
    expect(within(list).queryByRole('option', { name: 'เก็บถาวร' })).not.toBeInTheDocument();
  });

  it('uses vendor products hook for store scope without requiring storeId', async () => {
    const user = userEvent.setup();
    render(<BxGyProductPicker scope="store" value="" onChange={vi.fn()} />);

    await user.click(screen.getByRole('combobox'));

    expect(mockUseVendorProducts).toHaveBeenCalled();
    const [params, options] = mockUseVendorProducts.mock.calls.at(-1)!;
    expect(params).not.toHaveProperty('storeId');
    expect(options).toMatchObject({ enabled: true });
    expect(mockUsePlatformProducts.mock.calls.at(-1)?.[1]).toMatchObject({ enabled: false });
  });

  it('uses platform catalog hook without storeId for platform scope', async () => {
    const user = userEvent.setup();
    render(<BxGyProductPicker scope="platform" value="" onChange={vi.fn()} />);

    await user.click(screen.getByRole('combobox'));

    const [params, options] = mockUsePlatformProducts.mock.calls.at(-1)!;
    expect(params).not.toHaveProperty('storeId');
    expect(options).toMatchObject({ enabled: true });
    expect(mockUseVendorProducts.mock.calls.at(-1)?.[1]).toMatchObject({ enabled: false });
    expect(screen.getByPlaceholderText('ค้นหาสินค้าจากแคตตาล็อกแพลตฟอร์ม')).toBeInTheDocument();
  });

  it('calls onChange with productId and label on select', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<BxGyProductPicker scope="store" value="" onChange={onChange} />);

    await user.click(screen.getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: 'อาหารแมว' }));

    expect(onChange).toHaveBeenCalledWith('p-pub', 'อาหารแมว');
  });

  it('shows required FieldError alert copy', () => {
    render(
      <BxGyProductPicker
        scope="store"
        value=""
        onChange={vi.fn()}
        error="กรุณาเลือกสินค้าสำหรับโปรซื้อแถม"
      />,
    );

    expect(screen.getByRole('alert')).toHaveTextContent('กรุณาเลือกสินค้าสำหรับโปรซื้อแถม');
  });
});

function BxGyFormHarness({
  scope = 'platform',
  defaultValues,
}: {
  scope?: 'platform' | 'store';
  defaultValues?: Partial<PromotionFormValues>;
}) {
  const meta = getPromotionTypeMeta('buy_x_get_y')!;
  const form = useForm<PromotionFormValues>({
    resolver: zodResolver(promotionFormSchema),
    defaultValues: {
      ...getPromotionFormDefaults('buy_x_get_y'),
      code: 'BUY2GET1',
      name: 'ซื้อ 2 แถม 1',
      ...defaultValues,
    },
  });

  return (
    <FormProvider {...form}>
      <form
        onSubmit={form.handleSubmit(() => {
          const payload = document.createElement('pre');
          payload.setAttribute('data-testid', 'conditions-payload');
          payload.textContent = buildPromotionConditions(form.getValues()) ?? '';
          document.body.appendChild(payload);
        })}
        noValidate
      >
        <PromotionFormFields
          register={form.register}
          control={form.control}
          errors={form.formState.errors}
          meta={meta}
          scope={scope}
          setValue={form.setValue}
          getValues={form.getValues}
        />
        <button type="submit">บันทึก</button>
      </form>
    </FormProvider>
  );
}

describe('PromotionFormFields BxGy product gate', () => {
  it('blocks save without product and shows Thai required error', async () => {
    const user = userEvent.setup();
    render(<BxGyFormHarness />);

    await user.click(screen.getByRole('button', { name: 'บันทึก' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('กรุณาเลือกสินค้าสำหรับโปรซื้อแถม');
    expect(screen.queryByTestId('conditions-payload')).not.toBeInTheDocument();
  });

  it('includes productId, buyQuantity, getQuantity in conditions after pick', async () => {
    const user = userEvent.setup();
    render(<BxGyFormHarness />);

    await user.click(screen.getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: 'อาหารแมว' }));
    await user.click(screen.getByRole('button', { name: 'บันทึก' }));

    const payload = await screen.findByTestId('conditions-payload');
    expect(JSON.parse(payload.textContent!)).toMatchObject({
      productId: 'p-pub',
      buyQuantity: 2,
      getQuantity: 1,
    });
  });

  it('shows Rule A live summary with set-math wording', () => {
    render(<BxGyFormHarness />);

    expect(
      screen.getByText(
        'สรุปกฎ: ซื้อ 2 แถม 1 — ต้องมีอย่างน้อย 3 ชิ้นของสินค้าที่เลือกเพื่อได้แถม 1 ชิ้น',
      ),
    ).toBeInTheDocument();
  });
});
