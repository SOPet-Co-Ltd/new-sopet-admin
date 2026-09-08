'use client';

import { useCallback, useMemo } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

export type QueryParamSpec<T> = {
  parse: (raw: string | null) => T;
  serialize: (value: T) => string | null;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- heterogeneous per-key value types
export type ListQuerySpec = Record<string, QueryParamSpec<any>>;

type ValuesFromSpec<S extends ListQuerySpec> = {
  [K in keyof S]: S[K] extends QueryParamSpec<infer T> ? T : never;
};

type SetParamsArg<S extends ListQuerySpec> =
  Partial<ValuesFromSpec<S>> | ((prev: ValuesFromSpec<S>) => Partial<ValuesFromSpec<S>>);

function readValues<S extends ListQuerySpec>(
  searchParams: URLSearchParams,
  spec: S,
): ValuesFromSpec<S> {
  const values = {} as ValuesFromSpec<S>;
  for (const key of Object.keys(spec) as Array<keyof S & string>) {
    values[key] = spec[key].parse(searchParams.get(key)) as ValuesFromSpec<S>[typeof key];
  }
  return values;
}

function applyPatchToParams<S extends ListQuerySpec>(
  current: URLSearchParams,
  spec: S,
  values: ValuesFromSpec<S>,
  patch: Partial<ValuesFromSpec<S>>,
): URLSearchParams {
  const next = new URLSearchParams(current.toString());
  const hasNonPageKey = Object.keys(patch).some((key) => key !== 'page');
  const merged: ValuesFromSpec<S> = { ...values, ...patch };

  if (hasNonPageKey && !('page' in patch) && 'page' in spec) {
    // Filter/search changes reset pagination unless page is set explicitly.
    (merged as Record<string, unknown>).page = spec.page.parse(null);
  }

  for (const key of Object.keys(spec) as Array<keyof S & string>) {
    const serialized = spec[key].serialize(merged[key]);
    if (serialized == null) {
      next.delete(key);
    } else {
      next.set(key, serialized);
    }
  }

  return next;
}

export function useListQueryState<S extends ListQuerySpec>(
  spec: S,
): [ValuesFromSpec<S>, (patch: SetParamsArg<S>) => void] {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchParamsKey = searchParams.toString();

  const values = useMemo(
    () => readValues(searchParams, spec),
    // spec is a module-level constant at each call site
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [searchParams, searchParamsKey],
  );

  const setParams = useCallback(
    (patchArg: SetParamsArg<S>) => {
      const currentValues = readValues(searchParams, spec);
      const patch = typeof patchArg === 'function' ? patchArg(currentValues) : patchArg;
      const next = applyPatchToParams(searchParams, spec, currentValues, patch);
      const query = next.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams, spec],
  );

  return [values, setParams];
}
