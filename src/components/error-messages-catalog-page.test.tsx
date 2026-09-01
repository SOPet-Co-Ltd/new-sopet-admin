import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ErrorMessagesCatalogPage } from './error-messages-catalog-page';
import { ERROR_CATALOG } from '@/lib/api/error-messages';

vi.mock('@/hooks/useTheme', () => ({
  useTheme: vi.fn(),
}));

import { useTheme } from '@/hooks/useTheme';

const mockedUseTheme = vi.mocked(useTheme);

describe('ErrorMessagesCatalogPage', () => {
  beforeEach(() => {
    mockedUseTheme.mockReturnValue({
      theme: 'light',
      mounted: true,
      toggleTheme: vi.fn(),
      isDark: false,
      setTheme: vi.fn(),
      systemTheme: 'light',
      storedTheme: null,
    });
  });

  it('renders title, sticky search, and total catalog count', () => {
    render(<ErrorMessagesCatalogPage />);

    expect(screen.getByRole('heading', { level: 1, name: 'รหัสข้อผิดพลาด' })).toBeInTheDocument();
    expect(
      screen.getByRole('searchbox', { name: 'ค้นหารหัสหรือข้อความข้อผิดพลาด' }),
    ).toBeInTheDocument();
    expect(screen.getByText(`${ERROR_CATALOG.length} รหัสทั้งหมด`)).toBeInTheDocument();
  });

  it('renders theme toggle in the page header using shared dashboard control', () => {
    render(<ErrorMessagesCatalogPage />);

    expect(screen.getByRole('button', { name: 'เปลี่ยนเป็นโหมดมืด' })).toBeInTheDocument();
  });

  it('renders a full-bleed sticky toolbar with controls aligned to the content column', () => {
    render(<ErrorMessagesCatalogPage />);

    const toolbar = screen.getByTestId('error-catalog-sticky-toolbar');
    expect(toolbar.className).toMatch(/\bsticky\b/);
    expect(toolbar.className).not.toMatch(/max-w-5xl/);
    expect(toolbar.className).not.toMatch(/-mx-/);

    const inner = toolbar.firstElementChild;
    expect(inner).toBeTruthy();
    expect(inner!.className).toMatch(/max-w-5xl/);
    expect(inner).toContainElement(
      screen.getByRole('searchbox', { name: 'ค้นหารหัสหรือข้อความข้อผิดพลาด' }),
    );
  });

  it('styles selected group chips with brand colors instead of ink fill', () => {
    render(<ErrorMessagesCatalogPage />);

    const allChip = screen.getByRole('tab', { name: /ทั้งหมด/ });
    expect(allChip).toHaveAttribute('aria-selected', 'true');
    expect(allChip.className).toMatch(/bg-brand-tint/);
    expect(allChip.className).toMatch(/text-brand/);
    expect(allChip.className).toMatch(/border-brand/);
    expect(allChip.className).not.toMatch(/bg-ink/);
    expect(allChip.className).not.toMatch(/text-white/);
  });

  it('shows group filter chips including all and short group labels', () => {
    render(<ErrorMessagesCatalogPage />);

    const tablist = screen.getByRole('tablist', { name: 'กรองตามกลุ่ม' });
    expect(within(tablist).getByRole('tab', { name: /ทั้งหมด/ })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(within(tablist).getByRole('tab', { name: /ทั่วไป/ })).toBeInTheDocument();
    expect(within(tablist).getByRole('tab', { name: /สิทธิ์/ })).toBeInTheDocument();
  });

  it('keeps long codes and group chips from forcing page-level overflow', () => {
    render(<ErrorMessagesCatalogPage />);

    const filters = screen.getByTestId('error-catalog-group-filters');
    expect(filters.className).toMatch(/min-w-0/);
    expect(filters.className).toMatch(/overflow-x-auto/);
    expect(filters.className).toMatch(/scrollbar-none/);
    expect(filters.className).toMatch(/::-webkit-scrollbar\]:hidden/);
    expect(filters.className).not.toMatch(/\bflex\b/);

    const longCode = ERROR_CATALOG.reduce((a, b) => (a.code.length >= b.code.length ? a : b)).code;
    const codeEl = screen.getByText(longCode);
    expect(codeEl.tagName).toBe('CODE');
    expect(codeEl.className).toMatch(/break-all/);
    expect(codeEl.className).toMatch(/max-w-full/);
  });

  it('filters by search query and updates result count', async () => {
    const user = userEvent.setup();
    render(<ErrorMessagesCatalogPage />);

    await user.type(
      screen.getByRole('searchbox', { name: 'ค้นหารหัสหรือข้อความข้อผิดพลาด' }),
      'FORBIDDEN',
    );

    expect(screen.getByText(/พบ \d+ รายการจาก/).className).toMatch(/text-brand/);
    expect(screen.getByText('FORBIDDEN')).toBeInTheDocument();
    expect(screen.queryByText('UNKNOWN_ERROR')).not.toBeInTheDocument();
  });

  it('filters to a single group when a chip is selected', async () => {
    const user = userEvent.setup();
    render(<ErrorMessagesCatalogPage />);

    await user.click(screen.getByRole('tab', { name: /อีเมล \/ รีวิว/ }));

    const emailChip = screen.getByRole('tab', { name: /อีเมล \/ รีวิว/ });
    expect(emailChip).toHaveAttribute('aria-selected', 'true');
    expect(emailChip.className).toMatch(/bg-brand-tint/);
    expect(emailChip.className).toMatch(/text-brand/);
    expect(screen.getByText(/พบ \d+ รายการจาก/).className).toMatch(/text-brand/);
    expect(screen.getByRole('heading', { name: 'อีเมล CMS / รีวิว' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'ทั่วไป / ระบบ' })).not.toBeInTheDocument();
  });

  it('shows empty state and clears filters', async () => {
    const user = userEvent.setup();
    render(<ErrorMessagesCatalogPage />);

    await user.type(
      screen.getByRole('searchbox', { name: 'ค้นหารหัสหรือข้อความข้อผิดพลาด' }),
      'zzz-no-such-error-code',
    );

    expect(screen.getByText(/ไม่พบรหัสที่ตรงกับ/)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'ล้างการค้นหาและตัวกรอง' }));

    expect(screen.getByRole('searchbox')).toHaveValue('');
    expect(screen.getByText(`${ERROR_CATALOG.length} รหัสทั้งหมด`)).toBeInTheDocument();
  });

  it('keeps undocumented codes non-expandable and hides doc prose by default', () => {
    render(<ErrorMessagesCatalogPage />);

    const obscure = ERROR_CATALOG.find(
      (entry) =>
        entry.code === 'INVALID_WEBHOOK_EVENT' ||
        (!entry.why && !entry.possibleIssue && !entry.howToFix),
    );
    expect(obscure).toBeTruthy();

    const codeEl = screen.getByText(obscure!.code);
    expect(codeEl.closest('button')).toBeNull();
    expect(screen.queryByText('สาเหตุ')).not.toBeInTheDocument();
  });

  it('expands documented entries to reveal why / fix fields', async () => {
    const user = userEvent.setup();
    const documented = ERROR_CATALOG.find((entry) => entry.code === 'FORBIDDEN');
    expect(documented?.why).toBeTruthy();

    render(<ErrorMessagesCatalogPage />);

    await user.type(
      screen.getByRole('searchbox', { name: 'ค้นหารหัสหรือข้อความข้อผิดพลาด' }),
      'คุณไม่มีสิทธิ์เข้าถึงส่วนนี้',
    );

    const expand = screen.getByRole('button', { name: 'ขยายคำอธิบาย: FORBIDDEN' });
    expect(expand).toHaveAttribute('aria-expanded', 'false');
    expect(expand).toHaveTextContent('มีคำอธิบาย');
    expect(screen.queryByText(documented!.why!)).not.toBeInTheDocument();

    await user.click(expand);

    expect(screen.getByRole('button', { name: 'ย่อคำอธิบาย: FORBIDDEN' })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
    expect(screen.getByText('สาเหตุ')).toBeInTheDocument();
    expect(screen.getByText(documented!.why!)).toBeInTheDocument();
    if (documented?.howToFix) {
      expect(screen.getByText('วิธีแก้ไข')).toBeInTheDocument();
      expect(screen.getByText(documented.howToFix)).toBeInTheDocument();
    }
  });

  it('collapses a group section when its header is toggled', async () => {
    const user = userEvent.setup();
    render(<ErrorMessagesCatalogPage />);

    const groupHeading = screen.getByRole('button', { name: /ทั่วไป \/ ระบบ/ });
    expect(groupHeading).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('UNKNOWN_ERROR')).toBeInTheDocument();

    await user.click(groupHeading);

    expect(groupHeading).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByText('UNKNOWN_ERROR')).not.toBeInTheDocument();
  });
});
