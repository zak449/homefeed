"use client";

import { useSearchParams, usePathname } from "next/navigation";
import Link from "next/link";

export default function NavLinks() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const currentSort = searchParams.get("sort");
  const isSaved = pathname === "/saved";
  const isExplore = pathname === "/" && currentSort !== "comments" && !isSaved;
  const isTrending = (currentSort === "comments" && pathname === "/") || pathname === "/trending";

  const links = [
    { href: "/", label: "Explore", active: isExplore },
    { href: "/?sort=comments", label: "Trending", active: isTrending },
    { href: "/saved", label: "Saved", active: isSaved },
  ];

  return (
    <nav className="hidden sm:flex items-center gap-1">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={`px-4 py-1.5 rounded-full text-sm transition-all ${
            link.active
              ? "bg-ink text-white font-medium"
              : "text-secondary hover:text-ink hover:bg-surface"
          }`}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
