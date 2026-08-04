import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { NotFoundFallback } from './not-found-fallback';

const OUTER_SHELL = 'flex min-h-[50vh] flex-col items-center justify-center gap-4 px-6 text-center';
const TITLE_CLASSES = 'font-display text-2xl text-ink';
const MESSAGE_CLASSES = 'mt-2 max-w-md text-muted';

describe('NotFoundFallback', () => {
  it('shows Thai default title ไม่พบหน้า and message หน้าที่คุณต้องการไม่มีอยู่ในระบบ (AC-003/008)', () => {
    render(<NotFoundFallback />);

    expect(screen.getByRole('heading', { level: 2, name: 'ไม่พบหน้า' })).toBeInTheDocument();
    expect(screen.getByText('หน้าที่คุณต้องการไม่มีอยู่ในระบบ')).toBeInTheDocument();
    expect(screen.queryByText('ไม่พบข้อมูลที่ต้องการ')).not.toBeInTheDocument();
  });

  it('always renders Home CTA link with accessible name and href="/" (AC-004/008)', () => {
    render(<NotFoundFallback />);

    const link = screen.getByRole('link', { name: 'กลับหน้าหลัก' });
    expect(link).toHaveAttribute('href', '/');
  });

  it('keeps Home CTA when title and message are overridden', () => {
    render(<NotFoundFallback title="หน้าหาย" message="ลองเส้นทางอื่น" />);

    expect(screen.getByRole('heading', { level: 2, name: 'หน้าหาย' })).toBeInTheDocument();
    expect(screen.getByText('ลองเส้นทางอื่น')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'กลับหน้าหลัก' })).toHaveAttribute('href', '/');
  });

  it('uses ErrorFallback shell classes on outer, title, and message (AC-006)', () => {
    const { container } = render(<NotFoundFallback />);

    const outer = container.firstElementChild;
    expect(outer).toHaveClass(...OUTER_SHELL.split(' '));
    expect(screen.getByRole('heading', { level: 2 })).toHaveClass(...TITLE_CLASSES.split(' '));
    expect(screen.getByText('หน้าที่คุณต้องการไม่มีอยู่ในระบบ')).toHaveClass(
      ...MESSAGE_CLASSES.split(' '),
    );
  });

  it('resets to Thai defaults and CTA on remount without props', () => {
    const { unmount } = render(<NotFoundFallback title="หน้าหาย" message="ลองเส้นทางอื่น" />);
    expect(screen.getByRole('heading', { level: 2, name: 'หน้าหาย' })).toBeInTheDocument();

    unmount();
    render(<NotFoundFallback />);

    expect(screen.getByRole('heading', { level: 2, name: 'ไม่พบหน้า' })).toBeInTheDocument();
    expect(screen.getByText('หน้าที่คุณต้องการไม่มีอยู่ในระบบ')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'กลับหน้าหลัก' })).toHaveAttribute('href', '/');
  });
});
