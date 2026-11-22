import { describe, expect, it } from 'vitest';
import { listMissingHelpFiles, loadHelpArticleMarkdown } from './load-article';
import { getHelpArticles } from './registry';

describe('help markdown files', () => {
  it('has a markdown file for every registered article', () => {
    expect(listMissingHelpFiles()).toEqual([]);
  });

  it('loads non-empty markdown for each admin and vendor article', () => {
    for (const role of ['admin', 'vendor'] as const) {
      for (const article of getHelpArticles(role)) {
        const markdown = loadHelpArticleMarkdown(role, article.slug);
        expect(markdown, `${role}/${article.slug}`).toBeTruthy();
        expect(markdown!.trim().length).toBeGreaterThan(40);
      }
    }
  });
});
