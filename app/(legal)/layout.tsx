import Link from "next/link";

export default function LegalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-bg min-h-screen">
      {/* ═══════════════════════════════════════════════════════════
          LEGAL HUB HEADER — shared nav across Privacy / Terms / Cookies
      ═══════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden border-b border-divider">
        <div className="absolute top-[-120px] left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-amber/[0.05] blur-[120px] pointer-events-none" />
        <div className="max-w-3xl mx-auto px-5 sm:px-8 pt-12 sm:pt-16 pb-6 sm:pb-8 relative z-10">
          <p className="text-xs font-bold text-amber tracking-[0.2em] uppercase mb-3">
            Gwaky Legal
          </p>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-ink tracking-[-0.03em]">
            The fine print, in plain English.
          </h1>
          <p className="text-sm text-secondary mt-3 max-w-xl leading-relaxed">
            Real talk about what we collect, how we use it, and the rules of the
            road on Gwaky. If anything here is unclear, write to us at{" "}
            <a
              href="mailto:privacy@gwaky.com"
              className="text-amber underline-offset-2 hover:underline"
            >
              privacy@gwaky.com
            </a>
            .
          </p>

          <nav
            aria-label="Legal navigation"
            className="flex flex-wrap gap-2 mt-6"
          >
            <Link
              href="/privacy"
              className="text-xs font-semibold tracking-wide uppercase px-3 py-1.5 rounded-full bg-surface border border-divider text-secondary hover:text-amber hover:border-amber/40 transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="text-xs font-semibold tracking-wide uppercase px-3 py-1.5 rounded-full bg-surface border border-divider text-secondary hover:text-amber hover:border-amber/40 transition-colors"
            >
              Terms of Service
            </Link>
            <Link
              href="/cookies"
              className="text-xs font-semibold tracking-wide uppercase px-3 py-1.5 rounded-full bg-surface border border-divider text-secondary hover:text-amber hover:border-amber/40 transition-colors"
            >
              Cookie Policy
            </Link>
          </nav>
        </div>
      </section>

      <main className="max-w-3xl mx-auto px-5 sm:px-8 py-12 sm:py-16">
        {children}
      </main>
    </div>
  );
}
