import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Badge } from './badge';

describe('Badge', () => {
  it('sizes to content and resists flex shrinking', () => {
    render(<Badge>เปิดใช้งาน</Badge>);

    const badge = screen.getByTestId('badge');
    expect(badge).toHaveTextContent('เปิดใช้งาน');
    expect(badge).toHaveClass('w-fit');
    expect(badge).toHaveClass('shrink-0');
    expect(badge).toHaveClass('whitespace-nowrap');
  });

  it('applies published status styles', () => {
    render(<Badge status="published">เปิดใช้งาน</Badge>);

    const badge = screen.getByTestId('badge');
    expect(badge).toHaveClass('bg-success-bg');
    expect(badge).toHaveClass('text-success');
  });

  it('applies draft status styles', () => {
    render(<Badge status="draft">ปิดใช้งาน</Badge>);

    const badge = screen.getByTestId('badge');
    expect(badge).toHaveClass('bg-surface');
    expect(badge).toHaveClass('text-muted-foreground');
    expect(badge).toHaveClass('border');
    expect(badge).toHaveClass('border-border');
  });

  it('merges custom className overrides', () => {
    render(
      <Badge className="bg-danger/10 text-danger" status="published">
        ถูกระงับ
      </Badge>,
    );

    const badge = screen.getByTestId('badge');
    expect(badge).toHaveClass('bg-danger/10');
    expect(badge).toHaveClass('text-danger');
  });
});
