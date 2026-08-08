import { describe, expect, it } from 'vitest';
import {
  countContentSlotOccurrences,
  findBlockedHtmlConstructs,
  findUnknownPlaceholders,
  validateContainerShell,
  validateContentTemplateField,
} from './validation';

describe('countContentSlotOccurrences', () => {
  it('counts exactly one slot', () => {
    expect(countContentSlotOccurrences('<div>{{{content}}}</div>')).toBe(1);
  });

  it('counts zero when missing', () => {
    expect(countContentSlotOccurrences('<div>no slot here</div>')).toBe(0);
  });

  it('counts duplicates', () => {
    expect(countContentSlotOccurrences('{{{content}}}...{{{content}}}')).toBe(2);
  });
});

describe('findUnknownPlaceholders', () => {
  it('returns no unknowns when every var is allowed', () => {
    const result = findUnknownPlaceholders('สวัสดี {{inviteUrl}}', ['inviteUrl']);
    expect(result).toEqual([]);
  });

  it('flags vars not present in the allowed list', () => {
    const result = findUnknownPlaceholders('สวัสดี {{notARealVar}}', ['inviteUrl']);
    expect(result).toEqual(['notARealVar']);
  });

  it('does not mistake the {{{content}}} slot for an unknown var when stripped', () => {
    const result = findUnknownPlaceholders('<div>{{{content}}}</div>', ['logoUrl'], {
      stripContentSlot: true,
    });
    expect(result).toEqual([]);
  });

  it('deduplicates repeated unknown vars', () => {
    const result = findUnknownPlaceholders('{{foo}} and {{foo}} again', []);
    expect(result).toEqual(['foo']);
  });
});

describe('findBlockedHtmlConstructs', () => {
  it('flags script tags', () => {
    expect(findBlockedHtmlConstructs('<script>alert(1)</script>').length).toBeGreaterThan(0);
  });

  it('flags event handler attributes', () => {
    expect(findBlockedHtmlConstructs('<img src="x" onerror="alert(1)">').length).toBeGreaterThan(0);
  });

  it('allows plain email-safe html', () => {
    expect(
      findBlockedHtmlConstructs('<table><tr><td style="color:#000">Hi</td></tr></table>'),
    ).toEqual([]);
  });
});

describe('validateContainerShell', () => {
  it('rejects an empty shell', () => {
    const result = validateContainerShell('   ');
    expect(result.valid).toBe(false);
    expect(result.errors.some((message) => message.includes('กรุณากรอก'))).toBe(true);
  });

  it('rejects a shell missing the {{{content}}} slot', () => {
    const result = validateContainerShell('<html><body>no slot</body></html>');
    expect(result.valid).toBe(false);
    expect(result.errors.some((message) => message.includes('{{{content}}}'))).toBe(true);
  });

  it('rejects a shell with more than one {{{content}}} slot', () => {
    const result = validateContainerShell('<div>{{{content}}}{{{content}}}</div>');
    expect(result.valid).toBe(false);
    expect(result.errors.some((message) => message.includes('เพียงตำแหน่งเดียว'))).toBe(true);
  });

  it('rejects a shell with blocked constructs', () => {
    const result = validateContainerShell('<div>{{{content}}}<script>bad()</script></div>');
    expect(result.valid).toBe(false);
  });

  it('accepts a valid shell with the system logoUrl placeholder', () => {
    const result = validateContainerShell(
      '<html><body><img src="{{logoUrl}}" />{{{content}}}</body></html>',
    );
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('rejects a shell referencing an unknown placeholder', () => {
    const result = validateContainerShell('<div>{{{content}}}{{notARealVar}}</div>');
    expect(result.valid).toBe(false);
    expect(result.errors.some((message) => message.includes('notARealVar'))).toBe(true);
  });
});

describe('validateContentTemplateField', () => {
  it('blocks save when an unknown placeholder is present (AC-022)', () => {
    const result = validateContentTemplateField('สวัสดี {{notARealVar}}', ['inviteUrl']);
    expect(result.valid).toBe(false);
    expect(result.unknownPlaceholders).toEqual(['notARealVar']);
  });

  it('passes when only allowed placeholders are used', () => {
    const result = validateContentTemplateField('คลิก {{inviteUrl}} เพื่อยืนยัน', ['inviteUrl']);
    expect(result.valid).toBe(true);
    expect(result.unknownPlaceholders).toEqual([]);
  });

  it('requires non-empty value when marked required', () => {
    const result = validateContentTemplateField('   ', ['inviteUrl'], { required: true });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('ห้ามเว้นว่าง');
  });
});
