function defaultAllowedOrigins(): string[] {
  const origins = new Set<string>();

  // SOPET-M-11: seed localhost only outside production.
  if (process.env.NODE_ENV !== 'production') {
    origins.add('http://localhost:3001');
    origins.add('https://localhost:3001');
  }

  const fromEnv = process.env.NEXT_PUBLIC_ADMIN_URL?.trim();
  if (fromEnv) {
    try {
      origins.add(new URL(fromEnv).origin);
    } catch {
      // ignore invalid env
    }
  }

  const csrfExtra = process.env.BFF_CSRF_ORIGINS?.split(',') ?? [];
  for (const entry of csrfExtra) {
    const trimmed = entry.trim();
    if (!trimmed) continue;
    try {
      origins.add(new URL(trimmed).origin);
    } catch {
      // ignore
    }
  }

  return [...origins];
}

export function getAllowedOrigins(): string[] {
  return defaultAllowedOrigins();
}

export function assertSameOrigin(request: Request): Response | null {
  const allowed = getAllowedOrigins();
  const origin = request.headers.get('origin');
  if (origin) {
    if (!allowed.includes(origin)) {
      return Response.json({ error: 'CSRF_ORIGIN_REJECTED' }, { status: 403 });
    }
    return null;
  }

  const referer = request.headers.get('referer');
  if (referer) {
    try {
      const refererOrigin = new URL(referer).origin;
      if (!allowed.includes(refererOrigin)) {
        return Response.json({ error: 'CSRF_ORIGIN_REJECTED' }, { status: 403 });
      }
      return null;
    } catch {
      return Response.json({ error: 'CSRF_ORIGIN_REJECTED' }, { status: 403 });
    }
  }

  if (process.env.NODE_ENV === 'production') {
    return Response.json({ error: 'CSRF_ORIGIN_REJECTED' }, { status: 403 });
  }

  return null;
}
