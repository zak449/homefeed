/**
 * Pure scoring functions for listing-to-listing similarity.
 *
 * Everything here is deterministic and side-effect-free so it can be
 * unit-tested without a DB. All scores normalize to [0..1] where 1 means
 * "very similar" and 0 means "no signal".
 */

// ── Types ────────────────────────────────────────────────────────────

export type ScoringListing = {
  id: string;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  zip?: string | null;
  neighborhood?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  price: number;
  listingType?: string | null;
  propertyType?: string | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  sqft?: number | null;
  comments?: Array<{ content: string }>;
};

export type ScoreWeights = {
  geo: number;
  price: number;
  beds: number;
  topic: number;
};

export const DEFAULT_WEIGHTS: ScoreWeights = {
  geo: 0.4,
  price: 0.25,
  beds: 0.15,
  topic: 0.2,
};

// ── Geo ──────────────────────────────────────────────────────────────

const EARTH_MILES = 3959;

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

/** Haversine distance in miles. */
export function haversineMiles(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return EARTH_MILES * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Geo score in [0..1]. Uses lat/lng if both listings have them; otherwise
 * falls back to neighborhood / zip / city match.
 *
 * Distance curve: 1.0 at 0 mi, ~0.5 at 5 mi, ~0.1 at ~20 mi, 0 beyond ~40 mi.
 */
export function geoScore(a: ScoringListing, b: ScoringListing): number {
  if (
    a.latitude != null &&
    a.longitude != null &&
    b.latitude != null &&
    b.longitude != null
  ) {
    const miles = haversineMiles(a.latitude, a.longitude, b.latitude, b.longitude);
    if (miles >= 40) return 0;
    // Smooth exponential decay — distance / 7 is "feels close-ish".
    return Math.max(0, Math.min(1, Math.exp(-miles / 7)));
  }

  // Categorical fallback
  const aHood = (a.neighborhood ?? "").trim().toLowerCase();
  const bHood = (b.neighborhood ?? "").trim().toLowerCase();
  if (aHood && bHood && aHood === bHood) return 0.9;

  const aZip = (a.zip ?? "").trim();
  const bZip = (b.zip ?? "").trim();
  if (aZip && bZip && aZip === bZip) return 0.75;

  const aCity = (a.city ?? "").trim().toLowerCase();
  const bCity = (b.city ?? "").trim().toLowerCase();
  if (aCity && bCity && aCity === bCity) return 0.5;

  const aState = (a.state ?? "").trim().toLowerCase();
  const bState = (b.state ?? "").trim().toLowerCase();
  if (aState && bState && aState === bState) return 0.15;

  return 0;
}

// ── Price ────────────────────────────────────────────────────────────

/**
 * 1.0 inside ±25% bracket, decaying outside. Mismatched listing types
 * (rent vs sale) score 0 because the absolute prices aren't comparable.
 */
export function priceCohortScore(a: ScoringListing, b: ScoringListing): number {
  if (!a.price || !b.price) return 0;
  if (a.listingType && b.listingType && a.listingType !== b.listingType) return 0;

  const base = Math.min(a.price, b.price);
  const diff = Math.abs(a.price - b.price);
  const ratio = diff / base;

  if (ratio <= 0.25) return 1;
  // Decay: 0.5 at 50% diff, ~0.1 at 100% diff
  return Math.max(0, Math.min(1, Math.exp(-(ratio - 0.25) * 2.5)));
}

// ── Beds & baths ─────────────────────────────────────────────────────

/**
 * Combined bed/bath similarity. Each contributes equally. If either side is
 * missing data, that signal returns 0.5 (neutral, not penalizing).
 */
export function bedsBathsScore(a: ScoringListing, b: ScoringListing): number {
  const bedScore = (() => {
    if (a.bedrooms == null || b.bedrooms == null) return 0.5;
    const diff = Math.abs(a.bedrooms - b.bedrooms);
    if (diff === 0) return 1;
    if (diff === 1) return 0.6;
    if (diff === 2) return 0.25;
    return 0.05;
  })();

  const bathScore = (() => {
    if (a.bathrooms == null || b.bathrooms == null) return 0.5;
    const diff = Math.abs(a.bathrooms - b.bathrooms);
    if (diff < 0.5) return 1;
    if (diff < 1.5) return 0.6;
    if (diff < 2.5) return 0.3;
    return 0.05;
  })();

  return bedScore * 0.6 + bathScore * 0.4;
}

// ── Comment topic similarity ────────────────────────────────────────

const STOPWORDS = new Set([
  "a", "an", "the", "and", "or", "but", "if", "of", "to", "in", "on", "at", "by",
  "for", "with", "from", "as", "is", "was", "are", "were", "be", "been", "being",
  "have", "has", "had", "do", "does", "did", "will", "would", "could", "should",
  "may", "might", "must", "can", "this", "that", "these", "those", "i", "you",
  "he", "she", "it", "we", "they", "me", "him", "her", "us", "them", "my", "your",
  "his", "its", "our", "their", "what", "which", "who", "whom", "whose", "when",
  "where", "why", "how", "all", "any", "some", "no", "not", "only", "own", "same",
  "so", "than", "too", "very", "s", "t", "just", "really", "got", "get", "like",
  "lol", "haha", "omg", "tbh", "imo", "yeah", "yes", "ok", "okay", "also", "even",
  "ever", "every", "ya", "u", "ur", "go", "going", "went", "make", "made", "see",
  "saw", "seen", "say", "said", "way", "lot", "much", "still", "back", "here",
  "there",
]);

/**
 * Tokens that get a 2x weight because they're domain-load-bearing. The
 * matcher uses substring containment so e.g. "schools" still hits "school".
 */
const HIGH_VALUE_TERMS = new Set([
  "school", "schools", "district", "elementary", "middle", "high",
  "hoa", "fees", "fee", "dues", "assessment",
  "traffic", "noise", "noisy", "loud", "quiet",
  "view", "views", "ocean", "mountain", "city",
  "parking", "garage", "street",
  "renovated", "remodeled", "updated", "outdated", "dated", "original",
  "kitchen", "bath", "bathroom", "master", "bedroom",
  "yard", "pool", "patio", "garden", "deck",
  "neighbor", "neighbors", "neighborhood", "block", "community",
  "crime", "safe", "safety", "sketchy", "shady",
  "commute", "freeway", "highway", "transit", "walkable", "walkability",
  "flood", "fire", "earthquake", "leak", "mold",
  "investment", "rent", "rental", "appreciation", "flip",
  "overpriced", "underpriced", "deal", "value", "bargain",
  "schools", "park", "parks", "restaurants", "shops", "grocery",
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length >= 3 && !STOPWORDS.has(t));
}

function weightedBag(comments: Array<{ content: string }> | undefined): Map<string, number> {
  const bag = new Map<string, number>();
  if (!comments?.length) return bag;
  for (const c of comments) {
    if (!c?.content) continue;
    const seen = new Set<string>();
    for (const tok of tokenize(c.content)) {
      if (seen.has(tok)) continue; // dedupe within a single comment
      seen.add(tok);
      const weight = HIGH_VALUE_TERMS.has(tok) ? 2 : 1;
      bag.set(tok, (bag.get(tok) ?? 0) + weight);
    }
  }
  return bag;
}

function cosineFromBags(a: Map<string, number>, b: Map<string, number>): number {
  if (a.size === 0 || b.size === 0) return 0;
  let dot = 0;
  let magA = 0;
  let magB = 0;
  for (const v of a.values()) magA += v * v;
  for (const v of b.values()) magB += v * v;
  // iterate the smaller bag for the dot product
  const [small, large] = a.size <= b.size ? [a, b] : [b, a];
  for (const [tok, vSmall] of small) {
    const vLarge = large.get(tok);
    if (vLarge !== undefined) dot += vSmall * vLarge;
  }
  const denom = Math.sqrt(magA) * Math.sqrt(magB);
  if (denom === 0) return 0;
  return dot / denom;
}

/**
 * Bag-of-words cosine similarity over each listing's comments. Real-estate
 * tokens (school, hoa, traffic, view, ...) carry 2x weight.
 */
export function commentTopicScore(a: ScoringListing, b: ScoringListing): number {
  const bagA = weightedBag(a.comments);
  const bagB = weightedBag(b.comments);
  return Math.max(0, Math.min(1, cosineFromBags(bagA, bagB)));
}

// ── Combined ────────────────────────────────────────────────────────

/**
 * Weighted sum of the four signals. Weights are renormalized so callers
 * can pass partial overrides without worrying about the total summing to 1.
 */
export function combinedScore(
  a: ScoringListing,
  b: ScoringListing,
  weights?: Partial<ScoreWeights>,
): number {
  if (a.id === b.id) return 0;
  const w: ScoreWeights = { ...DEFAULT_WEIGHTS, ...weights };
  const total = w.geo + w.price + w.beds + w.topic;
  if (total <= 0) return 0;

  const score =
    w.geo * geoScore(a, b) +
    w.price * priceCohortScore(a, b) +
    w.beds * bedsBathsScore(a, b) +
    w.topic * commentTopicScore(a, b);

  return Math.max(0, Math.min(1, score / total));
}
