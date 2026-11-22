/**
 * Module-level WS connection credentials for graphql-ws.
 * JWT is fetched lazily in connectionParams from the BFF ws-token route.
 */

export async function fetchWsAccessToken(): Promise<string | undefined> {
  if (typeof window === 'undefined') {
    return undefined;
  }

  try {
    const response = await fetch('/api/auth/ws-token', {
      method: 'POST',
      credentials: 'include',
      headers: { Accept: 'application/json' },
    });
    if (!response.ok) {
      return undefined;
    }
    const data = (await response.json()) as { accessToken?: string | null };
    return typeof data.accessToken === 'string' && data.accessToken.trim()
      ? data.accessToken.trim()
      : undefined;
  } catch {
    return undefined;
  }
}

export async function buildWsConnectionParams(): Promise<Record<string, string>> {
  const params: Record<string, string> = {};

  const accessToken = await fetchWsAccessToken();
  if (accessToken) {
    params.Authorization = `Bearer ${accessToken}`;
  }

  return params;
}
