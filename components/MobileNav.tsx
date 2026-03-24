"use client";

import { useSearchParams, usePathname, useRouter } from "next/navigation";
import Link from "next/link";

export default function MobileNav() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const currentSort = searchParams.get("sort");

  const isHome = pathname === "/" && currentSort !== "comments";
  const isTrending = (currentSort === "comments" && pathname === "/") || pathname === "/trending";
  const isSaved = pathname === "/saved";
  const isListingPage = pathname.startsWith("/listing/");

  const tabs = [
    {
      href: "/",
      label: "My Block",
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
      href: "/?sort=comments",
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
      href: "#take",
      label: "+Take",
      active: false,
      accent: true,
      icon: (_active: boolean) => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
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
  ];

  function handleTakeClick(e: React.MouseEvent) {
    e.preventDefault();
    if (isListingPage) {
      // On listing pages, scroll to the comment form
      const el = document.getElementById("comment-form");
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        // Focus the first input in the form
        const input = el.querySelector("textarea, input[type='text']") as HTMLElement | null;
        if (input) setTimeout(() => input.focus(), 400);
        return;
      }
    }
    // On all other pages, go to search/browse view
    router.push("/?city=");
  }

  return (
    <>
      {/* Bottom tab bar — fixed, always visible on mobile */}
      <nav
        className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-bg/95 backdrop-blur-sm border-t border-divider"
        style={{ boxShadow: "0 -1px 16px rgba(232,168,124,0.07)", paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
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
                ) : (
                  tab.icon(tab.active)
                )}

                <span className={`text-[10px] font-medium ${
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

            const className = `relative flex flex-col items-center gap-0.5 px-3 py-1.5 min-w-[44px] min-h-[44px] transition-colors rounded-xl ${
              isAccent
                ? ""
                : tab.active
                  ? "text-[#E8A87C]"
                  : "text-tertiary hover:text-secondary"
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
    </>
  );
}
