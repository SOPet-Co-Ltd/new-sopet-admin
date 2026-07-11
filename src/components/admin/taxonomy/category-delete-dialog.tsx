'use client';

import type { TaxonomyItem } from '@/types';

export interface CategoryDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: TaxonomyItem | null;
  approvedCategories: TaxonomyItem[];
  triggerRef?: React.RefObject<HTMLButtonElement | null>;
}

/** Stub — full wizard implemented in Phase 6 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function CategoryDeleteDialog(_props: CategoryDeleteDialogProps) {
  return null;
}
