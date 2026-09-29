import { describe, expect, it } from 'vitest';
import { stripDuplicateHelpTitle } from '@/components/help/help-ui';

describe('stripDuplicateHelpTitle', () => {
  it('removes leading H1 when it matches the page title', () => {
    const md = '# คำสั่งซื้อ\n\n## ภาพรวม\n\nเนื้อหา';
    expect(stripDuplicateHelpTitle(md, 'คำสั่งซื้อ')).toBe('## ภาพรวม\n\nเนื้อหา');
  });

  it('keeps content when H1 differs', () => {
    const md = '# อื่น\n\nเนื้อหา';
    expect(stripDuplicateHelpTitle(md, 'คำสั่งซื้อ')).toBe(md);
  });
});
