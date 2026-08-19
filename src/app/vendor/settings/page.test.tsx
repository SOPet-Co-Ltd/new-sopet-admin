import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import VendorSettingsPage from './page';

const mockReplace = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mockReplace }),
  usePathname: () => '/vendor/settings',
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock('@hookform/resolvers/zod', () => ({
  zodResolver: () => undefined,
}));

vi.mock('react-hook-form', () => ({
  useForm: () => ({
    register: vi.fn(),
    handleSubmit:
      (handler: (values: unknown) => void) => (event?: { preventDefault?: () => void }) => {
        event?.preventDefault?.();
        return handler({});
      },
    formState: { errors: {} },
    reset: vi.fn(),
  }),
}));

vi.mock('@/hooks/useAuth', () => ({
  useCurrentUser: () => ({
    user: { fullName: 'Vendor User', email: 'vendor@sopet.org' },
  }),
}));

vi.mock('@/hooks/useMembershipRole', () => ({
  useIsStoreOwner: () => ({ isOwner: true }),
}));

vi.mock('@/hooks/useStoreSettings', () => ({
  useMyStore: () => ({ data: null, isLoading: false }),
  useUpdateUserProfile: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
  }),
  useChangePassword: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
  }),
  useUpdateStore: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
  }),
  useUpdateStorePayout: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
  }),
}));

vi.mock('@/lib/constants/thai-banks', () => ({
  THAI_BANKS: [],
}));

vi.mock('@/components/vendor/shipping-settings-panel', () => ({
  VendorShippingPanel: () => <div data-testid="shipping-panel" />,
}));

vi.mock('@/components/vendor/vendor-omise-link-panel', () => ({
  VendorOmiseLinkPanel: () => null,
}));

vi.mock('@/components/vendor/vendor-payout-account-panel', () => ({
  VendorPayoutAccountPanel: () => null,
}));

vi.mock('@/components/vendor/vendor-payout-balance-panel', () => ({
  VendorPayoutBalancePanel: () => null,
}));

vi.mock('@/components/vendor/vendor-payout-history-panel', () => ({
  VendorPayoutHistoryPanel: () => null,
}));

vi.mock('@/components/vendor/vendor-store-settings-panel', () => ({
  VendorStoreSettingsPanel: () => null,
}));

describe('VendorSettingsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('links to the vendor error catalog from settings', () => {
    render(<VendorSettingsPage />);

    expect(screen.getByRole('link', { name: 'รหัสข้อผิดพลาด' })).toHaveAttribute(
      'href',
      '/vendor/errors-message',
    );
  });
});
