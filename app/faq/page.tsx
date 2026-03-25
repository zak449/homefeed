"use client";

import { useState } from "react";

const FAQS = [
  {
    q: "What is Gwaky?",
    a: "Gwaky is the comment section real estate never had. Get real takes from real people \u2014 neighbors, past renters, almost-buyers \u2014 about any property before you make a decision.",
  },
  {
    q: "How do I leave a \u201cTake\u201d on a property?",
    a: "Tap the orange \u201c+ Take\u201d button on any listing page. You can post anonymously or with your display name. Select your connection to the property (neighbor, past renter, drove by, almost bought) and drop your hot take.",
  },
  {
    q: "Are the Takes verified?",
    a: "Takes are community-generated and unverified. We use emoji reactions and community flagging to surface the most credible content. Always use Takes as one data point, not the only one.",
  },
  {
    q: "Can I save listings?",
    a: "Yes \u2014 tap the heart icon on any listing to save it to your Saved tab.",
  },
  {
    q: "Is Gwaky free?",
    a: "Browsing and reacting to Takes is free. Some premium features (early access, notifications, extended Take history) may require a subscription.",
  },
  {
    q: "How do I report a Take that\u2019s inaccurate or harmful?",
    a: "Tap the flag emoji (\uD83D\uDEA9) reaction on any Take to report it. Our team reviews flagged content.",
  },
  {
    q: "What does \u201cAnon\u201d mean next to a user\u2019s name?",
    a: "The user chose to post their Take anonymously. Their identity is hidden but their connection type (e.g. neighbor, past renter) is still shown.",
  },
  {
    q: "Is my data sold to third parties?",
    a: "No. See our Privacy Policy for full details.",
  },
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-[#0D0D0D]">
      <div className="max-w-[720px] mx-auto px-5 py-16 sm:py-24">
        <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-2">
          Frequently Asked Questions
        </h1>
        <p className="text-white/60 text-sm mb-10">
          Everything you need to know about Gwaky.
        </p>

        <div className="space-y-2">
          {FAQS.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <div
                key={i}
                className="border border-[#2A2A2A] rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-[#1A1A1A] transition-colors"
                >
                  <span className="text-white text-sm font-medium pr-4">
                    {faq.q}
                  </span>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className={`text-[#555] shrink-0 transition-transform ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  >
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </button>
                {isOpen && (
                  <div className="px-5 pb-4">
                    <p className="text-white/60 text-sm leading-relaxed">
                      {faq.a}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
