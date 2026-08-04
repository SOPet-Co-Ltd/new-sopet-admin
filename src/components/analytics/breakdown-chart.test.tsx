import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { BreakdownChart } from './breakdown-chart';

describe('BreakdownChart', () => {
  it('shows empty state when there is no data', () => {
    render(<BreakdownChart data={[]} />);

    expect(screen.getByText(/ยังไม่มีข้อมูลในหมวดนี้/)).toBeInTheDocument();
  });

  it('renders coral progress bars for breakdown items', () => {
    const { container } = render(
      <BreakdownChart
        data={[
          { label: 'PromptPay', revenue: 500, orderCount: 2 },
          { label: 'Credit Card', revenue: 250, orderCount: 1 },
        ]}
      />,
    );

    const bars = container.querySelectorAll('.bg-secondary');
    expect(bars).toHaveLength(2);
    expect((bars[0] as HTMLElement).style.width).toBe('100%');
  });
});
