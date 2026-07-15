import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { VariantSyncImpactDialog } from '@/components/vendor/variant-sync-impact-dialog';
import { ApiError } from '@/lib/api/errors';
import type { VariantItem } from '@/lib/variants';
import type { ProductVariantSyncImpact } from '@/types';

const variants: VariantItem[] = [
  {
    id: 'var-1',
    sku: 'SKU-A',
    stockQuantity: 1,
    price: 100,
    options: { สี: 'แดง' },
  },
];

let mockImpact: ProductVariantSyncImpact | undefined = {
  kept: 1,
  new: 0,
  removed: 0,
  blocked: false,
  removedVariants: [],
};
let mockImpactLoading = false;
let mockImpactError = false;
const mutateAsync = vi.fn().mockResolvedValue([]);
const mockRefetch = vi.fn();
const onOpenChange = vi.fn();
const onSyncSuccess = vi.fn();

vi.mock('@/hooks/useSyncProductVariants', () => ({
  useSyncProductVariants: () => ({
    mutateAsync,
    isPending: false,
    error: null,
  }),
}));

vi.mock('@/hooks/useVariantSyncImpact', () => ({
  useVariantSyncImpact: () => ({
    data: mockImpactError || mockImpactLoading ? undefined : mockImpact,
    isLoading: mockImpactLoading,
    isError: mockImpactError,
    isFetching: mockImpactLoading,
    refetch: mockRefetch,
  }),
}));

function renderWithQueryClient(ui: ReactNode) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

describe('VariantSyncImpactDialog', () => {
  beforeEach(() => {
    mutateAsync.mockClear();
    mutateAsync.mockResolvedValue([]);
    mockRefetch.mockClear();
    onOpenChange.mockClear();
    onSyncSuccess.mockClear();
    mockImpactLoading = false;
    mockImpactError = false;
    mockImpact = {
      kept: 1,
      new: 0,
      removed: 0,
      blocked: false,
      removedVariants: [],
    };
  });

  it('shows Cancel during loading and never syncs on dismiss', async () => {
    mockImpactLoading = true;
    mockImpact = undefined;

    renderWithQueryClient(
      <VariantSyncImpactDialog
        open
        onOpenChange={onOpenChange}
        productId="prod-1"
        variants={variants}
        productBasePrice={0}
        onSyncSuccess={onSyncSuccess}
      />,
    );

    expect(screen.getByText('กำลังตรวจสอบผลกระทบ...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'ยกเลิก' })).toBeEnabled();
    expect(screen.queryByRole('button', { name: 'ยืนยันการบันทึก' })).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'ยกเลิก' }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(mutateAsync).not.toHaveBeenCalled();
  });

  it('shows impact error with retry and no Confirm', async () => {
    mockImpactError = true;
    mockImpact = undefined;

    renderWithQueryClient(
      <VariantSyncImpactDialog
        open
        onOpenChange={onOpenChange}
        productId="prod-1"
        variants={variants}
        productBasePrice={0}
      />,
    );

    expect(screen.getByRole('alert')).toHaveTextContent('โหลดข้อมูลผลกระทบไม่สำเร็จ');
    expect(screen.queryByRole('button', { name: 'ยืนยันการบันทึก' })).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'ลองอีกครั้ง' }));
    expect(mockRefetch).toHaveBeenCalled();
    expect(mutateAsync).not.toHaveBeenCalled();
  });

  it('keeps dialog open with alert when mutation fails after Confirm', async () => {
    mutateAsync.mockRejectedValueOnce(
      new ApiError({
        code: 'VARIANT_REMOVAL_BLOCKED',
        message: 'blocked',
        status: 400,
      }),
    );

    renderWithQueryClient(
      <VariantSyncImpactDialog
        open
        onOpenChange={onOpenChange}
        productId="prod-1"
        variants={variants}
        productBasePrice={0}
        onSyncSuccess={onSyncSuccess}
      />,
    );

    await userEvent.click(screen.getByRole('button', { name: 'ยืนยันการบันทึก' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      /ไม่สามารถลบ SKU ได้ เพราะมีประวัติคำสั่งซื้อ/,
    );
    expect(
      screen.getByRole('heading', { name: 'ยืนยันการบันทึกตัวเลือกสินค้า' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'ยืนยันการบันทึก' })).toBeEnabled();
    expect(onOpenChange).not.toHaveBeenCalledWith(false);
    expect(onSyncSuccess).not.toHaveBeenCalled();
  });
});
