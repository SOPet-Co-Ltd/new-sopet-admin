import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import AdminPlatformSettingsPage from './page';
import {
  configuredLoginPageImages,
  createLoginPageImagesMutationMockResult,
  createUseLoginPageImagesMockResult,
  desktopOnlyLoginPageImages,
  emptyLoginPageImages,
  mobileClearedLoginPageImages,
  type LoginPageImagesFixture,
} from './login-page-images.fixtures';

const useAllPlatformBanners = vi.fn();
const useAllPlatformSponsors = vi.fn();
const useAllPlatformAds = vi.fn();
const useLoginPageImages = vi.fn();
const useUpdateLoginPageImages = vi.fn();
const useClearLoginPageDesktopImage = vi.fn();
const useClearLoginPageMobileImage = vi.fn();

const updateMutateAsync = vi.fn();
const clearDesktopMutateAsync = vi.fn();
const clearMobileMutateAsync = vi.fn();

vi.mock('@/components/ui/image-upload-field', () => ({
  ImageUploadField: ({
    label,
    value,
    onChange,
    onClear,
    error,
  }: {
    label: string;
    value: string;
    onChange: (url: string) => void;
    onClear?: () => void;
    error?: string;
  }) => (
    <div data-testid={`upload-${label}`}>
      {value ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={value} alt="" />
      ) : (
        <div aria-hidden>ไม่มีรูป</div>
      )}
      <label>
        {label}
        <input
          aria-label={label}
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
      </label>
      {onClear && value ? (
        <button type="button" aria-label={`ล้างรูป ${label}`} onClick={() => onClear()}>
          ล้างรูป
        </button>
      ) : null}
      {error ? (
        <p role="alert" className="text-xs text-danger">
          {error}
        </p>
      ) : null}
    </div>
  ),
}));

