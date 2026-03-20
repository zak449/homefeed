"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useCallback, useRef, useEffect } from "react";
import { requestGeolocation, getStoredLocation, trackEvent } from "@/lib/analytics-client";

const POPULAR_CITIES = [
  "Los Angeles, CA",
  "New York, NY",
  "Miami, FL",
  "Austin, TX",
  "Chicago, IL",
  "Nashville, TN",
  "Denver, CO",
  "Seattle, WA",
  "San Francisco, CA",
  "Atlanta, GA",
  "Portland, OR",
  "Boston, MA",
  "Dallas, TX",
  "Scottsdale, AZ",
  "Savannah, GA",
];

// Recent searches stored in localStorage
function getRecentSearches(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem("hf_recent_searches") || "[]");
  } catch { return []; }
}

function addRecentSearch(query: string) {
  if (typeof window === "undefined" || !query.trim()) return;
  const recent = getRecentSearches().filter((s) => s !== query);
  recent.unshift(query);
  localStorage.setItem("hf_recent_searches", JSON.stringify(recent.slice(0, 8)));
}

function removeRecentSearch(query: string) {
  if (typeof window === "undefined") return;
  const recent = getRecentSearches().filter((s) => s !== query);
  localStorage.setItem("hf_recent_searches", JSON.stringify(recent));
}

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
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [locating, setLocating] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const hasActiveFilters = !!(type || propertyType || minPrice || maxPrice || minBeds);

  // Load recent searches on mount
  useEffect(() => {
    setRecentSearches(getRecentSearches());
  }, []);

  // Close suggestions when clicking outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Filter cities based on input
  const query = city.trim().toLowerCase();
  const filteredCities = query
    ? POPULAR_CITIES.filter((c) => c.toLowerCase().includes(query))
    : POPULAR_CITIES;
  const filteredRecent = query
    ? recentSearches.filter((s) => s.toLowerCase().includes(query))
    : recentSearches;

  function doSearch(searchQuery: string) {
    setShowSuggestions(false);
    if (searchQuery.trim()) {
      addRecentSearch(searchQuery.trim());
      setRecentSearches(getRecentSearches());
    }
    const params = new URLSearchParams();
    if (searchQuery) params.set("city", searchQuery);
    if (type) params.set("type", type);
    if (propertyType) params.set("propertyType", propertyType);
    if (minPrice) params.set("minPrice", minPrice);
    if (maxPrice) params.set("maxPrice", maxPrice);
    if (minBeds) params.set("minBeds", minBeds);
    trackEvent("search", { city: searchQuery, type, propertyType });
    router.push(`/?${params.toString()}`);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    doSearch(city);
  }

  function handleReset() {
    setCity(""); setType(""); setPropertyType(""); setMinPrice(""); setMaxPrice(""); setMinBeds("");
    setShowSuggestions(false);
    router.push("/");
  }

  function handleDeleteRecent(search: string, e: React.MouseEvent) {
    e.stopPropagation();
    removeRecentSearch(search);
    setRecentSearches(getRecentSearches());
  }

  const handleCurrentLocation = useCallback(async () => {
    setLocating(true);
    setShowSuggestions(false);
    try {
      let loc = getStoredLocation();
      if (!loc) {
        loc = await requestGeolocation();
      }
      if (loc?.city) {
        setCity(loc.city);
        addRecentSearch(loc.city);
        setRecentSearches(getRecentSearches());
        trackEvent("search", { type: "current_location", city: loc.city });
        const params = new URLSearchParams();
        params.set("city", loc.city);
        params.set("lat", String(loc.latitude));
        params.set("lng", String(loc.longitude));
        params.set("radius", "30");
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
            ref={inputRef}
            type="text"
            value={city}
            onChange={(e) => { setCity(e.target.value); setShowSuggestions(true); }}
            onFocus={() => setShowSuggestions(true)}
            placeholder="City, zip, neighborhood, or address..."
            className="w-full rounded-lg border border-border pl-9 pr-4 py-2.5 text-sm bg-white focus:outline-none focus:border-ink focus:ring-1 focus:ring-ink/10 transition-colors"
            autoComplete="off"
          />

          {/* Dropdown suggestions */}
          {showSuggestions && (
            <div
              ref={suggestionsRef}
              className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl border border-border shadow-modal z-50 max-h-[400px] overflow-y-auto animate-fade-in"
            >
              {/* Current Location — always first */}
              <button
                type="button"
                onClick={handleCurrentLocation}
                disabled={locating}
                className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-left hover:bg-tag transition-colors border-b border-border disabled:opacity-50"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-accent shrink-0">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
                  <circle cx="12" cy="12" r="8" />
                </svg>
                <span className="font-semibold text-ink">
                  {locating ? "Finding your location..." : "Current Location"}
                </span>
              </button>

              {/* Recent searches */}
              {filteredRecent.length > 0 && (
                <>
                  <div className="px-4 pt-2.5 pb-1">
                    <p className="text-[10px] font-semibold text-muted uppercase tracking-widest">Recent</p>
                  </div>
                  {filteredRecent.map((s) => (
                    <button
                      key={`recent-${s}`}
                      type="button"
                      onClick={() => { setCity(s); doSearch(s); }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-left hover:bg-tag transition-colors group"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-muted shrink-0">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M12 6v6l4 2" />
                      </svg>
                      <span className="text-ink flex-1">{s}</span>
                      <span
                        onClick={(e) => handleDeleteRecent(s, e)}
                        className="text-muted/40 hover:text-accent opacity-0 group-hover:opacity-100 transition-opacity p-1"
                        role="button"
                        tabIndex={-1}
                      >
                        ✕
                      </span>
                    </button>
                  ))}
                </>
              )}

              {/* Popular cities */}
              <div className="px-4 pt-2.5 pb-1 border-t border-border">
                <p className="text-[10px] font-semibold text-muted uppercase tracking-widest">
                  {query ? "Matching Cities" : "Popular Cities"}
                </p>
              </div>
              {filteredCities.slice(0, 8).map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => { const name = c.split(",")[0].trim(); setCity(name); doSearch(name); }}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-left hover:bg-tag transition-colors"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-muted shrink-0">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  <span className="text-ink">{c}</span>
                </button>
              ))}

              {query && filteredCities.length === 0 && (
                <div className="px-4 py-3 text-sm text-muted border-t border-border">
                  Press Enter to search &ldquo;{city}&rdquo;
                </div>
              )}
            </div>
          )}
        </div>
        <button
          type="submit"
          className="px-5 py-2.5 bg-ink text-white text-sm font-semibold rounded-lg hover:bg-ink/90 transition-colors shrink-0"
        >
          Search
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
