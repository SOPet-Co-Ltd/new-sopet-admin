import { describe, expect, it } from 'vitest';
import { getSafeRedirect } from './safe-redirect';

const ORIGIN = 'https://admin.sopet.org';

describe('getSafeRedirect', () => {
  it('allows valid admin and vendor paths', () => {
    expect(getSafeRedirect('/admin', ORIGIN)).toBe('/admin');
    expect(getSafeRedirect('/admin/stores', ORIGIN)).toBe('/admin/stores');
    expect(getSafeRedirect('/admin/orders/abc-123', ORIGIN)).toBe('/admin/orders/abc-123');
    expect(getSafeRedirect('/vendor', ORIGIN)).toBe('/vendor');
    expect(getSafeRedirect('/vendor/products', ORIGIN)).toBe('/vendor/products');
    expect(getSafeRedirect('/vendor/settings._~', ORIGIN)).toBe('/vendor/settings._~');
  });

  it('rejects null, empty, and non-path values', () => {
    expect(getSafeRedirect(null, ORIGIN)).toBeNull();
    expect(getSafeRedirect('', ORIGIN)).toBeNull();
    expect(getSafeRedirect('   ', ORIGIN)).toBeNull();
    expect(getSafeRedirect('admin/stores', ORIGIN)).toBeNull();
    expect(getSafeRedirect('https://evil.com', ORIGIN)).toBeNull();
    expect(getSafeRedirect('javascript:alert(1)', ORIGIN)).toBeNull();
    expect(getSafeRedirect('data:text/html,hi', ORIGIN)).toBeNull();
  });

  it('rejects protocol-relative and double-slash bypasses', () => {
    expect(getSafeRedirect('//evil.com', ORIGIN)).toBeNull();
    expect(getSafeRedirect('//evil.com/phish', ORIGIN)).toBeNull();
    expect(getSafeRedirect('//@evil.com', ORIGIN)).toBeNull();
    expect(getSafeRedirect('/\\evil', ORIGIN)).toBeNull();
    expect(getSafeRedirect('/\\\\evil.com', ORIGIN)).toBeNull();
    expect(getSafeRedirect('/admin//evil', ORIGIN)).toBeNull();
  });

  it('rejects encoded protocol-relative and slash bypasses', () => {
    expect(getSafeRedirect('/%2f%2f', ORIGIN)).toBeNull();
    expect(getSafeRedirect('/%2F%2Fevil.com', ORIGIN)).toBeNull();
    expect(getSafeRedirect('/%5cevil', ORIGIN)).toBeNull();
    expect(getSafeRedirect('/%5Cevil.com', ORIGIN)).toBeNull();
    expect(getSafeRedirect('/%40evil.com', ORIGIN)).toBeNull();
  });

  it('rejects @ credential / host-confusion forms', () => {
    expect(getSafeRedirect('/@evil.com', ORIGIN)).toBeNull();
    expect(getSafeRedirect('/admin@evil.com', ORIGIN)).toBeNull();
    expect(getSafeRedirect('/user:pass@evil.com', ORIGIN)).toBeNull();
  });

  it('rejects query, hash, and unsafe characters', () => {
    expect(getSafeRedirect('/admin?next=//evil.com', ORIGIN)).toBeNull();
    expect(getSafeRedirect('/admin#//evil.com', ORIGIN)).toBeNull();
    expect(getSafeRedirect('/admin/<script>', ORIGIN)).toBeNull();
    expect(getSafeRedirect('/admin spaces', ORIGIN)).toBeNull();
  });

  it('rejects cross-origin absolute paths that URL parsing would escape to another host', () => {
    // Still a relative path string starting with /; ensure // and @ already blocked.
    expect(getSafeRedirect('///evil.com', ORIGIN)).toBeNull();
  });
});
