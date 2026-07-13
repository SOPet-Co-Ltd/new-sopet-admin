import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import AdminAuditLogsPage from './page';

vi.mock('@/hooks/useAdminAuditLogs', () => ({
  useAdminAuditLogs: () => ({
    data: {
      items: [
        {
          id: 'log-1',
          actorType: 'admin',
          actorId: 'admin-1',
          actorLabel: 'admin@sopet.org',
          action: 'store.updated',
          resourceType: 'store',
          resourceId: 'store-1',
          metadata: JSON.stringify({ storeName: 'Pet Shop' }),
          ipAddress: null,
          createdAt: '2026-07-14T00:00:00.000Z',
        },
      ],
      pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
    },
    isLoading: false,
    error: null,
  }),
}));

describe('AdminAuditLogsPage', () => {
  it('renders audit log table with Thai labels', () => {
    render(<AdminAuditLogsPage />);

    expect(screen.getByRole('heading', { name: 'บันทึกการใช้งาน' })).toBeInTheDocument();
    expect(screen.getAllByText('แก้ไขร้านค้า').length).toBeGreaterThan(0);
    expect(screen.getAllByText('ร้านค้า').length).toBeGreaterThan(0);
    expect(screen.getByText(/admin@sopet.org/)).toBeInTheDocument();
  });
});
