import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('admin analytics code split', () => {
  it('loads chart components through next/dynamic instead of static imports', () => {
    const source = readFileSync(resolve(process.cwd(), 'src/app/admin/analytics/page.tsx'), 'utf8');

    expect(source).toContain("import dynamic from 'next/dynamic'");
    expect(source).toContain("import('@/components/analytics/sales-over-time-chart')");
    expect(source).toContain("import('@/components/analytics/breakdown-chart')");
    expect(source).not.toMatch(
      /import\s+\{\s*SalesOverTimeChart\s*\}\s+from\s+'@\/components\/analytics\/sales-over-time-chart'/,
    );
    expect(source).not.toMatch(
      /import\s+\{\s*BreakdownChart\s*\}\s+from\s+'@\/components\/analytics\/breakdown-chart'/,
    );
  });
});
