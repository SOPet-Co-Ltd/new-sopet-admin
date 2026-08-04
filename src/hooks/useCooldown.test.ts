import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useCooldown } from './useCooldown';

describe('useCooldown', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('tracks remaining seconds and clears after duration', () => {
    const { result } = renderHook(() => useCooldown(3));

    act(() => {
      result.current.startCooldown();
    });

    expect(result.current.isCooldown).toBe(true);
    expect(result.current.remainingSeconds).toBe(3);

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current.remainingSeconds).toBe(2);

    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(result.current.isCooldown).toBe(false);
    expect(result.current.remainingSeconds).toBe(0);
  });
});
