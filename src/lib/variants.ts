export interface VariantOptionGroup {
  name: string;
  values: string[];
}

export interface VariantCombination {
  id?: string;
  sku: string;
  stockQuantity: number;
  price: number;
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

export function buildCombinationsFromGroups(
  groups: VariantOptionGroup[],
  existing: VariantCombination[],
  productSlug: string,
): VariantCombination[] {
  const existingByKey = new Map(existing.map((item) => [variantOptionKey(item.options), item]));

  const combos = cartesianProduct(groups.filter((group) => group.name.trim()));

  return combos.map((options) => {
    const key = variantOptionKey(options);
    const match = existingByKey.get(key);
    const slugPart = Object.values(options)
      .map((value) => value.toLowerCase().replace(/[^\p{L}\p{N}\p{M}]+/gu, '-'))
      .join('-');

    return {
      id: match?.id,
      sku: match?.sku ?? `${productSlug}-${slugPart}`,
      stockQuantity: match?.stockQuantity ?? 0,
      price: match?.price ?? 0,
      options,
    };
  });
}

export function variantItemsFromProduct(
  variants: Array<{
    id: string;
    sku: string;
    price: number;
    stockQuantity: number;
    optionsJson?: string | null;
  }>,
): VariantItem[] {
  return variants.map((variant) => ({
    id: variant.id,
    sku: variant.sku,
    stockQuantity: variant.stockQuantity,
    price: variant.price,
    options: parseVariantOptions(variant.optionsJson),
  }));
}

export function variantItemsToSyncInput(
  items: VariantItem[],
  productBasePrice = 0,
): Array<{
  id?: string;
  sku: string;
  stockQuantity: number;
  priceModifier: number;
  attributes: Record<string, string>;
}> {
  return items.map((item) => ({
    id: item.id,
    sku: item.sku.trim(),
    stockQuantity: item.stockQuantity,
    priceModifier: Math.max(0, item.price - productBasePrice),
    attributes: item.options,
  }));
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
    .map(([key, value]) => `${key}: ${value}`)
    .join(' · ');
}
