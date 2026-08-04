import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SalesOverTimeChart } from './sales-over-time-chart';

describe('SalesOverTimeChart', () => {
  it('shows empty state when all points have zero revenue', () => {
    render(
      <SalesOverTimeChart
        data={[
          { date: '2026-07-09', revenue: 0, orderCount: 0 },
          { date: '2026-07-10', revenue: 0, orderCount: 0 },
        ]}
      />,
    );

    expect(screen.getByText(/ยังไม่มียอดขายในช่วง 30 วันล่าสุด/)).toBeInTheDocument();
  });

  it('renders visible bars for non-zero revenue points', () => {
    const { container } = render(
      <SalesOverTimeChart
        data={[
          { date: '2026-07-09', revenue: 0, orderCount: 0 },
          { date: '2026-07-10', revenue: 370, orderCount: 1 },
        ]}
      />,
    );

    const bars = container.querySelectorAll('.bg-tertiary');
    expect(bars).toHaveLength(2);
    // Max bar height is capped below 100% to leave headroom for its value label (row 44 fix).
    expect((bars[1] as HTMLElement).style.height).toBe('88%');
  });

  it('shows a formatted currency value label above each bar (row 44 regression)', () => {
    render(
      <SalesOverTimeChart
        data={[
          { date: '2026-07-09', revenue: 0, orderCount: 0 },
          { date: '2026-07-10', revenue: 370, orderCount: 1 },
          { date: '2026-07-11', revenue: 15000, orderCount: 4 },
        ]}
      />,
    );

    // Previously the chart showed only bars/dates - no number was ever visible in the DOM.
    expect(screen.getByText('฿370')).toBeInTheDocument();
    expect(screen.getByText('฿15K')).toBeInTheDocument();
  });

  it('thins value labels (same cadence as date labels) for long ranges to avoid overlap', () => {
    const points = Array.from({ length: 30 }, (_, index) => ({
      date: `2026-06-${String(index + 1).padStart(2, '0')}`,
      revenue: 100 + index,
      orderCount: 1,
    }));

    render(<SalesOverTimeChart data={points} />);

    // showEveryNth = ceil(30/7) = 5 for >14 points, so not every single bar gets a visible label.
    expect(screen.getByText('฿100')).toBeInTheDocument();
    expect(screen.queryByText('฿101')).not.toBeInTheDocument();
  });

  it('wraps the chart in a horizontally scrollable region with a min width', () => {
    const points = Array.from({ length: 30 }, (_, index) => {
      const day = String(index + 1).padStart(2, '0');
      return {
        date: `2026-06-${day}`,
        revenue: index === 15 ? 500 : 0,
        orderCount: index === 15 ? 1 : 0,
      };
    });

    const { container } = render(<SalesOverTimeChart data={points} />);
    const scroller = screen.getByRole('region', { name: 'กราฟยอดขายตามเวลา' });
    const inner = scroller.firstElementChild as HTMLElement | null;

    expect(scroller).toHaveClass('overflow-x-auto');
    expect(inner?.style.minWidth).toBe('600px');
    expect(container.querySelectorAll('.bg-tertiary')).toHaveLength(30);
  });
});
