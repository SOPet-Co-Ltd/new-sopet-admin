'use client';

import { useCallback, useRef, useState } from 'react';
import { HiOutlineTrash } from 'react-icons/hi2';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { formatCombinationLabel, type VariantItem } from '@/lib/variants';

interface VariantItemsSpreadsheetProps {
  items: VariantItem[];
  onChange: (items: VariantItem[]) => void;
  emptyMessage?: string;
}

type ColumnKey = 'sku' | 'stockQuantity' | 'price';

interface ColumnDef {
  key: ColumnKey;
  label: string;
  type: 'text' | 'number';
  align: 'left' | 'right';
  step?: string;
}

const COLUMNS: ColumnDef[] = [
  { key: 'sku', label: 'SKU', type: 'text', align: 'left' },
  { key: 'stockQuantity', label: 'สต็อก', type: 'number', align: 'right' },
  { key: 'price', label: 'ราคา (บาท)', type: 'number', align: 'right', step: '0.01' },
];

function cellKey(row: number, col: number): string {
  return `${row}:${col}`;
}

function coerce(column: ColumnDef, raw: string): string | number {
  if (column.type === 'number') {
    const parsed = Number(raw.replace(/,/g, '').trim());
    return Number.isFinite(parsed) ? Math.max(0, parsed) : 0;
  }
  return raw;
}

function rowKey(item: VariantItem, index: number): string {
  return item.id ?? `${item.sku}-${index}`;
}

