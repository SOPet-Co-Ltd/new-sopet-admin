export interface VariantOptionGroup {
  name: string;
  values: string[];
}

export interface VariantCombination {
  id?: string;
  sku: string;
  stockQuantity: number;
  price: number;
  /** Original / strikethrough price for this SKU; null clears. */
  compareAtPrice?: number | null;
  options: Record<string, string>;
}

/** A sellable variant item with its own SKU, stock, and price. */
export type VariantItem = VariantCombination;

export function parseVariantOptions(optionsJson?: string | null): Record<string, string> {
  if (!optionsJson) return {};
  try {
    const parsed = JSON.parse(optionsJson) as Record<string, unknown>;
    const options: Record<string, string> = {};
    for (const [key, value] of Object.entries(parsed)) {
      if (key !== 'name' && value != null) {
        options[key] = String(value);
      }
    }
    return options;
  } catch {
    return {};
  }
}

export function variantOptionKey(options: Record<string, string>): string {
  return Object.entries(options)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}:${value}`)
    .join('|');
}

export function extractOptionGroups(combinations: VariantCombination[]): VariantOptionGroup[] {
  const groups = new Map<string, Set<string>>();

  for (const combination of combinations) {
    for (const [name, value] of Object.entries(combination.options)) {
      if (!groups.has(name)) {
        groups.set(name, new Set());
      }
      groups.get(name)!.add(value);
    }
  }

  return Array.from(groups.entries()).map(([name, values]) => ({
    name,
    values: Array.from(values),
  }));
}

export function cartesianProduct(groups: VariantOptionGroup[]): Record<string, string>[] {
  if (groups.length === 0) return [{}];

  return groups.reduce<Record<string, string>[]>(
    (acc, group) => {
      const values = group.values.filter(Boolean);
      if (values.length === 0) return acc;

      const next: Record<string, string>[] = [];
      for (const item of acc) {
        for (const value of values) {
          next.push({ ...item, [group.name]: value });
        }
      }
      return next;
    },
    [{}],
  );
}

/** Matches product_variants.sku varchar(100). */
export const MAX_SKU_LENGTH = 100;

/** Build a slug-based SKU that always fits the DB limit. Prefer keeping option suffixes. */
export function buildAutoSku(productSlug: string, options: Record<string, string>): string {
  const slugPart = Object.values(options)
    .map((value) => value.toLowerCase().replace(/[^\p{L}\p{N}\p{M}]+/gu, '-'))
    .filter(Boolean)
    .join('-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  const base = productSlug.trim().replace(/-+/g, '-').replace(/^-|-$/g, '') || 'sku';
  const raw = slugPart ? `${base}-${slugPart}` : base;
  if (raw.length <= MAX_SKU_LENGTH) {
    return raw;
  }

  const suffix = slugPart ? `-${slugPart}` : '';
  if (suffix.length >= MAX_SKU_LENGTH) {
    return suffix.slice(-MAX_SKU_LENGTH).replace(/^-/, '') || 'sku';
  }

  return `${base.slice(0, MAX_SKU_LENGTH - suffix.length)}${suffix}`;
}

export function buildCombinationsFromGroups(
  groups: VariantOptionGroup[],
  existing: VariantCombination[],
  productSlug: string,
): VariantCombination[] {
  const existingByKey = new Map(existing.map((item) => [variantOptionKey(item.options), item]));
  const usedSkus = new Set(existing.map((item) => item.sku.trim().toLowerCase()).filter(Boolean));

  const combos = cartesianProduct(groups.filter((group) => group.name.trim()));

  return combos.map((options) => {
    const key = variantOptionKey(options);
    const match = existingByKey.get(key);

    let sku = match?.sku?.trim() || buildAutoSku(productSlug, options);
    if (!match?.sku) {
      let candidate = sku.slice(0, MAX_SKU_LENGTH);
      let suffix = 2;
      while (usedSkus.has(candidate.toLowerCase())) {
        const tag = `-${suffix}`;
        candidate = `${sku.slice(0, Math.max(1, MAX_SKU_LENGTH - tag.length))}${tag}`;
        suffix += 1;
      }
      sku = candidate;
      usedSkus.add(sku.toLowerCase());
    }

    return {
      id: match?.id,
      sku,
      stockQuantity: match?.stockQuantity ?? 0,
      price: match?.price ?? 0,
      compareAtPrice: match?.compareAtPrice ?? null,
      options,
    };
  });
}

export function variantItemsFromProduct(
  variants: Array<{
    id: string;
    sku: string;
    price: number;
    compareAtPrice?: number | null;
    stockQuantity: number;
    optionsJson?: string | null;
  }>,
): VariantItem[] {
  return variants.map((variant) => ({
    id: variant.id,
    sku: variant.sku,
    stockQuantity: variant.stockQuantity,
    price: variant.price,
    compareAtPrice: variant.compareAtPrice ?? null,
    options: parseVariantOptions(variant.optionsJson),
  }));
}

export function variantItemsToSyncInput(items: VariantItem[]): Array<{
  id?: string;
  sku: string;
  stockQuantity: number;
  /** Absolute THB sell price — backend recomputes basePrice on sync. */
  price: number;
  compareAtPrice: number | null;
  attributes: Record<string, string>;
}> {
  return items.map((item) => ({
    id: item.id,
    sku: item.sku.trim().slice(0, MAX_SKU_LENGTH),
    stockQuantity: item.stockQuantity,
    price: Math.max(0, Number(item.price) || 0),
    compareAtPrice: item.compareAtPrice ?? null,
    attributes: item.options,
  }));
}

/** Compare-at from sell price + discount percent (e.g. 25% off 750 → 1000). */
export function compareAtFromDiscountPercent(sellPrice: number, percent: number): number | null {
  if (!(sellPrice > 0) || !(percent > 0) || !(percent < 100)) {
    return null;
  }
  return Math.round((sellPrice / (1 - percent / 100)) * 100) / 100;
}

/** Discount % badge from sell vs compare-at (0 when not discounted). */
export function discountPercentFromCompareAt(
  sellPrice: number,
  compareAtPrice: number | null | undefined,
): number {
  if (compareAtPrice == null || compareAtPrice <= sellPrice) {
    return 0;
  }
  return Math.round(((compareAtPrice - sellPrice) / compareAtPrice) * 100);
}

export function countVariantItems(groups: VariantOptionGroup[]): number {
  const normalized = groups
    .map((g) => ({ name: g.name.trim(), values: g.values.map((v) => v.trim()).filter(Boolean) }))
    .filter((g) => g.name && g.values.length > 0);
  if (normalized.length === 0) return 0;
  return cartesianProduct(normalized).length;
}

export function formatCombinationLabel(options: Record<string, string>): string {
  return Object.entries(options)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}: ${value}`)
    .join(' · ');
}

/** Patch describing an in-place option rename that should rewrite existing SKU rows. */
export type VariantOptionRename =
  | { type: 'group'; from: string; to: string }
  | { type: 'value'; group: string; from: string; to: string };

/** Rewrite option keys/values on existing items so rename keeps id, sku, stock, and price. */
export function applyOptionRename<T extends { options: Record<string, string> }>(
  items: T[],
  rename: VariantOptionRename,
): T[] {
  if (rename.type === 'group') {
    const from = rename.from.trim();
    const to = rename.to.trim();
    if (!from || !to || from === to) return items;
    return items.map((item) => {
      if (!(from in item.options)) return item;
      const nextOptions: Record<string, string> = {};
      for (const [key, value] of Object.entries(item.options)) {
        nextOptions[key === from ? to : key] = value;
      }
      return { ...item, options: nextOptions };
    });
  }

  const group = rename.group.trim();
  const from = rename.from.trim();
  const to = rename.to.trim();
  if (!group || !from || !to || from === to) return items;
  return items.map((item) => {
    if (item.options[group] !== from) return item;
    return { ...item, options: { ...item.options, [group]: to } };
  });
}
