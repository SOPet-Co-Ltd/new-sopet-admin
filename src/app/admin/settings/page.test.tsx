import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import AdminPlatformSettingsPage from './page';

const mockBanners = [
  {
    id: 'banner-1',
    title: 'Summer Sale',
    imageUrl: 'https://example.com/banner.jpg',
    mobileImageUrl: null,
    linkUrl: 'https://example.com',
    isActive: true,
    sortOrder: 0,
  },
];

const mockSponsors = [
  {
    id: 'sponsor-1',
    name: 'PetCo',
    imageUrl: 'https://example.com/sponsor.jpg',
    linkUrl: null,
    isActive: false,
    sortOrder: 0,
  },
];

const mockAds = [
  {
    id: 'ad-1',
    title: 'Launch Promo',
    imageUrl: 'https://example.com/ad.jpg',
    linkUrl: 'https://example.com/promo',
    isActive: true,
  },
];

const refetchBanners = vi.fn();
const refetchSponsors = vi.fn();
const refetchAds = vi.fn();

const useAllPlatformBanners = vi.fn();
const useAllPlatformSponsors = vi.fn();
const useAllPlatformAds = vi.fn();

vi.mock('@/components/ui/image-upload-field', () => ({
  ImageUploadField: () => <div data-testid="image-upload-field" />,
}));

vi.mock('@/hooks/usePlatformSettings', () => ({
  useAllPlatformBanners: () => useAllPlatformBanners(),
  useAllPlatformSponsors: () => useAllPlatformSponsors(),
  useAllPlatformAds: () => useAllPlatformAds(),
  useLoginPageImages: () => ({
    data: { desktopImageUrl: null, mobileImageUrl: null, altText: null },
    isLoading: false,
    error: null,
    refetch: vi.fn(),
  }),
  useUpdateLoginPageImages: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
    isError: false,
    reset: vi.fn(),
  }),
  useClearLoginPageDesktopImage: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
    isError: false,
    reset: vi.fn(),
  }),
  useClearLoginPageMobileImage: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
    isError: false,
    reset: vi.fn(),
  }),
  useCreatePlatformBanner: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
    isError: false,
    reset: vi.fn(),
  }),
  useUpdatePlatformBanner: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
    isError: false,
    reset: vi.fn(),
  }),
  useDeletePlatformBanner: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
    isError: false,
    error: null,
  }),
  useReorderPlatformBanners: () => ({
    mutate: vi.fn(),
    isPending: false,
    isError: false,
  }),
  useCreatePlatformSponsor: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
    isError: false,
    reset: vi.fn(),
  }),
  useUpdatePlatformSponsor: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
    isError: false,
    reset: vi.fn(),
  }),
  useDeletePlatformSponsor: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
    isError: false,
    error: null,
  }),
  useReorderPlatformSponsors: () => ({
    mutate: vi.fn(),
    isPending: false,
    isError: false,
  }),
  useCreatePlatformAd: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
    isError: false,
    reset: vi.fn(),
  }),
  useUpdatePlatformAd: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
    isError: false,
    reset: vi.fn(),
  }),
  useDeletePlatformAd: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
    isError: false,
    error: null,
  }),
}));

function mockPlatformSettingsQueries(
  overrides?: Partial<{
    banners: typeof mockBanners;
    sponsors: typeof mockSponsors;
    ads: typeof mockAds;
    loadingBanners: boolean;
    loadingSponsors: boolean;
    loadingAds: boolean;
    bannersError: Error | null;
    sponsorsError: Error | null;
    adsError: Error | null;
  }>,
) {
  useAllPlatformBanners.mockReturnValue({
    data: overrides?.banners ?? mockBanners,
    isLoading: overrides?.loadingBanners ?? false,
    error: overrides?.bannersError ?? null,
    refetch: refetchBanners,
  });
  useAllPlatformSponsors.mockReturnValue({
    data: overrides?.sponsors ?? mockSponsors,
    isLoading: overrides?.loadingSponsors ?? false,
    error: overrides?.sponsorsError ?? null,
    refetch: refetchSponsors,
  });
  useAllPlatformAds.mockReturnValue({
    data: overrides?.ads ?? mockAds,
    isLoading: overrides?.loadingAds ?? false,
    error: overrides?.adsError ?? null,
    refetch: refetchAds,
  });
}

