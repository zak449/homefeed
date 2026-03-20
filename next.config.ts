import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "photos.zillowstatic.com" },
      { protocol: "https", hostname: "cdn.redfin.com" },
      { protocol: "https", hostname: "**.rdcpix.com" },
      { protocol: "https", hostname: "ar.rdcpix.com" },
      { protocol: "https", hostname: "ap.rdcpix.com" },
    ],
  },
};

export default nextConfig;
