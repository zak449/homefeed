import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import AgentContactForm from "@/components/AgentContactForm";
import CommentSection from "@/components/CommentSection";
import ListingViewTracker from "@/components/ListingViewTracker";
import PhotoLightbox from "@/components/PhotoLightbox";
import SaveButton from "@/components/SaveButton";
import { enrichListingDetail } from "@/lib/data-adapters/detail";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const listing = await prisma.listing.findUnique({
    where: { id },
    select: { address: true, city: true, state: true, price: true, listingType: true, status: true },
  });
  if (!listing) return {};
  const price = listing.listingType === "rent"
    ? `$${listing.price.toLocaleString()}/mo`
    : `$${listing.price.toLocaleString()}`;
  const statusLabel = listing.status === "sold" ? " (Sold)" : "";
  return {
    title: `${listing.address}${statusLabel} \u00b7 ${price} \u2014 home.feed`,
    description: `${listing.address}, ${listing.city}, ${listing.state}. ${price}. See what people are saying on home.feed.`,
  };
}

export default async function ListingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  // Enrich API listings with full photos + description on first view
  try {
    await enrichListingDetail(id);
  } catch (e) {
    console.error("[Detail] Enrich error:", e);
  }

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

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Track listing view */}
      <ListingViewTracker listingId={listing.id} city={listing.city} />

      {/* 1. Back link */}
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm text-muted hover:text-ink transition-colors mb-5"
      >
        &larr; Back
      </Link>

      {/* 2. Sold banner */}
      {isSold && (
        <div className="bg-tag rounded-xl px-4 py-3 mb-5 flex items-center gap-2">
          <span className="text-lg">&#x1f512;</span>
          <div>
            <p className="text-sm font-semibold text-ink">
              This listing is {listing.status === "sold" ? "sold" : "off market"}
            </p>
            <p className="text-xs text-muted">
              Comments are locked.{commentCount > 0 ? ` ${commentCount} comments preserved below.` : ""}
            </p>
          </div>
        </div>
      )}

      {/* 3. Photos */}
      {listing.photos.length > 0 && (
        <div className="mb-4">
          <PhotoLightbox photos={listing.photos} address={listing.address} />
        </div>
      )}

      {/* 4. Price + Address + Tags */}
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
            <p className="text-sm text-muted mt-1">{listing.address}</p>
            <p className="text-sm text-muted">
              {listing.neighborhood ? `${listing.neighborhood} \u00b7 ` : ""}
              {listing.city}, {listing.state} {listing.zip}
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
            <span className="text-xs font-medium px-2.5 py-1 rounded-md bg-tag text-muted">
              {capitalize(listing.propertyType)}
            </span>
          </div>
        </div>
      </div>

      {/* 5. Key Facts row */}
      <KeyFactsBar
        beds={listing.bedrooms}
        baths={listing.bathrooms}
        sqft={listing.sqft}
        lotSqft={listing.lotSqft}
        yearBuilt={listing.yearBuilt}
      />

      {/* 6. Save button + Activity */}
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-border">
        <SaveButton listingId={listing.id} />
        <div className="flex gap-3 flex-wrap text-sm text-muted">
          {commentCount > 0 && (
            <span>
              &#x1f4ac; <span className="font-semibold text-ink">{commentCount}</span> comments
            </span>
          )}
          {reactionCount > 0 && (
            <span>
              &#x1f525; <span className="font-semibold text-ink">{reactionCount}</span> reactions
            </span>
          )}
        </div>
      </div>

      {/* 7. Description — About this property */}
      {listing.description && (
        <div className="mb-6">
          <h2 className="font-display font-semibold text-sm text-ink mb-2">About this property</h2>
          <p className="text-sm text-muted leading-relaxed">{listing.description}</p>
        </div>
      )}

      {/* 8. Comments section — THE MAIN EVENT */}
      <div className="mb-6 border-t border-border pt-5">
        <CommentSection listingId={listing.id} isLocked={isLocked} />
      </div>

      {/* 10. Detailed Property Information */}
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

      {/* 11. Agent Contact Form */}
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
    </div>
  );
}

/* ── Sub-components ──────────────────────────────────────────── */

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
