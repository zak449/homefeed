"use client";

import { useState } from "react";
import Link from "next/link";
import FallbackImage from "@/components/FallbackImage";

type TrendingListing = {
  id: string;
  address: string;
  city: string;
  state: string;
  price: number;
  listingType: string;
  photo: string | null;
  commentCount: number;
  comments: { name: string; content: string }[];
};

type Tab = {
  id: string;
  label: string;
  listings: TrendingListing[];
};

export default function TrendingTabs({ tabs }: { tabs: Tab[] }) {
  const [activeTab, setActiveTab] = useState(tabs[0]?.id ?? "discussed");

  const currentTab = tabs.find((t) => t.id === activeTab) ?? tabs[0];
  const listings = currentTab?.listings ?? [];

  return (
    <>
      {/* Tab bar */}
      <div className="flex items-center gap-1 bg-tag rounded-xl p-1 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 text-[13px] font-semibold py-2.5 px-3 rounded-lg transition-all duration-200 ${
              activeTab === tab.id
                ? "bg-white text-ink shadow-card"
                : "text-muted hover:text-ink"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Listing leaderboard */}
      {listings.length === 0 ? (
        <div className="bg-tag rounded-xl p-8 text-center">
          <p className="font-display text-lg font-semibold text-ink">
            No trending listings yet
          </p>
          <p className="text-sm text-muted mt-2">
            Be the first to start a conversation on a listing.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 mt-5 bg-social text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-social/90 transition-colors"
          >
            Browse listings
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {listings.map((listing, index) => {
            const price =
              listing.listingType === "rent"
                ? `$${listing.price.toLocaleString()}/mo`
                : `$${listing.price.toLocaleString()}`;

            const isTop3 = index < 3;

            return (
              <Link
                key={listing.id}
                href={`/listing/${listing.id}`}
                className={`block bg-white border rounded-xl overflow-hidden hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 group ${
                  isTop3 ? "border-social/20" : "border-border"
                }`}
              >
                <div className="flex gap-4 p-4">
                  {/* Rank number */}
                  <div className="shrink-0 w-8 flex items-start justify-center pt-1">
                    <span
                      className={`text-lg font-bold font-display ${
                        index === 0
                          ? "social-gradient text-xl"
                          : index < 3
                          ? "social-gradient"
                          : "text-muted/30"
                      }`}
                    >
                      #{index + 1}
                    </span>
                  </div>

                  {/* Thumbnail */}
                  <div className="shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-tag">
                    {listing.photo ? (
                      <FallbackImage
                        src={listing.photo}
                        alt={listing.address}
                        className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted/20">
                        <svg
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1"
                        >
                          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                          <polyline points="9 22 9 12 15 12 15 22" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-[15px] font-semibold text-ink truncate">
                          {price}
                        </p>
                        <p className="text-[13px] text-muted truncate">
                          {listing.address}
                        </p>
                        <p className="text-[12px] text-muted truncate">
                          {listing.city}, {listing.state}
                        </p>
                      </div>

                      {/* Comment count badge */}
                      <span
                        className={`shrink-0 inline-flex items-center gap-1.5 text-[12px] font-bold px-2.5 py-1 rounded-lg ${
                          listing.commentCount >= 10
                            ? "bg-social text-white"
                            : listing.commentCount >= 5
                            ? "bg-social/10 text-social"
                            : "bg-tag text-ink"
                        }`}
                      >
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                        </svg>
                        {listing.commentCount}
                      </span>
                    </div>

                    {/* Recent comments preview */}
                    {listing.comments.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {listing.comments.map((comment, ci) => (
                          <div
                            key={ci}
                            className="bg-tag rounded-lg px-2.5 py-1.5"
                          >
                            <p className="text-[11px] text-muted line-clamp-1">
                              <span className="font-semibold text-ink">
                                {comment.name}
                              </span>{" "}
                              {comment.content}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
}
