import type { ProductReview } from '@/types';

export type ReplyFilter = 'all' | 'unreplied' | 'replied';
export type RatingFilter = 'all' | '1' | '2' | '3' | '4' | '5';

export function filterReviews(
  reviews: ProductReview[],
  replyFilter: ReplyFilter,
  ratingFilter: RatingFilter,
): ProductReview[] {
  return reviews.filter((review) => {
    const matchesReply =
      replyFilter === 'all' ||
      (replyFilter === 'unreplied' ? !review.reply : Boolean(review.reply));
    const matchesRating = ratingFilter === 'all' || review.rating === Number(ratingFilter);
    return matchesReply && matchesRating;
  });
}
