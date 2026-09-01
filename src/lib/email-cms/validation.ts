/**
 * Client-side helpers mirroring the backend email-safe HTML + placeholder
 * validation rules (see docs/design/email-cms-design.md § Email-safe HTML
 * Validation). These provide fast feedback before Save; the backend is the
 * source of truth and its errors are always surfaced to the admin as well.
 */

/** System placeholders available inside container shells (not admin-editable). */
export const SYSTEM_CONTAINER_PLACEHOLDERS = ['logoUrl'];

const CONTENT_SLOT_PATTERN = /\{\{\{\s*content\s*\}\}\}/g;
const DOUBLE_VAR_PATTERN = /\{\{\s*([a-zA-Z][a-zA-Z0-9_]*)\s*\}\}/g;
const BLOCKED_HTML_PATTERNS: { code: string; message: string; pattern: RegExp }[] = [
  { code: 'SCRIPT_TAG', message: 'ห้ามใส่แท็ก <script>', pattern: /<script/i },
  {
    code: 'JAVASCRIPT_URL',
    message: 'ห้ามใช้ลิงก์ javascript:',
    pattern: /(?:href|src)\s*=\s*["']?\s*javascript:/i,
  },
  { code: 'IFRAME_TAG', message: 'ห้ามใส่แท็ก <iframe>', pattern: /<iframe/i },
  { code: 'OBJECT_TAG', message: 'ห้ามใส่แท็ก <object>', pattern: /<object/i },
  { code: 'EMBED_TAG', message: 'ห้ามใส่แท็ก <embed>', pattern: /<embed/i },
  { code: 'FORM_TAG', message: 'ห้ามใส่แท็ก <form>', pattern: /<form/i },
  {
    code: 'EVENT_HANDLER',
    message: 'ห้ามใส่ event handler เช่น onclick=',
    pattern: /\son[a-z]+\s*=/i,
  },
];

/** Counts literal `{{{content}}}` occurrences in a container shell. */
export function countContentSlotOccurrences(html: string): number {
  return (html.match(CONTENT_SLOT_PATTERN) ?? []).length;
}

/**
 * Finds `{{var}}` tokens in `text` that are not in `allowedNames`.
 * When `stripContentSlot` is true, `{{{content}}}` slots are removed first so
 * they are never mistaken for an unknown double-brace variable.
 */
export function findUnknownPlaceholders(
  text: string,
  allowedNames: string[],
  options?: { stripContentSlot?: boolean },
): string[] {
  const allowedSet = new Set(allowedNames);
  const source = options?.stripContentSlot ? text.replace(CONTENT_SLOT_PATTERN, '') : text;
  const unknown = new Set<string>();

  for (const match of source.matchAll(DOUBLE_VAR_PATTERN)) {
    const name = match[1];
    if (!allowedSet.has(name)) {
      unknown.add(name);
    }
  }

  return Array.from(unknown);
}

/** Finds blocked HTML constructs (script tags, event handlers, etc.). */
export function findBlockedHtmlConstructs(html: string): string[] {
  return BLOCKED_HTML_PATTERNS.filter(({ pattern }) => pattern.test(html)).map(
    ({ message }) => message,
  );
}

export type EmailContainerShellValidationResult = {
  valid: boolean;
  errors: string[];
};

/** Validates a container's `htmlShell`: exactly one content slot, no blocked HTML, no unknown vars. */
export function validateContainerShell(html: string): EmailContainerShellValidationResult {
  const errors: string[] = [];
  const trimmed = html.trim();

  if (!trimmed) {
    errors.push('กรุณากรอก HTML โครงคอนเทนเนอร์');
    return { valid: false, errors };
  }

  const slotCount = countContentSlotOccurrences(html);
  if (slotCount === 0) {
    errors.push('คอนเทนเนอร์ต้องมี {{{content}}} สำหรับแทรกเนื้อหาเทมเพลต');
  } else if (slotCount > 1) {
    errors.push('คอนเทนเนอร์ต้องมี {{{content}}} เพียงตำแหน่งเดียว');
  }

  errors.push(...findBlockedHtmlConstructs(html));

  const unknownVars = findUnknownPlaceholders(html, SYSTEM_CONTAINER_PLACEHOLDERS, {
    stripContentSlot: true,
  });
  if (unknownVars.length > 0) {
    errors.push(
      `พบตัวแปรที่ไม่รองรับ: ${unknownVars.map((name) => `{{${name}}}`).join(', ')} — แก้ไขก่อนบันทึก`,
    );
  }

  return { valid: errors.length === 0, errors };
}

export type EmailContentFieldValidationResult = {
  valid: boolean;
  errors: string[];
  unknownPlaceholders: string[];
};

/** Validates a content template field (subject/body/text) against its allowed placeholder registry. */
export function validateContentTemplateField(
  text: string,
  allowedNames: string[],
  options?: { required?: boolean },
): EmailContentFieldValidationResult {
  const errors: string[] = [];

  if (options?.required && !text.trim()) {
    errors.push('ห้ามเว้นว่าง');
  }

  errors.push(...findBlockedHtmlConstructs(text));

  const unknownPlaceholders = findUnknownPlaceholders(text, allowedNames);
  if (unknownPlaceholders.length > 0) {
    errors.push(
      `พบตัวแปรที่ไม่รองรับ: ${unknownPlaceholders.map((name) => `{{${name}}}`).join(', ')} — แก้ไขก่อนบันทึก`,
    );
  }

  return { valid: errors.length === 0, errors, unknownPlaceholders };
}
