/**
 * Centralized microcopy registry for onboarding.
 *
 * Every string the user reads in the wizard, the Tier 2 modal, the
 * profile-edit privacy section, and the consent surfaces is in this
 * one file. The viral-UX task can swap tone here without touching
 * components.
 *
 * Voice guidelines (applied via `design:ux-copy`):
 *   - Plain English, sixth-grade reading level
 *   - No "in order to", no "please be advised", no "kindly"
 *   - Imperative for buttons ("Continue", not "Click here to continue")
 *   - Honest about why we ask ("So your feed knows your market" — not
 *     "To enhance your personalized experience")
 *   - One sentence per microcopy line. Two only if the second is shorter.
 */

export const COPY = {
  wizard: {
    screen1: {
      title: "Make it yours",
      subtitle: "Two quick screens. We'll tailor your feed.",
      displayName: {
        label: "Your name",
        helper: "Shown on your posts and comments.",
        placeholder: "Casey Rivera",
      },
      username: {
        label: "Username",
        helper: "Lowercase letters, numbers, and underscores. People @-mention you with this.",
        placeholder: "casey_rivera",
        prefix: "gwaky.com/@",
      },
      role: {
        label: "I'm a…",
        helper: "Shapes what you see. You can change this anytime.",
        options: {
          RENTER: "Renter",
          BUYER: "Buyer",
          SELLER: "Seller",
          AGENT: "Agent",
          BROKER: "Broker",
          INVESTOR: "Investor",
          PROPERTY_MANAGER: "Property manager",
          JOURNALIST: "Journalist",
          CURIOUS: "Just curious",
        },
      },
      cta: "Continue",
    },
    screen2: {
      title: "Where are you looking?",
      subtitle: "Pick one or more. Your feed starts here.",
      markets: {
        label: "City or metro",
        helper: "Start typing — we know the top 50 US metros.",
        placeholder: "Brooklyn, Austin, the Bay…",
      },
      neighborhoods: {
        label: "Neighborhoods (optional)",
        helper: "Press Enter after each one. Crown Heights, Mission, Capitol Hill — you know yours.",
        placeholder: "Add a neighborhood",
      },
      cta: "Finish",
      skip: "Skip — I'll set this up later",
    },
  },

  consent: {
    tos: {
      label: "I agree to the Terms of Service and Privacy Policy.",
      why: "Standard legal stuff. Required to use Gwaky.",
    },
    marketing: {
      label: "Send me product news and tips by email.",
      why: "About once a month. You can unsubscribe in one click.",
    },
    personalization: {
      label: "Use my role and markets to rank what I see.",
      why: "Off means a chronological feed of everything in your markets. On means we surface threads we think you'll care about.",
    },
    push: {
      label: "Push notifications",
      why: "We'll ask your browser the first time push actually helps you — not now.",
      // Note: No checkbox at signup. Captured at first push-relevant moment.
    },
    privacyByDefault:
      "Your budget and watchlist are private to you unless you flip them on later.",
  },

  tier2: {
    bannerTitle: "Complete your profile",
    bannerSubtitle: "Three minutes. Better feed. Skippable.",
    bannerCta: "Show me",
    bannerDismiss: "Not now",

    intent: {
      title: "What brings you here?",
      helper: "Honest answer. We won't show this on your profile.",
      options: {
        RENTING: "Looking to rent",
        BUYING: "Looking to buy",
        SELLING: "Selling something",
        BROWSING: "Just keeping tabs",
      },
    },
    timeline: {
      title: "On what timeline?",
      helper: "It's fine to change later — most people do.",
      options: {
        WITHIN_30_DAYS: "Next 30 days",
        WITHIN_6_MONTHS: "Next 6 months",
        JUST_BROWSING: "No rush",
      },
    },
    budget: {
      title: "Budget band (optional)",
      helper: "Bucketed, never shown publicly. Helps us hide listings that aren't for you.",
      private: "Visible to you only.",
    },
    referral: {
      title: "How did you find Gwaky?",
      helper: "Honestly, this just helps us understand what's working.",
      options: {
        TIKTOK: "TikTok",
        X_TWITTER: "X (Twitter)",
        REDDIT: "Reddit",
        FRIEND: "A friend told me",
        ARTICLE: "An article or newsletter",
        SEARCH: "Google / search",
        OTHER: "Other",
      },
    },
    notifications: {
      title: "How often should we email you?",
      options: {
        OFF: "Don't email me",
        DAILY: "Daily digest",
        WEEKLY: "Weekly digest",
        MONTHLY: "Monthly digest",
      },
    },
    skip: "Skip",
    finish: "Done",
  },

  privacy: {
    sectionTitle: "Privacy & Data",
    sectionSubtitle: "What's collected, what's shown, and how to leave.",
    fieldVisibility: {
      public: "Public on your profile",
      private: "Private — only you see this",
      neverPublic: "Never shown publicly",
    },
    exportTitle: "Export your data",
    exportBody:
      "Download everything we have on you — profile, posts, comments, watchlist — as JSON. Usually ready within an hour.",
    exportCta: "Request export",
    exportPending: "We're packaging your data. We'll email a download link.",
    deleteTitle: "Delete your account",
    deleteBody:
      "Schedules deletion in 30 days. You can cancel any time before then by logging back in. After 30 days everything is gone — posts, comments, profile.",
    deleteCta: "Delete my account",
    deleteScheduled: (date: string) =>
      `Your account is scheduled for deletion on ${date}. Log back in to cancel.`,
  },

  errors: {
    usernameTaken: "That username is already in use. Try another.",
    usernameInvalid:
      "Letters, numbers, and underscores only. 3–20 characters.",
    displayNameRequired: "Add a name — this shows on your posts.",
    roleRequired: "Pick a role so your feed knows who to tune for.",
    marketsRequired: "Pick at least one city or metro.",
    tosRequired: "You'll need to agree to the Terms to continue.",
    generic: "Something went sideways. Try again, or refresh the page.",
  },
} as const;
