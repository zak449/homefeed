"use client";

import { useState, useMemo } from "react";

const faqs = [
  {
    question: "What is gwakgwak?",
    answer:
      "gwakgwak is the social layer for real estate. Think of it like a comment section for every listing on the market. We aggregate real estate listings and let real people \u2014 neighbors, buyers, renters, agents, and curious locals \u2014 weigh in with opinions, reactions, and hot takes. It\u2019s browsing homes, but make it social.",
  },
  {
    question: "How is this different from Zillow or Redfin?",
    answer:
      "Zillow and Redfin are great for facts: price, square footage, how many bedrooms. But they don\u2019t tell you what people actually think. Is $800K overpriced for that neighborhood? Is that \u201ccozy\u201d kitchen actually a closet? gwakgwak adds the human layer \u2014 real reactions, real opinions, real talk. We\u2019re not replacing listing sites; we\u2019re adding the conversation they\u2019re missing.",
  },
  {
    question: "Can I list my property on gwakgwak?",
    answer:
      "Not directly \u2014 at least not yet. gwakgwak aggregates listings from public real estate data sources. We\u2019re focused on the social commentary experience right now, but we\u2019re exploring ways to let homeowners and agents engage with their listings in the future. Stay tuned!",
  },
  {
    question: "Are comments anonymous?",
    answer:
      "Sort of. You choose a display name when you comment \u2014 it can be your real name, a nickname, or whatever you want. We don\u2019t require account creation, email verification, or login. We use anonymous session identifiers to associate your activity, but we don\u2019t collect or store personally identifying information unless you voluntarily provide it.",
  },
  {
    question: "How do Hot Takes work?",
    answer:
      "Hot Takes is our curated feed of the most talked-about, most outrageous, and most polarizing listings. We surface properties with the highest price tags, the worst price-per-square-foot ratios, and the most active comment sections. It\u2019s where the wildest listings end up \u2014 think $5M studios, questionable renovations, and prices that make you do a double take.",
  },
  {
    question: "Is gwakgwak free?",
    answer:
      "Yes! gwakgwak is completely free to browse, comment, and react. No account required, no paywall, no premium tier. We believe real estate commentary should be accessible to everyone. We may introduce optional premium features in the future, but the core social experience will always be free.",
  },
  {
    question: "How do I report inappropriate content?",
    answer:
      "We take content moderation seriously. If you see a comment that contains hate speech, harassment, spam, or otherwise violates our Terms of Service, please email us at support@gwakgwak.app with the listing URL and a description of the issue. We review all reports and take action promptly. We\u2019re also working on in-app reporting tools.",
  },
  {
    question: "Where do listings come from?",
    answer:
      "Listings on gwakgwak are aggregated from publicly available real estate data sources. We pull listing details like address, price, photos, and property specs from these sources and display them alongside our social features. Listing data may not always be perfectly up-to-date \u2014 always verify details with the listing agent or source before making any decisions.",
  },
  {
    question: "Can I save listings?",
    answer:
      "We\u2019re working on it! Saved listings and personalized collections are on our roadmap. For now, you can bookmark listings in your browser. We\u2019ll announce when save functionality goes live \u2014 follow us on social media or subscribe to our newsletter to stay in the loop.",
  },
  {
    question: "How do I get listing alerts?",
    answer:
      "Listing alerts are coming soon. We\u2019re building email and SMS notifications so you can get notified when new listings drop in your area, when listings you\u2019ve viewed get new comments, or when a Hot Take is trending. Sign up for our newsletter to be the first to know when alerts launch.",
  },
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [search, setSearch] = useState("");

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const filteredFaqs = useMemo(() => {
    if (!search.trim()) return faqs.map((faq, i) => ({ ...faq, originalIndex: i }));
    const q = search.toLowerCase();
    return faqs
      .map((faq, i) => ({ ...faq, originalIndex: i }))
      .filter(
        (faq) =>
          faq.question.toLowerCase().includes(q) ||
          faq.answer.toLowerCase().includes(q)
      );
  }, [search]);

  return (
    <>
      {/* Metadata via head — client component workaround */}
      <title>FAQ — gwakgwak</title>
      <meta
        name="description"
        content="Frequently asked questions about gwakgwak, the social commentary platform for real estate."
      />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-14">
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
        <div className="mb-8">
          <p className="text-[11px] font-bold text-amber tracking-[0.2em] uppercase mb-3">
            Support
          </p>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-ink tracking-tight">
            Frequently Asked Questions
          </h1>
          <p className="text-base text-secondary mt-3 leading-relaxed">
            Got questions? We&rsquo;ve got answers. If you don&rsquo;t see what
            you&rsquo;re looking for, hit us up at{" "}
            <a
              href="mailto:support@gwakgwak.app"
              className="text-amber hover:text-amber/80 font-semibold transition-colors"
            >
              support@gwakgwak.app
            </a>
            .
          </p>
        </div>

        {/* Search / filter */}
        <div className="relative mb-8">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-tertiary pointer-events-none">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setOpenIndex(null);
            }}
            placeholder="Search questions..."
            className="w-full pl-11 pr-4 py-3 border border-divider rounded-xl text-[15px] text-ink bg-surface placeholder:text-tertiary focus:outline-none focus:ring-2 focus:ring-amber/20 focus:border-amber transition-colors"
          />
          {search && (
            <button
              onClick={() => { setSearch(""); setOpenIndex(null); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-tertiary hover:text-ink transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>

        {/* Results count when filtering */}
        {search.trim() && (
          <p className="text-[13px] text-tertiary mb-4">
            {filteredFaqs.length} {filteredFaqs.length === 1 ? "result" : "results"} found
          </p>
        )}

        {/* Accordion */}
        <div className="space-y-3">
          {filteredFaqs.map((faq) => {
            const isOpen = openIndex === faq.originalIndex;
            return (
              <div
                key={faq.originalIndex}
                className={`bg-surface border rounded-2xl transition-all duration-200 ${
                  isOpen
                    ? "border-amber/30 shadow-glow"
                    : "border-divider hover:border-divider/80"
                }`}
              >
                <button
                  onClick={() => toggle(faq.originalIndex)}
                  className="w-full text-left px-5 py-4 flex items-center justify-between gap-4"
                >
                  <span
                    className={`font-display text-[15px] font-semibold tracking-tight transition-colors ${
                      isOpen ? "text-amber" : "text-ink"
                    }`}
                  >
                    {faq.question}
                  </span>
                  <div
                    className={`shrink-0 w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-200 ${
                      isOpen ? "bg-amber/10 text-amber" : "bg-highlight text-tertiary"
                    }`}
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
                      className={`transition-transform duration-200 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    >
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  </div>
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 animate-fade-in">
                    <div className="w-full h-px bg-divider mb-4" />
                    <p className="text-[15px] text-secondary leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* No results state */}
        {search.trim() && filteredFaqs.length === 0 && (
          <div className="text-center py-12">
            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-glow flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#D4763C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
            </div>
            <p className="font-display text-lg font-bold text-ink mb-1">
              No matching questions
            </p>
            <p className="text-sm text-secondary">
              Try a different search term, or{" "}
              <a href="/contact" className="text-amber font-semibold hover:text-amber/80 transition-colors">
                ask us directly
              </a>
              .
            </p>
          </div>
        )}

        {/* Still have questions? CTA */}
        <div className="mt-12 relative bg-gradient-to-br from-ink to-ink/95 rounded-3xl p-8 sm:p-10 text-center overflow-hidden">
          {/* Ambient glow */}
          <div className="absolute top-[-30px] right-[-30px] w-[160px] h-[160px] rounded-full bg-amber/[0.08] blur-[60px] pointer-events-none" />

          <div className="relative z-10">
            <div className="w-12 h-12 mx-auto mb-4 rounded-2xl bg-amber/10 flex items-center justify-center">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#D4763C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <h2 className="font-display text-xl sm:text-2xl font-bold text-white tracking-tight mb-2">
              Still have questions?
            </h2>
            <p className="text-sm text-white/50 mb-6 max-w-sm mx-auto">
              We&rsquo;re always happy to chat. Reach out and we&rsquo;ll get back to you within 24 hours.
            </p>
            <a
              href="/contact"
              className="inline-flex items-center gap-2 bg-amber text-white text-sm font-bold px-6 py-3 rounded-xl shadow-glow hover:shadow-glow-amber hover:-translate-y-0.5 transition-all duration-200 active:scale-[0.98]"
            >
              Get in Touch
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
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
