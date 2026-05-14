import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { ThreadedComments } from "@/components/comments/ThreadedComments";
import { prisma } from "@/lib/prisma";
import ListingViewTracker from "@/components/ListingViewTracker";
import SaveButton from "@/components/SaveButton";
import ShareButton from "@/components/ShareButton";
import MortgageCalculator from "@/components/MortgageCalculator";
import { enrichListingDetail } from "@/lib/data-adapters/detail";
import IntelBox from "@/components/IntelBox";
import SimilarListings from "@/components/SimilarListings";

import ListingHero from "@/components/listing/ListingHero";
import AgentVsNeighbor from "@/components/listing/AgentVsNeighbor";
import SpillsStack, { type SpillRow } from "@/components/listing/SpillsStack";
import PhotoStream from "@/components/listing/PhotoStream";
import ListingFacts from "@/components/listing/ListingFacts";
import BottomActionBar from "@/components/listing/BottomActionBar";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const [listing, takeCount, topComment] = await Promise.all([
    prisma.listing.findUnique({
      where: { id },
      select: { address: true, city: true, state: true, price: true, listingType: true, status: true, bedrooms: true, bathrooms: true, sqft: true },
    }),
    prisma.comment.count({ where: { listingId: id } }),
    prisma.comment.findFirst({
      where: { listingId: id },
      orderBy: { reactions: { _count: "desc" } },
      select: { content: true },
    }),
  ]);
  if (!listing) return {};

  const price = listing.listingType === "rent"
    ? `$${listing.price.toLocaleString()}/mo`
    : `$${listing.price.toLocaleString()}`;
  const statusLabel = listing.status === "sold" ? " (Sold)" : "";
  const titleText = `${listing.address}${statusLabel} · ${price} — Gwaky`;

  const stats: string[] = [];
  if (listing.bedrooms != null) stats.push(`${listing.bedrooms}bd`);
  if (listing.bathrooms != null) stats.push(`${listing.bathrooms}ba`);
  if (listing.sqft != null) stats.push(`${listing.sqft.toLocaleString()} sqft`);
  const statsStr = stats.length > 0 ? ` ${stats.join("/")}` : "";

  let descriptionText: string;
  if (topComment && takeCount > 0) {
    const snippet = topComment.content.length > 100
      ? topComment.content.slice(0, 100).trimEnd() + "..."
      : topComment.content;
    descriptionText = `${takeCount} take${takeCount !== 1 ? "s" : ""}: '${snippet}' — Real neighbor intel on ${listing.address}, ${listing.city}. ${price}${statsStr ? ` ·${statsStr}` : ""}`;
  } else {
    descriptionText = `${listing.address}, ${listing.city}, ${listing.state}. ${price}.${statsStr ? ` ${statsStr}.` : ""} See what people are saying on Gwaky.`;
  }

  const canonicalPath = `/listing/${id}`;
  const keywords = [
    listing.address,
    `${listing.city} ${listing.state}`,
    `${listing.city} real estate`,
    listing.listingType === "rent" ? `${listing.city} rentals` : `homes for sale ${listing.city}`,
    "real estate reviews",
    "neighbor intel",
    "Gwaky",
  ];

  return {
    title: titleText,
    description: descriptionText,
    keywords,
    alternates: { canonical: canonicalPath },
    robots: {
      index: listing.status !== "off_market",
      follow: true,
    },
    openGraph: {
      title: titleText,
      description: descriptionText,
      type: "article",
      url: `https://gwaky.com${canonicalPath}`,
      siteName: "Gwaky",
    },
    twitter: {
      card: "summary_large_image",
      title: titleText,
      description: descriptionText,
    },
  };
}

