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
        // Let native Tab order handle forward/backward flow, but wrap rows.
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
      return; // single cell paste — allow native behaviour
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
      <p className="rounded-xl border border-dashed border-border bg-surface/50 p-8 text-center text-sm text-muted">
        {emptyMessage}
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-end gap-3 rounded-lg border border-dashed border-border bg-surface/40 p-3">
        <div>
          <Label htmlFor="bulk-stock" className="text-xs text-muted">
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
          <Label htmlFor="bulk-price" className="text-xs text-muted">
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
          disabled={bulkStock.trim() === '' && bulkPrice.trim() === ''}
          onClick={applyBulkValues}
        >
          ใช้กับทุกรายการ
        </Button>
        <p className="text-xs text-muted">กรอกเฉพาะช่องที่ต้องการตั้งค่าเดียวกันทั้งหมด</p>
      </div>

      <div className="space-y-2 sm:hidden">
        {items.map((item, rowIndex) => (
          <div
            key={rowKey(item, rowIndex)}
            className="rounded-xl border border-border bg-white p-4 shadow-[var(--shadow-card)]"
          >
            <div className="mb-3 flex items-center justify-between gap-2">
              <p className="text-sm font-medium text-ink">
                {formatCombinationLabel(item.options) || 'ตัวเลือกเดียว'}
              </p>
              <button
                type="button"
                aria-label={`ลบรายการ ${formatCombinationLabel(item.options) || rowIndex + 1}`}
                onClick={() => removeItem(rowIndex)}
                className="rounded-md p-1.5 text-muted transition-colors hover:bg-danger-bg hover:text-danger"
              >
                <HiOutlineTrash className="size-4" aria-hidden="true" />
              </button>
            </div>
            <div className="space-y-2">
              <div>
                <Label className="text-xs text-muted">SKU</Label>
                <Input
                  value={item.sku}
                  onChange={(e) => updateItem(rowIndex, { sku: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs text-muted">สต็อก</Label>
                  <Input
                    type="number"
                    inputMode="decimal"
                    min={0}
                    value={item.stockQuantity}
                    onChange={(e) =>
                      updateItem(rowIndex, {
                        stockQuantity: coerce(COLUMNS[1], e.target.value) as number,
                      })
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted">ราคา (บาท)</Label>
                  <Input
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
        ))}
      </div>

      <div className="hidden overflow-x-auto rounded-xl border border-border bg-white shadow-[var(--shadow-card)] sm:block">
        <table className="min-w-full border-collapse text-sm">
          <thead className="bg-surface/70 text-left text-muted">
            <tr>
              <th className="border-b border-border px-4 py-3 font-semibold">ตัวเลือก</th>
              {COLUMNS.map((column) => (
                <th
                  key={column.key}
                  className={cn(
                    'border-b border-l border-border px-4 py-3 font-semibold',
                    column.align === 'right' && 'text-right',
                  )}
                >
                  {column.label}
                </th>
              ))}
              <th className="border-b border-l border-border px-3 py-3 font-semibold">
                <span className="sr-only">ลบ</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, rowIndex) => (
              <tr key={rowKey(item, rowIndex)}>
                <td className="border-b border-border px-4 py-2 whitespace-nowrap text-ink">
                  {formatCombinationLabel(item.options) || '—'}
                </td>
                {COLUMNS.map((column, colIndex) => (
                  <td key={column.key} className="border-b border-l border-border p-0">
                    <input
                      ref={registerInput(rowIndex, colIndex)}
                      type={column.type}
                      inputMode={column.type === 'number' ? 'decimal' : undefined}
                      min={column.type === 'number' ? 0 : undefined}
                      step={column.step}
                      value={item[column.key] ?? ''}
                      onChange={(e) => setCellValue(rowIndex, colIndex, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, rowIndex, colIndex)}
                      onPaste={(e) => handlePaste(e, rowIndex, colIndex)}
                      onFocus={(e) => e.currentTarget.select()}
                      className={cn(
                        'h-10 w-full bg-transparent px-4 py-2 text-sm text-ink outline-none transition-colors',
                        'focus:bg-brand-tint/40 focus:ring-2 focus:ring-inset focus:ring-brand/40',
                        column.align === 'right' && 'text-right',
                      )}
                    />
                  </td>
                ))}
                <td className="border-b border-l border-border px-2 text-center">
                  <button
                    type="button"
                    aria-label={`ลบรายการ ${formatCombinationLabel(item.options) || rowIndex + 1}`}
                    onClick={() => removeItem(rowIndex)}
                    className="rounded-md p-1.5 text-muted transition-colors hover:bg-danger-bg hover:text-danger"
                  >
                    <HiOutlineTrash className="size-4" aria-hidden="true" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-muted">
        ใช้ Tab / Enter / ลูกศร เพื่อเลื่อนระหว่างช่อง และวาง (paste) จากสเปรดชีตได้โดยตรง —
        ลบรายการที่ไม่ต้องการขายได้ทันที
      </p>
    </div>
  );
}
