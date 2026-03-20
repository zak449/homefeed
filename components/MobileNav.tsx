"use client";

import { useSearchParams, usePathname } from "next/navigation";
import Link from "next/link";

export default function MobileNav() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const currentSort = searchParams.get("sort");

  const isHome = pathname === "/" && currentSort !== "comments";
  const isTrending = (currentSort === "comments" && pathname === "/") || pathname === "/trending";
  const isSaved = pathname === "/saved";

  const tabs = [
    {
      href: "/",
      label: "Home",
      active: isHome,
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill={isHome ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      ),
    },
    {
      href: "/?sort=comments",
      label: "Trending",
      active: isTrending,
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" fill={isTrending ? "currentColor" : "none"} />
          <path d="M12 6v6l4 2" stroke={isTrending ? "white" : "currentColor"} strokeLinecap="round" />
        </svg>
      ),
    },
    {
      href: "/saved",
      label: "Saved",
      active: isSaved,
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill={isSaved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      ),
    },
  ];

  return (
    <>
      {/* Bottom tab bar — fixed, always visible on mobile */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-divider">
        <div className="flex items-center justify-around h-14 max-w-lg mx-auto">
          {tabs.map((tab) => (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center gap-0.5 px-4 py-1.5 transition-colors ${
                tab.active ? "text-ink" : "text-tertiary"
              }`}
            >
              {tab.icon}
              <span className="text-[10px] font-medium">{tab.label}</span>
            </Link>
          ))}
        </div>
      </nav>
      {/* Spacer to prevent content from being hidden behind bottom bar */}
      <div className="sm:hidden h-14" />
    </>
  );
}
