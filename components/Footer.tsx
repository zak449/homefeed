import Link from "next/link";
import FooterEmailForm from "./FooterEmailForm";

const exploreLinks = [
  { label: "Buy", href: "/?type=sale" },
  { label: "Rent", href: "/?type=rent" },
  { label: "Hot Takes", href: "/?sort=comments" },
  { label: "Trending", href: "/trending" },
];

const companyLinks = [
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
  { label: "FAQ", href: "/faq" },
  { label: "Careers", href: "#" },
];

const legalLinks = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Service", href: "/terms" },
  { label: "Cookie Policy", href: "/privacy#cookies" },
];

function FooterLinkGroup({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return (
    <div>
      <h4 className="text-sm font-semibold text-white mb-4">{title}</h4>
      <ul className="space-y-2.5">
        {links.map((link) => (
          <li key={link.label}>
            <Link
              href={link.href}
              className="text-sm text-white/60 hover:text-white transition-colors"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Footer() {
  return (
    <footer className="bg-ink text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 lg:py-16">
        {/* Main grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8">
          {/* Column 1 — Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="inline-block mb-3">
              <span className="font-display text-xl font-bold tracking-display">
                home<span className="social-gradient">feed</span>
              </span>
            </Link>
            <p className="text-sm text-white/60 mb-5 leading-relaxed">
              Every listing has a comment section.
            </p>
            {/* Social icons */}
            <div className="flex items-center gap-3">
              {/* Twitter / X */}
              <a
                href="#"
                aria-label="Twitter"
                className="w-9 h-9 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-white/80">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              {/* Instagram */}
              <a
                href="#"
                aria-label="Instagram"
                className="w-9 h-9 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/80">
                  <rect x="2" y="2" width="20" height="20" rx="5" />
                  <circle cx="12" cy="12" r="5" />
                  <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none" />
                </svg>
              </a>
              {/* TikTok */}
              <a
                href="#"
                aria-label="TikTok"
                className="w-9 h-9 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-white/80">
                  <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.75a8.18 8.18 0 004.77 1.52V6.84a4.86 4.86 0 01-1-.15z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Column 2 — Explore */}
          <FooterLinkGroup title="Explore" links={exploreLinks} />

          {/* Column 3 — Company */}
          <FooterLinkGroup title="Company" links={companyLinks} />

          {/* Column 4 — Legal */}
          <FooterLinkGroup title="Legal" links={legalLinks} />

          {/* Column 5 — Stay Connected */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Stay Connected</h4>
            <p className="text-sm text-white/60 mb-3 leading-relaxed">
              Get hot takes and listing alerts
            </p>
            <FooterEmailForm />
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-white/40">
            &copy; 2026 homefeed. All rights reserved.
          </p>
          <p className="text-xs text-white/40">
            Made with opinions in California
          </p>
        </div>
      </div>
    </footer>
  );
}
