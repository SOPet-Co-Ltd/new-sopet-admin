import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import AdminSearchAnalyticsPage from './page';

const topQueries = Array.from({ length: 10 }, (_, index) => ({
  query: `query-${index + 1}`,
  searchCount: 30 - index,
  avgResultCount: 2,
}));

const suggestionCtr = Array.from({ length: 16 }, (_, index) => ({
  prefixBucket: `p${index + 1}`,
  impressions: 20 - index,
  clicks: 0,
  ctr: 0,
}));

vi.mock('@/hooks/useSearchAdmin', () => ({
  useSearchAnalyticsSummary: () => ({
    data: {
      totalSearches: 120,
      uniqueQueries: 45,
      zeroResultRate: 0.12,
      avgResultsPerQuery: 8.4,
      avgLatencyMs: 32,
    },
    isLoading: false,
    error: null,
  }),
  useSearchAnalyticsTopQueries: () => ({
    data: topQueries,
    isLoading: false,
    isFetching: false,
    error: null,
  }),
  useSearchAnalyticsZeroResultQueries: () => ({
    data: [{ query: 'xyzabc', searchCount: 5, avgResultCount: 0 }],
    isLoading: false,
    isFetching: false,
    error: null,
  }),
  useSearchAnalyticsSuggestionCtr: () => ({
    data: suggestionCtr,
    isLoading: false,
    error: null,
  }),
  useExportSearchAnalyticsCsv: () => ({
    isPending: false,
    mutateAsync: vi.fn().mockResolvedValue('\uFEFFquery,result_count\n'),
  }),
}));

describe('AdminSearchAnalyticsPage', () => {
  it('renders seven-day KPI cards and analytics tables', () => {
    render(<AdminSearchAnalyticsPage />);

    expect(screen.getByText('วิเคราะห์การค้นหา')).toBeInTheDocument();
    expect(screen.getByText('การค้นหาทั้งหมด')).toBeInTheDocument();
    expect(screen.getByText('120')).toBeInTheDocument();
    expect(screen.getByText('คำค้นหายอดนิยม')).toBeInTheDocument();
    expect(screen.getByText('query-1')).toBeInTheDocument();
    expect(screen.getByText('ส่งออก CSV')).toBeInTheDocument();
    expect(screen.getByText('เวลาตอบสนองเฉลี่ย')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /จัดการคำพ้องความหมาย/ })).toHaveAttribute(
      'href',
      '/admin/search/synonyms',
    );
  });

  it('shows only the first page of ranked rows and expands CTR on demand', async () => {
    const user = userEvent.setup();
    render(<AdminSearchAnalyticsPage />);

    expect(screen.getByText('query-10')).toBeInTheDocument();
    expect(screen.getByText('p10')).toBeInTheDocument();
    expect(screen.queryByText('p11')).not.toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: 'ดูเพิ่ม' }).length).toBeGreaterThanOrEqual(2);

    const expandButtons = screen.getAllByRole('button', { name: 'ดูเพิ่ม' });
    await user.click(expandButtons[expandButtons.length - 1]);

    expect(screen.getByText('p11')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'แสดงน้อยลง' })).toBeInTheDocument();
  });
});
