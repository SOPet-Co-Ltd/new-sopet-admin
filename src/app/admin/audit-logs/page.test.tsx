import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import AdminAuditLogsPage from './page';

const mockUseAdminAuditLogs = vi.fn();

vi.mock('@/hooks/useAdminAuditLogs', () => ({
  useAdminAuditLogs: (params: unknown) => mockUseAdminAuditLogs(params),
}));

const sampleLog = {
  id: 'log-1',
  actorType: 'admin' as const,
  actorId: 'admin-1',
  actorLabel: 'admin@sopet.org',
  action: 'store.updated',
  resourceType: 'store',
  resourceId: 'store-1',
  metadata: JSON.stringify({ storeName: 'Pet Shop' }),
  ipAddress: null,
  requestId: null,
  createdAt: '2026-07-14T00:00:00.000Z',
};

const defaultHookReturn = {
  data: {
    items: [sampleLog],
    pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
  },
  isLoading: false,
  isFetching: false,
  error: null,
};

describe('AdminAuditLogsPage', () => {
  beforeEach(() => {
    mockUseAdminAuditLogs.mockReset();
    mockUseAdminAuditLogs.mockReturnValue(defaultHookReturn);
  });

  /**
   * AC: AC-F-022 — title บันทึกการใช้งาน, description
   * ตรวจสอบกิจกรรมสำคัญของผู้ดูแล ผู้ขาย และระบบ, and five filters with accessible names
   * exactly ค้นหาบันทึก, กรองตามการกระทำ, กรองตามทรัพยากร, ตั้งแต่วันที่, ถึงวันที่.
   * Behavior: Render page → assert heading, description, and five getByLabelText exact names.
   * @category: core-functionality
   * @lane: integration
   * @dependency: AdminAuditLogsPage, PageHeader, filter inputs
   * @complexity: low
   * ROI: 90
   */
  it('renders PageHeader copy and five locked filter aria-labels', () => {
    render(<AdminAuditLogsPage />);

    expect(screen.getByRole('heading', { name: 'บันทึกการใช้งาน' })).toBeInTheDocument();
    expect(screen.getByText('ตรวจสอบกิจกรรมสำคัญของผู้ดูแล ผู้ขาย และระบบ')).toBeInTheDocument();

    expect(screen.getByLabelText('ค้นหาบันทึก')).toBeInTheDocument();
    expect(screen.getByLabelText('กรองตามการกระทำ')).toBeInTheDocument();
    expect(screen.getByLabelText('กรองตามทรัพยากร')).toBeInTheDocument();
    expect(screen.getByLabelText('ตั้งแต่วันที่')).toBeInTheDocument();
    expect(screen.getByLabelText('ถึงวันที่')).toBeInTheDocument();
  });

  /**
   * AC: AC-F-017 — list uses AdminAuditLogsConsole and shall not render DataTable.
   * Behavior: Render page with fixture row → region บันทึกการใช้งาน present; role=table absent.
   * @category: core-functionality
   * @lane: integration
   * @dependency: AdminAuditLogsPage, AdminAuditLogsConsole (mocked useAdminAuditLogs)
   * @complexity: low
   * ROI: 85
   */
  it('uses AdminAuditLogsConsole instead of DataTable', () => {
    render(<AdminAuditLogsPage />);

    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'บันทึกการใช้งาน' })).toBeInTheDocument();
    expect(screen.getAllByText('แก้ไขร้านค้า').length).toBeGreaterThan(0);
    expect(screen.getByText(/admin@sopet.org/)).toBeInTheDocument();
  });

  /**
   * AC: AC-F-023 + empty-input omit — client always limit: 20; empty filters omit GraphQL fields.
   * Behavior: Render with default empty filters → hook called with page 1, limit 20, no empty keys.
   * @category: core-functionality
   * @lane: integration
   * @dependency: AdminAuditLogsPage, useAdminAuditLogs mock
   * @complexity: low
   * ROI: 80
   */
  it('requests limit 20 and omits empty filter fields from hook params', () => {
    render(<AdminAuditLogsPage />);

    expect(mockUseAdminAuditLogs).toHaveBeenCalledWith(
      expect.objectContaining({
        page: 1,
        limit: 20,
      }),
    );

    const params = mockUseAdminAuditLogs.mock.calls[0]?.[0] as Record<string, unknown>;
    expect(params).not.toHaveProperty('search');
    expect(params).not.toHaveProperty('action');
    expect(params).not.toHaveProperty('resourceType');
    expect(params).not.toHaveProperty('fromDate');
    expect(params).not.toHaveProperty('toDate');
    expect(params).not.toHaveProperty('requestId');
  });

  /**
   * AC: AC-F-empty — zero items shows ไม่พบบันทึกการใช้งาน with filters still visible.
   * Behavior: Hook returns empty items → empty copy; search and action filters remain.
   * @category: edge-case
   * @lane: integration
   * @dependency: AdminAuditLogsPage, AdminAuditLogsConsole emptyMessage
   * @complexity: low
   * ROI: 75
   */
  it('shows empty copy with filters still visible', () => {
    mockUseAdminAuditLogs.mockReturnValue({
      data: {
        items: [],
        pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
      },
      isLoading: false,
      isFetching: false,
      error: null,
    });

    render(<AdminAuditLogsPage />);

    expect(screen.getByText('ไม่พบบันทึกการใช้งาน')).toBeInTheDocument();
    expect(screen.getByLabelText('ค้นหาบันทึก')).toBeInTheDocument();
    expect(screen.getByLabelText('กรองตามการกระทำ')).toBeInTheDocument();
  });

  /**
   * AC: AC-F-error — list query fails → role=alert with mapped Thai copy; filters remain.
   * Behavior: Hook returns Error → alert text via getErrorMessage; ค้นหาบันทึก still mounted.
   * @category: edge-case
   * @lane: integration
   * @dependency: AdminAuditLogsPage error alert
   * @complexity: low
   * ROI: 80
   */
  it('shows role=alert on error while filters remain', async () => {
    mockUseAdminAuditLogs.mockReturnValue({
      data: undefined,
      isLoading: false,
      isFetching: false,
      error: new Error('network down'),
    });

    render(<AdminAuditLogsPage />);

    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent('โหลดบันทึกการใช้งานไม่สำเร็จ');
    expect(screen.getByLabelText('ค้นหาบันทึก')).toBeInTheDocument();
  });

  /**
   * AC: AC-F-error (cached/placeholder Partial) — If cached items exist with error, rows stay.
   * Behavior: Hook returns Error + items → alert visible and row content still rendered.
   * @category: edge-case
   * @lane: integration
   * @dependency: AdminAuditLogsPage, AdminAuditLogsConsole
   * @complexity: medium
   * ROI: 85
   */
  it('keeps cached rows visible when error occurs with placeholder items', () => {
    mockUseAdminAuditLogs.mockReturnValue({
      data: {
        items: [sampleLog],
        pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
      },
      isLoading: false,
      isFetching: false,
      error: new Error('refetch failed'),
    });

    render(<AdminAuditLogsPage />);

    expect(screen.getByRole('alert')).toHaveTextContent('โหลดบันทึกการใช้งานไม่สำเร็จ');
    expect(screen.getAllByText('แก้ไขร้านค้า').length).toBeGreaterThan(0);
    expect(screen.getByText(/admin@sopet.org/)).toBeInTheDocument();
    expect(screen.getByLabelText('ค้นหาบันทึก')).toBeInTheDocument();
  });

  /**
   * AC: AC-F-error fallback — non-Error failure shows โหลดบันทึกการใช้งานไม่สำเร็จ.
   * Behavior: Hook returns non-Error error value → alert uses Thai fallback copy.
   * @category: edge-case
   * @lane: integration
   * @dependency: AdminAuditLogsPage error alert
   * @complexity: low
   * ROI: 78
   */
  it('shows Thai fallback copy when error is not an Error instance', () => {
    mockUseAdminAuditLogs.mockReturnValue({
      data: undefined,
      isLoading: false,
      isFetching: false,
      error: 'network down',
    });

    render(<AdminAuditLogsPage />);

    expect(screen.getByRole('alert')).toHaveTextContent('โหลดบันทึกการใช้งานไม่สำเร็จ');
    expect(screen.getByLabelText('ค้นหาบันทึก')).toBeInTheDocument();
  });

  /**
   * AC: AC-F-partial — quiet fetch marks console aria-busy and opacity-80.
   * Behavior: isFetching true, isLoading false → region aria-busy and opacity-80 class.
   * @category: core-functionality
   * @lane: integration
   * @dependency: AdminAuditLogsPage, AdminAuditLogsConsole
   * @complexity: low
   * ROI: 75
   */
  it('marks console aria-busy and opacity during quiet fetch', () => {
    mockUseAdminAuditLogs.mockReturnValue({
      ...defaultHookReturn,
      isFetching: true,
      isLoading: false,
    });

    render(<AdminAuditLogsPage />);

    const region = screen.getByRole('region', { name: 'บันทึกการใช้งาน' });
    expect(region).toHaveAttribute('aria-busy', 'true');
    expect(region.className).toMatch(/opacity-80/);
  });

  /**
   * AC: AC-F-026b — filter/page change remounts (collapse) and resets page to 1 on filter change.
   * Behavior: Start multi-page → click ถัดไป (page 2) → expand row → change search filter →
   * expand collapses and last hook params.page === 1.
   * @category: core-functionality
   * @lane: integration
   * @dependency: AdminAuditLogsPage remount key, AdminAuditLogsConsole expand, pagination
   * @complexity: medium
   * ROI: 95
   */
  it('remounts console on filter change from page 2 (collapses expand) and resets page to 1', async () => {
    const user = userEvent.setup();

    mockUseAdminAuditLogs.mockImplementation((params: { page?: number }) => ({
      data: {
        items: [sampleLog],
        pagination: {
          page: params.page ?? 1,
          limit: 20,
          total: 40,
          totalPages: 2,
        },
      },
      isLoading: false,
      isFetching: false,
      error: null,
    }));

    render(<AdminAuditLogsPage />);

    await user.click(screen.getByRole('button', { name: 'ถัดไป' }));

    const page2Params = mockUseAdminAuditLogs.mock.calls.at(-1)?.[0] as { page?: number };
    expect(page2Params.page).toBe(2);

    await user.click(screen.getByRole('button', { name: /ขยายรายละเอียดบันทึก/ }));
    expect(screen.getByRole('button', { name: /ย่อรายละเอียดบันทึก/ })).toBeInTheDocument();

    await user.type(screen.getByLabelText('ค้นหาบันทึก'), 'pet');

    expect(screen.queryByRole('button', { name: /ย่อรายละเอียดบันทึก/ })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /ขยายรายละเอียดบันทึก/ })).toBeInTheDocument();

    const lastParams = mockUseAdminAuditLogs.mock.calls.at(-1)?.[0] as {
      page?: number;
      search?: string;
    };
    expect(lastParams.page).toBe(1);
    expect(lastParams.search).toBe('pet');
  });

  /**
   * AC: AC-F-025/026 — poll (isFetching toggle) must not remount console or clear expand.
   * Behavior: Expand row → toggle isFetching via rerender → expand and aria-busy remain.
   * @category: core-functionality
   * @lane: integration
   * @dependency: AdminAuditLogsPage remount key, AdminAuditLogsConsole
   * @complexity: medium
   * ROI: 90
   */
  it('does not remount console across quiet poll (isFetching toggle keeps expand)', async () => {
    const user = userEvent.setup();
    let hookState = {
      ...defaultHookReturn,
      isFetching: false,
    };

    mockUseAdminAuditLogs.mockImplementation(() => hookState);

    const { rerender } = render(<AdminAuditLogsPage />);

    await user.click(screen.getByRole('button', { name: /ขยายรายละเอียดบันทึก/ }));
    expect(screen.getByRole('button', { name: /ย่อรายละเอียดบันทึก/ })).toBeInTheDocument();

    hookState = { ...hookState, isFetching: true };
    rerender(<AdminAuditLogsPage />);

    expect(screen.getByRole('button', { name: /ย่อรายละเอียดบันทึก/ })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'บันทึกการใช้งาน' })).toHaveAttribute(
      'aria-busy',
      'true',
    );
  });

  /**
   * AC: AC-F-033 — codegen has AdminAuditLogFilterInput.requestId → sixth control
   * ค้นหาด้วยรหัสคำขอ enabled; typing requestId passes it with page 1; five locked labels remain.
   * Behavior: Assert sixth control → type request id → last hook params include requestId + page 1;
   * five AC-F-022 aria-labels still present.
   * @category: core-functionality
   * @lane: integration
   * @dependency: AdminAuditLogsPage requestId control, useAdminAuditLogs mock
   * @complexity: medium
   * ROI: 88
   */
  it('enables requestId lookup and passes requestId with page 1 while keeping five locked filters', async () => {
    const user = userEvent.setup();

    render(<AdminAuditLogsPage />);

    expect(screen.getByLabelText('ค้นหาด้วยรหัสคำขอ')).toBeInTheDocument();
    expect(screen.getByLabelText('ค้นหาบันทึก')).toBeInTheDocument();
    expect(screen.getByLabelText('กรองตามการกระทำ')).toBeInTheDocument();
    expect(screen.getByLabelText('กรองตามทรัพยากร')).toBeInTheDocument();
    expect(screen.getByLabelText('ตั้งแต่วันที่')).toBeInTheDocument();
    expect(screen.getByLabelText('ถึงวันที่')).toBeInTheDocument();

    await user.type(screen.getByLabelText('ค้นหาด้วยรหัสคำขอ'), 'req-abc-123');

    const lastParams = mockUseAdminAuditLogs.mock.calls.at(-1)?.[0] as {
      page?: number;
      requestId?: string;
    };
    expect(lastParams.requestId).toBe('req-abc-123');
    expect(lastParams.page).toBe(1);
  });

  /**
   * AC: Date boundary roundtrip — YYYY-MM-DD DatePicker values serialize to ISO day start/end.
   * Behavior: Pick from/to dates in the calendar → hook params use toISOString of local day bounds.
   * @category: core-functionality
   * @lane: integration
   * @dependency: AdminAuditLogsPage DatePicker, useAdminAuditLogs mock
   * @complexity: low
   * ROI: 70
   */
  it('serializes date bounds to ISO day start/end when dates are set', async () => {
    const user = userEvent.setup();
    render(<AdminAuditLogsPage />);

    await user.click(screen.getByLabelText('ตั้งแต่วันที่'));
    await user.selectOptions(screen.getByLabelText('เดือน'), '7');
    await user.selectOptions(screen.getByLabelText('ปี'), '2026');
    await user.click(screen.getByRole('gridcell', { name: '1' }));

    await user.click(screen.getByLabelText('ถึงวันที่'));
    await user.selectOptions(screen.getByLabelText('เดือน'), '7');
    await user.selectOptions(screen.getByLabelText('ปี'), '2026');
    await user.click(screen.getByRole('gridcell', { name: '31' }));

    const params = mockUseAdminAuditLogs.mock.calls.at(-1)?.[0] as {
      fromDate?: string;
      toDate?: string;
    };

    expect(params.fromDate).toBe(new Date('2026-07-01T00:00:00').toISOString());
    expect(params.toDate).toBe(new Date('2026-07-31T23:59:59').toISOString());
  });

  /**
   * AC: Pagination chrome — when totalPages > 1, page indicator and prev/next render.
   * Behavior: Hook returns totalPages 2 → หน้า 1 จาก 2; ก่อนหน้า disabled; ถัดไป enabled.
   * @category: core-functionality
   * @lane: integration
   * @dependency: AdminAuditLogsPage pagination bar
   * @complexity: low
   * ROI: 65
   */
  it('keeps pagination chrome when totalPages > 1', () => {
    mockUseAdminAuditLogs.mockReturnValue({
      data: {
        items: [sampleLog],
        pagination: { page: 1, limit: 20, total: 40, totalPages: 2 },
      },
      isLoading: false,
      isFetching: false,
      error: null,
    });

    render(<AdminAuditLogsPage />);

    expect(screen.getByText(/หน้า 1 จาก 2/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'ก่อนหน้า' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'ถัดไป' })).toBeEnabled();
  });

  /**
   * AC: No success toasts on audit list load.
   * Behavior: Render success state → no success status/toast copy.
   * @category: edge-case
   * @lane: integration
   * @dependency: AdminAuditLogsPage
   * @complexity: low
   * ROI: 60
   */
  it('does not render success toasts', () => {
    render(<AdminAuditLogsPage />);
    expect(screen.queryByRole('status', { name: /สำเร็จ/ })).not.toBeInTheDocument();
    expect(within(document.body).queryByText(/โหลดสำเร็จ/)).not.toBeInTheDocument();
  });

  /**
   * AC: Mobile filter collapse — filter fields sit behind a toggle on small screens.
   * Behavior: Toggle starts collapsed (aria-expanded false, panel max-md:hidden);
   * click expands; click again collapses; typing search shows count on the toggle.
   * @category: core-functionality
   * @lane: integration
   * @dependency: AdminAuditLogsPage mobile filter toggle
   * @complexity: low
   * ROI: 80
   */
  it('collapses audit filters behind a mobile toggle and reports active count', async () => {
    const user = userEvent.setup();
    render(<AdminAuditLogsPage />);

    const toggle = screen.getByRole('button', { name: 'ตัวกรอง' });
    const panel = document.getElementById(toggle.getAttribute('aria-controls') ?? '');

    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(toggle.className).toMatch(/md:hidden/);
    expect(panel).toHaveClass('max-md:hidden');

    await user.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(panel).not.toHaveClass('max-md:hidden');

    await user.type(screen.getByLabelText('ค้นหาบันทึก'), 'pet');
    expect(screen.getByRole('button', { name: 'ตัวกรอง 1 รายการ' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'ตัวกรอง 1 รายการ' }));
    expect(screen.getByRole('button', { name: 'ตัวกรอง 1 รายการ' })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
    expect(panel).toHaveClass('max-md:hidden');
  });
});
