import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('next/navigation', () => ({
  usePathname: () => '/guide/vendor/orders',
}));

vi.mock('@/components/theme-toggle', () => ({
  ThemeToggle: () => <button type="button">theme</button>,
}));

import { GuideShell } from './guide-shell';

describe('GuideShell', () => {
  it('renders public official guide chrome with role switcher', () => {
    render(
      <GuideShell>
        <div>content</div>
      </GuideShell>,
    );

    expect(screen.getByRole('link', { name: /SOPet/ })).toHaveAttribute('href', '/guide');
    expect(screen.getByRole('navigation', { name: 'เลือกคู่มือ' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'ผู้ขาย' })).toHaveAttribute('href', '/guide/vendor');
    expect(screen.getByRole('link', { name: 'ผู้ดูแล' })).toHaveAttribute('href', '/guide/admin');
    expect(screen.getByRole('link', { name: /เข้าสู่ระบบ/ })).toHaveAttribute('href', '/login');
  });
});
