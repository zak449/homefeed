"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function JoinNeighborhood() {
  const [zip, setZip] = useState("");
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (/^\d{5}$/.test(zip)) {
      router.push(`/?zip=${zip}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-3 max-w-sm mx-auto">
      <input
        type="text"
        inputMode="numeric"
        maxLength={5}
        value={zip}
        onChange={(e) => setZip(e.target.value.replace(/\D/g, ""))}
        placeholder="Enter zip code"
        className="flex-1 bg-white/10 border border-white/10 text-white placeholder:text-white/30 text-sm font-medium px-4 py-3 rounded-xl outline-none focus:border-amber/50 focus:ring-2 focus:ring-amber/20 transition-all"
      />
      <button
        type="submit"
        disabled={!/^\d{5}$/.test(zip)}
        className="shrink-0 bg-amber text-white text-sm font-bold px-6 py-3 rounded-xl hover:bg-amber/90 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-glow-amber"
      >
        Go
      </button>
    </form>
  );
}
