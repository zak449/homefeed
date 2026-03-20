"use client";

import { useState } from "react";

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

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <>
      {/* Metadata via head — client component workaround */}
      <title>FAQ — gwakgwak</title>
      <meta
        name="description"
        content="Frequently asked questions about gwakgwak, the social commentary platform for real estate."
      />

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
            Frequently Asked Questions
          </h1>
          <p className="text-base text-muted mt-3 leading-relaxed">
            Got questions? We&rsquo;ve got answers. If you don&rsquo;t see what
            you&rsquo;re looking for, hit us up at{" "}
            <a
              href="mailto:support@gwakgwak.app"
              className="text-social hover:text-social/80 font-medium transition-colors"
            >
              support@gwakgwak.app
            </a>
            .
          </p>
        </div>

        {/* Accordion */}
        <div className="space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className={`bg-white border rounded-xl transition-all duration-200 ${
                  isOpen
                    ? "border-social/20 shadow-glow"
                    : "border-border hover:border-border/80"
                }`}
              >
                <button
                  onClick={() => toggle(index)}
                  className="w-full text-left px-5 py-4 flex items-center justify-between gap-4"
                >
                  <span
                    className={`font-display text-[15px] font-semibold tracking-tight transition-colors ${
                      isOpen ? "text-social" : "text-ink"
                    }`}
                  >
                    {faq.question}
                  </span>
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={`shrink-0 text-muted transition-transform duration-200 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  >
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 animate-fade-in">
                    <p className="text-[15px] text-muted leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 bg-tag rounded-xl p-6 sm:p-8 text-center">
          <p className="font-display text-lg font-semibold text-ink tracking-tight">
            Still have questions?
          </p>
          <p className="text-sm text-muted mt-1 mb-4">
            We&rsquo;re always happy to chat.
          </p>
          <a
            href="/contact"
            className="inline-flex items-center gap-2 bg-social text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-social/90 transition-colors"
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
    </>
  );
}
