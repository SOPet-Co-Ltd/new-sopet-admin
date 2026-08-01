import { describe, expect, it } from 'vitest';
import {
  envelopeFallbackMessage,
  ERROR_MESSAGES,
  isPermissionErrorCode,
  messageForErrorCode,
} from './error-messages';
import { ApiError } from './errors-core';

describe('messageForErrorCode', () => {
  it('returns centralized Thai message for known codes', () => {
    expect(messageForErrorCode('NOT_FOUND')).toBe(ERROR_MESSAGES.NOT_FOUND);
    expect(messageForErrorCode('FORBIDDEN')).toBe(ERROR_MESSAGES.FORBIDDEN);
  });

  it('prefers a Thai API message over the code default', () => {
    expect(messageForErrorCode('BAD_REQUEST', 'รหัส OTP ไม่ถูกต้อง')).toBe('รหัส OTP ไม่ถูกต้อง');
  });

  it('ignores English backend messages for known codes (row 26)', () => {
    expect(messageForErrorCode('FORBIDDEN', 'You do not have access to this store')).toBe(
      ERROR_MESSAGES.FORBIDDEN,
    );
    expect(
      messageForErrorCode(
        'STORE_MANAGER_REQUIRED',
        'Only store owner or manager can perform this action',
      ),
    ).toBe(ERROR_MESSAGES.STORE_MANAGER_REQUIRED);
    expect(messageForErrorCode('FORBIDDEN', 'Forbidden resource')).toBe(ERROR_MESSAGES.FORBIDDEN);
  });

  it('ignores opaque technical messages and falls back to code copy', () => {
    expect(
      messageForErrorCode('BAD_REQUEST', 'Response not successful: Received status code 500'),
    ).toBe(ERROR_MESSAGES.BAD_REQUEST);
    expect(messageForErrorCode('UNKNOWN_ERROR', 'Internal Server Error')).toBe(
      ERROR_MESSAGES.UNKNOWN_ERROR,
    );
  });

  it('returns unknown error for unrecognized codes without a usable message', () => {
    expect(messageForErrorCode('SOME_NEW_CODE')).toBe(ERROR_MESSAGES.UNKNOWN_ERROR);
  });

  it('returns API message for unrecognized codes when it is user-facing', () => {
    expect(messageForErrorCode('SOME_NEW_CODE', 'Custom detail')).toBe('Custom detail');
  });
});

describe('isPermissionErrorCode', () => {
  it('recognizes role/permission failure codes', () => {
    expect(isPermissionErrorCode('FORBIDDEN')).toBe(true);
    expect(isPermissionErrorCode('STORE_MANAGER_REQUIRED')).toBe(true);
    expect(isPermissionErrorCode('HOLD_TRANSITION_FORBIDDEN')).toBe(true);
    expect(isPermissionErrorCode('VALIDATION_ERROR')).toBe(false);
  });
});

describe('envelopeFallbackMessage', () => {
  it('returns a non-empty Thai fallback string', () => {
    const message = envelopeFallbackMessage();
    expect(message.length).toBeGreaterThan(0);
    expect(message).toContain('เกิดข้อผิดพลาด');
  });
});

describe('ApiError + FORBIDDEN mapping', () => {
  it('surfaces Thai FORBIDDEN via getErrorMessage path shape', async () => {
    const { getErrorMessage } = await import('./errors');
    const err = new ApiError({
      code: 'FORBIDDEN',
      message: 'You do not have access to this order',
      status: 403,
    });
    // normalizeError re-runs messageForErrorCode and should replace English.
    expect(getErrorMessage(err)).toBe(ERROR_MESSAGES.FORBIDDEN);
  });
});
