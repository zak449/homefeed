"use client";

import { useGeo } from "@/components/GeoProvider";

/**
 * Client wrapper for the Neighborhood Spotlight card.
 * When user has location, shows their actual neighborhood/city.
 * Falls back to the default 90026 content when no location is available.
 */
export default function GeoNeighborhoodSpotlight({ commentCount }: { commentCount: number }) {
  const { location } = useGeo();

  const hasLocation = location && location.city;
  const displayZip = location?.zip || "90026";
  const displayCity = hasLocation ? location.city : "Echo Park, Silver Lake";
  const displayArea = hasLocation
    ? `${location.city}${location.state ? `, ${location.state}` : ""}`
    : "Echo Park, Silver Lake, and surrounding areas";
  const communityHref = hasLocation
    ? `/community/${displayZip}`
    : "/community/90026";

  return (
    <div className="px-4 py-5">
      <div className="rounded-2xl bg-gradient-to-br from-amber/5 via-surface to-highlight border border-amber/15 p-5 relative overflow-hidden">
        <div className="absolute -top-8 -right-8 w-28 h-28 bg-amber/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative">
          <p className="text-[11px] font-bold tracking-widest uppercase text-amber mb-2">Neighborhood Spotlight</p>
          <h3 className="text-lg font-extrabold text-ink mb-1">
            {hasLocation
              ? `What\u2019s happening in ${displayArea}`
              : "What\u2019s happening in 90026"}
          </h3>
          <p className="text-sm text-secondary mb-3">
            {hasLocation
              ? `See what verified neighbors are saying about ${displayCity} and surrounding areas.`
              : "See what verified neighbors are saying about Echo Park, Silver Lake, and surrounding areas."}
          </p>
          <div className="flex items-center gap-3 mb-4">
            <div className="flex -space-x-2">
              {["ZK", "ML", "JR", "AS"].map((init) => (
                <div key={init} className="w-7 h-7 rounded-full bg-ink text-white text-[10px] font-bold flex items-center justify-center border-2 border-surface">{init}</div>
              ))}
            </div>
            <span className="text-xs text-secondary">{commentCount > 0 ? `${commentCount} takes shared` : "Join the conversation"}</span>
          </div>
          <a href={communityHref} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-ink text-white text-sm font-semibold hover:opacity-90 active:scale-[0.97] transition-all">
            Join the conversation &rarr;
          </a>
        </div>
      </div>
    </div>
  );
}
