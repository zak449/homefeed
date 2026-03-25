"use client";

import { useState, useCallback, useRef } from "react";

interface AIReimagineToolProps {
  photos: string[];
  address: string;
}

// ---------------------------------------------------------------------------
// Style filter presets (kept as secondary feature)
// ---------------------------------------------------------------------------
const STYLES = ["Modern", "Mediterranean", "Farmhouse", "Industrial", "Minimalist"] as const;
type Style = (typeof STYLES)[number];

const STYLE_FILTERS: Record<Style, string> = {
  Modern: "saturate(1.1) contrast(1.15) brightness(1.05)",
  Mediterranean: "sepia(0.25) saturate(1.3) brightness(1.05) hue-rotate(-10deg)",
  Farmhouse: "sepia(0.15) saturate(0.9) brightness(1.1) contrast(0.95)",
  Industrial: "saturate(0.6) contrast(1.2) brightness(0.95)",
  Minimalist: "saturate(0.8) brightness(1.12) contrast(1.05)",
};

const STYLE_OVERLAYS: Record<Style, string> = {
  Modern: "from-blue-500/5 to-transparent",
  Mediterranean: "from-amber-500/8 to-transparent",
  Farmhouse: "from-yellow-700/5 to-transparent",
  Industrial: "from-slate-500/10 to-transparent",
  Minimalist: "from-white/10 to-transparent",
};

const STYLE_DESCRIPTIONS: Record<Style, string> = {
  Modern: "Clean lines, neutral tones, open spaces",
  Mediterranean: "Warm terracotta, arched details, earthy palette",
  Farmhouse: "Rustic charm, soft whites, natural wood",
  Industrial: "Raw materials, muted tones, urban edge",
  Minimalist: "Bright, airy, stripped-back simplicity",
};

// ---------------------------------------------------------------------------
// Renovation idea categories & cards
// ---------------------------------------------------------------------------
interface RenovationIdea {
  emoji: string;
  name: string;
  cost: string;
  valueAdd: string;
  description: string;
}

interface IdeaCategory {
  label: string;
  emoji: string;
  ideas: RenovationIdea[];
}

