import { fetchWithCache, buildTenantCacheKey } from "@/lib/cache";
import prisma from "@/server/db/prismadb";
import { formatResponse } from "@/lib/formatResponse";
import { withApiHandler } from "@/lib/hooks/withApiHandler";

interface ProductCategoryRelation {
  id: string;
  name: string;
  StoreCategory?: Array<{ id: string; displayName: string; companyId: string }>;
}

/**
 * GET /api/admin/inventory/label-products
 *
 * Dedicated endpoint for Barcode & Shelf Label Studio.
 * Queries core Inventory Products (Product + InventoryItem) enriched with
 * real physical stock quantities, true SKUs/barcodes, and Ghuba Marketplace status.
 */
const getInventoryLabelProducts = async (req: Request, context: any) => {
  const { searchParams } = new URL(req.url);
  const companyId =
    searchParams.get("companyId") ||
    context.companyId ||
    context.user?.companyId;

  if (!companyId) {
    return formatResponse(
      false,
      null,
      "Missing required query parameter: companyId.",
      400
    );
  }

  const limit = Math.min(
    Math.max(1, parseInt(searchParams.get("limit") || "150", 10)),
    300
  );
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const search = searchParams.get("search")?.trim() || "";
  const source = searchParams.get("source") || "all"; // "all" | "marketplace" | "inStock"
  const offset = (page - 1) * limit;

  const cacheKey = buildTenantCacheKey(companyId, "inventory_label_products", {
    page,
    limit,
    search,
    source,
  });

  try {
    const responseData = await fetchWithCache(
      cacheKey,
      async () => {
        // Base filter for company's inventory
        const where: any = {
          companyId,
          ...(search
            ? {
                OR: [
                  { name: { contains: search, mode: "insensitive" } },
                  { description: { contains: search, mode: "insensitive" } },
                  { brand: { contains: search, mode: "insensitive" } },
                  { model: { contains: search, mode: "insensitive" } },
                ],
              }
            : {}),
        };

        // Source-level filtering
        if (source === "marketplace") {
          where.OR = [
            ...(where.OR || []),
            { showOnGhuba: true },
            {
              marketplaceListings: {
                some: {
                  isAvailable: true,
                  status: "ACTIVE",
                },
              },
            },
          ];
        }

        const [total, rawProducts] = await Promise.all([
          prisma.product.count({ where }),
          prisma.product.findMany({
            where,
            orderBy: { createdAt: "desc" },
            skip: offset,
            take: limit,
            include: {
              inventoryItems: {
                select: {
                  id: true,
                  quantity: true,
                },
              },
              productCategory: {
                select: {
                  id: true,
                  name: true,
                  StoreCategory: {
                    where: { companyId },
                    select: { id: true, displayName: true, companyId: true },
                  },
                },
              },
              marketplaceListings: {
                where: {
                  status: "ACTIVE",
                },
                select: {
                  id: true,
                  status: true,
                  showOnGhuba: true,
                  isAvailable: true,
                  quantity: true,
                  sellingPrice: true,
                  finalPrice: true,
                },
                take: 1,
              },
            },
          }),
        ]);

        const formatted = rawProducts
          .map((p: any) => {
            // Calculate total physical stock from InventoryItems (fallback to p.quantity)
            const physicalStock =
              p.inventoryItems && p.inventoryItems.length > 0
                ? p.inventoryItems.reduce(
                    (sum: number, item: any) => sum + (item.quantity || 0),
                    0
                  )
                : p.quantity || 0;

            // Determine if listed on Ghuba Marketplace
            const activeListing = p.marketplaceListings?.[0] || null;
            const isPublishedOnGhuba =
              Boolean(activeListing) || p.showOnGhuba === true;

            // True inventory SKU / Barcode (Fallback to standard formatted SKU)
            const trueSku =
              p.sku ||
              p.isbn ||
              p.vin ||
              `SKU-${p.id.slice(-8).toUpperCase()}`;

            const trueBarcode =
              p.barcode ||
              p.sku ||
              p.isbn ||
              p.vin ||
              trueSku;

            // Resolved category display name
            const overrideCategory =
              p.productCategory?.StoreCategory?.[0]?.displayName;
            const categoryName =
              overrideCategory ||
              p.productCategory?.name ||
              p.category ||
              "General";

            // Retail & Selling Price resolution
            const retailPrice =
              activeListing?.finalPrice ||
              activeListing?.sellingPrice ||
              p.finalPrice ||
              p.sellingPrice ||
              0;

            const costPrice = p.costPrice || p.buyingPrice || 0;

            // Direct public Ghuba Marketplace link for shoppers/scanners
            const marketplaceUrl = `https://ghuba.store/p/${p.id}`;

            return {
              id: p.id,
              name: p.name,
              sku: trueSku,
              barcode: trueBarcode,
              price: retailPrice,
              sellingPrice: p.sellingPrice || retailPrice,
              finalPrice: p.finalPrice || retailPrice,
              costPrice,
              stock: physicalStock,
              quantity: physicalStock,
              companyStock: physicalStock,
              inStock: physicalStock > 0,
              category: categoryName,
              image: p.images?.[0] || null,
              isPublishedOnGhuba,
              marketplaceListingId: activeListing?.id || null,
              marketplaceUrl,
            };
          })
          .filter((item: any) => {
            if (source === "inStock") {
              return item.quantity > 0;
            }
            if (source === "marketplace") {
              return item.isPublishedOnGhuba;
            }
            return true;
          });

        return {
          meta: {
            companyId,
            totalItems: total,
            returnedItems: formatted.length,
            currentPage: page,
            perPage: limit,
            source,
          },
          results: formatted,
        };
      },
      { ttlSeconds: 45, swrSeconds: 20 }
    );

    return formatResponse(
      true,
      responseData,
      "Inventory label products fetched successfully",
      200
    );
  } catch (error: any) {
    console.error("[INVENTORY_LABEL_PRODUCTS_ERROR]", error);
    return formatResponse(false, null, error.message, 500);
  }
};

export const GET = withApiHandler(getInventoryLabelProducts);
