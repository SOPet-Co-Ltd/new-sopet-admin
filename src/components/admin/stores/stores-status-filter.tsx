import { Button } from '@/components/ui/button';
import { labelStoreStatus } from '@/lib/i18n/th';
import { cn } from '@/lib/utils';
import type { StoreStatus } from '@/types';

export type StoreStatusFilter = StoreStatus | 'all';

const FILTER_OPTIONS: ReadonlyArray<{ value: StoreStatusFilter; label: string }> = [
  { value: 'all', label: 'ทั้งหมด' },
  { value: 'pending', label: labelStoreStatus('pending') },
  { value: 'approved', label: labelStoreStatus('approved') },
  { value: 'rejected', label: labelStoreStatus('rejected') },
  { value: 'suspended', label: labelStoreStatus('suspended') },
];

type StoresStatusFilterProps = {
  value: StoreStatusFilter;
  onChange: (value: StoreStatusFilter) => void;
  className?: string;
};

export function StoresStatusFilter({ value, onChange, className }: StoresStatusFilterProps) {
  return (
    <fieldset className={cn('min-w-0', className)}>
      <legend className="mb-1.5 block text-xs font-medium text-muted-foreground">
        กรองตามสถานะ
      </legend>
      <div className="flex flex-wrap gap-2">
        {FILTER_OPTIONS.map(({ value: optionValue, label }) => {
          const isSelected = value === optionValue;
          return (
            <Button
              key={optionValue}
              type="button"
              size="sm"
              variant={isSelected ? 'default' : 'outline'}
              aria-pressed={isSelected}
              onClick={() => onChange(optionValue)}
            >
              {label}
            </Button>
          );
        })}
      </div>
    </fieldset>
  );
}
