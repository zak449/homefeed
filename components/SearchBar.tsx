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

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-sm border border-gray-100 p-5">
      <div className="flex flex-wrap gap-3 items-end">
        {/* City / Zip search */}
        <div className="flex-1 min-w-[160px]">
          <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">City or Zip</label>
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Los Angeles, 90026…"
            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-coral/50 bg-cream"
          />
        </div>

        {/* Sale vs Rent */}
        <div className="min-w-[120px]">
          <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Type</label>
          <select value={type} onChange={(e) => setType(e.target.value)} className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm bg-cream focus:outline-none focus:ring-2 focus:ring-coral/50">
            <option value="">For Sale or Rent</option>
            <option value="sale">For Sale</option>
            <option value="rent">For Rent</option>
          </select>
        </div>

        {/* Property type */}
        <div className="min-w-[130px]">
          <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Home type</label>
          <select value={propertyType} onChange={(e) => setPropertyType(e.target.value)} className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm bg-cream focus:outline-none focus:ring-2 focus:ring-coral/50">
            <option value="">Any type</option>
            <option value="house">House</option>
            <option value="condo">Condo</option>
            <option value="townhouse">Townhouse</option>
            <option value="apartment">Apartment</option>
          </select>
        </div>

        {/* Price range */}
        <div className="min-w-[100px]">
          <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Min price</label>
          <input type="number" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} placeholder="$0" className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm bg-cream focus:outline-none focus:ring-2 focus:ring-coral/50" />
        </div>
        <div className="min-w-[100px]">
          <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Max price</label>
          <input type="number" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} placeholder="Any" className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm bg-cream focus:outline-none focus:ring-2 focus:ring-coral/50" />
        </div>

        {/* Min beds */}
        <div className="min-w-[80px]">
          <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Min beds</label>
          <select value={minBeds} onChange={(e) => setMinBeds(e.target.value)} className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm bg-cream focus:outline-none focus:ring-2 focus:ring-coral/50">
            <option value="">Any</option>
            {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}+</option>)}
          </select>
        </div>

        {/* Buttons */}
        <div className="flex gap-2">
          <button type="submit" className="bg-coral text-white font-bold px-6 py-2.5 rounded-xl hover:bg-coral/90 transition-colors text-sm">
            Search
          </button>
          <button type="button" onClick={handleReset} className="text-gray-400 hover:text-gray-700 text-sm px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors">
            Clear
          </button>
        </div>
      </div>
    </form>
  );
}
