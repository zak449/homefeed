import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "About — homefeed",
  description:
    "homefeed is the social layer for real estate. Real opinions from real people on every listing.",
};

export default async function AboutPage() {
  // Pull real stats from the database
  const [listingCount, commentCount, reactionCount] = await Promise.all([
    prisma.listing.count({ where: { status: "active" } }),
    prisma.comment.count(),
    prisma.reaction.count(),
  ]);

  const stats = [
    { label: "Active Listings", value: listingCount.toLocaleString() },
    { label: "Comments", value: commentCount.toLocaleString() },
    { label: "Reactions", value: reactionCount.toLocaleString() },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
      {/* Back link */}
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm font-medium text-muted hover:text-ink transition-colors mb-8"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M19 12H5" />
          <path d="M12 19l-7-7 7-7" />
        </svg>
        Back to homefeed
      </Link>

      {/* Hero */}
      <div className="mb-16">
        <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-ink tracking-tighter leading-[1.1]">
          We believe every listing deserves a{" "}
          <span className="social-gradient">comment section</span>.
        </h1>
        <p className="text-lg text-muted mt-5 leading-relaxed max-w-xl">
          homefeed is building the social layer for real estate &mdash; a place
          where real people share real opinions on the homes hitting the market.
        </p>
      </div>

      {/* The Problem — storytelling section */}
      <section className="mb-16">
        <div className="relative bg-white border border-border rounded-2xl p-6 sm:p-8 overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-social to-social/20 rounded-l-2xl" />
          <h2 className="font-display text-xl font-bold text-ink tracking-tight mb-4">
            Why we built this
          </h2>
          <div className="space-y-4">
            <p className="text-[15px] text-muted leading-relaxed">
              Real estate is the biggest purchase most people will ever make. You
              spend months researching, visiting open houses, and reading every
              word of every listing description. And yet, the platforms you rely
              on only show the listing agent&rsquo;s marketing copy &mdash;
              staged photos, flowery descriptions, and zero context from the
              people who actually know the neighborhood.
            </p>
            <p className="text-[15px] text-muted leading-relaxed">
              There&rsquo;s nowhere to hear honest opinions. No way to ask
              &ldquo;Is this overpriced?&rdquo; No way to see if other buyers
              think the same thing you do. No comment section. No conversation.
            </p>
            <p className="text-[15px] text-ink leading-relaxed font-medium">
              We built homefeed to change that. Every listing gets a comment
              section. Neighbors, buyers, renters, agents, and curious locals
              can all weigh in on the properties that matter to them. Real
              opinions from real people.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="mb-16">
        <h2 className="font-display text-xl font-bold text-ink tracking-tight mb-6">
          How It Works
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              step: "01",
              title: "Browse",
              description:
                "Explore homes for sale and rent, aggregated from public data sources across the country.",
              icon: (
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#FF6B2C"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="M21 21l-4.35-4.35" />
                </svg>
              ),
            },
            {
              step: "02",
              title: "Read the takes",
              description:
                "See what real people think. Hot takes, honest opinions, and reactions from neighbors and buyers.",
              icon: (
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#FF6B2C"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              ),
            },
            {
              step: "03",
              title: "Share yours",
              description:
                "Drop your take. No account needed — just pick a name and join the conversation.",
              icon: (
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#FF6B2C"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              ),
            },
          ].map((item) => (
            <div
              key={item.step}
              className="bg-white border border-border rounded-xl p-5 text-center hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200"
            >
              <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-social-light flex items-center justify-center">
                {item.icon}
              </div>
              <p className="text-[11px] font-bold text-social tracking-widest uppercase mb-1">
                {item.step}
              </p>
              <h3 className="font-display text-sm font-semibold text-ink mb-1">
                {item.title}
              </h3>
              <p className="text-[13px] text-muted leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Live Stats */}
      <section className="mb-16">
        <div className="bg-ink rounded-2xl p-6 sm:p-8">
          <p className="text-[11px] font-bold text-social tracking-widest uppercase mb-5">
            Live from the platform
          </p>
          <div className="grid grid-cols-3 gap-4">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tighter">
                  {stat.value}
                </p>
                <p className="text-[12px] text-white/50 mt-1 font-medium">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="mb-16">
        <h2 className="font-display text-xl font-bold text-ink tracking-tight mb-6">
          Our Values
        </h2>
        <div className="space-y-4">
          {[
            {
              letter: "T",
              title: "Transparency",
              description:
                "The real estate industry thrives on information asymmetry. We want to flip that. More opinions, more context, more truth.",
            },
            {
              letter: "C",
              title: "Community",
              description:
                "Real estate is local. The best insights come from the people who live there, walk the streets, and know the neighborhood inside out.",
            },
            {
              letter: "H",
              title: "Honesty",
              description:
                'No spin, no marketing fluff, no "cozy" as a euphemism for tiny. Just real talk from real people about real listings.',
            },
          ].map((value) => (
            <div
              key={value.letter}
              className="bg-white border border-border rounded-xl p-5 flex gap-4 items-start"
            >
              <div className="shrink-0 w-10 h-10 rounded-full bg-social-light flex items-center justify-center text-social font-bold text-sm">
                {value.letter}
              </div>
              <div>
                <h3 className="font-display text-sm font-semibold text-ink mb-1">
                  {value.title}
                </h3>
                <p className="text-[13px] text-muted leading-relaxed">
                  {value.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* The Team */}
      <section className="mb-16">
        <h2 className="font-display text-xl font-bold text-ink tracking-tight mb-6">
          The Team
        </h2>
        <div className="bg-white border border-border rounded-2xl p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <div className="shrink-0 w-20 h-20 rounded-2xl bg-gradient-to-br from-social to-social/70 flex items-center justify-center">
              <span className="text-white font-display text-2xl font-bold">
                ZK
              </span>
            </div>
            <div>
              <h3 className="font-display text-lg font-bold text-ink tracking-tight">
                Zachary Kaufman
              </h3>
              <p className="text-sm text-social font-semibold mb-3">Founder</p>
              <p className="text-[15px] text-muted leading-relaxed">
                Building the social layer for real estate because someone had to.
                Obsessed with the intersection of community, real estate, and
                technology. Previously stared at too many Zillow listings and
                wished there was a comment section.
              </p>
              <div className="flex items-center gap-3 mt-4">
                <a
                  href="https://x.com/homefeedapp"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg bg-tag flex items-center justify-center text-muted hover:text-ink hover:bg-tag/80 transition-colors"
                  aria-label="Twitter"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-br from-social to-social/80 rounded-2xl p-6 sm:p-8 text-center">
        <p className="font-display text-xl font-bold text-white tracking-tight mb-2">
          Ready to weigh in?
        </p>
        <p className="text-sm text-white/80 mb-5">
          Browse listings and drop your take. No account needed.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-white text-ink text-sm font-semibold px-6 py-2.5 rounded-lg hover:bg-white/90 transition-colors"
        >
          Start browsing
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 12h14" />
            <path d="M12 5l7 7-7 7" />
          </svg>
        </Link>
      </section>
    </div>
  );
}
