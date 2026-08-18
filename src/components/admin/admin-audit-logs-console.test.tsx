import { readFileSync } from 'node:fs';
import path from 'node:path';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { AdminAuditLogsConsole } from './admin-audit-logs-console';
import { getAuditActionLabel } from '@/lib/audit-logs/labels';
import { formatDateTime } from '@/lib/utils';
import type { AdminAuditLog } from '@/types';

function makeLog(overrides: Partial<AdminAuditLog> = {}): AdminAuditLog {
  return {
    id: 'log-1',
    actorType: 'admin',
    actorLabel: 'admin@sopet.org',
    action: 'store.updated',
    resourceType: 'store',
    resourceId: 'res-1',
    metadata: JSON.stringify({ foo: 'bar' }),
    ipAddress: '1.1.1.1',
    requestId: 'req-1',
    createdAt: '2026-08-19T05:00:00.000Z',
    ...overrides,
  };
}

function overflowMetadataByLines(keyCount = 30): string {
  const record: Record<string, string> = {};
  for (let index = 0; index < keyCount; index += 1) {
    record[`field_${index}`] = `value_${index}`;
  }
  return JSON.stringify(record);
}

function overflowMetadataByLength(): string {
  return JSON.stringify({ blob: 'x'.repeat(8200) });
}

const CONSOLE_SOURCE = readFileSync(path.join(__dirname, 'admin-audit-logs-console.tsx'), 'utf8');

