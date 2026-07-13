import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { VendorStore } from '@/types';
import VendorStoresPage from './page';

const push = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
}));

vi.mock('@/hooks/useMyStores', () => ({
  useMyStores: vi.fn(),
}));

vi.mock('@/hooks/useVendorStoreId', () => ({
  useVendorStoreId: vi.fn(),
}));

vi.mock('@/hooks/useSwitchStore', () => ({
  useSwitchStore: vi.fn(),
}));

vi.mock('@/components/vendor/store-request-section', () => ({
  StoreRequestSection: () => <div data-testid="store-request-section" />,
}));

vi.mock('@/components/vendor/taxonomy-proposals-section', () => ({
  TaxonomyProposalsSection: () => <div data-testid="taxonomy-proposals-section" />,
}));

import { useMyStores } from '@/hooks/useMyStores';
import { useSwitchStore } from '@/hooks/useSwitchStore';
import { useVendorStoreId } from '@/hooks/useVendorStoreId';

const mockedUseMyStores = vi.mocked(useMyStores);
const mockedUseVendorStoreId = vi.mocked(useVendorStoreId);
const mockedUseSwitchStore = vi.mocked(useSwitchStore);

const MOCK_STORE: VendorStore = {
  store: {
    id: 'store-1',
    name: 'Pet Paradise',
    slug: 'pet-paradise',
    status: 'approved',
    description: 'A lovely pet shop',
  },
  membershipRole: 'owner',
};

function mockVendorStoresPage({
  stores = [],
  isLoading = false,
  error = null,
}: {
  stores?: VendorStore[];
  isLoading?: boolean;
  error?: Error | null;
} = {}) {
  mockedUseVendorStoreId.mockReturnValue(stores[0]?.store.id ?? null);
  mockedUseMyStores.mockReturnValue({
    data: stores,
    isLoading,
    error,
  } as ReturnType<typeof useMyStores>);
  mockedUseSwitchStore.mockReturnValue({
    mutate: vi.fn(),
    isPending: false,
    error: null,
  } as unknown as ReturnType<typeof useSwitchStore>);
}

describe('VendorStoresPage', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('hides taxonomy proposal section when vendor has no stores', () => {
    mockVendorStoresPage({ stores: [] });

    render(<VendorStoresPage />);

    expect(screen.queryByText('เสนอหมวดหมู่และแท็ก')).not.toBeInTheDocument();
    expect(screen.queryByTestId('taxonomy-proposals-section')).not.toBeInTheDocument();
    expect(screen.getByTestId('store-request-section')).toBeInTheDocument();
  });

  it('hides taxonomy proposal section while stores are loading', () => {
    mockVendorStoresPage({ isLoading: true });

    render(<VendorStoresPage />);

    expect(screen.queryByText('เสนอหมวดหมู่และแท็ก')).not.toBeInTheDocument();
    expect(screen.queryByTestId('taxonomy-proposals-section')).not.toBeInTheDocument();
  });

  it('shows taxonomy proposal section when vendor has at least one store', () => {
    mockVendorStoresPage({ stores: [MOCK_STORE] });

    render(<VendorStoresPage />);

    expect(screen.getByText('เสนอหมวดหมู่และแท็ก')).toBeInTheDocument();
    expect(screen.getByTestId('taxonomy-proposals-section')).toBeInTheDocument();
  });
});
