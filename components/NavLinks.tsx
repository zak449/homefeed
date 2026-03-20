"use client";

import { useSearchParams, usePathname } from "next/navigation";

export default function NavLinks() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const currentType = searchParams.get("type");
  const currentSort = searchParams.get("sort");
  const isSaved = pathname === "/saved";

  const isBuy = currentType === "sale" && pathname === "/";
  const isRent = currentType === "rent" && pathname === "/";
  const isHotTakes = currentSort === "comments" && pathname === "/";

  return (
    <nav className="hidden sm:flex items-center gap-0.5">
      <a
        href="/?type=sale"
        className={`px-3.5 py-1.5 text-[13px] font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
          isBuy
            ? "bg-emerald-500 text-white shadow-sm"
            : "text-muted hover:text-ink hover:bg-ink/[0.04]"
        }`}
      >
        <span className="text-sm">🏡</span>
        Buy
      </a>
      <a
        href="/?type=rent"
        className={`px-3.5 py-1.5 text-[13px] font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
          isRent
            ? "bg-blue-500 text-white shadow-sm"
            : "text-muted hover:text-ink hover:bg-ink/[0.04]"
        }`}
      >
        <span className="text-sm">🔑</span>
        Rent
      </a>
      <a
        href="/?sort=comments"
        className={`px-3.5 py-1.5 text-[13px] font-semibold rounded-lg transition-all flex items-center gap-1 ${
          isHotTakes
            ? "bg-social text-white shadow-sm"
            : "text-social hover:text-social/80 hover:bg-social/5"
        }`}
      >
        <span>🔥</span> Hot Takes
      </a>
      <a
        href="/saved"
        className={`px-3.5 py-1.5 text-[13px] font-semibold rounded-lg transition-all flex items-center gap-1 ${
          isSaved
            ? "bg-ink text-white shadow-sm"
            : "text-muted hover:text-ink hover:bg-ink/[0.04]"
        }`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={isSaved ? "currentColor" : "none"} stroke="currentColor" strokeWidth={1.5} className="w-4 h-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
        </svg>
        Saved
      </a>
    </nav>
  );
}
