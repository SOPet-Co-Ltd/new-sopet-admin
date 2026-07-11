import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, within } from '@testing-library/react';
import { type ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { RejectedTaxonomySection } from './rejected-taxonomy-section';
import type { TaxonomyItem } from '@/types';

vi.mock('@/components/admin/taxonomy/taxonomy-delete-button', () => ({
  TaxonomyDeleteButton: () => <button type="button">ลบ</button>,
}));

const rejectedCategories: TaxonomyItem[] = [
  {
    id: 'cat-rejected-1',
    name: 'หมวดที่ปฏิเสธ A',
    slug: 'rejected-a',
    status: 'rejected',
  },
  {
    id: 'cat-rejected-2',
    name: 'หมวดที่ปฏิเสธ B',
    slug: 'rejected-b',
    status: 'rejected',
  },
];

const rejectedTags: TaxonomyItem[] = [
  {
    id: 'tag-rejected-1',
    name: 'แท็กที่ปฏิเสธ',
    slug: 'rejected-tag',
    status: 'rejected',
  },
];

function renderWithQueryClient(ui: ReactNode) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

describe('search taxonomy rejected integration', () => {
  it('renders rejected categories with status label and delete action (AC-029)', () => {
    renderWithQueryClient(<RejectedTaxonomySection kind="category" items={rejectedCategories} />);

    expect(screen.getByRole('heading', { name: 'หมวดหมู่ที่ปฏิเสธแล้ว' })).toBeInTheDocument();
    expect(screen.getByText('หมวดที่ปฏิเสธ A')).toBeInTheDocument();
    expect(screen.getByText('หมวดที่ปฏิเสธ B')).toBeInTheDocument();
    const rows = screen.getAllByRole('listitem');
    expect(rows).toHaveLength(2);
    rows.forEach((row) => {
      expect(within(row).getByText(/ปฏิเสธแล้ว/)).toBeInTheDocument();
    });
    expect(screen.getAllByRole('button', { name: 'ลบ' })).toHaveLength(2);
    expect(screen.queryByRole('button', { name: 'อนุมัติ' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'ปฏิเสธ' })).not.toBeInTheDocument();
  });

  it('renders rejected tags section (AC-029)', () => {
    renderWithQueryClient(<RejectedTaxonomySection kind="tag" items={rejectedTags} />);

    expect(screen.getByRole('heading', { name: 'แท็กที่ปฏิเสธแล้ว' })).toBeInTheDocument();
    expect(screen.getByText('แท็กที่ปฏิเสธ')).toBeInTheDocument();
    expect(within(screen.getByRole('listitem')).getByText(/ปฏิเสธแล้ว/)).toBeInTheDocument();
  });

  it('shows empty copy for empty rejected lists without error (AC-030)', () => {
    const { rerender } = renderWithQueryClient(
      <RejectedTaxonomySection kind="category" items={[]} />,
    );

    expect(screen.getByText('ไม่มีหมวดหมู่ที่ปฏิเสธ')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();

    rerender(
      <QueryClientProvider
        client={
          new QueryClient({
            defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
          })
        }
      >
        <RejectedTaxonomySection kind="tag" items={[]} />
      </QueryClientProvider>,
    );

    expect(screen.getByText('ไม่มีแท็กที่ปฏิเสธ')).toBeInTheDocument();
  });

  it('shows loading and error states gracefully', () => {
    const { rerender } = renderWithQueryClient(
      <RejectedTaxonomySection kind="category" items={[]} isLoading />,
    );
    expect(screen.getByText('กำลังโหลด...')).toBeInTheDocument();

    rerender(
      <QueryClientProvider
        client={
          new QueryClient({
            defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
          })
        }
      >
        <RejectedTaxonomySection
          kind="category"
          items={[]}
          error={new Error('GraphQL unavailable')}
        />
      </QueryClientProvider>,
    );

    expect(screen.getByRole('alert')).toHaveTextContent('โหลดหมวดหมู่ที่ปฏิเสธไม่สำเร็จ');
  });
});
