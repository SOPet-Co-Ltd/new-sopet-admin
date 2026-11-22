'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { ProductDescriptionPreviewDialog } from './product-description-preview';

const ProductDescriptionBlockEditor = dynamic(
  () =>
    import('./product-description-block-editor').then((mod) => mod.ProductDescriptionBlockEditor),
  {
    ssr: false,
    loading: () => (
      <div
        className="flex min-h-[120px] items-center px-3 py-2 text-sm text-muted-foreground"
        aria-hidden
      >
        กำลังโหลดตัวแก้ไข...
      </div>
    ),
  },
);

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

export function ProductDescriptionEditor({
  id,
  value,
  onChange,
  onBlur,
  disabled = false,
  placeholder = 'พิมพ์ / เพื่อเพิ่มบล็อก หรือเริ่มเขียน...',
  'aria-invalid': ariaInvalid,
  'aria-describedby': ariaDescribedBy,
}: ProductDescriptionEditorProps) {
  const [previewOpen, setPreviewOpen] = useState(false);
  const helpId = `${id}-help`;
  const describedBy = [ariaDescribedBy, helpId].filter(Boolean).join(' ') || undefined;

  return (
    <div>
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
          'min-w-0 overflow-hidden rounded-lg border bg-white transition-colors duration-150 ease-out',
          'focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/20',
          ariaInvalid
            ? 'border-danger focus-within:border-danger focus-within:ring-danger/20'
            : 'border-border',
          disabled && 'cursor-not-allowed bg-surface/80 opacity-60',
        )}
      >
        <ProductDescriptionBlockEditor
          id={id}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          disabled={disabled}
          placeholder={placeholder}
          aria-invalid={ariaInvalid}
          aria-describedby={describedBy}
        />
      </div>

      <p id={helpId} className="mt-1.5 text-xs text-muted-foreground text-pretty">
        พิมพ์ / เพื่อเพิ่มหัวข้อ รายการ รูปภาพ หรือบล็อกอื่น ๆ
      </p>

      <ProductDescriptionPreviewDialog
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        description={value}
      />
    </div>
  );
}