export default async function ListingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  // Enrich API listings -- fire-and-forget
  void (async () => {
    try {
      await enrichListingDetail(id);
    } catch (e) {
      console.error("[Detail] Enrich error:", e);
    }
  })();

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [listing, commentCount, recentCommentCount, distinctAuthors, topSpills] = await Promise.all([
    prisma.listing.findUnique({ where: { id } }),
    prisma.comment.count({ where: { listingId: id } }),
    prisma.comment.count({ where: { listingId: id, createdAt: { gte: sevenDaysAgo } } }),
    prisma.comment.findMany({
      where: { listingId: id },
      distinct: ["userId", "email"],
      select: { id: true },
      take: 100,
    }),
    prisma.comment.findMany({
      where: { listingId: id, parentId: null },
      orderBy: [{ likeCount: "desc" }, { createdAt: "desc" }],
      take: 8,
      select: {
        id: true,
        name: true,
        content: true,
        createdAt: true,
        isRedFlag: true,
        likeCount: true,
        user: { select: { name: true, username: true } },
        reactions: { select: { type: true } },
      },
    }),
  ]);
  if (!listing) notFound();

  const isRent = listing.listingType === "rent";
  const isSold = listing.status === "sold" || listing.status === "off_market";
  const isLocked = isSold;
  const price = isRent
    ? `$${listing.price.toLocaleString()}/mo`
    : `$${listing.price.toLocaleString()}`;

  const pricePerSqft =
    listing.sqft && listing.sqft > 0
      ? `$${Math.round(listing.price / listing.sqft).toLocaleString()}/sqft`
      : null;

  const priceHistory = listing.priceHistory as
    | { date: string; price: number; event?: string }[]
    | null;

  // ── Tea-temperature inputs (used by hero dial) ──
  const uniqueCommenters = distinctAuthors.length;

  // ── Top comment for the agent-vs-neighbor split ──
  const topRow = topSpills[0] ?? null;
  const topComment = topRow
    ? {
        content: topRow.content,
        authorName: topRow.user?.name ?? topRow.user?.username ?? topRow.name ?? "Anonymous",
        city: listing.city,
        state: listing.state,
      }
    : null;

  // ── Roll up reactions per comment for the SpillsStack ──
  const spills: SpillRow[] = topSpills.map((c) => {
    const reactionCounts: Record<string, number> = {};
    for (const r of c.reactions) {
      reactionCounts[r.type] = (reactionCounts[r.type] ?? 0) + 1;
    }
    const displayName = c.user?.name ?? c.user?.username ?? c.name ?? "Anon";
    return {
      id: c.id,
      authorName: displayName,
      authorInitial: (displayName.trim()[0] ?? "?").toUpperCase(),
      authorBadge: null,
      content: c.content,
      createdAt: c.createdAt.toISOString(),
      reactionCounts,
      isRedFlag: c.isRedFlag,
    };
  });

  // ── Status label + tone for hero pill ──
  let statusLabel = isRent ? "For Rent" : "For Sale";
  let statusTone: "active" | "sold" | "pending" | "off_market" = "active";
  if (listing.status === "sold") {
    statusLabel = "Sold";
    statusTone = "sold";
  } else if (listing.status === "pending") {
    statusLabel = "Pending";
    statusTone = "pending";
  } else if (listing.status === "off_market") {
    statusLabel = "Off Market";
    statusTone = "off_market";
  }

  // ── Bottom-bar spec summary ──
  const barSpecParts: string[] = [];
  if (listing.bedrooms != null) barSpecParts.push(`${listing.bedrooms}bd`);
  if (listing.bathrooms != null) barSpecParts.push(`${listing.bathrooms}ba`);
  if (listing.sqft != null) barSpecParts.push(`${listing.sqft.toLocaleString()} sqft`);
  const barSpec = barSpecParts.join(" · ");

  const heroPhoto = listing.photos[0] ?? null;

  // ── JSON-LD (unchanged) ──
  const listingJsonLd = {
    "@context": "https://schema.org",
    "@type": ["Product", "RealEstateListing"],
    "@id": `https://gwaky.com/listing/${listing.id}`,
    name: listing.address,
    url: `https://gwaky.com/listing/${listing.id}`,
    description:
      listing.description ??
      `${listing.address}, ${listing.city}, ${listing.state} ${listing.zip}`,
    image: listing.photos.length > 0 ? (listing.photos as string[]).slice(0, 5) : undefined,
    datePosted: listing.createdAt.toISOString(),
    dateModified: listing.updatedAt.toISOString(),
    offers: {
      "@type": "Offer",
      price: listing.price,
      priceCurrency: "USD",
      url: `https://gwaky.com/listing/${listing.id}`,
      availability:
        listing.status === "active"
          ? "https://schema.org/InStock"
          : listing.status === "sold"
          ? "https://schema.org/SoldOut"
          : "https://schema.org/Discontinued",
      businessFunction:
        listing.listingType === "rent"
          ? "https://schema.org/LeaseOut"
          : "https://schema.org/Sell",
    },
    ...(commentCount > 0
      ? {
          aggregateRating: undefined,
          interactionStatistic: {
            "@type": "InteractionCounter",
            interactionType: { "@type": "https://schema.org/CommentAction" },
            userInteractionCount: commentCount,
          },
        }
      : {}),
    ...(listing.bedrooms != null ||
    listing.bathrooms != null ||
    listing.sqft != null ||
    listing.yearBuilt != null
      ? {
          additionalProperty: [
            ...(listing.bedrooms != null
              ? [{ "@type": "PropertyValue", name: "numberOfRooms", value: listing.bedrooms }]
              : []),
            ...(listing.bathrooms != null
              ? [{ "@type": "PropertyValue", name: "numberOfBathroomsTotal", value: listing.bathrooms }]
              : []),
            ...(listing.sqft != null
              ? [
                  {
                    "@type": "PropertyValue",
                    name: "floorSize",
                    value: listing.sqft,
                    unitCode: "SQFT",
                  },
                ]
              : []),
            ...(listing.yearBuilt != null
              ? [{ "@type": "PropertyValue", name: "yearBuilt", value: listing.yearBuilt }]
              : []),
          ],
        }
      : {}),
    address: {
      "@type": "PostalAddress",
      streetAddress: listing.address,
      addressLocality: listing.city,
      addressRegion: listing.state,
      postalCode: listing.zip,
      addressCountry: "US",
    },
    ...(listing.latitude != null && listing.longitude != null
      ? {
          geo: {
            "@type": "GeoCoordinates",
            latitude: listing.latitude,
            longitude: listing.longitude,
          },
        }
      : {}),
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://gwaky.com" },
      {
        "@type": "ListItem",
        position: 2,
        name: `${listing.city}, ${listing.state}`,
        item: `https://gwaky.com/?city=${encodeURIComponent(listing.city)}`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: listing.address,
        item: `https://gwaky.com/listing/${listing.id}`,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-bg">
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(listingJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      {/* Track listing view */}
      <ListingViewTracker
        listingId={listing.id}
        city={listing.city}
        address={listing.address}
        price={listing.price}
        photo={heroPhoto}
        listingType={listing.listingType}
      />

      {/* ─── 1. Hero immersion ─── */}
      <ListingHero
        heroPhoto={heroPhoto}
        address={listing.address}
        city={listing.city}
        state={listing.state}
        zip={listing.zip}
        price={price}
        pricePerSqft={pricePerSqft}
        bedrooms={listing.bedrooms}
        bathrooms={listing.bathrooms}
        sqft={listing.sqft}
        statusLabel={statusLabel}
        statusTone={statusTone}
        commentCount={commentCount}
        recentCount={recentCommentCount}
        uniqueCommenters={uniqueCommenters}
      />

      {/* ─── 2. Agent vs. Neighbor split (overlaps the hero) ─── */}
      <AgentVsNeighbor
        agentBlurb={listing.description}
        agentName={listing.agentName}
        topComment={topComment}
        totalComments={commentCount}
      />

      {/* Sold / off-market banners — quietly inline beneath the split */}
      {isSold && (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 mt-6">
          <div className="rounded-xl border border-divider bg-surface px-4 py-3">
            <p className="text-white text-[13px] font-bold">
              {listing.status === "sold" ? "This block has been sold." : "Off market right now."}
            </p>
            <p className="text-secondary text-[12px] mt-0.5">
              {listing.status === "sold"
                ? `The take section is locked. ${commentCount} take${commentCount === 1 ? "" : "s"} preserved below.`
                : "Showing the most recent intel we have."}
            </p>
          </div>
        </div>
      )}

      {/* ─── 3. All the spills (THE HERO of this page) ─── */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 mt-10 sm:mt-14">
        <SpillsStack
          spills={spills}
          totalCount={commentCount}
          fullThread={<ThreadedComments listingId={listing.id} />}
        />

        {/* Floating "Spill your truth" anchor */}
        {!isLocked && (
          <a
            href="#spill-form"
            className="mt-6 mb-2 group flex items-center justify-between gap-3 rounded-2xl border border-amber/40 bg-gradient-to-br from-amber/15 to-amber/[0.04] hover:from-amber/20 hover:to-amber/[0.06] px-5 py-4 transition-all"
          >
            <div className="leading-tight">
              <p className="text-white text-[15px] font-bold">
                Got the dirt on this block?
              </p>
              <p className="text-secondary text-[12px] mt-0.5">
                Drop a take. Anonymous works. The neighbors will thank you.
              </p>
            </div>
            <span className="shrink-0 inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-amber text-white text-[13px] font-bold group-hover:bg-amber/90 transition-colors">
              <span aria-hidden="true">🫖</span>
              Spill
              <span aria-hidden="true">→</span>
            </span>
          </a>
        )}
      </section>

      {/* ─── 4. Photos that aren't thumbnails ─── */}
      {listing.photos.length > 0 && (
        <div className="mt-12 sm:mt-16">
          <PhotoStream photos={listing.photos} address={listing.address} />
        </div>
      )}

      {/* ─── 5. Quick facts + map ─── */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 mt-12 sm:mt-16">
        <ListingFacts
          bedrooms={listing.bedrooms}
          bathrooms={listing.bathrooms}
          sqft={listing.sqft}
          lotSqft={listing.lotSqft}
          yearBuilt={listing.yearBuilt}
          propertyType={listing.propertyType}
          listingType={listing.listingType}
          pricePerSqft={pricePerSqft}
          parking={listing.parking}
          latitude={listing.latitude}
          longitude={listing.longitude}
          address={listing.address}
          city={listing.city}
          state={listing.state}
          neighborhood={listing.neighborhood}
          zip={listing.zip}
        />

        {/* Price history — tucked at the bottom of facts */}
        {priceHistory && priceHistory.length > 0 && (
          <div className="mt-4 rounded-xl border border-divider bg-surface p-4">
            <p className="text-[10px] uppercase tracking-[0.14em] font-bold text-tertiary mb-2">
              Price history
            </p>
            <div className="space-y-1">
              {priceHistory.slice(0, 6).map((entry, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between text-[12px] py-1.5 border-b border-divider/60 last:border-0"
                >
                  <span className="text-secondary">{entry.date}</span>
                  <span className="text-white font-medium">
                    ${entry.price.toLocaleString()}
                    {entry.event && (
                      <span className="ml-1.5 text-tertiary font-normal">({entry.event})</span>
                    )}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Save / share row — quiet, under the facts */}
        <div className="mt-5 flex items-center gap-2">
          <div className="[&_button]:bg-surface [&_button]:text-white [&_button]:border [&_button]:border-divider [&_button]:rounded-xl [&_button]:px-4 [&_button]:py-2 [&_button]:text-[13px] [&_button]:font-semibold [&_button]:hover:border-amber/40 [&_button]:transition-all">
            <SaveButton listingId={listing.id} />
          </div>
          <div className="[&_button]:bg-surface [&_button]:text-white [&_button]:border [&_button]:border-divider [&_button]:rounded-xl [&_button]:px-4 [&_button]:py-2 [&_button]:text-[13px] [&_button]:font-semibold [&_button]:hover:border-amber/40 [&_button]:transition-all">
            <ShareButton
              listingId={listing.id}
              address={listing.address}
              city={listing.city}
              price={price}
            />
          </div>
        </div>

        {/* Mortgage / Rap sheet / Intel — collapsed by default, deep utility */}
        {!isRent && (
          <details className="mt-6 group rounded-xl border border-divider bg-surface overflow-hidden">
            <summary className="cursor-pointer list-none flex items-center justify-between px-4 py-3.5">
              <span className="text-white text-[14px] font-bold">Estimate your monthly</span>
              <span className="text-tertiary text-sm group-open:rotate-90 transition-transform">›</span>
            </summary>
            <div className="px-4 pb-4">
              <MortgageCalculator price={listing.price} />
            </div>
          </details>
        )}

        <Link
          href={`/rap-sheet/${listing.id}`}
          className="mt-3 group flex items-center justify-between rounded-xl border border-divider bg-surface hover:border-amber/40 px-4 py-3.5 transition-all"
        >
          <div>
            <p className="text-white text-[14px] font-bold">View the full rap sheet</p>
            <p className="text-secondary text-[12px] mt-0.5">
              Every take, every reaction, in one screen.
            </p>
          </div>
          <span className="text-amber text-sm font-bold group-hover:translate-x-0.5 transition-transform">→</span>
        </Link>

        {/* IntelBox — the unified terminal */}
        <div className="mt-6">
          <IntelBox
            listingId={listing.id}
            isLocked={isLocked}
            listingAddress={listing.address}
            listingPrice={price}
            photos={listing.photos as string[]}
            zipCode={listing.zip}
            listingContext={{
              address: listing.address,
              city: listing.city,
              price: listing.price,
              sqft: listing.sqft,
              bedrooms: listing.bedrooms,
              bathrooms: listing.bathrooms,
              propertyType: listing.propertyType,
            }}
          />
        </div>
      </div>

      {/* ─── 6. Similar listings, framed as "fall harder" ─── */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 mt-14 sm:mt-20">
        <div className="mb-4">
          <p className="text-[11px] uppercase tracking-[0.16em] font-bold text-amber/90">
            Keep falling
          </p>
          <h2 className="font-display text-2xl sm:text-3xl text-white tracking-tight font-extrabold leading-none mt-1">
            If you fell for this one, fall harder for these →
          </h2>
        </div>
        <SimilarListings listingId={listing.id} limit={6} />

        <Link
          href={`/?city=${encodeURIComponent(listing.city)}`}
          className="mt-4 group flex items-center justify-between rounded-2xl border border-amber/30 bg-gradient-to-br from-amber/10 to-amber/[0.02] hover:from-amber/15 px-5 py-4 transition-all"
        >
          <div>
            <p className="text-white text-[15px] font-bold">
              Continue exploring {listing.city}
            </p>
            <p className="text-secondary text-[12px] mt-0.5">
              The whole block has takes. Keep digging.
            </p>
          </div>
          <span className="text-amber text-base font-bold group-hover:translate-x-0.5 transition-transform">→</span>
        </Link>
      </div>

      {/* Bottom spacer — clears the sticky bar + tab nav */}
      <div className="h-32" />

      {/* ─── 7. Sticky bottom action bar ─── */}
      <BottomActionBar
        priceLabel={price}
        specLabel={barSpec}
        isLocked={isLocked}
        saveButton={<SaveButton listingId={listing.id} />}
      />
    </div>
  );
}
