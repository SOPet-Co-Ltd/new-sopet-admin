import { describe, expect, it } from 'vitest';
import {
  parseDateParam,
  parseEnumParam,
  parseIdParam,
  parseOptionalNumber,
  parsePageParam,
  parseSearchQuery,
  serializeDateParam,
  serializeEnumParam,
  serializeIdParam,
  serializeOptionalNumber,
  serializePageParam,
  serializeSearchQuery,
} from './list-query-params';

describe('parsePageParam', () => {
  it('defaults missing/invalid values to 1', () => {
    expect(parsePageParam(null)).toBe(1);
    expect(parsePageParam(undefined)).toBe(1);
    expect(parsePageParam('')).toBe(1);
    expect(parsePageParam('0')).toBe(1);
    expect(parsePageParam('-2')).toBe(1);
    expect(parsePageParam('abc')).toBe(1);
  });

  it('parses positive integers', () => {
    expect(parsePageParam('2')).toBe(2);
    expect(parsePageParam('10')).toBe(10);
  });
});

describe('serializePageParam', () => {
  it('omits page 1 and serializes higher pages', () => {
    expect(serializePageParam(1)).toBeNull();
    expect(serializePageParam(2)).toBe('2');
  });
});

describe('parseSearchQuery / serializeSearchQuery', () => {
  it('trims and omits empty search', () => {
    expect(parseSearchQuery('  dog  ')).toBe('dog');
    expect(parseSearchQuery(null)).toBe('');
    expect(serializeSearchQuery('')).toBeNull();
    expect(serializeSearchQuery('  ')).toBeNull();
    expect(serializeSearchQuery(' dog ')).toBe('dog');
  });
});

describe('parseEnumParam / serializeEnumParam', () => {
  const allowed = ['all', 'draft', 'published'] as const;

  it('falls back when value is missing or unknown', () => {
    expect(parseEnumParam(null, allowed, 'all')).toBe('all');
    expect(parseEnumParam('nope', allowed, 'all')).toBe('all');
    expect(parseEnumParam('draft', allowed, 'all')).toBe('draft');
  });

  it('omits the default enum value', () => {
    expect(serializeEnumParam('all', 'all')).toBeNull();
    expect(serializeEnumParam('draft', 'all')).toBe('draft');
  });
});

describe('parseOptionalNumber / serializeOptionalNumber', () => {
  it('parses finite numbers and omits empty', () => {
    expect(parseOptionalNumber(null)).toBeUndefined();
    expect(parseOptionalNumber('')).toBeUndefined();
    expect(parseOptionalNumber('abc')).toBeUndefined();
    expect(parseOptionalNumber('120')).toBe(120);
    expect(serializeOptionalNumber(undefined)).toBeNull();
    expect(serializeOptionalNumber(50)).toBe('50');
  });
});

describe('parseDateParam / serializeDateParam', () => {
  it('accepts YYYY-MM-DD only', () => {
    expect(parseDateParam('2026-07-14')).toBe('2026-07-14');
    expect(parseDateParam('14/07/2026')).toBe('');
    expect(parseDateParam(null)).toBe('');
    expect(serializeDateParam('')).toBeNull();
    expect(serializeDateParam('2026-07-14')).toBe('2026-07-14');
  });
});

describe('parseIdParam / serializeIdParam', () => {
  it('treats empty as all and omits all from the URL', () => {
    expect(parseIdParam(null)).toBe('all');
    expect(parseIdParam('cat-1')).toBe('cat-1');
    expect(serializeIdParam('all')).toBeNull();
    expect(serializeIdParam('cat-1')).toBe('cat-1');
  });
});
