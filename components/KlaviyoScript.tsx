"use client";

import { useEffect } from "react";

const SITE_ID = process.env.NEXT_PUBLIC_KLAVIYO_SITE_ID;

/**
 * Loads the Klaviyo on-site tracking snippet.
 * Only renders if NEXT_PUBLIC_KLAVIYO_SITE_ID is set.
 */
export default function KlaviyoScript() {
  useEffect(() => {
    if (!SITE_ID) return;

    // Prevent double-loading
    if (document.querySelector('script[src*="klaviyo.com"]')) return;

    const script = document.createElement("script");
    script.src = `https://static.klaviyo.com/onsite/js/klaviyo.js?company_id=${SITE_ID}`;
    script.async = true;
    script.type = "text/javascript";
    document.head.appendChild(script);

    return () => {
      // Cleanup on unmount (unlikely for a root-level component, but good practice)
      script.remove();
    };
  }, []);

  if (!SITE_ID) return null;

  return null;
}
