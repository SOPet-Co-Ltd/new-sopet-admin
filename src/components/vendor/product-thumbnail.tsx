type ProductThumbnailProps = {
  imageUrl?: string | null;
  alt: string;
};

export function ProductThumbnail({ imageUrl, alt }: ProductThumbnailProps) {
  if (!imageUrl) {
    return (
      <div
        className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg border border-border bg-surface text-center text-xs text-muted"
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
      className="h-16 w-16 shrink-0 rounded-lg border border-border object-cover"
      data-testid="product-thumbnail-image"
    />
  );
}
