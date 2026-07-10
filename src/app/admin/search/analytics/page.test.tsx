import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import AdminSearchAnalyticsPage from './page';

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
    data: [{ query: 'dog food', searchCount: 20, avgResultCount: 10 }],
    isLoading: false,
    error: null,
  }),
  useSearchAnalyticsZeroResultQueries: () => ({
    data: [{ query: 'xyzabc', searchCount: 5, avgResultCount: 0 }],
    isLoading: false,
    error: null,
  }),
  useSearchAnalyticsSuggestionCtr: () => ({
    data: [{ prefixBucket: 'do', impressions: 40, clicks: 8, ctr: 0.2 }],
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
    expect(screen.getByText('dog food')).toBeInTheDocument();
    expect(screen.getByText('ส่งออก CSV')).toBeInTheDocument();
  });
});
