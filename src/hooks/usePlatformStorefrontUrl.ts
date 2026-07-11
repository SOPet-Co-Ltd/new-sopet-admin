'use client';

import { useQuery } from '@tanstack/react-query';
import { getPlatformStorefrontUrl } from '@/lib/api/platform-settings';
import { queryKeys } from '@/lib/react-query/keys';

export function usePlatformStorefrontUrl() {
  return useQuery({
    queryKey: [...queryKeys.platform.all, 'storefrontUrl'] as const,
    queryFn: getPlatformStorefrontUrl,
  });
}
