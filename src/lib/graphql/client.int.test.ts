import { gql } from '@apollo/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { executeMutation, executeQuery, resetApolloClientForTests } from '@/lib/graphql/client';
import { getAccessToken, getRefreshToken } from '@/lib/graphql/tokens';

const TEST_QUERY = gql`
  query TestValue {
    value
  }
`;

const TEST_MUTATION = gql`
  mutation TestMutate {
    mutateValue
  }
`;

describe('executeQuery cache policy', () => {
  let fetchCallCount = 0;

  beforeEach(() => {
    fetchCallCount = 0;
    resetApolloClientForTests();

    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        fetchCallCount += 1;
        const body = JSON.stringify({
          data: {
            value: fetchCallCount === 1 ? 'fixture-a' : 'fixture-b',
          },
        });
        return {
          ok: true,
          status: 200,
          headers: new Headers({ 'Content-Type': 'application/json' }),
          json: async () => JSON.parse(body),
          text: async () => body,
        } as Response;
      }),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    resetApolloClientForTests();
  });

  it('issues a fresh network request by default so TanStack refetches are not stale', async () => {
    const first = await executeQuery<{ value: string }>(TEST_QUERY);
    const second = await executeQuery<{ value: string }>(TEST_QUERY);

    expect(fetchCallCount).toBe(2);
    expect(first.value).toBe('fixture-a');
    expect(second.value).toBe('fixture-b');
  });

  it('serves repeated identical queries from cache when cache-first is requested', async () => {
    const first = await executeQuery<{ value: string }>(TEST_QUERY, undefined, {
      fetchPolicy: 'cache-first',
    });
    const second = await executeQuery<{ value: string }>(TEST_QUERY, undefined, {
      fetchPolicy: 'cache-first',
    });

    expect(fetchCallCount).toBe(1);
    expect(first.value).toBe('fixture-a');
    expect(second.value).toBe('fixture-a');
  });
});

describe('token refresh race with logout', () => {
  beforeEach(() => {
    resetApolloClientForTests();
    document.cookie = 'sopet_admin_auth=1; path=/';
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    document.cookie = 'sopet_admin_auth=; max-age=0; path=/';
    resetApolloClientForTests();
  });

  it('fails closed when BFF refresh fails after UNAUTHENTICATED', async () => {
    let queryCallCount = 0;

    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string | URL | Request) => {
        const href = typeof url === 'string' ? url : url instanceof URL ? url.href : url.url;
        if (href.includes('/api/auth/refresh') || href.endsWith('/api/auth/refresh')) {
          return {
            ok: false,
            status: 401,
            json: async () => ({ ok: false }),
          } as Response;
        }
        if (href.includes('/api/auth/logout')) {
          return { ok: true, status: 200, json: async () => ({ ok: true }) } as Response;
        }

        queryCallCount += 1;
        const body = JSON.stringify({
          errors: [{ message: 'Unauthorized', extensions: { code: 'UNAUTHENTICATED' } }],
        });
        return {
          ok: true,
          status: 200,
          headers: new Headers({ 'Content-Type': 'application/json' }),
          json: async () => JSON.parse(body),
          text: async () => body,
        } as Response;
      }),
    );

    await expect(executeQuery<{ value: string }>(TEST_QUERY)).rejects.toMatchObject({
      code: 'SESSION_EXPIRED',
    });

    expect(getAccessToken()).toBeUndefined();
    expect(getRefreshToken()).toBeUndefined();
    expect(queryCallCount).toBeGreaterThan(0);
  });
});

describe('executeMutation cache reset', () => {
  beforeEach(() => {
    resetApolloClientForTests();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    resetApolloClientForTests();
  });

  it('awaits Apollo cache.reset after a successful mutation', async () => {
    const resetMock = vi.fn().mockResolvedValue(undefined);

    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        const body = JSON.stringify({ data: { mutateValue: 'ok' } });
        return {
          ok: true,
          status: 200,
          headers: new Headers({ 'Content-Type': 'application/json' }),
          json: async () => JSON.parse(body),
          text: async () => body,
        } as Response;
      }),
    );

    // Seed client, then spy reset on the live cache instance
    const { getApolloClient } = await import('@/lib/graphql/client');
    const client = getApolloClient();
    vi.spyOn(client.cache, 'reset').mockImplementation(resetMock);

    await executeMutation<{ mutateValue: string }>(TEST_MUTATION);

    expect(resetMock).toHaveBeenCalledTimes(1);
  });

  it('skips cache.reset when skipCacheReset is true', async () => {
    const resetMock = vi.fn().mockResolvedValue(undefined);

    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        const body = JSON.stringify({ data: { mutateValue: 'ok' } });
        return {
          ok: true,
          status: 200,
          headers: new Headers({ 'Content-Type': 'application/json' }),
          json: async () => JSON.parse(body),
          text: async () => body,
        } as Response;
      }),
    );

    const { getApolloClient } = await import('@/lib/graphql/client');
    const client = getApolloClient();
    vi.spyOn(client.cache, 'reset').mockImplementation(resetMock);

    await executeMutation<{ mutateValue: string }>(TEST_MUTATION, undefined, {
      skipCacheReset: true,
    });

    expect(resetMock).not.toHaveBeenCalled();
  });
});
