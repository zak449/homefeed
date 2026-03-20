"use client";

import { useState } from "react";

export default function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <div className="sm:hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="p-2 text-muted hover:text-ink rounded-lg"
        aria-label="Menu"
        aria-expanded={open}
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
          {open ? (
            <path d="M5 5l10 10M15 5L5 15" />
          ) : (
            <path d="M3 5h14M3 10h14M3 15h14" />
          )}
        </svg>
      </button>

      {open && (
        <nav className="absolute top-14 left-0 right-0 bg-white/95 backdrop-blur-xl border-b border-border shadow-nav z-50">
          <div className="max-w-6xl mx-auto px-4 py-3 flex flex-col gap-1">
            <a
              href="/?type=sale"
              className="px-3 py-2.5 text-sm font-medium text-muted hover:text-ink hover:bg-tag rounded-lg transition-colors"
              onClick={() => setOpen(false)}
            >
              For Sale
            </a>
            <a
              href="/?type=rent"
              className="px-3 py-2.5 text-sm font-medium text-muted hover:text-ink hover:bg-tag rounded-lg transition-colors"
              onClick={() => setOpen(false)}
            >
              For Rent
            </a>
            <a
              href="/?sort=comments"
              className="px-3 py-2.5 text-sm font-medium text-accent hover:bg-red-50 rounded-lg transition-colors flex items-center gap-1"
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
