import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { createElement, type ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { buildTrackingUrl, getPlatformStorefrontUrl } from '@/lib/api/platform-settings';
import { usePlatformStorefrontUrl } from './usePlatformStorefrontUrl';

vi.mock('@/lib/api/platform-settings', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/api/platform-settings')>();
  return {
    ...actual,
    getPlatformStorefrontUrl: vi.fn(),
  };
});

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return function Wrapper({ children }: { children: ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  };
}

describe('usePlatformStorefrontUrl', () => {
  beforeEach(() => {
    vi.mocked(getPlatformStorefrontUrl).mockReset();
  });

  it('returns storefrontUrl on success', async () => {
    vi.mocked(getPlatformStorefrontUrl).mockResolvedValue('https://shop.example.com');

    const { result } = renderHook(() => usePlatformStorefrontUrl(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBe('https://shop.example.com');
  });

  it('surfaces error state on failure', async () => {
    vi.mocked(getPlatformStorefrontUrl).mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => usePlatformStorefrontUrl(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.data).toBeUndefined();
  });
});

describe('buildTrackingUrl', () => {
  it('strips trailing slash from storefrontUrl base', () => {
    expect(buildTrackingUrl('https://shop.example.com/', 'ORD-MRFTYF80-PSFE')).toBe(
      'https://shop.example.com/track/ORD-MRFTYF80-PSFE',
    );
  });

  it('builds tracking URL when base has no trailing slash', () => {
    expect(buildTrackingUrl('https://shop.example.com', 'ORD-MRFTYF80-PSFE')).toBe(
      'https://shop.example.com/track/ORD-MRFTYF80-PSFE',
    );
  });
});
