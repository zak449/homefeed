import type { Metadata } from "next";
import Link from "next/link";
import CareersWaitlist from "./CareersWaitlist";

export const metadata: Metadata = {
  title: "Careers — Gwaky",
  description:
    "Join the team building the social layer for real estate. See open positions at Gwaky.",
};

const values = [
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#D4763C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ),
    title: "Radical Transparency",
    description: "We share everything internally — metrics, finances, strategy. If you work here, you know exactly where we stand and where we're going.",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#D4763C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
      </svg>
    ),
    title: "Ship Fast, Learn Faster",
    description: "We'd rather ship something imperfect today than something perfect next month. Every release teaches us something. Speed is a feature.",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#D4763C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#D4763C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
  { title: "Remote-First", description: "Work from anywhere. We're distributed and async by default." },
  { title: "Meaningful Equity", description: "Early-stage equity so you own a real piece of what we're building." },
  { title: "Top-Tier Gear", description: "MacBook Pro, monitor, and whatever tools you need to do your best work." },
  { title: "Unlimited PTO", description: "Take the time you need. We trust you to manage your energy and output." },
  { title: "Health & Wellness", description: "Comprehensive health, dental, and vision coverage." },
  { title: "Learning Budget", description: "$1,000/year for courses, conferences, books — whatever helps you grow." },
];

