"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Neighborhood = {
  city: string;
  state: string;
  listingCount: number;
  commentCount: number;
  avgPrice: number;
  topReaction: string;
};

export default function NeighborhoodGrid() {
  const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/neighborhoods")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setNeighborhoods(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-base font-bold text-ink">
            Explore Neighborhoods
          </h2>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-28 skeleton rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (neighborhoods.length === 0) return null;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h2 className="font-display text-base font-bold text-ink">
            Explore Neighborhoods
          </h2>
          <span className="text-[11px] font-semibold text-muted bg-tag px-2 py-0.5 rounded-full">
            {neighborhoods.length} cities
          </span>
        </div>
        <span className="text-[12px] text-muted">
          Most discussed {"\u2192"}
        </span>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {neighborhoods.map((n) => (
          <Link
            key={`${n.city}-${n.state}`}
            href={`/neighborhood/${encodeURIComponent(n.city)}`}
            className="group block bg-[#1A1A1A] border border-border rounded-xl p-4 hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200"
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="min-w-0">
                <p className="font-display text-[15px] font-semibold text-ink truncate group-hover:text-social transition-colors">
                  {n.city}
                </p>
                <p className="text-[12px] text-muted">{n.state}</p>
              </div>
              {n.topReaction && (
                <span className="text-lg shrink-0">{n.topReaction}</span>
              )}
            </div>

            <div className="flex items-center gap-2 text-[12px] text-muted">
              <span>{n.listingCount} listing{n.listingCount !== 1 ? "s" : ""}</span>
              <span className="text-border">{"\u00b7"}</span>
              <span className="font-semibold text-ink">
                ${n.avgPrice.toLocaleString()}
              </span>
            </div>

            {n.commentCount > 0 && (
              <div className="mt-2">
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-social bg-social-light px-1.5 py-0.5 rounded">
                  {"\uD83D\uDCAC"} {n.commentCount} opinion{n.commentCount !== 1 ? "s" : ""}
                </span>
              </div>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
