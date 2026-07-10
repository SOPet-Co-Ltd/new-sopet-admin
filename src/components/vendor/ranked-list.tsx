import type { ReactNode } from 'react';

type RankedListItem = {
  key: string;
  primary: ReactNode;
  secondary: ReactNode;
};

type RankedListProps = {
  items: RankedListItem[];
};

export function RankedList({ items }: RankedListProps) {
  if (items.length === 0) {
    return <p className="text-sm text-muted">ยังไม่มีข้อมูล</p>;
  }

  return (
    <ul className="space-y-2">
      {items.map((item, index) => (
        <li
          key={item.key}
          className="flex items-center justify-between gap-4 rounded-lg border border-border px-4 py-3"
        >
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-tint text-sm font-medium text-brand">
              {index + 1}
            </span>
            <div className="min-w-0">{item.primary}</div>
          </div>
          <div className="shrink-0 text-right text-sm">{item.secondary}</div>
        </li>
      ))}
    </ul>
  );
}
