import {
  BlockNoteSchema,
  defaultBlockSpecs,
  defaultInlineContentSpecs,
  defaultStyleSpecs,
} from '@blocknote/core';

/** BlockNote schema limited to product-description blocks. */
export const productDescriptionSchema = BlockNoteSchema.create({
  blockSpecs: {
    paragraph: defaultBlockSpecs.paragraph,
    heading: defaultBlockSpecs.heading,
    bulletListItem: defaultBlockSpecs.bulletListItem,
    numberedListItem: defaultBlockSpecs.numberedListItem,
    quote: defaultBlockSpecs.quote,
    codeBlock: defaultBlockSpecs.codeBlock,
    divider: defaultBlockSpecs.divider,
    image: defaultBlockSpecs.image,
  },
  inlineContentSpecs: defaultInlineContentSpecs,
  styleSpecs: defaultStyleSpecs,
});

export type ProductDescriptionEditorType = typeof productDescriptionSchema.BlockNoteEditor;

/** Slash-menu keys exposed to vendors. */
export const PRODUCT_DESCRIPTION_SLASH_KEYS = new Set([
  'heading_2',
  'heading_3',
  'paragraph',
  'bullet_list',
  'numbered_list',
  'quote',
  'code_block',
  'divider',
  'image',
]);

export const MAX_DESCRIPTION_IMAGES = 10;

export const DESCRIPTION_IMAGE_LIMIT_MESSAGE = `สามารถเพิ่มรูปในรายละเอียดได้สูงสุด ${MAX_DESCRIPTION_IMAGES} รูป`;
