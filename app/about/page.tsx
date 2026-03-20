import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About — homefeed",
  description:
    "homefeed is the social layer for real estate. Real opinions from real people on every listing.",
};

export default function AboutPage() {
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
      <div className="mb-14">
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-ink tracking-tighter leading-tight">
          We believe every listing deserves a{" "}
          <span className="social-gradient">comment section</span>.
        </h1>
        <p className="text-base text-muted mt-4 leading-relaxed max-w-xl">
          homefeed is building the social layer for real estate &mdash; a place
          where real people share real opinions on the homes hitting the market.
        </p>
      </div>

      {/* Mission */}
      <section className="mb-14">
        <h2 className="font-display text-xl font-bold text-ink tracking-tight mb-4">
          The Problem
        </h2>
        <div className="bg-white border border-border rounded-xl p-6 sm:p-8">
          <p className="text-[15px] text-muted leading-relaxed">
            Real estate is the biggest purchase most people will ever make, yet
            the platforms you browse show you the listing agent&rsquo;s marketing
            copy and nothing else. Staged photos, flowery descriptions, and zero
            context from the people who actually know the neighborhood. There&rsquo;s
            no way to hear what others think &mdash; until now.
          </p>
          <p className="text-[15px] text-muted leading-relaxed mt-4">
            homefeed adds the social layer. Real opinions from real people
            &mdash; neighbors, buyers, renters, agents, and curious locals
            &mdash; all weighing in on the listings that matter.
          </p>
        </div>
      </section>

      {/* How It Works */}
      <section className="mb-14">
        <h2 className="font-display text-xl font-bold text-ink tracking-tight mb-6">
          How It Works
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white border border-border rounded-xl p-5 text-center">
            <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-social-light flex items-center justify-center">
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
            </div>
            <h3 className="font-display text-sm font-semibold text-ink mb-1">
              Browse Listings
            </h3>
            <p className="text-[13px] text-muted leading-relaxed">
              Explore homes for sale and rent, aggregated from public data
              sources.
            </p>
          </div>
          <div className="bg-white border border-border rounded-xl p-5 text-center">
            <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-social-light flex items-center justify-center">
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
            </div>
            <h3 className="font-display text-sm font-semibold text-ink mb-1">
              See What People Are Saying
            </h3>
            <p className="text-[13px] text-muted leading-relaxed">
              Read real opinions, hot takes, and reactions from people who know
              the area.
            </p>
          </div>
          <div className="bg-white border border-border rounded-xl p-5 text-center">
            <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-social-light flex items-center justify-center">
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
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <h3 className="font-display text-sm font-semibold text-ink mb-1">
              Join the Conversation
            </h3>
            <p className="text-[13px] text-muted leading-relaxed">
              Drop your take. No account needed &mdash; just pick a name and
              weigh in.
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="mb-14">
        <h2 className="font-display text-xl font-bold text-ink tracking-tight mb-6">
          Our Values
        </h2>
        <div className="space-y-4">
          <div className="bg-white border border-border rounded-xl p-5 flex gap-4 items-start">
            <div className="shrink-0 w-10 h-10 rounded-full bg-social-light flex items-center justify-center text-social font-bold text-sm">
              T
            </div>
            <div>
              <h3 className="font-display text-sm font-semibold text-ink mb-1">
                Transparency
              </h3>
              <p className="text-[13px] text-muted leading-relaxed">
                The real estate industry thrives on information asymmetry. We
                want to flip that. More opinions, more context, more truth.
              </p>
            </div>
          </div>
          <div className="bg-white border border-border rounded-xl p-5 flex gap-4 items-start">
            <div className="shrink-0 w-10 h-10 rounded-full bg-social-light flex items-center justify-center text-social font-bold text-sm">
              C
            </div>
            <div>
              <h3 className="font-display text-sm font-semibold text-ink mb-1">
                Community
              </h3>
              <p className="text-[13px] text-muted leading-relaxed">
                Real estate is local. The best insights come from the people who
                live there, walk the streets, and know the neighborhood inside
                out.
              </p>
            </div>
          </div>
          <div className="bg-white border border-border rounded-xl p-5 flex gap-4 items-start">
            <div className="shrink-0 w-10 h-10 rounded-full bg-social-light flex items-center justify-center text-social font-bold text-sm">
              H
            </div>
            <div>
              <h3 className="font-display text-sm font-semibold text-ink mb-1">
                Honesty
              </h3>
              <p className="text-[13px] text-muted leading-relaxed">
                No spin, no marketing fluff, no &ldquo;cozy&rdquo; as a
                euphemism for tiny. Just real talk from real people about real
                listings.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="mb-14">
        <div className="bg-tag rounded-xl p-6 sm:p-8 text-center">
          <h2 className="font-display text-xl font-bold text-ink tracking-tight mb-2">
            The Team
          </h2>
          <p className="text-[15px] text-muted leading-relaxed">
            Built by a small team obsessed with making real estate social.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-white border border-border rounded-xl p-6 sm:p-8 text-center">
        <p className="font-display text-xl font-bold text-ink tracking-tight mb-2">
          Ready to weigh in?
        </p>
        <p className="text-sm text-muted mb-5">
          Browse listings and drop your take. No account needed.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-social text-white text-sm font-semibold px-6 py-2.5 rounded-lg hover:bg-social/90 transition-colors"
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
