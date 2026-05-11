"use client";

/**
 * Initializes PostHog on mount and fires `page_viewed` on every
 * client-side route change. Consent gating happens inside lib/analytics —
 * this component is a thin lifecycle hook.
 *
 * Mounted near the root of app/layout.tsx. Pathname-reading components
 * must be Suspense-wrapped under Next 15, so this component is wrapped
 * by the caller.
 */

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { initAnalytics, track } from "@/lib/analytics";

export default function AnalyticsProvider() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // One-shot init on mount.
  useEffect(() => {
    initAnalytics();
  }, []);

  // Fire page_viewed on every route change (pathname + search params).
  useEffect(() => {
    if (!pathname) return;
    const qs = searchParams?.toString();
    const fullPath = qs ? `${pathname}?${qs}` : pathname;
    track.pageViewed(fullPath);
  }, [pathname, searchParams]);

  return null;
}
