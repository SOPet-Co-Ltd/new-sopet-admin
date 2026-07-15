'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { VariantOptionGroup } from '@/lib/variants';

interface VariantOptionGroupsEditorProps {
  groups: VariantOptionGroup[];
  onChange: (groups: VariantOptionGroup[]) => void;
  label?: string;
  helperText?: string;
  addLabel?: string;
}

function emptyGroup(): VariantOptionGroup {
  return { name: '', values: [''] };
}

export function VariantOptionGroupsEditor({
  groups,
  onChange,
  label = 'ตัวเลือก (กลุ่มคุณสมบัติ)',
  helperText = 'เช่น สี → แดง, น้ำเงิน, เขียว · ไซส์ → xs, s, m, l, xl · แต่ละชุดจะกลายเป็น 1 รายการ',
  addLabel = 'เพิ่มตัวเลือก',
}: VariantOptionGroupsEditorProps) {
  function updateGroup(index: number, patch: Partial<VariantOptionGroup>) {
    onChange(groups.map((group, i) => (i === index ? { ...group, ...patch } : group)));
  }

  function updateValues(index: number, raw: string) {
    updateGroup(index, { values: raw.split(',').map((v) => v.trim()) });
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label>{label}</Label>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => onChange([...groups, emptyGroup()])}
        >
          {addLabel}
        </Button>
      </div>
      <p className="text-xs text-muted">{helperText}</p>

      {groups.map((group, index) => (
        <div
          key={index}
          className="grid gap-3 rounded-lg border border-border bg-surface/40 p-4 sm:grid-cols-[160px_1fr_auto]"
        >
          <div>
            <Label className="text-xs text-muted">ชื่อตัวเลือก</Label>
            <Input
              value={group.name}
              placeholder="สี"
              aria-label={`ชื่อตัวเลือกที่ ${index + 1}`}
              className="mt-1.5"
              onChange={(e) => updateGroup(index, { name: e.target.value })}
            />
          </div>
          <div>
            <Label className="text-xs text-muted">ค่า (คั่นด้วยจุลภาค)</Label>
            <Input
              value={group.values.join(', ')}
              placeholder="แดง, น้ำเงิน, เขียว"
              aria-label={`ค่าตัวเลือกที่ ${index + 1}`}
              className="mt-1.5"
              onChange={(e) => updateValues(index, e.target.value)}
            />
          </div>
          <div className="flex items-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={groups.length === 1}
              aria-label={`ลบตัวเลือกที่ ${index + 1}`}
              onClick={() => onChange(groups.filter((_, i) => i !== index))}
            >
              ลบ
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
