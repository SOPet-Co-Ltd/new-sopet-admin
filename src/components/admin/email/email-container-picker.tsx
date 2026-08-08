'use client';

import Link from 'next/link';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { EmailContainer } from '@/lib/api/email-cms';

/** Select of available containers (AC-027 — model supports multiple containers). */
export function EmailContainerPicker({
  id,
  containers,
  value,
  onChange,
  isLoading,
  disabled,
}: {
  id: string;
  containers: EmailContainer[];
  value: string;
  onChange: (containerId: string) => void;
  isLoading?: boolean;
  disabled?: boolean;
}) {
  if (!isLoading && containers.length === 0) {
    return (
      <div>
        <Label htmlFor={id} required>
          คอนเทนเนอร์
        </Label>
        <p className="mt-1.5 text-sm text-muted-foreground">
          ยังไม่มีคอนเทนเนอร์ —{' '}
          <Link href="/admin/email/containers/new" className="text-brand hover:underline">
            สร้างคอนเทนเนอร์
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div>
      <Label htmlFor={id} required>
        คอนเทนเนอร์
      </Label>
      <Select value={value || undefined} onValueChange={onChange} disabled={disabled || isLoading}>
        <SelectTrigger id={id} className="mt-1.5">
          <SelectValue placeholder={isLoading ? 'กำลังโหลด...' : 'เลือกคอนเทนเนอร์'} />
        </SelectTrigger>
        <SelectContent>
          {containers.map((container) => (
            <SelectItem key={container.id} value={container.id}>
              {container.name}
              {container.isDefault ? ' · ค่าเริ่มต้น' : ''}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
