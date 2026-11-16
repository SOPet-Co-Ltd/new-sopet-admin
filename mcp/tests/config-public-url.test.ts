import { afterEach, describe, expect, it } from 'vitest';
import { loadConfig, mcpEndpointUrl } from '../src/config.js';

const keys = [
  'SOPET_GRAPHQL_URL',
  'SOPET_ADMIN_EMAIL',
  'SOPET_ADMIN_PASSWORD',
  'MCP_HTTP_HOST',
  'MCP_HTTP_PORT',
  'MCP_HTTP_TOKEN',
  'MCP_PUBLIC_URL',
  'MCP_ALLOWED_HOSTS',
  'NODE_ENV',
] as const;

describe('public URL config', () => {
  afterEach(() => {
    for (const key of keys) {
      delete process.env[key];
    }
  });

  it('builds the online mcpUrl from MCP_PUBLIC_URL', () => {
    process.env.SOPET_ADMIN_EMAIL = 'admin@sopet.org';
    process.env.SOPET_ADMIN_PASSWORD = 'secret';
    process.env.MCP_HTTP_TOKEN = 'token';
    process.env.MCP_PUBLIC_URL = 'https://mcp-admin.example.com/';

    const config = loadConfig({ requireHttpAuth: true });
    expect(config.httpHost).toBe('0.0.0.0');
    expect(config.publicUrl).toBe('https://mcp-admin.example.com');
    expect(config.allowedHosts).toContain('mcp-admin.example.com');
    expect(mcpEndpointUrl(config)).toBe('https://mcp-admin.example.com/mcp');
  });

  it('rejects invalid MCP_PUBLIC_URL', () => {
    process.env.SOPET_ADMIN_EMAIL = 'admin@sopet.org';
    process.env.SOPET_ADMIN_PASSWORD = 'secret';
    process.env.MCP_HTTP_TOKEN = 'token';
    process.env.MCP_PUBLIC_URL = 'not-a-url';

    expect(() => loadConfig({ requireHttpAuth: true })).toThrow(/MCP_PUBLIC_URL/);
  });
});
