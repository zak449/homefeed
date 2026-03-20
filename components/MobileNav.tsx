"use client";

import { useState } from "react";

export default function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <div className="sm:hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="p-2 text-muted hover:text-ink rounded-lg transition-colors"
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
        <nav className="absolute top-14 left-0 right-0 bg-white border-b border-border shadow-card z-50 animate-fade-in">
          <div className="max-w-6xl mx-auto px-4 py-2 flex flex-col">
            <a
              href="/?type=sale"
              className="px-3 py-3 text-[14px] font-medium text-ink border-b border-tag transition-colors"
              onClick={() => setOpen(false)}
            >
              Buy
            </a>
            <a
              href="/?type=rent"
              className="px-3 py-3 text-[14px] font-medium text-ink border-b border-tag transition-colors"
              onClick={() => setOpen(false)}
            >
              Rent
            </a>
            <a
              href="/?sort=comments"
              className="px-3 py-3 text-[14px] font-bold text-social flex items-center gap-1.5 transition-colors"
              onClick={() => setOpen(false)}
            >
              🔥 Hot Takes
            </a>
          </div>
        </nav>
      )}
    </div>
  );
}
