import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service — gwakgwak",
  description:
    "Terms and conditions governing your use of gwakgwak, the social commentary platform for real estate.",
};

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
      {/* Back link */}
      <a
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
      </a>

      {/* Header */}
      <div className="mb-10">
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-ink tracking-tighter">
          Terms of Service
        </h1>
        <p className="text-sm text-muted mt-2">Effective: March 2026</p>
        <p className="text-base text-muted mt-4 leading-relaxed">
          Welcome to{" "}
          <span className="font-display font-semibold text-ink">
            gwak<span className="social-gradient">gwak</span>
          </span>
          . By accessing or using our platform, you agree to be bound by these
          Terms of Service. Please read them carefully.
        </p>
      </div>

      {/* Sections */}
      <div className="space-y-10">
        {/* 1. Acceptance of Terms */}
        <section>
          <h2 className="font-display text-xl font-semibold text-ink tracking-tight mb-3">
            1. Acceptance of Terms
          </h2>
          <div className="space-y-3 text-[15px] text-muted leading-relaxed">
            <p>
              By accessing or using gwakgwak (the &ldquo;Platform&rdquo;), you
              agree to comply with and be bound by these Terms of Service
              (&ldquo;Terms&rdquo;). If you do not agree to these Terms, you may
              not access or use the Platform.
            </p>
            <p>
              These Terms constitute a legally binding agreement between you and
              gwakgwak. Your continued use of the Platform following any
              modifications to these Terms constitutes acceptance of those
              changes.
            </p>
          </div>
        </section>

        {/* 2. Description of Service */}
        <section>
          <h2 className="font-display text-xl font-semibold text-ink tracking-tight mb-3">
            2. Description of Service
          </h2>
          <div className="text-[15px] text-muted leading-relaxed">
            <p>
              gwakgwak is a social commentary platform for real estate. The
              Platform aggregates publicly available real estate listings and
              allows users to view, comment on, react to, and discuss
              properties. gwakgwak does not own, manage, sell, or lease any
              properties displayed on the Platform.
            </p>
          </div>
        </section>

        {/* 3. User-Generated Content */}
        <section>
          <h2 className="font-display text-xl font-semibold text-ink tracking-tight mb-3">
            3. User-Generated Content
          </h2>
          <div className="space-y-3 text-[15px] text-muted leading-relaxed">
            <p>
              The Platform allows you to post comments, reactions, and other
              content (&ldquo;User Content&rdquo;). You are solely responsible
              for your User Content and the consequences of posting it.
            </p>
            <p>
              By submitting User Content, you grant gwakgwak a non-exclusive,
              worldwide, royalty-free, perpetual, irrevocable, sublicensable
              license to use, reproduce, modify, adapt, publish, display,
              distribute, and create derivative works from your User Content in
              connection with the Platform and gwakgwak&rsquo;s business
              operations.
            </p>
            <p>
              You represent and warrant that you own or have the necessary
              rights, licenses, and permissions to submit your User Content and
              to grant the above license.
            </p>
          </div>
        </section>

        {/* 4. Prohibited Content and Conduct */}
        <section>
          <h2 className="font-display text-xl font-semibold text-ink tracking-tight mb-3">
            4. Prohibited Content and Conduct
          </h2>
          <div className="space-y-3 text-[15px] text-muted leading-relaxed">
            <p>
              You agree not to use the Platform to post, upload, or transmit any
              content that:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <span className="font-semibold text-ink">Hate speech:</span>{" "}
                Content that promotes violence, discrimination, or hostility
                against any individual or group based on race, ethnicity,
                national origin, sex, gender identity, sexual orientation,
                religion, disability, or age.
              </li>
              <li>
                <span className="font-semibold text-ink">Harassment:</span>{" "}
                Content that threatens, intimidates, bullies, or targets another
                person with the intent to cause harm or distress, including
                doxxing (publishing private personal information).
              </li>
              <li>
                <span className="font-semibold text-ink">Spam:</span>{" "}
                Unsolicited or repetitive content, including but not limited to
                commercial solicitations, advertisements, promotional materials,
                chain messages, or automated/scripted content.
              </li>
              <li>
                <span className="font-semibold text-ink">
                  Misleading information:
                </span>{" "}
                Content that is intentionally false, deceptive, or designed to
                mislead other users, particularly regarding property details,
                pricing, or market conditions.
              </li>
              <li>
                <span className="font-semibold text-ink">
                  Illegal content:
                </span>{" "}
                Content that violates any applicable law, regulation, or
                third-party rights, including intellectual property,
                defamation, and privacy laws.
              </li>
              <li>
                <span className="font-semibold text-ink">
                  Explicit or harmful material:
                </span>{" "}
                Sexually explicit content, graphic violence, or any content that
                could be harmful to minors.
              </li>
              <li>
                <span className="font-semibold text-ink">
                  Impersonation:
                </span>{" "}
                Content that misrepresents your identity or affiliation, or
                falsely implies endorsement by any person or entity.
              </li>
            </ul>
            <p>
              gwakgwak reserves the right to remove any content that violates
              these Terms and to restrict or terminate access for users who
              engage in prohibited conduct, at our sole discretion and without
              prior notice.
            </p>
          </div>
        </section>

        {/* 5. Intellectual Property */}
        <section>
          <h2 className="font-display text-xl font-semibold text-ink tracking-tight mb-3">
            5. Intellectual Property
          </h2>
          <div className="space-y-3 text-[15px] text-muted leading-relaxed">
            <p>
              The Platform, including its design, features, branding, logos,
              code, and all non-user content, is owned by gwakgwak and is
              protected by copyright, trademark, and other intellectual property
              laws. You may not copy, modify, distribute, sell, or lease any
              part of the Platform without our prior written consent.
            </p>
            <p>
              Real estate listing data displayed on the Platform may be sourced
              from third-party providers and is subject to their respective
              terms and conditions. gwakgwak does not claim ownership of
              third-party listing content.
            </p>
          </div>
        </section>

        {/* 6. Disclaimer — Not Real Estate Advice */}
        <section>
          <h2 className="font-display text-xl font-semibold text-ink tracking-tight mb-3">
            6. Disclaimer — Not Real Estate Advice
          </h2>
          <div className="space-y-3 text-[15px] text-muted leading-relaxed">
            <div className="bg-social-light border border-social/10 rounded-xl p-5">
              <p className="font-semibold text-ink mb-2">
                Important: gwakgwak is not a licensed real estate broker, agent,
                or advisor.
              </p>
              <p>
                Nothing on the Platform constitutes professional real estate
                advice, financial advice, investment advice, or legal advice.
                All content on gwakgwak, including user comments and reactions,
                is provided for informational and entertainment purposes only.
              </p>
            </div>
            <p>
              Listing information, including prices, property details, and
              availability, may be inaccurate, outdated, or incomplete. You
              should independently verify all property information before making
              any real estate decisions. Always consult with qualified
              professionals (real estate agents, attorneys, financial advisors)
              before buying, selling, or renting property.
            </p>
          </div>
        </section>

        {/* 7. Limitation of Liability */}
        <section>
          <h2 className="font-display text-xl font-semibold text-ink tracking-tight mb-3">
            7. Limitation of Liability
          </h2>
          <div className="space-y-3 text-[15px] text-muted leading-relaxed">
            <p>
              TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, GWAKGWAK AND
              ITS OFFICERS, DIRECTORS, EMPLOYEES, AGENTS, AND AFFILIATES SHALL
              NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL,
              CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING WITHOUT LIMITATION
              LOSS OF PROFITS, DATA, USE, OR GOODWILL, ARISING OUT OF OR IN
              CONNECTION WITH YOUR USE OF OR INABILITY TO USE THE PLATFORM.
            </p>
            <p>
              IN NO EVENT SHALL GWAKGWAK&rsquo;S TOTAL LIABILITY TO YOU FOR ALL
              CLAIMS ARISING OUT OF OR RELATING TO THE PLATFORM EXCEED ONE
              HUNDRED DOLLARS ($100.00).
            </p>
            <p>
              THE PLATFORM IS PROVIDED ON AN &ldquo;AS IS&rdquo; AND &ldquo;AS
              AVAILABLE&rdquo; BASIS WITHOUT WARRANTIES OF ANY KIND, WHETHER
              EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES
              OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND
              NON-INFRINGEMENT.
            </p>
          </div>
        </section>

        {/* 8. Indemnification */}
        <section>
          <h2 className="font-display text-xl font-semibold text-ink tracking-tight mb-3">
            8. Indemnification
          </h2>
          <div className="text-[15px] text-muted leading-relaxed">
            <p>
              You agree to indemnify, defend, and hold harmless gwakgwak, its
              officers, directors, employees, agents, and affiliates from and
              against any and all claims, damages, losses, liabilities, costs,
              and expenses (including reasonable attorneys&rsquo; fees) arising
              out of or in connection with: (a) your use of the Platform; (b)
              your User Content; (c) your violation of these Terms; or (d) your
              violation of any law or the rights of any third party.
            </p>
          </div>
        </section>

        {/* 9. Governing Law */}
        <section>
          <h2 className="font-display text-xl font-semibold text-ink tracking-tight mb-3">
            9. Governing Law and Dispute Resolution
          </h2>
          <div className="space-y-3 text-[15px] text-muted leading-relaxed">
            <p>
              These Terms shall be governed by and construed in accordance with
              the laws of the State of California, United States, without regard
              to its conflict of law provisions.
            </p>
            <p>
              Any dispute arising out of or relating to these Terms or the
              Platform shall be resolved exclusively in the state or federal
              courts located in California. You consent to the personal
              jurisdiction of and venue in such courts and waive any objection
              as to inconvenient forum.
            </p>
          </div>
        </section>

        {/* 10. Modifications to Terms */}
        <section>
          <h2 className="font-display text-xl font-semibold text-ink tracking-tight mb-3">
            10. Modifications to Terms
          </h2>
          <div className="text-[15px] text-muted leading-relaxed">
            <p>
              gwakgwak reserves the right to modify these Terms at any time.
              When we make changes, we will update the effective date at the top
              of this page and, for material changes, may provide additional
              notice (such as a banner on the Platform or an email to
              subscribers). Your continued use of the Platform after any
              modifications constitutes your acceptance of the revised Terms. If
              you do not agree to the updated Terms, you must discontinue use of
              the Platform.
            </p>
          </div>
        </section>

        {/* 11. Termination */}
        <section>
          <h2 className="font-display text-xl font-semibold text-ink tracking-tight mb-3">
            11. Termination
          </h2>
          <div className="space-y-3 text-[15px] text-muted leading-relaxed">
            <p>
              gwakgwak may terminate or suspend your access to the Platform at
              any time, with or without cause, and with or without notice. Upon
              termination, your right to use the Platform will immediately
              cease.
            </p>
            <p>
              You may stop using the Platform at any time. Sections of these
              Terms that by their nature should survive termination (including,
              without limitation, intellectual property, limitation of
              liability, indemnification, and governing law) will survive.
            </p>
          </div>
        </section>

        {/* 12. Severability */}
        <section>
          <h2 className="font-display text-xl font-semibold text-ink tracking-tight mb-3">
            12. Severability
          </h2>
          <div className="text-[15px] text-muted leading-relaxed">
            <p>
              If any provision of these Terms is found to be invalid,
              unenforceable, or illegal by a court of competent jurisdiction, the
              remaining provisions shall continue in full force and effect. The
              invalid provision shall be modified to the minimum extent
              necessary to make it valid and enforceable while preserving its
              original intent.
            </p>
          </div>
        </section>

        {/* 13. Entire Agreement */}
        <section>
          <h2 className="font-display text-xl font-semibold text-ink tracking-tight mb-3">
            13. Entire Agreement
          </h2>
          <div className="text-[15px] text-muted leading-relaxed">
            <p>
              These Terms, together with our{" "}
              <a
                href="/privacy"
                className="text-social hover:text-social/80 font-medium transition-colors"
              >
                Privacy Policy
              </a>
              , constitute the entire agreement between you and gwakgwak
              regarding your use of the Platform and supersede any prior
              agreements, communications, or understandings, whether written or
              oral.
            </p>
          </div>
        </section>

        {/* 14. Contact */}
        <section>
          <h2 className="font-display text-xl font-semibold text-ink tracking-tight mb-3">
            14. Contact
          </h2>
          <div className="text-[15px] text-muted leading-relaxed">
            <p>
              If you have any questions about these Terms of Service, please
              contact us:
            </p>
            <div className="mt-4 bg-tag rounded-xl p-5 space-y-2">
              <p className="font-display font-semibold text-ink">
                gwak<span className="social-gradient">gwak</span>
              </p>
              <p>
                Email:{" "}
                <a
                  href="mailto:support@gwakgwak.app"
                  className="text-social hover:text-social/80 font-medium transition-colors"
                >
                  support@gwakgwak.app
                </a>
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
