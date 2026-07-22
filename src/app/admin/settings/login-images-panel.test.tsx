import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  configuredLoginPageImages,
  createLoginPageImagesMutationMockResult,
  createUseLoginPageImagesMockResult,
  desktopAndMobileLoginPageImages,
  desktopOnlyLoginPageImages,
  emptyLoginPageImages,
  mobileClearedLoginPageImages,
} from './login-page-images.fixtures';
import { LoginImagesPanel } from './login-images-panel';

const useLoginPageImages = vi.fn();
const useUpdateLoginPageImages = vi.fn();
const useClearLoginPageDesktopImage = vi.fn();
const useClearLoginPageMobileImage = vi.fn();

vi.mock('@/hooks/usePlatformSettings', () => ({
  useLoginPageImages: () => useLoginPageImages(),
  useUpdateLoginPageImages: () => useUpdateLoginPageImages(),
  useClearLoginPageDesktopImage: () => useClearLoginPageDesktopImage(),
  useClearLoginPageMobileImage: () => useClearLoginPageMobileImage(),
}));

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

describe('LoginImagesPanel', () => {
  const updateMutateAsync = vi.fn();
  const clearDesktopMutateAsync = vi.fn();
  const clearMobileMutateAsync = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    useLoginPageImages.mockReturnValue(
      createUseLoginPageImagesMockResult({ data: emptyLoginPageImages }),
    );
    useUpdateLoginPageImages.mockReturnValue(
      createLoginPageImagesMutationMockResult({ mutateAsync: updateMutateAsync }),
    );
    useClearLoginPageDesktopImage.mockReturnValue(
      createLoginPageImagesMutationMockResult({ mutateAsync: clearDesktopMutateAsync }),
    );
    useClearLoginPageMobileImage.mockReturnValue(
      createLoginPageImagesMutationMockResult({ mutateAsync: clearMobileMutateAsync }),
    );
  });

  it('shows empty helper and SaveBar idle label', () => {
    render(<LoginImagesPanel />);

    expect(
      screen.getByText('ยังไม่ได้ตั้งค่ารูปหน้าเข้าสู่ระบบ — อัปโหลดรูปเดสก์ท็อปเพื่อเริ่มต้น'),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'บันทึก' })).toBeDisabled();
  });

  it('blocks Save without desktop and shows ต้องมีรูปเดสก์ท็อป', async () => {
    const user = userEvent.setup();
    render(<LoginImagesPanel />);

    await user.type(screen.getByLabelText('รูปภาพ (มือถือ)'), 'https://cdn.example.com/m.webp');
    await user.click(screen.getByRole('button', { name: 'บันทึก' }));

    expect(await screen.findByText('ต้องมีรูปเดสก์ท็อป')).toBeInTheDocument();
    expect(updateMutateAsync).not.toHaveBeenCalled();
  });

  it('saves desktop-only (AC-009) and shows success string', async () => {
    const user = userEvent.setup();
    updateMutateAsync.mockResolvedValue(desktopOnlyLoginPageImages);

    render(<LoginImagesPanel />);

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
    expect(await screen.findByRole('status')).toHaveTextContent('บันทึกการตั้งค่าแล้ว');
  });

  it('re-submits retained desktop on mobile-only save (AC-010)', async () => {
    const user = userEvent.setup();
    useLoginPageImages.mockReturnValue(
      createUseLoginPageImagesMockResult({ data: desktopOnlyLoginPageImages }),
    );
    updateMutateAsync.mockResolvedValue(desktopAndMobileLoginPageImages);

    render(<LoginImagesPanel />);

    await user.type(
      screen.getByLabelText('รูปภาพ (มือถือ)'),
      desktopAndMobileLoginPageImages.mobileImageUrl!,
    );
    await user.click(screen.getByRole('button', { name: 'บันทึก' }));

    await waitFor(() => {
      expect(updateMutateAsync).toHaveBeenCalledWith({
        desktopImageUrl: desktopOnlyLoginPageImages.desktopImageUrl,
        mobileImageUrl: desktopAndMobileLoginPageImages.mobileImageUrl,
        altText: '',
      });
    });
  });

  it('clears mobile immediately without dialog and retains desktop', async () => {
    const user = userEvent.setup();
    useLoginPageImages.mockReturnValue(
      createUseLoginPageImagesMockResult({ data: configuredLoginPageImages }),
    );
    clearMobileMutateAsync.mockResolvedValue(mobileClearedLoginPageImages);

    render(<LoginImagesPanel />);

    await user.click(screen.getByRole('button', { name: 'ล้างรูป รูปภาพ (มือถือ)' }));

    await waitFor(() => {
      expect(clearMobileMutateAsync).toHaveBeenCalledTimes(1);
    });
    expect(clearDesktopMutateAsync).not.toHaveBeenCalled();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByLabelText('รูปภาพ (เดสก์ท็อป)')).toHaveValue(
      configuredLoginPageImages.desktopImageUrl!,
    );
  });

  it('opens clear-desktop confirm with locked copy and clears on phrase', async () => {
    const user = userEvent.setup();
    useLoginPageImages.mockReturnValue(
      createUseLoginPageImagesMockResult({ data: configuredLoginPageImages }),
    );
    clearDesktopMutateAsync.mockResolvedValue(emptyLoginPageImages);

    render(<LoginImagesPanel />);

    await user.click(screen.getByRole('button', { name: 'ล้างรูป รูปภาพ (เดสก์ท็อป)' }));

    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByRole('heading', { name: 'ล้างรูปเดสก์ท็อป?' })).toBeInTheDocument();
    expect(
      within(dialog).getByText('การล้างรูปเดสก์ท็อปจะล้างรูปมือถือด้วย และตั้งค่าจะว่างทั้งหมด'),
    ).toBeInTheDocument();
    expect(within(dialog).queryByText(/การลบ ".* ไม่สามารถย้อนกลับได้/)).not.toBeInTheDocument();

    const confirmButton = within(dialog).getByRole('button', { name: 'ล้างรูป' });
    expect(confirmButton).toBeDisabled();

    await user.type(within(dialog).getByLabelText(/พิมพ์ "ล้างรูป" เพื่อยืนยัน/), 'ล้างรูป');
    await user.click(confirmButton);

    await waitFor(() => {
      expect(clearDesktopMutateAsync).toHaveBeenCalledTimes(1);
    });
    expect(updateMutateAsync).not.toHaveBeenCalled();
  });

  it('shows กำลังบันทึก... while update is pending', () => {
    useUpdateLoginPageImages.mockReturnValue(
      createLoginPageImagesMutationMockResult({
        mutateAsync: updateMutateAsync,
        isPending: true,
      }),
    );
    useLoginPageImages.mockReturnValue(
      createUseLoginPageImagesMockResult({ data: desktopOnlyLoginPageImages }),
    );

    render(<LoginImagesPanel />);

    expect(screen.getByRole('button', { name: 'กำลังบันทึก...' })).toBeInTheDocument();
  });
});
