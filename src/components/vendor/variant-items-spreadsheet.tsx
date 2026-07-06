'use client';

import { useCallback, useRef } from 'react';
import { cn } from '@/lib/utils';
import { formatCombinationLabel, type VariantItem } from '@/lib/variants';

interface VariantItemsSpreadsheetProps {
  items: VariantItem[];
  onChange: (items: VariantItem[]) => void;
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

export function VariantItemsSpreadsheet({ items, onChange }: VariantItemsSpreadsheetProps) {
  const inputsRef = useRef<Map<string, HTMLInputElement>>(new Map());

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

  function setCellValue(row: number, col: number, raw: string, draft?: VariantItem[]) {
    const column = COLUMNS[col];
    const value = coerce(column, raw);
    if (draft) {
      draft[row] = { ...draft[row], [column.key]: value };
      return;
    }
    updateItem(row, { [column.key]: value } as Partial<VariantItem>);
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
        สินค้านี้ยังไม่มีรายการตัวเลือก — กลุ่มตัวเลือกจะถูกกำหนดตอนสร้างสินค้า
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <div className="overflow-x-auto rounded-xl border border-border bg-white shadow-[var(--shadow-card)]">
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
            </tr>
          </thead>
          <tbody>
            {items.map((item, rowIndex) => (
              <tr key={item.id ?? `${item.sku}-${rowIndex}`}>
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-muted">
        ใช้ Tab / Enter / ลูกศร เพื่อเลื่อนระหว่างช่อง และวาง (paste) จากสเปรดชีตได้โดยตรง
      </p>
    </div>
  );
}
