import { HiOutlineStar, HiStar } from 'react-icons/hi2';
import { cn } from '@/lib/utils';

type StarRatingProps = {
  rating: number;
  max?: number;
  className?: string;
  iconClassName?: string;
};

export function StarRating({
  rating,
  max = 5,
  className,
  iconClassName = 'size-4',
}: StarRatingProps) {
  const clampedRating = Math.max(0, Math.min(max, Math.round(rating)));

  return (
    <div
      aria-label={`${clampedRating} จาก ${max} ดาว`}
      className={cn('inline-flex items-center gap-0.5', className)}
      role="img"
    >
      {Array.from({ length: max }, (_, index) => {
        const filled = index < clampedRating;
        const Icon = filled ? HiStar : HiOutlineStar;

        return (
          <Icon
            key={index}
            aria-hidden
            className={cn(iconClassName, filled ? 'text-brand' : 'text-muted')}
          />
        );
      })}
    </div>
  );
}
