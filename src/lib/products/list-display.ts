import { formatCurrency } from '@/lib/utils';
import type { Product } from '@/types';

export function getProductListPriceLabel(product: Product): string {
  const variants = product.variants ?? [];
  if (variants.length === 0) {
    return formatCurrency(product.basePrice);
  }

  const prices = variants.map((variant) => variant.price);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  if (min === max) {
    return formatCurrency(min);
  }
  return `${formatCurrency(min)} – ${formatCurrency(max)}`;
}

export function getProductListStockTotal(product: Product): number {
  const variants = product.variants ?? [];
  if (variants.length === 0) {
    return 0;
  }
  return variants.reduce((sum, variant) => sum + (variant.stockQuantity ?? 0), 0);
}

export function getProductListThumbnailUrl(product: Product): string | null | undefined {
  if (product.thumbnailUrl) {
    return product.thumbnailUrl;
  }
  const images = product.images ?? [];
  const thumbnail = images.find((image) => image.isThumbnail) ?? images[0];
  return thumbnail?.imageUrl;
}
