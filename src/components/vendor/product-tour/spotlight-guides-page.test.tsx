import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SpotlightGuidesPage } from './spotlight-guides-page';
import { FEATURE_SPOTLIGHT_STORAGE_PREFIX } from '@/lib/vendor/feature-spotlight';
import { PRODUCT_TOUR_STORAGE_PREFIX } from '@/lib/vendor/product-tour';
import { ACTION_GUIDE_STORAGE_KEY } from '@/lib/vendor/action-guide';

const startTour = vi.fn();
const push = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
}));

vi.mock('@/hooks/useAuth', () => ({
  useCurrentUser: () => ({
    user: { id: 'u1', email: 'v@sopet.org', fullName: 'Vendor', role: 'vendor' },
    isAuthenticated: true,
  }),
}));

vi.mock('@/hooks/useMembershipRole', () => ({
  useIsStoreOwner: () => ({ isOwner: true, membershipRole: 'owner', isLoading: false }),
  useIsStoreManager: () => ({ isManager: true, membershipRole: 'owner', isLoading: false }),
}));

vi.mock('@/components/vendor/product-tour/product-tour-provider', () => ({
  useProductTour: () => ({ startTour, isActive: false }),
}));

describe('SpotlightGuidesPage', () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
    startTour.mockReset();
    push.mockReset();
  });

  it('lists all spotlight guides', () => {
    render(<SpotlightGuidesPage />);

    expect(screen.getByRole('heading', { name: 'ทัวร์แนะนำ' })).toBeInTheDocument();
    expect(screen.getByText('ทัวร์เมนูพอร์ทัลผู้ขาย')).toBeInTheDocument();
    expect(screen.getByText('เพิ่มสินค้าชิ้นแรก')).toBeInTheDocument();
  });

  it('starts shell tour from catalog', async () => {
    const user = userEvent.setup();
    render(<SpotlightGuidesPage />);

    await user.click(screen.getAllByRole('button', { name: 'เริ่มทัวร์' })[0]!);
    expect(startTour).toHaveBeenCalledOnce();
  });

  it('navigates to page spotlight with force query', async () => {
    const user = userEvent.setup();
    render(<SpotlightGuidesPage />);

    await user.click(screen.getAllByRole('button', { name: 'เริ่มทัวร์' })[1]!);
    expect(push).toHaveBeenCalledWith('/vendor/products?spotlight=products-empty-add');
  });

  it('starts action guide before navigating to promotions catalog href', async () => {
    const user = userEvent.setup();
    render(<SpotlightGuidesPage />);

    await user.click(screen.getByText('สร้างโปรโมชัน').closest('li')!.querySelector('button')!);
    expect(JSON.parse(window.sessionStorage.getItem(ACTION_GUIDE_STORAGE_KEY)!)).toEqual({
      active: true,
      id: 'create-promotion',
      step: 1,
    });
    expect(push).toHaveBeenCalledWith('/vendor/promotions/new?guide=create-promotion');
  });

  it('shows seen state after dismiss storage exists', () => {
    window.localStorage.setItem(
      `${PRODUCT_TOUR_STORAGE_PREFIX}:u1:owner`,
      JSON.stringify({ status: 'completed', version: 1 }),
    );
    window.localStorage.setItem(
      `${FEATURE_SPOTLIGHT_STORAGE_PREFIX}:u1:products-empty-add`,
      JSON.stringify({ status: 'skipped', version: 1 }),
    );

    render(<SpotlightGuidesPage />);

    expect(screen.getAllByText('ดูแล้ว')).toHaveLength(2);
    expect(screen.getAllByRole('button', { name: 'ดูซ้ำ' })).toHaveLength(2);
  });

  it('lists page spotlights for customers through requests', () => {
    render(<SpotlightGuidesPage />);
    expect(screen.getByText('แนะนำหน้าลูกค้า')).toBeInTheDocument();
    expect(screen.getByText('สร้างโปรโมชัน')).toBeInTheDocument();
    expect(screen.getByText('ตั้งค่ารับเงิน')).toBeInTheDocument();
    expect(screen.getByText('กล่องคำเชิญ / คำขอ')).toBeInTheDocument();
  });
});
