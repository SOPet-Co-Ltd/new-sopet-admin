'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { EmailPlaceholderInfo } from '@/lib/api/email-cms';
import { cn } from '@/lib/utils';

/** Key/value inputs for preview (and test send) sample data (AC-014, AC-015). */
export function EmailSampleVarsForm({
  placeholders,
  values,
  onChange,
  dense,
}: {
  placeholders: EmailPlaceholderInfo[];
  values: Record<string, string>;
  onChange: (name: string, value: string) => void;
  dense?: boolean;
}) {
  if (placeholders.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      {!dense ? (
        <h3 className="text-sm font-medium text-ink">ค่าตัวอย่างสำหรับตัวอย่างอีเมล</h3>
      ) : null}
      <div className={cn('grid gap-3', dense ? 'grid-cols-1' : 'sm:grid-cols-2')}>
        {placeholders.map((placeholder) => {
          const inputId = `sample-var-${placeholder.name}`;
          return (
            <div key={placeholder.name}>
              <Label htmlFor={inputId} className="font-mono text-xs">
                {`{{${placeholder.name}}}`}
                {placeholder.trustedHtml ? (
                  <span className="ml-1 font-sans text-[10px] text-muted-foreground">
                    (ระบบสร้าง)
                  </span>
                ) : null}
              </Label>
              <Input
                id={inputId}
                value={values[placeholder.name] ?? ''}
                placeholder={placeholder.sample}
                disabled={placeholder.trustedHtml}
                onChange={(event) => onChange(placeholder.name, event.target.value)}
                className="mt-1.5 font-mono text-xs"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
