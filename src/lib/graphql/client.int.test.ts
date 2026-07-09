import { gql } from '@apollo/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { executeQuery, resetApolloClientForTests } from '@/lib/graphql/client';

const TEST_QUERY = gql`
  query TestValue {
    value
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

  it('serves repeated identical queries from cache under the default policy', async () => {
    const first = await executeQuery<{ value: string }>(TEST_QUERY);
    const second = await executeQuery<{ value: string }>(TEST_QUERY);

    expect(fetchCallCount).toBe(1);
    expect(first.value).toBe('fixture-a');
    expect(second.value).toBe('fixture-a');
  });

  it('issues a fresh network request when network-only is explicitly requested', async () => {
    await executeQuery<{ value: string }>(TEST_QUERY);

    const fresh = await executeQuery<{ value: string }>(TEST_QUERY, undefined, {
      fetchPolicy: 'network-only',
    });

    expect(fetchCallCount).toBe(2);
    expect(fresh.value).toBe('fixture-b');
  });
});
