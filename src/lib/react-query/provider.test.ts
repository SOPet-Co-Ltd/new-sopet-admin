import { describe, expect, it } from 'vitest';
import { ApiError } from '@/lib/api/errors-core';
import { shouldToastMutationError } from './provider';

describe('shouldToastMutationError (row 26)', () => {
  it('toasts when meta.toastError is true', () => {
    expect(
      shouldToastMutationError(new ApiError({ code: 'BAD_REQUEST', message: 'x', status: 400 }), {
        toastError: true,
      }),
    ).toBe(true);
  });

  it('never toasts when meta.toastError is false', () => {
    expect(
      shouldToastMutationError(new ApiError({ code: 'FORBIDDEN', message: 'x', status: 403 }), {
        toastError: false,
      }),
    ).toBe(false);
  });

  it('toasts permission failures even without toastError meta', () => {
    expect(
      shouldToastMutationError(
        new ApiError({ code: 'FORBIDDEN', message: 'You do not have access', status: 403 }),
        undefined,
      ),
    ).toBe(true);
    expect(
      shouldToastMutationError(
        new ApiError({
          code: 'STORE_MANAGER_REQUIRED',
          message: 'Only store owner or manager can perform this action',
          status: 403,
        }),
        {},
      ),
    ).toBe(true);
  });

  it('does not toast non-permission failures without toastError meta', () => {
    expect(
      shouldToastMutationError(
        new ApiError({ code: 'VALIDATION_ERROR', message: 'bad', status: 400 }),
        undefined,
      ),
    ).toBe(false);
  });
});
