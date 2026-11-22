import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { VendorOnboardingWizard } from './vendor-onboarding-wizard';
import { ONBOARDING_STORAGE_KEY } from '@/lib/vendor/onboarding';

const replace = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace, push: vi.fn() }),
}));

vi.mock('@/hooks/useAuth', () => ({
  useCurrentUser: vi.fn(),
}));

vi.mock('@/hooks/useMembershipRole', () => ({
  useIsStoreOwner: vi.fn(),
}));

vi.mock('@/hooks/useMyStores', () => ({
  useMyStores: vi.fn(),
}));

vi.mock('@/hooks/useStoreRequests', () => ({
  useMyStoreRequests: vi.fn(),
  useSubmitStoreRequest: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
    error: null,
  }),
}));

vi.mock('@/hooks/useStoreSettings', () => ({
  useMyStore: () => ({ data: undefined, isLoading: false }),
  useUpdateStore: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useUpdateStorePayout: () => ({ mutateAsync: vi.fn(), isPending: false }),
}));

vi.mock('@/hooks/useShipping', () => ({
  useMyStoreShippingOptions: () => ({ data: [], isLoading: false }),
  useShippingProviders: () => ({ data: [], isLoading: false }),
  useCreateShippingOption: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useUpdateShippingOption: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useDeleteShippingOption: () => ({ mutateAsync: vi.fn(), isPending: false }),
}));

vi.mock('@/hooks/useVendorProducts', () => ({
  useVendorProducts: () => ({ data: { items: [] }, isLoading: false }),
}));

vi.mock('@/hooks/useTeam', () => ({
  useMyPendingStoreInvitations: () => ({ data: [], isLoading: false, error: null }),
  useAcceptStoreInvitation: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useDeclineStoreInvitation: () => ({ mutateAsync: vi.fn(), isPending: false }),
}));

vi.mock('@/hooks/useEmailVerification', () => ({
  useSyncEmailVerificationStatus: () => ({ isChecking: false }),
  useResendEmailVerification: () => ({
    mutate: vi.fn(),
    isPending: false,
    isSuccess: false,
    error: null,
    isResendDisabled: false,
    resendButtonLabel: 'ส่งอีกครั้ง',
  }),
}));

vi.mock('@/components/ui/toast', () => ({
  useToast: () => ({ show: vi.fn(), showError: vi.fn() }),
}));

vi.mock('@/components/vendor/vendor-store-settings-panel', () => ({
  VendorStoreSettingsPanel: () => <div data-testid="store-settings-panel">store settings</div>,
}));

vi.mock('@/components/vendor/shipping-settings-panel', () => ({
  VendorShippingPanel: () => <div data-testid="shipping-panel">shipping</div>,
}));

vi.mock('@/components/ui/image-upload-field', () => ({
  ImageUploadField: () => <div data-testid="image-upload-field" />,
}));

import { useCurrentUser } from '@/hooks/useAuth';
import { useIsStoreOwner } from '@/hooks/useMembershipRole';
import { useMyStores } from '@/hooks/useMyStores';
import { useMyStoreRequests } from '@/hooks/useStoreRequests';

const mockedUseCurrentUser = vi.mocked(useCurrentUser);
const mockedUseIsStoreOwner = vi.mocked(useIsStoreOwner);
const mockedUseMyStores = vi.mocked(useMyStores);
const mockedUseMyStoreRequests = vi.mocked(useMyStoreRequests);

