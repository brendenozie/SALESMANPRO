import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";
// app/api/products/route.ts
import { NextRequest } from "next/server";
import prisma from "@/server/db/prismadb";
import { formatResponse } from "@/lib/formatResponse";
import { withApiHandler } from "@/lib/hooks/withApiHandler";

// GET /api/products
// Fetches all products, optionally filtered by companyId
export const GET = withApiHandler(async (request: Request) => {
  
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("companyId");

  
    const cacheKey = `admin:products:${companyId || 'global'}:all`;

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
  } catch (e) {}
  const products = await prisma.product.findMany({
    where: companyId ? { companyId } : {},
    include: {
      productCategory: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  try {
    if (products) {
      await cacheSet(cacheKey, products, 60);
    }
  } catch (e) {}

  const formattedProducts = products.map((product) => ({
    ...product,
    category: product.productCategory ? { name: product.productCategory.name } : null,
    images: product.images as unknown as { url: string }[], // ensure correct type
  }));

  return formatResponse(true, formattedProducts, "Products fetched successfully", 200);
});

// POST /api/products
// Creates a new product
export const POST = withApiHandler(async (request: Request) => {
  


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
    companyId,
  } = body;

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
      brand: "Brand", // adjust if needed
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
      // Defaults & fallbacks
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

  
    try { await cacheDel(`admin:products:${companyId || 'global'}:*`); } catch (e) {}
    return formatResponse(true, newProduct, "Product created successfully", 201);
});
