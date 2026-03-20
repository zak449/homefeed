import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ── Fake users ──────────────────────────────────────────────
const USERS = [
  { name: "Sarah M.", email: "sarah.m@gmail.com" },
  { name: "Jake", email: "jake.re@outlook.com" },
  { name: "Christina L.", email: "christina.l@gmail.com" },
  { name: "Marcus", email: "marcus.watts@gmail.com" },
  { name: "Priya", email: "priya.k@yahoo.com" },
  { name: "Devon W.", email: "devon.w@gmail.com" },
  { name: "Olivia", email: "olivia.james@outlook.com" },
  { name: "Tyler R.", email: "tyler.r@gmail.com" },
  { name: "Aisha", email: "aisha.h@gmail.com" },
  { name: "Ryan K.", email: "ryan.k@outlook.com" },
  { name: "Megan", email: "megan.taylor@gmail.com" },
  { name: "Jason P.", email: "jason.p@yahoo.com" },
  { name: "Luna", email: "luna.g@gmail.com" },
  { name: "Chris", email: "chris.m@outlook.com" },
  { name: "Natalie B.", email: "natalie.b@gmail.com" },
  { name: "Alex", email: "alex.rent@gmail.com" },
  { name: "Jordan T.", email: "jordan.t@yahoo.com" },
  { name: "Sam", email: "sam.l@gmail.com" },
  { name: "Rachel H.", email: "rachel.h@outlook.com" },
  { name: "Mike D.", email: "mike.d@gmail.com" },
];

const REACTION_TYPES = ["\u2764\uFE0F", "\uD83D\uDD25", "\uD83D\uDE02", "\uD83D\uDE2E", "\uD83D\uDC80"];

// ── Comment templates ───────────────────────────────────────
// Each function receives the listing and returns a comment string.

type Listing = {
  id: string;
  address: string;
  city: string;
  state: string;
  price: number;
  listingType: string;
  propertyType: string;
  bedrooms: number | null;
  bathrooms: number | null;
  sqft: number | null;
  yearBuilt: number | null;
  neighborhood: string | null;
  description: string | null;
};

function formatPrice(price: number): string {
  if (price >= 1_000_000) return `$${(price / 1_000_000).toFixed(1)}M`;
  if (price >= 1_000) return `$${(price / 1_000).toFixed(0)}k`;
  return `$${price.toLocaleString()}`;
}

function monthlyOrTotal(listing: Listing): string {
  return listing.listingType === "rent"
    ? `$${listing.price.toLocaleString()}/mo`
    : formatPrice(listing.price);
}

function bedbath(listing: Listing): string {
  const parts: string[] = [];
  if (listing.bedrooms) parts.push(`${listing.bedrooms}bd`);
  if (listing.bathrooms) parts.push(`${listing.bathrooms}ba`);
  return parts.join("/") || "this place";
}

// Template generators grouped by category
const PRICE_COMMENTS = [
  (l: Listing) =>
    `${monthlyOrTotal(l)} for a ${bedbath(l)} in ${l.city}? That's actually not bad compared to what I've been seeing lately.`,
  (l: Listing) =>
    `This is actually a steal for ${l.city}. I saw a comparable ${l.propertyType} down the street listed for way more.`,
  (l: Listing) =>
    l.listingType === "rent"
      ? `${monthlyOrTotal(l)} seems steep but honestly that's just the market in ${l.city} right now. Everything decent is in this range.`
      : `At ${monthlyOrTotal(l)} you're getting a lot of house. ${l.sqft ? `${l.sqft.toLocaleString()} sqft` : "This"} is solid for the area.`,
  (l: Listing) =>
    l.listingType === "rent"
      ? `Way overpriced. Similar ${l.propertyType}s in ${l.city} are going for at least $${Math.round(l.price * 0.85).toLocaleString()}. I'd negotiate hard.`
      : `In this market? ${monthlyOrTotal(l)} feels high. I'd wait a few months and see if it comes down.`,
  (l: Listing) =>
    l.listingType === "rent"
      ? `${monthlyOrTotal(l)} for a rental? At that price point you should seriously consider buying something.`
      : `Just ran the numbers and at ${monthlyOrTotal(l)}, your monthly payment would be less than renting something comparable here. Worth it.`,
  (l: Listing) =>
    `Prices in ${l.city} have been wild lately. ${monthlyOrTotal(l)} would've been unheard of two years ago for a ${l.propertyType} like this.`,
];