describe('VendorOnboardingWizard', () => {
  beforeEach(() => {
    window.localStorage.clear();
    replace.mockClear();
    mockedUseCurrentUser.mockReturnValue({
      user: {
        id: '1',
        email: 'vendor@test.com',
        fullName: 'Vendor',
        role: 'vendor',
        emailVerified: true,
      },
      isAuthenticated: true,
    } as ReturnType<typeof useCurrentUser>);
    mockedUseIsStoreOwner.mockReturnValue({
      isOwner: false,
      membershipRole: undefined,
      isLoading: false,
    });
    mockedUseMyStores.mockReturnValue({
      data: [],
      isLoading: false,
    } as unknown as ReturnType<typeof useMyStores>);
    mockedUseMyStoreRequests.mockReturnValue({
      data: [],
      isLoading: false,
    } as unknown as ReturnType<typeof useMyStoreRequests>);
  });

  it('shows path chooser for verified vendor without stores', async () => {
    render(<VendorOnboardingWizard />);

    expect(await screen.findByText('คุณต้องการเริ่มต้นแบบไหน?')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /ขอเปิดร้านใหม่/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /เข้าร่วมร้านที่มีอยู่/ })).toBeInTheDocument();
    expect(screen.getByText('บัญชี')).toBeInTheDocument();
    expect(screen.getByText('ได้ร้าน')).toBeInTheDocument();
    expect(screen.getByText('พร้อมขาย')).toBeInTheDocument();
    expect(screen.queryByText('ยืนยันอีเมล')).not.toBeInTheDocument();
    expect(screen.queryByText('ข้อมูลร้าน')).not.toBeInTheDocument();
  });

  it('enters create-request after choosing create path', async () => {
    const user = userEvent.setup();
    render(<VendorOnboardingWizard />);

    await user.click(await screen.findByRole('button', { name: /ขอเปิดร้านใหม่/ }));

    expect(await screen.findByText('กรอกข้อมูลขอเปิดร้าน')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'ส่งคำขอเปิดร้าน' })).toBeInTheDocument();
    expect(window.localStorage.getItem(ONBOARDING_STORAGE_KEY)).toContain('create');
    expect(screen.getAllByText('ขอเปิดร้าน').length).toBeGreaterThanOrEqual(1);
  });

  it('shows waiting step when create path has a pending request', async () => {
    window.localStorage.setItem(
      ONBOARDING_STORAGE_KEY,
      JSON.stringify({ path: 'create', skippedSetup: false }),
    );
    mockedUseMyStoreRequests.mockReturnValue({
      data: [{ id: 'r1', name: 'ร้านทดสอบ', status: 'pending' }],
      isLoading: false,
    } as unknown as ReturnType<typeof useMyStoreRequests>);

    render(<VendorOnboardingWizard />);

    expect(await screen.findByText('รอการอนุมัติจากทีม SOPet')).toBeInTheDocument();
    expect(screen.getByText('ร้านทดสอบ')).toBeInTheDocument();
    expect(screen.getAllByText('รออนุมัติ').length).toBeGreaterThanOrEqual(1);
    expect(screen.queryByText('สินค้าแรก')).not.toBeInTheDocument();
  });

  it('shows join-accept after choosing join path', async () => {
    const user = userEvent.setup();
    render(<VendorOnboardingWizard />);

    await user.click(await screen.findByRole('button', { name: /เข้าร่วมร้านที่มีอยู่/ }));

    expect(await screen.findByText('ตอบรับคำเชิญเข้าร้าน')).toBeInTheDocument();
  });

  it('shows verify step when email is unverified', async () => {
    mockedUseCurrentUser.mockReturnValue({
      user: {
        id: '1',
        email: 'vendor@test.com',
        fullName: 'Vendor',
        role: 'vendor',
        emailVerified: false,
      },
      isAuthenticated: true,
    } as ReturnType<typeof useCurrentUser>);

    render(<VendorOnboardingWizard />);

    expect(await screen.findByText('ยืนยันอีเมลของคุณ')).toBeInTheDocument();
    expect(screen.getByText(/ยังไม่ได้ยืนยันอีเมล/)).toBeInTheDocument();
  });

  it('shows owner store-profile after approval and skips later via ทำภายหลัง', async () => {
    const user = userEvent.setup();
    window.localStorage.setItem(
      ONBOARDING_STORAGE_KEY,
      JSON.stringify({ path: 'create', skippedSetup: false }),
    );
    mockedUseIsStoreOwner.mockReturnValue({
      isOwner: true,
      membershipRole: 'owner',
      isLoading: false,
    });
    mockedUseMyStores.mockReturnValue({
      data: [{ store: { id: 's1', name: 'ร้านใหม่' }, membershipRole: 'owner' }],
      isLoading: false,
    } as unknown as ReturnType<typeof useMyStores>);

    render(<VendorOnboardingWizard />);

    expect(await screen.findByText('ตรวจข้อมูลร้านค้า')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'ดำเนินการต่อโดยไม่บันทึก' }));

    expect(await screen.findByText('ตั้งค่าการจัดส่ง')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'ทำภายหลัง' }));

    expect(await screen.findByText('พร้อมเริ่มขายแล้ว')).toBeInTheDocument();
    await waitFor(() => {
      expect(window.localStorage.getItem(ONBOARDING_STORAGE_KEY)).toContain('"skippedSetup":true');
    });
  });
});
