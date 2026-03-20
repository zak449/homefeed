import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function checkPhotoUrl(url: string): Promise<{ status: number | string; ok: boolean }> {
  try {
    const res = await fetch(url, { method: "HEAD", redirect: "follow" });
    return { status: res.status, ok: res.ok };
  } catch (e: any) {
    return { status: e.message || "FETCH_ERROR", ok: false };
  }
}

async function main() {
  // Fetch 20 listings that have at least one photo
  const listings = await prisma.listing.findMany({
    where: {
      photos: { isEmpty: false },
    },
    select: {
      id: true,
      address: true,
      source: true,
      photos: true,
    },
    take: 20,
    orderBy: { createdAt: "desc" },
  });

  console.log(`Found ${listings.length} listings with photos\n`);

  // Analyze URL patterns
  const allUrls = listings.flatMap((l) => l.photos);
  const patterns = new Map<string, number>();
  for (const url of allUrls) {
    try {
      const u = new URL(url);
      const hostAndPathPattern = u.hostname + " | " + u.pathname.replace(/[a-f0-9]{10,}/gi, "<ID>").replace(/\d{5,}/g, "<NUM>");
      patterns.set(hostAndPathPattern, (patterns.get(hostAndPathPattern) || 0) + 1);
    } catch {
      patterns.set("INVALID_URL: " + url.slice(0, 80), 1);
    }
  }

  console.log("=== URL PATTERNS ===");
  for (const [pattern, count] of [...patterns.entries()].sort((a, b) => b[1] - a[1])) {
    console.log(`  [${count}x] ${pattern}`);
  }
  console.log();

  // Check first photo of each listing
  console.log("=== CHECKING FIRST PHOTO PER LISTING ===");
  let broken = 0;
  let working = 0;

  for (const listing of listings) {
    const firstPhoto = listing.photos[0];
    const result = await checkPhotoUrl(firstPhoto);

    if (!result.ok) {
      broken++;
      console.log(`BROKEN [${result.status}] ${listing.address}`);
      console.log(`  URL: ${firstPhoto}`);

      // Try alternative URL patterns
      const alternatives = generateAlternatives(firstPhoto);
      for (const alt of alternatives) {
        const altResult = await checkPhotoUrl(alt.url);
        if (altResult.ok) {
          console.log(`  WORKS with ${alt.label}: ${alt.url}`);
        }
      }
    } else {
      working++;
      console.log(`OK     [${result.status}] ${listing.address}`);
      console.log(`  URL: ${firstPhoto}`);
    }
  }

  console.log(`\n=== SUMMARY ===`);
  console.log(`Working: ${working}/${listings.length}`);
  console.log(`Broken:  ${broken}/${listings.length}`);
  console.log(`Total photos in DB across these listings: ${allUrls.length}`);

  // Show some raw sample URLs
  console.log("\n=== SAMPLE RAW URLS (first 5 listings, first photo each) ===");
  for (const l of listings.slice(0, 5)) {
    console.log(`  ${l.photos[0]}`);
  }
}

function generateAlternatives(url: string): { label: string; url: string }[] {
  const alts: { label: string; url: string }[] = [];

  // Try different size suffixes for rdcpix.com URLs
  if (url.includes("rdcpix.com") || url.includes("rdc-") || url.includes("realtor")) {
    // Try removing size suffix (e.g., -w480_h360 or similar)
    const noSize = url.replace(/-[a-z]\d+[_x]\d+/gi, "");
    if (noSize !== url) alts.push({ label: "no-size-suffix", url: noSize });

    // Try different size suffixes
    const sizePatterns = [
      { regex: /(-[a-z])(\d+[_x]\d+)/gi, replacement: "-l" },
      { regex: /(\/[^/]+)-[a-z]\d*\.jpg/i, replacement: "$1-l.jpg" },
    ];

    // Try .jpg -> different extensions
    if (url.endsWith(".jpg")) {
      alts.push({ label: "webp", url: url.replace(/\.jpg$/, ".webp") });
    }

    // Try adding/removing 'l', 'w', 'o', 's' suffixes before extension
    const suffixMatch = url.match(/^(.+?)(-[lswot])?(\.(?:jpg|jpeg|png|webp))$/i);
    if (suffixMatch) {
      const [, base, , ext] = suffixMatch;
      for (const s of ["-l", "-w", "-o", "-s", ""]) {
        const candidate = base + s + ext;
        if (candidate !== url) {
          alts.push({ label: `suffix=${s || "none"}`, url: candidate });
        }
      }
    }

    // Try ap.rdcpix.com vs ar.rdcpix.com
    if (url.includes("ap.rdcpix.com")) {
      alts.push({ label: "ar-subdomain", url: url.replace("ap.rdcpix.com", "ar.rdcpix.com") });
    }
    if (url.includes("ar.rdcpix.com")) {
      alts.push({ label: "ap-subdomain", url: url.replace("ar.rdcpix.com", "ap.rdcpix.com") });
    }
  }

  return alts;
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
