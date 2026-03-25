import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import ListingCard from "@/components/ListingCard";
import type { Metadata } from "next";

/** Convert slug like "laguna-niguel" to title case "Laguna Niguel" */
function slugToCity(slug: string): string {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const cityName = slugToCity(slug);

  const count = await prisma.listing.count({
    where: {
      city: { equals: cityName, mode: "insensitive" },
      status: "active",
    },
  });

  const title = `${cityName} Homes & Apartments — Gwaky`;
  const description = `Browse ${count} listings in ${cityName}. See real takes and unfiltered opinions from locals on Gwaky.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function CityLandingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const cityName = slugToCity(slug);

  const listings = await prisma.listing.findMany({
    where: {
      city: { equals: cityName, mode: "insensitive" },
      status: "active",
    },
    orderBy: { createdAt: "desc" },
    take: 24,
    select: {
      id: true,
      address: true,
      city: true,
      state: true,
      neighborhood: true,
      price: true,
      listingType: true,
      propertyType: true,
      status: true,
      bedrooms: true,
      bathrooms: true,
      sqft: true,
      photos: true,
      agentName: true,
      createdAt: true,
      _count: { select: { comments: true } },
      comments: {
        take: 1,
        orderBy: { createdAt: "desc" },
        select: { name: true, content: true },
      },
    },
  });

  if (listings.length === 0) notFound();

  const totalCount = await prisma.listing.count({
    where: {
      city: { equals: cityName, mode: "insensitive" },
      status: "active",
    },
  });

  const avgPrice =
    listings.length > 0
      ? Math.round(
          listings.reduce((sum, l) => sum + l.price, 0) / listings.length
        )
      : 0;

  // Get the state from the first listing
  const state = listings[0]?.state ?? "";

  const withComments = listings.map((l) => ({
    ...l,
    topComment: l.comments?.[0] ?? null,
  }));

  return (
    <div className="min-h-screen bg-bg">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-[0.04] blur-[120px]"
          style={{
            background: "radial-gradient(circle, #FF4D00, transparent 70%)",
          }}
        />

        <div className="relative max-w-3xl mx-auto px-5 pt-16 pb-10 sm:pt-24 sm:pb-14">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-1.5 text-xs text-tertiary mb-8">
            <Link
              href="/"
              className="hover:text-accent transition-colors font-medium"
            >
              Gwaky
            </Link>
            <span className="text-divider">/</span>
            <span className="text-secondary">{cityName}</span>
          </nav>

          <h1 className="text-[clamp(2.5rem,8vw,4.5rem)] font-extrabold tracking-tighter leading-[0.95] mb-4">
            <span className="text-white">{cityName}</span>
            {state && (
              <span className="text-tertiary text-[0.5em] ml-3 font-bold">
                {state}
              </span>
            )}
          </h1>

          <p className="text-lg sm:text-xl text-white/50 font-medium tracking-tight mb-8 max-w-lg">
            Real takes on real estate in {cityName}. No filter.
          </p>

          {/* Stats bar */}
          <div className="flex flex-wrap items-center gap-6 mb-8">
            <div>
              <p className="text-2xl sm:text-3xl font-extrabold text-white">
                {totalCount}
              </p>
              <p className="text-xs text-tertiary uppercase tracking-wider font-semibold">
                Active Listings
              </p>
            </div>
            <div className="w-px h-10 bg-elevated" />
            <div>
              <p className="text-2xl sm:text-3xl font-extrabold text-accent">
                ${avgPrice.toLocaleString()}
              </p>
              <p className="text-xs text-tertiary uppercase tracking-wider font-semibold">
                Avg Price
              </p>
            </div>
            <div className="w-px h-10 bg-elevated" />
            <div>
              <Link
                href={`/?city=${encodeURIComponent(cityName)}`}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-accent text-white text-sm font-bold rounded-full hover:bg-accent/90 transition-colors"
              >
                Search {cityName} &rarr;
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Listing Grid */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-20">
        <h2 className="text-lg font-bold text-white mb-6">
          {totalCount} listing{totalCount !== 1 ? "s" : ""} in {cityName}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {withComments.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>

        {totalCount > listings.length && (
          <div className="mt-10 text-center">
            <Link
              href={`/?city=${encodeURIComponent(cityName)}`}
              className="inline-flex items-center gap-2 px-6 py-3 bg-surface border border-divider text-white text-sm font-semibold rounded-full hover:border-accent/40 transition-colors"
            >
              View all {totalCount} listings in {cityName} &rarr;
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
