import { SearchService } from "../lib/search/searchService";

async function main() {
  console.log("=== DIAGNOSTIC: Testing SearchService.searchListings Pagination ===");
  
  // Page 1
  const page1 = await SearchService.searchListings({
    limit: 10,
    scope: "GHUBA",
    sort: "newest",
  });
  console.log(`Page 1: ${page1.data.length} items. nextCursor: ${page1.meta?.nextCursor}`);
  const p1Ids = page1.data.map(d => d.id);
  console.log("Page 1 IDs:", p1Ids);

  if (!page1.meta?.nextCursor) {
    console.log("No next cursor returned!");
    return;
  }

  // Page 2 with cursor
  const page2 = await SearchService.searchListings({
    limit: 10,
    scope: "GHUBA",
    sort: "newest",
    cursor: page1.meta.nextCursor,
  });
  console.log(`Page 2: ${page2.data.length} items. nextCursor: ${page2.meta?.nextCursor}`);
  const p2Ids = page2.data.map(d => d.id);
  console.log("Page 2 IDs:", p2Ids);

  const overlap1_2 = p2Ids.filter(id => p1Ids.includes(id));
  console.log(`Overlap between Page 1 and Page 2: ${overlap1_2.length} duplicate IDs`);
  if (overlap1_2.length > 0) {
    console.log("DUPLICATES DETECTED:", overlap1_2);
  }

  // Page 3 with cursor
  if (page2.meta?.nextCursor) {
    const page3 = await SearchService.searchListings({
      limit: 10,
      scope: "GHUBA",
      sort: "newest",
      cursor: page2.meta.nextCursor,
    });
    console.log(`Page 3: ${page3.data.length} items. nextCursor: ${page3.meta?.nextCursor}`);
    const p3Ids = page3.data.map(d => d.id);
    const overlap_all = p3Ids.filter(id => p1Ids.includes(id) || p2Ids.includes(id));
    console.log(`Overlap with Page 3: ${overlap_all.length} duplicate IDs`);
    if (overlap_all.length > 0) {
      console.log("DUPLICATES IN PAGE 3:", overlap_all);
    }
  }

  process.exit(0);
}

main().catch(err => {
  console.error("Diagnostic error:", err);
  process.exit(1);
});