export default function CareersPage() {
  return (
    <div className="bg-bg min-h-screen">
      {/* Hero */}
      <div className="max-w-4xl mx-auto px-5 sm:px-8 pt-10 sm:pt-16 pb-0">
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
          Back to Gwaky
        </Link>

        <div className="mb-14">
          <p className="text-[11px] font-bold text-amber tracking-[0.2em] uppercase mb-3">
            Careers at Gwaky
          </p>
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-extrabold text-ink tracking-[-0.04em] leading-[1.08]">
            Help us build the{" "}
            <span className="text-amber">social layer</span> for real estate
          </h1>
          <p className="text-lg text-secondary mt-5 leading-relaxed max-w-xl">
            We&rsquo;re early-stage and moving fast. If you&rsquo;re passionate
            about real estate, social products, or just think the way people
            discover homes needs to change &mdash; we want to hear from you.
          </p>
        </div>
      </div>

      {/* Founder quote */}
      <section className="max-w-4xl mx-auto px-5 sm:px-8 pb-14">
        <div className="relative bg-ink rounded-2xl p-6 sm:p-10 overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber/[0.06] rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
          <div className="relative">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-amber/30 mb-4">
              <path d="M3 21c3-3 4-6 4-9 0-2.5-2-4.5-4.5-4.5S-2 9.5-2 12c0 3.5 3 5.5 5 9zm13 0c3-3 4-6 4-9 0-2.5-2-4.5-4.5-4.5S11 9.5 11 12c0 3.5 3 5.5 5 9z" fill="currentColor" />
            </svg>
            <p className="font-display text-xl sm:text-2xl font-bold text-white tracking-tight leading-snug max-w-2xl">
              Real estate is the biggest purchase most people will ever
              make, yet there&rsquo;s nowhere to hear honest opinions. We&rsquo;re
              changing that &mdash; one comment section at a time.
            </p>
            <p className="text-sm text-amber font-semibold mt-5">
              Zachary Kaufman, Founder
            </p>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="max-w-4xl mx-auto px-5 sm:px-8 pb-14">
        <p className="text-[11px] font-bold text-amber tracking-[0.2em] uppercase mb-3">
          What we believe
        </p>
        <h2 className="font-display text-2xl sm:text-3xl font-bold text-ink tracking-tight mb-8">
          Our Values
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {values.map((value) => (
            <div
              key={value.title}
              className="bg-surface border border-divider rounded-2xl p-6 hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200"
            >
              <div className="w-12 h-12 rounded-xl bg-glow flex items-center justify-center mb-4 shadow-glow">
                {value.icon}
              </div>
              <h3 className="font-display text-[15px] font-bold text-ink mb-1.5">
                {value.title}
              </h3>
              <p className="text-[13px] text-secondary leading-relaxed">
                {value.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Perks & Benefits */}
      <section className="max-w-4xl mx-auto px-5 sm:px-8 pb-14">
        <h2 className="font-display text-xl font-bold text-ink tracking-tight mb-6">
          Perks &amp; Benefits
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {perks.map((perk) => (
            <div
              key={perk.title}
              className="bg-surface border border-divider rounded-xl p-4 flex gap-3 items-start"
            >
              <div className="shrink-0 w-8 h-8 rounded-lg bg-glow flex items-center justify-center">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#D4763C"
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
                <p className="text-[12px] text-secondary leading-relaxed">
                  {perk.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Open Positions — compelling empty state */}
      <section className="max-w-4xl mx-auto px-5 sm:px-8 pb-14">
        <h2 className="font-display text-xl font-bold text-ink tracking-tight mb-4">
          Open Positions
        </h2>
        <div className="bg-surface border border-divider rounded-2xl p-8 sm:p-10 text-center">
          <div className="w-14 h-14 mx-auto mb-5 rounded-2xl bg-glow flex items-center justify-center shadow-glow">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#D4763C"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
            </svg>
          </div>
          <p className="font-display text-xl font-bold text-ink mb-2">
            We&rsquo;re not hiring yet &mdash; but we&rsquo;re close
          </p>
          <p className="text-sm text-secondary leading-relaxed max-w-md mx-auto">
            We&rsquo;re a small, scrappy team gearing up to grow. When we open roles,
            they&rsquo;ll go to our waitlist first. Get on the list and be the first to know.
          </p>
        </div>
      </section>

      {/* Waitlist CTA — prominent */}
      <section className="max-w-4xl mx-auto px-5 sm:px-8 pb-14">
        <div className="relative bg-gradient-to-br from-ink to-ink/95 rounded-3xl p-8 sm:p-12 overflow-hidden">
          {/* Ambient amber glow */}
          <div className="absolute top-[-40px] right-[-40px] w-[200px] h-[200px] rounded-full bg-amber/[0.08] blur-[80px] pointer-events-none" />
          <div className="absolute bottom-[-40px] left-[-40px] w-[160px] h-[160px] rounded-full bg-amber/[0.06] blur-[60px] pointer-events-none" />

          <div className="relative z-10">
            <div className="text-center mb-8">
              <p className="text-[11px] font-bold text-amber tracking-[0.2em] uppercase mb-4">
                Get ahead of the crowd
              </p>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight mb-3">
                Join the waitlist
              </h2>
              <p className="text-sm sm:text-base text-white/50 max-w-md mx-auto leading-relaxed">
                Be the first to hear about new roles. We&rsquo;ll reach out when
                we&rsquo;re hiring for a position that matches your skills.
              </p>
            </div>
            <CareersWaitlist />
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="max-w-4xl mx-auto px-5 sm:px-8 pb-16 sm:pb-20">
        <div className="bg-surface border border-divider rounded-2xl p-6 sm:p-8 text-center">
          <p className="font-display text-xl font-bold text-ink tracking-tight mb-2">
            Can&rsquo;t wait for a role?
          </p>
          <p className="text-sm text-secondary mb-5 max-w-md mx-auto">
            Send us a note about who you are, what you&rsquo;ve built, and why
            Gwaky excites you. We read every email.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href="mailto:careers@gwaky.com"
              className="inline-flex items-center gap-2 bg-amber text-white text-sm font-bold px-6 py-2.5 rounded-xl shadow-glow hover:shadow-glow-amber hover:-translate-y-0.5 transition-all duration-200"
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
              careers@gwaky.com
            </a>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 text-sm font-semibold text-secondary hover:text-ink transition-colors"
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
        </div>
      </section>
    </div>
  );
}
