import { buildTenantCacheKey, cacheGet, cacheSet } from "@/lib/cache";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";
import { fetchCompanyInventoryProducts } from "@/lib/inventory/inventory-service";

async function getInventory(req: Request) {
  const url = new URL(req.url);
  const companyId = url.searchParams.get("companyId");
  const limit = Math.max(1, parseInt(url.searchParams.get("limit") || "100", 10));
  const page = Math.max(1, parseInt(url.searchParams.get("page") || "1", 10));
  const bypassCache = url.searchParams.get("fresh") === "1" || url.searchParams.get("fresh") === "true";

  if (!companyId) {
    return formatResponse(false, null, "Missing companyId parameter.", 400);
  }

  const cacheKey = buildTenantCacheKey(companyId, "get-all-inventory", {
    limit,
    page,
  });

  if (!bypassCache) {
    try {
      const cached = await cacheGet(cacheKey);
      if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
    } catch {}
  }

  const { results, paging } = await fetchCompanyInventoryProducts(companyId, {
    page,
    limit,
  });

  const payload = {
    results,
    paging,
  };

  try {
    await cacheSet(cacheKey, payload, 30);
  } catch {}

  return formatResponse(true, payload, "Inventory fetched successfully", 200);
}

export const GET = withApiHandler(getInventory);
