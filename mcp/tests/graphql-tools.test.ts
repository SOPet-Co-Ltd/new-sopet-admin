import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { SessionStore } from '../src/auth/session.js';
import { createToolContext, SopetGraphqlClient } from '../src/graphql/client.js';
import type { McpConfig } from '../src/config.js';
import { allTools } from '../src/tools/registry.js';

const config: McpConfig = {
  graphqlUrl: 'http://graphql.test/graphql',
  httpHost: '127.0.0.1',
  httpPort: 3101,
  allowedHosts: ['localhost', '127.0.0.1'],
};

describe('mocked GraphQL tool round-trips', () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  function adminCtx() {
    const sessions = new SessionStore();
    sessions.set({
      role: 'admin',
      tokens: { accessToken: 'admin-token', refreshToken: 'refresh' },
      userId: 'admin-1',
    });
    const gql = new SopetGraphqlClient(config, sessions);
    return createToolContext(config, sessions, gql);
  }

  it('admin_create_store posts CreateStoreAsAdmin', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        data: {
          createStoreAsAdmin: {
            id: 'store-1',
            name: 'Pet Shop',
            status: 'approved',
          },
        },
      }),
    });

    const tool = allTools().find((t) => t.name === 'admin_create_store');
    expect(tool).toBeDefined();
    const result = await tool!.execute(
      {
        ownerUserId: '11111111-1111-1111-1111-111111111111',
        name: 'Pet Shop',
      },
      adminCtx(),
    );

    expect(result).toMatchObject({ id: 'store-1', name: 'Pet Shop' });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const body = JSON.parse(fetchMock.mock.calls[0][1].body as string);
    expect(body.query).toContain('createStoreAsAdmin');
    expect(fetchMock.mock.calls[0][1].headers.authorization).toBe('Bearer admin-token');
  });

  it('store_create_product uses admin JWT and storeId', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        data: {
          createProduct: {
            id: 'product-1',
            name: 'Dog Food',
            storeId: '22222222-2222-2222-2222-222222222222',
          },
        },
      }),
    });

    const tool = allTools().find((t) => t.name === 'store_create_product');
    expect(tool).toBeDefined();
    const result = await tool!.execute(
      {
        storeId: '22222222-2222-2222-2222-222222222222',
        name: 'Dog Food',
        basePrice: 199,
      },
      adminCtx(),
    );

    expect(result).toMatchObject({ id: 'product-1', name: 'Dog Food' });
    const body = JSON.parse(fetchMock.mock.calls[0][1].body as string);
    expect(body.query).toContain('createProduct');
    expect(body.variables.storeId).toBe('22222222-2222-2222-2222-222222222222');
    expect(body.variables.input.name).toBe('Dog Food');
  });
});
