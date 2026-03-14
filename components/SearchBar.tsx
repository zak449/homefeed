"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function SearchBar() {
  const router = useRouter();
  const sp = useSearchParams();

  const [city, setCity] = useState(sp.get("city") ?? "");
  const [type, setType] = useState(sp.get("type") ?? "");
  const [propertyType, setPropertyType] = useState(sp.get("propertyType") ?? "");
  const [minPrice, setMinPrice] = useState(sp.get("minPrice") ?? "");
  const [maxPrice, setMaxPrice] = useState(sp.get("maxPrice") ?? "");
  const [minBeds, setMinBeds] = useState(sp.get("minBeds") ?? "");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (city) params.set("city", city);
    if (type) params.set("type", type);
    if (propertyType) params.set("propertyType", propertyType);
    if (minPrice) params.set("minPrice", minPrice);
    if (maxPrice) params.set("maxPrice", maxPrice);
    if (minBeds) params.set("minBeds", minBeds);
    router.push(`/?${params.toString()}`);
  }

  function handleReset() {
    setCity(""); setType(""); setPropertyType(""); setMinPrice(""); setMaxPrice(""); setMinBeds("");
    router.push("/");
  }

  const inputClass = "w-full rounded-xl border-2 border-ink px-4 py-2.5 text-sm font-medium bg-white focus:outline-none focus:border-coral focus:ring-2 focus:ring-coral/30";

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border-3 border-ink p-5 shadow-brute">
      <div className="flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-[160px]">
          <label className="block font-display text-xs uppercase tracking-wider text-ink mb-1.5">City or Zip</label>
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Los Angeles, 90026…"
            className={inputClass}
          />
        </div>

        <div className="min-w-[120px]">
          <label className="block font-display text-xs uppercase tracking-wider text-ink mb-1.5">Type</label>
          <select value={type} onChange={(e) => setType(e.target.value)} className={inputClass}>
            <option value="">For Sale or Rent</option>
            <option value="sale">For Sale</option>
            <option value="rent">For Rent</option>
          </select>
        </div>

        <div className="min-w-[130px]">
          <label className="block font-display text-xs uppercase tracking-wider text-ink mb-1.5">Home Type</label>
          <select value={propertyType} onChange={(e) => setPropertyType(e.target.value)} className={inputClass}>
            <option value="">Any type</option>
            <option value="house">House</option>
            <option value="condo">Condo</option>
            <option value="townhouse">Townhouse</option>
            <option value="apartment">Apartment</option>
          </select>
        </div>

        <div className="min-w-[100px]">
          <label className="block font-display text-xs uppercase tracking-wider text-ink mb-1.5">Min Price</label>
          <input type="number" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} placeholder="$0" className={inputClass} />
        </div>

        <div className="min-w-[100px]">
          <label className="block font-display text-xs uppercase tracking-wider text-ink mb-1.5">Max Price</label>
          <input type="number" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} placeholder="Any" className={inputClass} />
        </div>

        <div className="min-w-[80px]">
          <label className="block font-display text-xs uppercase tracking-wider text-ink mb-1.5">Min Beds</label>
          <select value={minBeds} onChange={(e) => setMinBeds(e.target.value)} className={inputClass}>
            <option value="">Any</option>
            {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}+</option>)}
          </select>
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            className="font-display text-sm uppercase bg-coral text-white border-2 border-ink px-6 py-2.5 rounded-xl hover:bg-goldenrod hover:text-ink transition-colors shadow-brute-sm"
          >
            Search
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="text-sm font-bold text-ink/40 hover:text-ink px-3 py-2.5 rounded-xl hover:bg-ink/5 transition-colors"
          >
            Clear
          </button>
        </div>
      </div>
    </form>
  );
}
