import { ImageResponse } from "next/og";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const listing = await prisma.listing.findUnique({
    where: { id },
    select: {
      address: true,
      city: true,
      state: true,
      zip: true,
      price: true,
      listingType: true,
      photos: true,
      bedrooms: true,
      bathrooms: true,
      sqft: true,
    },
  });

  if (!listing) {
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#0A0A0A",
            color: "#fff",
            fontSize: 48,
            fontWeight: 700,
          }}
        >
          Listing Not Found
        </div>
      ),
      { ...size },
    );
  }

  const photo = (listing.photos as string[])?.[0] || "";
  const isRent = listing.listingType === "rent";
  const price = isRent
    ? `$${listing.price.toLocaleString()}/mo`
    : `$${listing.price.toLocaleString()}`;

  const stats: string[] = [];
  if (listing.bedrooms != null) stats.push(`${listing.bedrooms} bd`);
  if (listing.bathrooms != null) stats.push(`${listing.bathrooms} ba`);
  if (listing.sqft != null) stats.push(`${listing.sqft.toLocaleString()} sqft`);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          backgroundColor: "#0A0A0A",
        }}
      >
        {/* Background photo */}
        {photo && (
          <img
            src={photo}
            alt=""
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        )}

        {/* Dark gradient overlay */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "70%",
            display: "flex",
            background:
              "linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.7) 50%, rgba(0,0,0,0) 100%)",
          }}
        />

        {/* Gwaky wordmark — top left */}
        <div
          style={{
            position: "absolute",
            top: 32,
            left: 40,
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <div
            style={{
              fontSize: 28,
              fontWeight: 800,
              color: "#FF4D00",
              letterSpacing: "-0.02em",
            }}
          >
            Gwaky
          </div>
        </div>

        {/* Content — bottom */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            padding: "0 48px 44px 48px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Price */}
          <div
            style={{
              fontSize: 72,
              fontWeight: 800,
              color: "#FFFFFF",
              lineHeight: 1,
              letterSpacing: "-0.03em",
            }}
          >
            {price}
          </div>

          {/* Address */}
          <div
            style={{
              fontSize: 28,
              color: "rgba(255,255,255,0.8)",
              marginTop: 12,
              lineHeight: 1.3,
            }}
          >
            {listing.address} · {listing.city}, {listing.state} {listing.zip}
          </div>

          {/* Stats row */}
          {stats.length > 0 && (
            <div
              style={{
                display: "flex",
                gap: 24,
                marginTop: 20,
              }}
            >
              {stats.map((stat) => (
                <div
                  key={stat}
                  style={{
                    fontSize: 22,
                    color: "rgba(255,255,255,0.6)",
                    backgroundColor: "rgba(255,255,255,0.1)",
                    padding: "8px 20px",
                    borderRadius: 100,
                    fontWeight: 600,
                  }}
                >
                  {stat}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    ),
    { ...size },
  );
}
