import { describe, expect, it } from 'vitest';
import nextConfig from '../../next.config';

describe('next.config security headers', () => {
  it('sets CSP, HSTS, and frame protection on all routes', async () => {
    const headers = await nextConfig.headers?.();
    const globalHeaders = headers?.find((entry) => entry.source === '/:path*')?.headers ?? [];
    const byKey = Object.fromEntries(globalHeaders.map((h) => [h.key, h.value]));

    expect(byKey['Content-Security-Policy']).toContain("frame-ancestors 'none'");
    expect(byKey['Strict-Transport-Security']).toContain('max-age=63072000');
    expect(byKey['X-Frame-Options']).toBe('DENY');
    expect(byKey['X-Content-Type-Options']).toBe('nosniff');
  });
});
