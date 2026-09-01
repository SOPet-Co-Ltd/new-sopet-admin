import { describe, expect, it } from 'vitest';
import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { GraphQLError } from 'graphql';
import {
  envelopeFallbackMessage,
  ERROR_CATALOG,
  ERROR_CATALOG_DOCS,
  ERROR_MESSAGES,
  isPermissionErrorCode,
  matchesErrorCatalogQuery,
  messageForErrorCode,
} from './error-messages';
import { ApiError } from './errors-core';

function gqlError(code: string, message = code) {
  return new CombinedGraphQLErrors({
    errors: [new GraphQLError(message, { extensions: { code } })],
  });
}

describe('messageForErrorCode', () => {
  it('returns centralized Thai message for known codes', () => {
    expect(messageForErrorCode('NOT_FOUND')).toBe(ERROR_MESSAGES.NOT_FOUND);
    expect(messageForErrorCode('FORBIDDEN')).toBe(ERROR_MESSAGES.FORBIDDEN);
    expect(messageForErrorCode('INVALID_CREDENTIALS')).toBe(ERROR_MESSAGES.INVALID_CREDENTIALS);
    expect(messageForErrorCode('ACCOUNT_SUSPENDED')).toBe(ERROR_MESSAGES.ACCOUNT_SUSPENDED);
  });

  it('maps ACCOUNT_SUSPENDED English backend copy to Thai', () => {
    expect(
      messageForErrorCode(
        'ACCOUNT_SUSPENDED',
        'Your account has been suspended. Please contact support for assistance.',
      ),
    ).toBe(ERROR_MESSAGES.ACCOUNT_SUSPENDED);
  });

  it('uses Thai map even when API sends Thai text', () => {
    expect(messageForErrorCode('BAD_REQUEST', 'รหัส OTP ไม่ถูกต้อง')).toBe(
      ERROR_MESSAGES.BAD_REQUEST,
    );
  });

  it('uses Thai map when API message equals the code', () => {
    expect(messageForErrorCode('FORBIDDEN', 'FORBIDDEN')).toBe(ERROR_MESSAGES.FORBIDDEN);
    expect(messageForErrorCode('INVALID_OTP', 'INVALID_OTP')).toBe(ERROR_MESSAGES.INVALID_OTP);
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

  it('does not surface API copy for unrecognized codes', () => {
    expect(messageForErrorCode('SOME_NEW_CODE', 'Custom detail')).toBe(
      ERROR_MESSAGES.UNKNOWN_ERROR,
    );
    expect(messageForErrorCode('SOME_NEW_CODE', 'ข้อความจาก API')).toBe(
      ERROR_MESSAGES.UNKNOWN_ERROR,
    );
    expect(messageForErrorCode('SOME_NEW_CODE', 'SOME_NEW_CODE')).toBe(
      ERROR_MESSAGES.UNKNOWN_ERROR,
    );
  });
});

describe('ERROR_CATALOG', () => {
  it('lists every ERROR_MESSAGES entry exactly once', () => {
    const codes = ERROR_CATALOG.map((entry) => entry.code);
    expect(new Set(codes).size).toBe(codes.length);
    expect(codes.sort()).toEqual(Object.keys(ERROR_MESSAGES).sort());
  });

  it('includes client-only codes', () => {
    const codes = new Set(ERROR_CATALOG.map((entry) => entry.code));
    expect(codes.has('NETWORK_ERROR')).toBe(true);
    expect(codes.has('TIMEOUT')).toBe(true);
    expect(codes.has('UNKNOWN_ERROR')).toBe(true);
  });

  it('keeps message aligned with ERROR_MESSAGES for every entry', () => {
    for (const entry of ERROR_CATALOG) {
      expect(entry.message).toBe(ERROR_MESSAGES[entry.code]);
    }
  });

  it('merges optional docs for high-value codes', () => {
    const forbidden = ERROR_CATALOG.find((entry) => entry.code === 'FORBIDDEN');
    expect(forbidden?.why).toBe(ERROR_CATALOG_DOCS.FORBIDDEN?.why);
    expect(forbidden?.possibleIssue).toBeTruthy();
    expect(forbidden?.howToFix).toBeTruthy();

    const obscure = ERROR_CATALOG.find((entry) => entry.code === 'INVALID_WEBHOOK_EVENT');
    expect(obscure?.why).toBeUndefined();
    expect(obscure?.possibleIssue).toBeUndefined();
    expect(obscure?.howToFix).toBeUndefined();
  });

  it('documents key admin/vendor domains', () => {
    const documented = new Set(Object.keys(ERROR_CATALOG_DOCS));
    for (const code of [
      'INVALID_CREDENTIALS',
      'STORE_SUSPENDED',
      'CATEGORY_REPLACEMENT_REQUIRED',
      'PRODUCT_NOT_PUBLISHABLE',
      'PAYOUT_BELOW_MINIMUM',
      'EMAIL_HTML_BLOCKED',
      'HOLD_TRANSITION_FORBIDDEN',
      'BAD_REQUEST',
    ] as const) {
      expect(documented.has(code)).toBe(true);
    }
  });
});

describe('matchesErrorCatalogQuery', () => {
  const sample = ERROR_CATALOG.find((entry) => entry.code === 'FORBIDDEN');
  if (!sample) {
    throw new Error('FORBIDDEN missing from ERROR_CATALOG');
  }

  it('matches empty query to every entry', () => {
    expect(matchesErrorCatalogQuery(sample, '')).toBe(true);
    expect(matchesErrorCatalogQuery(sample, '   ')).toBe(true);
  });

  it('matches code, Thai message, and optional docs', () => {
    expect(matchesErrorCatalogQuery(sample, 'forbidden')).toBe(true);
    expect(matchesErrorCatalogQuery(sample, 'ไม่มีสิทธิ์')).toBe(true);
    expect(matchesErrorCatalogQuery(sample, 'บทบาทไม่พอ')).toBe(true);
    expect(matchesErrorCatalogQuery(sample, 'ไม่เกี่ยว')).toBe(false);
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

  it('maps SCREAMING_SNAKE Error.message as a code', async () => {
    const { getErrorMessage } = await import('./errors');
    expect(getErrorMessage(new Error('FORBIDDEN'))).toBe(ERROR_MESSAGES.FORBIDDEN);
  });

  it('uses screen fallback with UNKNOWN_ERROR code for uncoded English Error messages', async () => {
    const { getErrorMessage } = await import('./errors');
    const { formatFallbackErrorMessage } = await import('./error-messages');
    expect(getErrorMessage(new Error('network down'), 'โหลดไม่สำเร็จ')).toBe(
      formatFallbackErrorMessage('โหลดไม่สำเร็จ', 'UNKNOWN_ERROR'),
    );
  });

  it('appends unmapped API codes on fallback paths', async () => {
    const { getErrorMessage } = await import('./errors');
    const { formatFallbackErrorMessage, ERROR_MESSAGES } = await import('./error-messages');
    expect(getErrorMessage(gqlError('SOME_NEW_CODE'))).toBe(
      formatFallbackErrorMessage(ERROR_MESSAGES.UNKNOWN_ERROR, 'SOME_NEW_CODE'),
    );
  });
});
