'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useRef, useState } from 'react';
import { HiArrowDown, HiArrowUp, HiPhoto } from 'react-icons/hi2';
import { Badge } from '@/components/ui/badge';
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
import { cn } from '@/lib/utils';
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

  const busy = mediaPending || imageUploading;
  const explicitThumbnailId = images.find((img) => img.isThumbnail)?.id;
  // Match storefront/list display: first sorted image is used when none is marked.
  const thumbnailImageId = explicitThumbnailId ?? images[0]?.id;

  return (
    <div className="space-y-4" aria-busy={busy}>
      <input
        ref={imageInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="sr-only"
        aria-label="เลือกรูปภาพสินค้า"
        disabled={busy}
        onChange={(event) => void handleImageFileChange(event)}
      />

      {images.length > 0 ? (
        <ul className="space-y-3" aria-label="รายการรูปภาพสินค้า">
          {images.map((image, index) => {
            const isThumbnail = image.id === thumbnailImageId;
            const orderLabel = `รูปที่ ${index + 1}`;

            return (
              <li
                key={image.id}
                className={cn(
                  'flex flex-wrap items-center gap-3 rounded-lg border p-3 transition-colors duration-150 ease-out',
                  isThumbnail
                    ? 'border-brand bg-brand-tint/40 ring-1 ring-brand/30'
                    : 'border-border bg-card',
                )}
                aria-current={isThumbnail ? 'true' : undefined}
              >
                <div className="relative shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={image.imageUrl}
                    alt=""
                    className={cn(
                      'h-16 w-16 rounded-md object-cover',
                      isThumbnail && 'ring-2 ring-brand ring-offset-1',
                    )}
                  />
                  {isThumbnail ? (
                    <Badge
                      className="absolute -top-2 -right-2 bg-brand text-white"
                      aria-label="รูปหน้าปกปัจจุบัน"
                    >
                      หน้าปก
                    </Badge>
                  ) : null}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-ink">{orderLabel}</p>
                  {isThumbnail ? (
                    <p className="mt-0.5 text-xs font-medium text-brand">รูปหน้าปกปัจจุบัน</p>
                  ) : (
                    <p className="mt-0.5 truncate text-xs text-muted" title={image.imageUrl}>
                      {imageConfirmLabel(image.imageUrl)}
                    </p>
                  )}
                  <div className="mt-2 flex items-center gap-1">
                    <Button
                      type="button"
                      size="icon"
                      variant="outline"
                      className="size-10"
                      disabled={busy || index === 0}
                      aria-label={`เลื่อนรูปภาพขึ้น (ลำดับที่ ${index + 1})`}
                      onClick={() => void handleMove(index, -1)}
                    >
                      <HiArrowUp className="size-4" aria-hidden="true" />
                    </Button>
                    <Button
                      type="button"
                      size="icon"
                      variant="outline"
                      className="size-10"
                      disabled={busy || index === images.length - 1}
                      aria-label={`เลื่อนรูปภาพลง (ลำดับที่ ${index + 1})`}
                      onClick={() => void handleMove(index, 1)}
                    >
                      <HiArrowDown className="size-4" aria-hidden="true" />
                    </Button>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant={isThumbnail ? 'default' : 'outline'}
                    disabled={busy || isThumbnail}
                    aria-pressed={isThumbnail}
                    aria-label={
                      isThumbnail ? `รูปหน้าปก: ${orderLabel}` : `ตั้งเป็นรูปหน้าปก: ${orderLabel}`
                    }
                    onClick={() => void handleSetThumbnail(image.id)}
                  >
                    {isThumbnail ? 'รูปหน้าปก' : 'ตั้งเป็นหน้าปก'}
                  </Button>
                  <ConfirmDeleteButton
                    confirmLabel={imageConfirmLabel(image.imageUrl)}
                    title="ลบรูปภาพ"
                    description="รูปภาพจะถูกลบออกจากสินค้านี้"
                    disabled={busy}
                    isDeleting={mediaPending}
                    onConfirm={async () => {
                      await handleDeleteImage(image.id);
                    }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="rounded-lg border border-dashed border-border bg-surface/50 px-4 py-8 text-center">
          <HiPhoto className="mx-auto size-8 text-muted" aria-hidden="true" />
          <p className="mt-3 text-sm font-medium text-ink">ยังไม่มีรูปภาพ</p>
          <p className="mt-1 text-xs text-muted">
            เพิ่มอย่างน้อย 1 รูปเพื่อเผยแพร่สินค้า — รูปแรกจะเป็นภาพหลักจนกว่าจะตั้งหน้าปก
          </p>
          <Button
            type="button"
            variant="outline"
            className="mt-4"
            disabled={busy}
            aria-busy={busy}
            onClick={() => imageInputRef.current?.click()}
          >
            {busy ? 'กำลังอัปโหลด...' : 'เลือกรูปภาพ'}
          </Button>
        </div>
      )}

      {images.length > 0 ? (
        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="button"
            variant="outline"
            disabled={busy}
            aria-busy={busy}
            onClick={() => imageInputRef.current?.click()}
          >
            {busy ? 'กำลังอัปโหลด...' : 'เพิ่มรูปภาพ'}
          </Button>
          <p className="text-xs text-muted">JPEG, PNG, WebP หรือ GIF สูงสุด 5 MB</p>
        </div>
      ) : (
        <p className="text-xs text-muted">รองรับ JPEG, PNG, WebP หรือ GIF สูงสุด 5 MB</p>
      )}

      {mediaError ? (
        <p className="text-sm text-danger" role="alert">
          {mediaError}
        </p>
      ) : null}
    </div>
  );
}
