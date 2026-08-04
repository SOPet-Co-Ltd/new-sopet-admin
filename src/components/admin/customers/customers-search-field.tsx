import { HiXMark } from 'react-icons/hi2';
import { Input } from '@/components/ui/input';

type CustomersSearchFieldProps = {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
};

export function CustomersSearchField({ value, onChange, onClear }: CustomersSearchFieldProps) {
  const hasSearch = value.trim().length > 0;

  return (
    <div className="relative min-w-0 flex-1">
      <Input
        type="search"
        aria-label="ค้นหาลูกค้า"
        placeholder="ค้นหาชื่อ เบอร์โทร หรืออีเมล..."
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="pr-10 placeholder:text-muted-foreground"
      />
      {hasSearch ? (
        <button
          type="button"
          aria-label="ล้างช่องค้นหา"
          className="absolute right-2 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors duration-150 ease-out hover:bg-surface hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 motion-reduce:transition-none"
          onClick={onClear}
        >
          <HiXMark className="size-4" aria-hidden="true" />
        </button>
      ) : null}
    </div>
  );
}
