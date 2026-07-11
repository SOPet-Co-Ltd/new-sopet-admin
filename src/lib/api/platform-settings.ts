import { executeQuery } from '@/lib/graphql/client';
import { PLATFORM_SETTINGS_FOR_VENDOR_QUERY } from '@/lib/graphql/documents';

export function buildTrackingUrl(base: string, orderNumber: string): string {
  return `${base.replace(/\/$/, '')}/track/${orderNumber}`;
}

export function getPlatformStorefrontUrl(): Promise<string> {
  return executeQuery<{ platformSettings: { storefrontUrl: string } }>(
    PLATFORM_SETTINGS_FOR_VENDOR_QUERY,
  ).then((data) => data.platformSettings.storefrontUrl.trim());
}
