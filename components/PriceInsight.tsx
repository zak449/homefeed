"use client";

export default function PriceInsight({
  price,
  sqft,
  city,
}: {
  price: number;
  sqft: number | null;
  city: string;
}) {
  if (!sqft || sqft <= 0) return null;

  const pricePerSqft = Math.round(price / sqft);

  // Rough thresholds for price/sqft insight
  let verdict: { emoji: string; label: string; color: string; bgColor: string; barPct: number };
  if (pricePerSqft < 200) {
    verdict = {
      emoji: "\uD83D\uDD25",
      label: "Great deal",
      color: "#16A34A",
      bgColor: "bg-green-50",
      barPct: 25,
    };
  } else if (pricePerSqft <= 400) {
    verdict = {
      emoji: "\uD83D\uDCCA",
      label: "Market rate",
      color: "#3B82F6",
      bgColor: "bg-blue-50",
      barPct: 55,
    };
  } else {
    verdict = {
      emoji: "\uD83D\uDCB0",
      label: "Above average",
      color: "#FF6B2C",
      bgColor: "bg-orange-50",
      barPct: 85,
    };
  }

  return (
    <div className="rounded-xl border border-border bg-surface p-4 animate-fade-in">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-medium text-muted">Price per sqft in {city}</p>
        <span
          className={`text-xs font-semibold px-2 py-0.5 rounded-md ${verdict.bgColor}`}
          style={{ color: verdict.color }}
        >
          {verdict.emoji} {verdict.label}
        </span>
      </div>

      {/* Price per sqft display */}
      <p className="font-display text-xl font-bold text-ink tracking-tighter mb-3">
        ${pricePerSqft.toLocaleString()}
        <span className="text-sm font-normal text-muted"> /sqft</span>
      </p>

      {/* Horizontal bar visualization */}
      <div className="relative">
        {/* Track */}
        <div className="h-2 rounded-full bg-gradient-to-r from-green-200 via-blue-200 to-orange-200 w-full" />

        {/* Indicator marker */}
        <div
          className="absolute top-0 w-3 h-3 rounded-full border-2 border-white shadow-md transition-all duration-500 -translate-y-[2px]"
          style={{
            left: `clamp(4%, ${verdict.barPct}%, 96%)`,
            backgroundColor: verdict.color,
          }}
        />

        {/* Labels */}
        <div className="flex justify-between mt-2 text-xs text-muted/60">
          <span>$100/sqft</span>
          <span>$300/sqft</span>
          <span>$500+/sqft</span>
        </div>
      </div>
    </div>
  );
}
