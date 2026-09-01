import { afterEach, describe, expect, it, vi } from 'vitest';

import { getApiBaseUrl, resolveBrowserGraphqlUrl, resolvePublicApiBaseUrl } from './config';

const ORIGINAL_ENV = { ...process.env };

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe('getApiBaseUrl', () => {
  it('prefers NEXT_PUBLIC_API_URL', () => {
    vi.stubEnv('NEXT_PUBLIC_API_URL', 'https://api.sopet.org/');
    expect(getApiBaseUrl()).toBe('https://api.sopet.org');
  });

  it('derives from GRAPHQL_SSR_URL on the server', () => {
    vi.stubEnv('NEXT_PUBLIC_API_URL', undefined as unknown as string);
    delete process.env.NEXT_PUBLIC_API_URL;
    vi.stubEnv('GRAPHQL_SSR_URL', 'https://api-uat.sopet.org/graphql');
    vi.stubGlobal('window', undefined);
    expect(getApiBaseUrl()).toBe('https://api-uat.sopet.org');
  });
});

describe('resolveBrowserGraphqlUrl', () => {
  it('defaults to the same-origin BFF path', () => {
    expect(resolveBrowserGraphqlUrl(undefined)).toBe('/graphql');
    expect(resolveBrowserGraphqlUrl('')).toBe('/graphql');
  });

  it('keeps a same-origin relative path', () => {
    expect(resolveBrowserGraphqlUrl('/graphql')).toBe('/graphql');
    expect(resolveBrowserGraphqlUrl('/api/graphql')).toBe('/api/graphql');
  });

  it('rejects absolute and protocol-relative URLs that would violate CSP', () => {
    expect(resolveBrowserGraphqlUrl('http://localhost:3002/graphql')).toBe('/graphql');
    expect(resolveBrowserGraphqlUrl('https://api.sopet.org/graphql')).toBe('/graphql');
    expect(resolveBrowserGraphqlUrl('//evil.example/graphql')).toBe('/graphql');
  });
});

describe('resolvePublicApiBaseUrl', () => {
  it('returns the configured public API host', () => {
    vi.stubEnv('NEXT_PUBLIC_API_URL', 'https://api.sopet.org');
    expect(resolvePublicApiBaseUrl()).toBe('https://api.sopet.org');
  });

  it('does not advertise localhost backends', () => {
    vi.stubEnv('NEXT_PUBLIC_API_URL', 'http://localhost:3002');
    expect(resolvePublicApiBaseUrl()).toBe('{API_BASE_URL}');
  });
});
