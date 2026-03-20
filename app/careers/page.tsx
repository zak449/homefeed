import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Careers — homefeed",
  description:
    "Join the team building the social layer for real estate. See open positions at homefeed.",
};

export default function CareersPage() {
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

      {/* Header */}
      <div className="mb-10">
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-ink tracking-tighter leading-tight">
          Join the team building the{" "}
          <span className="social-gradient">social layer</span> for real estate
        </h1>
        <p className="text-base text-muted mt-4 leading-relaxed max-w-xl">
          We&rsquo;re early-stage and moving fast. If you&rsquo;re passionate
          about real estate, social products, or just think Zillow needs
          competition &mdash; we want to hear from you.
        </p>
      </div>

      {/* Why homefeed */}
      <section className="mb-10">
        <div className="bg-white border border-border rounded-xl p-6 sm:p-8">
          <h2 className="font-display text-lg font-bold text-ink tracking-tight mb-4">
            Why homefeed?
          </h2>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <span className="shrink-0 mt-0.5 w-5 h-5 rounded-full bg-social-light flex items-center justify-center">
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#FF6B2C"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </span>
              <p className="text-[15px] text-muted leading-relaxed">
                Early stage &mdash; your work shapes the product from day one
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="shrink-0 mt-0.5 w-5 h-5 rounded-full bg-social-light flex items-center justify-center">
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#FF6B2C"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </span>
              <p className="text-[15px] text-muted leading-relaxed">
                A massive market that&rsquo;s been waiting for disruption
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="shrink-0 mt-0.5 w-5 h-5 rounded-full bg-social-light flex items-center justify-center">
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#FF6B2C"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </span>
              <p className="text-[15px] text-muted leading-relaxed">
                Small team, fast decisions, zero bureaucracy
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="shrink-0 mt-0.5 w-5 h-5 rounded-full bg-social-light flex items-center justify-center">
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#FF6B2C"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </span>
              <p className="text-[15px] text-muted leading-relaxed">
                Building something people actually talk about
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Open Positions */}
      <section className="mb-10">
        <h2 className="font-display text-xl font-bold text-ink tracking-tight mb-4">
          Open Positions
        </h2>
        <div className="bg-tag rounded-xl p-6 sm:p-8 text-center">
          <p className="font-display text-lg font-semibold text-ink mb-2">
            No open positions right now
          </p>
          <p className="text-sm text-muted leading-relaxed max-w-md mx-auto">
            But we&rsquo;re always looking for exceptional people. If you think
            you&rsquo;d be a great fit, we want to hear from you anyway.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-white border border-border rounded-xl p-6 sm:p-8 text-center">
        <p className="font-display text-xl font-bold text-ink tracking-tight mb-2">
          Think you&rsquo;d be a great fit?
        </p>
        <p className="text-sm text-muted mb-5 max-w-md mx-auto">
          Send us a note about who you are, what you&rsquo;ve built, and why
          homefeed excites you. We read every email.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <a
            href="mailto:careers@homefeed.app"
            className="inline-flex items-center gap-2 bg-social text-white text-sm font-semibold px-6 py-2.5 rounded-lg hover:bg-social/90 transition-colors"
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
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
            careers@homefeed.app
          </a>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 text-sm font-semibold text-muted hover:text-ink transition-colors"
          >
            Or use the contact form
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
        </div>
      </section>
    </div>
  );
}
