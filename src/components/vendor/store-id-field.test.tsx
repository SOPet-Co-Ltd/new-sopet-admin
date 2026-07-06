import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { StoreIdField } from './store-id-field';

vi.mock('@/hooks/useVendorStoreId', () => ({
  useVendorStoreId: vi.fn(),
}));

import { useVendorStoreId } from '@/hooks/useVendorStoreId';

const mockedUseVendorStoreId = vi.mocked(useVendorStoreId);

describe('StoreIdField', () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('shows loading placeholder when store id is unavailable', () => {
    mockedUseVendorStoreId.mockReturnValue(undefined);

    render(<StoreIdField />);

    expect(screen.getByText('กำลังโหลด...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'คัดลอก Store ID' })).toBeDisabled();
  });

  it('renders store id and optional description', () => {
    mockedUseVendorStoreId.mockReturnValue('store-abc-123');

    render(<StoreIdField description="ใช้ Store ID นี้ใน API request" />);

    expect(screen.getByText('store-abc-123')).toBeInTheDocument();
    expect(screen.getByText('ใช้ Store ID นี้ใน API request')).toBeInTheDocument();
  });

  it('copies store id to clipboard', async () => {
    mockedUseVendorStoreId.mockReturnValue('store-copy-me');
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: { writeText },
    });

    render(<StoreIdField />);
    await userEvent.click(screen.getByRole('button', { name: 'คัดลอก Store ID' }));

    expect(writeText).toHaveBeenCalledWith('store-copy-me');
    expect(await screen.findByText('คัดลอกแล้ว')).toBeInTheDocument();
  });
});
