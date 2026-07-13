'use client';

import { useRef, useState } from 'react';
import { HiBold, HiLink, HiListBullet, HiNumberedList } from 'react-icons/hi2';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { insertMarkdownAtCursor, type MarkdownInsertAction } from '@/lib/markdown/insert-markdown';
import { ProductDescriptionPreviewDialog } from './product-description-preview';

export type ProductDescriptionEditorProps = {
  id: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  disabled?: boolean;
  placeholder?: string;
  'aria-invalid'?: boolean;
  'aria-describedby'?: string;
};

type ToolbarButton = {
  id: string;
  action: MarkdownInsertAction;
  label: string;
  content: React.ReactNode;
};

const TOOLBAR_BUTTONS: ToolbarButton[] = [
  {
    id: 'description-md-bold',
    action: 'bold',
    label: 'ตัวหนา',
    content: <HiBold className="size-4" />,
  },
  { id: 'description-md-h2', action: 'h2', label: 'หัวข้อใหญ่', content: 'H2' },
  { id: 'description-md-h3', action: 'h3', label: 'หัวข้อย่อย', content: 'H3' },
  {
    id: 'description-md-ul',
    action: 'ul',
    label: 'รายการหัวข้อ',
    content: <HiListBullet className="size-4" />,
  },
  {
    id: 'description-md-ol',
    action: 'ol',
    label: 'รายการลำดับ',
    content: <HiNumberedList className="size-4" />,
  },
  {
    id: 'description-md-link',
    action: 'link',
    label: 'แทรกลิงก์',
    content: <HiLink className="size-4" />,
  },
];

export function ProductDescriptionEditor({
  id,
  value,
  onChange,
  onBlur,
  disabled = false,
  placeholder = 'อธิบายสินค้า...',
  'aria-invalid': ariaInvalid,
  'aria-describedby': ariaDescribedBy,
}: ProductDescriptionEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  function applyMarkdownAction(action: MarkdownInsertAction) {
    if (disabled) return;

    const textarea = textareaRef.current;
    if (!textarea) return;

    const { selectionStart, selectionEnd } = textarea;
    const result = insertMarkdownAtCursor(value, selectionStart, selectionEnd, action);
    onChange(result.nextValue);

    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(result.selectionStart, result.selectionEnd);
    });
  }

  return (
    <div className="mt-1.5">
      <div className="mb-2 flex items-center justify-between gap-3">
        <Label htmlFor={id}>รายละเอียด</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled}
          onClick={() => setPreviewOpen(true)}
        >
          ดูตัวอย่าง
        </Button>
      </div>

      <div
        className={cn(
          'rounded-lg border border-border bg-white shadow-sm transition-colors focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/20',
          disabled && 'opacity-50',
        )}
      >
        <div
          role="toolbar"
          aria-label="เครื่องมือจัดรูปแบบ Markdown"
          className="flex flex-wrap gap-1 border-b border-border px-2 pb-2 pt-2"
        >
          {TOOLBAR_BUTTONS.map((button) => (
            <Button
              key={button.id}
              id={button.id}
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 min-w-8 px-2"
              disabled={disabled}
              aria-label={button.label}
              onClick={() => applyMarkdownAction(button.action)}
            >
              {button.content}
            </Button>
          ))}
        </div>

        <textarea
          ref={textareaRef}
          id={id}
          name={id}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onBlur={onBlur}
          disabled={disabled}
          placeholder={placeholder}
          aria-invalid={ariaInvalid}
          aria-describedby={ariaDescribedBy}
          className="flex min-h-[88px] w-full resize-y border-0 bg-transparent px-3 py-2 text-sm text-ink placeholder:text-muted/60 focus-visible:outline-none focus-visible:ring-0 disabled:cursor-not-allowed"
        />
      </div>

      <ProductDescriptionPreviewDialog
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        description={value}
      />
    </div>
  );
}
