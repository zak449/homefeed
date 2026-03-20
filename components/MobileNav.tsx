"use client";

import { useState } from "react";
import { useSearchParams, usePathname } from "next/navigation";

export default function MobileNav() {
  const [open, setOpen] = useState(false);
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const currentSort = searchParams.get("sort");

  const isExplore = pathname === "/" && currentSort !== "comments";
  const isTrending = currentSort === "comments" && pathname === "/";
  const isSaved = pathname === "/saved";

  const links = [
    { href: "/", label: "explore", active: isExplore },
    { href: "/?sort=comments", label: "trending", active: isTrending },
    { href: "/saved", label: "saved", active: isSaved },
  ];

  return (
    <div className="sm:hidden">
      {/* Hamburger */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="p-2 text-secondary hover:text-ink transition-colors"
        aria-label="Menu"
        aria-expanded={open}
      >
        <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
          {open ? (
            <path d="M5 5l10 10M15 5L5 15" />
          ) : (
            <path d="M3 5h14M3 10h14M3 15h14" />
          )}
        </svg>
      </button>

      {open && (
        <nav className="absolute top-14 left-0 right-0 bg-white z-50 animate-fade-in">
          <div className="max-w-[1200px] mx-auto px-4 py-3 flex flex-col">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={`px-3 py-4 text-body transition-colors ${
                  link.active
                    ? "text-ink font-medium"
                    : "text-secondary hover:text-ink"
                }`}
                onClick={() => setOpen(false)}
              >
                {link.label}
              </a>
            ))}
          </div>
        </nav>
      )}
    </div>
  );
}
