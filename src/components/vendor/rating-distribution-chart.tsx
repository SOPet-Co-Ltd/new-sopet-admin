import type { StoreReviewSummary } from '@/types';

type RatingDistributionChartProps = {
  summary: Pick<
    StoreReviewSummary,
    | 'reviewCount'
    | 'rating5Count'
    | 'rating4Count'
    | 'rating3Count'
    | 'rating2Count'
    | 'rating1Count'
  >;
};

const RATING_LEVELS = [5, 4, 3, 2, 1] as const;

export function RatingDistributionChart({ summary }: RatingDistributionChartProps) {
  const counts: Record<number, number> = {
    5: summary.rating5Count,
    4: summary.rating4Count,
    3: summary.rating3Count,
    2: summary.rating2Count,
    1: summary.rating1Count,
  };

  return (
    <div className="space-y-2" aria-label="การกระจายคะแนนรีวิว">
      {RATING_LEVELS.map((level) => {
        const count = counts[level];
        const widthPercent = summary.reviewCount > 0 ? (count / summary.reviewCount) * 100 : 0;

        return (
          <div key={level} className="flex items-center gap-3 text-sm">
            <span className="w-12 shrink-0 text-muted">{level} ดาว</span>
            <div className="h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-surface">
              <div
                className="h-full rounded-full bg-brand-tint"
                style={{ width: `${widthPercent}%` }}
              />
            </div>
            <span className="w-8 shrink-0 text-right text-muted">{count}</span>
          </div>
        );
      })}
    </div>
  );
}
