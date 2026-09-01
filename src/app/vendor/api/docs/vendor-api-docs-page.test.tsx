import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import VendorApiDocsPage from './vendor-api-docs-page';

vi.mock('@/hooks/useMembershipRole', () => ({
  useIsStoreManager: () => ({ isManager: true, isLoading: false }),
}));

vi.mock('@/hooks/useVendorStoreId', () => ({
  useVendorStoreId: () => 'store-1',
}));

describe('VendorApiDocsPage', () => {
  it('links to the full vendor error catalog from header and error codes section', () => {
    render(<VendorApiDocsPage apiBaseUrl="https://api.example.com" />);

    const catalogLinks = screen.getAllByRole('link', { name: 'รหัสข้อผิดพลาด' });
    expect(catalogLinks).toHaveLength(2);
    for (const link of catalogLinks) {
      expect(link).toHaveAttribute('href', '/vendor/errors-message');
    }
  });
});