export function VariantItemsSpreadsheet({
  items,
  onChange,
  emptyMessage = 'สินค้านี้ยังไม่มีรายการตัวเลือก — เพิ่มกลุ่มตัวเลือกด้านบนเพื่อสร้างรายการ',
}: VariantItemsSpreadsheetProps) {
  const inputsRef = useRef<Map<string, HTMLInputElement>>(new Map());
  const [bulkStock, setBulkStock] = useState('');
  const [bulkPrice, setBulkPrice] = useState('');
  const [focusedCell, setFocusedCell] = useState<string | null>(null);

  const registerInput = useCallback(
    (row: number, col: number) => (el: HTMLInputElement | null) => {
      const key = cellKey(row, col);
      if (el) inputsRef.current.set(key, el);
      else inputsRef.current.delete(key);
    },
    [],
  );

  const focusCell = useCallback(
    (row: number, col: number) => {
      const clampedRow = Math.max(0, Math.min(items.length - 1, row));
      const clampedCol = Math.max(0, Math.min(COLUMNS.length - 1, col));
      const el = inputsRef.current.get(cellKey(clampedRow, clampedCol));
      if (el) {
        el.focus();
        el.select();
      }
    },
    [items.length],
  );

  function updateItem(index: number, patch: Partial<VariantItem>) {
    onChange(items.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  }

  function removeItem(index: number) {
    onChange(items.filter((_, i) => i !== index));
  }

  function setCellValue(row: number, col: number, raw: string, draft?: VariantItem[]) {
    const column = COLUMNS[col];
    const value = coerce(column, raw);
    if (draft) {
      draft[row] = { ...draft[row], [column.key]: value };
      return;
    }
    updateItem(row, { [column.key]: value } as Partial<VariantItem>);
  }

  function applyBulkValues() {
    const nextStock = bulkStock.trim() === '' ? undefined : Math.max(0, Number(bulkStock));
    const nextPrice = bulkPrice.trim() === '' ? undefined : Math.max(0, Number(bulkPrice));
    if (
      (nextStock === undefined || !Number.isFinite(nextStock)) &&
      (nextPrice === undefined || !Number.isFinite(nextPrice))
    ) {
      return;
    }
    onChange(
      items.map((item) => ({
        ...item,
        ...(nextStock !== undefined && Number.isFinite(nextStock)
          ? { stockQuantity: nextStock }
          : {}),
        ...(nextPrice !== undefined && Number.isFinite(nextPrice) ? { price: nextPrice } : {}),
      })),
    );
    setBulkStock('');
    setBulkPrice('');
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>, row: number, col: number) {
    const target = e.currentTarget;
    const atStart = target.selectionStart === 0 && target.selectionEnd === 0;
    const atEnd =
      target.selectionStart === target.value.length && target.selectionEnd === target.value.length;

    switch (e.key) {
      case 'Enter':
        e.preventDefault();
        focusCell(e.shiftKey ? row - 1 : row + 1, col);
        break;
      case 'ArrowDown':
        e.preventDefault();
        focusCell(row + 1, col);
        break;
      case 'ArrowUp':
        e.preventDefault();
        focusCell(row - 1, col);
        break;
      case 'ArrowLeft':
        if (atStart) {
          e.preventDefault();
          focusCell(row, col - 1);
        }
        break;
      case 'ArrowRight':
        if (atEnd) {
          e.preventDefault();
          focusCell(row, col + 1);
        }
        break;
      case 'Tab':
        if (!e.shiftKey && col === COLUMNS.length - 1 && row < items.length - 1) {
          e.preventDefault();
          focusCell(row + 1, 0);
        } else if (e.shiftKey && col === 0 && row > 0) {
          e.preventDefault();
          focusCell(row - 1, COLUMNS.length - 1);
        }
        break;
      default:
        break;
    }
  }

  function handlePaste(e: React.ClipboardEvent<HTMLInputElement>, row: number, col: number) {
    const text = e.clipboardData.getData('text/plain');
    if (!text || (!text.includes('\t') && !text.includes('\n'))) {
      return;
    }
    e.preventDefault();
    const lines = text.replace(/\r/g, '').split('\n');
    if (lines.length > 0 && lines[lines.length - 1] === '') lines.pop();

    const draft = [...items];
    lines.forEach((line, r) => {
      const targetRow = row + r;
      if (targetRow >= draft.length) return;
      line.split('\t').forEach((raw, c) => {
        const targetCol = col + c;
        if (targetCol >= COLUMNS.length) return;
        setCellValue(targetRow, targetCol, raw, draft);
      });
    });
    onChange(draft);
  }

  if (items.length === 0) {
    return (
      <div
        role="status"
        className="rounded-xl border border-dashed border-border bg-surface/60 px-6 py-10 text-center"
      >
        <p className="text-sm font-medium text-ink">ยังไม่มีรายการ SKU</p>
        <p className="mx-auto mt-1.5 max-w-md text-sm text-muted-foreground text-pretty">
          {emptyMessage}
        </p>
      </div>
    );
  }

  const bulkDisabled = bulkStock.trim() === '' && bulkPrice.trim() === '';

  return (
    <div className="space-y-3">
      <div
        className="flex flex-wrap items-end gap-3 rounded-lg border border-border bg-surface/70 p-3"
        role="group"
        aria-label="ตั้งค่าสต็อกและราคาแบบกลุ่ม"
      >
        <div>
          <Label htmlFor="bulk-stock" className="text-xs text-muted-foreground">
            สต็อก (ทุกรายการ)
          </Label>
          <Input
            id="bulk-stock"
            type="number"
            inputMode="decimal"
            min={0}
            placeholder="เช่น 50"
            value={bulkStock}
            onChange={(e) => setBulkStock(e.target.value)}
            className="mt-1.5 h-9 w-28"
          />
        </div>
        <div>
          <Label htmlFor="bulk-price" className="text-xs text-muted-foreground">
            ราคา (ทุกรายการ)
          </Label>
          <Input
            id="bulk-price"
            type="number"
            inputMode="decimal"
            min={0}
            step="0.01"
            placeholder="เช่น 199"
            value={bulkPrice}
            onChange={(e) => setBulkPrice(e.target.value)}
            className="mt-1.5 h-9 w-28"
          />
        </div>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          disabled={bulkDisabled}
          onClick={applyBulkValues}
        >
          ใช้กับทุกรายการ
        </Button>
        <p className="self-center text-xs text-muted-foreground sm:self-end sm:pb-2">
          กรอกเฉพาะช่องที่ต้องการตั้งค่าเดียวกันทั้งหมด
        </p>
      </div>

      <div className="space-y-2 sm:hidden">
        {items.map((item, rowIndex) => {
          const label = formatCombinationLabel(item.options) || 'ตัวเลือกเดียว';
          const isOutOfStock = Number(item.stockQuantity) <= 0;
          return (
            <div
              key={rowKey(item, rowIndex)}
              className="rounded-xl border border-border bg-card p-4"
            >
              <div className="mb-3 flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-ink">{label}</p>
                  {isOutOfStock ? <p className="mt-0.5 text-xs text-danger">หมดสต็อก</p> : null}
                </div>
                <button
                  type="button"
                  aria-label={`ลบรายการ ${label}`}
                  onClick={() => removeItem(rowIndex)}
                  className="inline-flex size-10 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors duration-150 hover:bg-danger-bg hover:text-danger focus-visible:outline-none"
                >
                  <HiOutlineTrash className="size-4" aria-hidden="true" />
                </button>
              </div>
              <div className="space-y-2">
                <div>
                  <Label
                    htmlFor={`mobile-sku-${rowIndex}`}
                    className="text-xs text-muted-foreground"
                  >
                    SKU
                  </Label>
                  <Input
                    id={`mobile-sku-${rowIndex}`}
                    value={item.sku}
                    onChange={(e) => updateItem(rowIndex, { sku: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label
                      htmlFor={`mobile-stock-${rowIndex}`}
                      className="text-xs text-muted-foreground"
                    >
                      สต็อก
                    </Label>
                    <Input
                      id={`mobile-stock-${rowIndex}`}
                      type="number"
                      inputMode="decimal"
                      min={0}
                      value={item.stockQuantity}
                      onChange={(e) =>
                        updateItem(rowIndex, {
                          stockQuantity: coerce(COLUMNS[1], e.target.value) as number,
                        })
                      }
                      className={cn('mt-1', isOutOfStock && 'text-danger')}
                    />
                  </div>
                  <div>
                    <Label
                      htmlFor={`mobile-price-${rowIndex}`}
                      className="text-xs text-muted-foreground"
                    >
                      ราคา (บาท)
                    </Label>
                    <Input
                      id={`mobile-price-${rowIndex}`}
                      type="number"
                      inputMode="decimal"
                      min={0}
                      step="0.01"
                      value={item.price}
                      onChange={(e) =>
                        updateItem(rowIndex, {
                          price: coerce(COLUMNS[2], e.target.value) as number,
                        })
                      }
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="hidden overflow-hidden rounded-xl border border-border bg-card sm:block">
        <div className="max-h-[min(28rem,55vh)] overflow-auto">
          <table className="min-w-full border-collapse text-sm">
            <thead className="sticky top-0 z-[1] bg-surface text-left text-muted-foreground shadow-[inset_0_-1px_0_var(--border)]">
              <tr>
                <th scope="col" className="px-4 py-2.5 text-xs font-medium tracking-wide">
                  ตัวเลือก
                </th>
                {COLUMNS.map((column) => (
                  <th
                    key={column.key}
                    scope="col"
                    className={cn(
                      'border-l border-border px-4 py-2.5 text-xs font-medium tracking-wide',
                      column.align === 'right' && 'text-right',
                    )}
                  >
                    {column.label}
                  </th>
                ))}
                <th scope="col" className="border-l border-border px-2 py-2.5">
                  <span className="sr-only">ลบ</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, rowIndex) => {
                const label = formatCombinationLabel(item.options) || '—';
                const isOutOfStock = Number(item.stockQuantity) <= 0;
                return (
                  <tr
                    key={rowKey(item, rowIndex)}
                    className="group border-t border-border transition-colors duration-150 hover:bg-brand-tint/30"
                  >
                    <td className="max-w-[14rem] truncate px-4 py-0 whitespace-nowrap text-ink">
                      <span className="block py-2.5 text-sm font-medium" title={label}>
                        {label}
                      </span>
                    </td>
                    {COLUMNS.map((column, colIndex) => {
                      const key = cellKey(rowIndex, colIndex);
                      const isStock = column.key === 'stockQuantity';
                      return (
                        <td key={column.key} className="border-l border-border p-0">
                          <input
                            ref={registerInput(rowIndex, colIndex)}
                            type={column.type}
                            inputMode={column.type === 'number' ? 'decimal' : undefined}
                            min={column.type === 'number' ? 0 : undefined}
                            step={column.step}
                            value={item[column.key] ?? ''}
                            aria-label={`${column.label} — ${label}`}
                            onChange={(e) => setCellValue(rowIndex, colIndex, e.target.value)}
                            onKeyDown={(e) => handleKeyDown(e, rowIndex, colIndex)}
                            onPaste={(e) => handlePaste(e, rowIndex, colIndex)}
                            onFocus={(e) => {
                              setFocusedCell(key);
                              e.currentTarget.select();
                            }}
                            onBlur={() =>
                              setFocusedCell((current) => (current === key ? null : current))
                            }
                            className={cn(
                              'h-10 w-full bg-transparent px-4 py-2 text-sm text-ink outline-none transition-colors duration-150',
                              'focus:bg-brand-tint/50 focus:ring-2 focus:ring-inset focus:ring-brand/35',
                              column.align === 'right' && 'text-right tabular-nums',
                              isStock && isOutOfStock && focusedCell !== key && 'text-danger',
                            )}
                          />
                        </td>
                      );
                    })}
                    <td className="border-l border-border px-1 text-center">
                      <button
                        type="button"
                        aria-label={`ลบรายการ ${label === '—' ? rowIndex + 1 : label}`}
                        onClick={() => removeItem(rowIndex)}
                        className="inline-flex size-10 items-center justify-center rounded-md text-muted-foreground opacity-70 transition-all duration-150 hover:bg-danger-bg hover:text-danger hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none group-hover:opacity-100"
                      >
                        <HiOutlineTrash className="size-4" aria-hidden="true" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-xs text-muted-foreground text-pretty">
        Tab / Enter / ลูกศร เลื่อนระหว่างช่อง · วางจากสเปรดชีตได้ · ลบแถวที่ไม่ขายได้ทันที
      </p>
    </div>
  );
}
