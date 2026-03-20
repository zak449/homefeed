"use client";

import { useSearchParams, usePathname } from "next/navigation";

export default function NavLinks() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const currentSort = searchParams.get("sort");
  const isSaved = pathname === "/saved";

  const isExplore = pathname === "/" && currentSort !== "comments" && !isSaved;
  const isTrending = currentSort === "comments" && pathname === "/";

  return (
    <nav className="hidden sm:flex items-center gap-6">
      <a
        href="/"
        className={`text-caption transition-colors ${
          isExplore ? "text-ink font-medium" : "text-tertiary hover:text-ink"
        }`}
      >
        explore
      </a>
      <a
        href="/?sort=comments"
        className={`text-caption transition-colors ${
          isTrending ? "text-ink font-medium" : "text-tertiary hover:text-ink"
        }`}
      >
        trending
      </a>
      <a
        href="/saved"
        className={`text-caption transition-colors ${
          isSaved ? "text-ink font-medium" : "text-tertiary hover:text-ink"
        }`}
      >
        saved
      </a>
    </nav>
  );
}
