import { Badge } from '@/components/ui/badge';
import { Card, CardBody } from '@/components/ui/card';
import { StarRating } from '@/components/ui/star-rating';
import { formatDateTime } from '@/lib/utils';
import type { ProductReview } from '@/types';
import { ProductThumbnail } from './product-thumbnail';
import { ReviewImagesRow } from './review-images-row';
import { VendorReplySection } from './vendor-reply-section';

type VendorReviewListItemProps = {
  review: ProductReview;
  storeId: string;
};

export function VendorReviewListItem({ review, storeId }: VendorReviewListItemProps) {
  const hasComment = Boolean(review.comment?.trim());
  const hasReply = Boolean(review.reply);

  return (
    <Card>
      <CardBody className="space-y-3">
        <div className="flex gap-4">
          <ProductThumbnail
            imageUrl={review.productImageUrl}
            alt={review.productName ?? review.productId}
          />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="font-medium text-ink">{review.productName ?? review.productId}</p>
                {review.customerName ? (
                  <p className="text-sm text-muted">{review.customerName}</p>
                ) : null}
                {review.createdAt ? (
                  <p className="text-xs text-muted">{formatDateTime(review.createdAt)}</p>
                ) : null}
              </div>
              <div className="flex shrink-0 flex-wrap items-center gap-2">
                <StarRating rating={review.rating} />
                <Badge
                  className={
                    hasReply ? 'bg-success-bg text-success' : 'bg-warning-bg text-warning-text'
                  }
                >
                  {hasReply ? 'ตอบแล้ว' : 'ยังไม่ตอบ'}
                </Badge>
              </div>
            </div>
            {hasComment ? (
              <p className="text-sm text-ink">{review.comment}</p>
            ) : (
              <p className="text-sm text-muted">ไม่มีความคิดเห็น</p>
            )}
            <ReviewImagesRow images={review.images} />
            <VendorReplySection reviewId={review.id} reply={review.reply} storeId={storeId} />
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
