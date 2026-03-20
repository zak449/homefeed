/**
 * Batch enrichment — enriches multiple listings with full photos + description.
 * Called fire-and-forget from server components and API routes.
 */

import { enrichListingDetail } from "@/lib/data-adapters/detail";

/**
 * Enrich a batch of listing IDs (max 5 at a time).
 * Each enrichment is independent — one failure doesn't block others.
 */
export async function enrichBatch(listingIds: string[]): Promise<number> {
  const batch = listingIds.slice(0, 5);
  let successCount = 0;

  // Run sequentially to avoid hammering the API
  for (const id of batch) {
    try {
      await enrichListingDetail(id);
      successCount++;
    } catch (e) {
      console.error(`[EnrichBatch] Error enriching ${id}:`, e);
    }
  }

  if (successCount > 0) {
    console.log(`[EnrichBatch] Enriched ${successCount}/${batch.length} listings`);
  }

  return successCount;
}
