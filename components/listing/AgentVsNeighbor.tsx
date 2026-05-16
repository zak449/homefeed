/**
 * AgentVsNeighbor — the founder's "the listing says vs. your neighbors say"
 * split. Server component. Renders side-by-side cards: a faded amber
 * agent-description card and a parchment/journal neighbor quote card.
 *
 * If there's no neighbor take yet, the neighbor side becomes a "be the first
 * to spill" CTA card that anchors to the spill form.
 */

import Link from "next/link";

interface TopComment {
  content: string;
  authorName: string;
  city?: string | null;
  state?: string | null;
}

interface Props {
  agentBlurb: string | null;
  agentName: string | null;
  topComment: TopComment | null;
  totalComments: number;
}

function formatName(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length <= 1) return name;
  return `${parts[0]} ${parts[parts.length - 1][0]}.`;
}

export default function AgentVsNeighbor({
  agentBlurb,
  agentName,
  topComment,
  totalComments,
}: Props) {
  const hasAgent = agentBlurb && agentBlurb.trim().length > 0;
  const hasNeighbor = topComment && topComment.content.trim().length > 0;

  return (
    <section
      id="agent-vs-neighbor"
      aria-label="Agent versus neighbors"
      className="relative -mt-10 sm:-mt-16 z-20 px-4 sm:px-6"
    >
      <div className="max-w-3xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        {/* LEFT — agent says */}
        <article
          className="relative rounded-2xl border border-amber/25 bg-gradient-to-br from-amber/10 via-amber/[0.04] to-transparent backdrop-blur-md p-5 shadow-soft"
        >
          <div className="flex items-center gap-2 mb-2.5">
            <span className="w-7 h-7 rounded-full bg-amber/20 border border-amber/30 flex items-center justify-center text-amber text-[14px] font-bold">
              A
            </span>
            <div className="leading-tight">
              <p className="text-[11px] uppercase tracking-[0.16em] font-bold text-amber/90">
                The listing says
              </p>
              {agentName && (
                <p className="text-[11px] text-secondary truncate">
                  via {agentName}
                </p>
              )}
            </div>
          </div>
          {hasAgent ? (
            <p className="text-white/90 text-[14px] italic leading-relaxed line-clamp-6">
              &ldquo;{agentBlurb}&rdquo;
            </p>
          ) : (
            <p className="text-secondary text-[14px] italic leading-relaxed">
              No description from the listing agent. Make of that what you will.
            </p>
          )}
        </article>

        {/* RIGHT — your neighbors say */}
        <article
          className="relative rounded-2xl border border-white/10 p-5 shadow-soft overflow-hidden"
          style={{
            background:
              "linear-gradient(180deg, rgba(255,247,232,0.08) 0%, rgba(255,247,232,0.02) 100%), #181221",
          }}
        >
          {/* Subtle journal lines */}
          <div
            aria-hidden="true"
            className="absolute inset-0 pointer-events-none opacity-[0.07]"
            style={{
              backgroundImage:
                "repeating-linear-gradient(180deg, transparent 0, transparent 22px, rgba(255,255,255,0.5) 22px, rgba(255,255,255,0.5) 23px)",
            }}
          />
          <div className="relative">
            <div className="flex items-center gap-2 mb-2.5">
              <span className="w-7 h-7 rounded-full bg-white/12 border border-white/20 flex items-center justify-center text-[14px]">
                🫖
              </span>
              <div className="leading-tight">
                <p className="text-[11px] uppercase tracking-[0.16em] font-bold text-white/85">
                  Your neighbors say
                </p>
                <p className="text-[11px] text-secondary">
                  {totalComments > 0
                    ? `${totalComments} spill${totalComments === 1 ? "" : "s"} so far`
                    : "Nobody has spilled yet"}
                </p>
              </div>
            </div>

            {hasNeighbor && topComment ? (
              <figure>
                <blockquote className="text-white text-[15px] font-semibold leading-snug line-clamp-6">
                  &ldquo;{topComment.content}&rdquo;
                </blockquote>
                <figcaption className="mt-2.5 text-[11px] text-white/70 font-medium tracking-wide">
                  &mdash; {formatName(topComment.authorName)}
                  {topComment.city && (
                    <span className="text-white/45"> · {topComment.city}{topComment.state ? `, ${topComment.state}` : ""}</span>
                  )}
                </figcaption>
              </figure>
            ) : (
              <Link
                href="#all-spills"
                className="group block rounded-xl border border-amber/30 bg-amber/10 hover:bg-amber/15 transition-all px-4 py-3"
              >
                <p className="text-white text-[14px] font-bold leading-tight">
                  Be the first to spill →
                </p>
                <p className="text-secondary text-[12px] mt-0.5">
                  The first take sets the tone for everyone after you.
                </p>
              </Link>
            )}
          </div>
        </article>
      </div>
    </section>
  );
}
