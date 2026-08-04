import { Card, CardBody } from '@/components/ui/card';
import { StarRating } from '@/components/ui/star-rating';
import type { StoreReviewSummary } from '@/types';
import { RatingDistributionChart } from './rating-distribution-chart';

type VendorReviewSummarySectionProps = {
  summary: StoreReviewSummary;
};

export function VendorReviewSummarySection({ summary }: VendorReviewSummarySectionProps) {
  const average = summary.averageRating.toFixed(1);

  return (
    <div className="grid gap-4 lg:grid-cols-5">
      <Card className="lg:col-span-2">
        <CardBody className="flex h-full flex-col justify-center">
          <p className="text-sm text-muted-foreground">คะแนนเฉลี่ยร้าน</p>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <p className="text-2xl font-semibold tabular-nums text-ink">{average}</p>
            <StarRating rating={Math.round(summary.averageRating)} />
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            จาก {summary.reviewCount.toLocaleString('th-TH')} รีวิว
          </p>
        </CardBody>
      </Card>
      <Card className="lg:col-span-3">
        <CardBody>
          <p className="mb-3 text-sm font-medium text-ink">การกระจายคะแนน</p>
          <RatingDistributionChart summary={summary} />
        </CardBody>
      </Card>
    </div>
  );
}
