import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Notification } from '@/lib/api/notifications';
import AdminNotificationsPage from './page';

const useNotifications = vi.fn();
const markRead = vi.fn();
const markAll = vi.fn();
const refetch = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));

vi.mock('@/lib/hooks/useNotifications', () => ({
  useNotifications: (...args: unknown[]) => useNotifications(...args),
  useMarkNotificationRead: () => [markRead],
  useMarkAllNotificationsRead: () => [markAll, { loading: false }],
}));

const unreadNotification: Notification = {
  id: 'n-1',
  type: 'store_approved',
  title: 'ร้านค้าได้รับการอนุมัติ',
  message: 'ร้าน Demo Store พร้อมขายแล้ว',
  metadata: {},
  isRead: false,
  createdAt: new Date('2026-07-16T08:00:00.000Z'),
};

const readNotification: Notification = {
  id: 'n-2',
  type: 'system',
  title: 'อัปเดตระบบ',
  message: 'ระบบบำรุงรักษาเสร็จสิ้น',
  metadata: {},
  isRead: true,
  createdAt: new Date('2026-07-15T08:00:00.000Z'),
};

describe('AdminNotificationsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    markAll.mockResolvedValue(undefined);
    markRead.mockResolvedValue(undefined);
    refetch.mockResolvedValue(undefined);
  });

  it('shows list skeleton while loading', () => {
    useNotifications.mockReturnValue({
      notifications: [],
      loading: true,
      error: undefined,
      refetch,
    });

    render(<AdminNotificationsPage />);

    expect(screen.getByLabelText('กำลังโหลดการแจ้งเตือน')).toBeInTheDocument();
    expect(screen.queryByText('กำลังโหลด...')).not.toBeInTheDocument();
  });

  it('shows PageHeader, filter tabs, and teachable empty state', () => {
    useNotifications.mockReturnValue({
      notifications: [],
      loading: false,
      error: undefined,
      refetch,
    });

    render(<AdminNotificationsPage />);

    expect(screen.getByRole('heading', { name: 'การแจ้งเตือน' })).toBeInTheDocument();
    expect(screen.getByText('อัปเดตจากร้านค้า คำสั่งซื้อ และการอนุมัติระบบ')).toBeInTheDocument();
    expect(screen.getByRole('tablist', { name: 'กรองการแจ้งเตือน' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'ทั้งหมด' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText('ยังไม่มีแจ้งเตือน')).toBeInTheDocument();
    expect(
      screen.getByText('เมื่อมีร้านค้าหรือคำสั่งซื้อที่ต้องตรวจสอบ การแจ้งเตือนจะปรากฏที่นี่'),
    ).toBeInTheDocument();
  });

  it('shows mark-all action and unread badge when there are unread items', () => {
    useNotifications.mockReturnValue({
      notifications: [unreadNotification, readNotification],
      loading: false,
      error: undefined,
      refetch,
    });

    render(<AdminNotificationsPage />);

    expect(screen.getByRole('button', { name: 'อ่านทั้งหมดแล้ว' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /ยังไม่อ่าน/ })).toHaveTextContent('1');
    expect(screen.getByText('ร้านค้าได้รับการอนุมัติ')).toBeInTheDocument();
    expect(screen.getAllByText('ยังไม่อ่าน').length).toBeGreaterThanOrEqual(2);
  });

  it('shows recoverable error state', async () => {
    const user = userEvent.setup();
    useNotifications.mockReturnValue({
      notifications: [],
      loading: false,
      error: new Error('เครือข่ายขัดข้อง'),
      refetch,
    });

    render(<AdminNotificationsPage />);

    expect(screen.getByRole('alert')).toHaveTextContent('โหลดการแจ้งเตือนไม่สำเร็จ');
    expect(screen.getByText('เครือข่ายขัดข้อง')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'ลองอีกครั้ง' }));
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it('marks all as read from header action', async () => {
    const user = userEvent.setup();
    useNotifications.mockReturnValue({
      notifications: [unreadNotification],
      loading: false,
      error: undefined,
      refetch,
    });

    render(<AdminNotificationsPage />);

    await user.click(screen.getByRole('button', { name: 'อ่านทั้งหมดแล้ว' }));
    expect(markAll).toHaveBeenCalledTimes(1);
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it('switches unread filter tab', async () => {
    const user = userEvent.setup();
    useNotifications.mockReturnValue({
      notifications: [],
      loading: false,
      error: undefined,
      refetch,
    });

    render(<AdminNotificationsPage />);

    await user.click(screen.getByRole('tab', { name: 'ยังไม่อ่าน' }));
    expect(useNotifications).toHaveBeenLastCalledWith(true);
    expect(screen.getByText('ไม่มีรายการที่ไม่ได้อ่าน')).toBeInTheDocument();
  });
});
