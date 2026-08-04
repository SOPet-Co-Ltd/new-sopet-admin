import { describe, expect, it } from 'vitest';
import { harvestAuthTokens, redactAuthTokens } from './bff-upstream';
import { assertSameOrigin } from './bff-csrf';

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
