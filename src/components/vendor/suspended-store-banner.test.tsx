import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SuspendedStoreBanner } from './suspended-store-banner';

let mockPathname = '/vendor/dashboard';

vi.mock('next/navigation', () => ({
  usePathname: () => mockPathname,
}));

const useMyStores = vi.fn();
const useVendorStoreId = vi.fn();

vi.mock('@/hooks/useMyStores', () => ({
  useMyStores: () => useMyStores(),
}));

vi.mock('@/hooks/useVendorStoreId', () => ({
  useVendorStoreId: () => useVendorStoreId(),
}));

const suspendedStoreEntry = {
  store: { id: 'store-1', name: 'ร้านทดสอบ', status: 'suspended' },
  membershipRole: 'owner',
};

describe('SuspendedStoreBanner', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPathname = '/vendor/dashboard';
    useVendorStoreId.mockReturnValue('store-1');
    useMyStores.mockReturnValue({ data: [suspendedStoreEntry] });
  });

  it('renders nothing when the active store is not suspended', () => {
    useMyStores.mockReturnValue({
      data: [{ ...suspendedStoreEntry, store: { ...suspendedStoreEntry.store, status: 'active' } }],
    });

    const { container } = render(<SuspendedStoreBanner />);
    expect(container).toBeEmptyDOMElement();
  });

  it('shows a CTA link to the reactivation page on other vendor pages', () => {
    render(<SuspendedStoreBanner />);

    expect(screen.getByRole('link', { name: 'ส่งคำขอเปิดใช้งานร้าน' })).toBeInTheDocument();
  });

  it('hides the duplicate CTA when already on the reactivation page (row 43 regression)', () => {
    mockPathname = '/vendor/reactivation';

    render(<SuspendedStoreBanner />);

    // The banner text/status is still shown - only the redundant, functionally-inert
    // link to the page you're already on is removed. The page's own submit button
    // (rendered elsewhere in store-reactivation-section.tsx) remains the single CTA.
    expect(screen.getByText(/ถูกระงับชั่วคราว/)).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'ส่งคำขอเปิดใช้งานร้าน' })).not.toBeInTheDocument();
  });

  it('never shows the CTA for members without manage permission, on any page', () => {
    useMyStores.mockReturnValue({
      data: [{ ...suspendedStoreEntry, membershipRole: 'staff' }],
    });

    render(<SuspendedStoreBanner />);

    expect(screen.queryByRole('link', { name: 'ส่งคำขอเปิดใช้งานร้าน' })).not.toBeInTheDocument();
  });
});
