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
import AIReimagineTool from "@/components/AIReimagineTool";
import DecisionComparison from "@/components/DecisionComparison";
import NeighborQA from "@/components/NeighborQA";

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

  const [listing, commentCount, reactionCount, topComments] = await Promise.all([
    prisma.listing.findUnique({ where: { id } }),
    prisma.comment.count({ where: { listingId: id } }),
    prisma.reaction.count({ where: { comment: { listingId: id } } }),
    prisma.comment.findMany({
      where: { listingId: id },
      orderBy: { createdAt: "desc" },
      take: 3,
      select: { name: true, content: true },
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
    <div className="min-h-screen bg-[#FAFAF8]">
      {/* Track listing view */}
      <ListingViewTracker
        listingId={listing.id}
        city={listing.city}
        address={listing.address}
        price={listing.price}
        photo={listing.photos[0] ?? null}
        listingType={listing.listingType}
      />

      {/* ── Immersive Photo Gallery ── */}
      {listing.photos.length > 0 && (
        <div className="w-full max-w-5xl mx-auto px-0 sm:px-6 pt-0 sm:pt-6">
          <div className="sm:rounded-2xl overflow-hidden">
            <PhotoLightbox photos={listing.photos} address={listing.address} />
          </div>
        </div>
      )}

      {/* ── Main Content ── */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6">

        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-caption text-tertiary pt-6 pb-4">
          <Link href="/" className="hover:text-amber transition-colors font-medium">
            gwak gwak
          </Link>
          <span className="text-divider">/</span>
          <a
            href={`/?city=${encodeURIComponent(listing.city)}`}
            className="hover:text-amber transition-colors"
          >
            {listing.city}
          </a>
          <span className="text-divider">/</span>
          <span className="text-secondary truncate max-w-[200px]">{listing.address}</span>
        </nav>

        {/* Back link — styled pill */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-caption text-secondary hover:text-ink bg-surface border border-divider hover:border-ink/10 rounded-full px-3.5 py-1.5 transition-all hover:shadow-soft mb-6"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5" /><polyline points="12 19 5 12 12 5" />
          </svg>
          Back to feed
        </Link>

        {/* Status banner */}
        {listing.status === "off_market" && (
          <div className="bg-surface border border-divider rounded-card px-5 py-4 mb-6 shadow-soft">
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
          <div className="bg-surface border border-divider rounded-card px-5 py-4 mb-6 shadow-soft">
            <p className="text-body text-ink font-medium">This listing has been sold</p>
            <p className="text-caption text-secondary mt-0.5">
              Comments are locked.{commentCount > 0 ? ` ${commentCount} comments preserved below.` : ""}
            </p>
          </div>
        )}

        {/* ── Price + Address + Key Facts ── */}
        <div className="mb-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="font-display text-[2.75rem] sm:text-[3.25rem] text-ink leading-[1.05] tracking-[-0.035em]">
                {price}
              </h1>
              <p className="text-body text-secondary mt-2">
                {listing.address} &middot; {listing.city}, {listing.state} {listing.zip}
              </p>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2">
                {listing.bedrooms != null && (
                  <span className="text-caption text-ink font-medium bg-highlight px-2.5 py-1 rounded-full">
                    {listing.bedrooms} bd
                  </span>
                )}
                {listing.bathrooms != null && (
                  <span className="text-caption text-ink font-medium bg-highlight px-2.5 py-1 rounded-full">
                    {listing.bathrooms} ba
                  </span>
                )}
                {listing.sqft != null && (
                  <span className="text-caption text-ink font-medium bg-highlight px-2.5 py-1 rounded-full">
                    {listing.sqft.toLocaleString()} sqft
                  </span>
                )}
                {listing.yearBuilt != null && (
                  <span className="text-caption text-tertiary">
                    Built {listing.yearBuilt}
                  </span>
                )}
                {listing.propertyType && (
                  <span className="text-caption text-tertiary">
                    {capitalize(listing.propertyType)}
                  </span>
                )}
              </div>
            </div>
            <span className="text-caption text-secondary bg-highlight px-3 py-1.5 rounded-full shrink-0 mt-2 font-medium">
              {isRent ? "For Rent" : "For Sale"}
            </span>
          </div>
        </div>

        {/* ── Save + Share — prominent action bar ── */}
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-divider">
          <div className="flex items-center gap-3">
            <div className="[&_button]:bg-surface [&_button]:border [&_button]:border-divider [&_button]:rounded-full [&_button]:px-4 [&_button]:py-2 [&_button]:text-caption [&_button]:font-medium [&_button]:hover:border-ink/20 [&_button]:hover:shadow-soft [&_button]:transition-all">
              <SaveButton listingId={listing.id} />
            </div>
            <div className="[&_button]:bg-ink [&_button]:text-white [&_button]:border [&_button]:border-ink [&_button]:rounded-full [&_button]:px-4 [&_button]:py-2 [&_button]:text-caption [&_button]:font-medium [&_button]:hover:bg-ink/90 [&_button]:transition-all">
              <ShareButton
                listingId={listing.id}
                address={listing.address}
                city={listing.city}
                price={price}
              />
            </div>
          </div>
          <div className="flex gap-4 text-caption text-tertiary">
            {commentCount > 0 && (
              <span className="flex items-center gap-1">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                {commentCount}
              </span>
            )}
            {reactionCount > 0 && (
              <span className="flex items-center gap-1">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                {reactionCount}
              </span>
            )}
          </div>
        </div>

        {/* ── THE CONVERSATION — "What neighbors say" ── */}
        <div className="mb-10">
          {/* Section header with count badge */}
          <div className="flex items-center gap-3 mb-5">
            <h2 className="text-headline text-ink">What neighbors say</h2>
            {commentCount > 0 && (
              <span className="inline-flex items-center justify-center min-w-[28px] h-7 px-2 rounded-full bg-amber/10 text-amber text-caption font-semibold">
                {commentCount}
              </span>
            )}
          </div>

          {/* Prominent comment prompt */}
          <div className="bg-gradient-to-br from-glow via-[#FAFAF8] to-highlight border border-amber/15 rounded-card p-5 mb-6">
            <p className="text-title text-ink leading-snug">
              What do you know about this block that the listing doesn&apos;t say?
            </p>
            <p className="text-caption text-secondary mt-1">
              Your neighbors are listening. Share something real.
            </p>
          </div>

          <CommentSection
            listingId={listing.id}
            isLocked={isLocked}
            listingAddress={listing.address}
            listingPrice={price}
          />
        </div>

        {/* ── Email capture ── */}
        <div className="mb-10 bg-surface border border-divider rounded-card p-6 shadow-soft">
          <p className="text-title text-ink mb-1">
            Want to know when people react to this listing?
          </p>
          <p className="text-caption text-secondary mb-4">
            Get notified when new comments drop.
          </p>
          <EmailCapture variant="inline" source={`listing-${listing.id}`} />
        </div>

        {/* ── AI TOOLS — premium card treatment ── */}
        <div className="space-y-6 mb-10">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-px flex-1 bg-divider" />
            <span className="text-caption text-tertiary uppercase tracking-widest font-medium px-2">AI Tools</span>
            <div className="h-px flex-1 bg-divider" />
          </div>

          {/* Decision Comparison */}
          <div className="relative bg-surface rounded-card border border-divider overflow-hidden shadow-soft hover:shadow-card-hover transition-shadow">
            {/* Subtle amber gradient accent */}
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-amber/60 via-amber/30 to-transparent" />
            <div className="p-6">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 rounded-full bg-amber/10 flex items-center justify-center">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D4763C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v18"/><path d="M3 12h18"/><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
                </div>
                <h2 className="text-title text-ink">The real picture</h2>
              </div>
              <DecisionComparison
                listing={{
                  description: listing.description ?? undefined,
                  price: listing.price,
                  address: listing.address,
                }}
                commentCount={commentCount}
                topComments={topComments}
              />
            </div>
          </div>

          {/* AI Reimagine */}
          {listing.photos.length > 0 && (
            <div className="relative bg-surface rounded-card border border-divider overflow-hidden shadow-soft hover:shadow-card-hover transition-shadow">
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-amber/30 to-amber/60" />
              <div className="p-6">
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="w-8 h-8 rounded-full bg-amber/10 flex items-center justify-center">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D4763C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
                  </div>
                  <h2 className="text-title text-ink">Reimagine this property</h2>
                </div>
                <p className="text-caption text-secondary mb-4 pl-[42px]">
                  See what this place could look like with a different style. AI-powered visualization.
                </p>
                <AIReimagineTool photos={listing.photos} address={listing.address} />
              </div>
            </div>
          )}

          {/* Neighbor Q&A */}
          <div className="relative bg-surface rounded-card border border-divider overflow-hidden shadow-soft hover:shadow-card-hover transition-shadow">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-amber/40 via-amber/50 to-amber/20" />
            <div className="p-6">
              <div className="flex items-center gap-2.5 mb-2">
                <div className="w-8 h-8 rounded-full bg-amber/10 flex items-center justify-center">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D4763C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                </div>
                <h2 className="text-title text-ink">Ask the neighborhood</h2>
              </div>
              <p className="text-caption text-secondary mb-4 pl-[42px]">
                Have a question about this block? Ask verified locals who actually live here.
              </p>
              <NeighborQA zipCode={listing.zip} listingId={listing.id} />
            </div>
          </div>
        </div>

        {/* ── Description ── */}
        {listing.description && (
          <div className="mb-10">
            <h2 className="text-title text-ink mb-3">About this property</h2>
            <p className="text-body text-secondary leading-relaxed">{listing.description}</p>
          </div>
        )}

        {/* ── Map ── */}
        {listing.latitude != null && listing.longitude != null && (
          <div className="mb-10">
            <h2 className="text-title text-ink mb-3">Location</h2>
            <div className="rounded-card overflow-hidden border border-divider">
              <MapPreview
                latitude={listing.latitude}
                longitude={listing.longitude}
                address={listing.address}
                className="mb-0"
              />
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              {listing.neighborhood && (
                <a
                  href={`/?city=${encodeURIComponent(listing.neighborhood)}`}
                  className="text-caption text-secondary bg-surface border border-divider hover:border-ink/15 hover:shadow-soft px-3.5 py-1.5 rounded-full transition-all"
                >
                  {listing.neighborhood}
                </a>
              )}
              <a
                href={`/?city=${encodeURIComponent(listing.city)}`}
                className="text-caption text-secondary bg-surface border border-divider hover:border-ink/15 hover:shadow-soft px-3.5 py-1.5 rounded-full transition-all"
              >
                {listing.city}, {listing.state}
              </a>
            </div>
          </div>
        )}

        {/* ── Mortgage Calculator ── */}
        {!isRent && (
          <CollapsibleSection title="Estimate your payment">
            <MortgageCalculator price={listing.price} />
          </CollapsibleSection>
        )}

        {/* ── Detailed Property Information ── */}
        <div className="mb-10 border-t border-divider pt-8 space-y-8">
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
                      className="flex items-center justify-between text-caption py-1.5 border-b border-divider last:border-0"
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
              <div className="grid grid-cols-2 gap-x-4 py-2.5 border-b border-divider">
                <dt className="text-caption text-secondary">Listing URL</dt>
                <dd className="text-body text-right">
                  <a
                    href={listing.listingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-amber hover:text-amber/80 font-medium truncate block transition-colors"
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

        {/* ── More listings in [city] ── */}
        {moreSameCity.length > 0 && (
          <div className="mb-10 border-t border-divider pt-8">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-headline text-ink">
                More in {listing.city}
              </h2>
              <a
                href={`/?city=${encodeURIComponent(listing.city)}`}
                className="text-caption text-amber hover:text-amber/80 font-medium transition-colors"
              >
                See all &rarr;
              </a>
            </div>
            <div className="space-y-3">
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
                    className="group block bg-surface rounded-card border border-divider p-3 hover:shadow-card-hover hover:border-ink/10 transition-all"
                  >
                    <div className="flex gap-4">
                      {/* Thumbnail */}
                      <div className="w-24 h-24 rounded-avatar overflow-hidden bg-highlight shrink-0">
                        {photo ? (
                          <FallbackImage
                            src={photo}
                            alt={l.address}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
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
                        <p className="font-display text-lg text-ink font-bold tracking-tight">{lPrice}</p>
                        <p className="text-caption text-secondary truncate">{l.address}</p>
                        <p className="text-caption text-tertiary mt-0.5">
                          {l.bedrooms != null && `${l.bedrooms} bd`}
                          {l.bathrooms != null && ` \u00b7 ${l.bathrooms} ba`}
                          {l.sqft != null && ` \u00b7 ${l.sqft.toLocaleString()} sqft`}
                        </p>
                        {latestComment && (
                          <p className="text-caption text-tertiary mt-1.5 truncate italic">
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

        {/* Bottom spacer */}
        <div className="h-8" />
      </div>
    </div>
  );
}

/* -- Sub-components ---------------------------------------------------- */

function CollapsibleSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <details className="mb-10 border-t border-divider pt-6 group">
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
      <h3 className="text-caption text-amber uppercase tracking-wider mb-3 font-semibold">{title}</h3>
      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">{children}</dl>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-2 gap-x-4 py-2.5 border-b border-divider">
      <dt className="text-caption text-secondary">{label}</dt>
      <dd className="text-body font-medium text-ink text-right truncate">{value}</dd>
    </div>
  );
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
