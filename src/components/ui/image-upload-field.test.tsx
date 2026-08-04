import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ImageUploadField } from './image-upload-field';

vi.mock('@/hooks/useImageUpload', () => ({
  useImageUpload: () => ({
    upload: vi.fn(),
    isUploading: false,
    error: null,
    clearError: vi.fn(),
    setError: vi.fn(),
  }),
}));

describe('ImageUploadField', () => {
  it('does not show clear button when onClear is omitted', () => {
    render(
      <ImageUploadField
        label="รูปเดสก์ท็อป"
        value="https://cdn.example.com/login-images/desktop.webp"
        onChange={vi.fn()}
        folder="login-images"
      />,
    );

    expect(screen.queryByRole('button', { name: 'ล้างรูป' })).not.toBeInTheDocument();
  });

  it('shows ล้างรูป and calls onClear when provided with a value', async () => {
    const user = userEvent.setup();
    const onClear = vi.fn();

    render(
      <ImageUploadField
        label="รูปเดสก์ท็อป"
        value="https://cdn.example.com/login-images/desktop.webp"
        onChange={vi.fn()}
        onClear={onClear}
        folder="login-images"
      />,
    );

    await user.click(screen.getByRole('button', { name: 'ล้างรูป' }));
    expect(onClear).toHaveBeenCalledTimes(1);
  });

  it('hides ล้างรูป when value is empty even if onClear is set', () => {
    render(
      <ImageUploadField
        label="รูปเดสก์ท็อป"
        value=""
        onChange={vi.fn()}
        onClear={vi.fn()}
        folder="login-images"
      />,
    );

    expect(screen.queryByRole('button', { name: 'ล้างรูป' })).not.toBeInTheDocument();
  });
});
