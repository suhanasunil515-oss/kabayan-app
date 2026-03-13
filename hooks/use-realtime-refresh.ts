'use client';

import { useEffect, useRef, useCallback } from 'react';

/**
 * Refetch when the user returns to the tab (visibility change) so admin updates
 * (wallet, loan status, etc.) appear without manual refresh.
 * Optionally refetch on an interval for near real-time updates.
 */
export function useRealtimeRefresh(
  refetch: () => void | Promise<void>,
  options: {
    /** Refetch when tab becomes visible (default true) */
    refetchOnVisible?: boolean;
    /** Polling interval in ms; 0 or undefined = no polling (default 0) */
    intervalMs?: number;
    /** Only run when document is visible (default true for interval) */
    pollOnlyWhenVisible?: boolean;
  } = {}
) {
  const {
    refetchOnVisible = true,
    intervalMs = 0,
    pollOnlyWhenVisible = true,
  } = options;

  const refetchRef = useRef(refetch);
  refetchRef.current = refetch;

  const stableRefetch = useCallback(() => {
    refetchRef.current();
  }, []);

  useEffect(() => {
    if (refetchOnVisible) {
      const onVisibility = () => {
        if (document.visibilityState === 'visible') {
          stableRefetch();
        }
      };
      document.addEventListener('visibilitychange', onVisibility);
      return () => document.removeEventListener('visibilitychange', onVisibility);
    }
  }, [refetchOnVisible, stableRefetch]);

  useEffect(() => {
    if (intervalMs <= 0) return;
    const tick = () => {
      if (pollOnlyWhenVisible && document.visibilityState !== 'visible') return;
      stableRefetch();
    };
    const id = setInterval(tick, intervalMs);
    return () => clearInterval(id);
  }, [intervalMs, pollOnlyWhenVisible, stableRefetch]);
}
