import { Card, CardBody } from '@/components/ui/card';
import { StarRating } from '@/components/ui/star-rating';
import type { StoreReviewSummary } from '@/types';
import { RatingDistributionChart } from './rating-distribution-chart';
import { StatCard } from './stat-card';

type VendorReviewSummarySectionProps = {
  summary: StoreReviewSummary;
};

export function VendorReviewSummarySection({ summary }: VendorReviewSummarySectionProps) {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <div className="grid gap-4 sm:grid-cols-2 lg:col-span-2">
        <StatCard label="คะแนนเฉลี่ย" value={summary.averageRating.toFixed(1)} />
        <StatCard label="จำนวนรีวิว" value={summary.reviewCount} />
      </div>
      <Card className="lg:col-span-1">
        <CardBody>
          <p className="mb-3 text-sm font-medium text-ink">การกระจายคะแนน</p>
          <RatingDistributionChart summary={summary} />
          <div className="mt-3">
            <StarRating rating={Math.round(summary.averageRating)} />
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