describe('AdminPlatformSettingsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPlatformSettingsQueries();
  });

  it('renders platform settings tabs and banner list by default', () => {
    render(<AdminPlatformSettingsPage />);

    expect(screen.getByRole('heading', { name: 'ตั้งค่าแพลตฟอร์ม' })).toBeInTheDocument();
    expect(
      screen.getByText('จัดการแบนเนอร์ สปอนเซอร์ และโฆษณาป๊อปอัพบนหน้าแรกร้านค้า'),
    ).toBeInTheDocument();
    expect(screen.getByRole('tablist', { name: 'หมวดตั้งค่าแพลตฟอร์ม' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'แบนเนอร์', selected: true })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'สปอนเซอร์' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'โฆษณาป๊อปอัพ' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'รูปหน้าเข้าสู่ระบบ' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /แบนเนอร์ \(1\)/ })).toBeInTheDocument();
    expect(screen.getByText('Summer Sale')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'เพิ่มแบนเนอร์' })).toBeInTheDocument();
  });

  it('switches tab panels and updates the primary action label', async () => {
    const user = userEvent.setup();
    render(<AdminPlatformSettingsPage />);

    await user.click(screen.getByRole('tab', { name: 'สปอนเซอร์' }));

    expect(screen.getByRole('tab', { name: 'สปอนเซอร์', selected: true })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /สปอนเซอร์ \(1\)/ })).toBeInTheDocument();
    expect(screen.getByText('PetCo')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'เพิ่มสปอนเซอร์' })).toBeInTheDocument();

    await user.click(screen.getByRole('tab', { name: 'โฆษณาป๊อปอัพ' }));

    expect(screen.getByRole('heading', { name: /โฆษณาป๊อปอัพ \(1\)/ })).toBeInTheDocument();
    expect(screen.getByText('Launch Promo')).toBeInTheDocument();
    expect(
      screen.getByText(
        'เปิดใช้งานได้ครั้งละ 1 โฆษณา — เมื่อเปิดโฆษณาใหม่ โฆษณาอื่นจะถูกปิดอัตโนมัติ',
      ),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'เพิ่มโฆษณา' })).toBeInTheDocument();
  });

  it('shows loading skeleton for the active tab', () => {
    mockPlatformSettingsQueries({ loadingBanners: true, banners: [] });

    render(<AdminPlatformSettingsPage />);

    expect(screen.getByLabelText('กำลังโหลดแบนเนอร์')).toBeInTheDocument();
    expect(screen.queryByText('Summer Sale')).not.toBeInTheDocument();
  });

  it('shows teachable empty state when there are no banners', () => {
    mockPlatformSettingsQueries({ banners: [] });

    render(<AdminPlatformSettingsPage />);

    expect(screen.getByText('ยังไม่มีแบนเนอร์')).toBeInTheDocument();
    expect(
      screen.getByText('กดปุ่ม เพิ่มแบนเนอร์ ด้านบนเพื่อเพิ่มสไลด์แรกบนหน้าแรก'),
    ).toBeInTheDocument();
  });

  it('shows recoverable load error with retry for the active tab', async () => {
    const user = userEvent.setup();
    mockPlatformSettingsQueries({
      banners: [],
      bannersError: new Error('เครือข่ายขัดข้อง'),
    });

    render(<AdminPlatformSettingsPage />);

    expect(screen.getByRole('alert')).toHaveTextContent('โหลดแบนเนอร์ไม่สำเร็จ');
    expect(screen.getByText('เครือข่ายขัดข้อง')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'ลองอีกครั้ง' }));
    expect(refetchBanners).toHaveBeenCalledTimes(1);
  });

  it('opens the create banner dialog from the header action', async () => {
    const user = userEvent.setup();
    render(<AdminPlatformSettingsPage />);

    await user.click(screen.getByRole('button', { name: 'เพิ่มแบนเนอร์' }));

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'เพิ่มแบนเนอร์' })).toBeInTheDocument();
    expect(screen.getByLabelText('ชื่อแบนเนอร์ *')).toBeInTheDocument();
  });

  it('shows login images tab and hides header create action', async () => {
    const user = userEvent.setup();
    render(<AdminPlatformSettingsPage />);

    await user.click(screen.getByRole('tab', { name: 'รูปหน้าเข้าสู่ระบบ' }));

    expect(
      screen.getByRole('tab', { name: 'รูปหน้าเข้าสู่ระบบ', selected: true }),
    ).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'รูปหน้าเข้าสู่ระบบ' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /เพิ่ม/ })).not.toBeInTheDocument();
  });
});
