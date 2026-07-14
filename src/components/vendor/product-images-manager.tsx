'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useRef, useState } from 'react';
import { ConfirmDeleteButton } from '@/components/ui/confirm-delete-button';
import { Button } from '@/components/ui/button';
import { useImageUpload } from '@/hooks/useImageUpload';
import { executeMutation } from '@/lib/graphql/client';
import {
  ADD_PRODUCT_IMAGE,
  DELETE_PRODUCT_IMAGE,
  REORDER_PRODUCT_IMAGES,
  SET_PRODUCT_THUMBNAIL,
} from '@/lib/graphql/documents';
import { queryKeys } from '@/lib/react-query/keys';
import type { Product, ProductImage } from '@/types';

type GqlProductImage = {
  id: string;
  imageUrl: string;
  sortOrder: number;
  isThumbnail?: boolean | null;
};

function sortImages(images: ProductImage[]): ProductImage[] {
  return [...images].sort((a, b) => a.sortOrder - b.sortOrder || a.id.localeCompare(b.id));
}

function toImage(img: GqlProductImage): ProductImage {
  return {
    id: img.id,
    imageUrl: img.imageUrl,
    sortOrder: img.sortOrder,
    isThumbnail: img.isThumbnail ?? undefined,
  };
}

function imageConfirmLabel(url: string): string {
  const segment = url.split('/').filter(Boolean).pop();
  return segment ?? url;
}

