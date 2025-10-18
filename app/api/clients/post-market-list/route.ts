import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";
import { verifyAuth } from "@/lib/verifyAuth";

// Utility to safely parse JSON
const parseJsonSafely = (data: any) => {
  try {
    return typeof data === "string" ? JSON.parse(data) : data;
  } catch {
    return null;
  }
};

// Normalize inputs to array
const normalizeArray = (val: any) =>
  Array.isArray(val) ? val : val ? [val] : [];

/**
 * API route to create a new marketplace listing or update an existing one (upsert logic).
 * All DB operations run inside a transaction for atomicity.
 */
export const POST = withApiHandler(async (req: Request) => {
  // 1. Authentication
  const auth = await verifyAuth(req);
  if (!auth.success) return formatResponse(false, null, auth.error, 401);

  // 2. Parse body
  let body;
  try {
    body = await req.json();
  } catch {
    return formatResponse(false, null, "Invalid JSON body provided.", 400);
  }

  const {
    sellerId,
    sellerType,
    productId,
    title,
    description,
    quantity,
    buyingPrice,
    sellingPrice,
    finalPrice,
    category,
    subCategory,
    productCategoryId,
    tags,
    brand,
    model,
    color,
    size,
    weight,
    condition,
    dimension,
    material,
    isAvailable,
    isOnOffer,
    isFlashDeal,
    isNewArrival,
    isDiscounted,
    isFeatured,
    author,
    publisher,
    isbn,
    fabricComposition,
    careInstructions,
    energyRating,
    warrantyPeriod,
    applianceDimensions,
    ingredients,
    usageInstructions,
    expirationDate,
    contact,
    location,
    discount,
    images,
    video,
    amenities,
    bedrooms,
    studios,
  } = body;

  // 3. Basic validation
  if (!sellerId || !sellerType || !productCategoryId) {
    return formatResponse(
      false,
      null,
      "Missing sellerId, sellerType, or productCategoryId.",
      400
    );
  }

  if (!["CLIENT", "CONSUMER", "AGENT", "ADMIN"].includes(sellerType)) {
    return formatResponse(false, null, "Invalid seller type.", 400);
  }

  // 4. Normalize fields
  const safeSubCategory = parseJsonSafely(subCategory);
  const safeLocation = parseJsonSafely(location);
  const safeBedrooms = parseJsonSafely(bedrooms);
  const safeStudios = parseJsonSafely(studios);

  const safeTags = normalizeArray(tags);
  const safeColor = normalizeArray(color);
  const safeSize = normalizeArray(size);
  const safeMaterial = normalizeArray(material);
  const safeAmenities = normalizeArray(amenities);
  const safeImages = normalizeArray(images);

  const now = new Date();

  let marketplaceListing: any = null;

  // 5. Transactional upsert
  await prisma.$transaction(async (tx) => {
    const existingListing = await tx.marketplaceListings.findFirst({
      where: { sellerId, sellerType, productId },
    });

    const commonData = {
      sellerId,
      sellerType,
      ...(productId && { productId }),
      productCategoryId,
      title: title ?? "New Name",
      description: description ?? "New Description",
      quantity,
      buyingPrice: buyingPrice ?? 0,
      sellingPrice: sellingPrice ?? 0,
      finalPrice: finalPrice ?? 0,
      category,
      subCategory: safeSubCategory,
      tags: safeTags,
      brand,
      model,
      color: safeColor,
      size: safeSize,
      weight,
      condition,
      dimension,
      material: safeMaterial,
      isAvailable,
      isOnOffer,
      isFlashDeal,
      isNewArrival,
      isDiscounted,
      isFeatured,
      author,
      publisher,
      isbn,
      fabricComposition,
      careInstructions,
      energyRating,
      warrantyPeriod,
      applianceDimensions,
      ingredients,
      usageInstructions,
      expirationDate: expirationDate ? new Date(expirationDate) : null,
      contact,
      location: safeLocation,
      discount,
      images: safeImages,
      video,
      amenities: safeAmenities,
      bedrooms: safeBedrooms,
      studios: safeStudios,
      updatedAt: now,
    };

    if (existingListing) {
      marketplaceListing = await tx.marketplaceListings.update({
        where: { id: existingListing.id },
        data: commonData,
      });
    } else {
      marketplaceListing = await tx.marketplaceListings.create({
        data: { ...commonData, createdAt: now, status: "ACTIVE" },
      });
    }
  });

  // 6. Success response
  return formatResponse(
    true,
    { listing: marketplaceListing },
    "Marketplace listing processed successfully.",
    201
  );
});
