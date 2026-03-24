import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import CommentSection from "@/components/CommentSection";
import ListingViewTracker from "@/components/ListingViewTracker";
import PhotoLightbox from "@/components/PhotoLightbox";
import SaveButton from "@/components/SaveButton";
import ShareButton from "@/components/ShareButton";
import EmailCapture from "@/components/EmailCapture";
import FallbackImage from "@/components/FallbackImage";
import MortgageCalculator from "@/components/MortgageCalculator";
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

  // Fetch "More listings in [city]"
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

      {/* Back link */}
      <Link
        href="/"
        className="inline-block text-caption text-secondary hover:text-ink transition-colors mb-5"
      >
        &larr; back
      </Link>

      {/* Status banner */}
      {listing.status === "off_market" && (
        <div className="bg-surface border border-divider rounded-card px-4 py-3 mb-5">
          <p className="text-body text-ink font-medium">
            This property is not currently on the market
          </p>
          <p className="text-caption text-secondary mt-0.5">
            Showing the latest available property information.
            {listing.price > 0 && " Last known value shown below."}
          </p>
        </div>
      )}
      {listing.status === "sold" && (
        <div className="bg-surface border border-divider rounded-card px-4 py-3 mb-5">
          <p className="text-body text-ink font-medium">This listing has been sold</p>
          <p className="text-caption text-secondary mt-0.5">
            Comments are locked.{commentCount > 0 ? ` ${commentCount} comments preserved below.` : ""}
          </p>
        </div>
      )}

      {/* Photos */}
      {listing.photos.length > 0 && (
        <div className="mb-4">
          <PhotoLightbox photos={listing.photos} address={listing.address} />
        </div>
      )}

      {/* Price + Address + Key Facts */}
      <div className="mb-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-display text-ink leading-tight">
              {price}
            </h1>
            <p className="text-body text-secondary mt-1">
              {listing.address} &middot; {listing.city}, {listing.state} {listing.zip}
            </p>
            <p className="text-caption text-tertiary mt-0.5">
              {listing.bedrooms != null && `${listing.bedrooms} bd`}
              {listing.bathrooms != null && ` \u00b7 ${listing.bathrooms} ba`}
              {listing.sqft != null && ` \u00b7 ${listing.sqft.toLocaleString()} sqft`}
              {listing.yearBuilt != null && ` \u00b7 Built ${listing.yearBuilt}`}
              {listing.propertyType && ` \u00b7 ${capitalize(listing.propertyType)}`}
            </p>
          </div>
          <span className="text-caption text-secondary shrink-0 mt-2">
            {isRent ? "For Rent" : "For Sale"}
          </span>
        </div>
      </div>

      {/* Save + Share */}
      <div className="flex items-center justify-between mb-6 pb-6 border-b border-divider">
        <div className="flex items-center gap-4">
          <SaveButton listingId={listing.id} />
          <ShareButton
            listingId={listing.id}
            address={listing.address}
            city={listing.city}
            price={price}
          />
        </div>
        <div className="flex gap-4 text-caption text-tertiary">
          {commentCount > 0 && (
            <span>{commentCount} comment{commentCount !== 1 ? "s" : ""}</span>
          )}
          {reactionCount > 0 && (
            <span>{reactionCount} reaction{reactionCount !== 1 ? "s" : ""}</span>
          )}
        </div>
      </div>

      {/* THE CONVERSATION */}
      <div className="mb-8">
        <CommentSection
          listingId={listing.id}
          isLocked={isLocked}
          listingAddress={listing.address}
          listingPrice={price}
        />
      </div>

      {/* Email capture */}
      <div className="mb-8 bg-highlight border border-divider rounded-card p-5">
        <p className="text-title text-ink mb-1">
          Want to know when people react to this listing?
        </p>
        <p className="text-caption text-secondary mb-3">
          Get notified when new comments drop.
        </p>
        <EmailCapture variant="inline" source={`listing-${listing.id}`} />
      </div>

      {/* Description */}
      {listing.description && (
        <div className="mb-8">
          <h2 className="text-title text-ink mb-2">About this property</h2>
          <p className="text-body text-secondary leading-relaxed">{listing.description}</p>
        </div>
      )}

      {/* Map */}
      {listing.latitude != null && listing.longitude != null && (
        <div className="mb-8">
          <h2 className="text-title text-ink mb-2">Location</h2>
          <MapPreview
            latitude={listing.latitude}
            longitude={listing.longitude}
            address={listing.address}
            className="mb-3"
          />
          <div className="flex flex-wrap gap-2">
            {listing.neighborhood && (
              <a
                href={`/?city=${encodeURIComponent(listing.neighborhood)}`}
                className="text-caption text-secondary bg-surface hover:bg-active px-3 py-1.5 rounded-full transition-colors"
              >
                {listing.neighborhood}
              </a>
            )}
            <a
              href={`/?city=${encodeURIComponent(listing.city)}`}
              className="text-caption text-secondary bg-surface hover:bg-active px-3 py-1.5 rounded-full transition-colors"
            >
              {listing.city}, {listing.state}
            </a>
          </div>
        </div>
      )}

      {/* Mortgage Calculator -- collapsible */}
      {!isRent && (
        <CollapsibleSection title="Estimate your payment">
          <MortgageCalculator price={listing.price} />
        </CollapsibleSection>
      )}

      {/* Detailed Property Information */}
      <div className="mb-8 border-t border-divider pt-6 space-y-6">
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
              <p className="text-caption text-secondary mb-1.5">Price History</p>
              <div className="space-y-1">
                {priceHistory.map((entry, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between text-caption py-1 border-b border-divider last:border-0"
                  >
                    <span className="text-secondary">{entry.date}</span>
                    <span className="text-ink font-medium">
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
        </DetailSection>

        <DetailSection title="Location">
          <DetailRow label="Address" value={listing.address} />
          <DetailRow label="City" value={listing.city} />
          <DetailRow label="State" value={listing.state} />
          <DetailRow label="Zip" value={listing.zip} />
          {listing.neighborhood && <DetailRow label="Neighborhood" value={listing.neighborhood} />}
        </DetailSection>

        <DetailSection title="Listing Info">
          <DetailRow label="Source" value={capitalize(listing.source)} />
          {listing.listingUrl && (
            <div className="grid grid-cols-2 gap-x-4 py-2 border-b border-divider">
              <dt className="text-caption text-secondary">Listing URL</dt>
              <dd className="text-body text-right">
                <a
                  href={listing.listingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-ink hover:text-secondary font-medium truncate block"
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

      {/* More listings in [city] */}
      {moreSameCity.length > 0 && (
        <div className="mb-8 border-t border-divider pt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-title text-ink">
              More in {listing.city}
            </h2>
            <a
              href={`/?city=${encodeURIComponent(listing.city)}`}
              className="text-caption text-tertiary hover:text-ink transition-colors"
            >
              See all &rarr;
            </a>
          </div>
          <div className="space-y-4">
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
                  className="group block rounded-card hover:shadow-hover transition-shadow"
                >
                  <div className="flex gap-4">
                    {/* Thumbnail */}
                    <div className="w-20 h-20 rounded-avatar overflow-hidden bg-surface shrink-0">
                      {photo ? (
                        <FallbackImage
                          src={photo}
                          alt={l.address}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-tertiary/30">
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                            <polyline points="9 22 9 12 15 12 15 22" />
                          </svg>
                        </div>
                      )}
                    </div>
                    {/* Info */}
                    <div className="flex-1 min-w-0 py-1">
                      <p className="text-body text-ink font-medium">{lPrice}</p>
                      <p className="text-caption text-secondary truncate">{l.address}</p>
                      <p className="text-caption text-tertiary mt-0.5">
                        {l.bedrooms != null && `${l.bedrooms} bd`}
                        {l.bathrooms != null && ` \u00b7 ${l.bathrooms} ba`}
                        {l.sqft != null && ` \u00b7 ${l.sqft.toLocaleString()} sqft`}
                      </p>
                      {latestComment && (
                        <p className="text-caption text-tertiary mt-1 truncate">
                          &ldquo;{latestComment.content}&rdquo;
                        </p>
                      )}
                    </div>
                  </div>
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

function CollapsibleSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <details className="mb-8 border-t border-divider pt-4 group">
      <summary className="text-title text-ink cursor-pointer list-none flex items-center justify-between">
        {title}
        <span className="text-tertiary text-caption group-open:rotate-90 transition-transform">&rsaquo;</span>
      </summary>
      <div className="mt-4">
        {children}
      </div>
    </details>
  );
}

function DetailSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-caption text-secondary uppercase tracking-wider mb-3">{title}</h3>
      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">{children}</dl>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-2 gap-x-4 py-2 border-b border-divider">
      <dt className="text-caption text-secondary">{label}</dt>
      <dd className="text-body font-medium text-ink text-right truncate">{value}</dd>
    </div>
  );
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