const IDEA_CATEGORIES: IdeaCategory[] = [
  {
    label: "Curb Appeal",
    emoji: "\u{1F3E1}",
    ideas: [
      {
        emoji: "\u{1F3A8}",
        name: "Fresh paint",
        cost: "$1K\u20134K",
        valueAdd: "+$5K\u201315K value",
        description: "New exterior paint with modern color palette to refresh the look instantly.",
      },
      {
        emoji: "\u{1F333}",
        name: "New landscaping",
        cost: "$3K\u20138K",
        valueAdd: "+$10K\u201320K value",
        description: "Professional landscaping with native plants, stone paths, and curb-side trees.",
      },
      {
        emoji: "\u{1F6AA}",
        name: "Modern front door",
        cost: "$500\u20132K",
        valueAdd: "+$3K\u20138K value",
        description: "Statement entry door with sidelights or smart lock hardware.",
      },
      {
        emoji: "\u{1F4A1}",
        name: "Outdoor lighting",
        cost: "$800\u20133K",
        valueAdd: "+$2K\u20136K value",
        description: "Path lights, uplighting on trees, and a modern porch fixture.",
      },
    ],
  },
  {
    label: "Backyard Dreams",
    emoji: "\u{1F3D6}\uFE0F",
    ideas: [
      {
        emoji: "\u{1F3CA}",
        name: "Add a pool",
        cost: "$25K\u201360K",
        valueAdd: "+$30K\u201360K value",
        description: "In-ground pool with patio surround\u2014the ultimate backyard upgrade.",
      },
      {
        emoji: "\u{1F525}",
        name: "Fire pit area",
        cost: "$1K\u20135K",
        valueAdd: "+$4K\u201310K value",
        description: "Built-in fire pit with seating wall and gravel base for year-round entertaining.",
      },
      {
        emoji: "\u{1F373}",
        name: "Outdoor kitchen",
        cost: "$8K\u201325K",
        valueAdd: "+$15K\u201330K value",
        description: "Grill station, countertops, and bar seating under a pergola.",
      },
      {
        emoji: "\u{1F33F}",
        name: "Garden oasis",
        cost: "$2K\u20136K",
        valueAdd: "+$5K\u201312K value",
        description: "Raised garden beds, water feature, and zen-inspired plantings.",
      },
    ],
  },
  {
    label: "Interior Refresh",
    emoji: "\u2728",
    ideas: [
      {
        emoji: "\u{1F374}",
        name: "Modern kitchen",
        cost: "$15K\u201340K",
        valueAdd: "+$20K\u201350K value",
        description: "Quartz counters, shaker cabinets, stainless appliances, and subway tile backsplash.",
      },
      {
        emoji: "\u{1F3DB}\uFE0F",
        name: "Open floor plan",
        cost: "$10K\u201330K",
        valueAdd: "+$15K\u201340K value",
        description: "Remove walls between kitchen, dining, and living for a flowing modern layout.",
      },
      {
        emoji: "\u{1FAB5}",
        name: "Hardwood floors",
        cost: "$6K\u201315K",
        valueAdd: "+$10K\u201325K value",
        description: "Engineered hardwood throughout main living areas for warmth and character.",
      },
      {
        emoji: "\u{1F6C1}",
        name: "Spa bathroom",
        cost: "$10K\u201325K",
        valueAdd: "+$15K\u201330K value",
        description: "Walk-in rain shower, freestanding tub, double vanity, and heated floors.",
      },
    ],
  },
  {
    label: "Smart Upgrades",
    emoji: "\u{1F4B0}",
    ideas: [
      {
        emoji: "\u{1F4C8}",
        name: "Best ROI renovations",
        cost: "$5K\u201315K",
        valueAdd: "+$12K\u201330K value",
        description: "Garage door, minor kitchen remodel, and siding replacement\u2014top ROI projects.",
      },
      {
        emoji: "\u{1F4B5}",
        name: "Cheapest upgrades, biggest impact",
        cost: "$500\u20132K",
        valueAdd: "+$3K\u201310K value",
        description: "Paint, hardware swaps, light fixtures, and deep cleaning for a fresh feel.",
      },
      {
        emoji: "\u{1F331}",
        name: "Energy efficient",
        cost: "$3K\u201312K",
        valueAdd: "+$8K\u201320K value",
        description: "New windows, insulation, smart thermostat, and LED lighting throughout.",
      },
      {
        emoji: "\u{1F4F1}",
        name: "Smart home",
        cost: "$2K\u20138K",
        valueAdd: "+$5K\u201315K value",
        description: "Smart locks, cameras, automated blinds, voice assistants, and app-controlled lighting.",
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function AIReimagineTool({ photos, address }: AIReimagineToolProps) {
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [selectedStyle, setSelectedStyle] = useState<Style | null>(null);
  const [showComparison, setShowComparison] = useState(false);
  const [sliderPos, setSliderPos] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [copied, setCopied] = useState(false);
  const [selectedIdea, setSelectedIdea] = useState<RenovationIdea | null>(null);
  const sliderRef = useRef<HTMLDivElement>(null);

  const currentPhoto = photos[selectedPhotoIndex] || photos[0];

  // --- Style helpers --------------------------------------------------------
  function handleStyleSelect(style: Style) {
    if (selectedStyle === style) {
      setSelectedStyle(null);
      setShowComparison(false);
      return;
    }
    setSelectedStyle(style);
    setShowComparison(false);
    setSliderPos(50);
  }

  function toggleComparison() {
    setShowComparison((prev) => !prev);
    setSliderPos(50);
  }

  const updateSlider = useCallback(
    (clientX: number) => {
      if (!isDragging || !sliderRef.current) return;
      const rect = sliderRef.current.getBoundingClientRect();
      const x = ((clientX - rect.left) / rect.width) * 100;
      setSliderPos(Math.max(2, Math.min(98, x)));
    },
    [isDragging]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => updateSlider(e.clientX),
    [updateSlider]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent<HTMLDivElement>) => updateSlider(e.touches[0].clientX),
    [updateSlider]
  );

  // --- Share ----------------------------------------------------------------
  async function handleShare() {
    if (!currentPhoto) return;
    try {
      await navigator.clipboard.writeText(currentPhoto);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const input = document.createElement("input");
      input.value = currentPhoto;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  // --- Render ---------------------------------------------------------------
  return (
    <div className="bg-surface rounded-card border border-divider shadow-soft overflow-hidden">
      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div className="px-5 pt-5 pb-3">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber to-amber/60 flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
            </svg>
          </div>
          <h3 className="font-display text-title text-ink tracking-tight">Imagine what it could be</h3>
          <span className="ml-auto text-xs font-medium tracking-wider uppercase text-amber bg-amber/8 px-2 py-0.5 rounded-full">
            Beta
          </span>
        </div>
        <p className="text-caption text-secondary ml-9">
          Explore renovation ideas, estimate costs, and preview styles for this property
        </p>
      </div>

      {/* ── Coming soon: AI-generated visualization badge ────────────────── */}
      <div className="mx-5 mb-3 px-3.5 py-2.5 bg-gradient-to-r from-amber/5 via-amber/8 to-purple-500/5 border border-amber/15 rounded-button">
        <div className="flex items-center gap-2.5">
          <div className="w-5 h-5 rounded-full bg-amber/10 flex items-center justify-center flex-shrink-0">
            <svg className="w-3 h-3 text-amber" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
            </svg>
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-ink">
              Coming soon: AI-generated visualization
            </p>
            <p className="text-xs text-secondary mt-0.5">
              Full AI rendering is being developed. For now, browse renovation ideas and apply style filters to the listing photos.
            </p>
          </div>
        </div>
      </div>

      {/* ── Dream prompt input ───────────────────────────────────────────── */}
      <div className="px-5 pb-4">
        <label className="text-xs font-medium tracking-wider uppercase text-tertiary mb-2 block">
          Describe your dream renovation...
        </label>
        <div className="relative">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g. modern kitchen with white cabinets, add a pool, update the landscaping..."
            className="w-full pl-10 pr-24 py-2.5 text-caption text-ink bg-highlight border border-divider rounded-button placeholder:text-tertiary focus:outline-none focus:border-amber/50 focus:ring-1 focus:ring-amber/20 transition-all"
          />
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-tertiary">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
          </div>
          <div className="absolute right-2 top-1/2 -translate-y-1/2">
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber bg-amber/8 px-2 py-0.5 rounded-full">
              <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              AI Coming Soon
            </span>
          </div>
        </div>
      </div>

      {/* ── Idea Categories ──────────────────────────────────────────────── */}
      <div className="pb-2">
        {IDEA_CATEGORIES.map((category) => (
          <div key={category.label} className="mb-4">
            {/* Category header */}
            <div className="px-5 mb-2 flex items-center gap-1.5">
              <span className="text-sm">{category.emoji}</span>
              <p className="text-xs font-medium tracking-wider uppercase text-tertiary">
                {category.label}
              </p>
            </div>

            {/* Horizontal scrolling cards */}
            <div className="flex gap-2.5 overflow-x-auto px-5 pb-2 scrollbar-hide">
              {category.ideas.map((idea) => {
                const isSelected = selectedIdea?.name === idea.name;
                return (
                  <button
                    key={idea.name}
                    onClick={() => setSelectedIdea(isSelected ? null : idea)}
                    className={`flex-shrink-0 w-[120px] rounded-xl border p-3 text-left transition-all duration-200 ${
                      isSelected
                        ? "bg-amber/5 border-amber/40 shadow-soft ring-1 ring-amber/20"
                        : "bg-highlight/60 border-divider hover:border-divider hover:shadow-soft"
                    }`}
                  >
                    <span className="text-xl block mb-1.5">{idea.emoji}</span>
                    <p className="text-xs font-semibold text-ink leading-tight mb-1 line-clamp-2">
                      {idea.name}
                    </p>
                    <p className="text-xs font-semibold text-amber mb-0.5">
                      {idea.cost}
                    </p>
                    <p className="text-xs text-emerald-600 font-medium">
                      {idea.valueAdd}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* ── Selected idea detail panel ────────────────────────────────────── */}
      {selectedIdea && (
        <div className="mx-5 mb-4 p-4 bg-gradient-to-br from-amber/5 to-transparent border border-amber/15 rounded-xl">
          <div className="flex items-start gap-3">
            <span className="text-2xl">{selectedIdea.emoji}</span>
            <div className="min-w-0 flex-1">
              <p className="text-caption font-medium text-ink">{selectedIdea.name}</p>
              <p className="text-xs text-secondary mt-1 leading-relaxed">
                {selectedIdea.description}
              </p>
              <div className="flex items-center gap-3 mt-2">
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-ink bg-ink/5 px-2 py-0.5 rounded-full">
                  <svg className="w-2.5 h-2.5 text-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Est. cost: {selectedIdea.cost}
                </span>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-500/8 px-2 py-0.5 rounded-full">
                  <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
                  </svg>
                  {selectedIdea.valueAdd}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Photo Selector Thumbnails ─────────────────────────────────────── */}
      {photos.length > 1 && (
        <div className="px-5 pb-3">
          <p className="text-xs font-medium tracking-wider uppercase text-tertiary mb-2">
            Select a photo
          </p>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {photos.map((photo, index) => (
              <button
                key={index}
                onClick={() => {
                  setSelectedPhotoIndex(index);
                  setShowComparison(false);
                }}
                className={`relative flex-shrink-0 w-16 h-12 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                  selectedPhotoIndex === index
                    ? "border-amber shadow-soft ring-1 ring-amber/20"
                    : "border-divider hover:border-ink/30 opacity-70 hover:opacity-100"
                }`}
              >
                <img
                  src={photo}
                  alt={`Photo ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                {selectedPhotoIndex === index && (
                  <div className="absolute inset-0 ring-1 ring-inset ring-amber/30 rounded-[6px]" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Image Preview Area ────────────────────────────────────────────── */}
      <div className="relative">
        <div
          ref={sliderRef}
          className="relative w-full aspect-[16/10] bg-highlight overflow-hidden select-none"
          onMouseMove={handleMouseMove}
          onTouchMove={handleTouchMove}
          onMouseUp={() => setIsDragging(false)}
          onMouseLeave={() => setIsDragging(false)}
          onTouchEnd={() => setIsDragging(false)}
        >
          {/* Base / Original image */}
          <div className="absolute inset-0">
            {currentPhoto ? (
              <img
                src={currentPhoto}
                alt={`${address} - Photo ${selectedPhotoIndex + 1}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-highlight">
                <div className="text-center">
                  <svg className="w-12 h-12 text-tertiary mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
                  </svg>
                  <p className="text-caption text-tertiary">No photo available</p>
                </div>
              </div>
            )}
          </div>

          {/* Styled overlay */}
          {selectedStyle && currentPhoto && (
            <div
              className="absolute inset-0"
              style={{
                clipPath: showComparison
                  ? `inset(0 ${100 - sliderPos}% 0 0)`
                  : "inset(0)",
              }}
            >
              <img
                src={currentPhoto}
                alt={`${address} - ${selectedStyle} style preview`}
                className="w-full h-full object-cover"
                style={{ filter: STYLE_FILTERS[selectedStyle] }}
              />
              <div
                className={`absolute inset-0 bg-gradient-to-br ${STYLE_OVERLAYS[selectedStyle]}`}
              />
              {!showComparison && (
                <div className="absolute top-3 right-3 bg-ink/70 backdrop-blur-sm text-white text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1.5">
                  <svg className="w-3 h-3 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
                  </svg>
                  {selectedStyle} Filter
                </div>
              )}
            </div>
          )}

          {/* Before/After comparison slider */}
          {showComparison && selectedStyle && (
            <>
              <div
                className="absolute top-0 bottom-0 w-[3px] bg-white shadow-lg cursor-ew-resize z-10"
                style={{ left: `${sliderPos}%`, transform: "translateX(-50%)" }}
                onMouseDown={() => setIsDragging(true)}
                onTouchStart={() => setIsDragging(true)}
              >
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-9 h-9 bg-white rounded-full shadow-hover flex items-center justify-center cursor-ew-resize">
                  <svg className="w-4 h-4 text-ink" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                  </svg>
                </div>
              </div>
              <div className="absolute top-3 left-3 bg-ink/70 backdrop-blur-sm text-white text-xs font-semibold px-2.5 py-1 rounded-full z-[5]">
                Original
              </div>
              <div className="absolute top-3 right-3 bg-amber/90 backdrop-blur-sm text-white text-xs font-semibold px-2.5 py-1 rounded-full z-[5]">
                {selectedStyle} Filter
              </div>
            </>
          )}

          {/* Empty state prompt */}
          {!selectedStyle && currentPhoto && (
            <div className="absolute inset-0 bg-gradient-to-t from-ink/30 via-transparent to-transparent flex items-end justify-center pb-6 pointer-events-none">
              <p className="text-white/90 text-sm font-medium bg-ink/40 backdrop-blur-sm px-4 py-2 rounded-full">
                Apply a style filter below to preview a new look
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Style description + compare toggle */}
      {selectedStyle && (
        <div className="px-5 py-3 border-t border-divider bg-highlight/50 flex items-center justify-between">
          <div>
            <p className="text-caption font-medium text-ink">
              Style Preview (visual filter)
            </p>
            <p className="text-xs text-tertiary">
              {STYLE_DESCRIPTIONS[selectedStyle]}
            </p>
          </div>
          <button
            onClick={toggleComparison}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full border transition-all duration-200 ${
              showComparison
                ? "bg-ink text-bg border-ink"
                : "bg-surface text-secondary border-divider hover:border-ink/30 hover:text-ink"
            }`}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
            </svg>
            {showComparison ? "Hide Compare" : "Compare"}
          </button>
        </div>
      )}

      {/* ── Style Filter Section (secondary) ──────────────────────────────── */}
      <div className="px-5 py-4 border-t border-divider">
        <p className="text-xs font-medium tracking-wider uppercase text-tertiary mb-3">
          Style filters
        </p>
        <div className="flex flex-wrap gap-2">
          {STYLES.map((style) => {
            const isActive = selectedStyle === style;
            return (
              <button
                key={style}
                onClick={() => handleStyleSelect(style)}
                className={`px-4 py-2 text-caption font-medium rounded-full border transition-all duration-200 ${
                  isActive
                    ? "bg-ink text-bg border-ink shadow-soft"
                    : "bg-surface text-secondary border-divider hover:border-ink/30 hover:text-ink"
                }`}
              >
                {style}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Footer actions ────────────────────────────────────────────────── */}
      <div className="px-5 pb-5 flex items-center justify-between border-t border-divider pt-4">
        <p className="text-xs text-tertiary truncate mr-3">
          {address}
        </p>
        <button
          className="flex items-center gap-1.5 px-4 py-2 text-caption font-semibold text-white rounded-button transition-all hover:opacity-90 active:scale-[0.98] flex-shrink-0"
          style={{ backgroundColor: "#D4763C" }}
          onClick={handleShare}
        >
          {copied ? (
            <>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
              Copied!
            </>
          ) : (
            <>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
              </svg>
              Share Photo
            </>
          )}
        </button>
      </div>
    </div>
  );
}
