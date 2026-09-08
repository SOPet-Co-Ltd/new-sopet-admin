'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Local search draft that commits to a URL-backed value after debounce.
 * When the committed URL value changes externally (Back/clear), the draft resets
 * during render — avoiding useEffect setState sync.
 */
export function useDebouncedSearchDraft(
  committed: string,
  onCommit: (next: string) => void,
  debounceMs = 300,
): [string, (next: string) => void] {
  const [draft, setDraft] = useState<string | null>(null);
  const [prevCommitted, setPrevCommitted] = useState(committed);
  const committedRef = useRef(committed);
  const onCommitRef = useRef(onCommit);

  useEffect(() => {
    committedRef.current = committed;
    onCommitRef.current = onCommit;
  }, [committed, onCommit]);

  if (committed !== prevCommitted) {
    setPrevCommitted(committed);
    setDraft(null);
  }

  const value = draft ?? committed;

  useEffect(() => {
    if (draft === null) return;
    const timer = setTimeout(() => {
      const next = draft.trim();
      if (next !== committedRef.current) {
        onCommitRef.current(next);
      }
    }, debounceMs);
    return () => clearTimeout(timer);
  }, [draft, debounceMs]);

  return [value, setDraft];
}
