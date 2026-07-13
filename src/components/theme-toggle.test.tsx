import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ThemeToggle } from './theme-toggle';

vi.mock('@/hooks/useTheme', () => ({
  useTheme: vi.fn(),
}));

import { useTheme } from '@/hooks/useTheme';

const mockedUseTheme = vi.mocked(useTheme);

describe('ThemeToggle', () => {
  it('shows moon icon in light mode with Thai aria label', () => {
    mockedUseTheme.mockReturnValue({
      theme: 'light',
      mounted: true,
      toggleTheme: vi.fn(),
      isDark: false,
      setTheme: vi.fn(),
      systemTheme: 'light',
      storedTheme: null,
    });

    render(<ThemeToggle />);

    expect(screen.getByRole('button', { name: 'เปลี่ยนเป็นโหมดมืด' })).toBeInTheDocument();
  });

  it('calls toggleTheme when clicked', async () => {
    const toggleTheme = vi.fn();
    mockedUseTheme.mockReturnValue({
      theme: 'dark',
      mounted: true,
      toggleTheme,
      isDark: true,
      setTheme: vi.fn(),
      systemTheme: 'dark',
      storedTheme: 'dark',
    });

    render(<ThemeToggle />);
    await userEvent.click(screen.getByRole('button', { name: 'เปลี่ยนเป็นโหมดสว่าง' }));

    expect(toggleTheme).toHaveBeenCalledOnce();
  });

  it('renders labeled variant with current mode text', () => {
    mockedUseTheme.mockReturnValue({
      theme: 'light',
      mounted: true,
      toggleTheme: vi.fn(),
      isDark: false,
      setTheme: vi.fn(),
      systemTheme: 'light',
      storedTheme: null,
    });

    render(<ThemeToggle variant="labeled" />);

    expect(screen.getByText('โหมดสว่าง')).toBeInTheDocument();
    expect(screen.getByText('สลับ')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'เปลี่ยนเป็นโหมดมืด' })).toBeInTheDocument();
  });
});
