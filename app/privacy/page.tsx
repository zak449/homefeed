import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy \u2014 Gwaky",
  description: "How Gwaky collects, uses, and protects your data.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-bg">
      <div className="max-w-[720px] mx-auto px-5 py-16 sm:py-24">
        <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-2">
          Privacy Policy
        </h1>
        <p className="text-white/40 text-xs mb-10">Last updated: March 2026</p>

        <div className="space-y-8 text-white/70 text-sm leading-relaxed">
          <Section title="1. Information We Collect">
            <p>
              We collect information you provide directly: display name, email
              address, zip code (optional), and the content of your Takes and
              questions. We also collect usage data (pages visited, actions
              taken) and device data (browser type, operating system, IP
              address) to improve the service.
            </p>
          </Section>

          <Section title="2. How We Use Your Information">
            <p>
              We use your information to personalize your experience, display
              relevant listings and community content, ensure safety and
              prevent abuse, and improve the product. We may send you
              notifications about activity on listings you follow.
            </p>
          </Section>

          <Section title="3. Anonymous Takes">
            <p>
              When you post a Take anonymously, your display name is replaced
              with &ldquo;Anon&rdquo; in all public-facing views. Your
              identity is stored internally for moderation purposes but is
              never linked to your public profile or exposed to other users.
            </p>
          </Section>

          <Section title="4. Data Sharing">
            <p>
              We do not sell your personal data to third parties. We may share
              limited data with service providers (hosting, analytics, email
              delivery) who process it on our behalf under strict
              confidentiality agreements.
            </p>
          </Section>

          <Section title="5. Cookies and Tracking">
            <p>
              We use essential cookies to maintain your session and
              preferences. We use analytics tools to understand how the
              service is used. You can manage cookie preferences through your
              browser settings.
            </p>
          </Section>

          <Section title="6. Data Retention">
            <p>
              We retain your account data for as long as your account is
              active. Takes and community content are retained indefinitely to
              preserve the community record. You may request deletion of your
              personal data at any time.
            </p>
          </Section>

          <Section title="7. Your Rights">
            <p>
              You have the right to access, correct, or delete your personal
              data. You may opt out of marketing communications at any time.
              To exercise these rights, contact us at{" "}
              <a href="/contact" className="text-accent hover:underline">
                our contact page
              </a>
              .
            </p>
          </Section>

          <Section title="8. Contact">
            <p>
              For privacy-related questions, reach us at{" "}
              <a
                href="mailto:hello@gwaky.com"
                className="text-accent hover:underline"
              >
                hello@gwaky.com
              </a>{" "}
              or through our{" "}
              <a href="/contact" className="text-accent hover:underline">
                contact page
              </a>
              .
            </p>
          </Section>
        </div>
      </div>
    </div>
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
      <h2 className="text-accent text-base font-semibold mb-3">
        {title}
      </h2>
      {children}
    </section>
  );
}
