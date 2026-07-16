'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import type { VariantOptionGroup } from '@/lib/variants';

interface VariantOptionGroupsEditorProps {
  groups: VariantOptionGroup[];
  onChange: (groups: VariantOptionGroup[]) => void;
  label?: string;
  helperText?: string;
  addLabel?: string;
  /** Hide title/helper when the parent card already explains the section. */
  showIntro?: boolean;
}

function emptyGroup(): VariantOptionGroup {
  return { name: '', values: [''] };
}

function filledValueCount(values: string[]): number {
  return values.map((value) => value.trim()).filter(Boolean).length;
}

export function VariantOptionGroupsEditor({
  groups,
  onChange,
  label = 'ตัวเลือก (กลุ่มคุณสมบัติ)',
  helperText = 'เช่น สี → แดง, น้ำเงิน, เขียว · ไซส์ → xs, s, m, l, xl · แต่ละชุดจะกลายเป็น 1 รายการ',
  addLabel = 'เพิ่มตัวเลือก',
  showIntro = true,
}: VariantOptionGroupsEditorProps) {
  function updateGroup(index: number, patch: Partial<VariantOptionGroup>) {
    onChange(groups.map((group, i) => (i === index ? { ...group, ...patch } : group)));
  }

  function updateValues(index: number, raw: string) {
    updateGroup(index, { values: raw.split(',').map((v) => v.trim()) });
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          {showIntro ? (
            <>
              <Label className="text-ink">{label}</Label>
              <p className="mt-1 text-xs text-muted-foreground text-pretty">{helperText}</p>
            </>
          ) : (
            <span className="sr-only">{label}</span>
          )}
        </div>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="shrink-0"
          onClick={() => onChange([...groups, emptyGroup()])}
        >
          {addLabel}
        </Button>
      </div>

      {groups.length === 0 ? (
        <div
          role="status"
          className="rounded-lg border border-dashed border-border bg-surface/60 px-4 py-6 text-center"
        >
          <p className="text-sm text-ink">ยังไม่มีกลุ่มตัวเลือก</p>
          <p className="mt-1 text-xs text-muted-foreground text-pretty">
            กด &quot;{addLabel}&quot; เพื่อเริ่มต้น เช่น สี หรือ ไซส์
          </p>
        </div>
      ) : (
        <ul
          className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-card"
          aria-label={label}
        >
          {groups.map((group, index) => {
            const valueCount = filledValueCount(group.values);
            return (
              <li
                key={index}
                className={cn(
                  'grid gap-3 bg-card p-4 transition-colors duration-150 ease-out',
                  'sm:grid-cols-[minmax(8rem,10rem)_1fr_auto] sm:items-end',
                )}
              >
                <div>
                  <Label
                    htmlFor={`variant-group-name-${index}`}
                    className="text-xs text-muted-foreground"
                  >
                    ชื่อตัวเลือก
                  </Label>
                  <Input
                    id={`variant-group-name-${index}`}
                    value={group.name}
                    placeholder="สี"
                    aria-label={`ชื่อตัวเลือกที่ ${index + 1}`}
                    className="mt-1.5"
                    onChange={(e) => updateGroup(index, { name: e.target.value })}
                  />
                </div>
                <div>
                  <div className="flex items-baseline justify-between gap-2">
                    <Label
                      htmlFor={`variant-group-values-${index}`}
                      className="text-xs text-muted-foreground"
                    >
                      ค่า (คั่นด้วยจุลภาค)
                    </Label>
                    <span className="text-xs tabular-nums text-muted-foreground">
                      {valueCount} ค่า
                    </span>
                  </div>
                  <Input
                    id={`variant-group-values-${index}`}
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
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:bg-danger-bg hover:text-danger"
                    aria-label={`ลบตัวเลือกที่ ${index + 1}`}
                    onClick={() => onChange(groups.filter((_, i) => i !== index))}
                  >
                    ลบ
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
