import { cn } from '@/lib/utils';

type ProductThumbnailProps = {
  imageUrl?: string | null;
  alt: string;
  /** `sm` for dense list rows; `md` for review/detail cards. */
  size?: 'sm' | 'md';
};

const sizeClass = {
  sm: 'h-10 w-10',
  md: 'h-16 w-16',
} as const;

export function ProductThumbnail({ imageUrl, alt, size = 'md' }: ProductThumbnailProps) {
  const box = sizeClass[size];

  if (!imageUrl) {
    return (
      <div
        className={cn(
          'flex shrink-0 items-center justify-center rounded-lg border border-border bg-surface text-center text-xs leading-tight text-muted',
          box,
        )}
        data-testid="product-thumbnail-fallback"
      >
        ไม่มีรูป
      </div>
    );
  }

  return (
    <img
      src={imageUrl}
      alt={alt}
      className={cn('shrink-0 rounded-lg border border-border object-cover', box)}
      data-testid="product-thumbnail-image"
    />
  );
}
