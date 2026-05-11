import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Cookie Policy — Gwaky",
  description:
    "Which cookies and storage technologies Gwaky uses, why, and how to control them.",
};

const LAST_UPDATED = "May 11, 2026";

export default function CookiesPage() {
  return (
    <article className="space-y-10">
      <header>
        <p className="text-xs font-bold text-amber tracking-[0.2em] uppercase mb-3">
          Cookie Policy
        </p>
        <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-ink tracking-[-0.03em] leading-tight">
          The cookies, in plain English.
        </h2>
        <p className="text-sm text-tertiary mt-4">
          Last updated: {LAST_UPDATED}
        </p>
      </header>

      <section className="space-y-4 text-[15px] text-secondary leading-[1.75]">
        <p>
          A cookie is a small file a website saves on your device so it can
          remember things between visits. Gwaky uses cookies (and a couple of
          similar technologies like localStorage) for sign-in, preferences,
          and analytics. This page lists each category, what it does, and how
          you can turn it off.
        </p>
        <p>
          The choices you make get recorded in your{" "}
          <strong className="text-ink">ConsentLog</strong>, so we can prove
          which categories you agreed to and when. You can change any
          non-essential category at any time from your profile settings.
        </p>
      </section>

      <Section title="1. The categories">
        <Category
          name="Essential"
          required
          description="Required for the site to work. These cookies keep you signed in, protect your account from CSRF attacks, store basic security flags, and remember the consent choices you make on this page. You cannot opt out — without these we can&rsquo;t run the service."
          examples="Auth.js session cookies, CSRF tokens, your ConsentLog snapshot."
        />
        <Category
          name="Functional"
          description="Remember your preferences and improve the experience. Things like which markets and neighborhoods you follow, theme choice, and dismissed banners. Turning these off means the site forgets your preferences between sessions."
          examples="Theme, dismissed onboarding tips, last-visited neighborhood."
        />
        <Category
          name="Analytics"
          description="Help us understand how people use Gwaky so we can fix what&rsquo;s broken and build what matters. Events are pseudonymous (tied to a generated ID, not your email)."
          examples="PostHog — our analytics provider — sets a distinct-ID cookie and tracks page views, feature usage, and performance."
        />
        <Category
          name="Marketing &amp; Personalization"
          description="Power product email you opted into (new takes on listings you follow, weekly digests) and lightly personalize what we surface in-product based on your follows and reactions. Turning this off stops the personalization layer and unsubscribes you from marketing email."
          examples="Email-engagement pixels, personalization preference flags."
        />
      </Section>

      <Section title="2. How to control them">
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong className="text-ink">In Gwaky.</strong> Go to your{" "}
            <Link
              href="/profile/edit"
              className="text-amber underline-offset-2 hover:underline"
            >
              profile settings
            </Link>{" "}
            to toggle Marketing, Personalization, Push, and Data Processing
            consent. Changes are written to your ConsentLog and take effect on
            the next page load.
          </li>
          <li>
            <strong className="text-ink">In your browser.</strong> Every major
            browser lets you block or clear cookies for a site. Blocking
            essential cookies will break sign-in.
          </li>
          <li>
            <strong className="text-ink">Global signals.</strong> We honor
            Global Privacy Control (GPC) where supported. If your browser is
            sending GPC, we treat that as a request to opt out of
            non-essential analytics and personalization.
          </li>
        </ul>
      </Section>

      <Section title="3. Other technologies we use">
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong className="text-ink">localStorage / sessionStorage.</strong>{" "}
            Used for short-lived UI state (open threads, draft comments)
            that&rsquo;d be annoying to lose on a page refresh.
          </li>
          <li>
            <strong className="text-ink">Server-Sent Events (SSE).</strong>{" "}
            Real-time notifications use an open connection rather than a
            cookie, but the connection itself is authenticated using your
            session.
          </li>
          <li>
            <strong className="text-ink">Vercel infrastructure.</strong> Our
            host, Vercel, may set short-lived cookies for routing, edge cache,
            and DDoS protection. These are treated as essential.
          </li>
        </ul>
      </Section>

      <Section title="4. Third parties">
        <p>
          We use the smallest possible set of third-party providers. Today
          that&rsquo;s:
        </p>
        <ul className="list-disc pl-6 space-y-2 mt-3">
          <li>
            <strong className="text-ink">PostHog</strong> &mdash; analytics
            (Analytics category).
          </li>
          <li>
            <strong className="text-ink">Vercel</strong> &mdash; hosting, CDN,
            and Blob storage (Essential category).
          </li>
          <li>
            <strong className="text-ink">Google, Apple, GitHub</strong>{" "}
            &mdash; only when you choose to sign in with them. Those providers
            may set their own cookies on their domains.
          </li>
        </ul>
        <p className="mt-3">
          We do not run advertising trackers, retargeting pixels, or any
          third-party social plugins on Gwaky.
        </p>
      </Section>

      <Section title="5. Changes to this policy">
        <p>
          When we add a new category or vendor, we&rsquo;ll update the
          &ldquo;Last updated&rdquo; date and, when required, ask you to
          re-confirm your consent before continuing to use Gwaky.
        </p>
      </Section>

      <Section title="6. Contact">
        <p>
          Questions, or want a record of your consent history?{" "}
          <a
            href="mailto:privacy@gwaky.com"
            className="text-amber underline-offset-2 hover:underline"
          >
            privacy@gwaky.com
          </a>
          .
        </p>
      </Section>

      <FooterLinks current="cookies" />
    </article>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h3 className="font-display text-lg sm:text-xl font-bold text-ink tracking-tight mb-3">
        {title}
      </h3>
      <div className="text-[15px] text-secondary leading-[1.75] space-y-3">
        {children}
      </div>
    </section>
  );
}

function Category({
  name,
  description,
  examples,
  required,
}: {
  name: string;
  description: string;
  examples: string;
  required?: boolean;
}) {
  return (
    <div className="bg-surface border border-divider rounded-2xl p-5 sm:p-6 mb-4">
      <div className="flex items-center gap-3 mb-2">
        <h4 className="text-sm font-bold text-ink tracking-tight">{name}</h4>
        <span
          className={`shrink-0 text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full ${
            required
              ? "bg-amber/10 text-amber"
              : "bg-ink/5 text-tertiary"
          }`}
        >
          {required ? "Always on" : "Optional"}
        </span>
      </div>
      <p className="text-sm text-secondary leading-relaxed">{description}</p>
      <p className="text-xs text-tertiary mt-3">
        <span className="font-semibold text-ink">Examples:</span> {examples}
      </p>
    </div>
  );
}

function FooterLinks({ current }: { current: "privacy" | "terms" | "cookies" }) {
  const items: Array<{ href: string; label: string; key: typeof current }> = [
    { href: "/privacy", label: "Privacy Policy", key: "privacy" },
    { href: "/terms", label: "Terms of Service", key: "terms" },
    { href: "/cookies", label: "Cookie Policy", key: "cookies" },
  ];
  return (
    <nav
      aria-label="Related legal pages"
      className="pt-8 mt-8 border-t border-divider flex flex-wrap gap-x-6 gap-y-2 text-sm"
    >
      {items
        .filter((i) => i.key !== current)
        .map((i) => (
          <Link
            key={i.key}
            href={i.href}
            className="text-amber hover:underline underline-offset-2"
          >
            Read the {i.label} &rarr;
          </Link>
        ))}
    </nav>
  );
}
