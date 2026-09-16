"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import ProgressBar from "@badrap/bar-of-progress";

const progress = new ProgressBar({
  size: 3,
  color: "#f59e0b", // amber-500 matching Ghuba theme
  className: "bar-of-progress z-[99999] pointer-events-none fixed top-0 left-0 right-0 shadow-[0_0_8px_rgba(245,158,11,0.6)]",
  delay: 60,
});

export function NavigationProgressBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Finish progress when path or query completes
  useEffect(() => {
    progress.finish();
    if (activeTimerRef.current) {
      clearTimeout(activeTimerRef.current);
      activeTimerRef.current = null;
    }
  }, [pathname, searchParams]);

  // Intercept client-side link clicks for immediate < 50ms tactile feedback
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement)?.closest("a");
      if (!target) return;

      const href = target.getAttribute("href");
      if (!href) return;

      // Ignore external links, hash anchors, new tabs, downloads
      if (
        href.startsWith("#") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        target.target === "_blank" ||
        e.ctrlKey ||
        e.metaKey ||
        e.shiftKey ||
        e.altKey
      ) {
        return;
      }

      const currentUrl = new URL(window.location.href);
      let targetUrl: URL;
      try {
        targetUrl = new URL(href, window.location.href);
      } catch {
        return;
      }

      // Only animate if navigating to a different pathname or search query
      if (
        targetUrl.origin === currentUrl.origin &&
        (targetUrl.pathname !== currentUrl.pathname || targetUrl.search !== currentUrl.search)
      ) {
        progress.start();

        // Safety timeout in case navigation is blocked or errors out
        if (activeTimerRef.current) clearTimeout(activeTimerRef.current);
        activeTimerRef.current = setTimeout(() => {
          progress.finish();
        }, 8000);
      }
    };

    document.addEventListener("click", handleClick, { capture: true });
    return () => {
      document.removeEventListener("click", handleClick, { capture: true });
      if (activeTimerRef.current) clearTimeout(activeTimerRef.current);
    };
  }, []);

  return null;
}

export default NavigationProgressBar;
