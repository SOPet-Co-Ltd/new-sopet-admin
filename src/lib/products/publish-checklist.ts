import type { Product, ProductPublishChecklist, ProductPublishChecklistItem } from '@/types';

const CHECKLIST_KEYS = [
  'name',
  'media',
  'category',
  'petType',
  'variants',
  'price',
  'stock',
] as const;

export type LivePublishChecklistForm = {
  name?: string;
  categoryId?: string;
  petTypeId?: string;
};

/**
 * Builds a publish checklist from the product plus current form overlays
 * (name / category / pet type) so the edit sidebar ticks update live.
 */
export function buildLivePublishChecklist(
  product: Product,
  form: LivePublishChecklistForm,
): ProductPublishChecklist {
  const variants = product.variants ?? [];
  const images = product.images ?? [];
  const hasName = Boolean(form.name?.trim());
  const hasMedia = images.length > 0;
  const hasCategory = Boolean(form.categoryId);
  const hasPetType = Boolean(form.petTypeId);
  const hasVariants = variants.length > 0;
  const hasValidPrice =
    hasVariants &&
    variants.every((variant) => Number(variant.price) >= 0) &&
    variants.some((variant) => Number(variant.price) > 0);
  const hasStock = variants.some((variant) => Number(variant.stockQuantity ?? 0) > 0);

  const completeness: Record<(typeof CHECKLIST_KEYS)[number], boolean> = {
    name: hasName,
    media: hasMedia,
    category: hasCategory,
    petType: hasPetType,
    variants: hasVariants,
    price: hasValidPrice,
    stock: hasStock,
  };

  const items: ProductPublishChecklistItem[] = CHECKLIST_KEYS.map((key) => ({
    key,
    complete: completeness[key],
  }));
  const missingKeys = items.filter((item) => !item.complete).map((item) => item.key);

  return {
    items,
    missingKeys,
    canPublish: missingKeys.length === 0,
  };
}
