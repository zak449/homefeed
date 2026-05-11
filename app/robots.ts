import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/admin/",
          "/onboarding",
          "/onboarding/",
          "/profile/edit",
          "/profile/edit/",
          "/notifications",
          "/notifications/",
          "/saved",
          "/saved/",
          "/login",
          "/login/",
        ],
      },
    ],
    sitemap: "https://gwaky.com/sitemap.xml",
    host: "https://gwaky.com",
  };
}
