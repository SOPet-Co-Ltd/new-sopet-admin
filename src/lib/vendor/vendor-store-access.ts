/** Vendor routes reachable before the user owns or belongs to any store. */
export const VENDOR_STORELESS_ROUTE_PREFIXES = [
  '/vendor/stores',
  '/vendor/notifications',
  '/vendor/settings',
  '/vendor/invitations',
  '/vendor/requests',
] as const;

export const VENDOR_STORELESS_REDIRECT_PATH = '/vendor/stores';

export const VENDOR_STORELESS_REDIRECT_TOAST = 'กรุณาสร้างหรือเข้าร่วมร้านค้าก่อนเข้าถึงหน้านี้';

export function vendorHasStores(stores: readonly unknown[] | undefined): boolean {
  return (stores?.length ?? 0) > 0;
}

export function isVendorRouteAllowedWithoutStores(pathname: string): boolean {
  return VENDOR_STORELESS_ROUTE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}
