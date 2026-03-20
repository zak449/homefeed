"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useCallback } from "react";
import { requestGeolocation, trackEvent } from "@/lib/analytics-client";

export default function SearchBar() {
  const router = useRouter();
  const sp = useSearchParams();

  const [city, setCity] = useState(sp.get("city") ?? "");
  const [type, setType] = useState(sp.get("type") ?? "");
  const [propertyType, setPropertyType] = useState(sp.get("propertyType") ?? "");
  const [minPrice, setMinPrice] = useState(sp.get("minPrice") ?? "");
  const [maxPrice, setMaxPrice] = useState(sp.get("maxPrice") ?? "");
  const [minBeds, setMinBeds] = useState(sp.get("minBeds") ?? "");
  const [showFilters, setShowFilters] = useState(false);
  const [locating, setLocating] = useState(false);

  const hasActiveFilters = !!(type || propertyType || minPrice || maxPrice || minBeds);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (city) params.set("city", city);
    if (type) params.set("type", type);
    if (propertyType) params.set("propertyType", propertyType);
    if (minPrice) params.set("minPrice", minPrice);
    if (maxPrice) params.set("maxPrice", maxPrice);
    if (minBeds) params.set("minBeds", minBeds);

    // Track search event
    trackEvent("search", { city, type, propertyType, minPrice, maxPrice, minBeds });

    router.push(`/?${params.toString()}`);
  }

  function handleReset() {
    setCity(""); setType(""); setPropertyType(""); setMinPrice(""); setMaxPrice(""); setMinBeds("");
    router.push("/");
  }

  const handleNearMe = useCallback(async () => {
    setLocating(true);
    try {
      const loc = await requestGeolocation();
      if (loc?.city) {
        setCity(loc.city);
        trackEvent("search", { type: "near_me", city: loc.city, latitude: loc.latitude, longitude: loc.longitude });
        const params = new URLSearchParams();
        params.set("city", loc.city);
        params.set("lat", String(loc.latitude));
        params.set("lng", String(loc.longitude));
        params.set("radius", "25");
        if (type) params.set("type", type);
        if (propertyType) params.set("propertyType", propertyType);
        if (minPrice) params.set("minPrice", minPrice);
        if (maxPrice) params.set("maxPrice", maxPrice);
        if (minBeds) params.set("minBeds", minBeds);
        router.push(`/?${params.toString()}`);
      }
    } finally {
      setLocating(false);
    }
  }, [type, propertyType, minPrice, maxPrice, minBeds, router]);

  const inputClass = "w-full rounded-lg border border-border px-3 py-2 text-sm bg-white focus:outline-none focus:border-ink focus:ring-1 focus:ring-ink/10 transition-colors";

  return (
    <form onSubmit={handleSubmit}>
      {/* Main search row */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Search by city, zip, or neighborhood..."
            className="w-full rounded-lg border border-border pl-9 pr-4 py-2.5 text-sm bg-white focus:outline-none focus:border-ink focus:ring-1 focus:ring-ink/10 transition-colors"
          />
        </div>
        <button
          type="submit"
          className="px-5 py-2.5 bg-ink text-white text-sm font-semibold rounded-lg hover:bg-ink/90 transition-colors shrink-0"
        >
          Search
        </button>
        {/* Near Me button */}
        <button
          type="button"
          onClick={handleNearMe}
          disabled={locating}
          className="px-3 py-2.5 text-sm font-medium rounded-lg border border-border text-muted hover:text-ink hover:border-ink/30 transition-colors shrink-0 flex items-center gap-1.5 disabled:opacity-50"
          title="Search near your location"
        >
          {locating ? (
            <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3" />
              <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
              <circle cx="12" cy="12" r="8" />
            </svg>
          )}
          <span className="hidden sm:inline">{locating ? "Locating..." : "Near Me"}</span>
        </button>
        <button
          type="button"
          onClick={() => setShowFilters(!showFilters)}
          className={`px-3 py-2.5 text-sm font-medium rounded-lg border transition-colors shrink-0 flex items-center gap-1.5 ${
            hasActiveFilters
              ? "border-accent text-accent bg-red-50"
              : "border-border text-muted hover:text-ink hover:border-ink/30"
          }`}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />
          </svg>
          <span className="hidden sm:inline">Filters</span>
          {hasActiveFilters && (
            <span className="w-2 h-2 rounded-full bg-accent"></span>
          )}
        </button>
      </div>

      {/* Expandable filters */}
      {showFilters && (
        <div className="mt-3 p-4 bg-white rounded-xl border border-border shadow-card animate-fade-in">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div>
              <label className="block text-xs font-medium text-muted mb-1">Type</label>
              <select value={type} onChange={(e) => setType(e.target.value)} className={inputClass}>
                <option value="">Sale & Rent</option>
                <option value="sale">For Sale</option>
                <option value="rent">For Rent</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted mb-1">Home Type</label>
              <select value={propertyType} onChange={(e) => setPropertyType(e.target.value)} className={inputClass}>
                <option value="">Any</option>
                <option value="house">House</option>
                <option value="condo">Condo</option>
                <option value="townhouse">Townhouse</option>
                <option value="apartment">Apartment</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted mb-1">Min Price</label>
              <input type="number" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} placeholder="$0" className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted mb-1">Max Price</label>
              <input type="number" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} placeholder="Any" className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted mb-1">Beds</label>
              <select value={minBeds} onChange={(e) => setMinBeds(e.target.value)} className={inputClass}>
                <option value="">Any</option>
                {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}+</option>)}
              </select>
            </div>
          </div>
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
            <button
              type="button"
              onClick={handleReset}
              className="text-xs text-muted hover:text-ink font-medium transition-colors"
            >
              Clear all
            </button>
            <button
              type="submit"
              className="text-xs font-semibold text-ink hover:text-accent transition-colors"
            >
              Apply filters →
            </button>
          </div>
        </div>
      )}
    </form>
  );
}
