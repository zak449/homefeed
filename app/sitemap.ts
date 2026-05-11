import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

const BASE_URL = "https://gwaky.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}`,            lastModified: now, changeFrequency: "daily",   priority: 1.0 },
    { url: `${BASE_URL}/hot-takes`,  lastModified: now, changeFrequency: "hourly",  priority: 0.9 },
    { url: `${BASE_URL}/red-flags`,  lastModified: now, changeFrequency: "daily",   priority: 0.8 },
    { url: `${BASE_URL}/trending`,   lastModified: now, changeFrequency: "hourly",  priority: 0.8 },
    { url: `${BASE_URL}/about`,      lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/faq`,        lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/careers`,    lastModified: now, changeFrequency: "weekly",  priority: 0.4 },
    { url: `${BASE_URL}/contact`,    lastModified: now, changeFrequency: "monthly", priority: 0.4 },
    { url: `${BASE_URL}/privacy`,    lastModified: now, changeFrequency: "monthly", priority: 0.3 },
    { url: `${BASE_URL}/terms`,      lastModified: now, changeFrequency: "monthly", priority: 0.3 },
    { url: `${BASE_URL}/cookies`,    lastModified: now, changeFrequency: "monthly", priority: 0.3 },
  ];

  let listingUrls: MetadataRoute.Sitemap = [];
  let cityUrls: MetadataRoute.Sitemap = [];
  let userUrls: MetadataRoute.Sitemap = [];
  let zipUrls: MetadataRoute.Sitemap = [];

  try {
    const [listings, users, zipCommunities] = await Promise.all([
      prisma.listing.findMany({
        where: { status: "active" },
        select: { id: true, updatedAt: true, city: true },
        orderBy: { updatedAt: "desc" },
        take: 5000,
      }),
      prisma.user
        .findMany({
          where: { username: { not: null } },
          select: { username: true, updatedAt: true },
          orderBy: { updatedAt: "desc" },
          take: 5000,
        })
        .catch(() => []),
      prisma.zipCommunity
        .findMany({
          select: { zipCode: true, updatedAt: true },
          orderBy: { updatedAt: "desc" },
          take: 5000,
        })
        .catch(() => []),
    ]);

    listingUrls = listings.map((l) => ({
      url: `${BASE_URL}/listing/${l.id}`,
      lastModified: l.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

    const cities = Array.from(
      new Set(
        listings
          .map((l) => l.city)
          .filter((c): c is string => typeof c === "string" && c.length > 0),
      ),
    );
    cityUrls = cities.map((city) => ({
      url: `${BASE_URL}/city/${encodeURIComponent(city.toLowerCase().replace(/\s+/g, "-"))}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }));

    userUrls = users.flatMap((u) =>
      u.username
        ? [
            {
              url: `${BASE_URL}/u/${encodeURIComponent(u.username)}`,
              lastModified: u.updatedAt,
              changeFrequency: "weekly" as const,
              priority: 0.5,
            },
          ]
        : [],
    );

    zipUrls = zipCommunities.map((z) => ({
      url: `${BASE_URL}/community/${encodeURIComponent(z.zipCode)}`,
      lastModified: z.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }));

    return [...staticPages, ...cityUrls, ...zipUrls, ...userUrls, ...listingUrls];
  } catch {
    return staticPages;
  }
}
