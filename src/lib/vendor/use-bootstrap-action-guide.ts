'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCurrentUser } from '@/hooks/useAuth';
import {
  ACTION_GUIDE_QUERY,
  hasSeenActionGuide,
  startActionGuide,
  type ActionGuideId,
} from '@/lib/vendor/action-guide';

/**
 * Auto-start an action guide from `?guide=<id>` at most once per user.
 * Strips the query after handling so refresh does not re-trigger.
 * Tours hub replay: clear seen, then navigate with `?guide=`.
 */
export function useBootstrapActionGuide(
  guideId: ActionGuideId,
  onStarted?: () => void,
  options?: { ensureQuery?: Record<string, string> },
): void {
  const { user } = useCurrentUser();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const handledRef = useRef(false);
  const ensureQuery = options?.ensureQuery;

  useEffect(() => {
    if (handledRef.current) return;
    if (searchParams.get(ACTION_GUIDE_QUERY) !== guideId) return;

    // Wait for auth so we can honor “seen once”.
    if (!user?.id) return;

    handledRef.current = true;

    const started = startActionGuide(guideId, { userId: user.id });
    if (started) {
      onStarted?.();
    }

    const next = new URLSearchParams(searchParams.toString());
    next.delete(ACTION_GUIDE_QUERY);
    if (ensureQuery) {
      for (const [key, value] of Object.entries(ensureQuery)) {
        next.set(key, value);
      }
    }
    const query = next.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }, [ensureQuery, guideId, onStarted, pathname, router, searchParams, user?.id]);
}

export function canAutoStartActionGuide(
  userId: string | null | undefined,
  guideId: ActionGuideId,
): boolean {
  if (!userId) return false;
  return !hasSeenActionGuide(userId, guideId);
}
