import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — homefeed",
  description:
    "How homefeed collects, uses, and protects your information. Learn about our data practices, your rights, and how to contact us.",
};

export default function PrivacyPage() {
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
        Back to homefeed
      </a>

      {/* Header */}
      <div className="mb-10">
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-ink tracking-tighter">
          Privacy Policy
        </h1>
        <p className="text-sm text-muted mt-2">Last updated: March 2026</p>
        <p className="text-base text-muted mt-4 leading-relaxed">
          At{" "}
          <span className="font-display font-semibold text-ink">
            home<span className="social-gradient">feed</span>
          </span>
          , we take your privacy seriously. This policy explains what information
          we collect, how we use it, and your rights regarding your data.
        </p>
      </div>

      {/* Sections */}
      <div className="space-y-10">
        {/* 1. Information We Collect */}
        <section>
          <h2 className="font-display text-xl font-semibold text-ink tracking-tight mb-3">
            1. Information We Collect
          </h2>
          <div className="space-y-4 text-[15px] text-muted leading-relaxed">
            <p>
              We collect information to provide and improve our services. The
              types of information we collect include:
            </p>

            <div>
              <h3 className="font-semibold text-ink mb-1">
                Anonymous Identifiers
              </h3>
              <p>
                When you visit homefeed, we generate an anonymous identifier to
                associate your comments, reactions, and preferences with your
                session. We do not require account creation, and we do not
                collect your real name, email address, or phone number unless you
                voluntarily provide them (for example, through our contact form
                or email subscription).
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-ink mb-1">
                Comments and Reactions
              </h3>
              <p>
                When you post a comment or react to a listing, we store the
                content of that interaction along with your display name (which
                you choose), the associated listing, and a timestamp.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-ink mb-1">
                Geolocation for Search
              </h3>
              <p>
                With your permission, we may access your device&rsquo;s
                geolocation to improve search results and show listings near
                you. This data is used in real time for search functionality and
                is not stored on our servers. You can deny or revoke location
                permission at any time through your browser settings.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-ink mb-1">
                Usage and Analytics Data
              </h3>
              <p>
                We collect anonymized usage data such as pages visited, time
                spent on pages, device type, browser type, and referring URLs.
                This information helps us understand how our platform is used
                and improve the experience.
              </p>
            </div>
          </div>
        </section>

        {/* 2. Cookies and Local Storage */}
        <section>
          <h2 className="font-display text-xl font-semibold text-ink tracking-tight mb-3">
            2. Cookies and Local Storage
          </h2>
          <div className="space-y-3 text-[15px] text-muted leading-relaxed">
            <p>
              homefeed uses localStorage (a browser-based storage mechanism) to
              save your preferences, such as your display name for comments,
              recently viewed listings, and interface preferences. This data
              stays on your device and is not transmitted to our servers unless
              necessary for functionality.
            </p>
            <p>
              We may use essential cookies for basic site functionality. We do
              not use advertising cookies or third-party tracking cookies for ad
              targeting purposes.
            </p>
          </div>
        </section>

        {/* 3. How We Use Your Information */}
        <section>
          <h2 className="font-display text-xl font-semibold text-ink tracking-tight mb-3">
            3. How We Use Your Information
          </h2>
          <div className="text-[15px] text-muted leading-relaxed">
            <p className="mb-3">We use the information we collect to:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                Provide, maintain, and improve homefeed&rsquo;s features and
                services
              </li>
              <li>
                Display comments, reactions, and social activity on listings
              </li>
              <li>
                Personalize your experience, including location-based search
                results
              </li>
              <li>
                Send you email or SMS communications if you have opted in
                through our subscription service
              </li>
              <li>
                Analyze usage patterns to improve platform performance and user
                experience
              </li>
              <li>
                Detect and prevent spam, abuse, and violations of our Terms of
                Service
              </li>
            </ul>
          </div>
        </section>

        {/* 4. No Sale of Personal Data */}
        <section>
          <h2 className="font-display text-xl font-semibold text-ink tracking-tight mb-3">
            4. No Sale of Personal Data
          </h2>
          <div className="text-[15px] text-muted leading-relaxed">
            <p>
              <span className="font-semibold text-ink">
                We do not sell, rent, or trade your personal information to third
                parties.
              </span>{" "}
              Your data is used solely to operate and improve homefeed. We may
              share anonymized, aggregated data (which cannot identify you) for
              analytics or business purposes.
            </p>
          </div>
        </section>

        {/* 5. Email and SMS Communications */}
        <section>
          <h2 className="font-display text-xl font-semibold text-ink tracking-tight mb-3">
            5. Email and SMS Communications
          </h2>
          <div className="space-y-3 text-[15px] text-muted leading-relaxed">
            <p>
              If you choose to subscribe to listing alerts, newsletters, or
              other communications, we process these subscriptions through
              Klaviyo, our email and SMS marketing platform. Subscribing is
              entirely optional and requires your explicit opt-in.
            </p>
            <p>
              You can unsubscribe from email communications at any time by
              clicking the unsubscribe link in any email, or by contacting us at{" "}
              <a
                href="mailto:privacy@homefeed.app"
                className="text-social hover:text-social/80 font-medium transition-colors"
              >
                privacy@homefeed.app
              </a>
              . For SMS, reply STOP to any message to opt out.
            </p>
          </div>
        </section>

        {/* 6. Data Retention */}
        <section>
          <h2 className="font-display text-xl font-semibold text-ink tracking-tight mb-3">
            6. Data Retention
          </h2>
          <div className="space-y-3 text-[15px] text-muted leading-relaxed">
            <p>
              We retain your data only as long as necessary to provide our
              services and fulfill the purposes outlined in this policy.
              Specifically:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <span className="font-semibold text-ink">
                  Comments and reactions
                </span>{" "}
                are retained for as long as the associated listing is active on
                the platform, plus a reasonable period thereafter.
              </li>
              <li>
                <span className="font-semibold text-ink">
                  Anonymous session data
                </span>{" "}
                is retained for up to 12 months.
              </li>
              <li>
                <span className="font-semibold text-ink">
                  Email/SMS subscriber data
                </span>{" "}
                is retained until you unsubscribe, at which point it is removed
                from our active mailing lists within 30 days.
              </li>
              <li>
                <span className="font-semibold text-ink">Analytics data</span>{" "}
                is retained in aggregated, anonymized form indefinitely.
              </li>
            </ul>
          </div>
        </section>

        {/* 7. Your Rights (CCPA / GDPR) */}
        <section>
          <h2 className="font-display text-xl font-semibold text-ink tracking-tight mb-3">
            7. Your Rights Under CCPA and GDPR
          </h2>
          <div className="space-y-4 text-[15px] text-muted leading-relaxed">
            <p>
              Depending on your location, you may have certain rights regarding
              your personal information:
            </p>

            <div>
              <h3 className="font-semibold text-ink mb-1">
                California Residents (CCPA)
              </h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  The right to know what personal information we collect about
                  you
                </li>
                <li>The right to request deletion of your personal data</li>
                <li>
                  The right to opt out of the sale of your personal information
                  (we do not sell personal data)
                </li>
                <li>
                  The right to non-discrimination for exercising your privacy
                  rights
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-ink mb-1">
                European Residents (GDPR)
              </h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  The right to access, rectify, or erase your personal data
                </li>
                <li>The right to restrict or object to data processing</li>
                <li>The right to data portability</li>
                <li>
                  The right to withdraw consent at any time where processing is
                  based on consent
                </li>
                <li>
                  The right to lodge a complaint with a supervisory authority
                </li>
              </ul>
            </div>

            <p>
              To exercise any of these rights, please contact us at{" "}
              <a
                href="mailto:privacy@homefeed.app"
                className="text-social hover:text-social/80 font-medium transition-colors"
              >
                privacy@homefeed.app
              </a>
              . We will respond to your request within 30 days (or sooner as
              required by applicable law).
            </p>
          </div>
        </section>

        {/* 8. Data Security */}
        <section>
          <h2 className="font-display text-xl font-semibold text-ink tracking-tight mb-3">
            8. Data Security
          </h2>
          <div className="text-[15px] text-muted leading-relaxed">
            <p>
              We implement reasonable technical and organizational measures to
              protect your information against unauthorized access, alteration,
              disclosure, or destruction. These include encryption of data in
              transit (HTTPS), secure server infrastructure, and regular security
              reviews. However, no method of transmission over the Internet is
              100% secure, and we cannot guarantee absolute security.
            </p>
          </div>
        </section>

        {/* 9. Third-Party Services */}
        <section>
          <h2 className="font-display text-xl font-semibold text-ink tracking-tight mb-3">
            9. Third-Party Services
          </h2>
          <div className="space-y-3 text-[15px] text-muted leading-relaxed">
            <p>
              homefeed may contain links to third-party websites or integrate
              with third-party services. We are not responsible for the privacy
              practices of these third parties. We encourage you to read their
              privacy policies before providing any personal information.
            </p>
            <p>
              We may use third-party service providers to help operate our
              platform (such as hosting, analytics, and email delivery). These
              providers are contractually obligated to protect your data and may
              only use it to provide services on our behalf.
            </p>
          </div>
        </section>

        {/* 10. Children's Privacy */}
        <section>
          <h2 className="font-display text-xl font-semibold text-ink tracking-tight mb-3">
            10. Children&rsquo;s Privacy
          </h2>
          <div className="text-[15px] text-muted leading-relaxed">
            <p>
              homefeed is not directed to individuals under the age of 13 (or
              the applicable age of digital consent in your jurisdiction). We do
              not knowingly collect personal information from children. If we
              become aware that we have collected personal data from a child
              without parental consent, we will take steps to delete that
              information promptly.
            </p>
          </div>
        </section>

        {/* 11. Changes to This Policy */}
        <section>
          <h2 className="font-display text-xl font-semibold text-ink tracking-tight mb-3">
            11. Changes to This Policy
          </h2>
          <div className="text-[15px] text-muted leading-relaxed">
            <p>
              We may update this Privacy Policy from time to time. When we make
              changes, we will update the &ldquo;Last updated&rdquo; date at the
              top of this page. We encourage you to review this policy
              periodically. Your continued use of homefeed after any changes
              constitutes your acceptance of the updated policy.
            </p>
          </div>
        </section>

        {/* 12. Contact Us */}
        <section>
          <h2 className="font-display text-xl font-semibold text-ink tracking-tight mb-3">
            12. Contact Us
          </h2>
          <div className="text-[15px] text-muted leading-relaxed">
            <p>
              If you have any questions about this Privacy Policy or our data
              practices, please contact us at:
            </p>
            <div className="mt-4 bg-tag rounded-xl p-5 space-y-2">
              <p className="font-display font-semibold text-ink">
                home<span className="social-gradient">feed</span> Privacy Team
              </p>
              <p>
                Email:{" "}
                <a
                  href="mailto:privacy@homefeed.app"
                  className="text-social hover:text-social/80 font-medium transition-colors"
                >
                  privacy@homefeed.app
                </a>
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
