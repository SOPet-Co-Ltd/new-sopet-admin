import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { VendorStoreGuard } from './vendor-store-guard';

const replace = vi.fn();
const show = vi.fn();

let pathname = '/vendor/orders';

vi.mock('next/navigation', () => ({
  usePathname: () => pathname,
  useRouter: () => ({ replace }),
}));

vi.mock('@/hooks/useMyStores', () => ({
  useMyStores: vi.fn(),
}));

vi.mock('@/components/ui/toast', () => ({
  useToast: () => ({ show, showError: vi.fn() }),
}));

import { useMyStores } from '@/hooks/useMyStores';
import {
  VENDOR_STORELESS_REDIRECT_PATH,
  VENDOR_STORELESS_REDIRECT_TOAST,
} from '@/lib/vendor/vendor-store-access';

const mockedUseMyStores = vi.mocked(useMyStores);

function mockStores({
  stores = [],
  isLoading = false,
}: {
  stores?: unknown[];
  isLoading?: boolean;
} = {}) {
  mockedUseMyStores.mockReturnValue({
    data: stores,
    isLoading,
  } as ReturnType<typeof useMyStores>);
}

describe('VendorStoreGuard', () => {
  beforeEach(() => {
    replace.mockClear();
    show.mockClear();
    pathname = '/vendor/orders';
  });

  it('renders children while stores are loading without redirecting', () => {
    mockStores({ isLoading: true });

    render(
      <VendorStoreGuard>
        <p>Protected content</p>
      </VendorStoreGuard>,
    );

    expect(screen.getByText('กำลังโหลด...')).toBeInTheDocument();
    expect(screen.queryByText('Protected content')).not.toBeInTheDocument();
    expect(replace).not.toHaveBeenCalled();
    expect(show).not.toHaveBeenCalled();
  });

  it('allows storeless routes when vendor has no stores', () => {
    pathname = '/vendor/stores';
    mockStores({ stores: [] });

    render(
      <VendorStoreGuard>
        <p>Stores page</p>
      </VendorStoreGuard>,
    );

    expect(screen.getByText('Stores page')).toBeInTheDocument();
    expect(replace).not.toHaveBeenCalled();
    expect(show).not.toHaveBeenCalled();
  });

  it('redirects blocked routes to /vendor/stores with a Thai info toast', async () => {
    mockStores({ stores: [] });

    render(
      <VendorStoreGuard>
        <p>Orders page</p>
      </VendorStoreGuard>,
    );

    expect(screen.queryByText('Orders page')).not.toBeInTheDocument();

    await waitFor(() => {
      expect(replace).toHaveBeenCalledWith(VENDOR_STORELESS_REDIRECT_PATH);
    });
    expect(show).toHaveBeenCalledWith(VENDOR_STORELESS_REDIRECT_TOAST, 'info');
  });

  it('renders children on blocked routes when vendor has stores', () => {
    mockStores({ stores: [{ store: { id: 'store-1' } }] });

    render(
      <VendorStoreGuard>
        <p>Orders page</p>
      </VendorStoreGuard>,
    );

    expect(screen.getByText('Orders page')).toBeInTheDocument();
    expect(replace).not.toHaveBeenCalled();
    expect(show).not.toHaveBeenCalled();
  });
});
