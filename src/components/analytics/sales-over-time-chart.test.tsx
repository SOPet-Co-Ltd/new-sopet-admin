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

    expect(screen.getByText('ยังไม่มีข้อมูลในช่วงเวลานี้')).toBeInTheDocument();
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

    const bars = container.querySelectorAll('.bg-brand');
    expect(bars).toHaveLength(2);
    expect((bars[1] as HTMLElement).style.height).toBe('100%');
  });
});