const NEIGHBORHOOD_COMMENTS = [
  (l: Listing) =>
    `I lived in ${l.city} for three years. Great area for walkability — tons of restaurants and shops nearby.`,
  (l: Listing) =>
    `This part of ${l.city} is super underrated. Way quieter than people expect but still close to everything.`,
  (l: Listing) =>
    `Fair warning: parking around ${l.address.split(",")[0].replace(/\d+\s*/, "")} can be a nightmare on weekends. Just something to keep in mind.`,
  (l: Listing) =>
    `The neighborhood around here has gotten so much better over the last few years. New coffee shops, restaurants — it's really turning a corner.`,
  (l: Listing) =>
    `I know this area. Grocery stores are close, freeway access is easy, and the neighbors are generally pretty chill. Solid location.`,
  (l: Listing) =>
    l.neighborhood
      ? `${l.neighborhood} is one of the best pockets of ${l.city} in my opinion. You're close to everything without being in the chaos.`
      : `Great spot in ${l.city}. You're close to everything without being right in the middle of the noise.`,
  (l: Listing) =>
    `Be aware the traffic on the main roads near here gets pretty bad during rush hour. But off-peak it's a breeze.`,
];

const PROPERTY_COMMENTS = [
  (l: Listing) =>
    l.sqft
      ? `${l.sqft.toLocaleString()} sqft is really generous for a ${bedbath(l)}. Most ${l.propertyType}s I've toured in ${l.city} are way smaller.`
      : `The layout looks really open and functional. Much better use of space than most ${l.propertyType}s I've seen around here.`,
  (l: Listing) =>
    l.yearBuilt
      ? l.yearBuilt >= 2015
        ? `Built in ${l.yearBuilt} — so you're getting modern construction with all the newer building codes. That's a plus.`
        : `${l.yearBuilt} build — might want to check on the plumbing and electrical. Those older ${l.propertyType}s can have surprises.`
      : `The finishes in the photos look really clean. Definitely updated recently.`,
  (l: Listing) =>
    `That kitchen was definitely renovated recently. Original units in this area look nothing like this. Nice upgrade.`,
  (l: Listing) =>
    l.bedrooms && l.bedrooms >= 3
      ? `${l.bedrooms} bedrooms is perfect for a family or roommate setup. Hard to find that much space in ${l.city}.`
      : `Cozy setup but honestly for ${l.city} this is pretty standard. Make the most of the space you get.`,
  (l: Listing) =>
    `The natural light in those photos looks amazing. Which direction does this unit face? South-facing would be the dream.`,
  (l: Listing) =>
    `Those floors are gorgeous — looks like real hardwood, not the laminate stuff you see in most rentals around here.`,
];

const QUESTION_COMMENTS = [
  (l: Listing) =>
    `Anyone know if this complex allows dogs? Looking for pet-friendly in ${l.city} and it's been impossible.`,
  (l: Listing) =>
    `Does anyone know what utilities typically run in a ${l.propertyType} this size in ${l.city}? Trying to budget everything out.`,
  (l: Listing) =>
    `Is this place still available? I reached out to the listing agent but haven't heard back in two days.`,
  (l: Listing) =>
    `How's the noise level around here? I work from home and need somewhere actually quiet during the day.`,
  (l: Listing) =>
    `Any idea if there's in-unit washer/dryer or is it shared? That's a dealbreaker for me.`,
  (l: Listing) =>
    l.listingType === "rent"
      ? `What's the lease situation — are they doing month-to-month or requiring 12 months minimum?`
      : `Has anyone gotten pre-approved in the ${l.city} area recently? How are rates looking?`,
];

const HOT_TAKE_COMMENTS = [
  (l: Listing) =>
    l.listingType === "rent"
      ? `${monthlyOrTotal(l)} for a rental?? In THIS economy? Someone's dreaming.`
      : `The housing market is so cooked. ${monthlyOrTotal(l)} for this? Five years ago this was half that.`,
  (l: Listing) =>
    `Everyone saying this is overpriced hasn't looked at what's actually available in ${l.city} right now. This is the market. Deal with it.`,
  (l: Listing) =>
    `Hot take: ${l.city} is still undervalued compared to where it's headed. Lock something in now or regret it.`,
  (l: Listing) =>
    `People are sleeping on ${l.propertyType}s in ${l.city}. Mark my words, in 3 years everyone's going to wish they moved here when they had the chance.`,
];

