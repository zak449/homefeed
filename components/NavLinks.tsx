"use client";

import { useSearchParams, usePathname } from "next/navigation";
import Link from "next/link";

export default function NavLinks() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const currentSort = searchParams.get("sort");
  const isSaved = pathname === "/saved";
  const isProfile = pathname === "/profile";
  const isExplore = pathname === "/" && currentSort !== "comments" && !isSaved;
  const isTrending = (currentSort === "comments" && pathname === "/") || pathname === "/trending";

  return (
    <nav className="hidden sm:flex items-center gap-1">
      <Link
        href="/"
        className={`px-4 py-1.5 rounded-full text-sm transition-all ${
          isExplore
            ? "bg-amber text-white font-medium"
            : "text-secondary hover:text-ink hover:bg-surface"
        }`}
      >
        My Block
      </Link>
      <Link
        href="/?sort=comments"
        className={`px-4 py-1.5 rounded-full text-sm transition-all ${
          isTrending
            ? "bg-amber text-white font-medium"
            : "text-secondary hover:text-ink hover:bg-surface"
        }`}
      >
        Hot Takes
      </Link>
      <Link
        href="/?sort=comments&type=sale"
        className="px-4 py-1.5 rounded-full text-sm transition-all text-secondary hover:text-ink hover:bg-surface"
      >
        Red Flags 🚩
      </Link>
      <Link
        href="/profile"
        className={`px-4 py-1.5 rounded-full text-sm transition-all ${
          isProfile
            ? "bg-amber text-white font-medium"
            : "text-secondary hover:text-ink hover:bg-surface"
        }`}
      >
        Profile
      </Link>
      <Link
        href="/?city="
        className="ml-1 p-2 rounded-full text-secondary hover:text-ink hover:bg-surface transition-all"
        aria-label="Search"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      </Link>
    </nav>
  );
}
