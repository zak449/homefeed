import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import AgentContactForm from "@/components/AgentContactForm";
import CommentSection from "@/components/CommentSection";
import ListingViewTracker from "@/components/ListingViewTracker";

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
  const [listing, commentCount, reactionCount] = await Promise.all([
    prisma.listing.findUnique({ where: { id } }),
    prisma.comment.count({ where: { listingId: id } }),
    prisma.reaction.count({ where: { comment: { listingId: id } } }),
  ]);
  if (!listing) notFound();

  const isRent = listing.listingType === "rent";
  const isSold = listing.status === "sold" || listing.status === "off_market";
  const isLocked = isSold; // Comments locked when not active
  const price = isRent
    ? `$${listing.price.toLocaleString()}/mo`
    : `$${listing.price.toLocaleString()}`;

  const stats = [
    listing.bedrooms  != null && { label: "Beds", value: String(listing.bedrooms) },
    listing.bathrooms != null && { label: "Baths", value: String(listing.bathrooms) },
    listing.sqft      != null && { label: "Sq Ft", value: listing.sqft.toLocaleString() },
    listing.lotSqft   != null && { label: "Lot", value: `${listing.lotSqft.toLocaleString()} sqft` },
    listing.yearBuilt != null && { label: "Built", value: String(listing.yearBuilt) },
    listing.parking   != null && { label: "Parking", value: listing.parking },
  ].filter(Boolean) as { label: string; value: string }[];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
      {/* Track listing view */}
      <ListingViewTracker listingId={listing.id} city={listing.city} />

      {/* Back link */}
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm text-muted hover:text-ink transition-colors mb-5"
      >
        ← Back
      </Link>

      {/* Sold banner */}
      {isSold && (
        <div className="bg-tag rounded-xl px-4 py-3 mb-5 flex items-center gap-2">
          <span className="text-lg">🔒</span>
          <div>
            <p className="text-sm font-semibold text-ink">
              This listing is {listing.status === "sold" ? "sold" : "off market"}
            </p>
            <p className="text-xs text-muted">
              Comments are locked. {commentCount > 0 ? `${commentCount} comments preserved below.` : ""}
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: listing detail */}
        <div className="lg:col-span-2 space-y-5">
          {/* Photo gallery */}
          {listing.photos.length > 0 && (
            <PhotoGallery photos={listing.photos} address={listing.address} />
          )}

          {/* Price + address header */}
          <div>
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <h1 className="font-display text-2xl sm:text-3xl font-bold text-ink leading-tight">
                  {price}
                  {isSold && (
                    <span className="ml-2 text-sm font-semibold text-muted bg-tag px-2 py-0.5 rounded-md align-middle">
                      SOLD
                    </span>
                  )}
                </h1>
                <p className="text-sm text-muted mt-1">
                  {listing.address}
                </p>
                <p className="text-sm text-muted">
                  {listing.neighborhood ? `${listing.neighborhood} · ` : ""}
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
          </div>

          {/* Stats row */}
          {stats.length > 0 && (
            <div className="flex gap-4 flex-wrap py-3 border-y border-border">
              {stats.map((s) => (
                <div key={s.label} className="text-center min-w-[60px]">
                  <p className="font-display font-bold text-lg text-ink leading-none">{s.value}</p>
                  <p className="text-xs text-muted mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          )}

          {/* Activity summary */}
          <div className="flex gap-3 flex-wrap">
            {commentCount > 0 && (
              <div className="flex items-center gap-1.5 text-sm">
                <span>💬</span>
                <span className="font-semibold text-ink">{commentCount}</span>
                <span className="text-muted">comments</span>
              </div>
            )}
            {reactionCount > 0 && (
              <div className="flex items-center gap-1.5 text-sm">
                <span>🔥</span>
                <span className="font-semibold text-ink">{reactionCount}</span>
                <span className="text-muted">reactions</span>
              </div>
            )}
          </div>

          {/* Description */}
          {listing.description && (
            <div>
              <h2 className="font-display font-semibold text-sm text-ink mb-2">About this property</h2>
              <p className="text-sm text-muted leading-relaxed">{listing.description}</p>
            </div>
          )}

          {/* Original listing link */}
          {listing.listingUrl && (
            <a
              href={listing.listingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm font-medium text-cold hover:underline"
            >
              View original listing →
            </a>
          )}

          {/* Divider */}
          <div className="border-t border-border pt-5">
            {/* Comments — THE MAIN EVENT */}
            <CommentSection listingId={listing.id} isLocked={isLocked} />
          </div>
        </div>

        {/* Right column: agent + facts */}
        <div className="space-y-5">
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

          {/* Quick facts */}
          <div className="bg-white rounded-xl border border-border p-5">
            <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-3">Details</p>
            <dl className="space-y-2.5">
              <Row label="Status" value={isSold ? "Sold" : isRent ? "For Rent" : "For Sale"} />
              <Row label="Type" value={capitalize(listing.propertyType)} />
              {listing.bedrooms  != null && <Row label="Beds"  value={String(listing.bedrooms)} />}
              {listing.bathrooms != null && <Row label="Baths" value={String(listing.bathrooms)} />}
              {listing.sqft      != null && <Row label="Sqft"  value={listing.sqft.toLocaleString()} />}
              {listing.yearBuilt != null && <Row label="Built" value={String(listing.yearBuilt)} />}
              <Row label="Location" value={`${listing.city}, ${listing.state}`} />
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center py-1 border-b border-border last:border-0">
      <dt className="text-xs text-muted">{label}</dt>
      <dd className="text-sm font-medium text-ink">{value}</dd>
    </div>
  );
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function PhotoGallery({ photos, address }: { photos: string[]; address: string }) {
  if (photos.length === 1) {
    return (
      <div className="relative aspect-[16/9] rounded-xl overflow-hidden bg-tag">
        <Image src={photos[0]} alt={address} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 65vw" priority />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-4 gap-1.5 rounded-xl overflow-hidden">
      {/* Main photo */}
      <div className="col-span-4 sm:col-span-2 sm:row-span-2 relative aspect-[4/3] sm:aspect-auto bg-tag">
        <Image src={photos[0]} alt={address} fill className="object-cover" sizes="(max-width: 640px) 100vw, 50vw" priority />
      </div>
      {/* Secondary photos */}
      {photos.slice(1, 5).map((p, i) => (
        <div key={i} className="relative aspect-[4/3] bg-tag hidden sm:block">
          <Image src={p} alt={`${address} photo ${i + 2}`} fill className="object-cover hover:opacity-90 transition-opacity" sizes="25vw" />
          {i === 3 && photos.length > 5 && (
            <div className="absolute inset-0 bg-ink/50 flex items-center justify-center">
              <span className="text-white font-semibold text-sm">+{photos.length - 5}</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
