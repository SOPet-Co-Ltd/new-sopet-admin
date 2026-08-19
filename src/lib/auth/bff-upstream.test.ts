import { describe, expect, it } from 'vitest';
import { buildUpstreamRequestHeaders, harvestAuthTokens, redactAuthTokens } from './bff-upstream';
import { assertSameOrigin } from './bff-csrf';

describe('buildUpstreamRequestHeaders', () => {
  it('forwards x-request-id and stamps the visitor IP for audit logs', () => {
    const request = new Request('http://localhost:3001/graphql', {
      method: 'POST',
      headers: {
        'x-request-id': 'req-browser-1',
        'x-forwarded-for': '203.0.113.10',
      },
    });

    expect(buildUpstreamRequestHeaders(request)).toEqual({
      'x-request-id': 'req-browser-1',
      'x-sopet-client-ip': '203.0.113.10',
      'x-forwarded-for': '203.0.113.10',
    });
  });

  it('prefers x-vercel-forwarded-for over a Vercel egress hop in x-forwarded-for', () => {
    const request = new Request('http://localhost:3001/graphql', {
      method: 'POST',
      headers: {
        'x-forwarded-for': '3.82.112.93',
        'x-vercel-forwarded-for': '203.0.113.10',
      },
    });

    expect(buildUpstreamRequestHeaders(request)).toEqual({
      'x-request-id': expect.any(String),
      'x-sopet-client-ip': '203.0.113.10',
      'x-forwarded-for': '203.0.113.10',
    });
  });

  it('uses x-real-ip when x-forwarded-for is absent', () => {
    const request = new Request('http://localhost:3001/graphql', {
      method: 'POST',
      headers: {
        'x-real-ip': '198.51.100.7',
      },
    });

    expect(buildUpstreamRequestHeaders(request)).toEqual({
      'x-request-id': expect.any(String),
      'x-sopet-client-ip': '198.51.100.7',
      'x-forwarded-for': '198.51.100.7',
    });
  });

  it('generates x-request-id when the browser did not send one', () => {
    const request = new Request('http://localhost:3001/graphql', { method: 'POST' });
    const headers = buildUpstreamRequestHeaders(request);

    expect(headers['x-request-id']).toEqual(expect.any(String));
    expect(headers['x-request-id']?.length).toBeGreaterThan(0);
    expect(headers).not.toHaveProperty('x-forwarded-for');
    expect(headers).not.toHaveProperty('x-sopet-client-ip');
  });
});

describe('harvestAuthTokens', () => {
  it('harvests vendor login tokens', () => {
    expect(
      harvestAuthTokens({
        vendorLogin: {
          tokens: { accessToken: 'a', refreshToken: 'r' },
          user: { id: '1' },
        },
      }),
    ).toEqual({ accessToken: 'a', refreshToken: 'r' });
  });
});

describe('redactAuthTokens', () => {
  it('nulls JWT string fields', () => {
    expect(
      redactAuthTokens({
        vendorLogin: {
          tokens: { accessToken: 'a', refreshToken: 'r' },
        },
      }),
    ).toEqual({
      vendorLogin: {
        tokens: { accessToken: null, refreshToken: null },
      },
    });
  });
});

describe('assertSameOrigin', () => {
  it('allows localhost admin origin', () => {
    const request = new Request('http://localhost:3001/api/auth/logout', {
      method: 'POST',
      headers: { Origin: 'http://localhost:3001' },
    });
    expect(assertSameOrigin(request)).toBeNull();
  });

  it('rejects foreign origin', () => {
    const request = new Request('http://localhost:3001/api/auth/logout', {
      method: 'POST',
      headers: { Origin: 'https://evil.example' },
    });
    expect(assertSameOrigin(request)?.status).toBe(403);
  });
});
