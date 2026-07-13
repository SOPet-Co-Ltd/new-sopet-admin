import { describe, expect, it } from 'vitest';
import { insertMarkdownAtCursor } from '@/lib/markdown/insert-markdown';

describe('insertMarkdownAtCursor', () => {
  it('wraps selected text in bold markers', () => {
    const result = insertMarkdownAtCursor('Hello world', 6, 11, 'bold');

    expect(result.nextValue).toBe('Hello **world**');
    expect(result.selectionStart).toBe(6);
    expect(result.selectionEnd).toBe(15);
  });

  it('inserts placeholder bold text when nothing is selected', () => {
    const result = insertMarkdownAtCursor('Hello', 5, 5, 'bold');

    expect(result.nextValue).toBe('Hello**ข้อความ**');
    expect(result.selectionStart).toBe(7);
    expect(result.selectionEnd).toBe(14);
  });

  it('prefixes the current line with an h2 marker', () => {
    const result = insertMarkdownAtCursor('Title\nBody', 0, 0, 'h2');

    expect(result.nextValue).toBe('## Title\nBody');
    expect(result.selectionStart).toBe(3);
    expect(result.selectionEnd).toBe(3);
  });

  it('prefixes the current line with a bullet list marker', () => {
    const result = insertMarkdownAtCursor('Item one', 0, 0, 'ul');

    expect(result.nextValue).toBe('- Item one');
  });

  it('inserts a link template when nothing is selected', () => {
    const result = insertMarkdownAtCursor('See ', 4, 4, 'link');

    expect(result.nextValue).toBe('See [ข้อความ](https://)');
    expect(result.selectionStart).toBe(5);
    expect(result.selectionEnd).toBe(12);
  });

  it('wraps selected text in a markdown link', () => {
    const result = insertMarkdownAtCursor('Visit docs', 6, 10, 'link');

    expect(result.nextValue).toBe('Visit [docs](https://)');
    expect(result.selectionStart).toBe(13);
    expect(result.selectionEnd).toBe(20);
  });
});
