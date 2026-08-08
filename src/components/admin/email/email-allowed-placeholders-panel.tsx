import type { EmailPlaceholderInfo } from '@/lib/api/email-cms';
import { cn } from '@/lib/utils';

/**
 * Read-only checklist of allowed `{{placeholders}}` for the current template
 * key (AC-013, AC-021). Chips are click-to-insert into the last-focused
 * editor when `onInsert` is provided.
 */
export function EmailAllowedPlaceholdersPanel({
  placeholders,
  onInsert,
  hideTitle,
}: {
  placeholders: EmailPlaceholderInfo[];
  onInsert?: (name: string) => void;
  hideTitle?: boolean;
}) {
  if (placeholders.length === 0) {
    return null;
  }

  return (
    <div>
      {!hideTitle ? <h3 className="text-sm font-medium text-ink">ตัวแปรที่ใช้ได้</h3> : null}
      <ul className={cn('flex flex-wrap gap-2', !hideTitle && 'mt-2')}>
        {placeholders.map((placeholder) => {
          const token = `{{${placeholder.name}}}`;
          const content = (
            <>
              <code className="font-mono">{token}</code>
              {placeholder.required ? <span className="text-danger"> *</span> : null}
            </>
          );

          if (!onInsert) {
            return (
              <li
                key={placeholder.name}
                title={`ตัวอย่าง: ${placeholder.sample}`}
                className="inline-flex items-center rounded-full border border-border bg-surface px-2.5 py-1 text-xs text-ink"
              >
                {content}
              </li>
            );
          }

          return (
            <li key={placeholder.name}>
              <button
                type="button"
                title={`แทรก ${token}`}
                onClick={() => onInsert(placeholder.name)}
                className={cn(
                  'inline-flex items-center rounded-full border border-border bg-surface px-2.5 py-1 text-xs text-ink transition-colors hover:border-brand/40 hover:bg-brand-tint hover:text-brand',
                )}
              >
                {content}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
