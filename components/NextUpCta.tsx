"use client";

/**
 * NextUpCta — every dead-end gets one.
 *
 * Drop in at the bottom of any page that previously ended in a footer or a flat
 * empty state. The user always has a clear "next thing" to click.
 *
 * Variants:
 *   <NextUpCta href="/hot-takes" emoji="🔥">Catch up on what's boiling</NextUpCta>
 *   <NextUpCta onClick={openSpill} emoji="🫖">Drop your take on the block</NextUpCta>
 *
 * Renders as either an <a> (when href) or a <button> (when onClick).
 */

import Link from "next/link";

interface NextUpCtaProps {
  href?: string;
  onClick?: () => void;
  emoji?: string;
  /** Body label */
  children: React.ReactNode;
  /** Optional eyebrow above the main label */
  eyebrow?: string;
  className?: string;
}

export default function NextUpCta({ href, onClick, emoji, eyebrow, children, className }: NextUpCtaProps) {
  const inner = (
    <>
      <span className="flex items-center gap-3 min-w-0">
        {emoji && <span className="text-lg shrink-0" aria-hidden>{emoji}</span>}
        <span className="flex-1 min-w-0 text-left">
          {eyebrow && <span className="block text-tag uppercase tracking-wider text-tea-300">{eyebrow}</span>}
          <span className="block text-body sm:text-title text-ink">{children}</span>
        </span>
      </span>
    </>
  );

  if (href) {
    return (
      <Link href={href} className={`next-up-cta block ${className ?? ""}`}>
        {inner}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={`next-up-cta w-full ${className ?? ""}`}
    >
      {inner}
    </button>
  );
}
