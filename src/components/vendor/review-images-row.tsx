type ReviewImagesRowProps = {
  images?: Array<{ id: string; url: string }>;
};

export function ReviewImagesRow({ images = [] }: ReviewImagesRowProps) {
  if (images.length === 0) {
    return null;
  }

  return (
    <div className="mt-1 flex flex-wrap gap-2" data-testid="review-images-row">
      {images.map((image, index) => (
        <img
          key={image.id}
          src={image.url}
          alt={`รูปแนบรีวิว ${index + 1}`}
          className="h-16 w-16 rounded-lg border border-border object-cover"
        />
      ))}
    </div>
  );
}
