import { getGhubaFeed } from "@/lib/ghuba-feed-service";

async function main() {
  console.log("=== Testing ALL pages of getGhubaFeed ===");
  let cursor: string | null = null;
  let page = 1;
  let totalItems = 0;
  const seenIds = new Set<string>();

  while (true) {
    const result = await getGhubaFeed({
      limit: 12,
      cursor,
    });

    const newIds = result.items.filter(i => !seenIds.has(i.id));
    for (const i of result.items) seenIds.add(i.id);
    totalItems += newIds.length;

    console.log(`Page ${page}: got ${result.items.length} items (${newIds.length} new, cumulative: ${totalItems}). hasMore=${result.hasMore}, nextCursor=${result.nextCursor ? result.nextCursor.substring(0, 30) + '...' : null}`);

    if (!result.hasMore || !result.nextCursor || result.items.length === 0) {
      console.log(`Finished at page ${page}. Total unique items retrieved: ${totalItems}`);
      break;
    }

    cursor = result.nextCursor;
    page++;
    if (page > 20) break;
  }
}

main().catch(console.error).finally(() => process.exit(0));
