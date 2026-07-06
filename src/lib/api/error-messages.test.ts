import { describe, expect, it } from 'vitest';
import { envelopeFallbackMessage, ERROR_MESSAGES, messageForErrorCode } from './error-messages';

describe('messageForErrorCode', () => {
  it('returns centralized Thai message for known codes', () => {
    expect(messageForErrorCode('NOT_FOUND')).toBe(ERROR_MESSAGES.NOT_FOUND);
    expect(messageForErrorCode('FORBIDDEN')).toBe(ERROR_MESSAGES.FORBIDDEN);
  });

  it('prefers a user-facing API message over the code default', () => {
    expect(messageForErrorCode('BAD_REQUEST', 'รหัส OTP ไม่ถูกต้อง')).toBe('รหัส OTP ไม่ถูกต้อง');
  });

  it('ignores opaque technical messages and falls back to code copy', () => {
    expect(
      messageForErrorCode('BAD_REQUEST', 'Response not successful: Received status code 500'),
    ).toBe(ERROR_MESSAGES.BAD_REQUEST);
    expect(messageForErrorCode('UNKNOWN_ERROR', 'Internal Server Error')).toBe(
      ERROR_MESSAGES.UNKNOWN_ERROR,
    );
  });

  it('returns unknown error for unrecognized codes', () => {
    expect(messageForErrorCode('SOME_NEW_CODE')).toBe(ERROR_MESSAGES.UNKNOWN_ERROR);
  });
});

describe('envelopeFallbackMessage', () => {
  it('returns a non-empty Thai fallback string', () => {
    const message = envelopeFallbackMessage();
    expect(message.length).toBeGreaterThan(0);
    expect(message).toContain('เกิดข้อผิดพลาด');
  });
});
