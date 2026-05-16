/**
 * AgentVsNeighbor (feed variant) — a homepage-feed card that puts the agent's
 * description and a top neighbor take face-to-face. Distinct from the
 * `components/listing/AgentVsNeighbor.tsx` (same name, different surface):
 * that one lives on the listing detail page; this one is a *feed* card
 * variant designed to break feed rhythm.
 *
 * Side-by-side on desktop, stacked on mobile. The contrast IS the design —
 * amber sales-pitch on one side, parchment-journal neighbor-take on the
 * other. If either half is missing, the whole card declines to render.
 * Server component.
 */

import Link from "next/link";
import FallbackImage from "@/components/FallbackImage";

interface AvnListing {
  id: string;
  address: string;
  price: number;
  /** Listing type — drives the rent vs. sale price formatting. */
  listingType?: string;
  description?: string | null;
  photos: string[];
}

interface AvnComment {
  author: string;
  content: string;
  role?: string | null;
  location?: string | null;
}

export interface AgentVsNeighborProps {
  listing: AvnListing;
  topComment: AvnComment;
}

function formatName(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length <= 1) return name;
  return `${parts[0]} ${parts[parts.length - 1][0]}.`;
}

function fmtPrice(price: number, listingType?: string): string {
  return listingType === "rent"
    ? `$${price.toLocaleString()}/mo`
    : `$${price.toLocaleString()}`;
}

export default function AgentVsNeighbor({
  listing,
  topComment,
}: AgentVsNeighborProps) {
  // Guard — if either half is missing, render nothing. The feed falls back.
  if (!listing || !topComment) return null;
  const agentText = listing.description?.trim();
  const neighborText = topComment.content?.trim();
  if (!agentText || !neighborText) return null;

  const photo = listing.photos?.[0] ?? null;
  const shortAddr = listing.address.split(",")[0];

  return (
    <section
      aria-label="Agent versus neighbors — feed split"
      className="relative rounded-2xl overflow-hidden border border-divider bg-surface shadow-card"
    >
      {/* Header strip */}
      <div className="flex items-center justify-between gap-2 px-4 sm:px-5 pt-4 pb-2">
        <p className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-[0.2em] text-accent">
          The spin vs. the truth
        </p>
        <span className="text-[10px] uppercase tracking-wider font-bold text-tertiary">
          Side by side
        </span>
      </div>

      {/* The split — stacked on mobile, 2-col on desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-0 sm:gap-px bg-divider/40">
        {/* LEFT — agent says */}
        <article
          className="relative p-5"
          style={{
            background:
              "radial-gradient(120% 120% at 0% 0%, rgba(255,170,0,0.14) 0%, transparent 55%), linear-gradient(180deg, rgba(255,77,0,0.06) 0%, rgba(255,77,0,0.02) 100%), #1E1E2A",
          }}
        >
          <div className="flex items-center gap-2 mb-3">
            <span className="w-6 h-6 rounded-full bg-accent/20 border border-accent/40 flex items-center justify-center text-accent-warm text-[12px] font-bold">
              A
            </span>
            <p className="text-[10px] uppercase tracking-[0.18em] font-extrabold text-accent-warm">
              The listing says
            </p>
          </div>
          <p
            className="text-[14px] leading-relaxed text-ink/90 line-clamp-6"
            style={{
              fontFamily:
                '"Space Grotesk", "Inter", system-ui, sans-serif',
            }}
          >
            &ldquo;{agentText}&rdquo;
          </p>
        </article>

        {/* RIGHT — neighbors say */}
        <article
          className="relative p-5 overflow-hidden"
          style={{
            background:
              "linear-gradient(180deg, rgba(255,247,232,0.08) 0%, rgba(255,247,232,0.02) 100%), #181221",
          }}
        >
          {/* Journal-line texture */}
          <div
            aria-hidden="true"
            className="absolute inset-0 pointer-events-none opacity-[0.08]"
            style={{
              backgroundImage:
                "repeating-linear-gradient(180deg, transparent 0, transparent 22px, rgba(255,255,255,0.55) 22px, rgba(255,255,255,0.55) 23px)",
            }}
          />
          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-6 h-6 rounded-full bg-white/12 border border-white/25 flex items-center justify-center text-[12px]">
                <span aria-hidden="true">🫖</span>
              </span>
              <p className="text-[10px] uppercase tracking-[0.18em] font-extrabold text-white/85">
                Your neighbors say
              </p>
            </div>
            <blockquote
              className="text-[15px] sm:text-[16px] italic font-semibold text-ink leading-snug line-clamp-6"
              style={{
                fontFamily:
                  '"Playfair Display", "Iowan Old Style", Georgia, ui-serif, serif',
              }}
            >
              &ldquo;{neighborText}&rdquo;
            </blockquote>
            <figcaption className="mt-3 text-[11px] text-white/65 tracking-wide font-medium">
              &mdash; {formatName(topComment.author)}
              {topComment.role && (
                <span className="text-accent-warm">
                  {" "}· <span className="font-bold uppercase tracking-wider text-[10px]">{topComment.role}</span>
                </span>
              )}
              {topComment.location && (
                <span className="text-white/45"> · {topComment.location}</span>
              )}
            </figcaption>
          </div>
        </article>
      </div>

      {/* Listing strip + CTA */}
      <Link
        href={`/listing/${listing.id}`}
        className="flex items-center gap-3 px-4 sm:px-5 py-3 border-t border-divider hover:bg-bg/40 transition-colors group"
      >
        <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-elevated">
          {photo ? (
            <FallbackImage
              src={photo}
              alt={shortAddr}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full bg-elevated" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-semibold text-ink truncate">
            {shortAddr}
          </p>
          <p className="text-[12px] text-accent-warm font-bold tabular-nums">
            {fmtPrice(listing.price, listing.listingType)}
          </p>
        </div>
        <span className="inline-flex items-center gap-1 text-[12px] font-bold text-accent group-hover:text-accent-warm transition-colors shrink-0">
          <span aria-hidden="true">🫖</span>
          Open the receipts
          <span aria-hidden="true">&rarr;</span>
        </span>
      </Link>
    </section>
  );
}
