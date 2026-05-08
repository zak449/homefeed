"use client";

import { useState } from "react";
import { useSearchParams, usePathname } from "next/navigation";
import Link from "next/link";
import SpillSheet from "./SpillSheet";
import { MobileTabBadge } from "./notifications/MobileTabBadge";

export default function MobileNav() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const currentSort = searchParams.get("sort");
  const [isSpillOpen, setIsSpillOpen] = useState(false);
  const [spillAddress, setSpillAddress] = useState<string | undefined>(undefined);
  const [spillListingId, setSpillListingId] = useState<string | undefined>(undefined);

  const isHome = pathname === "/" && currentSort !== "comments";
  const isTrending = (currentSort === "comments" && pathname === "/") || pathname === "/trending" || pathname === "/hot-takes";
  const isSaved = pathname === "/saved";
  const isProfile = pathname === "/profile";
  const isListingPage = pathname.startsWith("/listing/");

  const tabs = [
    {
      href: "/",
      label: "Feed",
      active: isHome,
      accent: false,
      icon: (active: boolean) => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      ),
    },
    {
      href: "/hot-takes",
      label: "Hot Takes",
      active: isTrending,
      accent: false,
      icon: (active: boolean) => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5">
          <path d="M12 23c-3.866 0-7-3.134-7-7 0-3 2-6 4-8 0 3 2 4 3 4 0-4 2-8 5-10-1 3 1 5 3 6 2 1.5 3 3.5 3 6 0 4.5-3.5 9-11 9z" />
        </svg>
      ),
    },
    {
      href: "#spill",
      label: "Spill",
      active: false,
      accent: true,
      icon: (_active: boolean) => (
        <span className="text-[20px] leading-none">🫖</span>
      ),
    },
    {
      href: "/saved",
      label: "Saved",
      active: isSaved,
      accent: false,
      icon: (active: boolean) => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      ),
    },
    {
      href: "/profile",
      label: "Profile",
      active: isProfile,
      accent: false,
      icon: (active: boolean) => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      ),
    },
  ];

  function handleTakeClick(e: React.MouseEvent) {
    e.preventDefault();
    if (isListingPage) {
      const listingId = pathname.split("/listing/")[1] || undefined;
      const address = document.querySelector("h1")?.textContent?.split(",")[0] || undefined;
      setSpillListingId(listingId);
      setSpillAddress(address);
    } else {
      setSpillListingId(undefined);
      setSpillAddress(undefined);
    }
    setIsSpillOpen(true);
  }

  return (
    <>
      {/* Bottom tab bar — fixed, always visible on mobile */}
      <nav
        className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-bg/95 backdrop-blur-sm border-t border-divider"
        style={{ boxShadow: "0 -1px 16px rgba(232,168,124,0.07)", paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        <div className="flex items-end justify-evenly h-16 max-w-md mx-auto px-1">
          {tabs.map((tab) => {
            const isAccent = tab.accent;
            const content = (
              <>
                {/* Active amber dot indicator above icon */}
                {tab.active && !isAccent && (
                  <span
                    className="absolute top-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#E8A87C]"
                    aria-hidden="true"
                  />
                )}

                {/* Amber accent button for +Take */}
                {isAccent ? (
                  <span className="flex items-center justify-center w-12 h-12 -mt-4 rounded-full bg-amber text-white shadow-lg shadow-amber/30 border-4 border-bg">
                    {tab.icon(false)}
                  </span>
                ) : tab.label === "Profile" ? (
                  <span className="relative inline-flex">{tab.icon(tab.active)}<MobileTabBadge /></span>
                ) : (
                  tab.icon(tab.active)
                )}

                <span className={`text-xs font-medium ${
                  isAccent
                    ? "text-amber font-bold"
                    : tab.active
                      ? "text-[#E8A87C]"
                      : "text-tertiary"
                }`}>
                  {tab.label}
                </span>
              </>
            );

            const className = `relative flex flex-col items-center gap-0.5 py-1.5 flex-1 min-h-[44px] transition-colors rounded-xl ${
              isAccent
                ? ""
                : tab.active
                  ? "text-[#E8A87C]"
                  : "text-secondary hover:text-ink"
            }`;

            if (isAccent) {
              return (
                <button
                  key={tab.href + tab.label}
                  onClick={handleTakeClick}
                  className={className}
                >
                  {content}
                </button>
              );
            }

            return (
              <Link
                key={tab.href + tab.label}
                href={tab.href}
                className={className}
              >
                {content}
              </Link>
            );
          })}
        </div>
      </nav>
      {/* Spacer to prevent content from being hidden behind bottom bar */}
      <div className="sm:hidden h-16" style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }} />
      <SpillSheet
        isOpen={isSpillOpen}
        onClose={() => setIsSpillOpen(false)}
        listingAddress={spillAddress}
        listingId={spillListingId}
      />
    </>
  );
}
