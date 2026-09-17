/**
 * hooks/useScrollPositionPersistence.ts
 *
 * Non-blocking, passive scroll position persistence with automatic debouncing.
 * Prevents main-thread frame drops during scrolling by avoiding synchronous sessionStorage writes.
 */

import { useEffect, useRef } from 'react';

interface UseScrollPositionPersistenceOptions {
  storageKey: string;
  enabled?: boolean;
  debounceMs?: number;
  maxAgeMs?: number; // default 30 mins
}

export function useScrollPositionPersistence({
  storageKey,
  enabled = true,
  debounceMs = 200,
  maxAgeMs = 1000 * 60 * 30,
}: UseScrollPositionPersistenceOptions) {
  const scrollRestoredRef = useRef(false);

  // 1. Debounced scroll persistence listener
  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    let timeoutId: NodeJS.Timeout | null = null;

    const handleScroll = () => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        if (window.scrollY > 0) {
          try {
            sessionStorage.setItem(
              storageKey,
              JSON.stringify({
                scrollY: window.scrollY,
                timestamp: Date.now(),
              })
            );
          } catch {
            // Ignore quota / private browsing errors
          }
        }
      }, debounceMs);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [storageKey, enabled, debounceMs]);

  // 2. Helper to restore scroll position once data is ready
  const restoreScrollPosition = (onBeforeRestore?: () => void) => {
    if (scrollRestoredRef.current || typeof window === 'undefined') return false;

    try {
      const saved = sessionStorage.getItem(storageKey);
      if (!saved) return false;

      const parsed = JSON.parse(saved);
      if (parsed.scrollY && Date.now() - (parsed.timestamp || 0) < maxAgeMs) {
        scrollRestoredRef.current = true;
        onBeforeRestore?.();
        requestAnimationFrame(() => {
          window.scrollTo({
            top: parsed.scrollY,
            behavior: 'instant' as ScrollBehavior,
          });
        });
        return true;
      }
    } catch {
      // Ignore sessionStorage parsing errors
    }
    return false;
  };

  return { restoreScrollPosition, isRestored: scrollRestoredRef.current };
}
