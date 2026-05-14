/**
 * ListingFacts — the compressed facts grid. Not a slab of details. A
 * tight 2x3 grid of the things buyers actually scan for, plus an inline
 * map preview. Server component.
 */

import MapPreview from "@/components/MapPreview";

interface Props {
  bedrooms: number | null;
  bathrooms: number | null;
  sqft: number | null;
  lotSqft: number | null;
  yearBuilt: number | null;
  propertyType: string;
  listingType: string;
  pricePerSqft: string | null;
  parking: string | null;
  latitude: number | null;
  longitude: number | null;
  address: string;
  city: string;
  state: string;
  neighborhood: string | null;
  zip: string;
}

function lotDisplay(lotSqft: number | null) {
  if (lotSqft == null || lotSqft <= 0) return null;
  return lotSqft >= 43560
    ? `${(lotSqft / 43560).toFixed(2)} acres`
    : `${lotSqft.toLocaleString()} sqft`;
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1).replace(/_/g, " ");
}

export default function ListingFacts({
  bedrooms,
  bathrooms,
  sqft,
  lotSqft,
  yearBuilt,
  propertyType,
  listingType,
  pricePerSqft,
  parking,
  latitude,
  longitude,
  address,
  city,
  state,
  neighborhood,
  zip,
}: Props) {
  const facts: { label: string; value: string }[] = [];
  if (bedrooms != null) facts.push({ label: "Beds", value: String(bedrooms) });
  if (bathrooms != null) facts.push({ label: "Baths", value: String(bathrooms) });
  if (sqft != null) facts.push({ label: "Sqft", value: sqft.toLocaleString() });
  const lot = lotDisplay(lotSqft);
  if (lot) facts.push({ label: "Lot", value: lot });
  if (yearBuilt != null) facts.push({ label: "Built", value: String(yearBuilt) });
  if (parking) facts.push({ label: "Parking", value: parking });
  if (pricePerSqft) facts.push({ label: "$/sqft", value: pricePerSqft });
  facts.push({
    label: "Type",
    value: `${capitalize(propertyType)}${listingType === "rent" ? " · Rent" : " · Sale"}`,
  });

  return (
    <section aria-label="Quick facts" className="relative">
      {/* Sticky address ribbon — slim, persistent */}
      <div className="sticky top-0 z-10 -mx-4 sm:-mx-6 mb-4 px-4 sm:px-6 py-2.5 bg-bg/85 backdrop-blur-md border-y border-divider">
        <p className="text-[12px] text-tertiary uppercase tracking-[0.14em] font-bold leading-none">
          The block
        </p>
        <p className="mt-0.5 text-white text-[14px] font-bold truncate">
          {address}
          <span className="text-secondary font-medium"> · {city}, {state} {zip}</span>
        </p>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
        {facts.map((f) => (
          <div
            key={f.label}
            className="rounded-xl border border-divider bg-surface px-3 py-2.5"
          >
            <p className="text-[10px] uppercase tracking-[0.14em] font-bold text-tertiary">
              {f.label}
            </p>
            <p className="mt-0.5 text-white text-[14px] font-bold leading-tight truncate">
              {f.value}
            </p>
          </div>
        ))}
      </div>

      {latitude != null && longitude != null && (
        <div className="mt-4">
          <MapPreview
            latitude={latitude}
            longitude={longitude}
            address={address}
          />
          <div className="mt-2 flex flex-wrap gap-2">
            {neighborhood && (
              <a
                href={`/?city=${encodeURIComponent(neighborhood)}`}
                className="text-[12px] font-semibold text-white bg-surface border border-divider hover:border-amber/30 px-3 py-1.5 rounded-full transition-colors"
              >
                Open {neighborhood} →
              </a>
            )}
            <a
              href={`/?city=${encodeURIComponent(city)}`}
              className="text-[12px] font-semibold text-white bg-surface border border-divider hover:border-amber/30 px-3 py-1.5 rounded-full transition-colors"
            >
              Open {city}, {state} →
            </a>
            {zip && (
              <a
                href={`/community/${encodeURIComponent(zip)}`}
                className="text-[12px] font-semibold text-white bg-surface border border-divider hover:border-amber/30 px-3 py-1.5 rounded-full transition-colors"
              >
                The {zip} community →
              </a>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
