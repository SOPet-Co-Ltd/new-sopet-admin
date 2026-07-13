'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/toast';
import { useMyStores } from '@/hooks/useMyStores';
import {
  isVendorRouteAllowedWithoutStores,
  vendorHasStores,
  VENDOR_STORELESS_REDIRECT_PATH,
  VENDOR_STORELESS_REDIRECT_TOAST,
} from '@/lib/vendor/vendor-store-access';

export function VendorStoreGuard({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { show } = useToast();
  const { data: stores, isLoading } = useMyStores();
  const redirectedRef = useRef(false);

  const hasStores = vendorHasStores(stores);
  const isAllowed = isVendorRouteAllowedWithoutStores(pathname);

  useEffect(() => {
    if (isLoading || hasStores || isAllowed) {
      redirectedRef.current = false;
      return;
    }

    if (redirectedRef.current) {
      return;
    }

    redirectedRef.current = true;
    router.replace(VENDOR_STORELESS_REDIRECT_PATH);
    show(VENDOR_STORELESS_REDIRECT_TOAST, 'info');
  }, [hasStores, isAllowed, isLoading, pathname, router, show]);

  if (isLoading) {
    return <p className="text-muted">กำลังโหลด...</p>;
  }

  if (!hasStores && !isAllowed) {
    return null;
  }

  return <>{children}</>;
}
