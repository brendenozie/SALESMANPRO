import { fetchWithCache, cacheDel, buildTenantCacheKey } from "@/lib/cache";
import prisma from "@/server/db/prismadb";
import { formatResponse } from "@/lib/formatResponse";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { z } from "zod";

// Zod schema for query filtering & pagination
const productQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().optional(),
  categoryId: z.string().trim().optional(),
});

// Zod schema for product creation
const createProductSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  description: z.string().optional(),
  images: z.array(z.any()).default([]),
  productCategoryId: z.string().min(1, "productCategoryId is required"),
  costPrice: z.coerce.number().min(0, "costPrice must be a positive number"),
  sellingPrice: z.coerce.number().min(0, "sellingPrice must be a positive number"),
  discount: z.coerce.number().min(0).max(100).default(0),
  isAvailable: z.boolean().default(true),
  isOnOffer: z.boolean().default(false),
  isFlashDeal: z.boolean().default(false),
  isNewArrival: z.boolean().default(false),
  isDiscounted: z.boolean().optional(),
  isFeatured: z.boolean().default(false),
  ingredients: z.string().optional().nullable(),
});

// GET /api/admin/products
export const GET = withApiHandler(
  async (request: Request, context: any) => {
    const { searchParams } = new URL(request.url);

    // Authoritative tenant scoping
    const companyId = context.companyId;
    if (!companyId) {
      return formatResponse(
        false,
        null,
        "Authorized company context required",
        403,
      );
    }

    const queryParsed = productQuerySchema.safeParse({
      page: searchParams.get("page"),
      limit: searchParams.get("limit"),
      search: searchParams.get("search") || undefined,
      categoryId: searchParams.get("categoryId") || undefined,
    });

    if (!queryParsed.success) {
      return formatResponse(false, null, queryParsed.error.errors, 400);
    }

    const { page, limit, search, categoryId } = queryParsed.data;
    const skip = (page - 1) * limit;

    const cacheKey = buildTenantCacheKey(companyId, "admin_products", {
      page,
      limit,
      search: search || "",
      categoryId: categoryId || "",
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
          category: product.productCategory
            ? { id: product.productCategory.id, name: product.productCategory.name }
            : null,
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
  },
  { requireAuth: true, requireTenant: true },
);

// POST /api/admin/products
export const POST = withApiHandler(
  async (request: Request, context: any) => {
    const body = await request.json().catch(() => null);
    if (!body) {
      return formatResponse(false, null, "Invalid JSON payload", 400);
    }

    const parsed = createProductSchema.safeParse(body);
    if (!parsed.success) {
      return formatResponse(false, null, parsed.error.errors, 400);
    }

    const companyId = context.companyId;
    if (!companyId) {
      return formatResponse(
        false,
        null,
        "Authorized company context required",
        403,
      );
    }

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
    } = parsed.data;

    // Verify product category belongs to authorized company
    const category = await prisma.productCategory.findFirst({
      where: { id: productCategoryId, companyId },
      select: { id: true },
    });

    if (!category) {
      return formatResponse(
        false,
        null,
        "Product category not found for this company",
        404,
      );
    }

    const finalPrice = sellingPrice * (1 - (discount || 0) / 100);

    const newProduct = await prisma.product.create({
      data: {
        name,
        description,
        images: images || [],
        tags: [],
        profitMargin: sellingPrice > 0 ? (sellingPrice - costPrice) / sellingPrice : 0,
        brand: "Brand",
        company: { connect: { id: companyId } },
        productCategory: { connect: { id: productCategoryId } },
        costPrice,
        sellingPrice,
        finalPrice,
        discount: discount || 0,
        isAvailable,
        isOnOffer,
        isFlashDeal,
        isNewArrival,
        isDiscounted: isDiscounted ?? discount > 0,
        isFeatured,
        ingredients: ingredients || null,
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
    } catch (e) {}

    return formatResponse(true, newProduct, "Product created successfully", 201);
  },
  { requireAuth: true, requireTenant: true },
);
