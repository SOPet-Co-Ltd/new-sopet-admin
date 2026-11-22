import Link from 'next/link';
import { HiBookOpen } from 'react-icons/hi2';
import type { HelpRole } from '@/lib/help/types';
import { helpArticleHref } from '@/lib/help/registry';
import { cn } from '@/lib/utils';

type HelpDeepLinkProps = {
  role: HelpRole;
  slug: string;
  label?: string;
  className?: string;
};

/** Compact “ดูคู่มือ” link for feature pages. */
export function HelpDeepLink({ role, slug, label = 'ดูคู่มือ', className }: HelpDeepLinkProps) {
  return (
    <Link
      href={helpArticleHref(role, slug)}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-sm font-medium text-brand shadow-sm transition-colors hover:border-brand/30 hover:bg-brand/5',
        className,
      )}
      data-testid={`help-deep-link-${role}-${slug}`}
    >
      <HiBookOpen className="size-4 shrink-0 opacity-80" aria-hidden />
      {label}
    </Link>
  );
}
