'use client';

import dynamic from 'next/dynamic';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), {
  ssr: false,
  loading: () => (
    <div
      className="mt-1.5 flex items-center justify-center rounded-lg border border-border bg-white text-sm text-muted-foreground"
      style={{ minHeight: 320 }}
      role="status"
    >
      กำลังโหลดตัวแก้ไขโค้ด…
    </div>
  ),
});

/**
 * Shared HTML developer editor for container shells and content template
 * bodies. Monaco (VS Code–style) — not a WYSIWYG email builder (locked
 * product decision — see docs/ui-spec/email-cms-ui-spec.md).
 */
export function EmailHtmlDeveloperEditor({
  id,
  label,
  value,
  onChange,
  placeholder = 'วาง HTML ที่รองรับอีเมล...',
  minHeight = 320,
  invalid,
  describedById,
  disabled,
  required,
  language = 'html',
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: number;
  invalid?: boolean;
  describedById?: string;
  disabled?: boolean;
  required?: boolean;
  language?: 'html' | 'plaintext';
}) {
  // placeholder kept for API compatibility with callers; Monaco has no native placeholder.
  void placeholder;

  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        <Label htmlFor={id} required={required}>
          {label}
        </Label>
        <span className="text-xs text-muted-foreground">
          {value.length.toLocaleString('th-TH')} อักขระ
        </span>
      </div>
      <div
        id={id}
        data-invalid={invalid ? 'true' : undefined}
        aria-describedby={describedById}
        className={cn(
          'mt-1.5 overflow-hidden rounded-lg border bg-white shadow-sm transition-colors',
          invalid
            ? 'border-danger ring-2 ring-danger/20'
            : 'border-border focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/20',
          disabled && 'pointer-events-none opacity-50',
        )}
        style={{ minHeight }}
      >
        <MonacoEditor
          height={minHeight}
          language={language}
          theme="vs"
          value={value}
          onChange={(next) => onChange(next ?? '')}
          loading={
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              กำลังโหลดตัวแก้ไขโค้ด…
            </div>
          }
          options={{
            readOnly: disabled,
            minimap: { enabled: false },
            fontSize: 13,
            fontFamily:
              'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
            lineNumbers: 'on',
            wordWrap: 'on',
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            renderLineHighlight: 'line',
            folding: true,
            bracketPairColorization: { enabled: true },
            formatOnPaste: false,
            suggestOnTriggerCharacters: true,
            quickSuggestions: {
              other: true,
              comments: false,
              strings: true,
            },
            padding: { top: 12, bottom: 12 },
            scrollbar: {
              verticalScrollbarSize: 10,
              horizontalScrollbarSize: 10,
            },
            ariaLabel: label,
          }}
        />
      </div>
    </div>
  );
}
