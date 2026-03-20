"use client";

import { useState } from "react";
import { useSearchParams, usePathname } from "next/navigation";

export default function MobileNav() {
  const [open, setOpen] = useState(false);
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const currentType = searchParams.get("type");
  const currentSort = searchParams.get("sort");

  const isBuy = currentType === "sale" && pathname === "/";
  const isRent = currentType === "rent" && pathname === "/";
  const isHotTakes = currentSort === "comments" && pathname === "/";
  const isSaved = pathname === "/saved";

  const links = [
    {
      href: "/?type=sale",
      label: "Buy",
      icon: "🏡",
      active: isBuy,
      activeClass: "bg-emerald-50 text-emerald-700 border-l-2 border-emerald-500",
    },
    {
      href: "/?type=rent",
      label: "Rent",
      icon: "🔑",
      active: isRent,
      activeClass: "bg-blue-50 text-blue-700 border-l-2 border-blue-500",
    },
    {
      href: "/?sort=comments",
      label: "Hot Takes",
      icon: "🔥",
      active: isHotTakes,
      activeClass: "bg-orange-50 text-social border-l-2 border-social",
    },
    {
      href: "/saved",
      label: "Saved",
      icon: "❤️",
      active: isSaved,
      activeClass: "bg-red-50 text-red-600 border-l-2 border-red-400",
    },
  ];

  return (
    <div className="sm:hidden">
      {/* Hamburger — shows colored dot when in a mode */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="p-2 text-muted hover:text-ink rounded-lg transition-colors relative"
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
        {/* Mode indicator dot */}
        {(isBuy || isRent) && (
          <span className={`absolute top-1 right-1 w-2 h-2 rounded-full ${
            isBuy ? "bg-emerald-500" : "bg-blue-500"
          }`} />
        )}
      </button>

      {open && (
        <nav className="absolute top-14 left-0 right-0 bg-white border-b border-border shadow-card z-50 animate-fade-in">
          <div className="max-w-6xl mx-auto px-4 py-2 flex flex-col">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={`px-3 py-3.5 text-[14px] font-semibold flex items-center gap-2.5 transition-all rounded-lg my-0.5 ${
                  link.active
                    ? link.activeClass
                    : "text-ink hover:bg-tag"
                }`}
                onClick={() => setOpen(false)}
              >
                <span className="text-base">{link.icon}</span>
                {link.label}
                {link.active && (
                  <span className="ml-auto text-[11px] font-bold opacity-60 uppercase tracking-wider">
                    Active
                  </span>
                )}
              </a>
            ))}
          </div>
        </nav>
      )}
    </div>
  );
}
