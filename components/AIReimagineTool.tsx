"use client";

import { useState, useEffect, useCallback } from "react";

interface AIReimagineToolProps {
  photos: string[];
  address: string;
}

const TABS = ["Exterior", "Interior", "Backyard", "Before & After"] as const;
type Tab = (typeof TABS)[number];

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

export default function AIReimagineTool({ photos, address }: AIReimagineToolProps) {
  const [activeTab, setActiveTab] = useState<Tab>("Exterior");
  const [selectedStyle, setSelectedStyle] = useState<Style | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [sliderPos, setSliderPos] = useState(50);
  const [isDragging, setIsDragging] = useState(false);

  const currentPhoto = photos[TABS.indexOf(activeTab) % photos.length] || photos[0];

  // Simulated generation
  useEffect(() => {
    if (!isGenerating) return;
    setProgress(0);
    setRevealed(false);

    const duration = 2400;
    const interval = 40;
    let elapsed = 0;

    const timer = setInterval(() => {
      elapsed += interval;
      const p = Math.min((elapsed / duration) * 100, 100);
      // Ease-out curve for more natural feel
      setProgress(100 * (1 - Math.pow(1 - p / 100, 3)));

      if (elapsed >= duration) {
        clearInterval(timer);
        setIsGenerating(false);
        setRevealed(true);
        setSliderPos(50);
      }
    }, interval);

    return () => clearInterval(timer);
  }, [isGenerating]);

  function handleStyleSelect(style: Style) {
    if (selectedStyle === style && revealed) {
      // Deselect
      setSelectedStyle(null);
      setRevealed(false);
      return;
    }
    setSelectedStyle(style);
    setIsGenerating(true);
  }

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!isDragging) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      setSliderPos(Math.max(2, Math.min(98, x)));
    },
    [isDragging]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent<HTMLDivElement>) => {
      if (!isDragging) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const x = ((e.touches[0].clientX - rect.left) / rect.width) * 100;
      setSliderPos(Math.max(2, Math.min(98, x)));
    },
    [isDragging]
  );

  const isBeforeAfter = activeTab === "Before & After";

  return (
    <div className="bg-surface rounded-card border border-divider shadow-soft overflow-hidden">
      {/* Header */}
      <div className="px-5 pt-5 pb-3">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-amber to-amber/60 flex items-center justify-center">
            <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
            </svg>
          </div>
          <h3 className="font-display text-title text-ink tracking-tight">AI Reimagine</h3>
          <span className="ml-auto text-[10px] font-semibold tracking-wider uppercase text-amber bg-amber/8 px-2 py-0.5 rounded-full">
            Beta
          </span>
        </div>
        <p className="text-caption text-secondary ml-8">
          See this property in a completely different style
        </p>
      </div>

      {/* Tabs */}
      <div className="px-5 flex gap-1 border-b border-divider">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);
              setRevealed(false);
              setSelectedStyle(null);
              setIsGenerating(false);
            }}
            className={`px-3 py-2.5 text-caption font-medium transition-colors relative ${
              activeTab === tab
                ? "text-ink"
                : "text-tertiary hover:text-secondary"
            }`}
          >
            {tab}
            {activeTab === tab && (
              <span className="absolute bottom-0 left-1 right-1 h-[2px] bg-ink rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* Image Area */}
      <div className="relative">
        <div
          className="relative w-full aspect-[16/10] bg-highlight overflow-hidden select-none"
          onMouseMove={handleMouseMove}
          onTouchMove={handleTouchMove}
          onMouseUp={() => setIsDragging(false)}
          onMouseLeave={() => setIsDragging(false)}
          onTouchEnd={() => setIsDragging(false)}
        >
          {/* Base / "Before" image */}
          <div className="absolute inset-0">
            {currentPhoto ? (
              <img
                src={currentPhoto}
                alt={`${address} - ${activeTab}`}
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

          {/* "After" / Reimagined overlay */}
          {revealed && selectedStyle && currentPhoto && (
            <div
              className="absolute inset-0"
              style={{
                clipPath: isBeforeAfter
                  ? `inset(0 ${100 - sliderPos}% 0 0)`
                  : "inset(0)",
              }}
            >
              <img
                src={currentPhoto}
                alt={`${address} - ${selectedStyle} style`}
                className="w-full h-full object-cover"
                style={{ filter: STYLE_FILTERS[selectedStyle] }}
              />
              {/* Style tint overlay */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${STYLE_OVERLAYS[selectedStyle]}`}
              />
              {/* Style label */}
              {!isBeforeAfter && (
                <div className="absolute top-3 right-3 bg-ink/70 backdrop-blur-sm text-white text-[11px] font-semibold px-2.5 py-1 rounded-full">
                  {selectedStyle} Vision
                </div>
              )}
            </div>
          )}

          {/* Before/After slider handle */}
          {revealed && isBeforeAfter && (
            <>
              <div
                className="absolute top-0 bottom-0 w-[3px] bg-white shadow-lg cursor-ew-resize z-10"
                style={{ left: `${sliderPos}%`, transform: "translateX(-50%)" }}
                onMouseDown={() => setIsDragging(true)}
                onTouchStart={() => setIsDragging(true)}
              >
                {/* Handle knob */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-9 h-9 bg-white rounded-full shadow-hover flex items-center justify-center cursor-ew-resize">
                  <svg className="w-4 h-4 text-ink" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                  </svg>
                </div>
              </div>
              {/* Labels */}
              <div className="absolute top-3 left-3 bg-ink/70 backdrop-blur-sm text-white text-[11px] font-semibold px-2.5 py-1 rounded-full z-[5]">
                Original
              </div>
              <div className="absolute top-3 right-3 bg-amber/90 backdrop-blur-sm text-white text-[11px] font-semibold px-2.5 py-1 rounded-full z-[5]">
                {selectedStyle}
              </div>
            </>
          )}

          {/* Generation overlay */}
          {isGenerating && (
            <div className="absolute inset-0 bg-ink/60 backdrop-blur-sm flex flex-col items-center justify-center z-20">
              <div className="relative w-12 h-12 mb-4">
                <div className="absolute inset-0 rounded-full border-2 border-white/20" />
                <div
                  className="absolute inset-0 rounded-full border-2 border-t-amber border-r-transparent border-b-transparent border-l-transparent animate-spin"
                />
                <svg className="absolute inset-0 m-auto w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                </svg>
              </div>
              <p className="text-white text-sm font-semibold mb-3">AI is reimagining...</p>
              <div className="w-48 h-1.5 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber to-amber/80 rounded-full transition-all duration-100"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-white/60 text-[11px] mt-2">
                Applying {selectedStyle} style to {activeTab.toLowerCase()}
              </p>
            </div>
          )}

          {/* Empty state prompt */}
          {!isGenerating && !revealed && currentPhoto && (
            <div className="absolute inset-0 bg-gradient-to-t from-ink/30 via-transparent to-transparent flex items-end justify-center pb-6 pointer-events-none">
              <p className="text-white/90 text-sm font-medium bg-ink/40 backdrop-blur-sm px-4 py-2 rounded-full">
                Select a style below to reimagine this space
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Style Pills */}
      <div className="px-5 py-4 border-t border-divider">
        <p className="text-[11px] font-semibold tracking-wider uppercase text-tertiary mb-3">
          Choose a style
        </p>
        <div className="flex flex-wrap gap-2">
          {STYLES.map((style) => {
            const isActive = selectedStyle === style && (revealed || isGenerating);
            return (
              <button
                key={style}
                onClick={() => handleStyleSelect(style)}
                disabled={isGenerating}
                className={`px-4 py-2 text-caption font-medium rounded-full border transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                  isActive
                    ? "bg-ink text-white border-ink shadow-soft"
                    : "bg-surface text-secondary border-divider hover:border-ink/30 hover:text-ink"
                }`}
              >
                {style}
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer actions */}
      <div className="px-5 pb-5 flex items-center justify-between">
        <p className="text-[11px] text-tertiary">
          {address}
        </p>
        <button
          className="flex items-center gap-1.5 px-4 py-2 text-caption font-semibold text-white rounded-button transition-all hover:opacity-90 active:scale-[0.98]"
          style={{ backgroundColor: "#D4763C" }}
          onClick={() => {
            /* Share stub */
          }}
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
          </svg>
          Share your vision
        </button>
      </div>
    </div>
  );
}
