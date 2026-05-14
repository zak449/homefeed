/**
 * PinnedSpill — the "🔥 pinned this week" featured take.
 *
 * A distinct, slightly-tilted, amber-glowing card inserted near the top of the
 * homepage feed. This is the "wait, what?" moment that breaks the rhythm of
 * normal cards. Server component.
 *
 * If `null` is passed (the parent doesn't have a curated pinned take yet),
 * the component renders nothing. Saves a conditional at the call-site.
 */

import Link from "next/link";
import FallbackImage from "@/components/FallbackImage";

interface PinnedSpillAuthor {
  name: string;
  /** Optional avatar URL — we fall back to a colored initial bubble. */
  avatarUrl?: string | null;
}

interface PinnedSpillListing {
  id: string;
  address: string;
  price: number;
  listingType: string;
  photos: string[];
}

export interface PinnedSpillProps {
  author: PinnedSpillAuthor;
  content: string;
  listing: PinnedSpillListing;
  /** e.g. "neighbor", "past renter", "local of 12 years" — shown as a pill. */
  role?: string | null;
  /** e.g. "Highland Park · LA" — shown next to the byline. */
  location?: string | null;
}

/**
 * Component prop signature accepts `Partial<PinnedSpillProps>` so callers
 * can pass an empty object / null-ish value without an upstream guard.
 * Internally we treat any missing required field as "render nothing."
 */
type PinnedSpillInput = Partial<PinnedSpillProps>;

function initial(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return "?";
  return trimmed[0].toUpperCase();
}

function formatName(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length <= 1) return name;
  return `${parts[0]} ${parts[parts.length - 1][0]}.`;
}

function fmtPrice(price: number, listingType: string): string {
  return listingType === "rent"
    ? `$${price.toLocaleString()}/mo`
    : `$${price.toLocaleString()}`;
}

export default function PinnedSpill(props: PinnedSpillInput) {
  // Self-guard: any missing required slice → render nothing. Lets callers
  // mount the component unconditionally (`<PinnedSpill {...maybeData} />`)
  // and trust it to disappear when there's nothing to show.
  if (!props || !props.author || !props.content || !props.listing) return null;
  const { author, content, listing, role, location } = props as PinnedSpillProps;

  const photo = listing.photos[0] ?? null;
  const shortAddr = listing.address.split(",")[0];

  return (
    <>
      {/* Inline keyframes so we don't have to touch globals.css. The pulse-glow
          decays at the edges; reduced-motion users get the static treatment. */}
      <style>{`
        @keyframes pinned-spill-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(255,77,0,0.18), 0 8px 32px rgba(255,77,0,0.10); }
          50%      { box-shadow: 0 0 0 6px rgba(255,77,0,0.08), 0 12px 40px rgba(255,77,0,0.22); }
        }
        .pinned-spill-card {
          animation: pinned-spill-pulse 4.2s ease-in-out infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .pinned-spill-card { animation: none !important; }
          .pinned-spill-tilt { transform: none !important; }
        }
      `}</style>

      <section
        aria-label="Pinned take of the week"
        className="pinned-spill-tilt relative"
        style={{ transform: "rotate(-1deg)" }}
      >
        {/* Gradient border — wrapper provides the conic-ish amber edge */}
        <div
          className="pinned-spill-card relative rounded-3xl p-[1.5px]"
          style={{
            background:
              "linear-gradient(135deg, #FF4D00 0%, #FFAA00 38%, #FF4D00 68%, #FF3B3B 100%)",
          }}
        >
          <article
            className="relative rounded-[calc(1.5rem-1.5px)] overflow-hidden"
            style={{
              background:
                "radial-gradient(120% 100% at 0% 0%, rgba(255,77,0,0.10) 0%, transparent 50%), linear-gradient(180deg, #1E1E2A 0%, #181221 100%)",
            }}
          >
            <div className="p-5 sm:p-6">
              {/* Eyebrow */}
              <p className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-[0.22em] text-accent-warm mb-3 flex items-center gap-1.5">
                <span aria-hidden="true">🔥</span>
                Pinned this week
              </p>

              {/* Big italic-serif quote with drop cap */}
              <blockquote
                className="text-ink leading-[1.08] font-semibold italic"
                style={{
                  fontFamily:
                    '"Playfair Display", "Iowan Old Style", Georgia, ui-serif, serif',
                  fontSize: "clamp(2rem, 7.8vw, 2.75rem)",
                }}
              >
                <span
                  aria-hidden="true"
                  className="float-left mr-2 mt-1 leading-[0.78] font-black not-italic text-accent"
                  style={{
                    fontSize: "clamp(3.6rem, 13vw, 5.2rem)",
                    fontFamily:
                      '"Playfair Display", "Iowan Old Style", Georgia, ui-serif, serif',
                  }}
                >
                  &ldquo;
                </span>
                {content}
                <span aria-hidden="true" className="text-accent">&rdquo;</span>
              </blockquote>

              {/* Author byline */}
              <div className="mt-5 flex items-center gap-3">
                <span
                  className="w-10 h-10 rounded-full flex items-center justify-center text-[15px] font-extrabold text-white shrink-0"
                  style={{
                    background:
                      "conic-gradient(from 220deg at 50% 50%, #FF4D00 0%, #FFAA00 50%, #FF4D00 100%)",
                  }}
                  aria-hidden="true"
                >
                  {initial(author.name)}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[14px] font-bold text-ink">
                      {formatName(author.name)}
                    </span>
                    {role && (
                      <span className="inline-flex items-center text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-accent/15 text-accent-warm border border-accent/30">
                        {role}
                      </span>
                    )}
                  </div>
                  {location && (
                    <p className="text-[12px] text-secondary mt-0.5 truncate">
                      {location}
                    </p>
                  )}
                </div>
              </div>

              {/* The listing it's pinned to */}
              <Link
                href={`/listing/${listing.id}`}
                className="mt-5 flex items-center gap-3 rounded-2xl border border-divider bg-bg/40 hover:border-accent/40 transition-colors p-3 group"
              >
                <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-elevated">
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
                <span
                  aria-hidden="true"
                  className="text-tertiary group-hover:text-accent transition-colors text-lg"
                >
                  &rarr;
                </span>
              </Link>

              {/* CTA */}
              <Link
                href={`/listing/${listing.id}#all-spills`}
                className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-bold text-accent hover:text-accent-warm transition-colors"
              >
                Why this is dividing the block
                <span aria-hidden="true">&rarr;</span>
              </Link>
            </div>
          </article>
        </div>
      </section>
    </>
  );
}
