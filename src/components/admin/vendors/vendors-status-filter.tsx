import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type VendorStatusFilter = 'all' | 'active' | 'inactive';

const FILTER_OPTIONS: ReadonlyArray<{ value: VendorStatusFilter; label: string }> = [
  { value: 'all', label: 'ทั้งหมด' },
  { value: 'active', label: 'ใช้งานอยู่' },
  { value: 'inactive', label: 'ระงับ' },
];

type VendorsStatusFilterProps = {
  value: VendorStatusFilter;
  onChange: (value: VendorStatusFilter) => void;
  className?: string;
};

export function VendorsStatusFilter({ value, onChange, className }: VendorsStatusFilterProps) {
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
