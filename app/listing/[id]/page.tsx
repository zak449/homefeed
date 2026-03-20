import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import AgentContactForm from "@/components/AgentContactForm";
import CommentSection from "@/components/CommentSection";
import ListingViewTracker from "@/components/ListingViewTracker";
import PhotoLightbox from "@/components/PhotoLightbox";
import SaveButton from "@/components/SaveButton";
import ShareButton from "@/components/ShareButton";
import EmailCapture from "@/components/EmailCapture";
import FallbackImage from "@/components/FallbackImage";
import Breadcrumbs from "@/components/Breadcrumbs";
import MortgageCalculator from "@/components/MortgageCalculator";
import PriceInsight from "@/components/PriceInsight";
import EngagementPrompts from "@/components/EngagementPrompts";
import { enrichListingDetail } from "@/lib/data-adapters/detail";
import MapPreview from "@/components/MapPreview";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const listing = await prisma.listing.findUnique({
    where: { id },
    select: { address: true, city: true, state: true, price: true, listingType: true, status: true },
  });
  if (!listing) return {};

  const listingWithPhoto = await prisma.listing.findUnique({
    where: { id },
    select: { photos: true },
  });

  const price = listing.listingType === "rent"
    ? `$${listing.price.toLocaleString()}/mo`
    : `$${listing.price.toLocaleString()}`;
  const statusLabel = listing.status === "sold" ? " (Sold)" : "";
  const titleText = `${listing.address}${statusLabel} \u00b7 ${price} \u2014 gwakgwak`;
  const descriptionText = `${listing.address}, ${listing.city}, ${listing.state}. ${price}. See what people are saying on gwakgwak.`;
  const ogImage = listingWithPhoto?.photos?.[0] ?? undefined;

  return {
    title: titleText,
    description: descriptionText,
    openGraph: {
      title: titleText,
      description: descriptionText,
      type: "article",
      ...(ogImage ? { images: [{ url: ogImage }] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: titleText,
      description: descriptionText,
      ...(ogImage ? { images: [ogImage] } : {}),
    },
  };
}

function getCommentPrompt(price: number, commentCount: number, listingType: string): { text: string; emoji: string } {
  if (commentCount === 0) {
    return { text: "You found it first. Drop the first take.", emoji: "👀" };
  }
  if (commentCount >= 10) {
    return { text: "This listing is trending", emoji: "🔥" };
  }
  if (price >= 1000000 && listingType === "sale") {
    return { text: "Is it worth it?", emoji: "🤔" };
  }
  if (price <= 200000 && listingType === "sale") {
    return { text: "What's the catch?", emoji: "🧐" };
  }
  if (listingType === "rent" && price <= 1000) {
    return { text: "What's the catch?", emoji: "🧐" };
  }
  if (listingType === "rent" && price >= 3000) {
    return { text: "Is it worth it?", emoji: "🤔" };
  }
  return { text: "What do you think?", emoji: "💬" };
}

export default async function ListingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  // Enrich API listings with full photos + description — fire-and-forget, don't block render
  void (async () => {
    try {
      await enrichListingDetail(id);
    } catch (e) {
      console.error("[Detail] Enrich error:", e);
    }
  })();

  const [listing, commentCount, reactionCount] = await Promise.all([
    prisma.listing.findUnique({ where: { id } }),
    prisma.comment.count({ where: { listingId: id } }),
    prisma.reaction.count({ where: { comment: { listingId: id } } }),
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
      ? `$${Math.round(listing.price / listing.sqft).toLocaleString()}`
      : null;

  const priceHistory = listing.priceHistory as
    | { date: string; price: number; event?: string }[]
    | null;

  const commentPrompt = getCommentPrompt(listing.price, commentCount, listing.listingType);

  // Fetch "More listings in [city]" — 3 other listings from same city
  const moreSameCity = await prisma.listing.findMany({
    where: {
      city: { equals: listing.city, mode: "insensitive" },
      status: "active",
      id: { not: listing.id },
    },
    orderBy: { createdAt: "desc" },
    take: 3,
    select: {
      id: true,
      address: true,
      city: true,
      state: true,
      price: true,
      listingType: true,
      photos: true,
      bedrooms: true,
      bathrooms: true,
      sqft: true,
      _count: { select: { comments: true } },
      comments: {
        take: 1,
        orderBy: { createdAt: "desc" },
        select: { name: true, content: true },
      },
    },
  });

  // Fetch "Similar Hot Takes" — high-comment listings (only if this listing has 3+ comments)
  const hotTakes = commentCount >= 3
    ? await prisma.listing.findMany({
        where: {
          status: "active",
          id: { not: listing.id },
          comments: { some: {} },
        },
        orderBy: { comments: { _count: "desc" } },
        take: 3,
        select: {
          id: true,
          address: true,
          city: true,
          state: true,
          price: true,
          listingType: true,
          photos: true,
          bedrooms: true,
          bathrooms: true,
          sqft: true,
          _count: { select: { comments: true } },
          comments: {
            take: 1,
            orderBy: { createdAt: "desc" },
            select: { name: true, content: true },
          },
        },
      })
    : [];

  // Filter hot takes to only those with 3+ comments
  const filteredHotTakes = hotTakes.filter((l) => l._count.comments >= 3);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Track listing view */}
      <ListingViewTracker
        listingId={listing.id}
        city={listing.city}
        address={listing.address}
        price={listing.price}
        photo={listing.photos[0] ?? null}
        listingType={listing.listingType}
      />

      {/* 1. Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: "gwakgwak", href: "/" },
          { label: listing.city, href: `/neighborhood/${encodeURIComponent(listing.city)}` },
          { label: listing.address },
        ]}
      />

      {/* Back link */}
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm text-muted hover:text-ink transition-colors mb-5"
      >
        &larr; Back
      </Link>

      {/* Status banner */}
      {listing.status === "off_market" && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center text-lg shrink-0">🏠</div>
          <div>
            <p className="text-sm font-bold text-amber-800">
              This property is not currently on the market
            </p>
            <p className="text-xs text-amber-600">
              Showing the latest available property information.
              {listing.price > 0 && " Last known value shown below."}
              {" "}Comments open when listed for sale or rent.
            </p>
          </div>
        </div>
      )}
      {listing.status === "sold" && (
        <div className="bg-tag rounded-xl px-4 py-3 mb-5 flex items-center gap-2">
          <span className="text-lg">🔒</span>
          <div>
            <p className="text-sm font-semibold text-ink">This listing has been sold</p>
            <p className="text-xs text-muted">
              Comments are locked.{commentCount > 0 ? ` ${commentCount} comments preserved below.` : ""}
            </p>
          </div>
        </div>
      )}

      {/* 2. Photos */}
      {listing.photos.length > 0 && (
        <div className="mb-4">
          <PhotoLightbox photos={listing.photos} address={listing.address} />
        </div>
      )}

      {/* 3. Price + Address + Key Facts — COMPACT (2-3 lines) */}
      <div className="mb-3">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-semibold text-ink tracking-tighter leading-tight">
              {price}
              {isSold && (
                <span className="ml-2 text-sm font-semibold text-muted bg-tag px-2 py-0.5 rounded-md align-middle">
                  SOLD
                </span>
              )}
            </h1>
            <p className="text-sm text-muted mt-1">
              {listing.address} &middot; {listing.neighborhood ? `${listing.neighborhood} · ` : ""}{listing.city}, {listing.state} {listing.zip}
              {listing.bedrooms != null && ` · ${listing.bedrooms} bd`}
              {listing.bathrooms != null && ` ${listing.bathrooms} ba`}
              {listing.sqft != null && ` · ${listing.sqft.toLocaleString()} sqft`}
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            <span
              className={`text-xs font-semibold px-2.5 py-1 rounded-md ${
                isRent ? "bg-blue-50 text-cold" : "bg-green-50 text-money"
              }`}
            >
              {isRent ? "For Rent" : "For Sale"}
            </span>
          </div>
        </div>
      </div>

      {/* Save + Share buttons + Activity — compact bar */}
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-border">
        <div className="flex items-center gap-4">
          <SaveButton listingId={listing.id} />
          <ShareButton
            listingId={listing.id}
            address={listing.address}
            city={listing.city}
            price={price}
          />
        </div>
        <div className="flex gap-3 flex-wrap text-sm text-muted">
          {commentCount > 0 && (
            <span>
              💬 <span className="font-semibold text-ink">{commentCount}</span> comments
            </span>
          )}
          {reactionCount > 0 && (
            <span>
              🔥 <span className="font-semibold text-ink">{reactionCount}</span> reactions
            </span>
          )}
        </div>
      </div>

      {/* ====== 4. THE CONVERSATION — THE MAIN EVENT ====== */}
      <div className="mb-6 stagger-in" style={{ animationDelay: "50ms" }}>
        {/* Provocative prompt before comments */}
        {!isLocked && (
          <div className="mb-4 bg-gradient-to-r from-social-light to-white border border-social/10 rounded-xl px-5 py-4 flex items-center gap-3">
            <span className="text-2xl">{commentPrompt.emoji}</span>
            <p className="font-display font-bold text-base text-ink">
              {commentPrompt.text}
            </p>
          </div>
        )}

        <CommentSection
          listingId={listing.id}
          isLocked={isLocked}
          listingAddress={listing.address}
          listingPrice={price}
        />
      </div>

      {/* Email capture after comments */}
      <div className="mb-6 bg-[#FFF7ED] border border-[#FF6B2C]/10 rounded-xl p-5">
        <p className="font-display font-semibold text-sm text-ink mb-1">
          Want to know when people react to this listing?
        </p>
        <p className="text-xs text-muted mb-3">
          Get notified when new comments and hot takes drop.
        </p>
        <EmailCapture variant="inline" source={`listing-${listing.id}`} />
      </div>

      {/* ====== 5. Everything else — secondary content ====== */}

      {/* Map + Nearby — spatial context */}
      {listing.latitude != null && listing.longitude != null && (
        <div className="mb-5 stagger-in" style={{ animationDelay: "100ms" }}>
          <h2 className="font-display font-semibold text-sm text-ink mb-2 flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-social">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            Location
          </h2>
          <MapPreview
            latitude={listing.latitude}
            longitude={listing.longitude}
            address={listing.address}
            className="mb-3"
          />
          {/* Nearby info tags */}
          <div className="flex flex-wrap gap-2">
            {listing.neighborhood && (
              <a
                href={`/?city=${encodeURIComponent(listing.neighborhood)}`}
                className="inline-flex items-center gap-1.5 text-[12px] font-medium text-ink bg-tag hover:bg-ink/10 px-3 py-1.5 rounded-lg transition-colors"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                </svg>
                {listing.neighborhood}
              </a>
            )}
            <a
              href={`/?city=${encodeURIComponent(listing.city)}`}
              className="inline-flex items-center gap-1.5 text-[12px] font-medium text-ink bg-tag hover:bg-ink/10 px-3 py-1.5 rounded-lg transition-colors"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted">
                <circle cx="12" cy="12" r="10" />
                <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
              {listing.city}, {listing.state}
            </a>
            {listing.zip && (
              <span className="inline-flex items-center gap-1.5 text-[12px] text-muted bg-tag px-3 py-1.5 rounded-lg">
                {listing.zip}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Mortgage Calculator + Price Insight — for sale listings */}
      {!isRent && (
        <div className="mb-5 space-y-3 stagger-in" style={{ animationDelay: "150ms" }}>
          <MortgageCalculator price={listing.price} />
          <PriceInsight price={listing.price} sqft={listing.sqft} city={listing.city} />
        </div>
      )}

      {/* Description — About this property */}
      {listing.description && (
        <div className="mb-6 stagger-in" style={{ animationDelay: "200ms" }}>
          <h2 className="font-display font-semibold text-sm text-ink mb-2">About this property</h2>
          <p className="text-sm text-muted leading-relaxed">{listing.description}</p>
        </div>
      )}

      {/* Engagement prompt — drives comments */}
      {!isLocked && (
        <div className="mb-4">
          <EngagementPrompts
            price={listing.price}
            listingType={listing.listingType}
            commentCount={commentCount}
            priceHistory={priceHistory}
          />
        </div>
      )}

      {/* Detailed Property Information */}
      <div className="mb-6 border-t border-border pt-6 space-y-6">
        {/* Property Details */}
        <DetailSection title="Property Details">
          <DetailRow label="Status" value={isSold ? "Sold" : isRent ? "For Rent" : "For Sale"} />
          <DetailRow label="Type" value={capitalize(listing.propertyType)} />
          {listing.bedrooms != null && <DetailRow label="Beds" value={String(listing.bedrooms)} />}
          {listing.bathrooms != null && <DetailRow label="Baths" value={String(listing.bathrooms)} />}
          {listing.sqft != null && <DetailRow label="Sqft" value={listing.sqft.toLocaleString()} />}
          {listing.lotSqft != null && (
            <DetailRow label="Lot Size" value={`${listing.lotSqft.toLocaleString()} sqft`} />
          )}
          {listing.yearBuilt != null && <DetailRow label="Year Built" value={String(listing.yearBuilt)} />}
          {listing.parking != null && <DetailRow label="Parking" value={listing.parking} />}
        </DetailSection>

        {/* Price & Tax Info */}
        <DetailSection title="Price & Tax Info">
          <DetailRow label="List Price" value={price} />
          {pricePerSqft && <DetailRow label="Price / Sqft" value={pricePerSqft} />}
          <DetailRow
            label="Listed"
            value={listing.createdAt.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          />
          {priceHistory && priceHistory.length > 0 && (
            <div className="col-span-2 mt-2">
              <p className="text-xs text-muted font-medium mb-1.5">Price History</p>
              <div className="space-y-1">
                {priceHistory.map((entry, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between text-xs py-1 border-b border-border last:border-0"
                  >
                    <span className="text-muted">{entry.date}</span>
                    <span className="text-ink font-medium">
                      ${entry.price.toLocaleString()}
                      {entry.event && (
                        <span className="ml-1.5 text-muted font-normal">({entry.event})</span>
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </DetailSection>

        {/* Location */}
        <DetailSection title="Location">
          <DetailRow label="Address" value={listing.address} />
          <DetailRow label="City" value={listing.city} />
          <DetailRow label="State" value={listing.state} />
          <DetailRow label="Zip" value={listing.zip} />
          {listing.neighborhood && <DetailRow label="Neighborhood" value={listing.neighborhood} />}
          {listing.latitude != null && listing.longitude != null && (
            <DetailRow
              label="Coordinates"
              value={`${listing.latitude.toFixed(5)}, ${listing.longitude.toFixed(5)}`}
            />
          )}
        </DetailSection>

        {/* Listing Info */}
        <DetailSection title="Listing Info">
          <DetailRow label="Source" value={capitalize(listing.source)} />
          {listing.listingUrl && (
            <div className="grid grid-cols-2 gap-x-4 py-2 border-b border-border">
              <dt className="text-xs text-muted">Listing URL</dt>
              <dd className="text-sm text-right">
                <a
                  href={listing.listingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cold hover:underline font-medium truncate block"
                >
                  View original &rarr;
                </a>
              </dd>
            </div>
          )}
          {listing.agentName && <DetailRow label="Agent" value={listing.agentName} />}
          {listing.agentBrokerage && <DetailRow label="Brokerage" value={listing.agentBrokerage} />}
          <DetailRow
            label="Cached"
            value={listing.cachedAt.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          />
        </DetailSection>
      </div>

      {/* Agent Contact Form */}
      <div className="mb-6 border-t border-border pt-5">
        <AgentContactForm
          listingId={listing.id}
          agent={{
            name: listing.agentName,
            phone: listing.agentPhone,
            email: listing.agentEmail,
            photo: listing.agentPhoto,
            brokerage: listing.agentBrokerage,
          }}
        />
      </div>

      {/* More listings in [city] */}
      {moreSameCity.length > 0 && (
        <div className="mb-6 border-t border-border pt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-base font-bold text-ink">
              More in {listing.city}
            </h2>
            <a
              href={`/neighborhood/${encodeURIComponent(listing.city)}`}
              className="text-xs font-semibold text-social hover:text-social/80 transition-colors"
            >
              See all &rarr;
            </a>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {moreSameCity.map((l) => {
              const lPrice = l.listingType === "rent"
                ? `$${l.price.toLocaleString()}/mo`
                : `$${l.price.toLocaleString()}`;
              const photo = l.photos[0];
              const latestComment = l.comments[0];
              return (
                <a
                  key={l.id}
                  href={`/listing/${l.id}`}
                  className="bg-white border border-border rounded-xl overflow-hidden hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 group"
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-tag">
                    {photo ? (
                      <FallbackImage
                        src={photo}
                        alt={l.address}
                        className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted/20">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                          <polyline points="9 22 9 12 15 12 15 22" />
                        </svg>
                      </div>
                    )}
                    {l._count.comments > 0 && (
                      <span className={`absolute top-2 right-2 flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md shadow-sm ${
                        l._count.comments >= 5
                          ? "bg-[#FF6B2C] text-white"
                          : "bg-white/95 backdrop-blur-sm text-ink"
                      }`}>
                        {l._count.comments >= 5 ? "\uD83D\uDD25" : "\uD83D\uDCAC"} {l._count.comments}
                      </span>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="text-[13px] font-semibold text-ink">{lPrice}</p>
                    <p className="text-[12px] text-muted truncate">{l.address}</p>
                    <div className="flex items-center gap-1.5 mt-1 text-[11px] text-muted">
                      {l.bedrooms != null && <span>{l.bedrooms} bd</span>}
                      {l.bedrooms != null && l.bathrooms != null && <span className="text-border">·</span>}
                      {l.bathrooms != null && <span>{l.bathrooms} ba</span>}
                      {l.sqft != null && (
                        <>
                          <span className="text-border">·</span>
                          <span>{l.sqft.toLocaleString()} sqft</span>
                        </>
                      )}
                    </div>
                    {latestComment && (
                      <div className="mt-2 bg-tag rounded-lg px-2.5 py-1.5">
                        <p className="text-[11px] text-muted line-clamp-1">
                          <span className="font-semibold text-ink">{latestComment.name}</span>{" "}
                          {latestComment.content}
                        </p>
                      </div>
                    )}
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      )}

      {/* Similar Hot Takes — only if this listing has 3+ comments */}
      {filteredHotTakes.length > 0 && (
        <div className="mb-6 border-t border-border pt-6">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="font-display text-base font-bold text-ink">
              Similar Hot Takes
            </h2>
            <span className="text-[11px] font-semibold text-social bg-social-light px-2 py-0.5 rounded-full">
              Most discussed
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {filteredHotTakes.map((l) => {
              const lPrice = l.listingType === "rent"
                ? `$${l.price.toLocaleString()}/mo`
                : `$${l.price.toLocaleString()}`;
              const photo = l.photos[0];
              const latestComment = l.comments[0];
              return (
                <a
                  key={l.id}
                  href={`/listing/${l.id}`}
                  className="bg-white border border-border rounded-xl overflow-hidden hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 group"
                >
                  <div className="flex gap-3 p-4">
                    <div className="w-14 h-14 rounded-lg overflow-hidden bg-tag shrink-0">
                      {photo ? (
                        <FallbackImage
                          src={photo}
                          alt={l.address}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted/20">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                            <polyline points="9 22 9 12 15 12 15 22" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-ink truncate">{lPrice}</p>
                      <p className="text-[11px] text-muted truncate">{l.address}</p>
                      <p className="text-[11px] text-muted truncate">{l.city}, {l.state}</p>
                      <span className="inline-flex items-center gap-1 mt-1 text-[11px] font-bold text-social bg-social-light px-1.5 py-0.5 rounded">
                        💬 {l._count.comments} comments
                      </span>
                    </div>
                  </div>
                  {latestComment && (
                    <div className="px-4 pb-3 -mt-1">
                      <div className="bg-tag rounded-lg px-3 py-2">
                        <p className="text-[12px] text-muted line-clamp-2">
                          <span className="font-semibold text-ink">{latestComment.name}</span>{" "}
                          {latestComment.content}
                        </p>
                      </div>
                    </div>
                  )}
                </a>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/* -- Sub-components ---------------------------------------------------- */

function KeyFactsBar({
  beds,
  baths,
  sqft,
  lotSqft,
  yearBuilt,
}: {
  beds: number | null;
  baths: number | null;
  sqft: number | null;
  lotSqft: number | null;
  yearBuilt: number | null;
}) {
  const facts = [
    beds != null && { label: "Beds", value: String(beds) },
    baths != null && { label: "Baths", value: String(baths) },
    sqft != null && { label: "Sqft", value: sqft.toLocaleString() },
    lotSqft != null && { label: "Lot", value: `${(lotSqft / 43560).toFixed(2)} ac` },
    yearBuilt != null && { label: "Built", value: String(yearBuilt) },
  ].filter(Boolean) as { label: string; value: string }[];

  if (facts.length === 0) return null;

  return (
    <div className="flex mb-4 rounded-lg border border-border divide-x divide-border overflow-hidden">
      {facts.map((f) => (
        <div key={f.label} className="flex-1 py-2.5 px-3 text-center min-w-0">
          <p className="text-sm sm:text-base font-bold text-ink truncate">{f.value}</p>
          <p className="text-[11px] text-muted uppercase tracking-wide">{f.label}</p>
        </div>
      ))}
    </div>
  );
}

function DetailSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">{title}</h3>
      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">{children}</dl>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-2 gap-x-4 py-2 border-b border-border">
      <dt className="text-xs text-muted">{label}</dt>
      <dd className="text-sm font-medium text-ink text-right truncate">{value}</dd>
    </div>
  );
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
