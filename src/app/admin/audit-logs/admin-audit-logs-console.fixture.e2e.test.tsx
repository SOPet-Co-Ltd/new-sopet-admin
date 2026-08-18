// Admin Audit Logs Console [fixture-e2e] — Early Verification journey S-01 → S-02
// Design Doc: admin-audit-logs-console-frontend-design.md
// UI Spec: admin-audit-logs-console-ui-spec.md | PRD: admin-audit-logs-console-prd.md
// AC: AC-F-017, AC-F-022, AC-F-020, AC-F-016, AC-F-026b, AC-F-021, AC-F-034, AC-F-019
// Mock: useAdminAuditLogs only — real page chrome + AdminAuditLogsConsole + Dialog

import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { AdminAuditLog } from '@/types';
import AdminAuditLogsPage from './page';

const mockUseAdminAuditLogs = vi.fn();

vi.mock('@/hooks/useAdminAuditLogs', () => ({
  useAdminAuditLogs: (params: unknown) => mockUseAdminAuditLogs(params),
}));

/** Remaining metadata must exceed 24 pretty-JSON lines to trigger overflow CTA. */
function buildOverflowMetadataWithComparablePair(): string {
  const filler: Record<string, string> = {};
  for (let i = 1; i <= 30; i += 1) {
    filler[`extraField${i}`] = `value-${i}`;
  }
  return JSON.stringify({
    before: { storeName: 'Old Pet Shop', status: 'active' },
    after: { storeName: 'New Pet Shop', status: 'active' },
    ...filler,
  });
}

const nullIdentityLog: AdminAuditLog = {
  id: 'log-null-identity',
  actorType: 'admin',
  actorId: 'admin-1',
  actorLabel: 'admin@sopet.org',
  action: 'store.updated',
  resourceType: 'store',
  resourceId: null,
  metadata: JSON.stringify({ note: 'minor edit' }),
  ipAddress: null,
  requestId: null,
  createdAt: '2026-07-14T10:00:00.000Z',
};

const dangerLog: AdminAuditLog = {
  id: 'log-danger',
  actorType: 'admin',
  actorId: 'admin-1',
  actorLabel: 'admin@sopet.org',
  action: 'store.suspended',
  resourceType: 'store',
  resourceId: 'store-99',
  metadata: JSON.stringify({ reason: 'policy' }),
  ipAddress: '203.0.113.10',
  requestId: 'req-danger-1',
  createdAt: '2026-07-14T11:00:00.000Z',
};

const overflowLog: AdminAuditLog = {
  id: 'log-overflow',
  actorType: 'admin',
  actorId: 'admin-1',
  actorLabel: 'admin@sopet.org',
  action: 'vendor.updated',
  resourceType: 'vendor',
  resourceId: 'vendor-7',
  metadata: buildOverflowMetadataWithComparablePair(),
  ipAddress: '198.51.100.20',
  requestId: 'req-overflow-1',
  createdAt: '2026-07-14T12:00:00.000Z',
};

const fixtureItems = [nullIdentityLog, dangerLog, overflowLog];

