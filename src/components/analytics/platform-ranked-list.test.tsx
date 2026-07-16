import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { PlatformRankedList } from './platform-ranked-list';

describe('PlatformRankedList', () => {
  it('shows skeleton while loading', () => {
    render(<PlatformRankedList loading items={[]} />);

    expect(screen.getByLabelText('กำลังโหลดรายการ')).toHaveAttribute('aria-busy', 'true');
  });

  it('shows empty state when there are no items', () => {
    render(<PlatformRankedList items={[]} />);

    expect(screen.getByText('ยังไม่มีข้อมูลในช่วงเวลานี้')).toBeInTheDocument();
  });

  it('renders neutral rank badges instead of brand purple', () => {
    const { container } = render(
      <PlatformRankedList
        items={[
          {
            key: '1',
            primary: <span>Product A</span>,
            secondary: <span>10 ชิ้น</span>,
          },
        ]}
      />,
    );

    expect(container.querySelector('.bg-brand')).toBeNull();
    expect(container.querySelector('.bg-surface')).toBeTruthy();
    expect(screen.getByText('Product A')).toBeInTheDocument();
  });
});
