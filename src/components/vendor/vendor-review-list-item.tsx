'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardBody } from '@/components/ui/card';
import { StarRating } from '@/components/ui/star-rating';
import { formatDateTime } from '@/lib/utils';
import type { ProductReview } from '@/types';
import { ReviewImagesRow } from './review-images-row';
import { VendorReplySection } from './vendor-reply-section';

type VendorReviewListItemProps = {
  review: ProductReview;
  storeId: string;
};

function customerLabel(review: ProductReview): string {
  return review.customerName?.trim() || 'ลูกค้า';
}

function CustomerAvatar({ name, photoUrl }: { name: string; photoUrl?: string | null }) {
  const [imageError, setImageError] = useState(false);
  const initial = name.trim().charAt(0) || 'ล';

  if (photoUrl && !imageError) {
    return (
      <img
        src={photoUrl}
        alt={name}
        className="h-16 w-16 shrink-0 rounded-full border border-border object-cover"
        data-testid="customer-avatar-image"
        onError={() => setImageError(true)}
      />
    );
  }

  return (
    <div
      className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-border bg-surface text-lg font-medium text-muted-foreground"
      data-testid="customer-avatar-fallback"
      aria-hidden="true"
    >
      {initial}
    </div>
  );
}

export function VendorReviewListItem({ review, storeId }: VendorReviewListItemProps) {
  const hasComment = Boolean(review.comment?.trim());
  const hasReply = Boolean(review.reply);
  const name = customerLabel(review);
  const profileHref = review.customerId ? `/vendor/customers/${review.customerId}` : null;

  const avatar = <CustomerAvatar name={name} photoUrl={review.customerProfilePhotoUrl} />;
  const nameNode = (
    <p className="mt-0.5 truncate text-sm text-muted-foreground" data-testid="review-customer-name">
      {name}
    </p>
  );

  return (
    <Card>
      <CardBody className="space-y-3">
        <div className="flex gap-4">
          {profileHref ? (
            <Link href={profileHref} aria-label={`โปรไฟล์ ${name}`} className="shrink-0">
              {avatar}
            </Link>
          ) : (
            avatar
          )}
          <div className="min-w-0 flex-1 space-y-2.5">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate font-medium text-ink">
                  {review.productName ?? review.productId}
                </p>
                {profileHref ? (
                  <Link href={profileHref} className="block hover:text-ink">
                    {nameNode}
                  </Link>
                ) : (
                  nameNode
                )}
                {review.createdAt ? (
                  <p className="text-xs text-muted-foreground">
                    {formatDateTime(review.createdAt)}
                  </p>
                ) : null}
              </div>
              <div className="flex shrink-0 flex-wrap items-center gap-2">
                <StarRating rating={review.rating} />
                <Badge
                  className={
                    hasReply
                      ? 'border border-success/25 bg-success-bg text-success'
                      : 'border border-border bg-warning-bg text-warning-text'
                  }
                >
                  {hasReply ? 'ตอบแล้ว' : 'ยังไม่ตอบ'}
                </Badge>
              </div>
            </div>
            {hasComment ? (
              <p className="text-pretty text-sm text-ink">{review.comment}</p>
            ) : (
              <p className="text-sm text-muted-foreground">ไม่มีความคิดเห็น</p>
            )}
            <ReviewImagesRow images={review.images} />
            <VendorReplySection reviewId={review.id} reply={review.reply} storeId={storeId} />
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