const LIFESTYLE_COMMENTS = [
  (l: Listing) =>
    `Lived near here last year. The Sunday farmers market is incredible — definitely a perk of this area.`,
  (l: Listing) =>
    `The running/biking trails near ${l.city} are seriously underrated. If you're into outdoor stuff this is a great spot.`,
  (l: Listing) =>
    `There's a really solid coffee shop within walking distance of here. That alone would sell me on the location.`,
  (l: Listing) =>
    `The food scene in ${l.city} has exploded lately. You won't run out of dinner options living here.`,
  (l: Listing) =>
    `If you're WFH, this area is perfect. Quiet during the day, good coffee nearby, and you can actually get a walk in between meetings.`,
];

const MARKET_COMMENTS = [
  (l: Listing) =>
    l.listingType === "rent"
      ? `Rental prices in ${l.city} are finally starting to cool a little. This would've been more six months ago.`
      : `The ${l.city} market has been sitting longer than usual. Might have some negotiating room here.`,
  (l: Listing) =>
    `I've been tracking ${l.city} listings for months. Inventory is up and prices are leveling off. Good time to be looking.`,
  (l: Listing) =>
    `Compared to the rest of ${l.state}, ${l.city} is still relatively affordable for what you get. Won't last forever though.`,
  (l: Listing) =>
    `This area is getting a lot of interest from remote workers. Expect competition — good listings don't last more than a few days.`,
  (l: Listing) =>
    `Just a heads up: I saw three similar ${l.propertyType}s in ${l.city} go pending within the last week. If you like it, move fast.`,
];

const ALL_COMMENT_POOLS = [
  PRICE_COMMENTS,
  NEIGHBORHOOD_COMMENTS,
  PROPERTY_COMMENTS,
  QUESTION_COMMENTS,
  HOT_TAKE_COMMENTS,
  LIFESTYLE_COMMENTS,
  MARKET_COMMENTS,
];

// ── Helpers ─────────────────────────────────────────────────

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickN<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomDate(daysBack: number): Date {
  const now = Date.now();
  const ms = now - Math.random() * daysBack * 24 * 60 * 60 * 1000;
  return new Date(ms);
}

// ── Main ────────────────────────────────────────────────────

async function main() {
  console.log("Fetching active listings...");
  const listings = await prisma.listing.findMany({
    where: { status: "active" },
  });

  console.log(`Found ${listings.length} active listings.`);
  if (listings.length === 0) {
    console.log("No active listings to seed comments on. Exiting.");
    return;
  }

  let totalComments = 0;
  let totalReactions = 0;

  for (const listing of listings) {
    const numComments = randInt(3, 8);
    // Pick unique users for this listing
    const commentUsers = pickN(USERS, numComments);
    // Pick a spread of comment categories (no repeat categories if possible)
    const pools = pickN(ALL_COMMENT_POOLS, Math.min(numComments, ALL_COMMENT_POOLS.length));

    for (let i = 0; i < numComments; i++) {
      const user = commentUsers[i];
      const pool = pools[i % pools.length];
      const templateFn = pick(pool);
      const content = templateFn(listing as unknown as Listing);
      const createdAt = randomDate(7);

      const comment = await prisma.comment.create({
        data: {
          listingId: listing.id,
          name: user.name,
          email: user.email,
          content,
          createdAt,
        },
      });

      totalComments++;

      // Add 1-3 reactions from OTHER users
      const numReactions = randInt(1, 3);
      const reactors = pickN(
        USERS.filter((u) => u.email !== user.email),
        numReactions
      );

      for (const reactor of reactors) {
        const type = pick(REACTION_TYPES);
        try {
          await prisma.reaction.create({
            data: {
              commentId: comment.id,
              email: reactor.email,
              type,
              createdAt: new Date(createdAt.getTime() + randInt(60_000, 3_600_000)),
            },
          });
          totalReactions++;
        } catch {
          // unique constraint — same user, same type on same comment; skip
        }
      }
    }

    console.log(
      `  ${listing.address.substring(0, 50).padEnd(50)} -> ${numComments} comments`
    );
  }

  console.log(`\nDone! Created ${totalComments} comments and ${totalReactions} reactions.`);

  // Verification
  const commentCount = await prisma.comment.count();
  const reactionCount = await prisma.reaction.count();
  console.log(`\nVerification — total in DB: ${commentCount} comments, ${reactionCount} reactions.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
