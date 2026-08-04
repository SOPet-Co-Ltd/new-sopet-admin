'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export function useCooldown(durationSeconds: number) {
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const startCooldown = useCallback(() => {
    clearTimer();
    setRemainingSeconds(durationSeconds);
    intervalRef.current = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearTimer();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [clearTimer, durationSeconds]);

  useEffect(() => () => clearTimer(), [clearTimer]);

  return {
    isCooldown: remainingSeconds > 0,
    remainingSeconds,
    startCooldown,
  };
}
