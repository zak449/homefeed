import type { Metadata } from "next";
import Link from "next/link";
import CareersWaitlist from "./CareersWaitlist";

export const metadata: Metadata = {
  title: "Careers — gwakgwak",
  description:
    "Join the team building the social layer for real estate. See open positions at gwakgwak.",
};

const values = [
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FF6B2C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ),
    title: "Radical Transparency",
    description: "We share everything internally — metrics, finances, strategy. If you work here, you know exactly where we stand and where we're going.",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FF6B2C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
      </svg>
    ),
    title: "Ship Fast, Learn Faster",
    description: "We'd rather ship something imperfect today than something perfect next month. Every release teaches us something. Speed is a feature.",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FF6B2C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    title: "User-Obsessed",
    description: "We read every comment, every support email, every piece of feedback. The users are the product. Their voice drives every decision we make.",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FF6B2C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M8 14s1.5 2 4 2 4-2 4-2" />
        <line x1="9" y1="9" x2="9.01" y2="9" />
        <line x1="15" y1="9" x2="15.01" y2="9" />
      </svg>
    ),
    title: "Have Fun With It",
    description: "Real estate is serious business. But building a social platform for it? That should be a blast. We don't take ourselves too seriously.",
  },
];

const perks = [
  { icon: "Remote-first", title: "Remote-First", description: "Work from anywhere. We're distributed and async by default." },
  { icon: "Equity", title: "Meaningful Equity", description: "Early-stage equity so you own a real piece of what we're building." },
  { icon: "Gear", title: "Top-Tier Gear", description: "MacBook Pro, monitor, and whatever tools you need to do your best work." },
  { icon: "PTO", title: "Unlimited PTO", description: "Take the time you need. We trust you to manage your energy and output." },
  { icon: "Health", title: "Health & Wellness", description: "Comprehensive health, dental, and vision coverage." },
  { icon: "Learning", title: "Learning Budget", description: "$1,000/year for courses, conferences, books — whatever helps you grow." },
];

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
        Back to gwakgwak
      </Link>

      {/* Hero */}
      <div className="mb-14">
        <p className="text-[11px] font-bold text-social tracking-widest uppercase mb-3">
          Careers at gwakgwak
        </p>
        <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-ink tracking-tighter leading-[1.1]">
          We&rsquo;re building the{" "}
          <span className="social-gradient">social layer</span> for real estate
        </h1>
        <p className="text-lg text-muted mt-5 leading-relaxed max-w-xl">
          We&rsquo;re early-stage and moving fast. If you&rsquo;re passionate
          about real estate, social products, or just think the way people
          discover homes needs to change &mdash; we want to hear from you.
        </p>
      </div>

      {/* Mission statement */}
      <section className="mb-14">
        <div className="relative bg-ink rounded-2xl p-6 sm:p-8 overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-social/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="relative">
            <p className="font-display text-xl sm:text-2xl font-bold text-white tracking-tight leading-snug">
              &ldquo;Real estate is the biggest purchase most people will ever
              make, yet there&rsquo;s nowhere to hear honest opinions. We&rsquo;re
              changing that &mdash; one comment section at a time.&rdquo;
            </p>
            <p className="text-sm text-white/50 mt-4 font-medium">
              Zachary Kaufman, Founder
            </p>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="mb-14">
        <h2 className="font-display text-xl font-bold text-ink tracking-tight mb-6">
          Our Values
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {values.map((value) => (
            <div
              key={value.title}
              className="bg-white border border-border rounded-xl p-5 hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200"
            >
              <div className="w-10 h-10 rounded-xl bg-social-light flex items-center justify-center mb-3">
                {value.icon}
              </div>
              <h3 className="font-display text-sm font-semibold text-ink mb-1.5">
                {value.title}
              </h3>
              <p className="text-[13px] text-muted leading-relaxed">
                {value.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Perks & Benefits */}
      <section className="mb-14">
        <h2 className="font-display text-xl font-bold text-ink tracking-tight mb-6">
          Perks &amp; Benefits
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {perks.map((perk) => (
            <div
              key={perk.title}
              className="bg-white border border-border rounded-xl p-4 flex gap-3 items-start"
            >
              <div className="shrink-0 w-8 h-8 rounded-lg bg-social-light flex items-center justify-center">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#FF6B2C"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <div>
                <h3 className="font-display text-[13px] font-semibold text-ink mb-0.5">
                  {perk.title}
                </h3>
                <p className="text-[12px] text-muted leading-relaxed">
                  {perk.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Open Positions */}
      <section className="mb-14">
        <h2 className="font-display text-xl font-bold text-ink tracking-tight mb-4">
          Open Positions
        </h2>
        <div className="bg-white border border-border rounded-xl p-6 sm:p-8 text-center">
          <div className="w-12 h-12 mx-auto mb-4 rounded-2xl bg-social-light flex items-center justify-center">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#FF6B2C"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
            </svg>
          </div>
          <p className="font-display text-lg font-semibold text-ink mb-2">
            No open positions right now
          </p>
          <p className="text-sm text-muted leading-relaxed max-w-md mx-auto">
            We&rsquo;re not hiring at the moment, but we&rsquo;re always looking
            for exceptional people. Drop your email below to be the first to
            know when positions open up.
          </p>
        </div>
      </section>

      {/* Waitlist CTA */}
      <section className="mb-14">
        <div className="bg-gradient-to-br from-social to-social/80 rounded-2xl p-6 sm:p-8">
          <div className="text-center mb-6">
            <h2 className="font-display text-xl font-bold text-white tracking-tight mb-2">
              Join the waitlist
            </h2>
            <p className="text-sm text-white/80 max-w-md mx-auto">
              Be the first to hear about new roles. We&rsquo;ll reach out when
              we&rsquo;re hiring for a position that matches your skills.
            </p>
          </div>
          <CareersWaitlist />
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="bg-white border border-border rounded-xl p-6 sm:p-8 text-center">
        <p className="font-display text-xl font-bold text-ink tracking-tight mb-2">
          Can&rsquo;t wait for a role?
        </p>
        <p className="text-sm text-muted mb-5 max-w-md mx-auto">
          Send us a note about who you are, what you&rsquo;ve built, and why
          gwakgwak excites you. We read every email.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <a
            href="mailto:careers@gwakgwak.app"
            className="inline-flex items-center gap-2 bg-ink text-white text-sm font-semibold px-6 py-2.5 rounded-lg hover:bg-ink/90 transition-colors"
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
            careers@gwakgwak.app
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
