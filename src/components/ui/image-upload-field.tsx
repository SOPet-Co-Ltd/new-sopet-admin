'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { useImageUpload } from '@/hooks/useImageUpload';
import {
  getFolderUploadRules,
  imageUploadMessages,
  validateImageAspectRatio,
  validateImageFile,
  type UploadFolder,
} from '@/lib/api/upload';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

interface ImageUploadFieldProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  folder: UploadFolder;
  disabled?: boolean;
  error?: string;
  className?: string;
  id?: string;
  required?: boolean;
  showUrl?: boolean;
}

export function ImageUploadField({
  label,
  value,
  onChange,
  folder,
  disabled = false,
  error,
  className,
  id,
  required,
  showUrl = true,
}: ImageUploadFieldProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const inputRef = useRef<HTMLInputElement>(null);
  const { upload, isUploading, error: uploadError, clearError, setError } = useImageUpload(folder);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const rules = getFolderUploadRules(folder);

  useEffect(() => {
    return () => {
      if (previewUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    clearError();

    const typeOrSizeError = validateImageFile(file, folder);
    if (typeOrSizeError) {
      setError(typeOrSizeError);
      return;
    }

    const aspectRatioError = await validateImageAspectRatio(file, folder);
    if (aspectRatioError) {
      setError(aspectRatioError);
      return;
    }

    const localPreview = URL.createObjectURL(file);
    setPreviewUrl(localPreview);

    try {
      const result = await upload(file);
      onChange(result.url);
    } catch {
      setPreviewUrl(value || null);
    }
  }

  const displayUrl = previewUrl || value || null;
  const message = error ?? uploadError;

  return (
    <div className={cn('space-y-2', className)}>
      <Label htmlFor={inputId} required={required}>
        {label}
      </Label>
      <div className="mt-1.5 flex flex-wrap items-start gap-3">
        {displayUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={displayUrl}
            alt=""
            className="h-20 w-20 shrink-0 rounded-lg border border-border object-cover"
          />
        ) : (
          <div
            className="flex h-20 w-20 shrink-0 items-center justify-center rounded-lg border border-dashed border-border bg-cream text-xs text-muted"
            aria-hidden
          >
            ไม่มีรูป
          </div>
        )}
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <input
            ref={inputRef}
            id={inputId}
            type="file"
            accept={rules.acceptedTypes.join(',')}
            className="sr-only"
            disabled={disabled || isUploading}
            onChange={(event) => void handleFileChange(event)}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={disabled || isUploading}
            onClick={() => inputRef.current?.click()}
          >
            {isUploading ? 'กำลังอัปโหลด...' : value ? 'เปลี่ยนรูปภาพ' : 'เลือกรูปภาพ'}
          </Button>
          {showUrl && value ? (
            <p className="truncate text-xs text-muted" title={value}>
              {value}
            </p>
          ) : (
            <p className="text-xs text-muted">{rules.helperText}</p>
          )}
        </div>
      </div>
      {message ? (
        <p className="text-xs text-danger" role="alert">
          {message}
        </p>
      ) : null}
      {!message && isUploading ? (
        <p className="text-xs text-muted" aria-live="polite">
          กำลังแปลงเป็น WebP และอัปโหลด...
        </p>
      ) : null}
    </div>
  );
}

export { imageUploadMessages };
