import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { StarRating } from '@/components/ui/star-rating';
import type { StoreReviewSummary } from '@/types';
import { RankedList } from './ranked-list';

type VendorReviewProductBreakdownProps = {
  productBreakdown: NonNullable<StoreReviewSummary['productBreakdown']>;
};

export function VendorReviewProductBreakdown({
  productBreakdown,
}: VendorReviewProductBreakdownProps) {
  const sorted = [...productBreakdown].sort((a, b) => b.reviewCount - a.reviewCount);

  return (
    <Card>
      <CardHeader>
        <h2 className="font-display font-medium text-ink">รีวิวตามสินค้า</h2>
      </CardHeader>
      <CardBody>
        <RankedList
          items={sorted.map((item) => ({
            key: item.productId,
            primary: <p className="truncate font-medium text-ink">{item.productName}</p>,
            secondary: (
              <div className="flex flex-col items-end gap-1">
                <div className="flex items-center gap-1">
                  <StarRating rating={Math.round(item.averageRating)} iconClassName="size-3" />
                  <span className="text-xs text-muted">{item.averageRating.toFixed(1)}</span>
                </div>
                <p className="text-muted">{item.reviewCount} รีวิว</p>
              </div>
            ),
          }))}
        />
      </CardBody>
    </Card>
  );
}
