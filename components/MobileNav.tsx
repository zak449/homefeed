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
              className="px-3 py-3 text-[14px] font-bold text-social flex items-center gap-1.5 border-b border-tag transition-colors"
              onClick={() => setOpen(false)}
            >
              🔥 Hot Takes
            </a>
            <a
              href="/saved"
              className="px-3 py-3 text-[14px] font-medium text-ink flex items-center gap-1.5 transition-colors"
              onClick={() => setOpen(false)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-4 h-4 text-red-400">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
              </svg>
              Saved
            </a>
          </div>
        </nav>
      )}
    </div>
  );
}
