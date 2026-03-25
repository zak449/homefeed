import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: "https://gwaky.com", changeFrequency: "daily", priority: 1.0 },
    { url: "https://gwaky.com/hot-takes", changeFrequency: "hourly", priority: 0.9 },
    { url: "https://gwaky.com/red-flags", changeFrequency: "daily", priority: 0.7 },
    { url: "https://gwaky.com/about", changeFrequency: "monthly", priority: 0.5 },
    { url: "https://gwaky.com/faq", changeFrequency: "monthly", priority: 0.4 },
    { url: "https://gwaky.com/privacy", changeFrequency: "monthly", priority: 0.3 },
    { url: "https://gwaky.com/terms", changeFrequency: "monthly", priority: 0.3 },
  ];

  try {
    const listings = await prisma.listing.findMany({
      where: { status: "active" },
      select: { id: true, updatedAt: true, city: true },
      orderBy: { updatedAt: "desc" },
      take: 1000,
    });

    const listingUrls = listings.map((l) => ({
      url: `https://gwaky.com/listing/${l.id}`,
      lastModified: l.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

    const cities = [...new Set(listings.map((l) => l.city))];
    const cityUrls = cities.map((city) => ({
      url: `https://gwaky.com/city/${city.toLowerCase().replace(/\s+/g, "-")}`,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }));

    return [...staticPages, ...cityUrls, ...listingUrls];
  } catch {
    return staticPages;
  }
}
