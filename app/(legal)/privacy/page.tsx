import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy — Gwaky",
  description:
    "How Gwaky collects, uses, and protects your data. Real talk in plain English — plus your rights under GDPR and CCPA.",
};

const LAST_UPDATED = "May 11, 2026";

export default function PrivacyPage() {
  return (
    <article className="space-y-10">
      <header>
        <p className="text-xs font-bold text-amber tracking-[0.2em] uppercase mb-3">
          Privacy Policy
        </p>
        <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-ink tracking-[-0.03em] leading-tight">
          Your data, your call.
        </h2>
        <p className="text-sm text-tertiary mt-4">
          Last updated: {LAST_UPDATED}
        </p>
      </header>

      <section className="space-y-4 text-[15px] text-secondary leading-[1.75]">
        <p>
          Gwaky is a comment section for real estate. People share takes on
          listings, neighbors weigh in, buyers learn what no listing agent will
          tell them. To make that work we collect some data about you. This
          page explains what, why, and what you can do about it.
        </p>
        <p>
          We do not sell your personal data. Full stop. We do not rent it,
          trade it, or hand it off to data brokers. If that ever changes, this
          page changes first.
        </p>
      </section>

      <Section title="1. Who we are">
        <p>
          Gwaky (operated under the name Gwaky) runs gwaky.com and provides the
          comment, voting, and notification features on the site. We&rsquo;re a
          US-based company hosting on Vercel. Our users live everywhere &mdash;
          including California and the EU/UK &mdash; so we honor the rights
          described below regardless of where you sign up from.
        </p>
      </Section>

      <Section title="2. What we collect">
        <p>
          We collect the minimum we need to run the product. Here is the full
          list:
        </p>
        <ul className="list-disc pl-6 space-y-2 mt-3">
          <li>
            <strong className="text-ink">Account basics.</strong> Your name,
            email, profile photo (avatar stored on Vercel Blob), and a
            username. When you sign in through Google, Apple, or GitHub we
            receive these from the provider; with email sign-in you give them
            directly.
          </li>
          <li>
            <strong className="text-ink">Profile preferences.</strong> The
            markets and neighborhoods you follow, your role (buyer, renter,
            agent, etc.), and any bio you choose to share.
          </li>
          <li>
            <strong className="text-ink">Your content.</strong> The takes
            (comments) you post, threads you reply to, likes, red-flag votes,
            and reports you submit.
          </li>
          <li>
            <strong className="text-ink">Consent records.</strong> Whether you
            agreed to our Terms, Privacy Policy, marketing, personalization,
            push notifications, and broader data processing. We store these in
            a ConsentLog so we can prove the choice you made and when you made
            it.
          </li>
          <li>
            <strong className="text-ink">Technical data.</strong> IP address,
            browser type, device info, and event logs from the app, used for
            security, debugging, and abuse prevention.
          </li>
          <li>
            <strong className="text-ink">Product analytics.</strong> Pseudonymous
            usage events through PostHog (page views, feature interactions) so
            we can see what works and what&rsquo;s broken.
          </li>
        </ul>
      </Section>

      <Section title="3. Why we collect it">
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong className="text-ink">To run the service.</strong> Display
            your takes, route replies, send the real-time notifications you
            asked for, and keep your account secure.
          </li>
          <li>
            <strong className="text-ink">To improve the product.</strong>
            {" "}Aggregate analytics tell us which features get used and which
            ones we should kill.
          </li>
          <li>
            <strong className="text-ink">To enforce our rules.</strong> Spam,
            harassment, doxxing, and listing fraud get caught using a mix of
            automated signals and human review.
          </li>
          <li>
            <strong className="text-ink">To talk to you.</strong> Transactional
            email (account, security, replies) is core to the product.
            Marketing email is opt-in and tracked in your ConsentLog.
          </li>
        </ul>
      </Section>

      <Section title="4. Legal bases (EU / UK users)">
        <p>
          If you&rsquo;re in the EU, EEA, UK, or Switzerland, GDPR applies. We
          rely on these legal bases:
        </p>
        <ul className="list-disc pl-6 space-y-2 mt-3">
          <li>
            <strong className="text-ink">Contract.</strong> Running the account
            features you signed up for.
          </li>
          <li>
            <strong className="text-ink">Legitimate interests.</strong> Keeping
            the platform secure, preventing abuse, basic product analytics
            (where you have not opted out).
          </li>
          <li>
            <strong className="text-ink">Consent.</strong> Marketing email,
            personalization, push notifications, and any non-essential cookies.
            You can withdraw consent in your profile at any time.
          </li>
          <li>
            <strong className="text-ink">Legal obligation.</strong> When a law,
            subpoena, or court order requires it.
          </li>
        </ul>
      </Section>

      <Section title="5. How long we keep it">
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong className="text-ink">Active accounts.</strong> For as long
            as your account exists.
          </li>
          <li>
            <strong className="text-ink">Deleted accounts.</strong> When you
            request deletion, we begin a 30-day grace period during which you
            can change your mind by signing back in. After 30 days your
            personal data is purged. Your public takes are anonymized rather
            than deleted, because threads and other people&rsquo;s replies
            would lose context otherwise.
          </li>
          <li>
            <strong className="text-ink">Consent logs.</strong> Kept for as
            long as the law requires us to prove consent (usually a few years
            after withdrawal).
          </li>
          <li>
            <strong className="text-ink">Backups.</strong> Encrypted backups
            roll off on a normal cycle (typically 30 days).
          </li>
        </ul>
      </Section>

      <Section title="6. Who we share data with">
        <p>
          We do not sell data. We share it only with vendors that help us run
          the service, under contracts that limit what they can do with it:
        </p>
        <ul className="list-disc pl-6 space-y-2 mt-3">
          <li>
            <strong className="text-ink">Vercel</strong> &mdash; hosting, CDN,
            and Blob storage for avatars.
          </li>
          <li>
            <strong className="text-ink">PostHog</strong> &mdash; product
            analytics (pseudonymous event data).
          </li>
          <li>
            <strong className="text-ink">Auth providers</strong> &mdash; Google,
            Apple, GitHub, and our email-link provider, only for sign-in.
          </li>
          <li>
            <strong className="text-ink">Email infrastructure</strong>{" "}
            &mdash; transactional and (opt-in) marketing email.
          </li>
          <li>
            <strong className="text-ink">Law enforcement</strong> &mdash; only
            when legally compelled, and we push back on overbroad requests.
          </li>
        </ul>
      </Section>

      <Section title="7. Your rights">
        <p>
          Wherever you live, you can ask us to do the following with your data.
          We respond within 30 days (faster when we can).
        </p>
        <ul className="list-disc pl-6 space-y-2 mt-3">
          <li>
            <strong className="text-ink">Access.</strong> See what we have on
            you.
          </li>
          <li>
            <strong className="text-ink">Export.</strong> Download a portable
            copy of your data. Start a DataExportRequest from{" "}
            <Link
              href="/profile/edit"
              className="text-amber underline-offset-2 hover:underline"
            >
              your profile settings
            </Link>
            .
          </li>
          <li>
            <strong className="text-ink">Correction.</strong> Fix anything that
            is wrong.
          </li>
          <li>
            <strong className="text-ink">Deletion.</strong> Delete your account
            (subject to the 30-day grace period in section 5).
          </li>
          <li>
            <strong className="text-ink">Object / restrict.</strong> Tell us to
            stop processing your data for a specific purpose.
          </li>
          <li>
            <strong className="text-ink">Withdraw consent.</strong> Toggle off
            marketing, personalization, push, or non-essential cookies any time
            in your profile.
          </li>
          <li>
            <strong className="text-ink">Complain.</strong> EU/UK residents can
            file with their local data protection authority.
          </li>
        </ul>
        <p className="mt-3">
          California residents have the same access, deletion, correction, and
          opt-out rights under the CCPA/CPRA, plus the right not to be
          discriminated against for exercising them. We do not sell or share
          personal information for cross-context behavioral advertising.
        </p>
      </Section>

      <Section title="8. Kids">
        <p>
          Gwaky is not for anyone under 13. We do not knowingly collect data
          from children. If we learn an account belongs to a child, we delete
          it. Parents who think a child has signed up can write to{" "}
          <a
            href="mailto:privacy@gwaky.com"
            className="text-amber underline-offset-2 hover:underline"
          >
            privacy@gwaky.com
          </a>
          .
        </p>
      </Section>

      <Section title="9. International transfers">
        <p>
          Gwaky is hosted in the United States. If you&rsquo;re writing to us
          from the EU/UK, your data crosses borders. We rely on Standard
          Contractual Clauses and equivalent safeguards with our vendors.
        </p>
      </Section>

      <Section title="10. Security">
        <p>
          We use industry-standard practices: encrypted transport (HTTPS),
          encrypted storage, scoped access controls, and routine reviews. No
          system is bulletproof &mdash; if something goes wrong we&rsquo;ll
          tell you and the relevant regulators in line with the law.
        </p>
      </Section>

      <Section title="11. Changes to this policy">
        <p>
          When we make material changes, we&rsquo;ll update the &ldquo;Last
          updated&rdquo; date at the top and, where required, ask you to
          re-consent before continuing to use Gwaky.
        </p>
      </Section>

      <Section title="12. Contact">
        <p>
          Privacy questions, data requests, or anything that smells off:{" "}
          <a
            href="mailto:privacy@gwaky.com"
            className="text-amber underline-offset-2 hover:underline"
          >
            privacy@gwaky.com
          </a>
          .
        </p>
      </Section>

      <FooterLinks current="privacy" />
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
