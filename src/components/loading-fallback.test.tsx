import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { LoadingFallback } from './loading-fallback';

const OUTER_SHELL = 'flex min-h-[50vh] flex-col items-center justify-center gap-4 px-6 text-center';
const TITLE_CLASSES = 'font-display text-2xl text-ink';
const MESSAGE_CLASSES = 'mt-2 max-w-md text-muted';

describe('LoadingFallback', () => {
  it('shows Thai default title กำลังโหลด...', () => {
    render(<LoadingFallback />);

    expect(screen.getByRole('heading', { level: 2, name: 'กำลังโหลด...' })).toBeInTheDocument();
  });

  it('renders title-only by default with no message paragraph (AC-002)', () => {
    const { container } = render(<LoadingFallback />);

    expect(container.querySelector('p')).toBeNull();
    expect(screen.queryByText('ไม่พบข้อมูลที่ต้องการ')).not.toBeInTheDocument();
  });

  it('has no button or link CTA by default', () => {
    render(<LoadingFallback />);

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('renders message paragraph when message is provided', () => {
    render(<LoadingFallback message="กำลังดึงข้อมูลร้านค้า" />);

    const message = screen.getByText('กำลังดึงข้อมูลร้านค้า');
    expect(message.tagName).toBe('P');
    expect(message).toHaveClass(...MESSAGE_CLASSES.split(' '));
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('omits message paragraph when message is empty string', () => {
    const { container } = render(<LoadingFallback message="" />);

    expect(container.querySelector('p')).toBeNull();
  });

  it('uses ErrorFallback shell classes on outer and title', () => {
    const { container } = render(<LoadingFallback />);

    const outer = container.firstElementChild;
    expect(outer).toHaveClass(...OUTER_SHELL.split(' '));
    expect(screen.getByRole('heading', { level: 2 })).toHaveClass(...TITLE_CLASSES.split(' '));
  });

  it('has no aria-live or role=status for MVP (TBD-02 omitted)', () => {
    const { container } = render(<LoadingFallback />);

    expect(container.querySelector('[aria-live]')).toBeNull();
    expect(container.querySelector('[role="status"]')).toBeNull();
  });

  it('resets to default title on remount without props', () => {
    const { unmount } = render(<LoadingFallback title="กำลังเตรียมข้อมูล..." />);
    expect(
      screen.getByRole('heading', { level: 2, name: 'กำลังเตรียมข้อมูล...' }),
    ).toBeInTheDocument();

    unmount();
    render(<LoadingFallback />);

    expect(screen.getByRole('heading', { level: 2, name: 'กำลังโหลด...' })).toBeInTheDocument();
  });
});
