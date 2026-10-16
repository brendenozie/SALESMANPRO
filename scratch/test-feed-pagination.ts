import { getGhubaFeed } from "@/lib/ghuba-feed-service";

async function main() {
  console.log("=== Testing getGhubaFeed Pagination ===");
  let cursor: string | null = null;
  let page = 1;

  while (page <= 5) {
    console.log(`\nFetching Page ${page} with cursor:`, cursor);
    const result = await getGhubaFeed({
      limit: 10,
      cursor,
    });

    console.log(`Page ${page} returned: ${result.items.length} items. hasMore: ${result.hasMore}. nextCursor: ${result.nextCursor}`);
    if (result.items.length > 0) {
      console.log(`First item id: ${result.items[0].id}, Last item id: ${result.items[result.items.length - 1].id}`);
    }

    if (!result.hasMore || !result.nextCursor || result.items.length === 0) {
      console.log("Pagination terminated at page", page);
      break;
    }

    cursor = result.nextCursor;
    page++;
  }
}

main().catch(console.error).finally(() => process.exit(0));
