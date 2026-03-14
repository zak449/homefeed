import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import AgentContactForm from "@/components/AgentContactForm";
import CommentSection from "@/components/CommentSection";

const COLORS = ["bg-coral", "bg-goldenrod", "bg-sage", "bg-sky", "bg-lavender", "bg-clay"];
const TEXT_COLORS = ["text-white", "text-ink", "text-ink", "text-white", "text-white", "text-white"];

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const listing = await prisma.listing.findUnique({
    where: { id },
    select: { address: true, city: true, state: true, price: true, listingType: true },
  });
  if (!listing) return {};
  const price = listing.listingType === "rent"
    ? `$${listing.price.toLocaleString()}/mo`
    : `$${listing.price.toLocaleString()}`;
  return {
    title: `${listing.address} · ${price} — HomeFeed`,
    description: `${listing.address}, ${listing.city}, ${listing.state}. Listed at ${price} on HomeFeed.`,
  };
}

export default async function ListingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const listing = await prisma.listing.findUnique({ where: { id } });
  if (!listing) notFound();

  const colorIndex = listing.id.charCodeAt(0) % COLORS.length;
  const headerBg   = COLORS[colorIndex];
  const headerText = TEXT_COLORS[colorIndex];

  const isRent = listing.listingType === "rent";
  const price  = isRent
    ? `$${listing.price.toLocaleString()}/mo`
    : `$${listing.price.toLocaleString()}`;

  const stats = [
    listing.bedrooms  != null && { label: "Bedrooms",  value: String(listing.bedrooms) },
    listing.bathrooms != null && { label: "Bathrooms", value: String(listing.bathrooms) },
    listing.sqft      != null && { label: "Sq Ft",     value: listing.sqft.toLocaleString() },
    listing.lotSqft   != null && { label: "Lot",       value: `${listing.lotSqft.toLocaleString()} sqft` },
    listing.yearBuilt != null && { label: "Built",     value: String(listing.yearBuilt) },
    listing.parking   != null && { label: "Parking",   value: listing.parking },
  ].filter(Boolean) as { label: string; value: string }[];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      {/* Back */}
      <Link href="/" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-ink transition-colors mb-8">
        ← Back to listings
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: listing detail */}
        <div className="lg:col-span-2 space-y-8">
          {/* Header color block */}
          <div className={`${headerBg} ${headerText} rounded-3xl px-8 py-8`}>
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <h1 className="font-display text-4xl sm:text-5xl leading-tight">{listing.address}</h1>
                <p className="text-lg mt-1 opacity-80">
                  {listing.neighborhood ? `${listing.neighborhood} · ` : ""}
                  {listing.city}, {listing.state} {listing.zip}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="font-display text-4xl">{price}</p>
                <div className="flex gap-2 mt-2 justify-end flex-wrap">
                  <span className={`text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full border ${headerText === "text-white" ? "border-white/40 bg-white/20" : "border-ink/20 bg-ink/10"}`}>
                    For {isRent ? "Rent" : "Sale"}
                  </span>
                  <span className={`text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full border ${headerText === "text-white" ? "border-white/40 bg-white/20" : "border-ink/20 bg-ink/10"}`}>
                    {capitalize(listing.propertyType)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Photo carousel */}
          {listing.photos.length > 0 && (
            <PhotoCarousel photos={listing.photos} address={listing.address} />
          )}

          {/* Stats grid */}
          {stats.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {stats.map((s) => (
                <div key={s.label} className="bg-white rounded-2xl px-5 py-4 border border-gray-100 shadow-sm">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">{s.label}</p>
                  <p className="font-display text-2xl text-ink">{s.value}</p>
                </div>
              ))}
            </div>
          )}

          {/* Description */}
          {listing.description && (
            <div className="bg-white rounded-3xl px-7 py-6 border border-gray-100 shadow-sm">
              <h2 className="font-display text-xl text-ink mb-3">About this home</h2>
              <p className="text-gray-600 leading-relaxed">{listing.description}</p>
            </div>
          )}

          {/* Original listing link */}
          {listing.listingUrl && (
            <a
              href={listing.listingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-semibold text-sky hover:underline"
            >
              View original listing →
            </a>
          )}

          {/* Comments */}
          <CommentSection listingId={listing.id} />
        </div>

        {/* Right: agent contact */}
        <div className="space-y-6">
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

          {/* Quick facts sidebar */}
          <div className="bg-white rounded-3xl px-6 py-5 border border-gray-100 shadow-sm">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Quick facts</p>
            <dl className="space-y-3">
              <Row label="Status" value={isRent ? "For Rent" : "For Sale"} />
              <Row label="Type" value={capitalize(listing.propertyType)} />
              {listing.bedrooms  != null && <Row label="Beds"  value={String(listing.bedrooms)} />}
              {listing.bathrooms != null && <Row label="Baths" value={String(listing.bathrooms)} />}
              {listing.sqft      != null && <Row label="Sqft"  value={listing.sqft.toLocaleString()} />}
              {listing.yearBuilt != null && <Row label="Built" value={String(listing.yearBuilt)} />}
              <Row label="City" value={`${listing.city}, ${listing.state}`} />
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center border-b border-gray-50 pb-2 last:border-0">
      <dt className="text-xs text-gray-400 font-medium">{label}</dt>
      <dd className="text-sm font-semibold text-ink">{value}</dd>
    </div>
  );
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function PhotoCarousel({ photos, address }: { photos: string[]; address: string }) {
  return (
    <div className="rounded-3xl overflow-hidden">
      <div className="relative">
        {/* Main photo */}
        <div className="relative h-80 sm:h-96">
          <Image
            src={photos[0]}
            alt={address}
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 65vw"
            priority
          />
        </div>
        {/* Thumbnails */}
        {photos.length > 1 && (
          <div className="flex gap-2 mt-2">
            {photos.slice(1, 5).map((p, i) => (
              <div key={i} className="relative flex-1 h-20 rounded-xl overflow-hidden">
                <Image
                  src={p}
                  alt={`${address} photo ${i + 2}`}
                  fill
                  className="object-cover hover:opacity-90 transition-opacity"
                  sizes="15vw"
                />
                {i === 3 && photos.length > 5 && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-sm font-bold">
                    +{photos.length - 5}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
