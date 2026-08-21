'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

function readHashToken(): string {
  if (typeof window === 'undefined') {
    return '';
  }
  const raw = window.location.hash.startsWith('#') ? window.location.hash.slice(1) : '';
  return new URLSearchParams(raw).get('token')?.trim() ?? '';
}

/**
 * Prefer `#token=` so secrets are not in server access logs (SOPET-L-03).
 * Email links with `?token=` still work on first paint; migrate to the hash client-side.
 */
export function useSecretTokenParam(): string {
  const searchParams = useSearchParams();
  const queryToken = searchParams.get('token')?.trim() ?? '';
  const [hashToken, setHashToken] = useState(readHashToken);

  useEffect(() => {
    if (!queryToken || typeof window === 'undefined') {
      return;
    }

    const url = new URL(window.location.href);
    url.searchParams.delete('token');
    url.hash = `token=${encodeURIComponent(queryToken)}`;
    window.history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- migrate query secret into hash once
    setHashToken(queryToken);
  }, [queryToken]);

  return hashToken || queryToken;
}