describe('AdminAuditLogsConsole', () => {
  it('renders a labelled region of native expand buttons without a table or DataTable/Sheet imports', () => {
    render(<AdminAuditLogsConsole items={[makeLog()]} isLoading={false} isFetching={false} />);

    const region = screen.getByRole('region', { name: 'บันทึกการใช้งาน' });
    expect(region).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(document.querySelector('[aria-live="polite"]')).not.toBeNull();

    const expand = screen.getByRole('button', {
      name: `ขยายรายละเอียดบันทึก: ${getAuditActionLabel('store.updated')}`,
    });
    expect(expand).toHaveAttribute('type', 'button');
    expect(expand).toHaveAttribute('aria-expanded', 'false');
    expect(expand).toHaveAttribute('aria-controls', 'audit-log-detail-log-1');

    expect(CONSOLE_SOURCE).not.toMatch(/from ['"]@\/components\/ui\/data-table['"]/);
    expect(CONSOLE_SOURCE).not.toMatch(/\bSheet\b/);
    expect(CONSOLE_SOURCE).not.toMatch(/overflow-x-auto/);
    expect(CONSOLE_SOURCE).not.toMatch(/md:min-w-\[640px\]/);
    expect(region.className).not.toMatch(/overflow-x-auto/);
    expect(region.className).not.toMatch(/md:min-w-\[640px\]/);
  });

  it('shows timestamp first with a compact severity pill word and Thai action label', () => {
    render(
      <AdminAuditLogsConsole
        items={[
          makeLog({ action: 'store.suspended' }),
          makeLog({ id: 'log-2', action: 'auth.login' }),
        ]}
        isLoading={false}
        isFetching={false}
      />,
    );

    const dangerRow = screen.getByRole('button', {
      name: `ขยายรายละเอียดบันทึก: ${getAuditActionLabel('store.suspended')}`,
    });
    expect(dangerRow.textContent?.startsWith(formatDateTime('2026-08-19T05:00:00.000Z'))).toBe(
      true,
    );
    expect(within(dangerRow).getByText('เสี่ยง')).toBeInTheDocument();
    expect(within(dangerRow).getByText('ระงับร้านค้า')).toBeInTheDocument();

    const dangerPill = within(dangerRow).getByText('เสี่ยง');
    expect(dangerPill.className).toContain('bg-danger-bg');
    expect(dangerPill.className).toContain('text-danger');
    expect(dangerPill.className).toContain('dark:text-white');
    expect(dangerPill.className).not.toMatch(/dark:text-danger/);

    const successRow = screen.getByRole('button', {
      name: `ขยายรายละเอียดบันทึก: ${getAuditActionLabel('auth.login')}`,
    });
    expect(within(successRow).getByText('สำเร็จ')).toBeInTheDocument();
    expect(within(successRow).getByText('เข้าสู่ระบบ')).toBeInTheDocument();
  });

  it('toggles expand as an accordion and lists identity fields with em dashes for nulls', async () => {
    const user = userEvent.setup();
    const first = makeLog({
      id: 'log-nulls',
      resourceId: null,
      ipAddress: null,
      requestId: null,
    });
    const second = makeLog({
      id: 'log-2',
      action: 'store.approved',
      resourceId: 'store-2',
    });

    render(<AdminAuditLogsConsole items={[first, second]} isLoading={false} isFetching={false} />);

    const firstName = `ขยายรายละเอียดบันทึก: ${getAuditActionLabel(first.action)}`;
    const secondName = `ขยายรายละเอียดบันทึก: ${getAuditActionLabel(second.action)}`;

    await user.click(screen.getByRole('button', { name: firstName }));

    const collapseFirst = screen.getByRole('button', {
      name: `ย่อรายละเอียดบันทึก: ${getAuditActionLabel(first.action)}`,
    });
    expect(collapseFirst).toHaveAttribute('aria-expanded', 'true');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();

    const detail = document.getElementById('audit-log-detail-log-nulls');
    expect(detail).not.toBeNull();
    const detailText = detail?.textContent ?? '';
    const labels = [
      'ผู้ทำรายการ',
      'การกระทำ',
      'รหัสทรัพยากร',
      'เวลา',
      'ที่อยู่ IP',
      'รหัสคำขอ',
      'ข้อมูลเพิ่มเติม',
    ];
    let lastIndex = -1;
    for (const label of labels) {
      const index = detailText.indexOf(label);
      expect(index).toBeGreaterThan(lastIndex);
      lastIndex = index;
    }

    expect(within(detail as HTMLElement).getAllByText('—').length).toBeGreaterThanOrEqual(3);

    await user.click(screen.getByRole('button', { name: secondName }));

    expect(
      screen.getByRole('button', {
        name: `ย่อรายละเอียดบันทึก: ${getAuditActionLabel(second.action)}`,
      }),
    ).toHaveAttribute('aria-expanded', 'true');
    expect(
      screen.getByRole('button', {
        name: firstName,
      }),
    ).toHaveAttribute('aria-expanded', 'false');
    expect(document.getElementById('audit-log-detail-log-nulls')).toBeNull();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('renders AC-034 ก่อน/หลัง for a comparable pair and pretty JSON for remaining keys', async () => {
    const user = userEvent.setup();
    const log = makeLog({
      metadata: JSON.stringify({
        before: { status: 'active' },
        after: { status: 'suspended' },
        note: 'keep-me',
      }),
    });

    render(<AdminAuditLogsConsole items={[log]} isLoading={false} isFetching={false} />);

    await user.click(
      screen.getByRole('button', {
        name: `ขยายรายละเอียดบันทึก: ${getAuditActionLabel(log.action)}`,
      }),
    );

    const detail = document.getElementById('audit-log-detail-log-1') as HTMLElement;
    expect(within(detail).getByText('ก่อน')).toBeInTheDocument();
    expect(within(detail).getByText('หลัง')).toBeInTheDocument();
    expect(within(detail).getByText(/active/)).toBeInTheDocument();
    expect(within(detail).getByText(/suspended/)).toBeInTheDocument();
    expect(detail.textContent).toContain('keep-me');
    expect(within(detail).getByText('ผู้ทำรายการ')).toBeInTheDocument();
    expect(within(detail).getByText('รหัสคำขอ')).toBeInTheDocument();
  });

  it('renders pretty JSON only when metadata has no comparable pair', async () => {
    const user = userEvent.setup();
    const log = makeLog({ metadata: JSON.stringify({ reason: 'manual' }) });

    render(<AdminAuditLogsConsole items={[log]} isLoading={false} isFetching={false} />);

    await user.click(
      screen.getByRole('button', {
        name: `ขยายรายละเอียดบันทึก: ${getAuditActionLabel(log.action)}`,
      }),
    );

    const detail = document.getElementById('audit-log-detail-log-1') as HTMLElement;
    expect(within(detail).queryByText('ก่อน')).not.toBeInTheDocument();
    expect(within(detail).queryByText('หลัง')).not.toBeInTheDocument();
    expect(detail.textContent).toContain('"reason": "manual"');
  });

  it('shows raw metadata when JSON is malformed without treating it as a page error', async () => {
    const user = userEvent.setup();
    const log = makeLog({ metadata: '{not-json' });

    render(<AdminAuditLogsConsole items={[log]} isLoading={false} isFetching={false} />);

    await user.click(
      screen.getByRole('button', {
        name: `ขยายรายละเอียดบันทึก: ${getAuditActionLabel(log.action)}`,
      }),
    );

    const detail = document.getElementById('audit-log-detail-log-1') as HTMLElement;
    expect(detail.textContent).toContain('{not-json');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('opens overflow Dialog with exact Thai copy when pretty JSON exceeds 24 lines', async () => {
    const user = userEvent.setup();
    const log = makeLog({ metadata: overflowMetadataByLines(30) });

    render(<AdminAuditLogsConsole items={[log]} isLoading={false} isFetching={false} />);

    await user.click(
      screen.getByRole('button', {
        name: `ขยายรายละเอียดบันทึก: ${getAuditActionLabel(log.action)}`,
      }),
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'เปิดรายละเอียดทั้งหมด' }));

    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByText('รายละเอียดบันทึก')).toBeInTheDocument();
    expect(CONSOLE_SOURCE).not.toMatch(/\bSheet\b/);

    await user.click(within(dialog).getByRole('button', { name: 'ปิด' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', {
        name: `ย่อรายละเอียดบันทึก: ${getAuditActionLabel(log.action)}`,
      }),
    ).toHaveAttribute('aria-expanded', 'true');
  });

  it('shows overflow CTA when pretty JSON length is greater than 8192', async () => {
    const user = userEvent.setup();
    const log = makeLog({ id: 'log-long', metadata: overflowMetadataByLength() });

    render(<AdminAuditLogsConsole items={[log]} isLoading={false} isFetching={false} />);

    await user.click(
      screen.getByRole('button', {
        name: `ขยายรายละเอียดบันทึก: ${getAuditActionLabel(log.action)}`,
      }),
    );

    expect(screen.getByRole('button', { name: 'เปิดรายละเอียดทั้งหมด' })).toBeInTheDocument();
  });

  it('shows loading skeletons and empty copy without inventing rows', () => {
    const { rerender } = render(<AdminAuditLogsConsole items={[]} isLoading isFetching />);

    expect(screen.getByLabelText('กำลังโหลดบันทึกการใช้งาน')).toHaveAttribute('aria-busy', 'true');
    expect(screen.queryByText('ไม่พบบันทึกการใช้งาน')).not.toBeInTheDocument();

    rerender(<AdminAuditLogsConsole items={[]} isLoading={false} isFetching={false} />);
    expect(screen.getByText('ไม่พบบันทึกการใช้งาน')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /ขยายรายละเอียดบันทึก/ })).not.toBeInTheDocument();
  });

  it('expands the focused native row button on Enter', async () => {
    const user = userEvent.setup();
    const log = makeLog();
    render(<AdminAuditLogsConsole items={[log]} isLoading={false} isFetching={false} />);

    const expand = screen.getByRole('button', {
      name: `ขยายรายละเอียดบันทึก: ${getAuditActionLabel(log.action)}`,
    });
    expand.focus();
    await user.keyboard('{Enter}');

    expect(
      screen.getByRole('button', {
        name: `ย่อรายละเอียดบันทึก: ${getAuditActionLabel(log.action)}`,
      }),
    ).toHaveAttribute('aria-expanded', 'true');
  });

  it('applies quiet-fetch opacity while refetching cached rows', () => {
    render(<AdminAuditLogsConsole items={[makeLog()]} isLoading={false} isFetching />);

    const region = screen.getByRole('region', { name: 'บันทึกการใช้งาน' });
    expect(region.className).toContain('opacity-80');
    expect(region).toHaveAttribute('aria-busy', 'true');
  });
});
