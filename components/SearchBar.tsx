"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useCallback, useRef, useEffect } from "react";
import { requestGeolocation, getStoredLocation, trackEvent } from "@/lib/analytics-client";
import SaveSearchButton, { getSavedSearches, removeSavedSearch, type SavedSearch } from "./SaveSearchButton";

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
  const [minBaths, setMinBaths] = useState(sp.get("minBaths") ?? "");
  const [minSqft, setMinSqft] = useState(sp.get("minSqft") ?? "");
  const [maxSqft, setMaxSqft] = useState(sp.get("maxSqft") ?? "");
  const [showFilters, setShowFilters] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [locating, setLocating] = useState(false);
  const [geoResolved, setGeoResolved] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const hasActiveFilters = !!(type || propertyType || minPrice || maxPrice || minBeds || minBaths || minSqft || maxSqft);

  // Sync local state with URL params when they change (e.g. Buy/Rent pill clicks)
  useEffect(() => {
    setCity(sp.get("city") ?? "");
    setType(sp.get("type") ?? "");
    setPropertyType(sp.get("propertyType") ?? "");
    setMinPrice(sp.get("minPrice") ?? "");
    setMaxPrice(sp.get("maxPrice") ?? "");
    setMinBeds(sp.get("minBeds") ?? "");
    setMinBaths(sp.get("minBaths") ?? "");
    setMinSqft(sp.get("minSqft") ?? "");
    setMaxSqft(sp.get("maxSqft") ?? "");
  }, [sp]);

  useEffect(() => {
    setRecentSearches(getRecentSearches());
    setSavedSearches(getSavedSearches());
  }, []);

  useEffect(() => {
    if (showSuggestions) {
      setSavedSearches(getSavedSearches());
    }
  }, [showSuggestions]);

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
    if (minBaths) params.set("minBaths", minBaths);
    if (minSqft) params.set("minSqft", minSqft);
    if (maxSqft) params.set("maxSqft", maxSqft);
    trackEvent("search", { city: searchQuery, type, propertyType });
    router.push(`/?${params.toString()}`);
  }

  function runSavedSearch(s: SavedSearch) {
    setShowSuggestions(false);
    setCity(s.city);
    setType(s.type);
    setPropertyType(s.propertyType);
    setMinPrice(s.minPrice);
    setMaxPrice(s.maxPrice);
    setMinBeds(s.minBeds);
    setMinBaths(s.minBaths);
    setMinSqft(s.minSqft);
    setMaxSqft(s.maxSqft);
    const params = new URLSearchParams();
    if (s.city) params.set("city", s.city);
    if (s.type) params.set("type", s.type);
    if (s.propertyType) params.set("propertyType", s.propertyType);
    if (s.minPrice) params.set("minPrice", s.minPrice);
    if (s.maxPrice) params.set("maxPrice", s.maxPrice);
    if (s.minBeds) params.set("minBeds", s.minBeds);
    if (s.minBaths) params.set("minBaths", s.minBaths);
    if (s.minSqft) params.set("minSqft", s.minSqft);
    if (s.maxSqft) params.set("maxSqft", s.maxSqft);
    trackEvent("search", { city: s.city, type: s.type, propertyType: s.propertyType, source: "saved_search" });
    router.push(`/?${params.toString()}`);
  }

  function handleDeleteSavedSearch(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    removeSavedSearch(id);
    setSavedSearches(getSavedSearches());
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    doSearch(city);
  }

  function handleReset() {
    setCity(""); setType(""); setPropertyType(""); setMinPrice(""); setMaxPrice(""); setMinBeds(""); setMinBaths(""); setMinSqft(""); setMaxSqft("");
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
      const loc = await requestGeolocation();
      if (loc?.city) {
        setCity(loc.city);
        setGeoResolved(true);
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
        if (minBaths) params.set("minBaths", minBaths);
        if (minSqft) params.set("minSqft", minSqft);
        if (maxSqft) params.set("maxSqft", maxSqft);
        router.push(`/?${params.toString()}`);
      } else if (loc && !loc.city) {
        console.warn("[SearchBar] Got location but no city name, searching by coordinates");
        trackEvent("search", { type: "current_location_no_city", lat: loc.latitude, lng: loc.longitude });
        const params = new URLSearchParams();
        params.set("lat", String(loc.latitude));
        params.set("lng", String(loc.longitude));
        params.set("radius", "30");
        if (type) params.set("type", type);
        if (propertyType) params.set("propertyType", propertyType);
        if (minPrice) params.set("minPrice", minPrice);
        if (maxPrice) params.set("maxPrice", maxPrice);
        if (minBeds) params.set("minBeds", minBeds);
        if (minBaths) params.set("minBaths", minBaths);
        if (minSqft) params.set("minSqft", minSqft);
        if (maxSqft) params.set("maxSqft", maxSqft);
        router.push(`/?${params.toString()}`);
      } else {
        console.error("[SearchBar] Geolocation failed: no location returned");
        alert("Could not determine your location. Please allow location access in your browser settings, or search by city name.");
      }
    } catch (err) {
      console.error("[SearchBar] handleCurrentLocation error:", err);
      alert("Something went wrong finding your location. Please try searching by city name.");
    } finally {
      setLocating(false);
    }
  }, [type, propertyType, minPrice, maxPrice, minBeds, minBaths, minSqft, maxSqft, router]);

  const selectClass = "w-full rounded-button bg-bg border border-divider px-3 py-2 text-body text-ink focus:outline-none focus:border-tertiary/60 transition-colors";

  return (
    <form onSubmit={handleSubmit}>
      {/* Main search input */}
      <div className="relative search-input-wrapper">
        <svg className="search-icon absolute left-4 top-1/2 -translate-y-1/2 text-tertiary transition-colors duration-200" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.35-4.35" />
        </svg>
        <input
          ref={inputRef}
          type="text"
          value={city}
          onChange={(e) => { setCity(e.target.value); setShowSuggestions(true); setGeoResolved(false); }}
          onFocus={() => setShowSuggestions(true)}
          placeholder={locating ? "Finding your location..." : "Drop an address, neighborhood, or zip..."}
          className="w-full rounded-full bg-surface pl-11 pr-16 py-3 text-body text-ink placeholder:text-tertiary focus:outline-none transition-all duration-200"
          style={{ borderWidth: 0 }}
          autoComplete="off"
        />
        {/* ⌘K shortcut hint — hidden when focused/has value */}
        {!city && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[11px] font-medium text-tertiary/50 pointer-events-none select-none hidden sm:block">
            ⌘K
          </span>
        )}

        {/* Dropdown suggestions */}
        {showSuggestions && (
          <div
            ref={suggestionsRef}
            className="absolute top-full left-0 right-0 mt-2 bg-surface border border-divider rounded-card shadow-hover z-50 max-h-[400px] overflow-y-auto animate-fade-in"
          >
            {/* Current Location */}
            <button
              type="button"
              onClick={handleCurrentLocation}
              disabled={locating}
              className="w-full flex items-center gap-2.5 px-4 py-3 text-body text-left hover:bg-surface transition-colors disabled:opacity-50"
            >
              {locating ? (
                <div className="w-4 h-4 border-2 border-tertiary/30 border-t-ink rounded-full animate-spin shrink-0" />
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-secondary shrink-0">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
                  <circle cx="12" cy="12" r="8" />
                </svg>
              )}
              <span className={`font-medium ${locating ? "text-tertiary" : "text-ink"}`}>
                {locating ? "Finding your location..." : "Use Current Location"}
              </span>
            </button>

            {/* Recent searches */}
            {filteredRecent.length > 0 && (
              <>
                <div className="px-4 pt-2.5 pb-1 border-t border-divider">
                  <p className="text-caption text-tertiary">Recent</p>
                </div>
                {filteredRecent.map((s) => (
                  <button
                    key={`recent-${s}`}
                    type="button"
                    onClick={() => { setCity(s); doSearch(s); }}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-body text-left hover:bg-surface transition-colors group"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-tertiary shrink-0">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 6v6l4 2" />
                    </svg>
                    <span className="text-ink flex-1">{s}</span>
                    <span
                      onClick={(e) => handleDeleteRecent(s, e)}
                      className="text-tertiary hover:text-ink opacity-0 group-hover:opacity-100 transition-opacity p-1"
                      role="button"
                      tabIndex={-1}
                    >
                      &times;
                    </span>
                  </button>
                ))}
              </>
            )}

            {/* Saved searches */}
            {savedSearches.length > 0 && (
              <>
                <div className="px-4 pt-2.5 pb-1 border-t border-divider">
                  <p className="text-caption text-tertiary">Saved Searches</p>
                </div>
                {savedSearches.map((s) => (
                  <button
                    key={`saved-${s.id}`}
                    type="button"
                    onClick={() => runSavedSearch(s)}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-body text-left hover:bg-surface transition-colors group"
                  >
                    <span className="text-tertiary shrink-0 text-caption">saved</span>
                    <span className="text-ink flex-1 truncate">{s.label}</span>
                    <span
                      onClick={(e) => handleDeleteSavedSearch(s.id, e)}
                      className="text-tertiary hover:text-ink opacity-0 group-hover:opacity-100 transition-opacity p-1"
                      role="button"
                      tabIndex={-1}
                    >
                      &times;
                    </span>
                  </button>
                ))}
              </>
            )}

            {/* Popular cities */}
            <div className="px-4 pt-2.5 pb-1 border-t border-divider">
              <p className="text-caption text-tertiary">
                {query ? "Matching Cities" : "Popular Cities"}
              </p>
            </div>
            {filteredCities.slice(0, 8).map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => { const name = c.split(",")[0].trim(); setCity(name); doSearch(name); }}
                className="w-full flex items-center gap-2.5 px-4 py-2 text-body text-left hover:bg-surface transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-tertiary shrink-0">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <span className="text-ink">{c}</span>
              </button>
            ))}

            {query && filteredCities.length === 0 && (
              <div className="px-4 py-3 text-body text-tertiary border-t border-divider">
                Press Enter to search &ldquo;{city}&rdquo;
              </div>
            )}
          </div>
        )}
      </div>

      {/* Filters link */}
      <div className="flex items-center gap-3 mt-2">
        {/* Filter chips for Buy/Rent/All — navigate immediately on click */}
        <div className="flex items-center gap-1.5">
          {[
            { key: "", label: "All" },
            { key: "sale", label: "Buy" },
            { key: "rent", label: "Rent" },
          ].map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => {
                setType(t.key);
                // Navigate immediately — don't wait for form submit
                const params = new URLSearchParams();
                if (city.trim()) params.set("city", city.trim());
                if (t.key) params.set("type", t.key);
                if (propertyType) params.set("propertyType", propertyType);
                if (minPrice) params.set("minPrice", minPrice);
                if (maxPrice) params.set("maxPrice", maxPrice);
                if (minBeds) params.set("minBeds", minBeds);
                if (minBaths) params.set("minBaths", minBaths);
                if (minSqft) params.set("minSqft", minSqft);
                if (maxSqft) params.set("maxSqft", maxSqft);
                // Preserve existing sort if any
                const currentSort = sp.get("sort");
                if (currentSort) params.set("sort", currentSort);
                router.push(`/?${params.toString()}`);
              }}
              className={`px-3 py-1 rounded-full text-caption transition-colors ${
                type === t.key
                  ? "bg-ink text-white"
                  : "bg-surface text-ink hover:bg-active"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setShowFilters(!showFilters)}
          className="text-caption text-tertiary hover:text-ink transition-colors ml-auto"
        >
          {showFilters ? "Hide filters" : "Filters"}
          {hasActiveFilters && " \u00b7"}
        </button>
      </div>

      {/* Expandable filters */}
      {showFilters && (
        <div className="mt-3 p-4 bg-surface border border-divider rounded-card animate-fade-in">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-caption text-secondary mb-1">Home Type</label>
              <select value={propertyType} onChange={(e) => setPropertyType(e.target.value)} className={selectClass}>
                <option value="">Any</option>
                <option value="house">House</option>
                <option value="condo">Condo</option>
                <option value="townhouse">Townhouse</option>
                <option value="apartment">Apartment</option>
              </select>
            </div>
            <div>
              <label className="block text-caption text-secondary mb-1">Beds</label>
              <select value={minBeds} onChange={(e) => setMinBeds(e.target.value)} className={selectClass}>
                <option value="">Any</option>
                {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}+</option>)}
              </select>
            </div>
            <div>
              <label className="block text-caption text-secondary mb-1">Baths</label>
              <select value={minBaths} onChange={(e) => setMinBaths(e.target.value)} className={selectClass}>
                <option value="">Any</option>
                {[1, 2, 3, 4].map((n) => <option key={n} value={n}>{n}+</option>)}
              </select>
            </div>
            <div>
              <label className="block text-caption text-secondary mb-1">Min Price</label>
              <select value={minPrice} onChange={(e) => setMinPrice(e.target.value)} className={selectClass}>
                <option value="">No Min</option>
                <option value="50000">$50k</option>
                <option value="100000">$100k</option>
                <option value="200000">$200k</option>
                <option value="300000">$300k</option>
                <option value="500000">$500k</option>
                <option value="750000">$750k</option>
                <option value="1000000">$1M</option>
                <option value="1500000">$1.5M</option>
                <option value="2000000">$2M</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
            <div>
              <label className="block text-caption text-secondary mb-1">Max Price</label>
              <select value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} className={selectClass}>
                <option value="">No Max</option>
                <option value="100000">$100k</option>
                <option value="200000">$200k</option>
                <option value="300000">$300k</option>
                <option value="500000">$500k</option>
                <option value="750000">$750k</option>
                <option value="1000000">$1M</option>
                <option value="1500000">$1.5M</option>
                <option value="2000000">$2M</option>
                <option value="5000000">$5M</option>
              </select>
            </div>
            <div>
              <label className="block text-caption text-secondary mb-1">Min Sqft</label>
              <select value={minSqft} onChange={(e) => setMinSqft(e.target.value)} className={selectClass}>
                <option value="">Any</option>
                <option value="500">500+</option>
                <option value="750">750+</option>
                <option value="1000">1,000+</option>
                <option value="1500">1,500+</option>
                <option value="2000">2,000+</option>
                <option value="3000">3,000+</option>
                <option value="5000">5,000+</option>
              </select>
            </div>
            <div>
              <label className="block text-caption text-secondary mb-1">Max Sqft</label>
              <select value={maxSqft} onChange={(e) => setMaxSqft(e.target.value)} className={selectClass}>
                <option value="">Any</option>
                <option value="1000">1,000</option>
                <option value="1500">1,500</option>
                <option value="2000">2,000</option>
                <option value="3000">3,000</option>
                <option value="5000">5,000</option>
                <option value="10000">10,000</option>
              </select>
            </div>
          </div>
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-divider">
            <button
              type="button"
              onClick={handleReset}
              className="text-caption text-tertiary hover:text-ink transition-colors"
            >
              Clear all
            </button>
            <button
              type="submit"
              className="text-caption font-medium text-ink hover:text-secondary transition-colors"
            >
              Apply filters
            </button>
          </div>
        </div>
      )}
    </form>
  );
}
