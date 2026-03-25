"use client";

type EngagementPromptsProps = {
  price: number;
  listingType: string;
  commentCount: number;
  priceHistory?: { date: string; price: number; event?: string }[] | null;
};

function getPrompt({ price, listingType, commentCount, priceHistory }: EngagementPromptsProps): {
  text: string;
  icon: string;
  bgClass: string;
} | null {
  // Price dropped
  if (priceHistory && priceHistory.length >= 2) {
    const sorted = [...priceHistory].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    if (sorted.length >= 2 && sorted[0].price < sorted[1].price) {
      return {
        text: "Price just dropped! Good deal or red flag?",
        icon: "\uD83D\uDCC9",
        bgClass: "from-emerald-50 to-emerald-50/30 border-emerald-200/60",
      };
    }
  }

  // Many comments = controversial
  if (commentCount >= 10) {
    return {
      text: "This one's controversial \u2014 add your take",
      icon: "\uD83D\uDD25",
      bgClass: "from-social-light to-[#FFF1E6] border-social/15",
    };
  }

  // High price
  if (price >= 1_000_000) {
    return {
      text: "Is this worth the asking price? \uD83D\uDC40",
      icon: "\uD83D\uDCB0",
      bgClass: "from-amber-50 to-amber-50/30 border-amber-200/60",
    };
  }

  // Rental
  if (listingType === "rent") {
    return {
      text: "Would you rent here? Rate it 1-5",
      icon: "\uD83D\uDD11",
      bgClass: "from-blue-50 to-blue-50/30 border-blue-200/60",
    };
  }

  // No comments
  if (commentCount === 0) {
    return {
      text: "Be the first to share your opinion on this home",
      icon: "\uD83D\uDC40",
      bgClass: "from-social-light to-[#FFF1E6] border-social/15",
    };
  }

  return null;
}

export default function EngagementPrompts(props: EngagementPromptsProps) {
  const prompt = getPrompt(props);
  if (!prompt) return null;

  return (
    <div
      className={`rounded-xl px-4 py-3 bg-gradient-to-r ${prompt.bgClass} border flex items-center gap-3`}
    >
      <span className="text-xl shrink-0">{prompt.icon}</span>
      <p className="text-sm font-medium text-ink">{prompt.text}</p>
    </div>
  );
}
