'use client';

import { useState } from 'react';
import { HiCheck, HiOutlineClipboardDocument } from 'react-icons/hi2';
import { Button } from '@/components/ui/button';
import { useVendorStoreId } from '@/hooks/useVendorStoreId';

interface StoreIdFieldProps {
  /** Optional helper text shown under the store ID. */
  description?: string;
}

/**
 * Displays the active store's `storeId` with a copy-to-clipboard button so
 * vendors can build the public API request URL. Sourced from the same
 * `useVendorStoreId()` hook the vendor layout / store-scoped calls use.
 */
export function StoreIdField({ description }: StoreIdFieldProps) {
  const storeId = useVendorStoreId();
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    if (!storeId) return;
    await navigator.clipboard.writeText(storeId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <code className="flex-1 overflow-x-auto rounded-lg border border-border bg-surface px-4 py-3 font-mono text-sm break-all text-ink">
          {storeId ?? 'กำลังโหลด...'}
        </code>
        <Button
          type="button"
          variant="outline"
          onClick={handleCopy}
          disabled={!storeId}
          aria-label="คัดลอก Store ID"
        >
          {copied ? (
            <span className="inline-flex items-center gap-1.5">
              <HiCheck className="size-4" aria-hidden="true" />
              คัดลอกแล้ว
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5">
              <HiOutlineClipboardDocument className="size-4" aria-hidden="true" />
              คัดลอก
            </span>
          )}
        </Button>
      </div>
      {description ? <p className="mt-2 text-xs text-muted">{description}</p> : null}
    </div>
  );
}
