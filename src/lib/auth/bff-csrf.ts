function addOrigin(origins: Set<string>, raw: string | undefined): void {
  const trimmed = raw?.trim();
  if (!trimmed) return;
  try {
    origins.add(new URL(trimmed).origin);
  } catch {
    // ignore invalid env
  }
}

function requestOrigin(request: Request): string | null {
  try {
    return new URL(request.url).origin;
  } catch {
    return null;
  }
}

function defaultAllowedOrigins(): string[] {
  const origins = new Set<string>();

  // SOPET-M-11: seed localhost only outside production.
  if (process.env.NODE_ENV !== 'production') {
    origins.add('http://localhost:3001');
    origins.add('https://localhost:3001');
  }

  addOrigin(origins, process.env.NEXT_PUBLIC_ADMIN_URL);

  for (const entry of process.env.BFF_CSRF_ORIGINS?.split(',') ?? []) {
    addOrigin(origins, entry);
  }

  return [...origins];
}

function originAllowed(candidate: string, request: Request): boolean {
  if (getAllowedOrigins().includes(candidate)) {
    return true;
  }
  const self = requestOrigin(request);
  return self !== null && candidate === self;
}

export function getAllowedOrigins(): string[] {
  return defaultAllowedOrigins();
}

export function assertSameOrigin(request: Request): Response | null {
  const origin = request.headers.get('origin');
  if (origin) {
    if (!originAllowed(origin, request)) {
      return Response.json({ error: 'CSRF_ORIGIN_REJECTED' }, { status: 403 });
    }
    return null;
  }

  const referer = request.headers.get('referer');
  if (referer) {
    try {
      const refererOrigin = new URL(referer).origin;
      if (!originAllowed(refererOrigin, request)) {
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
