/**
 * Top 50 US metros for the primary-market typeahead in /onboarding.
 *
 * `code` is what we persist (stable). `label` is what we render.
 * `aliases` covers what users will type ("NYC", "the Bay", "DFW").
 *
 * Ordering is by metro population — ties broken by state-alpha so
 * the typeahead's first hit is rarely surprising.
 */

export type MarketEntry = {
  code: string;
  label: string;
  aliases: string[];
};

export const MARKETS: MarketEntry[] = [
  { code: "nyc", label: "New York City, NY", aliases: ["nyc", "new york", "manhattan", "brooklyn", "queens", "bronx"] },
  { code: "la", label: "Los Angeles, CA", aliases: ["la", "los angeles", "socal"] },
  { code: "chi", label: "Chicago, IL", aliases: ["chi", "chicago", "chitown"] },
  { code: "dfw", label: "Dallas–Fort Worth, TX", aliases: ["dfw", "dallas", "fort worth", "ft worth"] },
  { code: "hou", label: "Houston, TX", aliases: ["houston", "htx"] },
  { code: "dc", label: "Washington, DC", aliases: ["dc", "washington", "the district"] },
  { code: "mia", label: "Miami, FL", aliases: ["miami", "south florida", "miami-dade"] },
  { code: "phl", label: "Philadelphia, PA", aliases: ["philly", "philadelphia"] },
  { code: "atl", label: "Atlanta, GA", aliases: ["atl", "atlanta"] },
  { code: "phx", label: "Phoenix, AZ", aliases: ["phoenix", "phx", "valley of the sun"] },
  { code: "bos", label: "Boston, MA", aliases: ["boston", "bos", "the t"] },
  { code: "sf", label: "San Francisco, CA", aliases: ["sf", "san francisco", "the city", "bay area"] },
  { code: "rdu", label: "Raleigh–Durham, NC", aliases: ["raleigh", "durham", "rdu", "the triangle"] },
  { code: "det", label: "Detroit, MI", aliases: ["detroit", "the d"] },
  { code: "sea", label: "Seattle, WA", aliases: ["seattle", "sea"] },
  { code: "msp", label: "Minneapolis–St. Paul, MN", aliases: ["minneapolis", "st paul", "twin cities", "msp"] },
  { code: "sd", label: "San Diego, CA", aliases: ["san diego", "sd"] },
  { code: "tpa", label: "Tampa, FL", aliases: ["tampa", "tpa", "tampa bay"] },
  { code: "den", label: "Denver, CO", aliases: ["denver", "den", "front range"] },
  { code: "stl", label: "St. Louis, MO", aliases: ["st louis", "stl", "saint louis"] },
  { code: "bal", label: "Baltimore, MD", aliases: ["baltimore", "charm city"] },
  { code: "clt", label: "Charlotte, NC", aliases: ["charlotte", "clt", "the queen city"] },
  { code: "orl", label: "Orlando, FL", aliases: ["orlando", "orl"] },
  { code: "sat", label: "San Antonio, TX", aliases: ["san antonio", "sat"] },
  { code: "por", label: "Portland, OR", aliases: ["portland", "pdx"] },
  { code: "sac", label: "Sacramento, CA", aliases: ["sacramento", "sac"] },
  { code: "pit", label: "Pittsburgh, PA", aliases: ["pittsburgh", "pit", "the burgh"] },
  { code: "lv", label: "Las Vegas, NV", aliases: ["vegas", "las vegas"] },
  { code: "cin", label: "Cincinnati, OH", aliases: ["cincinnati", "cincy"] },
  { code: "kc", label: "Kansas City, MO", aliases: ["kansas city", "kc"] },
  { code: "cle", label: "Cleveland, OH", aliases: ["cleveland", "cle", "the land"] },
  { code: "col", label: "Columbus, OH", aliases: ["columbus", "cbus"] },
  { code: "ind", label: "Indianapolis, IN", aliases: ["indianapolis", "indy"] },
  { code: "aus", label: "Austin, TX", aliases: ["austin", "atx"] },
  { code: "nash", label: "Nashville, TN", aliases: ["nashville", "nash"] },
  { code: "vir", label: "Virginia Beach–Norfolk, VA", aliases: ["virginia beach", "norfolk", "hampton roads"] },
  { code: "prov", label: "Providence, RI", aliases: ["providence", "rhode island"] },
  { code: "mke", label: "Milwaukee, WI", aliases: ["milwaukee", "mke"] },
  { code: "jax", label: "Jacksonville, FL", aliases: ["jacksonville", "jax"] },
  { code: "okc", label: "Oklahoma City, OK", aliases: ["oklahoma city", "okc"] },
  { code: "mem", label: "Memphis, TN", aliases: ["memphis"] },
  { code: "rich", label: "Richmond, VA", aliases: ["richmond", "rva"] },
  { code: "no", label: "New Orleans, LA", aliases: ["new orleans", "nola"] },
  { code: "lou", label: "Louisville, KY", aliases: ["louisville"] },
  { code: "sl", label: "Salt Lake City, UT", aliases: ["salt lake", "slc"] },
  { code: "har", label: "Hartford, CT", aliases: ["hartford"] },
  { code: "buf", label: "Buffalo, NY", aliases: ["buffalo"] },
  { code: "bir", label: "Birmingham, AL", aliases: ["birmingham"] },
  { code: "roc", label: "Rochester, NY", aliases: ["rochester"] },
  { code: "abq", label: "Albuquerque, NM", aliases: ["albuquerque", "abq", "burque"] },
];

/**
 * Loose-match search. Used by the typeahead input. Falls through to
 * substring match on label, then alias match.
 *
 * Returns at most `limit` results, ordered by how strong the match is.
 */
export function searchMarkets(q: string, limit = 8): MarketEntry[] {
  const query = q.trim().toLowerCase();
  if (!query) return MARKETS.slice(0, limit);

  const exact: MarketEntry[] = [];
  const startsWith: MarketEntry[] = [];
  const includes: MarketEntry[] = [];

  for (const m of MARKETS) {
    const label = m.label.toLowerCase();
    if (label === query || m.code === query || m.aliases.includes(query)) {
      exact.push(m);
    } else if (label.startsWith(query) || m.aliases.some((a) => a.startsWith(query))) {
      startsWith.push(m);
    } else if (label.includes(query) || m.aliases.some((a) => a.includes(query))) {
      includes.push(m);
    }
  }
  return [...exact, ...startsWith, ...includes].slice(0, limit);
}

export function getMarketLabel(code: string): string {
  return MARKETS.find((m) => m.code === code)?.label ?? code;
}
