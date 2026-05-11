import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service — Gwaky",
  description:
    "The rules of the road on Gwaky. What you can post, what we can do, and how we settle disagreements.",
};

const LAST_UPDATED = "May 11, 2026";

export default function TermsPage() {
  return (
    <article className="space-y-10">
      <header>
        <p className="text-xs font-bold text-amber tracking-[0.2em] uppercase mb-3">
          Terms of Service
        </p>
        <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-ink tracking-[-0.03em] leading-tight">
          The rules of the road.
        </h2>
        <p className="text-sm text-tertiary mt-4">
          Last updated: {LAST_UPDATED}
        </p>
      </header>

      <section className="space-y-4 text-[15px] text-secondary leading-[1.75]">
        <p>
          These terms are the deal between you and Gwaky. By creating an
          account, posting a take, or just browsing, you agree to them. If you
          don&rsquo;t, please don&rsquo;t use the service.
        </p>
        <p>
          We&rsquo;ve tried to write this in plain English instead of legalese.
          Where the law forces us to use specific language, we have.
        </p>
      </section>

      <Section title="1. Who can use Gwaky">
        <p>
          You must be at least 13 years old to use Gwaky. If you&rsquo;re
          between 13 and the age of majority in your jurisdiction, you need a
          parent or guardian&rsquo;s permission. By signing up you confirm that
          you meet these requirements and that the information you give us is
          accurate.
        </p>
      </Section>

      <Section title="2. Your account">
        <p>
          You&rsquo;re responsible for your account. Keep your sign-in method
          secure, don&rsquo;t share access, and let us know at{" "}
          <a
            href="mailto:privacy@gwaky.com"
            className="text-amber underline-offset-2 hover:underline"
          >
            privacy@gwaky.com
          </a>{" "}
          if you suspect someone else is using it.
        </p>
        <p>
          One human, one account. We may suspend accounts that look like
          ban-evasion, sockpuppets, or automated abuse.
        </p>
      </Section>

      <Section title="3. Your content (&ldquo;Takes&rdquo;)">
        <p>
          When you post a take, comment, reaction, profile photo, or anything
          else on Gwaky, you keep ownership of it. You grant Gwaky a worldwide,
          non-exclusive, royalty-free license to host, display, distribute,
          translate, format, and otherwise use your content for the purpose of
          running and promoting the service. This license ends when you delete
          your content, with two exceptions: (a) we keep backup copies for a
          reasonable period, and (b) anonymized takes may remain in threads to
          preserve context for other users&rsquo; replies.
        </p>
        <p>
          You promise that your content is yours to post, doesn&rsquo;t violate
          anyone&rsquo;s rights, and isn&rsquo;t illegal.
        </p>
      </Section>

      <Section title="4. What you can&rsquo;t do">
        <p>Don&rsquo;t use Gwaky to:</p>
        <ul className="list-disc pl-6 space-y-2 mt-3">
          <li>Harass, threaten, dox, or impersonate anyone.</li>
          <li>
            Post false or misleading claims about a property, neighborhood, or
            person.
          </li>
          <li>
            Publish someone&rsquo;s private information (addresses tied to
            named individuals, contact info, financial details).
          </li>
          <li>Spam, scrape, or run unauthorized automation against us.</li>
          <li>
            Post listings, takes, or reactions on behalf of a brand or agent
            you&rsquo;re not authorized to represent.
          </li>
          <li>
            Try to break, probe, or reverse-engineer the platform&rsquo;s
            security.
          </li>
          <li>Use Gwaky for anything illegal.</li>
        </ul>
      </Section>

      <Section title="5. Moderation and removal">
        <p>
          We can remove content, suspend accounts, or refuse service at our
          discretion when content violates these terms, the law, or the spirit
          of the community. Red-flag votes from users are signals, not
          verdicts &mdash; humans make the call on what stays and what goes.
        </p>
        <p>
          If your content is removed and you think we got it wrong, you can
          appeal by writing to{" "}
          <a
            href="mailto:privacy@gwaky.com"
            className="text-amber underline-offset-2 hover:underline"
          >
            privacy@gwaky.com
          </a>
          .
        </p>
      </Section>

      <Section title="6. Listings are informational only">
        <p>
          Gwaky aggregates listings and lets people comment on them. We are
          not a real estate broker, agent, attorney, lender, appraiser, or
          inspector. Nothing on Gwaky is legal, financial, or professional
          advice. Verify everything that matters with a licensed professional
          before making a decision.
        </p>
      </Section>

      <Section title="7. User-generated takes are opinions">
        <p>
          Takes on Gwaky are the opinions of the people who post them. We do
          not endorse them and we do not pre-screen them. Take everything you
          read with the appropriate grain of salt, the same way you would in a
          conversation on the sidewalk.
        </p>
      </Section>

      <Section title="8. Privacy and cookies">
        <p>
          How we handle your data is covered in the{" "}
          <Link
            href="/privacy"
            className="text-amber underline-offset-2 hover:underline"
          >
            Privacy Policy
          </Link>{" "}
          and the{" "}
          <Link
            href="/cookies"
            className="text-amber underline-offset-2 hover:underline"
          >
            Cookie Policy
          </Link>
          . Both are part of these terms.
        </p>
      </Section>

      <Section title="9. Closing your account">
        <p>
          You can request deletion at any time from your profile settings.
          We&rsquo;ll keep your account in a recoverable state for 30 days,
          then permanently purge personal data. Public takes are anonymized so
          other people&rsquo;s threads still make sense. See the Privacy Policy
          for the full retention picture.
        </p>
      </Section>

      <Section title="10. Changes to the service">
        <p>
          We&rsquo;re a startup. We&rsquo;ll add features, retire features,
          and occasionally break things. We&rsquo;ll do our best to give you
          notice when changes meaningfully affect what you can do on Gwaky.
        </p>
      </Section>

      <Section title="11. Termination">
        <p>
          We can suspend or terminate your access if you breach these terms,
          create legal risk for us, or for any other reason consistent with
          applicable law. You can stop using Gwaky any time.
        </p>
      </Section>

      <Section title="12. Disclaimers">
        <p>
          GWAKY IS PROVIDED &ldquo;AS IS&rdquo; AND &ldquo;AS AVAILABLE.&rdquo;
          TO THE FULLEST EXTENT PERMITTED BY LAW, WE DISCLAIM ALL WARRANTIES,
          EXPRESS OR IMPLIED, INCLUDING MERCHANTABILITY, FITNESS FOR A
          PARTICULAR PURPOSE, NON-INFRINGEMENT, AND ANY WARRANTY THAT THE
          SERVICE WILL BE UNINTERRUPTED, ERROR-FREE, OR ACCURATE.
        </p>
      </Section>

      <Section title="13. Limitation of liability">
        <p>
          TO THE FULLEST EXTENT PERMITTED BY LAW, GWAKY AND ITS PEOPLE WILL NOT
          BE LIABLE FOR INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR
          PUNITIVE DAMAGES, OR LOST PROFITS, REVENUES, OR DATA, ARISING FROM
          YOUR USE OF THE SERVICE. OUR TOTAL LIABILITY FOR ANY CLAIM RELATED TO
          THE SERVICE IS LIMITED TO THE GREATER OF (A) $100 USD OR (B) THE
          AMOUNT YOU PAID US IN THE 12 MONTHS BEFORE THE CLAIM.
        </p>
      </Section>

      <Section title="14. Indemnification">
        <p>
          You agree to defend and indemnify Gwaky against claims arising from
          content you post, your use of the service, or your breach of these
          terms.
        </p>
      </Section>

      <Section title="15. Governing law">
        <p>
          These terms are governed by the laws of the State of California,
          without regard to its conflict-of-laws rules. The federal and state
          courts located in California have exclusive jurisdiction over any
          dispute that isn&rsquo;t resolved through the steps in section 16.
        </p>
      </Section>

      <Section title="16. Dispute resolution">
        <p>
          Before filing anything formal, please reach out to{" "}
          <a
            href="mailto:privacy@gwaky.com"
            className="text-amber underline-offset-2 hover:underline"
          >
            privacy@gwaky.com
          </a>{" "}
          so we can try to work it out. Most disputes can be solved by talking
          for 30 days.
        </p>
        <p>
          If informal resolution doesn&rsquo;t work, any dispute that
          isn&rsquo;t resolved will be settled by binding individual
          arbitration in California under the rules of a recognized arbitration
          provider (such as JAMS or AAA). You and Gwaky each waive the right
          to a jury trial and the right to participate in a class action,
          except where prohibited by law. You can opt out of arbitration by
          emailing us within 30 days of first agreeing to these terms.
        </p>
      </Section>

      <Section title="17. Changes to these terms">
        <p>
          We&rsquo;ll update these terms from time to time. When we make
          material changes, we&rsquo;ll update the &ldquo;Last updated&rdquo;
          date and, where appropriate, notify you in-product or by email.
          Continuing to use Gwaky after the change means you accept the new
          terms.
        </p>
      </Section>

      <Section title="18. Contact">
        <p>
          Questions about these terms?{" "}
          <a
            href="mailto:privacy@gwaky.com"
            className="text-amber underline-offset-2 hover:underline"
          >
            privacy@gwaky.com
          </a>
          .
        </p>
      </Section>

      <FooterLinks current="terms" />
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
