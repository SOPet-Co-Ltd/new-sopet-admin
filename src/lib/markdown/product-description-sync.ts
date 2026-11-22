import { MAX_DESCRIPTION_IMAGES } from './product-description-schema';

export function hasHtmlMarkup(source: string): boolean {
  return /<[^>]+>/.test(source);
}

type ImageLikeBlock = {
  type: string;
  props?: Record<string, unknown>;
};

export function countImageBlocks(blocks: ReadonlyArray<ImageLikeBlock>): number {
  return blocks.filter((block) => block.type === 'image' && Boolean(block.props?.url)).length;
}

export function assertDescriptionImageLimit(blocks: ReadonlyArray<ImageLikeBlock>): void {
  if (countImageBlocks(blocks) >= MAX_DESCRIPTION_IMAGES) {
    throw new Error(`สามารถเพิ่มรูปในรายละเอียดได้สูงสุด ${MAX_DESCRIPTION_IMAGES} รูป`);
  }
}

/** Normalize empty markdown so form values stay stable. */
export function normalizeDescriptionMarkdown(markdown: string): string {
  const trimmed = markdown.replace(/\u00a0/g, ' ').trim();
  return trimmed.length === 0 ? '' : markdown.replace(/\s+$/, '\n').replace(/^\s+/, '');
}

type ParseableEditor<TBlock> = {
  tryParseMarkdownToBlocks: (markdown: string) => TBlock[];
  tryParseHTMLToBlocks: (html: string) => TBlock[];
};

/** Parse stored description (markdown or legacy HTML) into BlockNote blocks. */
export function parseDescriptionToBlocks<TBlock>(
  editor: ParseableEditor<TBlock>,
  value: string,
): TBlock[] {
  const trimmed = value.trim();
  if (!trimmed) {
    return editor.tryParseMarkdownToBlocks('');
  }

  if (hasHtmlMarkup(trimmed)) {
    return editor.tryParseHTMLToBlocks(trimmed);
  }

  return editor.tryParseMarkdownToBlocks(trimmed);
}
