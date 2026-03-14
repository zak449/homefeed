import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import AgentContactForm from "@/components/AgentContactForm";
import CommentSection from "@/components/CommentSection";

const COLORS = ["bg-coral", "bg-goldenrod", "bg-sage", "bg-sky", "bg-lavender", "bg-pink"];
const TEXT_COLORS = ["text-white", "text-ink", "text-white", "text-white", "text-white", "text-white"];

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
  const [listing, commentCount, reactionCount] = await Promise.all([
    prisma.listing.findUnique({ where: { id } }),
    prisma.comment.count({ where: { listingId: id } }),
    prisma.reaction.count({ where: { comment: { listingId: id } } }),
  ]);
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
      <Link href="/" className="inline-flex items-center gap-2 font-display text-xs uppercase tracking-wide border-2 border-ink px-4 py-1.5 rounded-full hover:bg-ink hover:text-cream transition-all shadow-brute-sm mb-8">
        ← Back to listings
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: listing detail */}
        <div className="lg:col-span-2 space-y-8">
          {/* Header color block */}
          <div className={`${headerBg} ${headerText} rounded-2xl border-3 border-ink shadow-brute px-8 py-8`}>
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <h1 className="font-display text-4xl sm:text-5xl leading-tight uppercase">{listing.address}</h1>
                <p className="text-lg mt-1 opacity-80 font-medium">
                  {listing.neighborhood ? `${listing.neighborhood} · ` : ""}
                  {listing.city}, {listing.state} {listing.zip}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="font-display text-4xl">{price}</p>
                <div className="flex gap-2 mt-2 justify-end flex-wrap">
                  <span className="font-display text-xs uppercase tracking-widest px-3 py-1 rounded-full border-2 border-ink bg-cream text-ink">
                    For {isRent ? "Rent" : "Sale"}
                  </span>
                  <span className="font-display text-xs uppercase tracking-widest px-3 py-1 rounded-full border-2 border-ink bg-cream text-ink">
                    {capitalize(listing.propertyType)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Social stats strip */}
          <div className="flex gap-3 flex-wrap">
            <div className="flex items-center gap-2 bg-white rounded-xl border-3 border-ink px-4 py-2.5 shadow-brute-sm">
              <span className="text-xl">💬</span>
              <div>
                <p className="font-display text-xl text-ink leading-none">{commentCount}</p>
                <p className="font-display text-xs uppercase text-ink/50">Comments</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-white rounded-xl border-3 border-ink px-4 py-2.5 shadow-brute-sm">
              <span className="text-xl">🔥</span>
              <div>
                <p className="font-display text-xl text-ink leading-none">{reactionCount}</p>
                <p className="font-display text-xs uppercase text-ink/50">Reactions</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-goldenrod rounded-xl border-3 border-ink px-4 py-2.5 shadow-brute-sm">
              <span className="text-xl">🏡</span>
              <div>
                <p className="font-display text-xl text-ink leading-none">{commentCount + reactionCount}</p>
                <p className="font-display text-xs uppercase text-ink/50">Total Activity</p>
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
                <div key={s.label} className="bg-white rounded-2xl border-3 border-ink px-5 py-4 shadow-brute-sm">
                  <p className="font-display text-xs uppercase tracking-wider text-ink/50 mb-1">{s.label}</p>
                  <p className="font-display text-2xl text-ink">{s.value}</p>
                </div>
              ))}
            </div>
          )}

          {/* Description */}
          {listing.description && (
            <div className="bg-white rounded-2xl border-3 border-ink px-7 py-6 shadow-brute-sm">
              <h2 className="font-display text-xl text-ink uppercase mb-3">About this home</h2>
              <p className="text-gray-600 leading-relaxed font-medium">{listing.description}</p>
            </div>
          )}

          {/* Original listing link */}
          {listing.listingUrl && (
            <a
              href={listing.listingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 font-display text-xs uppercase border-2 border-ink px-4 py-1.5 rounded-full hover:bg-sky hover:text-white hover:border-sky transition-all shadow-brute-sm"
            >
              View original listing →
            </a>
          )}

          {/* Comments */}
          <CommentSection listingId={listing.id} />
        </div>

        {/* Right: agent contact + quick facts */}
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

          <div className="bg-white rounded-2xl border-3 border-ink px-6 py-5 shadow-brute-sm">
            <p className="font-display text-xs uppercase tracking-wider text-ink/50 mb-4">Quick Facts</p>
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
    <div className="flex justify-between items-center border-b border-ink/10 pb-2 last:border-0">
      <dt className="font-display text-xs uppercase text-ink/50">{label}</dt>
      <dd className="font-bold text-sm text-ink">{value}</dd>
    </div>
  );
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function PhotoCarousel({ photos, address }: { photos: string[]; address: string }) {
  return (
    <div className="rounded-2xl border-3 border-ink overflow-hidden shadow-brute">
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
      {photos.length > 1 && (
        <div className="flex border-t-3 border-ink">
          {photos.slice(1, 5).map((p, i) => (
            <div key={i} className="relative flex-1 h-20 border-r-3 border-ink last:border-r-0">
              <Image
                src={p}
                alt={`${address} photo ${i + 2}`}
                fill
                className="object-cover hover:opacity-90 transition-opacity"
                sizes="15vw"
              />
              {i === 3 && photos.length > 5 && (
                <div className="absolute inset-0 bg-ink/60 flex items-center justify-center text-white font-display text-sm uppercase">
                  +{photos.length - 5}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
