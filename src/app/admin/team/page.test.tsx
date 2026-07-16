import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import AdminTeamPage from './page';

vi.mock('@/hooks/useAuth', () => ({
  useCurrentUser: () => ({
    user: { id: 'admin-1', email: 'admin@sopet.org', fullName: 'Admin User' },
  }),
}));

vi.mock('@/hooks/useAdminTeam', () => ({
  useAdminTeamMembers: () => ({
    data: [
      {
        id: 'admin-1',
        email: 'admin@sopet.org',
        fullName: 'Admin User',
        isActive: true,
      },
      {
        id: 'admin-2',
        email: 'other@sopet.org',
        fullName: 'Other Admin',
        isActive: false,
      },
    ],
    isLoading: false,
  }),
  usePendingAdminInvitations: () => ({
    data: [
      {
        id: 'inv-1',
        email: 'new@sopet.org',
        status: 'pending',
        expiresAt: '2026-08-01T00:00:00.000Z',
      },
    ],
    isLoading: false,
  }),
  useInviteAdmin: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
    isError: false,
    error: null,
  }),
  useRevokeAdminInvitation: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
    isError: false,
    error: null,
  }),
  useSetAdminActive: () => ({
    mutate: vi.fn(),
    isPending: false,
    isError: false,
    error: null,
    variables: undefined,
  }),
}));

describe('AdminTeamPage', () => {
  it('renders admin team sections with Thai labels and permission copy', () => {
    render(<AdminTeamPage />);

    expect(screen.getByRole('heading', { name: 'ทีมผู้ดูแล' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'เชิญผู้ดูแลใหม่' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /ผู้ดูแลระบบ/ })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /คำเชิญที่รอตอบรับ/ })).toBeInTheDocument();
    expect(screen.getByText('Admin User')).toBeInTheDocument();
    expect(screen.getByText('other@sopet.org')).toBeInTheDocument();
    expect(screen.getByText('new@sopet.org')).toBeInTheDocument();
    expect(screen.getByText('คุณ')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'เปิดใช้งาน' })).toBeInTheDocument();
    expect(screen.getByText(/อนุมัติร้านค้า จัดการข้อพิพาท ตั้งค่าแพลตฟอร์ม/)).toBeInTheDocument();
  });
});
