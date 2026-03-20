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
    title: `${listing.address}${statusLabel} · ${price} — home.feed`,
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

  const quickStats = [
    listing.bedrooms != null && `${listing.bedrooms} bd`,
    listing.bathrooms != null && `${listing.bathrooms} ba`,
    listing.sqft != null && `${listing.sqft.toLocaleString()} sqft`,
  ].filter(Boolean) as string[];

  const detailRows = [
    { label: "Status", value: isSold ? "Sold" : isRent ? "For Rent" : "For Sale" },
    { label: "Type", value: capitalize(listing.propertyType) },
    listing.bedrooms != null && { label: "Beds", value: String(listing.bedrooms) },
    listing.bathrooms != null && { label: "Baths", value: String(listing.bathrooms) },
    listing.sqft != null && { label: "Sqft", value: listing.sqft.toLocaleString() },
    listing.lotSqft != null && { label: "Lot", value: `${listing.lotSqft.toLocaleString()} sqft` },
    listing.yearBuilt != null && { label: "Built", value: String(listing.yearBuilt) },
    listing.parking != null && { label: "Parking", value: listing.parking },
  ].filter(Boolean) as { label: string; value: string }[];

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Track listing view */}
      <ListingViewTracker listingId={listing.id} city={listing.city} />

      {/* Back link */}
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm text-muted hover:text-ink transition-colors mb-5"
      >
        &larr; Back
      </Link>

      {/* Sold banner */}
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

      {/* 1. Photos with clickable lightbox */}
      {listing.photos.length > 0 && (
        <div className="mb-4">
          <PhotoLightbox photos={listing.photos} address={listing.address} />
        </div>
      )}

      {/* 2. Price + Address + Quick Stats */}
      <div className="mb-3">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-ink leading-tight">
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
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-md ${
              isRent ? "bg-blue-50 text-cold" : "bg-green-50 text-money"
            }`}>
              {isRent ? "For Rent" : "For Sale"}
            </span>
            <span className="text-xs font-medium px-2.5 py-1 rounded-md bg-tag text-muted">
              {capitalize(listing.propertyType)}
            </span>
          </div>
        </div>
        {quickStats.length > 0 && (
          <p className="text-sm text-muted mt-1.5">
            {quickStats.join(" \u00b7 ")}
          </p>
        )}
      </div>

      {/* 3. Save button */}
      <div className="mb-4">
        <SaveButton listingId={listing.id} />
      </div>

      {/* 4. Activity bar */}
      {(commentCount > 0 || reactionCount > 0) && (
        <div className="flex gap-3 flex-wrap text-sm text-muted mb-4 pb-4 border-b border-border">
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
      )}

      {/* 5. Comments section — THE MAIN EVENT */}
      <div className="mb-6">
        <CommentSection listingId={listing.id} isLocked={isLocked} />
      </div>

      {/* 6. About this property */}
      {listing.description && (
        <div className="mb-6 border-t border-border pt-5">
          <h2 className="font-display font-semibold text-sm text-ink mb-2">About this property</h2>
          <p className="text-sm text-muted leading-relaxed">{listing.description}</p>
        </div>
      )}

      {/* 7. Property Details */}
      {detailRows.length > 0 && (
        <div className="mb-6 border-t border-border pt-5">
          <h2 className="text-xs font-semibold text-muted uppercase tracking-wide mb-3">Property Details</h2>
          <dl className="space-y-2.5">
            {detailRows.map((row) => (
              <div key={row.label} className="flex justify-between items-center py-1 border-b border-border last:border-0">
                <dt className="text-xs text-muted">{row.label}</dt>
                <dd className="text-sm font-medium text-ink">{row.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}

      {/* 8. Agent contact form */}
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

      {/* 9. Original listing link */}
      {listing.listingUrl && (
        <div className="border-t border-border pt-5 pb-2">
          <a
            href={listing.listingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm font-medium text-cold hover:underline"
          >
            View original listing &rarr;
          </a>
        </div>
      )}
    </div>
  );
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
