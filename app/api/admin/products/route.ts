import { fetchWithCache, cacheDel, buildTenantCacheKey } from "@/lib/cache";
import prisma from "@/server/db/prismadb";
import { formatResponse } from "@/lib/formatResponse";
import { withApiHandler } from "@/lib/hooks/withApiHandler";

// GET /api/products
// Fetches products with pagination, search, and strict tenant scoping
export const GET = withApiHandler(async (request: Request, context: any) => {
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("companyId") || context.user?.companyId;
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const limit = Math.min(Math.max(1, parseInt(searchParams.get("limit") || "20", 10)), 100);
  const search = searchParams.get("search")?.trim() || "";
  const categoryId = searchParams.get("categoryId") || "";
  const skip = (page - 1) * limit;

  if (!companyId) {
    return formatResponse(false, null, "companyId query parameter or tenant session is required", 400);
  }

  const cacheKey = buildTenantCacheKey(companyId, "admin_products", {
    page,
    limit,
    search,
    categoryId,
  });

  const responseData = await fetchWithCache(
    cacheKey,
    async () => {
      const where: any = {
        companyId,
        ...(categoryId ? { productCategoryId: categoryId } : {}),
        ...(search ? { name: { contains: search, mode: "insensitive" } } : {}),
      };

      const [products, totalCount] = await Promise.all([
        prisma.product.findMany({
          where,
          include: {
            productCategory: { select: { id: true, name: true } },
          },
          orderBy: { createdAt: "desc" },
          skip,
          take: limit,
        }),
        prisma.product.count({ where }),
      ]);

      const formattedProducts = products.map((product) => ({
        ...product,
        category: product.productCategory ? { id: product.productCategory.id, name: product.productCategory.name } : null,
        images: product.images as unknown as { url: string }[],
      }));

      return {
        products: formattedProducts,
        pagination: {
          totalItems: totalCount,
          totalPages: Math.ceil(totalCount / limit),
          currentPage: page,
          limit,
        },
      };
    },
    { ttlSeconds: 60, swrSeconds: 60 },
  );

  return formatResponse(true, responseData, "Products fetched successfully", 200);
});

// POST /api/products
// Creates a new product and invalidates tenant-scoped product cache
export const POST = withApiHandler(async (request: Request, context: any) => {
  const body = await request.json();
  const {
    name,
    description,
    images,
    productCategoryId,
    costPrice,
    sellingPrice,
    discount,
    isAvailable,
    isOnOffer,
    isFlashDeal,
    isNewArrival,
    isDiscounted,
    isFeatured,
    ingredients,
  } = body;

  const companyId = body.companyId || context.user?.companyId;

  if (!name || !productCategoryId || !companyId || costPrice === undefined || sellingPrice === undefined) {
    return formatResponse(false, null, "Missing required fields: name, productCategoryId, companyId, costPrice, sellingPrice", 400);
  }

  const finalPrice = sellingPrice * (1 - (discount || 0) / 100);

  const newProduct = await prisma.product.create({
    data: {
      name,
      description,
      images: images || [],
      tags: [],
      profitMargin: (sellingPrice - costPrice) / sellingPrice || 0,
      brand: "Brand",
      company: { connect: { id: companyId } },
      productCategory: { connect: { id: productCategoryId } },
      costPrice,
      sellingPrice,
      finalPrice,
      discount: discount || 0,
      isAvailable: typeof isAvailable === "boolean" ? isAvailable : true,
      isOnOffer: typeof isOnOffer === "boolean" ? isOnOffer : false,
      isFlashDeal: typeof isFlashDeal === "boolean" ? isFlashDeal : false,
      isNewArrival: typeof isNewArrival === "boolean" ? isNewArrival : false,
      isDiscounted: typeof isDiscounted === "boolean" ? isDiscounted : discount > 0,
      isFeatured: typeof isFeatured === "boolean" ? isFeatured : false,
      ingredients,
      model: null,
      color: [],
      size: [],
      weight: [],
      condition: null,
      dimensions: null,
      material: [],
      author: null,
      publisher: null,
      isbn: null,
      fabricComposition: null,
      careInstructions: null,
      energyRating: null,
      warrantyPeriod: null,
      applianceDimensions: null,
      usageInstructions: null,
      expirationDate: null,
      contact: null,
      location: null,
      amenities: [],
      delivery: false,
      paymentOption: "AT SHOP",
      showOnGhuba: true,
      subCategoryName: null,
      make: null,
      trim: null,
      type: null,
      mileage: null,
      engineType: null,
      engineSize: null,
      transmission: null,
      drivetrain: null,
      vin: null,
      logbookStatus: null,
      serviceHistory: null,
      digitalUrl: null,
      autoDeliver: false,
      negotiable: false,
      financingAvailable: false,
      tradeIn: false,
      tax: 0,
      shippingCost: 0,
      status: "ACTIVE",
    },
  });

  // Targeted cache invalidation using tenant pattern
  try {
    await cacheDel(`tenant:${companyId}:admin_products:*`);
    await cacheDel(`tenant:${companyId}:products:*`);
    await cacheDel(`admin:products:*`);
  } catch (e) {}

  return formatResponse(true, newProduct, "Product created successfully", 201);
});

