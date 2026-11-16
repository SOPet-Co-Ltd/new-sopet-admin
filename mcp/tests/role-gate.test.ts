import { describe, expect, it } from 'vitest';
import { SessionStore } from '../src/auth/session.js';
import { createToolContext, SopetGraphqlClient } from '../src/graphql/client.js';
import type { McpConfig } from '../src/config.js';
import { assertRole } from '../src/tools/types.js';
import { withStoreId } from '../src/tools/helpers.js';
import { allTools } from '../src/tools/registry.js';

const baseConfig: McpConfig = {
  graphqlUrl: 'http://localhost:3002/graphql',
  httpHost: '127.0.0.1',
  httpPort: 3101,
  allowedHosts: ['localhost', '127.0.0.1'],
};

describe('role gate', () => {
  it('rejects admin tools without an admin session', () => {
    const sessions = new SessionStore();
    sessions.set({
      role: 'vendor',
      tokens: { accessToken: 'a', refreshToken: 'r' },
      storeId: '11111111-1111-1111-1111-111111111111',
    });
    const ctx = createToolContext(
      baseConfig,
      sessions,
      new SopetGraphqlClient(baseConfig, sessions),
    );
    expect(() => assertRole(ctx, 'admin')).toThrow(/Admin session required/);
  });

  it('rejects vendor tools without a vendor session', () => {
    const sessions = new SessionStore();
    sessions.set({
      role: 'admin',
      tokens: { accessToken: 'a', refreshToken: 'r' },
    });
    const ctx = createToolContext(
      baseConfig,
      sessions,
      new SopetGraphqlClient(baseConfig, sessions),
    );
    expect(() => assertRole(ctx, 'vendor')).toThrow(/Vendor session required/);
  });

  it('prefers admin for store tools when both sessions exist', () => {
    const sessions = new SessionStore();
    sessions.set({
      role: 'admin',
      tokens: { accessToken: 'a', refreshToken: 'r' },
    });
    sessions.set({
      role: 'vendor',
      tokens: { accessToken: 'v', refreshToken: 'r' },
      storeId: '11111111-1111-1111-1111-111111111111',
    });
    const ctx = createToolContext(
      baseConfig,
      sessions,
      new SopetGraphqlClient(baseConfig, sessions),
    );
    expect(assertRole(ctx, 'store')).toBe('admin');
  });
});

describe('vendor store injection', () => {
  it('forces session storeId for vendor and ignores model storeId', () => {
    const sessions = new SessionStore();
    const locked = '22222222-2222-2222-2222-222222222222';
    sessions.set({
      role: 'vendor',
      tokens: { accessToken: 'a', refreshToken: 'r' },
      storeId: locked,
    });
    const ctx = createToolContext(
      baseConfig,
      sessions,
      new SopetGraphqlClient(baseConfig, sessions),
    );
    const result = withStoreId('vendor', ctx, {
      storeId: '33333333-3333-3333-3333-333333333333',
      name: 'x',
    });
    expect(result.storeId).toBe(locked);
  });

  it('requires storeId for admin store ops', () => {
    const sessions = new SessionStore();
    sessions.set({
      role: 'admin',
      tokens: { accessToken: 'a', refreshToken: 'r' },
    });
    const ctx = createToolContext(
      baseConfig,
      sessions,
      new SopetGraphqlClient(baseConfig, sessions),
    );
    expect(() => withStoreId('admin', ctx, { name: 'x' })).toThrow(/storeId is required/);
  });
});

describe('tool catalog', () => {
  it('includes create store and create product tools', () => {
    const names = allTools().map((t) => t.name);
    expect(names).toContain('admin_create_store');
    expect(names).toContain('store_create_product');
    expect(names).toContain('admin_list_stores');
  });
});
