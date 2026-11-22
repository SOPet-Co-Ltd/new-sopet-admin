'use client';

import { useState } from 'react';
import { HiXMark } from 'react-icons/hi2';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import type { VariantOptionGroup, VariantOptionRename } from '@/lib/variants';

interface VariantOptionGroupsEditorProps {
  groups: VariantOptionGroup[];
  onChange: (groups: VariantOptionGroup[], rename?: VariantOptionRename) => void;
  label?: string;
  helperText?: string;
  addLabel?: string;
  /** Hide title/helper when the parent card already explains the section. */
  showIntro?: boolean;
}

function emptyGroup(): VariantOptionGroup {
  return { name: '', values: [] };
}

export function VariantOptionGroupsEditor({
  groups,
  onChange,
  label = 'ตัวเลือก (กลุ่มคุณสมบัติ)',
  helperText = 'เช่น สี → แดง, น้ำเงิน, เขียว · ไซส์ → xs, s, m, l, xl · แตะชิปเพื่อแก้ชื่อ',
  addLabel = 'เพิ่มตัวเลือก',
  showIntro = true,
}: VariantOptionGroupsEditorProps) {
  const [draftValues, setDraftValues] = useState<Record<number, string>>({});
  const [editingChip, setEditingChip] = useState<{
    groupIndex: number;
    valueIndex: number;
  } | null>(null);
  const [chipDraft, setChipDraft] = useState('');

  function updateGroup(
    index: number,
    patch: Partial<VariantOptionGroup>,
    rename?: VariantOptionRename,
  ) {
    onChange(
      groups.map((group, i) => (i === index ? { ...group, ...patch } : group)),
      rename,
    );
  }

  function setGroupNameDraft(index: number, nextName: string) {
    updateGroup(index, { name: nextName });
  }

  function commitGroupName(index: number, previousName: string, nextName: string) {
    const from = previousName.trim();
    const to = nextName.trim();
    const rename: VariantOptionRename | undefined =
      from && to && from !== to ? { type: 'group', from, to } : undefined;
    updateGroup(index, { name: to || nextName }, rename);
  }

  function commitChipEdit(groupIndex: number, valueIndex: number) {
    const group = groups[groupIndex];
    if (!group) return;
    const previous = group.values[valueIndex] ?? '';
    const next = chipDraft.trim();
    setEditingChip(null);
    setChipDraft('');

    if (!next) {
      updateGroup(groupIndex, {
        values: group.values.filter((_, i) => i !== valueIndex),
      });
      return;
    }

    if (next === previous.trim()) return;

    const values = group.values.map((value, i) => (i === valueIndex ? next : value));
    const unique = [...new Set(values.map((value) => value.trim()).filter(Boolean))];
    const rename: VariantOptionRename | undefined =
      previous.trim() && group.name.trim()
        ? { type: 'value', group: group.name.trim(), from: previous.trim(), to: next }
        : undefined;
    updateGroup(groupIndex, { values: unique }, rename);
  }

  function removeValue(groupIndex: number, valueIndex: number) {
    const group = groups[groupIndex];
    if (!group) return;
    updateGroup(groupIndex, {
      values: group.values.filter((_, i) => i !== valueIndex),
    });
  }

  function addValueFromDraft(groupIndex: number) {
    const group = groups[groupIndex];
    if (!group) return;
    const next = (draftValues[groupIndex] ?? '').trim();
    if (!next) return;
    const values = [...group.values.map((value) => value.trim()).filter(Boolean), next];
    updateGroup(groupIndex, { values: [...new Set(values)] });
    setDraftValues((prev) => ({ ...prev, [groupIndex]: '' }));
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
            const filledValues = group.values.map((value) => value.trim()).filter(Boolean);
            return (
              <li
                key={index}
                className={cn(
                  'grid gap-x-3 gap-y-2 bg-card p-4 transition-colors duration-150 ease-out',
                  'sm:grid-cols-[minmax(8rem,10rem)_minmax(0,1fr)_auto]',
                )}
              >
                <Label
                  htmlFor={`variant-group-name-${index}`}
                  className="text-xs text-muted-foreground sm:col-start-1 sm:row-start-1"
                >
                  ชื่อตัวเลือก
                </Label>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground sm:col-start-2 sm:row-start-1">
                  <Label className="text-xs text-muted-foreground">ค่า</Label>
                  <span className="tabular-nums">· {filledValues.length}</span>
                </div>
                <div className="hidden sm:col-start-3 sm:row-start-1 sm:block" aria-hidden="true" />

                <Input
                  id={`variant-group-name-${index}`}
                  value={group.name}
                  placeholder="สี"
                  aria-label={`ชื่อตัวเลือกที่ ${index + 1}`}
                  className="sm:col-start-1 sm:row-start-2"
                  onFocus={(e) => {
                    e.currentTarget.dataset.commitFrom = group.name;
                  }}
                  onChange={(e) => setGroupNameDraft(index, e.target.value)}
                  onBlur={(e) =>
                    commitGroupName(
                      index,
                      e.currentTarget.dataset.commitFrom ?? group.name,
                      e.target.value,
                    )
                  }
                />

                <div className="min-w-0 space-y-2 sm:col-start-2 sm:row-start-2">
                  <div
                    className={cn(
                      'flex flex-wrap content-center gap-1.5',
                      group.values.length > 0 && 'min-h-10',
                    )}
                    aria-label={`ค่าตัวเลือกที่ ${index + 1}`}
                  >
                    {group.values.map((value, valueIndex) => {
                      const isEditing =
                        editingChip?.groupIndex === index && editingChip.valueIndex === valueIndex;
                      if (isEditing) {
                        return (
                          <Input
                            key={`${index}-${valueIndex}-edit`}
                            value={chipDraft}
                            autoFocus
                            aria-label={`แก้ค่า ${value || valueIndex + 1}`}
                            className="h-8 w-28"
                            onChange={(e) => setChipDraft(e.target.value)}
                            onBlur={() => commitChipEdit(index, valueIndex)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                commitChipEdit(index, valueIndex);
                              }
                              if (e.key === 'Escape') {
                                setEditingChip(null);
                                setChipDraft('');
                              }
                            }}
                          />
                        );
                      }
                      return (
                        <span
                          key={`${index}-${valueIndex}-${value}`}
                          className="inline-flex h-8 max-w-full items-center gap-0.5 rounded-full border border-border bg-surface px-2 text-sm text-ink"
                        >
                          <button
                            type="button"
                            className="max-w-[10rem] truncate rounded-full px-0.5 text-left hover:text-brand"
                            aria-label={`แก้ชื่อค่า ${value}`}
                            onClick={() => {
                              setEditingChip({ groupIndex: index, valueIndex });
                              setChipDraft(value);
                            }}
                          >
                            {value || '—'}
                          </button>
                          <button
                            type="button"
                            className="rounded-full p-0.5 text-muted-foreground hover:bg-danger-bg hover:text-danger"
                            aria-label={`ลบค่า ${value}`}
                            onClick={() => removeValue(index, valueIndex)}
                          >
                            <HiXMark className="size-3.5" aria-hidden="true" />
                          </button>
                        </span>
                      );
                    })}
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      id={`variant-group-add-${index}`}
                      value={draftValues[index] ?? ''}
                      placeholder="เพิ่มค่า แล้วกด Enter"
                      aria-label={`เพิ่มค่าตัวเลือกที่ ${index + 1}`}
                      onChange={(e) =>
                        setDraftValues((prev) => ({ ...prev, [index]: e.target.value }))
                      }
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addValueFromDraft(index);
                        }
                      }}
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      className="h-10 shrink-0"
                      onClick={() => addValueFromDraft(index)}
                    >
                      เพิ่ม
                    </Button>
                  </div>
                </div>

                <div className="flex items-center sm:col-start-3 sm:row-start-2">
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
