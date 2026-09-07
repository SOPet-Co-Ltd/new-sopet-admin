import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  parseEnumParam,
  parsePageParam,
  parseSearchQuery,
  serializeEnumParam,
  serializePageParam,
  serializeSearchQuery,
} from './list-query-params';
import { useListQueryState, type ListQuerySpec } from './use-list-query-state';

const mockReplace = vi.fn();
let mockPathname = '/vendor/products';
let mockSearchParams = new URLSearchParams();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mockReplace }),
  usePathname: () => mockPathname,
  useSearchParams: () => mockSearchParams,
}));

const PRODUCT_SPEC = {
  page: {
    parse: parsePageParam,
    serialize: serializePageParam,
  },
  q: {
    parse: parseSearchQuery,
    serialize: serializeSearchQuery,
  },
  status: {
    parse: (raw: string | null) =>
      parseEnumParam(raw, ['all', 'draft', 'published', 'archived'] as const, 'all'),
    serialize: (value: 'all' | 'draft' | 'published' | 'archived') =>
      serializeEnumParam(value, 'all'),
  },
} satisfies ListQuerySpec;

describe('useListQueryState', () => {
  beforeEach(() => {
    mockReplace.mockReset();
    mockPathname = '/vendor/products';
    mockSearchParams = new URLSearchParams();
  });

  it('reads defaults when query params are missing', () => {
    const { result } = renderHook(() => useListQueryState(PRODUCT_SPEC));
    expect(result.current[0]).toEqual({ page: 1, q: '', status: 'all' });
  });

  it('parses page and filters from the URL', () => {
    mockSearchParams = new URLSearchParams('page=3&q=dog&status=draft&queue=action');
    const { result } = renderHook(() => useListQueryState(PRODUCT_SPEC));
    expect(result.current[0]).toEqual({ page: 3, q: 'dog', status: 'draft' });
  });

  it('falls back when page or enum values are invalid', () => {
    mockSearchParams = new URLSearchParams('page=0&status=nope');
    const { result } = renderHook(() => useListQueryState(PRODUCT_SPEC));
    expect(result.current[0]).toEqual({ page: 1, q: '', status: 'all' });
  });

  it('omits defaults when writing page 1', () => {
    mockSearchParams = new URLSearchParams('page=2&status=draft');
    const { result } = renderHook(() => useListQueryState(PRODUCT_SPEC));

    act(() => {
      result.current[1]({ page: 1 });
    });

    expect(mockReplace).toHaveBeenCalledWith('/vendor/products?status=draft', { scroll: false });
  });

  it('writes page=2 on pagination without dropping other params', () => {
    mockSearchParams = new URLSearchParams('status=draft&queue=action');
    const { result } = renderHook(() => useListQueryState(PRODUCT_SPEC));

    act(() => {
      result.current[1]({ page: 2 });
    });

    const href = mockReplace.mock.calls[0]?.[0] as string;
    expect(href).toContain('page=2');
    expect(href).toContain('status=draft');
    expect(href).toContain('queue=action');
    expect(mockReplace.mock.calls[0]?.[1]).toEqual({ scroll: false });
  });

  it('resets page when a filter changes', () => {
    mockSearchParams = new URLSearchParams('page=4&status=published');
    const { result } = renderHook(() => useListQueryState(PRODUCT_SPEC));

    act(() => {
      result.current[1]({ status: 'draft' });
    });

    const href = mockReplace.mock.calls[0]?.[0] as string;
    expect(href).toBe('/vendor/products?status=draft');
  });

  it('supports functional updates for page', () => {
    mockSearchParams = new URLSearchParams('page=2');
    const { result } = renderHook(() => useListQueryState(PRODUCT_SPEC));

    act(() => {
      result.current[1]((prev) => ({ page: prev.page + 1 }));
    });

    expect(mockReplace).toHaveBeenCalledWith('/vendor/products?page=3', { scroll: false });
  });

  it('clears managed params while preserving unrelated ones', () => {
    mockSearchParams = new URLSearchParams('page=2&q=dog&status=draft&tab=payout');
    const { result } = renderHook(() => useListQueryState(PRODUCT_SPEC));

    act(() => {
      result.current[1]({ page: 1, q: '', status: 'all' });
    });

    expect(mockReplace).toHaveBeenCalledWith('/vendor/products?tab=payout', { scroll: false });
  });
});
