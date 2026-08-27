/**
 * When the vendor switches active store while on a store-scoped entity URL
 * (product detail / stock / SKU / price, etc.), leave that page so data from
 * the previous store is not shown under the new store context.
 *
 * Returns a safe list/dashboard path, or null when the current page can stay.
 */
export function getStoreSwitchRedirectPath(pathname: string): string | null {
  // Product detail, edit, stock, variants (SKU/price), and new product form.
  // Keep the products list itself (`/vendor/products`).
  if (/^\/vendor\/products\/.+/.test(pathname)) {
    return '/vendor/products';
  }

  // Promotion edit page — the promotion belongs to the previous store.
  if (/^\/vendor\/promotions\/[^/]+\/edit(?:\/|$)/.test(pathname)) {
    return '/vendor/promotions/new';
  }

  return null;
}
