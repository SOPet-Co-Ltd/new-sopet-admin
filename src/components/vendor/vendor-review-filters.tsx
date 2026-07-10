import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { RatingFilter, ReplyFilter } from '@/lib/vendor/review-filters';

type VendorReviewFiltersProps = {
  replyFilter: ReplyFilter;
  ratingFilter: RatingFilter;
  onReplyFilterChange: (value: ReplyFilter) => void;
  onRatingFilterChange: (value: RatingFilter) => void;
  disabled?: boolean;
};

export function VendorReviewFilters({
  replyFilter,
  ratingFilter,
  onReplyFilterChange,
  onRatingFilterChange,
  disabled = false,
}: VendorReviewFiltersProps) {
  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="w-44">
        <label htmlFor="reviews-reply-filter" className="mb-1 block text-xs font-medium text-muted">
          สถานะการตอบกลับ
        </label>
        <Select
          value={replyFilter}
          onValueChange={(value) => onReplyFilterChange(value as ReplyFilter)}
          disabled={disabled}
        >
          <SelectTrigger id="reviews-reply-filter">
            <SelectValue placeholder="ทั้งหมด" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">ทั้งหมด</SelectItem>
            <SelectItem value="unreplied">ยังไม่ตอบ</SelectItem>
            <SelectItem value="replied">ตอบแล้ว</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="w-44">
        <label
          htmlFor="reviews-rating-filter"
          className="mb-1 block text-xs font-medium text-muted"
        >
          กรองตามคะแนน
        </label>
        <Select
          value={ratingFilter}
          onValueChange={(value) => onRatingFilterChange(value as RatingFilter)}
          disabled={disabled}
        >
          <SelectTrigger id="reviews-rating-filter">
            <SelectValue placeholder="ทุกคะแนน" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">ทุกคะแนน</SelectItem>
            <SelectItem value="5">5 ดาว</SelectItem>
            <SelectItem value="4">4 ดาว</SelectItem>
            <SelectItem value="3">3 ดาว</SelectItem>
            <SelectItem value="2">2 ดาว</SelectItem>
            <SelectItem value="1">1 ดาว</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
