import { describe, expect, it } from 'vitest';
import { getFolderUploadRules } from '@/lib/api/upload.rules';
import { validateImageFile } from '@/lib/api/upload';

function createFile(type: string, sizeBytes: number): File {
  const buffer = new Uint8Array(sizeBytes);
  return new File([buffer], 'test-image', { type });
}

describe('upload.rules categories folder', () => {
  it('accepts valid JPEG under 5 MB', () => {
    const file = createFile('image/jpeg', 1024);
    expect(validateImageFile(file, 'categories')).toBeNull();
  });

  it('rejects unsupported mime type', () => {
    const file = createFile('application/pdf', 1024);
    expect(validateImageFile(file, 'categories')).toBe(
      'รองรับเฉพาะไฟล์รูปภาพ JPEG, PNG, WebP หรือ GIF',
    );
  });

  it('rejects files over 5 MB', () => {
    const file = createFile('image/png', 5 * 1024 * 1024 + 1);
    expect(validateImageFile(file, 'categories')).toBe('ขนาดไฟล์ต้องไม่เกิน 5 MB');
  });

  it('exposes categories folder rules matching default image rules', () => {
    const rules = getFolderUploadRules('categories');
    expect(rules.maxSizeBytes).toBe(5 * 1024 * 1024);
    expect(rules.acceptedTypes).toContain('image/jpeg');
    expect(rules.acceptedTypes).toContain('image/webp');
  });
});