export function ProductImagesManager({ product }: { product: Product }) {
  const queryClient = useQueryClient();
  const [images, setImages] = useState<ProductImage[]>(() => sortImages(product.images ?? []));
  const [loadedImages, setLoadedImages] = useState(product.images);
  const [mediaError, setMediaError] = useState<string | null>(null);
  const [mediaPending, setMediaPending] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const { upload: uploadProductImage, isUploading: imageUploading } = useImageUpload('products');

  if (product.images !== loadedImages) {
    setLoadedImages(product.images);
    setImages(sortImages(product.images ?? []));
  }

  function invalidateProducts() {
    queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
    queryClient.invalidateQueries({
      queryKey: queryKeys.products.detail(product.id),
    });
    queryClient.invalidateQueries({
      queryKey: queryKeys.products.publishChecklist(product.id),
    });
  }

  async function handleUploadImage(file: File) {
    setMediaPending(true);
    setMediaError(null);
    try {
      const uploaded = await uploadProductImage(file);
      const data = await executeMutation<{ addProductImage: GqlProductImage }>(ADD_PRODUCT_IMAGE, {
        productId: product.id,
        input: { url: uploaded.url, sortOrder: images.length },
      });
      setImages((prev) => sortImages([...prev, toImage(data.addProductImage)]));
      invalidateProducts();
    } catch (err) {
      setMediaError(err instanceof Error ? err.message : 'เพิ่มรูปภาพไม่สำเร็จ');
    } finally {
      setMediaPending(false);
    }
  }

  async function handleImageFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    await handleUploadImage(file);
  }

  async function handleMove(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= images.length) return;

    const reordered = [...images];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(target, 0, moved);
    setImages(reordered);

    setMediaPending(true);
    setMediaError(null);
    try {
      const data = await executeMutation<{
        reorderProductImages: GqlProductImage[];
      }>(REORDER_PRODUCT_IMAGES, {
        productId: product.id,
        imageIds: reordered.map((img) => img.id),
      });
      setImages(sortImages(data.reorderProductImages.map(toImage)));
      invalidateProducts();
    } catch (err) {
      setImages(sortImages(product.images ?? []));
      setMediaError(err instanceof Error ? err.message : 'อัปเดตลำดับรูปภาพไม่สำเร็จ');
    } finally {
      setMediaPending(false);
    }
  }

  async function handleDeleteImage(imageId: string) {
    setMediaPending(true);
    setMediaError(null);
    try {
      await executeMutation<{ deleteProductImage: boolean }>(DELETE_PRODUCT_IMAGE, { imageId });
      setImages((prev) => prev.filter((img) => img.id !== imageId));
      invalidateProducts();
    } catch (err) {
      setMediaError(err instanceof Error ? err.message : 'ลบรูปภาพไม่สำเร็จ');
      throw err;
    } finally {
      setMediaPending(false);
    }
  }

  async function handleSetThumbnail(imageId: string) {
    setMediaPending(true);
    setMediaError(null);
    try {
      await executeMutation<{ setProductThumbnail: GqlProductImage }>(SET_PRODUCT_THUMBNAIL, {
        productId: product.id,
        imageId,
      });
      setImages((prev) => prev.map((img) => ({ ...img, isThumbnail: img.id === imageId })));
      invalidateProducts();
    } catch (err) {
      setMediaError(err instanceof Error ? err.message : 'ตั้งรูปหน้าปกไม่สำเร็จ');
    } finally {
      setMediaPending(false);
    }
  }

  return (
    <div className="space-y-3">
      {images.length > 0 ? (
        <ul className="space-y-3" aria-label="รายการรูปภาพสินค้า">
          {images.map((image, index) => (
            <li
              key={image.id}
              className="flex flex-wrap items-center gap-3 rounded-md border border-border p-3"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image.imageUrl}
                alt=""
                className="h-14 w-14 shrink-0 rounded object-cover"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs text-muted">{image.imageUrl}</p>
                <div className="mt-2 flex items-center gap-1">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-8 w-8 p-0"
                    disabled={mediaPending || index === 0}
                    aria-label={`เลื่อนรูปภาพขึ้น (ลำดับที่ ${index + 1})`}
                    onClick={() => void handleMove(index, -1)}
                  >
                    ↑
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-8 w-8 p-0"
                    disabled={mediaPending || index === images.length - 1}
                    aria-label={`เลื่อนรูปภาพลง (ลำดับที่ ${index + 1})`}
                    onClick={() => void handleMove(index, 1)}
                  >
                    ↓
                  </Button>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant={image.isThumbnail ? 'default' : 'outline'}
                  disabled={mediaPending || image.isThumbnail}
                  aria-pressed={image.isThumbnail}
                  aria-label={
                    image.isThumbnail
                      ? `รูปหน้าปก: ${image.imageUrl}`
                      : `ตั้งเป็นรูปหน้าปก: ${image.imageUrl}`
                  }
                  onClick={() => void handleSetThumbnail(image.id)}
                >
                  {image.isThumbnail ? 'รูปหน้าปก' : 'ตั้งเป็นหน้าปก'}
                </Button>
                <ConfirmDeleteButton
                  confirmLabel={imageConfirmLabel(image.imageUrl)}
                  title="ลบรูปภาพ"
                  description="รูปภาพจะถูกลบออกจากสินค้านี้"
                  disabled={mediaPending}
                  isDeleting={mediaPending}
                  onConfirm={async () => {
                    await handleDeleteImage(image.id);
                  }}
                />
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted">ยังไม่มีรูปภาพ</p>
      )}

      <div className="flex flex-wrap items-end gap-2">
        <input
          ref={imageInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="sr-only"
          aria-label="เลือกรูปภาพสินค้า"
          disabled={mediaPending || imageUploading}
          onChange={(event) => void handleImageFileChange(event)}
        />
        <Button
          type="button"
          variant="outline"
          disabled={mediaPending || imageUploading}
          aria-busy={mediaPending || imageUploading}
          onClick={() => imageInputRef.current?.click()}
        >
          {mediaPending || imageUploading ? 'กำลังอัปโหลด...' : 'เลือกรูปภาพ'}
        </Button>
        <p className="text-xs text-muted">JPEG, PNG, WebP หรือ GIF สูงสุด 5 MB</p>
      </div>

      {mediaError ? (
        <p className="text-sm text-danger" role="alert">
          {mediaError}
        </p>
      ) : null}
    </div>
  );
}
