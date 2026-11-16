import { describe, expect, it } from 'vitest';
import { bearerMatches } from '../src/http-auth.js';

describe('HTTP bearer auth', () => {
  it('accepts the matching bearer token', () => {
    expect(bearerMatches('Bearer secret-token', 'secret-token')).toBe(true);
  });

  it('rejects missing or wrong tokens', () => {
    expect(bearerMatches(undefined, 'secret-token')).toBe(false);
    expect(bearerMatches('Bearer wrong', 'secret-token')).toBe(false);
    expect(bearerMatches('secret-token', 'secret-token')).toBe(false);
  });
});