describe('Admin Audit Logs Console [fixture-e2e]', () => {
  beforeEach(() => {
    mockUseAdminAuditLogs.mockReset();
    mockUseAdminAuditLogs.mockImplementation((params: { page?: number }) => ({
      data: {
        items: fixtureItems,
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
  });

  /**
   * AC: AC-F-017, AC-F-022, AC-F-020, AC-F-016, AC-F-026b, AC-F-019, AC-F-034, AC-F-021
   * Behavior: page 2 → filter change collapses + page 1 → expand accordion → overflow Dialog → ปิด.
   * @category: fixture-e2e
   * @lane: fixture-e2e
   * @dependency: full-ui (mocked useAdminAuditLogs), AdminAuditLogsPage, AdminAuditLogsConsole, Dialog
   * @complexity: high
   * ROI: 120
   */
  it('filters, expands accordion with null placeholders, and opens overflow Dialog', async () => {
    const user = userEvent.setup();

    render(<AdminAuditLogsPage />);

    // --- Chrome: title, description, five locked filter names, console region (no table) ---
    expect(screen.getByRole('heading', { name: 'บันทึกการใช้งาน' })).toBeInTheDocument();
    expect(screen.getByText('ตรวจสอบกิจกรรมสำคัญของผู้ดูแล ผู้ขาย และระบบ')).toBeInTheDocument();

    expect(screen.getByLabelText('ค้นหาบันทึก')).toBeInTheDocument();
    expect(screen.getByLabelText('กรองตามการกระทำ')).toBeInTheDocument();
    expect(screen.getByLabelText('กรองตามทรัพยากร')).toBeInTheDocument();
    expect(screen.getByLabelText('ตั้งแต่วันที่')).toBeInTheDocument();
    expect(screen.getByLabelText('ถึงวันที่')).toBeInTheDocument();

    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'บันทึกการใช้งาน' })).toBeInTheDocument();

    // Collapsed rows: Thai action label + severity bucket (via row expand controls / pills)
    expect(
      screen.getByRole('button', { name: 'ขยายรายละเอียดบันทึก: แก้ไขร้านค้า' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'ขยายรายละเอียดบันทึก: ระงับร้านค้า' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'ขยายรายละเอียดบันทึก: แก้ไขผู้ขาย' }),
    ).toBeInTheDocument();
    expect(screen.getAllByText('เปลี่ยนแปลง').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('เสี่ยง').length).toBeGreaterThanOrEqual(1);

    // Reach page 2 so filter → page 1 is observable
    await user.click(screen.getByRole('button', { name: 'ถัดไป' }));
    const page2Params = mockUseAdminAuditLogs.mock.calls.at(-1)?.[0] as { page?: number };
    expect(page2Params.page).toBe(2);

    // Expand then change action filter → collapse + page 1 (AC-F-026b)
    await user.click(screen.getByRole('button', { name: 'ขยายรายละเอียดบันทึก: แก้ไขร้านค้า' }));
    expect(
      screen.getByRole('button', { name: 'ย่อรายละเอียดบันทึก: แก้ไขร้านค้า' }),
    ).toHaveAttribute('aria-expanded', 'true');

    await user.selectOptions(screen.getByLabelText('กรองตามการกระทำ'), 'store.updated');

    expect(screen.queryByRole('button', { expanded: true })).not.toBeInTheDocument();
    const afterFilterParams = mockUseAdminAuditLogs.mock.calls.at(-1)?.[0] as {
      page?: number;
      action?: string;
    };
    expect(afterFilterParams.page).toBe(1);
    expect(afterFilterParams.action).toBe('store.updated');

    // Expand store.updated — identity labels + — for nulls (not alert)
    await user.click(screen.getByRole('button', { name: 'ขยายรายละเอียดบันทึก: แก้ไขร้านค้า' }));
    const expandedStoreBtn = screen.getByRole('button', {
      name: 'ย่อรายละเอียดบันทึก: แก้ไขร้านค้า',
    });
    expect(expandedStoreBtn).toHaveAttribute('aria-expanded', 'true');

    const detailPanel = document.getElementById('audit-log-detail-log-null-identity');
    expect(detailPanel).not.toBeNull();
    const detail = within(detailPanel as HTMLElement);

    expect(detail.getByText('ผู้ทำรายการ')).toBeInTheDocument();
    expect(detail.getByText('การกระทำ')).toBeInTheDocument();
    expect(detail.getByText('รหัสทรัพยากร')).toBeInTheDocument();
    expect(detail.getByText('เวลา')).toBeInTheDocument();
    expect(detail.getByText('ที่อยู่ IP')).toBeInTheDocument();
    expect(detail.getByText('รหัสคำขอ')).toBeInTheDocument();
    expect(detail.getByText('ข้อมูลเพิ่มเติม')).toBeInTheDocument();

    const dashes = detail.getAllByText('—');
    expect(dashes.length).toBeGreaterThanOrEqual(3);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();

    // Accordion: expand second row → first collapses
    await user.click(screen.getByRole('button', { name: 'ขยายรายละเอียดบันทึก: ระงับร้านค้า' }));
    expect(
      screen.getByRole('button', { name: 'ย่อรายละเอียดบันทึก: ระงับร้านค้า' }),
    ).toHaveAttribute('aria-expanded', 'true');
    expect(
      screen.getByRole('button', { name: 'ขยายรายละเอียดบันทึก: แก้ไขร้านค้า' }),
    ).toHaveAttribute('aria-expanded', 'false');

    // Overflow row: comparable ก่อน/หลัง + Dialog
    await user.click(screen.getByRole('button', { name: 'ขยายรายละเอียดบันทึก: แก้ไขผู้ขาย' }));
    expect(
      screen.getByRole('button', { name: 'ย่อรายละเอียดบันทึก: แก้ไขผู้ขาย' }),
    ).toHaveAttribute('aria-expanded', 'true');
    expect(
      screen.getByRole('button', { name: 'ขยายรายละเอียดบันทึก: ระงับร้านค้า' }),
    ).toHaveAttribute('aria-expanded', 'false');

    const overflowDetail = document.getElementById('audit-log-detail-log-overflow');
    expect(overflowDetail).not.toBeNull();
    const overflowWithin = within(overflowDetail as HTMLElement);
    expect(overflowWithin.getByText('ก่อน')).toBeInTheDocument();
    expect(overflowWithin.getByText('หลัง')).toBeInTheDocument();
    expect(overflowWithin.getByText('ผู้ทำรายการ')).toBeInTheDocument();

    await user.click(overflowWithin.getByRole('button', { name: 'เปิดรายละเอียดทั้งหมด' }));

    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByText('รายละเอียดบันทึก')).toBeInTheDocument();
    expect(screen.queryByRole('dialog', { name: /sheet/i })).not.toBeInTheDocument();

    await user.click(within(dialog).getByRole('button', { name: 'ปิด' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'ย่อรายละเอียดบันทึก: แก้ไขผู้ขาย' }),
    ).toHaveAttribute('aria-expanded', 'true');
  });
});
