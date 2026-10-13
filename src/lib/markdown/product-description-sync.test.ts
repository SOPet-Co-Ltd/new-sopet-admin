import { describe, expect, it, vi } from 'vitest';
import {
  assertDescriptionImageLimit,
  countImageBlocks,
  hasHtmlMarkup,
  normalizeDescriptionMarkdown,
  parseDescriptionToBlocks,
} from './product-description-sync';
import { MAX_DESCRIPTION_IMAGES } from './product-description-schema';

describe('product-description-sync', () => {
  it('detects HTML markup', () => {
    expect(hasHtmlMarkup('<p>Hello</p>')).toBe(true);
    expect(hasHtmlMarkup('## Hello')).toBe(false);
  });

  it('counts only image blocks that already have a URL', () => {
    expect(
      countImageBlocks([
        { type: 'paragraph' },
        { type: 'image', props: { url: 'https://cdn.example.com/a.webp' } },
        { type: 'image', props: { url: '' } },
      ]),
    ).toBe(1);
  });

  it('enforces the description image limit', () => {
    const blocks = Array.from({ length: MAX_DESCRIPTION_IMAGES }, () => ({
      type: 'image',
      props: { url: 'https://cdn.example.com/a.webp' },
    }));

    expect(() => assertDescriptionImageLimit(blocks)).toThrow(/สูงสุด/);
    expect(() => assertDescriptionImageLimit(blocks.slice(0, 1))).not.toThrow();
  });

  it('normalizes blank markdown to empty string', () => {
    expect(normalizeDescriptionMarkdown('   \n')).toBe('');
    expect(normalizeDescriptionMarkdown('Hello  \n')).toBe('Hello\n');
  });

  it('parses markdown vs HTML with the editor helpers', () => {
    const tryParseMarkdownToBlocks = vi.fn().mockReturnValue([{ type: 'paragraph' }]);
    const tryParseHTMLToBlocks = vi.fn().mockReturnValue([{ type: 'paragraph' }]);
    const editor = { tryParseMarkdownToBlocks, tryParseHTMLToBlocks };

    parseDescriptionToBlocks(editor, '## Title');
    expect(tryParseMarkdownToBlocks).toHaveBeenCalledWith('## Title');

    parseDescriptionToBlocks(editor, '<p>Hi</p>');
    expect(tryParseHTMLToBlocks).toHaveBeenCalledWith('<p>Hi</p>');

    parseDescriptionToBlocks(editor, '   ');
    expect(tryParseMarkdownToBlocks).toHaveBeenCalledWith('');
  });
});