vi.mock('@/hooks/usePlatformSettings', () => ({
  useAllPlatformBanners: () => useAllPlatformBanners(),
  useAllPlatformSponsors: () => useAllPlatformSponsors(),
  useAllPlatformAds: () => useAllPlatformAds(),
  useLoginPageImages: () => useLoginPageImages(),
  useUpdateLoginPageImages: () => useUpdateLoginPageImages(),
  useClearLoginPageDesktopImage: () => useClearLoginPageDesktopImage(),
  useClearLoginPageMobileImage: () => useClearLoginPageMobileImage(),
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

function mockListQueries() {
  useAllPlatformBanners.mockReturnValue({
    data: [],
    isLoading: false,
    error: null,
    refetch: vi.fn(),
  });
  useAllPlatformSponsors.mockReturnValue({
    data: [],
    isLoading: false,
    error: null,
    refetch: vi.fn(),
  });
  useAllPlatformAds.mockReturnValue({
    data: [],
    isLoading: false,
    error: null,
    refetch: vi.fn(),
  });
}

function mockLoginHooks(queryData = emptyLoginPageImages) {
  useLoginPageImages.mockReturnValue(createUseLoginPageImagesMockResult({ data: queryData }));
  useUpdateLoginPageImages.mockReturnValue(
    createLoginPageImagesMutationMockResult({ mutateAsync: updateMutateAsync }),
  );
  useClearLoginPageDesktopImage.mockReturnValue(
    createLoginPageImagesMutationMockResult({ mutateAsync: clearDesktopMutateAsync }),
  );
  useClearLoginPageMobileImage.mockReturnValue(
    createLoginPageImagesMutationMockResult({ mutateAsync: clearMobileMutateAsync }),
  );
}

describe('Login page images fixture-e2e', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockListQueries();
    mockLoginHooks(emptyLoginPageImages);
  });

  // Journey 1 — Tab → Save desktop → Clear desktop confirm → Empty
  // @category: fixture-e2e
  it('tab save clear-desktop journey empties form with locked clear copy', async () => {
    const user = userEvent.setup();
    clearDesktopMutateAsync.mockResolvedValue(emptyLoginPageImages);

    const updatePending = { current: false };
    let resolveUpdate!: (value: LoginPageImagesFixture) => void;
    const deferredUpdate = new Promise<LoginPageImagesFixture>((resolve) => {
      resolveUpdate = resolve;
    });
    updateMutateAsync.mockReturnValue(deferredUpdate);
    useUpdateLoginPageImages.mockImplementation(() =>
      createLoginPageImagesMutationMockResult({
        mutateAsync: updateMutateAsync,
        isPending: updatePending.current,
      }),
    );

    const { rerender } = render(<AdminPlatformSettingsPage />);

    expect(screen.getByRole('tab', { name: 'รูปหน้าเข้าสู่ระบบ' })).toBeInTheDocument();
    await user.click(screen.getByRole('tab', { name: 'รูปหน้าเข้าสู่ระบบ' }));

    expect(screen.queryByRole('button', { name: /เพิ่ม/ })).not.toBeInTheDocument();
    expect(
      screen.getByText('ยังไม่ได้ตั้งค่ารูปหน้าเข้าสู่ระบบ — อัปโหลดรูปเดสก์ท็อปเพื่อเริ่มต้น'),
    ).toBeInTheDocument();
    expect(screen.getAllByText('ไม่มีรูป').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByRole('button', { name: 'บันทึก' })).toBeInTheDocument();

    await user.type(
      screen.getByLabelText('รูปภาพ (เดสก์ท็อป)'),
      desktopOnlyLoginPageImages.desktopImageUrl!,
    );
    await user.click(screen.getByRole('button', { name: 'บันทึก' }));

    await waitFor(() => {
      expect(updateMutateAsync).toHaveBeenCalledWith({
        desktopImageUrl: desktopOnlyLoginPageImages.desktopImageUrl,
        mobileImageUrl: '',
        altText: '',
      });
    });

    updatePending.current = true;
    rerender(<AdminPlatformSettingsPage />);
    expect(screen.getByRole('button', { name: 'กำลังบันทึก...' })).toBeInTheDocument();

    await act(async () => {
      updatePending.current = false;
      resolveUpdate(desktopOnlyLoginPageImages);
    });
    rerender(<AdminPlatformSettingsPage />);

    expect(await screen.findByRole('status')).toHaveTextContent('บันทึกการตั้งค่าแล้ว');
    expect(screen.getByRole('button', { name: 'บันทึก' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'ล้างรูป รูปภาพ (เดสก์ท็อป)' }));
    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByRole('heading', { name: 'ล้างรูปเดสก์ท็อป?' })).toBeInTheDocument();
    expect(
      within(dialog).getByText('การล้างรูปเดสก์ท็อปจะล้างรูปมือถือด้วย และตั้งค่าจะว่างทั้งหมด'),
    ).toBeInTheDocument();
    expect(within(dialog).queryByText(/การลบ ".* ไม่สามารถย้อนกลับได้/)).not.toBeInTheDocument();

    const confirmButton = within(dialog).getByRole('button', { name: 'ล้างรูป' });
    expect(confirmButton).toBeDisabled();
    await user.click(within(dialog).getByRole('button', { name: 'ยกเลิก' }));
    expect(clearDesktopMutateAsync).not.toHaveBeenCalled();
    expect(screen.getByLabelText('รูปภาพ (เดสก์ท็อป)')).toHaveValue(
      desktopOnlyLoginPageImages.desktopImageUrl!,
    );

    await user.click(screen.getByRole('button', { name: 'ล้างรูป รูปภาพ (เดสก์ท็อป)' }));
    const dialogAgain = await screen.findByRole('dialog');
    await user.type(within(dialogAgain).getByLabelText(/พิมพ์ "ล้างรูป" เพื่อยืนยัน/), 'ล้างรูป');
    await user.click(within(dialogAgain).getByRole('button', { name: 'ล้างรูป' }));

    await waitFor(() => {
      expect(clearDesktopMutateAsync).toHaveBeenCalledTimes(1);
    });
    expect(updateMutateAsync).toHaveBeenCalledTimes(1);
    expect(screen.getByLabelText('รูปภาพ (เดสก์ท็อป)')).toHaveValue('');
    expect(screen.getByLabelText('รูปภาพ (มือถือ)')).toHaveValue('');
    expect(screen.getByLabelText('ข้อความแทนรูป (Alt text)')).toHaveValue('');
    expect(screen.getAllByText('ไม่มีรูป').length).toBeGreaterThanOrEqual(1);
    expect(await screen.findByRole('status')).toHaveTextContent('บันทึกการตั้งค่าแล้ว');
    expect(
      screen.getByText('ยังไม่ได้ตั้งค่ารูปหน้าเข้าสู่ระบบ — อัปโหลดรูปเดสก์ท็อปเพื่อเริ่มต้น'),
    ).toBeInTheDocument();
  });

  // Journey 2 — Desktop required blocks Save
  // @category: fixture-e2e
  it('blocks Save without desktop and shows ต้องมีรูปเดสก์ท็อป', async () => {
    const user = userEvent.setup();
    render(<AdminPlatformSettingsPage />);

    await user.click(screen.getByRole('tab', { name: 'รูปหน้าเข้าสู่ระบบ' }));
    await user.type(
      screen.getByLabelText('รูปภาพ (มือถือ)'),
      'https://cdn.example.com/login-images/mobile.webp',
    );
    await user.click(screen.getByRole('button', { name: 'บันทึก' }));

    expect(await screen.findByText('ต้องมีรูปเดสก์ท็อป')).toBeInTheDocument();
    expect(updateMutateAsync).not.toHaveBeenCalled();
    expect(screen.getByLabelText('รูปภาพ (มือถือ)')).toHaveValue(
      'https://cdn.example.com/login-images/mobile.webp',
    );
  });

  // Journey 3 — Clear mobile immediate
  // @category: fixture-e2e
  it('clears mobile immediately without dialog and retains desktop', async () => {
    const user = userEvent.setup();
    mockLoginHooks(configuredLoginPageImages);
    clearMobileMutateAsync.mockResolvedValue(mobileClearedLoginPageImages);

    render(<AdminPlatformSettingsPage />);
    await user.click(screen.getByRole('tab', { name: 'รูปหน้าเข้าสู่ระบบ' }));

    expect(screen.getByLabelText('รูปภาพ (เดสก์ท็อป)')).toHaveValue(
      configuredLoginPageImages.desktopImageUrl!,
    );
    expect(screen.getByLabelText('รูปภาพ (มือถือ)')).toHaveValue(
      configuredLoginPageImages.mobileImageUrl!,
    );

    await user.click(screen.getByRole('button', { name: 'ล้างรูป รูปภาพ (มือถือ)' }));

    await waitFor(() => {
      expect(clearMobileMutateAsync).toHaveBeenCalledTimes(1);
    });
    expect(clearDesktopMutateAsync).not.toHaveBeenCalled();
    expect(updateMutateAsync).not.toHaveBeenCalled();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByLabelText('รูปภาพ (เดสก์ท็อป)')).toHaveValue(
      configuredLoginPageImages.desktopImageUrl!,
    );
    expect(screen.getByLabelText('รูปภาพ (มือถือ)')).toHaveValue('');
    expect(await screen.findByRole('status')).toHaveTextContent('บันทึกการตั้งค่าแล้ว');
  });
});
