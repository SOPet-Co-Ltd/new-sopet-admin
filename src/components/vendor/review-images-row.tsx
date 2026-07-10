type ReviewImagesRowProps = {
  images?: Array<{ id: string; url: string }>;
};

export function ReviewImagesRow({ images = [] }: ReviewImagesRowProps) {
  if (images.length === 0) {
    return null;
  }

  return (
    <div className="mt-2 flex flex-wrap gap-2" data-testid="review-images-row">
      {images.map((image) => (
        <img
          key={image.id}
          src={image.url}
          alt=""
          className="h-16 w-16 rounded-lg border border-border object-cover"
        />
      ))}
    </div>
  );
}
