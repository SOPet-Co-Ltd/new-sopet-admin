import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import AdminPromotionsPage from './page';
import type { Promotion } from '@/types';

const platformPromo: Promotion = {
  id: 'promo-platform-1',
  code: 'PLATFORM10',
  name: 'ส่วนลดแพลตฟอร์ม 10%',
  type: 'percentage',
  scope: 'platform',
  discountValue: 10,
  usagePerCustomer: 1,
  usageCount: 0,
  usageLimit: undefined,
  isActive: false,
  autoApply: false,
  priority: 0,
  startsAt: undefined,
  expiresAt: undefined,
};

const usePlatformPromotions = vi.fn();
const useDeletePromotion = vi.fn();
const useTogglePromotion = vi.fn();

vi.mock('@/hooks/usePromotions', () => ({
  usePlatformPromotions: () => usePlatformPromotions(),
  useDeletePromotion: () => useDeletePromotion(),
  useTogglePromotion: () => useTogglePromotion(),
}));

describe('AdminPromotionsPage', () => {
  beforeEach(() => {
    useDeletePromotion.mockReturnValue({
      isPending: false,
      error: null,
      variables: undefined,
      mutateAsync: vi.fn(),
    });
    useTogglePromotion.mockReturnValue({
      isPending: false,
      error: null,
      variables: undefined,
      mutate: vi.fn(),
    });
  });

  it('shows a list skeleton while loading', () => {
    usePlatformPromotions.mockReturnValue({
      data: [],
      isLoading: true,
      error: null,
    });

    render(<AdminPromotionsPage />);

    expect(screen.getByLabelText('กำลังโหลดโปรโมชันแพลตฟอร์ม')).toBeInTheDocument();
    expect(screen.queryByText('กำลังโหลด...')).not.toBeInTheDocument();
  });

  it('teaches empty state with platform create CTA', () => {
    usePlatformPromotions.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    });

    render(<AdminPromotionsPage />);

    expect(screen.getByRole('heading', { name: 'โปรโมชันแพลตฟอร์ม' })).toBeInTheDocument();
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'ยังไม่มีโปรโมชันแพลตฟอร์ม' })).toBeInTheDocument();
    expect(screen.getByText(/ลูกค้าทั้งหมดบน SOPet/)).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: 'สร้างโปรโมชัน' })[0]).toHaveAttribute(
      'href',
      '/admin/promotions/new',
    );
  });

  it('renders bordered list with clear inactive activate affordance', () => {
    usePlatformPromotions.mockReturnValue({
      data: [platformPromo],
      isLoading: false,
      error: null,
    });

    render(<AdminPromotionsPage />);

    expect(screen.getByLabelText('สถานะ: ปิดใช้งาน')).toHaveTextContent('ปิดใช้งาน');
    expect(screen.getByRole('button', { name: /เปิดใช้งานโปรโมชัน/ })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
    expect(screen.getByRole('link', { name: 'แก้ไข' })).toHaveAttribute(
      'href',
      '/admin/promotions/promo-platform-1/edit',
    );
  });
});
