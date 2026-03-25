import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service \u2014 Gwaky",
  description: "Terms governing your use of Gwaky.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#0D0D0D]">
      <div className="max-w-[720px] mx-auto px-5 py-16 sm:py-24">
        <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-2">
          Terms of Service
        </h1>
        <p className="text-white/40 text-xs mb-10">Last updated: March 2026</p>

        <div className="space-y-8 text-white/70 text-sm leading-relaxed">
          <Section title="1. Acceptance of Terms">
            <p>
              By accessing or using Gwaky, you agree to be bound by these
              Terms of Service. If you do not agree, do not use the service.
            </p>
          </Section>

          <Section title="2. Eligibility">
            <p>
              You must be at least 18 years old to use Gwaky. By using the
              service, you represent that you meet this requirement.
            </p>
          </Section>

          <Section title="3. User-Generated Content">
            <p>
              Takes, questions, and answers are user-generated content. You
              are solely responsible for content you post. You agree not to
              post defamatory, harassing, threatening, or knowingly false
              content. Gwaky reserves the right to remove any content that
              violates these terms.
            </p>
          </Section>

          <Section title="4. Prohibited Conduct">
            <p>
              You may not: impersonate another person; post spam or
              unsolicited promotions; attempt to manipulate community
              reactions; use the service for any unlawful purpose; scrape or
              harvest data from the platform; or circumvent any security or
              access controls.
            </p>
          </Section>

          <Section title="5. Intellectual Property">
            <p>
              The Gwaky brand, logo, design, and code are the property of
              Gwaky. User-generated content remains the property of its
              authors, with a license granted to Gwaky to display and
              distribute it within the platform.
            </p>
          </Section>

          <Section title="6. Disclaimers">
            <p>
              Takes and community content are opinions, not professional real
              estate advice. Gwaky does not verify the accuracy of
              user-generated content. Always conduct your own due diligence
              before making real estate decisions. Gwaky is not a licensed
              real estate broker or agent.
            </p>
          </Section>

          <Section title="7. Limitation of Liability">
            <p>
              Gwaky is provided &ldquo;as is&rdquo; without warranties. To
              the maximum extent permitted by law, Gwaky shall not be liable
              for any indirect, incidental, or consequential damages arising
              from your use of the service.
            </p>
          </Section>

          <Section title="8. Dispute Resolution">
            <p>
              Any disputes arising from these terms shall be resolved through
              binding arbitration in accordance with the rules of the
              American Arbitration Association. You agree to resolve disputes
              individually and waive any right to a class action.
            </p>
          </Section>

          <Section title="9. Changes to Terms">
            <p>
              We may update these terms from time to time. Continued use of
              the service after changes constitutes acceptance of the revised
              terms.
            </p>
          </Section>

          <Section title="10. Contact">
            <p>
              Questions about these terms? Reach us at{" "}
              <a
                href="mailto:hello@gwaky.com"
                className="text-[#FF4D00] hover:underline"
              >
                hello@gwaky.com
              </a>{" "}
              or through our{" "}
              <a href="/contact" className="text-[#FF4D00] hover:underline">
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
      <h2 className="text-[#FF4D00] text-base font-semibold mb-3">
        {title}
      </h2>
      {children}
    </section>
  );
}
