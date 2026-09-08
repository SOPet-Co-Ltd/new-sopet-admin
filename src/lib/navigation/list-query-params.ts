/** Shared parsers/serializers for list URL query state. */

export function parsePageParam(value: string | null | undefined): number {
  const parsed = Number.parseInt(value ?? '1', 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

export function serializePageParam(page: number): string | null {
  return page > 1 ? String(page) : null;
}

export function parseSearchQuery(value: string | null | undefined): string {
  return value?.trim() ?? '';
}

export function serializeSearchQuery(value: string): string | null {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function parseEnumParam<T extends string>(
  value: string | null | undefined,
  allowed: ReadonlySet<T> | ReadonlyArray<T>,
  fallback: T,
): T {
  if (!value) return fallback;
  const set = allowed instanceof Set ? allowed : new Set(allowed);
  return set.has(value as T) ? (value as T) : fallback;
}

export function serializeEnumParam<T extends string>(value: T, omitWhen: T): string | null {
  return value === omitWhen ? null : value;
}

export function parseOptionalNumber(value: string | null | undefined): number | undefined {
  if (value == null || value.trim() === '') return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export function serializeOptionalNumber(value: number | undefined): string | null {
  return value == null ? null : String(value);
}

/** YYYY-MM-DD only; invalid values fall back to empty. */
export function parseDateParam(value: string | null | undefined): string {
  if (!value) return '';
  return /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : '';
}

export function serializeDateParam(value: string): string | null {
  return value ? value : null;
}

export function parseIdParam(value: string | null | undefined, allValue = 'all'): string {
  const trimmed = value?.trim() ?? '';
  return trimmed.length > 0 ? trimmed : allValue;
}

export function serializeIdParam(value: string, allValue = 'all'): string | null {
  return value === allValue ? null : value;
}
