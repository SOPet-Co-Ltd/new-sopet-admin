import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { SearchRankingWeightForm } from '@/components/admin/search/SearchRankingWeightForm';

const defaultWeights = {
  text: 40,
  prefixBoost: 15,
  soldCount: 20,
  averageRating: 15,
  reviewCount: 10,
  personalizationCap: 0.1,
  trigramFallbackThreshold: 5,
  trigramMinSimilarity: 0.3,
  rrfK: 60,
};

describe('SearchRankingWeightForm', () => {
  it('loads default weights into the form', () => {
    render(<SearchRankingWeightForm initialWeights={defaultWeights} onSubmit={vi.fn()} />);

    expect(screen.getByLabelText('Text relevance')).toHaveValue(40);
    expect(screen.getByLabelText('Personalization cap (0–0.20)')).toHaveValue(0.1);
  });

  it('shows validation error for out-of-range personalization cap', async () => {
    const user = userEvent.setup();
    render(<SearchRankingWeightForm initialWeights={defaultWeights} onSubmit={vi.fn()} />);

    await user.clear(screen.getByLabelText('Personalization cap (0–0.20)'));
    await user.type(screen.getByLabelText('Personalization cap (0–0.20)'), '0.5');
    await user.click(screen.getByRole('button', { name: 'บันทึก' }));

    expect(await screen.findByText('ค่าต้องอยู่ระหว่าง 0 ถึง 0.20')).toBeInTheDocument();
  });

  it('submits valid payload', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined);

    render(<SearchRankingWeightForm initialWeights={defaultWeights} onSubmit={onSubmit} />);

    await user.clear(screen.getByLabelText('Text relevance'));
    await user.type(screen.getByLabelText('Text relevance'), '50');
    await user.click(screen.getByRole('button', { name: 'บันทึก' }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          text: 50,
        }),
      );
    });
  });
});
