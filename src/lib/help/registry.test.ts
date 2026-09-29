import { describe, expect, it } from 'vitest';
import {
  getAdjacentArticles,
  getHelpArticle,
  getHelpArticles,
  getHelpSections,
  helpArticleHref,
  helpBasePath,
  HELP_ARTICLES,
} from './registry';

describe('help registry', () => {
  it('returns sorted articles per role without mixing roles', () => {
    const admin = getHelpArticles('admin');
    const vendor = getHelpArticles('vendor');

    expect(admin.every((a) => a.role === 'admin')).toBe(true);
    expect(vendor.every((a) => a.role === 'vendor')).toBe(true);
    expect(admin.length + vendor.length).toBe(HELP_ARTICLES.length);

    for (let i = 1; i < admin.length; i += 1) {
      expect(admin[i]!.order).toBeGreaterThanOrEqual(admin[i - 1]!.order);
    }
  });

  it('resolves articles by slug', () => {
    expect(getHelpArticle('admin', 'stores')?.title).toContain('ร้านค้า');
    expect(getHelpArticle('vendor', 'orders')?.title).toContain('คำสั่งซื้อ');
    expect(getHelpArticle('admin', 'orders')).toBeUndefined();
  });

  it('builds section groups in first-seen order', () => {
    const sections = getHelpSections('vendor');
    expect(sections[0]?.section).toBe('เริ่มต้น');
    expect(sections.some((s) => s.section === 'ขาย')).toBe(true);
  });

  it('returns adjacent articles for prev/next navigation', () => {
    const articles = getHelpArticles('admin');
    const first = articles[0]!;
    const second = articles[1]!;
    const last = articles[articles.length - 1]!;

    expect(getAdjacentArticles('admin', first.slug)).toEqual({ prev: null, next: second });
    expect(getAdjacentArticles('admin', last.slug).next).toBeNull();
    expect(getAdjacentArticles('admin', second.slug).prev?.slug).toBe(first.slug);
  });

  it('builds help hrefs', () => {
    expect(helpArticleHref('admin', 'analytics')).toBe('/guide/admin/analytics');
    expect(helpArticleHref('vendor', 'products')).toBe('/guide/vendor/products');
    expect(helpBasePath('admin')).toBe('/guide/admin');
    expect(helpBasePath('vendor')).toBe('/guide/vendor');
  });

  it('has unique slugs within each role', () => {
    for (const role of ['admin', 'vendor'] as const) {
      const slugs = getHelpArticles(role).map((a) => a.slug);
      expect(new Set(slugs).size).toBe(slugs.length);
    }
  });
});
