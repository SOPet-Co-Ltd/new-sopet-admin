import { afterEach, describe, expect, it, vi } from 'vitest';

import { GET, revalidate } from './route';

const ORIGINAL_ENV = { ...process.env };

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
  vi.unstubAllEnvs();
});

describe('vendor api llms.txt route', () => {
  it('exports revalidate 86400', () => {
    expect(revalidate).toBe(86400);
  });

  it('returns plain text API guidance under 10 KB', async () => {
    vi.stubEnv('NEXT_PUBLIC_API_URL', 'https://api.sopet.org');

    const response = await GET(new Request('https://admin.sopet.org/vendor/api/llms.txt'));
    const body = await response.text();

    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toContain('text/plain');
    expect(response.headers.get('content-type')).toContain('charset=utf-8');
    expect(new TextEncoder().encode(body).length).toBeLessThan(10 * 1024);

    expect(body).toContain('# SOPET Vendor Product API');
    expect(body).toContain('https://admin.sopet.org/vendor/api/docs');
    expect(body).toContain('https://admin.sopet.org/vendor/api/llms.txt');
    expect(body).toContain('https://api.sopet.org');
    expect(body).toContain('POST');
    expect(body).toContain('/api/v1/stores/{storeId}/products');
    expect(body).toContain('Authorization: Bearer sopet_sk_...');
    expect(body).toContain('X-Api-Key: sopet_sk_...');
    expect(body).toContain('INVALID_API_KEY');
    expect(body).toContain('draft');
  });

  it('does not expose localhost API hosts', async () => {
    vi.stubEnv('NEXT_PUBLIC_API_URL', 'http://localhost:3002');

    const response = await GET(new Request('https://admin.sopet.org/vendor/api/llms.txt'));
    const body = await response.text();

    expect(body).toContain('{API_BASE_URL}');
    expect(body).toContain('Do not call GraphQL');
    expect(body).not.toMatch(/localhost:3002|127\.0\.0\.1|:3002/);
  });
});
