"use client";

import { useEffect } from "react";
import { trackEvent } from "@/lib/analytics-client";

export default function ListingViewTracker({ listingId, city }: { listingId: string; city: string }) {
  useEffect(() => {
    trackEvent("listing_view", { listingId, city });
  }, [listingId, city]);

  return null;
}
